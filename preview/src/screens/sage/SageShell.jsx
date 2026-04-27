import './sage.css'
import {
  StarIcon, HomeIcon, ReportIcon, PlusIcon,
} from './components.jsx'

/**
 * Outer chrome for every Sage screen — dark Intacct top bar + light sub-bar.
 * `module` switches the right-hand pill in the top bar (Financials / Workforce);
 * clicking the inactive pill calls `onNavigate('dashboard'|'workforce')`.
 */
export default function SageShell({
  module = 'financials', // 'financials' | 'workforce'
  viewLabel = 'CFO - Daily View',
  onNavigate = () => {},
  children,
}) {
  return (
    <div className="sage-shell">
      <header className="sage-topbar">
        <div className="sage-logo">Sage</div>
        <div className="sage-topbar-divider" />
        <div className="sage-topbar-product">Intacct</div>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className="sage-module-pill"
          data-active={module === 'financials'}
          onClick={() => onNavigate('dashboard')}
        >
          Financials
        </button>
        <button
          type="button"
          className="sage-module-pill"
          data-active={module === 'workforce'}
          onClick={() => onNavigate('workforce')}
        >
          Workforce
        </button>
      </header>

      <div className="sage-subbar">
        <span className="sage-icon-btn" aria-hidden="true"><StarIcon /></span>
        <span className="sage-icon-btn" aria-hidden="true"><HomeIcon /></span>
        <button type="button" className="sage-view-dropdown" aria-haspopup="true">
          {viewLabel}
        </button>
        <div className="sage-subbar-spacer" />
        <button type="button" className="sage-btn sage-btn--ghost">
          <ReportIcon />
          Create Report
        </button>
        <button type="button" className="sage-btn">
          <PlusIcon />
          Add Widget
        </button>
      </div>

      <main className="sage-page">{children}</main>
    </div>
  )
}
