import './sage.css'
import {
  StarIcon, HomeIcon, ReportIcon, PlusIcon,
} from './components.jsx'

/**
 * Outer chrome for every Sage screen — dark top bar + light sub-bar.
 * The product label in the top bar tracks `module` ("Intacct" for
 * Financials, "Workforce" for the embedded Teambridge experience).
 *
 * `bare` skips the .sage-page wrapper so children (e.g. the embedded
 * Teambridge Schedule view, which manages its own full-bleed layout)
 * can render edge-to-edge below the chrome.
 */
export default function SageShell({
  module = 'financials', // 'financials' | 'workforce'
  viewLabel = 'CFO - Daily View',
  onNavigate = () => {},
  bare = false,
  subBar = true,
  children,
}) {
  const productLabel = module === 'workforce' ? 'Workforce' : 'Intacct'
  return (
    <div className="sage-shell">
      <header className="sage-topbar">
        {/* Brand cluster reads as one button — clicking "Sage <Product>" jumps
            you back to the Sage Intacct (Financials) dashboard, the way most
            product headers route their logo to "home". */}
        <button
          type="button"
          className="sage-brand"
          onClick={() => onNavigate('dashboard')}
          aria-label="Go to Sage Intacct dashboard"
        >
          <span className="sage-logo">Sage</span>
          <span className="sage-topbar-divider" aria-hidden="true" />
          <span className="sage-topbar-product">{productLabel}</span>
        </button>
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

      {subBar && (
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
      )}

      {bare ? children : <main className="sage-page">{children}</main>}
    </div>
  )
}
