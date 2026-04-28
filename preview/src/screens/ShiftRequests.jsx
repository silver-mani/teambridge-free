import { useState } from 'react'
import { ListBulletIcon }    from '../../../src/components/icons/ListBulletIcon.tsx'
import { TeambridgeAIIcon }  from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckIcon }         from '../../../src/components/icons/CheckIcon.tsx'
import { XIcon }             from '../../../src/components/icons/XIcon.tsx'
import { ArrowCircleBrokenRightIcon } from '../../../src/components/icons/ArrowCircleBrokenRightIcon.tsx'
import { ClockIcon }         from '../../../src/components/icons/ClockIcon.tsx'
import { Mail01Icon }        from '../../../src/components/icons/Mail01Icon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * Shift Requests — pending worker actions queue (swap / pickup /
 * time-off / cover). Each row carries Nova's recommendation, so the
 * operator can approve in one click instead of evaluating the whole
 * shift context from scratch.
 * ────────────────────────────────────────────────────────────────────── */

const TYPE_META = {
  swap:    { label: 'Swap',    Icon: ArrowCircleBrokenRightIcon, tint: { bg: '#E0EAFF', fg: '#2746B5' } },
  pickup:  { label: 'Pickup',  Icon: CheckIcon,                  tint: { bg: '#DCFCE7', fg: '#166534' } },
  cover:   { label: 'Cover',   Icon: Mail01Icon,                 tint: { bg: '#FEF3C7', fg: '#92400E' } },
  'time-off': { label: 'Time off', Icon: ClockIcon,              tint: { bg: '#EDE9FE', fg: '#5B21B6' } },
}

const FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'swap',     label: 'Swap' },
  { id: 'pickup',   label: 'Pickup' },
  { id: 'cover',    label: 'Cover' },
  { id: 'time-off', label: 'Time off' },
]

const REQUESTS = [
  {
    id: 'r1',
    type: 'swap',
    requester: 'Miguel R.',
    initials: 'MR',
    color: '#1d4ed8',
    when: '4m ago',
    summary: 'Swap Saturday gate 3 (4–9 PM) to Jordan K.',
    detail: "Miguel is projecting 46 hrs this week; Jordan K. is at 28 hrs and gate-3 qualified. Same role, same pay.",
    novaSuggestion: 'Approve',
    impact: 'Restores 40-hr cap for Miguel · costs $0',
  },
  {
    id: 'r2',
    type: 'pickup',
    requester: 'Jordan K.',
    initials: 'JK',
    color: '#92400e',
    when: '6m ago',
    summary: 'Pick up Marcus J.\'s Friday 4–8 PM usher shift',
    detail: 'Marcus called out sick. Jordan accepted in 47 seconds via Sera.',
    novaSuggestion: 'Approve',
    impact: 'Coverage restored · no OT trigger',
  },
  {
    id: 'r3',
    type: 'cover',
    requester: 'Sandra L.',
    initials: 'SL',
    color: '#5b21b6',
    when: '12m ago',
    summary: 'Find cover for Saturday 7–11 PM Civic usher shift',
    detail: 'Sandra has a personal conflict. 3 qualified candidates flagged by Nova.',
    novaSuggestion: 'Suggest Rachel W.',
    impact: 'Rachel projects 31 hrs after — well under cap',
  },
  {
    id: 'r4',
    type: 'time-off',
    requester: 'Diane Kim',
    initials: 'DK',
    color: '#166534',
    when: '38m ago',
    summary: 'Time off requested — May 4 (PTO, 1 day)',
    detail: 'Conflicts with the Sunday F&B shift. Lena Volkov is available.',
    novaSuggestion: 'Approve + auto-cover',
    impact: 'Lena fills the 11-hr gap · OT cap unaffected',
  },
  {
    id: 'r5',
    type: 'swap',
    requester: 'Carlos Mendez',
    initials: 'CM',
    color: '#9d174d',
    when: '1h ago',
    summary: 'Swap Friday Premium suite (5–11 PM) for Saturday Premium (12 PM–2 AM)',
    detail: 'Saturday extension would push Carlos to 47 hrs. Trip OT cap.',
    novaSuggestion: 'Decline',
    impact: 'Approving would cost ~$420 in OT premiums',
    severity: 'warn',
  },
  {
    id: 'r6',
    type: 'pickup',
    requester: 'Amir Naidu',
    initials: 'AN',
    color: '#475569',
    when: '2h ago',
    summary: 'Pick up Saturday 6 AM–2 PM Engineering shift',
    detail: 'Nina Okafor offered the swap. Amir is cert-current and under hours.',
    novaSuggestion: 'Approve',
    impact: 'Coverage restored · Nina banks 8 hrs back',
  },
  {
    id: 'r7',
    type: 'cover',
    requester: 'Ravi Banerjee',
    initials: 'RB',
    color: '#92400e',
    when: '3h ago',
    summary: 'Find cover for Saturday Levi\'s Security 1 PM–3 AM',
    detail: 'Ravi already at 43 hrs projected — needs a partial replacement to stay under cap.',
    novaSuggestion: 'Split with David K.',
    impact: 'David takes 1–7 PM; Ravi keeps 7 PM–3 AM (back to 38 hrs)',
    severity: 'warn',
  },
  {
    id: 'r8',
    type: 'time-off',
    requester: 'Priya Shah',
    initials: 'PS',
    color: '#9d174d',
    when: '6h ago',
    summary: 'Time off — May 7 (medical appt, 4 hrs)',
    detail: 'Half-day. Existing Friday load-in shift can be shortened.',
    novaSuggestion: 'Approve',
    impact: 'No coverage gap',
  },
]

export default function ShiftRequests({ data, onDemo, onToggleActivityDrawer, activityDrawerOpen }) {
  const [filter, setFilter] = useState('all')
  const buzz = () => onDemo?.()

  const visible = filter === 'all' ? REQUESTS : REQUESTS.filter(r => r.type === filter)
  const counts = REQUESTS.reduce((acc, r) => { acc[r.type] = (acc[r.type] ?? 0) + 1; return acc }, {})

  return (
    <section className="shift-requests" aria-label="Shift Requests">
      <header className="shift-requests-head">
        <div>
          <h1 className="shift-requests-title">Shift Requests</h1>
          <p className="shift-requests-sub">{REQUESTS.length} pending · Nova has a recommendation on each</p>
        </div>
        <div className="shift-requests-actions">
          <button
            type="button"
            className={`shift-requests-icon-btn ${activityDrawerOpen ? 'is-active' : ''}`}
            onClick={onToggleActivityDrawer ?? buzz}
            aria-label={activityDrawerOpen ? 'Close activity drawer' : 'Open activity drawer'}
            aria-pressed={activityDrawerOpen ?? false}
          >
            <ListBulletIcon size={16} />
          </button>
          <button type="button" className="shift-requests-icon-btn shift-requests-icon-btn-ai" onClick={buzz} aria-label="Ask Teambridge">
            <TeambridgeAIIcon size={16} />
          </button>
        </div>
      </header>

      <div className="shift-requests-stats">
        {FILTERS.filter(f => f.id !== 'all').map(f => {
          const meta = TYPE_META[f.id]
          const Icon = meta.Icon
          return (
            <div key={f.id} className="shift-requests-stat">
              <span
                className="shift-requests-stat-icon"
                style={{ background: meta.tint.bg, color: meta.tint.fg }}
                aria-hidden="true"
              >
                <Icon size={14} />
              </span>
              <span className="shift-requests-stat-text">
                <span className="shift-requests-stat-label">{meta.label}</span>
                <span className="shift-requests-stat-value">{counts[f.id] ?? 0}</span>
              </span>
            </div>
          )
        })}
      </div>

      <div className="shift-requests-filters" role="tablist">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`shift-requests-filter ${filter === f.id ? 'is-active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="shift-requests-list">
        {visible.map(r => {
          const meta = TYPE_META[r.type]
          const Icon = meta.Icon
          return (
            <li key={r.id}>
              <article className={`shift-request-card ${r.severity ? `is-${r.severity}` : ''}`}>
                <div className="shift-request-left">
                  <span className="shift-request-avatar" style={{ background: r.color }}>
                    {r.initials}
                  </span>
                </div>
                <div className="shift-request-body">
                  <div className="shift-request-row">
                    <span
                      className="shift-request-type-pill"
                      style={{ background: meta.tint.bg, color: meta.tint.fg }}
                    >
                      <Icon size={12} />
                      {meta.label}
                    </span>
                    <span className="shift-request-requester">{r.requester}</span>
                    <span className="shift-request-when">{r.when}</span>
                  </div>
                  <div className="shift-request-summary">{r.summary}</div>
                  <div className="shift-request-detail">{r.detail}</div>
                  <div className="shift-request-impact">
                    <TeambridgeAIIcon size={12} />
                    <span><b>{r.novaSuggestion}</b> — {r.impact}</span>
                  </div>
                </div>
                <div className="shift-request-actions">
                  <button type="button" className="shift-request-btn shift-request-btn--approve" onClick={buzz}>
                    <CheckIcon size={14} /> Approve
                  </button>
                  <button type="button" className="shift-request-btn shift-request-btn--decline" onClick={buzz} aria-label="Decline">
                    <XIcon size={14} />
                  </button>
                </div>
              </article>
            </li>
          )
        })}
        {!visible.length && (
          <li className="shift-requests-empty">No requests of that type right now.</li>
        )}
      </ul>
    </section>
  )
}
