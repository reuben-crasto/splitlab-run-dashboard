/**
 * Stat — the .lr-stat primitive (label / value / unit).
 *
 * The stat cell used in the Last Run card: a small uppercase label above a bold
 * value with an optional trailing unit. Wraps .lr-stat / .lr-stat-label /
 * .lr-stat-value / .lr-stat-unit.
 *
 * Note: the app has three visually similar stat patterns (.lr-stat, .wl-stat,
 * .pr-card). This primitive models the .lr-stat one; the others are candidates
 * to fold into it once the Figma stat component exists. Code-side primitive.
 */
export default function Stat({ label, value, unit, className = '', ...rest }) {
  return (
    <div className={`lr-stat${className ? ` ${className}` : ''}`} {...rest}>
      <div className="lr-stat-label">{label}</div>
      <div className="lr-stat-value">
        {value}
        {unit && <span className="lr-stat-unit">{unit}</span>}
      </div>
    </div>
  );
}
