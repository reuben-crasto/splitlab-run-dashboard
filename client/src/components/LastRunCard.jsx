import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SplitsChart from './SplitsChart.jsx';
import PacingVerdict from './PacingVerdict.jsx';
import RunLogForm from './RunLogForm.jsx';
import { useAuth } from '../lib/auth.jsx';
import { getActivity } from '../lib/api.js';
import { formatDate, formatKm, formatDuration, mpsToSecPerKm, formatPace } from '../lib/format.js';
import { isRecoveryRun } from '../lib/runType.js';
import { Badge, Button, Stat, EmptyState } from '../ui/index.js';

export default function LastRunCard({ run, existingLog, onLogSaved }) {
  const [detail, setDetail] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { requireAuth } = useAuth();

  useEffect(() => {
    if (!run) return;
    let cancelled = false;
    getActivity(run.id)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [run?.id]);

  if (!run) {
    return (
      <div className="last-run-card">
        <EmptyState>No runs yet. Connect Strava and complete a run!</EmptyState>
      </div>
    );
  }

  const splits = detail?.splits_metric ?? [];
  const paceSec = mpsToSecPerKm(run.average_speed_mps);
  const paceLabel = paceSec != null
    ? `${Math.floor(paceSec / 60)}:${String(Math.round(paceSec % 60)).padStart(2, '0')}`
    : '—';

  return (
    <>
      <div className="last-run-card">
        <div className="lr-header">
          <div className="lr-run-name">{run.name}</div>
          <div className="lr-run-date">
            {formatDate(run.start_date)}
            {isRecoveryRun(run) && <Badge tone="low" style={{ marginLeft: 8 }}>Easy · Recovery</Badge>}
          </div>
        </div>

        <div className="lr-stats">
          <Stat label="Distance" value={(run.distance_m / 1000).toFixed(2)} unit="km" />
          <Stat label="Avg Pace" value={paceLabel} unit="/km" />
          <Stat label="Time" value={formatDuration(run.moving_time_s)} />
        </div>

        {!detail ? (
          // Reserve the chart+verdict space while the detail loads so the
          // action buttons below don't jump up into the middle of the card.
          <div className="lr-chart">
            <div className="lr-chart-title">Pace per km split</div>
            <div className="lr-chart-skeleton" style={{ height: 200 }} />
          </div>
        ) : splits.length > 0 && (
          <>
            <div className="lr-chart">
              <div className="lr-chart-title">Pace per km split</div>
              <SplitsChart splits={splits} averageSpeedMps={run.average_speed_mps} height={200} />
            </div>
            <div className="lr-pacing-verdict">
              <PacingVerdict splits={splits} averageSpeedMps={run.average_speed_mps} />
            </div>
          </>
        )}

        <div className="lr-actions">
          <Button variant="primary" onClick={() => requireAuth(() => setShowForm(true))}>
            {existingLog ? 'Edit log' : 'Log Effort'}
          </Button>
          <Button variant="secondary" as={Link} to={`/run/${run.id}`}>
            View full details →
          </Button>
        </div>
      </div>

      {showForm && (
        <RunLogForm
          run={run}
          existingLog={existingLog}
          onClose={() => setShowForm(false)}
          onSaved={(saved) => {
            onLogSaved(saved);
            setShowForm(false);
          }}
        />
      )}
    </>
  );
}
