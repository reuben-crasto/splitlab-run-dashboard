import { Link } from 'react-router-dom';
import { mpsToSecPerKm, formatPace, formatDate } from '../lib/format.js';

// Both km1_rpe (our app) and Strava perceived_exertion are 1–10.
function resolveRpe(log, run) {
  if (log?.km1_rpe != null) return log.km1_rpe;
  if (run.perceived_exertion != null) return run.perceived_exertion;
  return null;
}

function EffortBadge({ rpe }) {
  if (rpe == null) return null;
  const r = Math.max(1, Math.min(10, rpe));
  if (r <= 4) return <span className="effort-badge effort-badge--low">Easy · {r}/10</span>;
  if (r <= 7) return <span className="effort-badge effort-badge--mid">Moderate · {r}/10</span>;
  return <span className="effort-badge effort-badge--high">Hard · {r}/10</span>;
}

export default function RecentActivity({ runs, logMap = {} }) {
  const recent = runs.slice(0, 8);

  if (recent.length === 0) {
    return <div style={{ padding: '20px', color: 'var(--text-dim)', fontSize: 13 }}>No runs yet.</div>;
  }

  return (
    <div className="ra-list">
      {recent.map((run) => {
        const log = logMap[String(run.id)];
        const effort = resolveRpe(log, run);

        const paceSec = mpsToSecPerKm(run.average_speed_mps);
        return (
          <Link key={run.id} to={`/run/${run.id}`} className="ra-row">
            <div className="ra-info">
              <div className="ra-name">{run.name}</div>
              <div className="ra-meta">
                {(run.distance_m / 1000).toFixed(1)} km · {formatDate(run.start_date)}
              </div>
            </div>
            <div className="ra-right">
              <div className="ra-pace">{formatPace(paceSec)}</div>
              {effort != null ? (
                <EffortBadge rpe={effort} />
              ) : (
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>no effort</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
