import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { mpsToSecPerKm, paceMinutesDecimal, formatPace } from '../lib/format.js';

const ACCENT = '#C4DE55';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: '#0A140B',
      border: '1px solid #1F301F',
      borderRadius: 6,
      padding: '8px 12px',
      fontFamily: 'IBM Plex Sans, sans-serif',
      fontSize: 12,
    }}>
      <div style={{ color: '#9A9991', marginBottom: 2 }}>km {d.km}</div>
      <div style={{ color: '#DCDBCF', fontWeight: 700 }}>{formatPace(d.paceSec)}</div>
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
    return <div className="empty-state">No split data for this run.</div>;
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
          tick={{ fill: '#9A9991', fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif' }}
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
          tick={{ fill: '#9A9991', fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif' }}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(196,222,85,0.06)' }} />
        <ReferenceLine
          y={avgMin}
          stroke="#1F301F"
          strokeDasharray="4 3"
          label={{
            value: 'avg',
            position: 'right',
            fill: '#9A9991',
            style: { fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif' },
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
