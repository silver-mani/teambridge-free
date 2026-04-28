import { useState } from 'react'
import { ListBulletIcon }    from '../../../src/components/icons/ListBulletIcon.tsx'
import { TeambridgeAIIcon }  from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { AlertTriangleIcon } from '../../../src/components/icons/AlertTriangleIcon.tsx'
import { ClockIcon }         from '../../../src/components/icons/ClockIcon.tsx'
import { ClipboardCheckIcon } from '../../../src/components/icons/ClipboardCheckIcon.tsx'
import { Users03Icon }       from '../../../src/components/icons/Users03Icon.tsx'
import { Bell01Icon }        from '../../../src/components/icons/Bell01Icon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * Shift Alerts — anything Nova flagged that needs operator eyes.
 * Sorted severity-first. Mock data ties back to the OT-crisis story.
 * ────────────────────────────────────────────────────────────────────── */

const SEVERITY_META = {
  severe: { label: 'Severe',  tint: { bg: '#FEE2E2', fg: '#B91C1C' } },
  warn:   { label: 'Warning', tint: { bg: '#FEF3C7', fg: '#92400E' } },
  info:   { label: 'Info',    tint: { bg: '#DBEAFE', fg: '#1D4ED8' } },
}

const CATEGORY_META = {
  overtime:   { label: 'Overtime',     Icon: ClockIcon },
  'no-show':  { label: 'No-show',      Icon: AlertTriangleIcon },
  understaff: { label: 'Understaffed', Icon: Users03Icon },
  cert:       { label: 'Credential',   Icon: ClipboardCheckIcon },
  late:       { label: 'Late clock-in', Icon: ClockIcon },
}

const ALERTS = [
  {
    id: 'a1',
    severity: 'severe',
    category: 'overtime',
    title: '6 workers projected over the 40-hr cap this week',
    detail: 'Diane Kim (45h), Carlos Mendez (45h), Trevor Booth (43h), Maria Cruz (43h), Ravi Banerjee (43h), David Kim (42h). All driven by Saturday Niners-game extensions.',
    when: '2m ago',
    cta: 'Resolve in Schedule',
  },
  {
    id: 'a2',
    severity: 'severe',
    category: 'no-show',
    title: 'Marcus J. — late clock-in 9 minutes',
    detail: 'Civic Arena, Friday 4 PM usher shift. No message sent. Sera attempted contact at +5 min and +8 min.',
    when: '4m ago',
    cta: 'Notify backup',
  },
  {
    id: 'a3',
    severity: 'severe',
    category: 'understaff',
    title: 'Levi\'s Stadium Saturday — 12 unfilled shifts',
    detail: 'Niners home game · 4:30 PM gates open. Currently 142/154 staffed across event-staff, security, and F&B.',
    when: '7m ago',
    cta: 'Open Shift Requests',
  },
  {
    id: 'a4',
    severity: 'warn',
    category: 'cert',
    title: '5 credentials expiring within 7 days',
    detail: 'Priya Shah (TIPS, Apr 30), Diego P. (Crowd Manager, May 1), Tasha K. (TIPS, May 2), Maya Patel (CPR, May 3), Nate H. (Safety, May 4).',
    when: '12m ago',
    cta: 'Send refresher reminders',
  },
  {
    id: 'a5',
    severity: 'warn',
    category: 'overtime',
    title: '3 workers approaching the 40-hr cap',
    detail: 'Jordan K. (37h projected), Hugo Reyes (39h), Jasmine Park (36h). All within 4 hrs of trip.',
    when: '24m ago',
    cta: 'Re-balance shifts',
  },
  {
    id: 'a6',
    severity: 'warn',
    category: 'late',
    title: 'Tasha K. — second late this week',
    detail: 'Civic Arena, Wednesday 4 PM. 12 minutes late. Pattern flag: late on Mon as well.',
    when: '1h ago',
    cta: 'Open Engage thread',
  },
  {
    id: 'a7',
    severity: 'info',
    category: 'understaff',
    title: 'Sun afternoon F&B — 2 shifts open',
    detail: 'Posted to internal pool. 4 candidates already responded. Auto-fill enabled.',
    when: '2h ago',
    cta: 'Review candidates',
  },
  {
    id: 'a8',
    severity: 'info',
    category: 'overtime',
    title: 'OT spend pace softening',
    detail: 'Monday-to-date OT cost is $1.4k vs. last week\'s pace of $2.0k. Trending toward $13k weekly (still over budget).',
    when: '3h ago',
    cta: 'Open Pay dashboard',
  },
]

const FILTERS = [
  { id: 'all',    label: 'All' },
  { id: 'severe', label: 'Severe' },
  { id: 'warn',   label: 'Warning' },
  { id: 'info',   label: 'Info' },
]

export default function ShiftAlerts({ data, onDemo, onToggleActivityDrawer, activityDrawerOpen }) {
  const [filter, setFilter] = useState('all')
  const buzz = () => onDemo?.()

  const visible = filter === 'all' ? ALERTS : ALERTS.filter(a => a.severity === filter)
  const sevCounts = ALERTS.reduce((acc, a) => { acc[a.severity] = (acc[a.severity] ?? 0) + 1; return acc }, {})

  return (
    <section className="shift-alerts" aria-label="Shift Alerts">
      <header className="shift-alerts-head">
        <div>
          <h1 className="shift-alerts-title">Shift Alerts</h1>
          <p className="shift-alerts-sub">{sevCounts.severe ?? 0} severe · {sevCounts.warn ?? 0} warning · {sevCounts.info ?? 0} info</p>
        </div>
        <div className="shift-alerts-actions">
          <button
            type="button"
            className={`shift-alerts-icon-btn ${activityDrawerOpen ? 'is-active' : ''}`}
            onClick={onToggleActivityDrawer ?? buzz}
            aria-label={activityDrawerOpen ? 'Close activity drawer' : 'Open activity drawer'}
            aria-pressed={activityDrawerOpen ?? false}
          >
            <ListBulletIcon size={16} />
          </button>
          <button type="button" className="shift-alerts-icon-btn shift-alerts-icon-btn-ai" onClick={buzz} aria-label="Ask Teambridge">
            <TeambridgeAIIcon size={16} />
          </button>
        </div>
      </header>

      <div className="shift-alerts-filters" role="tablist">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`shift-alerts-filter ${filter === f.id ? 'is-active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            {f.id !== 'all' && (
              <span className="shift-alerts-filter-count">{sevCounts[f.id] ?? 0}</span>
            )}
          </button>
        ))}
      </div>

      <ul className="shift-alerts-list">
        {visible.map(a => {
          const sev = SEVERITY_META[a.severity]
          const cat = CATEGORY_META[a.category]
          const Icon = cat.Icon
          return (
            <li key={a.id}>
              <article className={`shift-alert-card shift-alert-card--${a.severity}`}>
                <span
                  className="shift-alert-icon"
                  style={{ background: sev.tint.bg, color: sev.tint.fg }}
                  aria-hidden="true"
                >
                  <Icon size={16} />
                </span>
                <div className="shift-alert-body">
                  <div className="shift-alert-row">
                    <span
                      className="shift-alert-sev"
                      style={{ background: sev.tint.bg, color: sev.tint.fg }}
                    >
                      {sev.label}
                    </span>
                    <span className="shift-alert-cat">{cat.label}</span>
                    <span className="shift-alert-when">{a.when}</span>
                  </div>
                  <div className="shift-alert-title">{a.title}</div>
                  <div className="shift-alert-detail">{a.detail}</div>
                </div>
                <div className="shift-alert-actions">
                  <button type="button" className="shift-alert-btn" onClick={buzz}>
                    {a.cta}
                  </button>
                  <button type="button" className="shift-alert-icon-btn" onClick={buzz} aria-label="Mute">
                    <Bell01Icon size={14} />
                  </button>
                </div>
              </article>
            </li>
          )
        })}
        {!visible.length && (
          <li className="shift-alerts-empty">Nothing at this severity right now.</li>
        )}
      </ul>
    </section>
  )
}
