import { mpsToSecPerKm } from './format.js';

// Runs with an average pace slower than this are recovery runs: they are
// labelled "Easy" and left out of average-pace stats so a slow recovery jog
// doesn't read as a drop in fitness. Volume (km) still counts them.
export const RECOVERY_PACE_SEC_PER_KM = 7 * 60; // 7:00 /km

// Compared on whole seconds so it matches what the UI shows: 7:00 /km is not
// recovery, 7:01 /km is.
export function isRecoveryRun(run) {
  const pace = mpsToSecPerKm(run?.average_speed_mps);
  return pace != null && Math.round(pace) > RECOVERY_PACE_SEC_PER_KM;
}

/** Runs whose pace should feed average-pace calculations. */
export function paceRuns(runs) {
  return runs.filter((r) => !isRecoveryRun(r));
}
