import { Router } from 'express';
import { exchangeCodeForTokens } from '../lib/strava.js';
import { writeTokens, readTokens } from '../lib/tokens.js';
import {
  isAuthConfigured, isAuthed, verifyPassword, createToken, sessionCookie,
} from '../lib/auth.js';

const router = Router();

// ── Editor session (shared password) ──────────────────────────────────────────
// GET /auth/session → { authed, configured }
router.get('/session', (req, res) => {
  res.json({ authed: isAuthed(req), configured: isAuthConfigured() });
});

// POST /auth/session → log in with { password }
router.post('/session', (req, res) => {
  if (!isAuthConfigured()) {
    return res.status(503).json({ error: 'auth_not_configured' });
  }
  if (!verifyPassword(req.body?.password)) {
    return res.status(401).json({ error: 'invalid_password' });
  }
  res.setHeader('Set-Cookie', sessionCookie(createToken()));
  res.json({ authed: true });
});

// DELETE /auth/session → log out
router.delete('/session', (req, res) => {
  res.setHeader('Set-Cookie', sessionCookie(null, { clear: true }));
  res.json({ authed: false });
});

// Kick off OAuth — redirect user to Strava authorize page
router.get('/strava', (req, res) => {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'Strava env vars not configured' });
  }

  const url = new URL('https://www.strava.com/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('approval_prompt', 'auto');
  url.searchParams.set('scope', 'read,activity:read_all');

  res.redirect(url.toString());
});

// Strava redirects back here with ?code=... (and ?error=... on denial)
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (error) {
    return res.redirect(`${clientUrl}/?auth=denied`);
  }
  if (!code) {
    return res.status(400).json({ error: 'Missing code param' });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    // Preserve previous athlete info if present
    const existing = (await readTokens()) ?? {};
    await writeTokens({ ...existing, ...tokens });
    res.redirect(`${clientUrl}/?auth=ok`);
  } catch (err) {
    console.error('OAuth exchange failed:', err.response?.data || err.message);
    res.redirect(`${clientUrl}/?auth=error`);
  }
});

export default router;
