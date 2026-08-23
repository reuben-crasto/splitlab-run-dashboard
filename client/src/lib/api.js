import axios from 'axios';

// Vite dev proxy sends /api and /auth to the Express server on :3001.
export const api = axios.create({ baseURL: '/' });

export async function getStatus() {
  const { data } = await api.get('/api/status');
  return data;
}
export async function getActivities() {
  const { data } = await api.get('/api/activities');
  return data;
}
export async function getActivity(id) {
  const { data } = await api.get(`/api/activities/${id}`);
  return data;
}
export async function getRecords() {
  const { data } = await api.get('/api/records');
  return data;
}

// ── Run logs (Supabase via server proxy) ──────────────────────────────────────
export async function getRunLogs(activityIds) {
  if (!activityIds || activityIds.length === 0) return [];
  const { data } = await api.get('/api/run-logs', {
    params: { activity_ids: activityIds.join(',') },
  });
  return data;
}
export async function saveRunLog(payload) {
  const { data } = await api.post('/api/run-logs', payload);
  return data;
}

// ── Editor session (shared password gates editing, not viewing) ───────────────
export async function getSession() {
  const { data } = await api.get('/api/auth/session');
  return data;
}
export async function login(password) {
  const { data } = await api.post('/api/auth/session', { password });
  return data;
}
export async function logout() {
  const { data } = await api.delete('/api/auth/session');
  return data;
}
