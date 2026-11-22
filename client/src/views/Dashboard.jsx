import { useEffect, useMemo, useState, useCallback } from 'react';
import LastRunCard from '../components/LastRunCard.jsx';
import PaceEffortChart from '../components/PaceEffortChart.jsx';
import PersonalRecords from '../components/PersonalRecords.jsx';
import WeeklyLoad from '../components/WeeklyLoad.jsx';
import RecentActivity from '../components/RecentActivity.jsx';
import { getActivities, getRunLogs } from '../lib/api.js';
import { EmptyState, Panel } from '../ui/index.js';

export default function Dashboard() {
  const [runs,      setRuns]      = useState(null);
  const [loggedIds, setLoggedIds] = useState(new Set());
  const [logMap,    setLogMap]    = useState({});
  const [err,       setErr]       = useState(null);

  const refreshLogs = useCallback(async (activityIds) => {
    if (!activityIds?.length) return;
    try {
      const logs = await getRunLogs(activityIds);
      const ids  = new Set(logs.map((l) => String(l.activity_id)));
      const map  = Object.fromEntries(logs.map((l) => [String(l.activity_id), l]));
      setLoggedIds(ids);
      setLogMap(map);
    } catch (_) {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    getActivities()
      .then((a) => {
        if (cancelled) return;
        setRuns(a);
        refreshLogs(a.map((r) => String(r.id)));
      })
      .catch((e) => !cancelled && setErr(e.message || 'Failed to load'));
    return () => { cancelled = true; };
  }, [refreshLogs]);

  if (err)   return <EmptyState>Error: {err}</EmptyState>;
  if (!runs) return <EmptyState>Loading runs…</EmptyState>;

  const lastRun = runs[0] ?? null;

  return (
    <div className="dashboard">
      {/* ── Center panel ── */}
      <div className="dashboard-center">
        <LastRunCard
          run={lastRun}
          existingLog={lastRun ? logMap[String(lastRun.id)] ?? null : null}
          onLogSaved={(saved) => {
            setLoggedIds((prev) => new Set([...prev, String(saved.activity_id)]));
            setLogMap((prev) => ({ ...prev, [String(saved.activity_id)]: saved }));
          }}
        />
        <Panel title="Pace × Effort">
          <PaceEffortChart runs={runs} logMap={logMap} />
        </Panel>
      </div>

      {/* ── Right panel ── */}
      <div className="dashboard-right">
        <div className="rp-card">
          <div className="rp-card-title">Weekly Load</div>
          <WeeklyLoad runs={runs} logMap={logMap} />
        </div>

        <div className="rp-card">
          <div className="rp-card-title">Personal Records</div>
          <PersonalRecords activities={runs} logMap={logMap} />
        </div>

        <div className="rp-card">
          <div className="rp-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Recent Activity</span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'none', letterSpacing: 0 }}>Tap to see splits</span>
          </div>
          <RecentActivity runs={runs} logMap={logMap} />
        </div>
      </div>
    </div>
  );
}
