import { useMemo } from 'react';
import { pacingShape } from '../lib/pacing.js';

export default function PacingVerdict({ splits, averageSpeedMps }) {
  const { label, verdict } = useMemo(
    () => pacingShape(splits, averageSpeedMps),
    [splits, averageSpeedMps]
  );

  if (!verdict) return null;

  return (
    <div className="pacing-shape">
      <div className="pacing-shape-header">
        <span className="pacing-shape-label">PACING SHAPE</span>
        <span className="pacing-shape-badge">{label}</span>
      </div>
      <p className="pacing-shape-text">{verdict}</p>
    </div>
  );
}
