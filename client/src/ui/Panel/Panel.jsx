/**
 * Panel — the .panel primitive (generic card).
 *
 * A bordered surface with an optional uppercase accent heading. Wraps the global
 * .panel / .panel h2 / .panel-sub styles used across Dashboard, Trends and
 * RunDetail. Pass `title` for the heading and `subtitle` for the .panel-sub line.
 *
 * Figma parity: the closest design component is "Background+VerticalBorder",
 * which is a layout helper rather than a titled card — no 1:1 match. Code-side
 * primitive.
 */
export default function Panel({ title, subtitle, className = '', children, ...rest }) {
  return (
    <div className={`panel${className ? ` ${className}` : ''}`} {...rest}>
      {title && <h2>{title}</h2>}
      {subtitle && <div className="panel-sub">{subtitle}</div>}
      {children}
    </div>
  );
}
