// A finished run's per-km splits never change, so keep them in localStorage and
// spare Strava a request on every later visit. Best-effort: storage can be
// blocked or full, in which case we just fetch again.
const key = (id) => `splitlab:splits:${id}`;

export function readSplits(id) {
  try {
    const raw = localStorage.getItem(key(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const SETTLED_MS = 24 * 3600000;

export function writeSplits(id, splits, startDate) {
  if (!Array.isArray(splits)) return;
  // Strava may still be processing a fresh upload, so only remember "this run
  // has no splits" once the run is old enough that it never will.
  const settled = startDate && Date.now() - new Date(startDate).getTime() > SETTLED_MS;
  if (splits.length === 0 && !settled) return;
  try {
    localStorage.setItem(key(id), JSON.stringify(splits));
  } catch {
    /* storage unavailable — fine */
  }
}
