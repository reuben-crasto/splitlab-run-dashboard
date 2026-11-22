import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { mpsToSecPerKm, formatPace } from '../lib/format.js';
import { isRecoveryRun } from '../lib/runType.js';
import { resolveRpe } from '../lib/effort.js';
import { color, font, fontSize } from '../tokens.js';

// Both km1_rpe (our app) and Strava perceived_exertion are 1–10.
const TABS = [
  { key: 'easy',     label: 'Easy',     rpeMin: 1, rpeMax: 4 },
  { key: 'moderate', label: 'Moderate', rpeMin: 5, rpeMax: 7 },
  { key: 'hard',     label: 'Hard',     rpeMin: 8, rpeMax: 10 },
];

function getWeekLabel(date) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div style={{
      background: color.bgSurface,
      border: `1px solid ${color.borderStrong}`,
      borderRadius: 6,
      padding: '8px 12px',
      fontFamily: font.ui,
      fontSize: fontSize.sm,
    }}>
      <div style={{ color: color.textDim, marginBottom: 2 }}>{label}</div>
      <div style={{ color: color.text, fontWeight: 700 }}>
        {val ? formatPace(val * 60) : '—'}
      </div>
    </div>
  );
}

function buildWeekBuckets(runs, cutoff) {
  const now = new Date();
  const weekMap = new Map();
  for (let i = 7; i >= 0; i--) {
    const wStart = getMonday(new Date(now.getTime() - i * 7 * 86400000));
    weekMap.set(wStart.getTime(), { paces: [], label: getWeekLabel(wStart) });
  }
  for (const run of runs) {
    const d = new Date(run.start_date);
    if (d < cutoff) continue;
    if (isRecoveryRun(run)) continue; // recovery runs don't count towards avg pace
    const key = getMonday(d).getTime();
    if (weekMap.has(key)) {
      const pace = mpsToSecPerKm(run.average_speed_mps);
      if (pace) weekMap.get(key).paces.push(pace);
    }
  }
  return weekMap;
}

function toChartData(weekMap) {
  return [...weekMap.values()].map(({ label, paces }) => {
    const avg = paces.length ? paces.reduce((a, b) => a + b, 0) / paces.length : null;
    return { label, paceMin: avg != null ? avg / 60 : null, paceSec: avg };
  });
}

function insightFor(data, label) {
  const withData = data.filter(d => d.paceSec != null);
  if (withData.length < 4) return null;
  const mid = Math.floor(withData.length / 2);
  const earlyAvg = withData.slice(0, mid).reduce((s, d) => s + d.paceSec, 0) / mid;
  const recentAvg = withData.slice(mid).reduce((s, d) => s + d.paceSec, 0) / (withData.length - mid);
  const diff = Math.round(earlyAvg - recentAvg); // positive = getting faster
  if (Math.abs(diff) < 5) return null;
  return diff > 0
    ? `${label}: you're running ${diff}s/km faster than 4 weeks ago.`
    : `${label}: pace has eased by ${Math.abs(diff)}s/km over recent weeks.`;
}

export default function PaceEffortChart({ runs, logMap = {} }) {
  const [activeTab, setActiveTab] = useState('moderate');

  // Check if ANY run has effort data
  const hasAnyEffortData = useMemo(() =>
    runs.some(r => resolveRpe(r, logMap[String(r.id)]) != null),
  [runs, logMap]);

  const now = new Date();
  const cutoff = new Date(now.getTime() - 56 * 86400000);

  const recoveryCount = useMemo(
    () => runs.filter(r => new Date(r.start_date) >= cutoff && isRecoveryRun(r)).length,
    [runs],
  );

  const { data, insight, mode } = useMemo(() => {
    if (!hasAnyEffortData) {
      // Fallback: show all runs, weekly avg pace
      const weekMap = buildWeekBuckets(runs, cutoff);
      const d = toChartData(weekMap);
      return { data: d, insight: insightFor(d, 'Overall pace'), mode: 'all' };
    }

    const tab = TABS.find(t => t.key === activeTab);
    const filtered = runs.filter(r => {
      const rpe = resolveRpe(r, logMap[String(r.id)]);
      return rpe != null && rpe >= tab.rpeMin && rpe <= tab.rpeMax;
    });

    const weekMap = buildWeekBuckets(filtered, cutoff);
    const d = toChartData(weekMap);
    return { data: d, insight: insightFor(d, tab.label), mode: 'rpe' };
  }, [runs, logMap, activeTab, hasAnyEffortData]);

  const hasData = data.some(d => d.paceMin != null);
  const validPaces = data.map(d => d.paceMin).filter(Boolean);
  const minP = validPaces.length ? Math.floor(Math.min(...validPaces) - 0.3) : 4;
  const maxP = validPaces.length ? Math.ceil(Math.max(...validPaces) + 0.3) : 8;

  return (
    <div>
      <div className="pe-header">
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          {mode === 'all'
            ? 'Weekly avg pace, last 8 weeks'
            : 'Average pace at a given effort, last 8 weeks'}
        </div>
        {hasAnyEffortData && (
          <div className="pe-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`pe-tab${activeTab === t.key ? ' active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!hasData ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>
          No {mode === 'rpe' ? TABS.find(t => t.key === activeTab)?.label.toLowerCase() + ' effort' : ''} runs in the last 8 weeks.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="paceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color.accent} stopOpacity={0.22} />
                <stop offset="100%" stopColor={color.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={color.border} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: color.textDim, fontSize: fontSize.xs, fontFamily: font.ui }}
              stroke={color.border}
            />
            <YAxis
              reversed
              domain={[minP, maxP]}
              tickFormatter={(v) => {
                const m = Math.floor(v);
                const s = Math.round((v - m) * 60);
                return `${m}:${String(s).padStart(2, '0')}`;
              }}
              tick={{ fill: color.textDim, fontSize: fontSize.xs, fontFamily: font.ui }}
              stroke={color.border}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)' }} />
            <Area
              type="monotone"
              dataKey="paceMin"
              stroke={color.accent}
              strokeWidth={2}
              fill="url(#paceGrad)"
              baseValue={maxP}
              dot={{ r: 3, fill: color.accent, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: color.accent }}
              connectNulls={true}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {recoveryCount > 0 && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
          {recoveryCount} recovery {recoveryCount === 1 ? 'run' : 'runs'} (slower than 7:00 /km) not counted in average pace.
        </div>
      )}

      {mode === 'all' && (
        <div style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          marginTop: 8,
          padding: '8px 10px',
          background: 'var(--bg-raised)',
          borderRadius: 6,
          borderLeft: '2px solid var(--accent-subtle)',
        }}>
          Log effort after runs to see pace broken down by intensity.
        </div>
      )}

      {insight && mode === 'rpe' && (
        <div className="pe-insight">{insight}</div>
      )}
    </div>
  );
}
