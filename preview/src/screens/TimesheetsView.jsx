import { useState } from 'react'
import { ListBulletIcon }    from '../../../src/components/icons/ListBulletIcon.tsx'
import { TeambridgeAIIcon }  from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckIcon }         from '../../../src/components/icons/CheckIcon.tsx'
import { ChevronDownIcon }   from '../../../src/components/icons/ChevronDownIcon.tsx'
import { AlertTriangleIcon } from '../../../src/components/icons/AlertTriangleIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * Timesheets — period view of submitted hours per worker. Sub-table
 * with status pills (approved / pending / flagged), bulk approval at
 * the top.
 * ────────────────────────────────────────────────────────────────────── */

const STATUS_META = {
  approved: { label: 'Approved', tint: { bg: '#DCFCE7', fg: '#166534' } },
  pending:  { label: 'Pending',  tint: { bg: '#FEF3C7', fg: '#92400E' } },
  flagged:  { label: 'Flagged',  tint: { bg: '#FEE2E2', fg: '#B91C1C' } },
}

const ROWS = [
  { id: 'miguel',  name: 'Miguel R.',     role: 'Event Lead',  reg: 32.0, ot: 9.0,  total: 41.0, status: 'flagged',  initials: 'MR', color: '#1d4ed8',
    flag: 'OT cap exceeded — Sat shift pushed weekly to 41 hrs' },
  { id: 'diane',   name: 'Diane Kim',     role: 'F&B',         reg: 31.0, ot: 14.0, total: 45.0, status: 'flagged',  initials: 'DK', color: '#166534',
    flag: '12-hr cap on Sat (14 hrs) + OT cap (45 hrs)' },
  { id: 'maria',   name: 'Maria Cruz',    role: 'Bev Service', reg: 29.0, ot: 14.0, total: 43.0, status: 'flagged',  initials: 'MC', color: '#9d174d',
    flag: '12-hr cap on Sat + OT cap (43 hrs)' },
  { id: 'carlos',  name: 'Carlos Mendez', role: 'Premium',     reg: 31.0, ot: 14.0, total: 45.0, status: 'flagged',  initials: 'CM', color: '#5b21b6',
    flag: '12-hr cap on Sat + OT cap (45 hrs)' },
  { id: 'ravi',    name: 'Ravi Banerjee', role: 'Security',    reg: 29.0, ot: 14.0, total: 43.0, status: 'flagged',  initials: 'RB', color: '#92400e',
    flag: '12-hr cap on Sat + OT cap (43 hrs)' },
  { id: 'jordan',  name: 'Jordan K.',     role: 'Usher',       reg: 37.0, ot: 0.0,  total: 37.0, status: 'pending',  initials: 'JK', color: '#92400e',
    flag: 'Approaching OT cap (3 hrs from 40)' },
  { id: 'hugo',    name: 'Hugo Reyes',    role: 'Premium',     reg: 39.0, ot: 0.0,  total: 39.0, status: 'pending',  initials: 'HR', color: '#5b21b6',
    flag: 'Approaching OT cap (1 hr from 40)' },
  { id: 'rachel',  name: 'Rachel W.',     role: 'Usher',       reg: 22.0, ot: 0.0,  total: 22.0, status: 'approved', initials: 'RW', color: '#1d4ed8' },
  { id: 'priya',   name: 'Priya S.',      role: 'Load-in',     reg: 13.0, ot: 0.0,  total: 13.0, status: 'approved', initials: 'PS', color: '#9d174d' },
  { id: 'tasha',   name: 'Tasha K.',      role: 'Bev Service', reg: 15.0, ot: 0.0,  total: 15.0, status: 'pending',  initials: 'TK', color: '#166534',
    flag: '2 late clock-ins this period' },
  { id: 'sofia',   name: 'Sofia Garcia',  role: 'Box Office',  reg: 20.0, ot: 0.0,  total: 20.0, status: 'approved', initials: 'SG', color: '#0e7490' },
  { id: 'amir',    name: 'Amir Naidu',    role: 'Cleaning',    reg: 24.0, ot: 0.0,  total: 24.0, status: 'approved', initials: 'AN', color: '#475569' },
]

const FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'flagged',  label: 'Flagged' },
  { id: 'pending',  label: 'Pending' },
  { id: 'approved', label: 'Approved' },
]

export default function TimesheetsView({ data, onDemo, onToggleActivityDrawer, activityDrawerOpen }) {
  const [filter, setFilter] = useState('all')
  const buzz = () => onDemo?.()

  const visible = filter === 'all' ? ROWS : ROWS.filter(r => r.status === filter)
  const counts = ROWS.reduce((acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc }, {})
  const totalHrs = ROWS.reduce((n, r) => n + r.total, 0)
  const totalOt  = ROWS.reduce((n, r) => n + r.ot, 0)

  return (
    <section className="timesheets" aria-label="Timesheets">
      <header className="timesheets-head">
        <div>
          <h1 className="timesheets-title">Timesheets</h1>
          <p className="timesheets-sub">Apr 27 – May 3 · Levi's, Civic, Harbor</p>
        </div>
        <div className="timesheets-actions">
          <button type="button" className="timesheets-period" onClick={buzz}>
            Apr 27 – May 3, 2026 <ChevronDownIcon size={12} />
          </button>
          <button type="button" className="timesheets-btn timesheets-btn-dark" onClick={buzz}>
            <CheckIcon size={14} /> Approve all clean
          </button>
          <button
            type="button"
            className={`timesheets-icon-btn ${activityDrawerOpen ? 'is-active' : ''}`}
            onClick={onToggleActivityDrawer ?? buzz}
            aria-label={activityDrawerOpen ? 'Close activity drawer' : 'Open activity drawer'}
            aria-pressed={activityDrawerOpen ?? false}
          >
            <ListBulletIcon size={16} />
          </button>
          <button type="button" className="timesheets-icon-btn timesheets-icon-btn-ai" onClick={buzz} aria-label="Ask Teambridge">
            <TeambridgeAIIcon size={16} />
          </button>
        </div>
      </header>

      <div className="timesheets-summary">
        <div className="timesheets-summary-cell">
          <div className="timesheets-summary-label">Total hours</div>
          <div className="timesheets-summary-value">{totalHrs.toFixed(1)}</div>
        </div>
        <div className="timesheets-summary-cell">
          <div className="timesheets-summary-label">Overtime hours</div>
          <div className="timesheets-summary-value timesheets-summary-value--bad">{totalOt.toFixed(1)}</div>
        </div>
        <div className="timesheets-summary-cell">
          <div className="timesheets-summary-label">Approved</div>
          <div className="timesheets-summary-value">{counts.approved ?? 0} <span className="timesheets-summary-of">of {ROWS.length}</span></div>
        </div>
        <div className="timesheets-summary-cell">
          <div className="timesheets-summary-label">Flagged</div>
          <div className="timesheets-summary-value timesheets-summary-value--bad">{counts.flagged ?? 0}</div>
        </div>
      </div>

      <div className="timesheets-filters" role="tablist">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`timesheets-filter ${filter === f.id ? 'is-active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            {f.id !== 'all' && (
              <span className="timesheets-filter-count">{counts[f.id] ?? 0}</span>
            )}
          </button>
        ))}
      </div>

      <div className="timesheets-table" role="table">
        <div className="timesheets-table-head" role="row">
          <span className="timesheets-cell timesheets-cell-name">Employee</span>
          <span className="timesheets-cell timesheets-cell-num">Regular</span>
          <span className="timesheets-cell timesheets-cell-num">OT</span>
          <span className="timesheets-cell timesheets-cell-num">Total</span>
          <span className="timesheets-cell timesheets-cell-status">Status</span>
          <span className="timesheets-cell timesheets-cell-actions" />
        </div>
        {visible.map(r => {
          const meta = STATUS_META[r.status]
          return (
            <div key={r.id} role="row" className={`timesheets-row timesheets-row--${r.status}`}>
              <span className="timesheets-cell timesheets-cell-name">
                <span className="timesheets-avatar" style={{ background: r.color }}>{r.initials}</span>
                <span className="timesheets-name-text">
                  <span className="timesheets-name">{r.name}</span>
                  <span className="timesheets-role">{r.role}</span>
                </span>
              </span>
              <span className="timesheets-cell timesheets-cell-num">{r.reg.toFixed(1)}</span>
              <span className={`timesheets-cell timesheets-cell-num ${r.ot > 0 ? 'is-ot' : ''}`}>{r.ot.toFixed(1)}</span>
              <span className="timesheets-cell timesheets-cell-num timesheets-cell-num-strong">{r.total.toFixed(1)}</span>
              <span className="timesheets-cell timesheets-cell-status">
                <span className="timesheets-status-pill" style={{ background: meta.tint.bg, color: meta.tint.fg }}>
                  {meta.label}
                </span>
                {r.flag && (
                  <span className="timesheets-flag">
                    <AlertTriangleIcon size={11} /> {r.flag}
                  </span>
                )}
              </span>
              <span className="timesheets-cell timesheets-cell-actions">
                <button type="button" className="timesheets-row-btn" onClick={buzz}>
                  Open
                </button>
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
