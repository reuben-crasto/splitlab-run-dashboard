import { useEffect, useState, useCallback } from 'react';
import PaceEffortChart from '../components/PaceEffortChart.jsx';
import WeeklyVolumeChart from '../components/WeeklyVolumeChart.jsx';
import VolumePaceQuadrant from '../components/VolumePaceQuadrant.jsx';
import TrendsSummary from '../components/TrendsSummary.jsx';
import { getActivities, getRunLogs } from '../lib/api.js';
import { EmptyState, Panel } from '../ui/index.js';

export default function Trends() {
  const [runs,   setRuns]   = useState(null);
  const [logMap, setLogMap] = useState({});
  const [err,    setErr]    = useState(null);

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
        refreshLogs(a.map((r) => String(r.id)));
      })
      .catch((e) => !cancelled && setErr(e.message || 'Failed to load'));
    return () => { cancelled = true; };
  }, [refreshLogs]);

  if (err)   return <EmptyState>Error: {err}</EmptyState>;
  if (!runs) return <EmptyState>Loading runs…</EmptyState>;

  return (
    <div className="trends">
      <header className="trends-header">
        <h1>Running Trends</h1>
        <p>The bigger picture.</p>
      </header>

      <div className="trends-grid">
        <Panel title="Trends Summary" subtitle="What your data shows right now">
          <TrendsSummary runs={runs} />
        </Panel>

        <Panel title="Pace × Effort">
          <PaceEffortChart runs={runs} logMap={logMap} />
        </Panel>

        <Panel title="Weekly Volume" subtitle="In km">
          <WeeklyVolumeChart runs={runs} />
        </Panel>

        <Panel title="Volume × Pace" subtitle="Week-on-week shifts in volume and pace">
          <VolumePaceQuadrant runs={runs} />
        </Panel>
      </div>
    </div>
  );
}
