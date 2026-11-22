import { useEffect, useRef, useState } from 'react';
import MiniSplits from './MiniSplits.jsx';
import { getActivity } from '../lib/api.js';
import { readSplits, writeSplits } from '../lib/splitsCache.js';
import { pacingShape } from '../lib/pacing.js';
import { mpsToSecPerKm, formatPace, formatDate } from '../lib/format.js';
import { resolveRpe } from '../lib/effort.js';
import { isRecoveryRun } from '../lib/runType.js';
import { Badge, EmptyState } from '../ui/index.js';

function EffortBadge({ rpe, logged, recovery }) {
  if (recovery) {
    return <Badge tone="low" title={rpe != null ? `Effort ${rpe}/10` : undefined}>Easy · Recovery</Badge>;
  }
  if (rpe == null) {
    // Logged but no RPE recorded: keep the original bare-badge fallback (no tone).
    if (logged) return <span className="effort-badge">Log</span>;
    return <Badge tone="todo">Log</Badge>;
  }
  const r = Math.max(1, Math.min(10, rpe));
  const tone = r <= 4 ? 'low' : r <= 7 ? 'mid' : 'high';
  return <Badge tone={tone}>RPE {r}</Badge>;
}

function RunRow({ run, log, selected, onSelect }) {
  // Splits come from localStorage when we've seen this run before; otherwise
  // they're fetched, but only once the row scrolls into view, so opening the
  // page costs a handful of Strava requests instead of one per run.
  // null = not known yet, [] = known to have none.
  const [splits, setSplits] = useState(() => readSplits(run.id));
  const [visible, setVisible] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setVisible(true); io.disconnect(); }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || splits !== null) return;
    let cancelled = false;
    getActivity(run.id)
      .then((d) => {
        const s = d.splits_metric ?? [];
        writeSplits(run.id, s, run.start_date);
        if (!cancelled) setSplits(s);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [visible, run.id, run.start_date, splits]);

  const shownSplits = splits ?? [];

  const shape = pacingShape(shownSplits, run.average_speed_mps).label;
  const rpe = resolveRpe(run, log);

  return (
    <button
      ref={rowRef}
      type="button"
      className={`run-item${selected ? ' run-item--active' : ''}`}
      onClick={() => onSelect(run)}
    >
      <div className="run-item-main">
        <div className="run-item-head">
          <span className="run-item-name">{run.name}</span>
          <EffortBadge rpe={rpe} logged={!!log} recovery={isRecoveryRun(run)} />
        </div>
        <div className="run-item-date">{formatDate(run.start_date)}</div>
        <div className="run-item-meta">
          <span>{(run.distance_m / 1000).toFixed(1)} km</span>
          <span className="run-item-dot">·</span>
          <span>{formatPace(mpsToSecPerKm(run.average_speed_mps))}</span>
          {shape && <><span className="run-item-dot">·</span><span className="run-item-shape">{shape}</span></>}
        </div>
      </div>
      <MiniSplits splits={shownSplits} averageSpeedMps={run.average_speed_mps} />
    </button>
  );
}

export default function RunsSidebar({ runs, logMap = {}, selectedId, onSelect }) {
  if (runs.length === 0) return <EmptyState>No runs yet.</EmptyState>;

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
