import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SplitsChart from '../components/SplitsChart.jsx';
import PacingVerdict from '../components/PacingVerdict.jsx';
import { getActivity } from '../lib/api.js';
import { formatDate, formatKm, formatDuration, mpsToSecPerKm, formatPace } from '../lib/format.js';
import { EmptyState, Panel } from '../ui/index.js';

export default function RunDetail() {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getActivity(id)
      .then((r) => !cancelled && setRun(r))
      .catch((e) => !cancelled && setErr(e.message || 'Failed to load'));
    return () => { cancelled = true; };
  }, [id]);

  if (err) return <EmptyState>Error: {err}</EmptyState>;
  if (!run) return <EmptyState>Loading run…</EmptyState>;

  return (
    <div style={{ padding: '28px 24px' }}>
      <div className="detail-header">
        <Link to="/" className="back">← Back</Link>
        <h1>{run.name}</h1>
        <div style={{ marginTop: 8, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <span className="stat"><b>{formatDate(run.start_date)}</b></span>
          <span className="stat"><b>{formatKm(run.distance_m)}</b> distance</span>
          <span className="stat"><b>{formatDuration(run.moving_time_s)}</b> moving</span>
          <span className="stat"><b>{formatPace(mpsToSecPerKm(run.average_speed_mps))}</b> avg</span>
        </div>
      </div>

      <Panel title="Pace per KM — where am I slowing down?">
        <SplitsChart splits={run.splits_metric} averageSpeedMps={run.average_speed_mps} />
        <PacingVerdict splits={run.splits_metric} averageSpeedMps={run.average_speed_mps} />
      </Panel>
    </div>
  );
}
