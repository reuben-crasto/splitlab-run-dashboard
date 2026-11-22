import { stravaGet } from './_lib/strava.js';
import { readEffortCache, writeEffortCache } from './_lib/effortCache.js';

// Strava only returns perceived_exertion (the effort you enter in the Strava
// app) on the single-activity endpoint, not on the activity list. So we fetch
// details for the runs the charts actually use (last 8 weeks).
const EFFORT_WINDOW_MS  = 56 * 86400000;
const DETAIL_CONCURRENCY = 5;

// Strava allows ~100 requests / 15 min, so each run's effort is fetched once
// and remembered in Supabase (see _lib/effortCache.js). A rated run doesn't
// change, so it's kept for hours. A run with no effort yet is re-checked
// quickly while it's fresh (you may be about to rate it in the Strava app) and
// rarely once it's old.
const RATED_TTL_MS    = 6 * 3600000;
const UNRATED_NEW_TTL = 5 * 60000;      // run < 3 days old
const UNRATED_OLD_TTL = 6 * 3600000;
const NEW_RUN_MS      = 3 * 86400000;

function isFresh(run, hit) {
  const isNew = Date.now() - new Date(run.start_date).getTime() < NEW_RUN_MS;
  const ttl = hit.value != null ? RATED_TTL_MS : (isNew ? UNRATED_NEW_TTL : UNRATED_OLD_TTL);
  return Date.now() - hit.at < ttl;
}

async function fetchEfforts(runs) {
  const cutoff   = Date.now() - EFFORT_WINDOW_MS;
  const inWindow = runs.filter((a) => new Date(a.start_date).getTime() >= cutoff);
  const cache    = await readEffortCache(inWindow.map((r) => r.id));

  const efforts = new Map();
  const targets = [];
  for (const run of inWindow) {
    const hit = cache.get(String(run.id));
    if (hit && isFresh(run, hit)) efforts.set(run.id, hit.value);
    else targets.push(run);
  }

  const fetched = [];
  let rateLimited = false;
  let next = 0;
  async function worker() {
    while (next < targets.length && !rateLimited) {
      const run = targets[next++];
      try {
        const detail = await stravaGet(`/activities/${run.id}`);
        const value = detail.perceived_exertion ?? null;
        efforts.set(run.id, value);
        fetched.push({ id: run.id, value });
      } catch (err) {
        // Effort is a nice-to-have: never fail the whole list over it, and
        // stop spending requests once Strava says we're over the limit.
        if (err.response?.status === 429) rateLimited = true;
      }
    }
  }
  await Promise.all(Array.from({ length: DETAIL_CONCURRENCY }, worker));
  await writeEffortCache(fetched);

  // If Strava rate-limited us, fall back to any stale cached value we have.
  for (const run of targets) {
    if (!efforts.has(run.id) && cache.has(String(run.id))) efforts.set(run.id, cache.get(String(run.id)).value);
  }
  return efforts;
}

export default async function handler(req, res) {
  try {
    const all  = await stravaGet('/athlete/activities', { per_page: 50, page: 1 });
    const runs = (all || []).filter((a) => a.type === 'Run' || a.sport_type === 'Run');
    const efforts = await fetchEfforts(runs);

    // Short CDN cache keeps page reloads from re-spending Strava's rate limit.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.json(runs.map((a) => ({
      id:                   a.id,
      name:                 a.name,
      start_date:           a.start_date,
      start_date_local:     a.start_date_local,
      distance_m:           a.distance,
      moving_time_s:        a.moving_time,
      elapsed_time_s:       a.elapsed_time,
      average_speed_mps:    a.average_speed,
      total_elevation_gain: a.total_elevation_gain,
      perceived_exertion:   efforts.get(a.id) ?? a.perceived_exertion ?? null,
    })));
  } catch (err) {
    handleError(err, res);
  }
}

function handleError(err, res) {
  if (err.code === 'NOT_CONNECTED')    return res.status(401).json({ error: 'not_connected' });
  if (err.response?.status === 401)    return res.status(401).json({ error: 'strava_unauthorized' });
  console.error(err.message);
  res.status(500).json({ error: 'internal_error', message: err.message });
}
