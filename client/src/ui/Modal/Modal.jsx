/**
 * Modal — the .modal-overlay / .modal primitive.
 *
 * Centered dialog over a scrim. Wraps the global modal classes used by
 * UnlockModal and RunLogForm: click-scrim-to-close, a header with title +
 * optional subtitle + close button, and a body. `narrow` applies .modal--narrow.
 *
 * Body content is passed as children (both real usages render a .log-form inside).
 * Code-side primitive — no Figma counterpart.
 */
export default function Modal({ title, subtitle, narrow = false, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal${narrow ? ' modal--narrow' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-subtitle">{subtitle}</div>}
          </div>
          {onClose && (
            <button className="modal-close" type="button" onClick={onClose}>✕</button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
