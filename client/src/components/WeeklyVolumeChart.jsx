import { useMemo } from 'react';
import {
  BarChart, Bar, Cell, XAxis, LabelList, ResponsiveContainer,
} from 'recharts';

const ACCENT = '#C4DE55';
const MUTED  = '#1F301F';

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function WeeklyVolumeChart({ runs }) {
  const data = useMemo(() => {
    const now = new Date();
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const start = getMonday(new Date(now.getTime() - i * 7 * 86400000));
      weeks.push({
        key: start.getTime(),
        label: i === 0 ? 'Now' : `${i}w ago`,
        km: 0,
      });
    }
    const byKey = new Map(weeks.map((w) => [w.key, w]));
    for (const run of runs) {
      const key = getMonday(new Date(run.start_date)).getTime();
      if (byKey.has(key)) byKey.get(key).km += (run.distance_m || 0) / 1000;
    }
    return weeks.map((w) => ({ ...w, km: Math.round(w.km * 10) / 10 }));
  }, [runs]);

  const hasData = data.some((d) => d.km > 0);
  if (!hasData) return <div className="empty-state">No runs in the last 8 weeks.</div>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: '#9A9991', fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif' }}
          axisLine={{ stroke: '#172419' }}
          tickLine={false}
        />
        <Bar dataKey="km" radius={[6, 6, 0, 0]} isAnimationActive={false}>
          <LabelList
            dataKey="km"
            position="top"
            fill="#9A9991"
            fontSize={11}
            fontFamily="IBM Plex Sans, sans-serif"
            formatter={(v) => (v > 0 ? v : '')}
          />
          {data.map((d, i) => (
            <Cell key={d.key} fill={i === data.length - 1 ? ACCENT : MUTED} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
