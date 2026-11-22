import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, ReferenceLine, ReferenceArea,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { mpsToSecPerKm, formatPace } from '../lib/format.js';
import { isRecoveryRun } from '../lib/runType.js';
import { color, font, fontSize, radius } from '../tokens.js';
import { EmptyState } from '../ui/index.js';

const ACCENT = color.accent;
const PAST   = color.secondary;

const X_MAX = 25; // % volume change
const Y_MAX = 15; // seconds/km pace change

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function clamp(v, max) {
  return Math.max(-max, Math.min(max, v));
}

export default function VolumePaceQuadrant({ runs }) {
  const points = useMemo(() => {
    // Build the last 8 weekly buckets: total volume + avg pace.
    const now = new Date();
    const weeks = [];
    for (let i = 8; i >= 0; i--) {
      const start = getMonday(new Date(now.getTime() - i * 7 * 86400000));
      weeks.push({ key: start.getTime(), km: 0, paceSum: 0, paceN: 0 });
    }
    const byKey = new Map(weeks.map((w) => [w.key, w]));
    for (const run of runs) {
      const key = getMonday(new Date(run.start_date)).getTime();
      if (!byKey.has(key)) continue;
      const w = byKey.get(key);
      w.km += (run.distance_m || 0) / 1000;
      // Volume counts every run; pace skips recovery runs.
      const pace = isRecoveryRun(run) ? null : mpsToSecPerKm(run.average_speed_mps);
      if (pace) { w.paceSum += pace; w.paceN += 1; }
    }
    const stats = weeks.map((w) => ({
      km: w.km,
      pace: w.paceN ? w.paceSum / w.paceN : null,
    }));

    // Week-on-week deltas vs the previous week.
    const out = [];
    for (let i = 1; i < stats.length; i++) {
      const cur = stats[i], prev = stats[i - 1];
      if (!cur.pace || !prev.pace || prev.km === 0 || cur.km === 0) continue;
      const volPct  = ((cur.km - prev.km) / prev.km) * 100;
      const paceSec = cur.pace - prev.pace; // negative = faster
      out.push({
        x: clamp(volPct, X_MAX),
        y: clamp(paceSec, Y_MAX),
        isNow: i === stats.length - 1,
        volPct: Math.round(volPct),
        paceSec: Math.round(paceSec),
      });
    }
    return out;
  }, [runs]);

  if (points.length === 0) {
    return <EmptyState>Not enough weekly history yet.</EmptyState>;
  }

  const thisWeek = points.filter((p) => p.isNow);
  const pastWeeks = points.filter((p) => !p.isNow);

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          {/* Quadrant tints — "both building" (accent) and "both easing" (secondary) */}
          <ReferenceArea x1={0} x2={X_MAX} y1={-Y_MAX} y2={0} fill={color.accent} fillOpacity={0.05} />
          <ReferenceArea x1={-X_MAX} x2={0} y1={0} y2={Y_MAX} fill={color.secondary} fillOpacity={0.05} />

          <ReferenceLine x={0} stroke={color.borderStrong} />
          <ReferenceLine y={0} stroke={color.borderStrong} />

          <XAxis
            type="number" dataKey="x" domain={[-X_MAX, X_MAX]}
            ticks={[-20, -10, 0, 10, 20]}
            tickFormatter={(v) => (v > 0 ? `+${v}%` : `${v}%`)}
            tick={{ fill: color.textDim, fontSize: fontSize['2xs'], fontFamily: font.ui }}
            stroke={color.border}
          />
          <YAxis
            type="number" dataKey="y" domain={[-Y_MAX, Y_MAX]} reversed
            ticks={[-15, 0, 15]}
            tickFormatter={(v) => (v > 0 ? `+${v}s` : `${v}s`)}
            tick={{ fill: color.textDim, fontSize: fontSize['2xs'], fontFamily: font.ui }}
            stroke={color.border}
          />
          <ZAxis range={[60, 60]} />
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.06)' }}
            contentStyle={{ background: color.bgSurface, border: `1px solid ${color.borderStrong}`, borderRadius: radius.sm, fontFamily: font.ui, fontSize: fontSize.sm }}
            labelStyle={{ display: 'none' }}
            formatter={(_v, _n, ctx) => {
              const p = ctx.payload;
              const vol = p.volPct > 0 ? `+${p.volPct}%` : `${p.volPct}%`;
              const pace = p.paceSec < 0 ? `${-p.paceSec}s/km faster` : `${p.paceSec}s/km slower`;
              return [`${vol} volume · ${pace}`, p.isNow ? 'This week' : 'Past week'];
            }}
          />
          <Scatter data={pastWeeks} fill={PAST} fillOpacity={0.7} isAnimationActive={false} />
          <Scatter data={thisWeek} isAnimationActive={false}>
            {thisWeek.map((_, i) => <Cell key={i} fill={ACCENT} />)}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div className="quad-legend">
        <span><span className="quad-dot" style={{ background: ACCENT }} /> This week</span>
        <span><span className="quad-dot" style={{ background: PAST }} /> Past weeks</span>
      </div>
      <div className="quad-axis-note">← less volume · volume change · more volume →</div>
    </div>
  );
}
