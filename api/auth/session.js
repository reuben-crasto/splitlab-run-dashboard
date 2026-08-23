import {
  isAuthConfigured, isAuthed, verifyPassword, createToken, sessionCookie,
} from '../_lib/auth.js';

// GET    /api/auth/session  → { authed, configured }
// POST   /api/auth/session  → log in with { password }
// DELETE /api/auth/session  → log out
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({ authed: isAuthed(req), configured: isAuthConfigured() });
  }

  if (req.method === 'POST') {
    if (!isAuthConfigured()) {
      return res.status(503).json({ error: 'auth_not_configured' });
    }
    const password = req.body?.password;
    if (!verifyPassword(password)) {
      return res.status(401).json({ error: 'invalid_password' });
    }
    res.setHeader('Set-Cookie', sessionCookie(createToken()));
    return res.json({ authed: true });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', sessionCookie(null, { clear: true }));
    return res.json({ authed: false });
  }

  res.status(405).json({ error: 'method_not_allowed' });
}
