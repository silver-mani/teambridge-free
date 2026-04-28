import { useState } from 'react'
import { AlertTriangleIcon }   from '../../../src/components/icons/AlertTriangleIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { ChevronLeftIcon }      from '../../../src/components/icons/ChevronLeftIcon.tsx'
import { ChevronRightIcon }     from '../../../src/components/icons/ChevronRightIcon.tsx'
import { ChevronDownIcon }      from '../../../src/components/icons/ChevronDownIcon.tsx'
import { PlusIcon }             from '../../../src/components/icons/PlusIcon.tsx'
import { ListBulletIcon }       from '../../../src/components/icons/ListBulletIcon.tsx'
import { TeambridgeAIIcon }     from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { BarChart02Icon }       from '../../../src/components/icons/BarChart02Icon.tsx'

/* Mon → Sun ordering. The schedule data keys shifts by these ids; we
   compute the actual calendar dates at render time so the calendar
   always shows the week the user is currently in. */
const DAYS = [
  { id: 'mon', label: 'Monday' },
  { id: 'tue', label: 'Tuesday' },
  { id: 'wed', label: 'Wednesday' },
  { id: 'thu', label: 'Thursday' },
  { id: 'fri', label: 'Friday' },
  { id: 'sat', label: 'Saturday' },
  { id: 'sun', label: 'Sunday' },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* Returns the current Monday → Sunday week as an array of 7 Date objects
   plus a `todayId` matching one of the DAYS ids and a formatted weekLabel. */
function getCurrentWeek(today = new Date()) {
  const dow = today.getDay() // 0 = Sun … 6 = Sat
  const offsetToMonday = dow === 0 ? -6 : 1 - dow
  const monday = new Date(today)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(today.getDate() + offsetToMonday)

  const dates = DAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const todayId = DAYS[(dow === 0 ? 6 : dow - 1)].id
  const fmt = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`
  const weekLabel = `${fmt(dates[0])} – ${fmt(dates[6])}, ${dates[6].getFullYear()}, PDT`

  return { dates, todayId, weekLabel }
}

/* ──────────────────────────────────────────────────────────────────────
 * OT-focused stats for the drawer. Cells run Mon → Sun and reconcile
 * with the Sage dashboard narrative: $15.2k OT this week, ~230 OT hrs
 * distributed across the week with the Niners-game spike on Sat/Sun.
 * ────────────────────────────────────────────────────────────────────── */
const STATS_ROWS = [
  {
    label: 'Overtime % of Total Hours',
    cells: [
      { value: '5%' },
      { value: '12%' },
      { value: '18%' },
      { value: '24%', tone: 'warn' },
      { value: '32%', tone: 'warn' },
      { value: '48%', tone: 'bad'  },
      { value: '62%', tone: 'bad'  },
    ],
  },
  {
    label: 'Overtime vs Budgeted Hours',
    cells: [
      { value: '2 / 10',  chip: '−80%',  tone: 'ok'   },
      { value: '4 / 10',  chip: '−60%',  tone: 'ok'   },
      { value: '8 / 10',  chip: '−20%',  tone: 'ok'   },
      { value: '14 / 10', chip: '+40%',  tone: 'warn' },
      { value: '22 / 10', chip: '+120%', tone: 'bad'  },
      { value: '38 / 10', chip: '+280%', tone: 'bad'  },
      { value: '56 / 10', chip: '+460%', tone: 'bad'  },
    ],
  },
  {
    label: 'Overtime Hours',
    suffix: 'hr',
    cells: [
      { value: '2'  },
      { value: '4'  },
      { value: '8'  },
      { value: '14', tone: 'warn' },
      { value: '22', tone: 'bad'  },
      { value: '38', tone: 'bad'  },
      { value: '56', tone: 'bad'  },
    ],
  },
  {
    label: 'Overtime Costs',
    suffix: '$',
    cells: [
      { value: '$300'  },
      { value: '$500'  },
      { value: '$900'  },
      { value: '$1.4k', tone: 'warn' },
      { value: '$2.2k', tone: 'bad'  },
      { value: '$4.2k', tone: 'bad'  },
      { value: '$5.7k', tone: 'bad'  },
    ],
  },
]

const STATS_TABS = [
  { id: 'stats',    label: 'Stats',          icon: true  },
  { id: 'needs',    label: 'Needs & Coverage' },
  { id: 'demand',   label: 'Demand Ratio'  },
]

/* `demoToast` is a callback prop so the Calendar component doesn't need to
   know about the parent toast helper — parent wires it up. */
export default function ScheduleCalendar({ data, onDemo }) {
  const schedule = data.schedule
  const [statsOpen, setStatsOpen] = useState(true)
  const [statsTab,  setStatsTab]  = useState('stats')
  if (!schedule) return null
  // Dummy shifts in the data are keyed by weekday id (sun, mon, …), so the
  // shift assignments stay valid week-to-week — we just relabel the headers
  // and the highlighted "today" column to match the actual current week.
  const { rows } = schedule
  const { dates: weekDates, todayId, weekLabel } = getCurrentWeek()
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

      <div className="schedule-canvas">
        <div className="schedule-grid" role="grid">
          <div className="schedule-grid-head">
            <div className="schedule-grid-head-cell schedule-grid-head-user" />
            {DAYS.map((d, i) => (
              <div key={d.id} className={`schedule-grid-head-cell ${d.id === todayId ? 'is-today' : ''}`}>
                <span className="schedule-grid-head-day">{d.label}</span>
                <span className="schedule-grid-head-date">{MONTHS[weekDates[i].getMonth()]} {weekDates[i].getDate()}</span>
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
      </div>

      <ScheduleStatsDrawer
        open={statsOpen}
        tab={statsTab}
        onSetTab={setStatsTab}
        onToggle={() => setStatsOpen(o => !o)}
        onConfigure={buzz}
      />
    </section>
  )
}

function ScheduleStatsDrawer({ open, tab, onSetTab, onToggle, onConfigure }) {
  return (
    <div className={`schedule-stats ${open ? '' : 'schedule-stats--collapsed'}`}>
      <div className="schedule-stats-head">
        <div className="schedule-stats-tabs">
          {STATS_TABS.map(t => (
            <button
              key={t.id}
              type="button"
              className={`schedule-stats-tab ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => onSetTab(t.id)}
            >
              {t.icon && <BarChart02Icon size={14} />}
              {t.label}
            </button>
          ))}
        </div>
        <div className="schedule-stats-actions">
          <button type="button" className="schedule-stats-config" onClick={onConfigure}>
            <ConfigGlyph /> Configure Stats
          </button>
          <button type="button" className="schedule-stats-icon" onClick={onConfigure} aria-label="More options">
            <DotsGlyph />
          </button>
          <button
            type="button"
            className="schedule-stats-icon"
            onClick={onToggle}
            aria-label={open ? 'Collapse stats' : 'Expand stats'}
          >
            <span className="schedule-stats-chevron" data-open={open}>
              <ChevronDownIcon size={14} />
            </span>
          </button>
        </div>
      </div>

      <div className="schedule-stats-content" aria-hidden={!open}>
        {tab === 'stats' ? (
          <div className="schedule-stats-body" role="table" aria-label="Schedule stats">
            {STATS_ROWS.map(row => (
              <div key={row.label} className="schedule-stats-row" role="row">
                <div className="schedule-stats-row-label" role="rowheader">{row.label}</div>
                {row.cells.map((cell, i) => (
                  <div key={i} className="schedule-stats-cell" role="cell">
                    <span className="schedule-stats-value">{cell.value}</span>
                    {cell.chip && (
                      <span className={`schedule-stats-chip schedule-stats-chip--${cell.tone ?? 'ok'}`}>
                        {cell.chip}
                      </span>
                    )}
                    {!cell.chip && cell.tone && (
                      <span className={`schedule-stats-dot schedule-stats-dot--${cell.tone}`} aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="schedule-stats-empty">
            <BarChart02Icon size={20} />
            <span>{tab === 'needs' ? 'Needs & Coverage breakdown' : 'Demand Ratio analysis'} — coming soon</span>
          </div>
        )}
      </div>
    </div>
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

function ConfigGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 6H7M21 18H7" />
      <circle cx="4" cy="6"  r="1.5" />
      <circle cx="4" cy="18" r="1.5" />
    </svg>
  )
}

function DotsGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5"  cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  )
}
