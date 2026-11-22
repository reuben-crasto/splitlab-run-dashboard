/**
 * Button — the .btn-primary / .btn-secondary primitive.
 *
 * Thin typed wrapper over the global button classes in styles.css, so it renders
 * pixel-identical to what ships today. Polymorphic: real call sites use both a
 * native <button> (Log Effort) and a react-router <Link> (View full details →),
 * so `as` lets one component cover both.
 *
 * Figma parity (SplitLab / "Primary Button", "Secondary Button"):
 *   - Primary in Figma has default / hover / pressed variants. Code only does
 *     opacity 0.88 on hover and has no pressed state. Kept as-is (code won).
 *   - Secondary in Figma is a FILLED ink button; code's .btn-secondary is a
 *     transparent outline. These are genuinely different — left as the shipping
 *     outline, flagged for a design decision. See tokens.css reconciliation log.
 */
export default function Button({ variant = 'primary', as: As = 'button', className = '', children, ...rest }) {
  const cls = `btn-${variant}${className ? ` ${className}` : ''}`;
  return <As className={cls} {...rest}>{children}</As>;
}
