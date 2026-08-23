import { useMemo } from 'react';
import { mpsToSecPerKm } from '../lib/format.js';

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function TrendsSummary({ runs }) {
  const bullets = useMemo(() => {
    const out = [];
    const now = new Date();
    const cutoff = new Date(now.getTime() - 56 * 86400000); // 8 weeks
    const recent = runs.filter((r) => new Date(r.start_date) >= cutoff);

    if (recent.length === 0) return out;

    // 1. Pace trend: first half vs second half of the window.
    const byDate = [...recent].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    const paces = byDate.map((r) => mpsToSecPerKm(r.average_speed_mps)).filter(Boolean);
    if (paces.length >= 4) {
      const mid = Math.floor(paces.length / 2);
      const early = paces.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const late  = paces.slice(mid).reduce((a, b) => a + b, 0) / (paces.length - mid);
      const diff = Math.round(early - late); // positive = faster now
      if (Math.abs(diff) >= 3) {
        out.push(diff > 0
          ? `Your pace has improved ${diff}s/km over the last 8 weeks.`
          : `Your pace has eased ${Math.abs(diff)}s/km over the last 8 weeks.`);
      }
    }

    // 2. This week vs last week volume.
    const thisStart = getMonday(now);
    const lastStart = new Date(thisStart); lastStart.setDate(lastStart.getDate() - 7);
    const sumKm = (from, to) => runs
      .filter((r) => { const d = new Date(r.start_date); return d >= from && (!to || d < to); })
      .reduce((s, r) => s + (r.distance_m || 0) / 1000, 0);
    const thisVol = sumKm(thisStart, null);
    const lastVol = sumKm(lastStart, thisStart);
    if (lastVol > 0) {
      const pct = Math.round(((thisVol - lastVol) / lastVol) * 100);
      if (Math.abs(pct) >= 5) {
        out.push(pct > 0
          ? `This week's volume is up ${pct}% versus last week.`
          : `This week's volume is down ${Math.abs(pct)}% versus last week — a lighter week.`);
      }
    }

    // 3. Consistency.
    const weeks = new Set(recent.map((r) => getMonday(new Date(r.start_date)).getTime()));
    if (weeks.size >= 6) {
      out.push(`You've run in ${weeks.size} of the last 8 weeks — steady consistency.`);
    } else if (recent.length >= 3) {
      out.push(`${recent.length} runs logged in the last 8 weeks.`);
    }

    return out.slice(0, 3);
  }, [runs]);

  if (bullets.length === 0) {
    return <div className="empty-state">Log a few more runs to see your trends.</div>;
  }

  return (
    <>
      <ul className="trends-summary-list">
        {bullets.map((b, i) => (
          <li key={i}><span className="ts-dot" />{b}</li>
        ))}
      </ul>
      <div className="trends-summary-foot">Based on your last 8 weeks of runs</div>
    </>
  );
}
