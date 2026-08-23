import { mpsToSecPerKm } from '../lib/format.js';
import { splitClass } from '../lib/pacing.js';

const COLORS = {
  fast: 'var(--split-fast)',
  mid:  'var(--split-mid)',
  slow: 'var(--split-slow)',
};

// Tiny per-km split sparkline: one bar per km, taller = slower, coloured by
// pace relative to the run average. Matches the mini charts in the runs list.
export default function MiniSplits({ splits, averageSpeedMps, width = 72, height = 26 }) {
  if (!splits || splits.length === 0) {
    return <div className="mini-splits mini-splits--empty" style={{ width, height }} />;
  }

  const paces = splits.map((s) => mpsToSecPerKm(s.average_speed) || 0);
  const max = Math.max(...paces, 1);
  const min = Math.min(...paces.filter(Boolean), max);
  const range = Math.max(max - min, 1);

  const n = splits.length;
  const gap = 2;
  const barW = Math.max((width - gap * (n - 1)) / n, 1);

  return (
    <svg className="mini-splits" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {splits.map((s, i) => {
        const pace = paces[i];
        // Normalise 0.35–1 so even "fast" bars are visible.
        const norm = 0.35 + 0.65 * ((pace - min) / range);
        const h = Math.max(norm * height, 2);
        const x = i * (barW + gap);
        const y = height - h;
        return (
          <rect
            key={i}
            x={x} y={y} width={barW} height={h} rx={1}
            fill={COLORS[splitClass(s.average_speed, averageSpeedMps)]}
          />
        );
      })}
    </svg>
  );
}
