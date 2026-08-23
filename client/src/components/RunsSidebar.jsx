import { useEffect, useState } from 'react';
import MiniSplits from './MiniSplits.jsx';
import { getActivity } from '../lib/api.js';
import { pacingShape } from '../lib/pacing.js';
import { mpsToSecPerKm, formatPace, formatDate } from '../lib/format.js';

// Module-level cache so re-selecting runs doesn't refetch splits.
const splitCache = new Map();

function resolveRpe(log, run) {
  if (log?.km1_rpe != null) return log.km1_rpe;
  if (run.perceived_exertion != null) return run.perceived_exertion;
  return null;
}

function EffortBadge({ rpe, logged }) {
  if (rpe == null) {
    return <span className={`effort-badge ${logged ? '' : 'effort-badge--todo'}`}>Log</span>;
  }
  const r = Math.max(1, Math.min(10, rpe));
  const cls = r <= 4 ? 'effort-badge--low' : r <= 7 ? 'effort-badge--mid' : 'effort-badge--high';
  return <span className={`effort-badge ${cls}`}>RPE {r}</span>;
}

function RunRow({ run, log, selected, onSelect }) {
  const [detail, setDetail] = useState(splitCache.get(run.id) ?? null);

  useEffect(() => {
    if (splitCache.has(run.id)) { setDetail(splitCache.get(run.id)); return; }
    let cancelled = false;
    getActivity(run.id)
      .then((d) => { splitCache.set(run.id, d); if (!cancelled) setDetail(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [run.id]);

  const splits = detail?.splits_metric ?? [];
  const shape = pacingShape(splits, run.average_speed_mps).label;
  const rpe = resolveRpe(log, run);

  return (
    <button
      type="button"
      className={`run-item${selected ? ' run-item--active' : ''}`}
      onClick={() => onSelect(run)}
    >
      <div className="run-item-main">
        <div className="run-item-head">
          <span className="run-item-name">{run.name}</span>
          <EffortBadge rpe={rpe} logged={!!log} />
        </div>
        <div className="run-item-date">{formatDate(run.start_date)}</div>
        <div className="run-item-meta">
          <span>{(run.distance_m / 1000).toFixed(1)} km</span>
          <span className="run-item-dot">·</span>
          <span>{formatPace(mpsToSecPerKm(run.average_speed_mps))}</span>
          {shape && <><span className="run-item-dot">·</span><span className="run-item-shape">{shape}</span></>}
        </div>
      </div>
      <MiniSplits splits={splits} averageSpeedMps={run.average_speed_mps} />
    </button>
  );
}

export default function RunsSidebar({ runs, logMap = {}, selectedId, onSelect }) {
  if (runs.length === 0) return <div className="empty-state">No runs yet.</div>;

  return (
    <div className="runs-side-list">
      {runs.map((run) => (
        <RunRow
          key={run.id}
          run={run}
          log={logMap[String(run.id)]}
          selected={String(run.id) === String(selectedId)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
