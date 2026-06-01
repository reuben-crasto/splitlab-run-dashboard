import { useMemo } from 'react';
import { mpsToSecPerKm, formatDate } from '../lib/format.js';

function formatPaceValue(secPerKm) {
  if (secPerKm == null || !Number.isFinite(secPerKm)) return { value: '—', unit: '' };
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return { value: `${m}:${String(s).padStart(2, '0')}`, unit: '/km' };
}

// Both km1_rpe (our app) and Strava perceived_exertion are 1–10.
function resolveRpe(run, logMap) {
  const log = logMap[String(run.id)];
  if (log?.km1_rpe != null) return log.km1_rpe;
  if (run.perceived_exertion != null) return run.perceived_exertion;
  return null;
}

function EffortBadge({ rpe }) {
  if (rpe == null) return null;
  const r = Math.max(1, Math.min(10, rpe));
  if (r <= 4) return <span className="effort-badge effort-badge--low">Easy · {r}/10</span>;
  if (r <= 7) return <span className="effort-badge effort-badge--mid">Moderate · {r}/10</span>;
  return <span className="effort-badge effort-badge--high">Hard · {r}/10</span>;
}

// ISO week key for grouping
function isoWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const year = d.getFullYear();
  const week = Math.ceil((((d - new Date(year, 0, 1)) / 86400000) + 1) / 7);
  return `${year}-W${week}`;
}

export default function PersonalRecords({ activities = [], logMap = {} }) {
  const prs = useMemo(() => {
    if (!activities.length) return {};

    // Best avg pace (fastest average_speed_mps)
    const bestPaceRun = activities.reduce((best, r) =>
      (r.average_speed_mps ?? 0) > (best.average_speed_mps ?? 0) ? r : best
    , activities[0]);
    const bestAvgPaceSec = mpsToSecPerKm(bestPaceRun.average_speed_mps);

    // Longest run
    const longestRun = activities.reduce((best, r) =>
      (r.distance_m ?? 0) > (best.distance_m ?? 0) ? r : best
    , activities[0]);

    // Best week by total km
    const weekMap = {};
    for (const r of activities) {
      const wk = isoWeek(r.start_date);
      weekMap[wk] = (weekMap[wk] || 0) + (r.distance_m ?? 0);
    }
    const [, bestWeekKm] = Object.entries(weekMap).reduce(
      ([bk, bv], [k, v]) => v > bv ? [k, v] : [bk, bv],
      ['', 0]
    );

    // Total runs
    const totalRuns = activities.length;

    return { bestPaceRun, bestAvgPaceSec, longestRun, bestWeekKm, totalRuns };
  }, [activities]);

  const { bestPaceRun, bestAvgPaceSec, longestRun, bestWeekKm, totalRuns } = prs;

  const paceVal = formatPaceValue(bestAvgPaceSec);

  const cards = [
    {
      label: 'Best Avg Pace',
      value: paceVal.value,
      unit: paceVal.unit,
      meta: bestPaceRun ? formatDate(bestPaceRun.start_date) : null,
      rpe: bestPaceRun ? resolveRpe(bestPaceRun, logMap) : null,
    },
    {
      label: 'Longest Run',
      value: longestRun ? (longestRun.distance_m / 1000).toFixed(1) : '—',
      unit: longestRun ? 'km' : '',
      meta: longestRun ? formatDate(longestRun.start_date) : null,
      rpe: longestRun ? resolveRpe(longestRun, logMap) : null,
    },
    {
      label: 'Best Week',
      value: bestWeekKm ? (bestWeekKm / 1000).toFixed(1) : '—',
      unit: bestWeekKm ? 'km' : '',
      meta: 'total distance',
    },
    {
      label: 'Total Runs',
      value: String(totalRuns),
      unit: '',
      meta: 'all time',
    },
  ];

  return (
    <div className="pr-grid">
      {cards.map((c) => (
        <div className="pr-card" key={c.label}>
          <div className="label">{c.label}</div>
          <div className="time">
            {c.value}
            {c.unit && <span className="time-unit">{c.unit}</span>}
          </div>
          {c.rpe != null && <div style={{ marginBottom: 4 }}><EffortBadge rpe={c.rpe} /></div>}
          {c.meta && <div className="meta">{c.meta}</div>}
        </div>
      ))}
    </div>
  );
}
