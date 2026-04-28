import { useState } from 'react'
import { ListBulletIcon }    from '../../../src/components/icons/ListBulletIcon.tsx'
import { TeambridgeAIIcon }  from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckIcon }         from '../../../src/components/icons/CheckIcon.tsx'
import { AlertTriangleIcon } from '../../../src/components/icons/AlertTriangleIcon.tsx'
import { ChevronRightIcon }  from '../../../src/components/icons/ChevronRightIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * Pay Review — exception queue for the current pay period. The point
 * is a sign-off pass before payroll runs: each exception has a Nova
 * recommendation and a one-click resolution.
 * ────────────────────────────────────────────────────────────────────── */

const SEVERITY_META = {
  high: { label: 'High',   tint: { bg: '#FEE2E2', fg: '#B91C1C' } },
  med:  { label: 'Medium', tint: { bg: '#FEF3C7', fg: '#92400E' } },
  low:  { label: 'Low',    tint: { bg: '#DBEAFE', fg: '#1D4ED8' } },
}

const EXCEPTIONS = [
  {
    id: 'e1', severity: 'high', who: 'Diane Kim', initials: 'DK', color: '#166534',
    title: 'Saturday F&B shift exceeds 12-hr cap',
    detail: 'Logged 14 hrs (12 PM → 2 AM). Daily-cap policy auto-blocks pay until reviewed.',
    novaRec: 'Pay 12 hrs at OT, escalate the 2-hr overage to ops lead for sign-off.',
    delta: '+$320 OT premium'
  },
  {
    id: 'e2', severity: 'high', who: 'Carlos Mendez', initials: 'CM', color: '#5b21b6',
    title: 'Weekly total 45 hrs — over 40-hr cap',
    detail: 'Approved by GM at +5 hrs (Saturday Niners overflow). 5 hrs of OT premium pending.',
    novaRec: 'Apply 1.5× rate on the 5 OT hrs (~$420). GM sign-off already on file.',
    delta: '+$420 OT premium'
  },
  {
    id: 'e3', severity: 'med', who: 'Tasha K.', initials: 'TK', color: '#166534',
    title: 'Two late clock-ins this period',
    detail: 'Wed 12 min late, Mon 8 min late. Pattern flag triggered.',
    novaRec: 'Pay clocked time as-is; surface to Engage for a soft conversation.',
    delta: 'No pay impact'
  },
  {
    id: 'e4', severity: 'med', who: 'Marcus J.', initials: 'MJ', color: '#991b1b',
    title: 'Friday usher shift not yet clocked out',
    detail: 'Auto-out at scheduled end (8 PM); operator manual sign-off required.',
    novaRec: 'Sign off at 8:00 PM as scheduled. Manager may amend.',
    delta: '4.0 hrs · $96'
  },
  {
    id: 'e5', severity: 'low', who: 'Priya Shah', initials: 'PS', color: '#9d174d',
    title: 'Time-off request overlaps shift',
    detail: 'Half-day PTO May 7 (4 hrs); overlaps Friday load-in. Pay should split.',
    novaRec: '4 hrs PTO + 1 hr regular; auto-process if approved.',
    delta: '$96 PTO + $24 regular'
  },
  {
    id: 'e6', severity: 'low', who: 'Sandra L.', initials: 'SL', color: '#5b21b6',
    title: 'Wednesday no-show — drop from this period',
    detail: 'Confirmed no-show. No backup picked up the shift in time. Zero pay.',
    novaRec: 'Drop the shift from pay; counsel via Engage.',
    delta: '$0'
  },
]

const FILTERS = [
  { id: 'all',  label: 'All exceptions' },
  { id: 'high', label: 'High' },
  { id: 'med',  label: 'Medium' },
  { id: 'low',  label: 'Low' },
]

export default function ReviewView({ data, onDemo, onToggleActivityDrawer, activityDrawerOpen }) {
  const [filter, setFilter] = useState('all')
  const buzz = () => onDemo?.()

  const visible = filter === 'all' ? EXCEPTIONS : EXCEPTIONS.filter(e => e.severity === filter)
  const counts = EXCEPTIONS.reduce((acc, e) => { acc[e.severity] = (acc[e.severity] ?? 0) + 1; return acc }, {})

  return (
    <section className="review" aria-label="Pay Review">
      <header className="review-head">
        <div>
          <h1 className="review-title">Pay Review</h1>
          <p className="review-sub">
            Apr 27 – May 3 pay period · {EXCEPTIONS.length} exceptions before payroll runs Friday
          </p>
        </div>
        <div className="review-actions">
          <button type="button" className="review-btn review-btn-dark" onClick={buzz}>
            <CheckIcon size={14} /> Approve & lock period
          </button>
          <button
            type="button"
            className={`review-icon-btn ${activityDrawerOpen ? 'is-active' : ''}`}
            onClick={onToggleActivityDrawer ?? buzz}
            aria-label={activityDrawerOpen ? 'Close activity drawer' : 'Open activity drawer'}
            aria-pressed={activityDrawerOpen ?? false}
          >
            <ListBulletIcon size={16} />
          </button>
          <button type="button" className="review-icon-btn review-icon-btn-ai" onClick={buzz} aria-label="Ask Teambridge">
            <TeambridgeAIIcon size={16} />
          </button>
        </div>
      </header>

      <div className="review-stats">
        <div className="review-stat">
          <div className="review-stat-label">Gross pay (period)</div>
          <div className="review-stat-value">$84,610</div>
          <div className="review-stat-sub">Across 30 staff</div>
        </div>
        <div className="review-stat">
          <div className="review-stat-label">OT premium</div>
          <div className="review-stat-value review-stat-value--bad">+$3,840</div>
          <div className="review-stat-sub">+182% vs. budget</div>
        </div>
        <div className="review-stat">
          <div className="review-stat-label">Exceptions</div>
          <div className="review-stat-value">{EXCEPTIONS.length}</div>
          <div className="review-stat-sub">{counts.high ?? 0} high · {counts.med ?? 0} medium · {counts.low ?? 0} low</div>
        </div>
        <div className="review-stat">
          <div className="review-stat-label">Auto-resolvable</div>
          <div className="review-stat-value">4</div>
          <div className="review-stat-sub">Nova flagged for one-click clear</div>
        </div>
      </div>

      <div className="review-filters" role="tablist">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`review-filter ${filter === f.id ? 'is-active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="review-list">
        {visible.map(e => {
          const sev = SEVERITY_META[e.severity]
          return (
            <li key={e.id}>
              <article className={`review-card review-card--${e.severity}`}>
                <span className="review-avatar" style={{ background: e.color }}>{e.initials}</span>
                <div className="review-body">
                  <div className="review-row">
                    <span className="review-sev" style={{ background: sev.tint.bg, color: sev.tint.fg }}>{sev.label}</span>
                    <span className="review-who">{e.who}</span>
                  </div>
                  <div className="review-card-title">{e.title}</div>
                  <div className="review-detail">{e.detail}</div>
                  <div className="review-novarec">
                    <TeambridgeAIIcon size={12} />
                    <span>{e.novaRec}</span>
                  </div>
                </div>
                <div className="review-end">
                  <span className="review-delta">{e.delta}</span>
                  <div className="review-card-actions">
                    <button type="button" className="review-card-btn review-card-btn--apply" onClick={buzz}>
                      <CheckIcon size={14} /> Apply
                    </button>
                    <button type="button" className="review-card-btn" onClick={buzz}>
                      Open <ChevronRightIcon size={12} />
                    </button>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
        {!visible.length && (
          <li className="review-empty">No exceptions at this severity.</li>
        )}
      </ul>
    </section>
  )
}
