/**
 * EmptyState — the .empty-state primitive.
 *
 * Centered, dimmed message for empty / loading / error placeholders. The single
 * most-reused pattern in the app (16 call sites: "No runs yet.", "Loading…",
 * "Error: …"). Wraps the global .empty-state class. Code-side primitive.
 */
export default function EmptyState({ className = '', children, ...rest }) {
  return (
    <div className={`empty-state${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </div>
  );
}
