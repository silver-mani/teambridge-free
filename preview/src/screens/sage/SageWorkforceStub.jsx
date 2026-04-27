import SageShell from './SageShell.jsx'
import { ArrowRightIcon } from './components.jsx'

const RISKS = [
  {
    tag: 'Overtime',
    title: 'OT threshold exceeded',
    meta: '4 venues over the 40-hour OT trigger this week. 18 employees at risk.',
  },
  {
    tag: 'Coverage',
    title: '12 unfilled shifts this weekend',
    meta: 'Levi’s Stadium and SAP Center are short on event ops & security.',
  },
  {
    tag: 'Compliance',
    title: '5 credential compliance issues',
    meta: 'Expired certifications would block scheduled shifts in the next 7 days.',
  },
]

export default function SageWorkforceStub({ onNavigate }) {
  return (
    <SageShell module="workforce" viewLabel="Workforce - Operations" onNavigate={onNavigate}>
      <div className="sage-row">
        <div className="sage-stub-hero">
          <div>
            <h1>Sage Workforce</h1>
            <div className="sage-stub-hero-sub">
              Powered by <strong>Teambridge</strong>
            </div>
          </div>
          <div className="sage-stub-hero-sub">
            Surfacing the 3 risks the CFO dashboard flagged. Drill in to resolve.
          </div>
        </div>
      </div>

      <div className="sage-row" style={{ marginTop: 16 }}>
        <div className="sage-risk-grid">
          {RISKS.map(r => (
            <div key={r.title} className="sage-risk-card">
              <div className="sage-risk-tag">{r.tag}</div>
              <div className="sage-risk-title">{r.title}</div>
              <div className="sage-risk-meta">{r.meta}</div>
              <button type="button" className="sage-risk-cta">
                View in Teambridge
                <ArrowRightIcon />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="sage-row">
        <div className="sage-stub-placeholder">
          <strong>Coming next:</strong>{' '}
          embedded Teambridge modules (Schedule, People, Workflows, Pay) render in this canvas.
        </div>
      </div>
    </SageShell>
  )
}
