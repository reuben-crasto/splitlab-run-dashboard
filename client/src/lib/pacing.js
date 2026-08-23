import { mpsToSecPerKm } from './format.js';

// Short shape name shown in badges/pills (matches Figma "Positive Split" etc.).
export function shapeLabel(tooFast, fade, strong) {
  if (tooFast && fade && strong) return 'V-Shape';
  if (strong) return 'Negative Split';
  if (tooFast) return 'Positive Split';
  if (fade) return 'Mid-run Fade';
  return 'Even Pace';
}

export function buildVerdict(tooFast, fade, strong) {
  if (tooFast && fade && strong)
    return 'You started fast and faded through the middle, but came back well at the end — classic V-shape. Focus on holding back in km 1.';
  if (tooFast && fade)
    return 'You went out too fast and faded mid-run. Try a more even effort from the gun — your average pace will improve.';
  if (tooFast && strong)
    return 'You went out hard but rallied well to finish faster than average. Watch that first km — consistency will come from there.';
  if (fade && strong)
    return 'You faded mid-run but came back well in the final km. Check your fuelling or pacing strategy around that slow section.';
  if (tooFast)
    return 'You went out quicker than you came back. Common — and worth noticing.';
  if (fade)
    return 'Your pace dropped significantly mid-run. Consider whether it was heat, effort level, or fuelling — something to track.';
  if (strong)
    return "Strong negative split — you finished faster than your average. That's a sign of good pacing discipline.";
  return 'Even pacing throughout. Nice controlled effort.';
}

// Classify a run's pacing shape from its per-km splits.
// Returns { label, verdict } or nulls when there isn't enough data.
export function pacingShape(splits, averageSpeedMps) {
  if (!splits || splits.length < 2) return { label: null, verdict: null };

  const avgSec = mpsToSecPerKm(averageSpeedMps);
  if (!avgSec) return { label: null, verdict: null };

  const paces = splits.map((s) => mpsToSecPerKm(s.average_speed)).filter(Boolean);
  if (paces.length === 0) return { label: null, verdict: null };

  const km1Pace  = paces[0];
  const lastPace = paces[paces.length - 1];
  const slowest  = Math.max(...paces);

  // lower sec/km = faster
  const tooFast = km1Pace < avgSec * 0.9;   // km 1 >10% faster than avg
  const fade    = slowest > avgSec * 1.15;  // slowest km >15% slower than avg
  const strong  = lastPace < avgSec;        // last km faster than avg

  return {
    label: shapeLabel(tooFast, fade, strong),
    verdict: buildVerdict(tooFast, fade, strong),
  };
}

// Per-km split colour classification for sparklines/bars.
// Returns 'fast' | 'mid' | 'slow' relative to the run's average pace.
export function splitClass(splitSpeedMps, averageSpeedMps) {
  const p = mpsToSecPerKm(splitSpeedMps);
  const avg = mpsToSecPerKm(averageSpeedMps);
  if (!p || !avg) return 'mid';
  if (p < avg * 0.98) return 'fast'; // >2% faster than avg
  if (p > avg * 1.02) return 'slow'; // >2% slower than avg
  return 'mid';
}
