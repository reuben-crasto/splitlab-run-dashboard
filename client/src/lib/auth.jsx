import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { getSession, login as apiLogin, logout as apiLogout } from './api.js';
import UnlockModal from '../components/UnlockModal.jsx';

const AuthContext = createContext({
  authed: false,
  configured: false,
  requireAuth: (fn) => fn(),
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [asking, setAsking] = useState(false);
  const pendingRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getSession()
      .then((s) => {
        if (cancelled) return;
        setAuthed(!!s.authed);
        setConfigured(!!s.configured);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Run `fn` if already unlocked, otherwise prompt and run it after unlocking.
  // When no password is configured the server rejects writes outright, so we
  // still open the modal — it explains the setup step instead of prompting.
  const requireAuth = useCallback((fn) => {
    if (authed) return fn();
    pendingRef.current = fn;
    setAsking(true);
  }, [authed]);

  const handleSuccess = useCallback(() => {
    setAuthed(true);
    setAsking(false);
    const fn = pendingRef.current;
    pendingRef.current = null;
    if (fn) fn();
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch (_) {}
    setAuthed(false);
  }, []);

  return (
    <AuthContext.Provider value={{ authed, configured, requireAuth, logout }}>
      {children}
      {asking && (
        <UnlockModal
          configured={configured}
          onSubmit={apiLogin}
          onSuccess={handleSuccess}
          onClose={() => { pendingRef.current = null; setAsking(false); }}
        />
      )}
    </AuthContext.Provider>
  );
}
