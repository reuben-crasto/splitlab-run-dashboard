import { Link } from 'react-router-dom';
import { mpsToSecPerKm, formatPace, formatDate } from '../lib/format.js';
import { Badge } from '../ui/index.js';
import { resolveRpe } from '../lib/effort.js';
import { isRecoveryRun } from '../lib/runType.js';

function EffortBadge({ rpe }) {
  if (rpe == null) return null;
  const r = Math.max(1, Math.min(10, rpe));
  if (r <= 4) return <Badge tone="low">Easy · {r}/10</Badge>;
  if (r <= 7) return <Badge tone="mid">Moderate · {r}/10</Badge>;
  return <Badge tone="high">Hard · {r}/10</Badge>;
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
        const effort = resolveRpe(run, log);
        const recovery = isRecoveryRun(run);

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
              {recovery ? (
                <Badge tone="low" title={effort != null ? `Effort ${effort}/10` : undefined}>Easy · Recovery</Badge>
              ) : effort != null ? (
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
