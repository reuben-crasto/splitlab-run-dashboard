import { useState } from 'react';

export default function UnlockModal({ configured = true, onSubmit, onSuccess, onClose }) {
  const [password, setPassword] = useState('');
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit(password);
      onSuccess();
    } catch (err) {
      const code = err.response?.data?.error;
      setError(
        code === 'invalid_password' ? 'That password is not right.'
        : code === 'auth_not_configured' ? 'Editing is not password-protected yet — set APP_PASSWORD.'
        : (err.message || 'Could not unlock')
      );
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--narrow" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Unlock editing</div>
            <div className="modal-subtitle">Enter your password to log effort.</div>
          </div>
          <button className="modal-close" type="button" onClick={onClose}>✕</button>
        </div>

        {!configured ? (
          <div className="log-form">
            <div className="log-error">
              Editing is locked because no password is set. Add <code>APP_PASSWORD</code>{' '}
              (and <code>AUTH_SECRET</code>) to your environment, then reload.
            </div>
          </div>
        ) : (
        <form className="log-form" onSubmit={handleSubmit}>
          <input
            className="unlock-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            autoComplete="current-password"
          />
          {error && <div className="log-error">{error}</div>}
          <button type="submit" className="log-submit" disabled={busy || !password}>
            {busy ? 'Unlocking…' : 'Unlock'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
