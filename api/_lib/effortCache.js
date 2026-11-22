/**
 * Durable cache of Strava's perceived_exertion per activity (Supabase table
 * `strava_efforts`, see db/schema.sql).
 *
 * Strava only returns the effort on the single-activity endpoint and rate-limits
 * us to ~100 requests / 15 min, so we remember what we've already fetched.
 * Serverless functions share no memory, hence Supabase rather than a Map.
 *
 * Caching is best-effort: if Supabase isn't configured or the table doesn't
 * exist yet, reads return nothing and writes are skipped — the endpoint still
 * works, it just re-fetches from Strava every time.
 */

import { getSupabase } from './supabase.js';

let warned = false;
function warnOnce(err) {
  if (warned) return;
  warned = true;
  console.warn(`[effortCache] disabled (${err.message}). Run the strava_efforts SQL in db/schema.sql to enable it.`);
}

/** → Map<activityId (string), { value: number|null, at: ms }> */
export async function readEffortCache(ids) {
  const out = new Map();
  if (ids.length === 0) return out;
  try {
    const { data, error } = await getSupabase()
      .from('strava_efforts')
      .select('activity_id, perceived_exertion, checked_at')
      .in('activity_id', ids.map(String));
    if (error) throw new Error(error.message);
    for (const r of data || []) {
      out.set(String(r.activity_id), {
        value: r.perceived_exertion,
        at: new Date(r.checked_at).getTime(),
      });
    }
  } catch (err) {
    warnOnce(err);
  }
  return out;
}

/** rows: [{ id, value }] */
export async function writeEffortCache(rows) {
  if (rows.length === 0) return;
  try {
    const checked_at = new Date().toISOString();
    const { error } = await getSupabase().from('strava_efforts').upsert(
      rows.map((r) => ({
        activity_id: String(r.id),
        perceived_exertion: r.value,
        checked_at,
      })),
      { onConflict: 'activity_id' },
    );
    if (error) throw new Error(error.message);
  } catch (err) {
    warnOnce(err);
  }
}
