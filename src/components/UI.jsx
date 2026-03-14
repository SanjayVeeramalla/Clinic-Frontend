export function Spinner({ size = 20 }) {
  return (
    <span className="spinner" style={{ width: size, height: size }} />
  )
}

export function LoadingCenter() {
  return (
    <div className="loading-center">
      <Spinner /> Loading…
    </div>
  )
}

export function Alert({ type = 'error', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>
}

export function StatusBadge({ status }) {
  const cls = status?.toLowerCase().replace(' ', '') || 'pending'
  return <span className={`badge badge-${cls}`}>{status}</span>
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export function EmptyState({ icon = '📭', message = 'No items found.', action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{message}</p>
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header flex items-center justify-between">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}