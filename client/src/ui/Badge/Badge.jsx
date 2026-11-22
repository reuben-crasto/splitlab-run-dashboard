/**
 * Badge — the .effort-badge primitive.
 *
 * Small pill used for RPE / effort labels. Wraps the global .effort-badge
 * classes. `tone` maps to the four modifiers, each bound to a split/accent pair:
 *   low  → split-fast (easy)
 *   mid  → split-mid  (moderate)
 *   high → split-slow (hard)
 *   todo → accent     (not yet logged)
 *
 * No Figma counterpart — this is a code-side primitive. When it lands in Figma
 * it should be a single component with a `tone` variant property.
 */
export default function Badge({ tone = 'low', className = '', children, ...rest }) {
  const cls = `effort-badge effort-badge--${tone}${className ? ` ${className}` : ''}`;
  return <span className={cls} {...rest}>{children}</span>;
}
