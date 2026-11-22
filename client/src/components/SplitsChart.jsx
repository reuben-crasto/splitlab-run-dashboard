import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { mpsToSecPerKm, paceMinutesDecimal, formatPace } from '../lib/format.js';
import { color, font, fontSize } from '../tokens.js';
import { EmptyState } from '../ui/index.js';

const ACCENT = color.accent;

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: color.bgSurface,
      border: `1px solid ${color.borderStrong}`,
      borderRadius: 6,
      padding: '8px 12px',
      fontFamily: font.ui,
      fontSize: fontSize.sm,
    }}>
      <div style={{ color: color.textDim, marginBottom: 2 }}>km {d.km}</div>
      <div style={{ color: color.text, fontWeight: 700 }}>{formatPace(d.paceSec)}</div>
    </div>
  );
}

export default function SplitsChart({ splits, averageSpeedMps, height = 220 }) {
  const { data, avgMin } = useMemo(() => {
    const rows = splits.map((s, i) => {
      const paceSec = mpsToSecPerKm(s.average_speed);
      return {
        km: i + 1,
        paceMin: paceMinutesDecimal(paceSec),
        paceSec,
      };
    });
    return { data: rows, avgMin: paceMinutesDecimal(mpsToSecPerKm(averageSpeedMps)) };
  }, [splits, averageSpeedMps]);

  if (data.length === 0) {
    return <EmptyState>No split data for this run.</EmptyState>;
  }

  const validPaces = data.map((d) => d.paceMin).filter(Boolean);
  const maxPace = Math.max(...validPaces);
  const minPace = Math.min(...validPaces);
  // Non-reversed axis: taller bar = slower km (matches Figma)
  const domainMin = Math.floor((minPace - 0.25) * 60) / 60;
  const domainMax = Math.ceil((maxPace + 0.25) * 60) / 60;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 14, right: 28, left: 0, bottom: 6 }}
        barCategoryGap="14%"
      >
        <XAxis
          dataKey="km"
          tickLine={false}
          axisLine={false}
          tick={{ fill: color.textDim, fontSize: fontSize.xs, fontFamily: font.ui }}
        />
        <YAxis
          domain={[domainMin, domainMax]}
          tickCount={3}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => {
            const m = Math.floor(v);
            const s = Math.round((v - m) * 60);
            return `${m}:${String(s).padStart(2, '0')}`;
          }}
          tick={{ fill: color.textDim, fontSize: fontSize.xs, fontFamily: font.ui }}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(196,222,85,0.06)' }} />
        <ReferenceLine
          y={avgMin}
          stroke={color.borderStrong}
          strokeDasharray="4 3"
          label={{
            value: 'avg',
            position: 'right',
            fill: color.textDim,
            style: { fontSize: fontSize.xs, fontFamily: font.ui },
          }}
        />
        <Bar
          dataKey="paceMin"
          fill={ACCENT}
          isAnimationActive={false}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
