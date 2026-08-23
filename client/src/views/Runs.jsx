import { useEffect, useState, useCallback } from 'react';
import LastRunCard from '../components/LastRunCard.jsx';
import RunsSidebar from '../components/RunsSidebar.jsx';
import { getActivities, getRunLogs } from '../lib/api.js';

export default function Runs() {
  const [runs,     setRuns]     = useState(null);
  const [logMap,   setLogMap]   = useState({});
  const [selected, setSelected] = useState(null);
  const [err,      setErr]      = useState(null);

  const refreshLogs = useCallback(async (activityIds) => {
    if (!activityIds?.length) return;
    try {
      const logs = await getRunLogs(activityIds);
      setLogMap(Object.fromEntries(logs.map((l) => [String(l.activity_id), l])));
    } catch (_) {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    getActivities()
      .then((a) => {
        if (cancelled) return;
        setRuns(a);
        setSelected(a[0] ?? null);
        refreshLogs(a.map((r) => String(r.id)));
      })
      .catch((e) => !cancelled && setErr(e.message || 'Failed to load'));
    return () => { cancelled = true; };
  }, [refreshLogs]);

  if (err)   return <div className="empty-state">Error: {err}</div>;
  if (!runs) return <div className="empty-state">Loading runs…</div>;

  return (
    <div className="runs-view">
      <header className="runs-header">
        <h1>Recent Runs</h1>
        <p>Every run, broken down.</p>
      </header>

      <div className="runs-body">
        <div className="runs-main">
          <LastRunCard
            key={selected?.id}
            run={selected}
            existingLog={selected ? logMap[String(selected.id)] ?? null : null}
            onLogSaved={(saved) =>
              setLogMap((prev) => ({ ...prev, [String(saved.activity_id)]: saved }))
            }
          />
        </div>

        <aside className="runs-side">
          <RunsSidebar
            runs={runs}
            logMap={logMap}
            selectedId={selected?.id}
            onSelect={setSelected}
          />
        </aside>
      </div>
    </div>
  );
}
