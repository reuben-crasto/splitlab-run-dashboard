import { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './views/Dashboard.jsx';
import Trends from './views/Trends.jsx';
import Runs from './views/Runs.jsx';
import RunDetail from './views/RunDetail.jsx';
import ConnectPrompt from './views/ConnectPrompt.jsx';
import Sidebar from './components/Sidebar.jsx';
import { getStatus } from './lib/api.js';

export default function App() {
  const [status, setStatus] = useState({ loading: true });
  const [authError, setAuthError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(location.search);
    const authParam = params.get('auth');

    getStatus()
      .then((s) => {
        if (cancelled) return;
        setStatus({ loading: false, ...s });
        if (authParam) navigate('/', { replace: true });
        if (authParam === 'ok' && !s.connected) setAuthError(true);
      })
      .catch(() => {
        if (!cancelled) setStatus({ loading: false, connected: false });
      });
    return () => { cancelled = true; };
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-dim)' }}>
        Loading…
      </div>
    );
  }

  if (!status.connected) {
    return <ConnectPrompt authError={authError} />;
  }

  return (
    <div className="app-shell">
      <Sidebar athlete={status.athlete} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/runs" element={<Runs />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/run/:id" element={<RunDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
