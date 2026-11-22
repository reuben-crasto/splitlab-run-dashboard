// Effort (RPE, 1–10) for a run.
// Strava's perceived_exertion wins — it's what gets entered in the Strava app
// right after the run. The website log (km1_rpe) is only a fallback for runs
// with no Strava effort.
export function resolveRpe(run, log) {
  return run?.perceived_exertion ?? log?.km1_rpe ?? null;
}
