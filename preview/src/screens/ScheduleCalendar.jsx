import { AlertTriangleIcon }   from '../../../src/components/icons/AlertTriangleIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { ChevronLeftIcon }      from '../../../src/components/icons/ChevronLeftIcon.tsx'
import { ChevronRightIcon }     from '../../../src/components/icons/ChevronRightIcon.tsx'
import { ChevronDownIcon }      from '../../../src/components/icons/ChevronDownIcon.tsx'
import { PlusIcon }             from '../../../src/components/icons/PlusIcon.tsx'
import { ListBulletIcon }       from '../../../src/components/icons/ListBulletIcon.tsx'
import { TeambridgeAIIcon }     from '../../../src/components/icons/TeambridgeAIIcon.tsx'

const DAYS = [
  { id: 'sun', label: 'Sunday' },
  { id: 'mon', label: 'Monday' },
  { id: 'tue', label: 'Tuesday' },
  { id: 'wed', label: 'Wednesday' },
  { id: 'thu', label: 'Thursday' },
  { id: 'fri', label: 'Friday' },
  { id: 'sat', label: 'Saturday' },
]

/* `demoToast` is a callback prop so the Calendar component doesn't need to
   know about the parent toast helper — parent wires it up. */
export default function ScheduleCalendar({ data, onDemo }) {
  const schedule = data.schedule
  if (!schedule) return null
  const { weekLabel, todayId, rows } = schedule
  const buzz = () => onDemo?.()

  return (
    <section className="schedule" aria-label="Schedule">
      <header className="schedule-head">
        <h1 className="schedule-title">Schedule</h1>
        <div className="schedule-head-actions">
          <button type="button" className="schedule-btn" onClick={buzz}>
            <PlusIcon size={14} /> New shift
          </button>
          <button type="button" className="schedule-btn schedule-btn-dark" onClick={buzz}>
            Publish all <ArrowNarrowRightIcon size={14} />
          </button>
          <button type="button" className="schedule-icon-btn" onClick={buzz} aria-label="Open menu">
            <ListBulletIcon size={16} />
          </button>
          <button type="button" className="schedule-icon-btn schedule-icon-btn-ai" onClick={buzz} aria-label="Ask Teambridge">
            <TeambridgeAIIcon size={16} />
          </button>
        </div>
      </header>

      <div className="schedule-toolbar">
        <button type="button" className="schedule-filter" onClick={buzz}>
          Group by: <b>User</b> <ChevronDownIcon size={12} />
        </button>
        <button type="button" className="schedule-filter" onClick={buzz}>
          Week view <ChevronDownIcon size={12} />
        </button>
        <button type="button" className="schedule-filter" onClick={buzz}>
          <PlusIcon size={12} /> Filter
        </button>
        <div className="schedule-toolbar-spacer" />
        <button type="button" className="schedule-filter" onClick={buzz}>
          <span className="schedule-filter-dot" aria-hidden="true" /> Color coding <ChevronDownIcon size={12} />
        </button>
        <button type="button" className="schedule-filter" onClick={buzz}>
          Columns <ChevronDownIcon size={12} />
        </button>
      </div>

      <div className="schedule-daybar">
        <button type="button" className="schedule-daybar-btn" onClick={buzz}>Today</button>
        <button type="button" className="schedule-daybar-icon" onClick={buzz} aria-label="Previous week"><ChevronLeftIcon size={14} /></button>
        <button type="button" className="schedule-daybar-icon" onClick={buzz} aria-label="Next week"><ChevronRightIcon size={14} /></button>
        <span className="schedule-range">{weekLabel}</span>
        <div className="schedule-toolbar-spacer" />
        <button type="button" className="schedule-daybar-icon" onClick={buzz} aria-label="Search">
          <SearchGlyph />
        </button>
        <span className="schedule-counter schedule-counter-alert"><AlertTriangleIcon size={12} /> 1</span>
        <span className="schedule-counter schedule-counter-warn">2</span>
        <span className="schedule-counter">5</span>
        <button type="button" className="schedule-daybar-icon" onClick={buzz} aria-label="Jump forward">
          <ChevronRightIcon size={14} />
        </button>
      </div>

      <div className="schedule-grid" role="grid">
        <div className="schedule-grid-head">
          <div className="schedule-grid-head-cell schedule-grid-head-user" />
          {DAYS.map(d => (
            <div key={d.id} className={`schedule-grid-head-cell ${d.id === todayId ? 'is-today' : ''}`}>
              {d.label}
            </div>
          ))}
        </div>
        {rows.map(row => (
          <div key={row.userId} className="schedule-grid-row">
            <div className="schedule-user">
              <span className="schedule-user-avatar" style={row.avatar ? { backgroundImage: `url(${row.avatar})` } : undefined} aria-hidden="true">
                {!row.avatar && row.name.split(' ').map(p => p[0]).join('').slice(0, 2)}
              </span>
              <div className="schedule-user-text">
                <div className="schedule-user-name">{row.name}</div>
                <div className="schedule-user-meta">est {row.estPay}, {row.estHours}</div>
              </div>
            </div>
            {DAYS.map(d => (
              <div key={d.id} className={`schedule-cell ${d.id === todayId ? 'is-today' : ''}`}>
                {row.shifts[d.id] && <ShiftCell shift={row.shifts[d.id]} onClick={buzz} />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

function ShiftCell({ shift, onClick }) {
  return (
    <button type="button" className={`schedule-shift schedule-shift-${shift.status}`} onClick={onClick}>
      <div className="schedule-shift-time">{shift.start}-{shift.end}</div>
      <div className="schedule-shift-body">
        <span className="schedule-shift-role">{shift.role}</span>
        {shift.venue && <span className="schedule-shift-venue">{shift.venue}</span>}
      </div>
    </button>
  )
}

function SearchGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
