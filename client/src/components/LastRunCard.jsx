import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SplitsChart from './SplitsChart.jsx';
import PacingVerdict from './PacingVerdict.jsx';
import RunLogForm from './RunLogForm.jsx';
import { useAuth } from '../lib/auth.jsx';
import { getActivity } from '../lib/api.js';
import { formatDate, formatKm, formatDuration, mpsToSecPerKm, formatPace } from '../lib/format.js';

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
        <div className="empty-state">No runs yet. Connect Strava and complete a run!</div>
      </div>
    );
  }

  const splits = detail?.splits_metric ?? [];
  const paceSec = mpsToSecPerKm(run.average_speed_mps);

  return (
    <>
      <div className="last-run-card">
        <div className="lr-header">
          <div className="lr-run-name">{run.name}</div>
          <div className="lr-run-date">{formatDate(run.start_date)}</div>
        </div>

        <div className="lr-stats">
          <div className="lr-stat">
            <div className="lr-stat-label">Distance</div>
            <div className="lr-stat-value">
              {(run.distance_m / 1000).toFixed(2)}
              <span className="lr-stat-unit">km</span>
            </div>
          </div>
          <div className="lr-stat">
            <div className="lr-stat-label">Avg Pace</div>
            <div className="lr-stat-value">
              {paceSec != null ? (() => {
                const m = Math.floor(paceSec / 60);
                const s = Math.round(paceSec % 60);
                return `${m}:${String(s).padStart(2, '0')}`;
              })() : '—'}
              <span className="lr-stat-unit">/km</span>
            </div>
          </div>
          <div className="lr-stat">
            <div className="lr-stat-label">Time</div>
            <div className="lr-stat-value">
              {formatDuration(run.moving_time_s)}
            </div>
          </div>
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
          <button className="btn-primary" onClick={() => requireAuth(() => setShowForm(true))}>
            {existingLog ? 'Edit log' : 'Log Effort'}
          </button>
          <Link to={`/run/${run.id}`} className="btn-secondary">
            View full details →
          </Link>
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
