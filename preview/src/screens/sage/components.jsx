import './sage.css'

/* ───── Tiny inline icons (no external deps) ───── */
export function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
export function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
    </svg>
  )
}
export function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5"  cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  )
}
export function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
export function ReportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  )
}
export function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/* ───── KPI card ───── */
export function SageKpiCard({ label, value, trend = 'up', trendIsBad = false, footer }) {
  const arrowChar  = trend === 'up' ? '↑' : '↓'
  const arrowClass = trendIsBad
    ? 'sage-kpi-arrow--bad'
    : (trend === 'up' ? 'sage-kpi-arrow--up' : 'sage-kpi-arrow--down')
  return (
    <div className="sage-kpi">
      <div className="sage-kpi-label">{label}</div>
      <div className="sage-kpi-row">
        <div className="sage-kpi-value">{value}</div>
        <div className={`sage-kpi-arrow ${arrowClass}`} aria-hidden="true">{arrowChar}</div>
      </div>
      <div className="sage-kpi-meta">this month</div>
      {footer && <div className="sage-kpi-foot">{footer}</div>}
    </div>
  )
}

/* ───── Generic widget card ───── */
export function SageWidgetCard({ title, subtitle, action, children }) {
  return (
    <div className="sage-widget">
      <div className="sage-widget-head">
        <div>
          <div className="sage-widget-title">{title}</div>
          {subtitle && <div className="sage-widget-sub">{subtitle}</div>}
        </div>
        <div className="sage-widget-actions">
          {action}
          <span aria-hidden="true"><MoreIcon /></span>
        </div>
      </div>
      <div className="sage-widget-body">{children}</div>
    </div>
  )
}

/* ───── Alert card ───── */
export function SageAlertCard({ title, items, ctaLabel, onCta, tone = 'alert' }) {
  return (
    <div className={`sage-alert ${tone === 'ok' ? 'sage-alert--ok' : ''}`} role={tone === 'ok' ? 'status' : 'alert'}>
      <div>
        <div className="sage-alert-head">
          <span aria-hidden="true">{tone === 'ok' ? '✅' : '🚨'}</span>
          <span>{title}</span>
        </div>
        <ul className="sage-alert-list">
          {items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      </div>
      <button type="button" className="sage-alert-cta" onClick={onCta}>
        {ctaLabel}
        <ArrowRightIcon />
      </button>
    </div>
  )
}
