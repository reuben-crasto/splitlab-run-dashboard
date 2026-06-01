import { useMemo } from 'react';
import { mpsToSecPerKm, formatPace } from '../lib/format.js';

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function WeeklyLoad({ runs, logMap = {} }) {
  const stats = useMemo(() => {
    const now = new Date();
    const thisStart = getWeekStart(now);
    const lastStart = new Date(thisStart);
    lastStart.setDate(lastStart.getDate() - 7);

    const thisRuns = runs.filter((r) => new Date(r.start_date) >= thisStart);
    const lastRuns = runs.filter((r) => {
      const d = new Date(r.start_date);
      return d >= lastStart && d < thisStart;
    });

    const runsCount = thisRuns.length;

    const effortValues = thisRuns
      .map((r) => logMap[String(r.id)]?.km1_rpe ?? r.perceived_exertion)
      .filter((v) => v != null);
    const avgEffort = effortValues.length > 0
      ? effortValues.reduce((a, b) => a + b, 0) / effortValues.length
      : null;

    const thisPaces = thisRuns.map((r) => mpsToSecPerKm(r.average_speed_mps)).filter(Boolean);
    const lastPaces = lastRuns.map((r) => mpsToSecPerKm(r.average_speed_mps)).filter(Boolean);
    const thisAvgPace = thisPaces.length ? thisPaces.reduce((a, b) => a + b, 0) / thisPaces.length : null;
    const lastAvgPace = lastPaces.length ? lastPaces.reduce((a, b) => a + b, 0) / lastPaces.length : null;
    const paceDiff = thisAvgPace != null && lastAvgPace != null ? thisAvgPace - lastAvgPace : null;

    const thisVolume = thisRuns.reduce((s, r) => s + r.distance_m / 1000, 0);
    const lastVolume = lastRuns.reduce((s, r) => s + r.distance_m / 1000, 0);
    const volumeDiff = lastRuns.length > 0 ? thisVolume - lastVolume : null;

    const volumeUp   = volumeDiff != null && volumeDiff > 0;
    const paceFaster = paceDiff   != null && paceDiff < 0;
    const bothIncreasing = volumeUp && paceFaster;

    return { runsCount, avgEffort, thisAvgPace, paceDiff, thisVolume, volumeDiff, bothIncreasing };
  }, [runs, logMap]);

  const { runsCount, avgEffort, thisAvgPace, paceDiff, thisVolume, volumeDiff, bothIncreasing } = stats;

  const paceArrow = paceDiff == null ? null : (paceDiff < 0 ? '↑' : '↓');
  const paceColor = paceDiff == null ? '' : bothIncreasing ? 'var(--bad)' : paceDiff < 0 ? 'var(--good)' : 'var(--bad)';

  const volumeArrow = volumeDiff == null ? null : (volumeDiff > 0 ? '↑' : '↓');
  const volumeColor = volumeDiff == null ? '' : bothIncreasing ? 'var(--bad)' : volumeDiff < 0 ? 'var(--bad)' : '';

  return (
    <div className="wl-stats">
      <div className="wl-stat">
        <div className="wl-label">Runs</div>
        <div className="wl-value">{runsCount}</div>
      </div>
      <div className="wl-stat">
        <div className="wl-label">Avg Effort</div>
        <div className="wl-value">{avgEffort != null ? `${avgEffort.toFixed(1)}/10` : '—'}</div>
      </div>
      <div className="wl-stat">
        <div className="wl-label">Avg Pace</div>
        <div className="wl-value">
          {thisAvgPace != null ? formatPace(thisAvgPace) : '—'}
          {paceArrow && <span style={{ color: paceColor, marginLeft: 4, fontSize: 14 }}>{paceArrow}</span>}
        </div>
      </div>
      <div className="wl-stat">
        <div className="wl-label">Volume</div>
        <div className="wl-value">
          {thisVolume.toFixed(1)}<span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 2 }}>km</span>
          {volumeArrow && <span style={{ color: volumeColor, marginLeft: 4, fontSize: 14 }}>{volumeArrow}</span>}
        </div>
      </div>
    </div>
  );
}
