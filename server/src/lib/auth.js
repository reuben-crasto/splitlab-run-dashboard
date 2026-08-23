import crypto from 'node:crypto';

// Session cookie holding a signed, expiring token. Editing run logs requires it;
// reading stays public. Configure with:
//   APP_PASSWORD  — the shared password you type to unlock editing
//   AUTH_SECRET   — random string used to sign session tokens
export const COOKIE_NAME = 'sl_session';
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  // Fall back to the password so a missing AUTH_SECRET doesn't silently
  // produce forgeable tokens; still throws if neither is set.
  const pw = process.env.APP_PASSWORD;
  if (pw) return `derived:${pw}`;
  const err = new Error('Auth not configured');
  err.code = 'AUTH_NOT_CONFIGURED';
  throw err;
}

export function isAuthConfigured() {
  return Boolean(process.env.APP_PASSWORD);
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/** Constant-time check of a submitted password against APP_PASSWORD. */
export function verifyPassword(submitted) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    const err = new Error('Auth not configured');
    err.code = 'AUTH_NOT_CONFIGURED';
    throw err;
  }
  // Hash both sides so lengths always match (avoids leaking length).
  const h = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');
  return safeEqual(h(submitted ?? ''), h(expected));
}

/** Create a signed token that expires MAX_AGE_S from now. */
export function createToken() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  if (!safeEqual(sig, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && Date.now() / 1000 < exp;
  } catch (_) {
    return false;
  }
}

export function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    String(cookieHeader)
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const i = part.indexOf('=');
        if (i === -1) return [part, ''];
        return [part.slice(0, i), decodeURIComponent(part.slice(i + 1))];
      })
  );
}

/** True when the request carries a valid session cookie. */
export function isAuthed(req) {
  try {
    const token = parseCookies(req.headers?.cookie)[COOKIE_NAME];
    return verifyToken(token);
  } catch (_) {
    return false;
  }
}

export function sessionCookie(token, { clear = false } = {}) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  const maxAge = clear ? 0 : MAX_AGE_S;
  return `${COOKIE_NAME}=${clear ? '' : token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge};${secure}`;
}
