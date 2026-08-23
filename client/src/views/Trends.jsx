import { useEffect, useState, useCallback } from 'react';
import PaceEffortChart from '../components/PaceEffortChart.jsx';
import WeeklyVolumeChart from '../components/WeeklyVolumeChart.jsx';
import VolumePaceQuadrant from '../components/VolumePaceQuadrant.jsx';
import TrendsSummary from '../components/TrendsSummary.jsx';
import { getActivities, getRunLogs } from '../lib/api.js';

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

  if (err)   return <div className="empty-state">Error: {err}</div>;
  if (!runs) return <div className="empty-state">Loading runs…</div>;

  return (
    <div className="trends">
      <header className="trends-header">
        <h1>Running Trends</h1>
        <p>The bigger picture.</p>
      </header>

      <div className="trends-grid">
        <div className="panel">
          <h2>Trends Summary</h2>
          <div className="panel-sub">What your data shows right now</div>
          <TrendsSummary runs={runs} />
        </div>

        <div className="panel">
          <h2>Pace × Effort</h2>
          <PaceEffortChart runs={runs} logMap={logMap} />
        </div>

        <div className="panel">
          <h2>Weekly Volume</h2>
          <div className="panel-sub">In km</div>
          <WeeklyVolumeChart runs={runs} />
        </div>

        <div className="panel">
          <h2>Volume × Pace</h2>
          <div className="panel-sub">Week-on-week shifts in volume and pace</div>
          <VolumePaceQuadrant runs={runs} />
        </div>
      </div>
    </div>
  );
}
