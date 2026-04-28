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
import { XIcon }                from '../../../src/components/icons/XIcon.tsx'
import { ClockIcon }            from '../../../src/components/icons/ClockIcon.tsx'
import { Map01Icon }            from '../../../src/components/icons/Map01Icon.tsx'

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
 * Policy catalog — mirrors a subset of the Policy Builder folders most
 * relevant to schedule-time enforcement (Overtime & Cap Enforcement,
 * Union Laws, Scheduling). Each entry is what gets surfaced in the
 * violation dialog when a shift trips it. Severity drives badge color:
 *   severe → red    warn → yellow.
 * ────────────────────────────────────────────────────────────────────── */
const POLICIES = {
  'ot-cap': {
    name: '40-Hour OT Cap',
    folder: 'Overtime & Cap Enforcement',
    severity: 'severe',
    Icon: ClockIcon,
    summary: "Replace shifts that would push a worker over 40 hours/week. The schedule still shows the worker, but Nova flags the offending shift for replacement.",
  },
  'daily-cap': {
    name: 'Daily 12-Hour Cap',
    folder: 'Overtime & Cap Enforcement',
    severity: 'severe',
    Icon: ClockIcon,
    summary: 'Hard stop on single shifts longer than 12 hours. Applies across all departments and venues.',
  },
  'rest-window': {
    name: 'Mandatory Rest Window',
    folder: 'Union Laws',
    severity: 'severe',
    Icon: ClockIcon,
    summary: '11-hour minimum rest between consecutive shifts. Violations are auto-blocked at publish time.',
  },
  'approaching-ot': {
    name: 'Approaching OT Cap',
    folder: 'Overtime & Cap Enforcement',
    severity: 'warn',
    Icon: AlertTriangleIcon,
    summary: 'Soft warning when a worker is projected to land between 36 and 40 hours this week. Lets ops re-balance the next shift before the OT cap actually trips.',
  },
  'travel-buffer': {
    name: 'Travel Buffer (Multi-Venue)',
    folder: 'Scheduling',
    severity: 'warn',
    Icon: Map01Icon,
    summary: 'Workers scheduled across two venues in one day must have a 90-minute travel buffer between them.',
  },
}

function parseTime(t) {
  const m = /^(\d+):(\d+)([ap])$/.exec(t)
  if (!m) return 0
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (m[3] === 'p' && h !== 12) h += 12
  if (m[3] === 'a' && h === 12) h = 0
  return h + min / 60
}

function shiftDuration(shift) {
  const s = parseTime(shift.start)
  let e = parseTime(shift.end)
  if (e <= s) e += 24 // wraps past midnight
  return e - s
}

/* Build a Map keyed by `${userId}:${dayId}` → array of { policyId, detail }.
   Run once per render off the rows + the current week's dates. */
function computeViolations(rows, weekDates) {
  const result = new Map()
  const push = (key, v) => {
    const arr = result.get(key) ?? []
    arr.push(v)
    result.set(key, arr)
  }

  rows.forEach(row => {
    const items = []
    DAYS.forEach((d, i) => {
      const s = row.shifts[d.id]
      if (!s) return
      items.push({
        dayId: d.id,
        dayIndex: i,
        date: weekDates[i],
        shift: s,
        duration: shiftDuration(s),
        startH: parseTime(s.start),
      })
    })
    if (!items.length) return

    // OT cap — flag any shift that pushes the worker's running total over 40.
    let cumul = 0
    let firstOverIdx = -1
    items.forEach((it, idx) => {
      cumul += it.duration
      if (cumul > 40) {
        if (firstOverIdx < 0) firstOverIdx = idx
        const over = (cumul - 40).toFixed(1).replace(/\.0$/, '')
        push(`${row.userId}:${it.dayId}`, {
          policyId: 'ot-cap',
          detail: `This shift puts ${row.name.split(' ')[0]} at ${cumul.toFixed(1)} hrs this week — ${over} hr over the 40-hr cap.`,
        })
      }
    })

    // Approaching-OT warn — projected weekly total lands in [36, 40].
    // Surface on the LAST scheduled shift (the one putting the worker
    // closest to the cap) so ops sees one warn, not noise.
    const weeklyTotal = cumul
    if (weeklyTotal >= 36 && weeklyTotal <= 40 && items.length) {
      const last = items[items.length - 1]
      push(`${row.userId}:${last.dayId}`, {
        policyId: 'approaching-ot',
        detail: `Projected to finish the week at ${weeklyTotal.toFixed(1)} hrs — within ${(40 - weeklyTotal).toFixed(1)} hr of the OT cap.`,
      })
    }

    // Daily 12-hour cap.
    items.forEach(it => {
      if (it.duration > 12) {
        push(`${row.userId}:${it.dayId}`, {
          policyId: 'daily-cap',
          detail: `Shift is ${it.duration.toFixed(1)} hrs long — exceeds the 12-hr single-shift cap.`,
        })
      }
    })

    // Rest window — gap < 11 hrs between the END of one shift and the
    // START of the next (consecutive in the items list, which is already
    // sorted Mon → Sun).
    for (let i = 1; i < items.length; i++) {
      const prev = items[i - 1]
      const cur  = items[i]
      const daysBetween = (cur.date.getTime() - prev.date.getTime()) / (1000 * 60 * 60 * 24)
      const prevEndAbs = prev.startH + prev.duration
      const curStartAbs = daysBetween * 24 + cur.startH
      const gap = curStartAbs - prevEndAbs
      if (gap > 0 && gap < 11) {
        push(`${row.userId}:${cur.dayId}`, {
          policyId: 'rest-window',
          detail: `Only ${gap.toFixed(1)} hrs since the previous shift — needs 11 hrs of rest.`,
        })
      }
    }

    // Travel buffer — same day, two shifts at different venues.
    const byDay = new Map()
    items.forEach(it => {
      const arr = byDay.get(it.dayId) ?? []
      arr.push(it)
      byDay.set(it.dayId, arr)
    })
    byDay.forEach(arr => {
      if (arr.length < 2) return
      const venues = new Set(arr.map(x => x.shift.venue))
      if (venues.size > 1) {
        arr.forEach(it => {
          push(`${row.userId}:${it.dayId}`, {
            policyId: 'travel-buffer',
            detail: `Two venues scheduled in one day (${[...venues].join(' → ')}). Needs a 90-min travel buffer.`,
          })
        })
      }
    })
  })

  return result
}

/* ──────────────────────────────────────────────────────────────────────
 * OT-focused stats for the drawer. Cells run Mon → Sun and are sized to
 * the actual schedule shape: Mon–Wed are quiet build-up days, Thu/Fri
 * ramp on event prep, Sat is the Niners-game peak (~178 hrs scheduled,
 * 27 shifts), and Sun is a light recovery day.
 *   Daily OT hrs:     3 / 4 / 6 / 14 / 22 / 50 / 5
 *   Weekly OT total:  ~104 hrs, ≈$14.4k — matches the Sage dashboard's
 *   "$15.2k this week" headline.
 * ────────────────────────────────────────────────────────────────────── */
const STATS_ROWS = [
  {
    label: 'Overtime % of Total Hours',
    cells: [
      { value: '5%' },
      { value: '7%' },
      { value: '8%' },
      { value: '15%', tone: 'warn' },
      { value: '24%', tone: 'warn' },
      { value: '28%', tone: 'bad'  },
      { value: '10%' },
    ],
  },
  {
    label: 'Overtime vs Budgeted Hours',
    cells: [
      { value: '3 / 10',  chip: '−70%',  tone: 'ok'   },
      { value: '4 / 10',  chip: '−60%',  tone: 'ok'   },
      { value: '6 / 10',  chip: '−40%',  tone: 'ok'   },
      { value: '14 / 10', chip: '+40%',  tone: 'warn' },
      { value: '22 / 10', chip: '+120%', tone: 'bad'  },
      { value: '50 / 10', chip: '+400%', tone: 'bad'  },
      { value: '5 / 10',  chip: '−50%',  tone: 'ok'   },
    ],
  },
  {
    label: 'Overtime Hours',
    suffix: 'hr',
    cells: [
      { value: '3'  },
      { value: '4'  },
      { value: '6'  },
      { value: '14', tone: 'warn' },
      { value: '22', tone: 'warn' },
      { value: '50', tone: 'bad'  },
      { value: '5'  },
    ],
  },
  {
    label: 'Overtime Costs',
    suffix: '$',
    cells: [
      { value: '$400'  },
      { value: '$500'  },
      { value: '$800'  },
      { value: '$1.8k', tone: 'warn' },
      { value: '$2.8k', tone: 'warn' },
      { value: '$7.4k', tone: 'bad'  },
      { value: '$700'  },
    ],
  },
]

/* ──────────────────────────────────────────────────────────────────────
 * Post-swap state — what the schedule looks like after the OT-crisis
 * scene's "Approve all swaps" completes.
 *
 * Five Saturday shifts at Levi's get released to under-cap workers,
 * shortening the original assignee's day from ~14 hrs to a clean 7-8
 * hrs. The receiving workers' shifts aren't shown explicitly (the
 * narrative says zero coverage gaps), but the over-cap workers visibly
 * drop back under 40 hrs and the stats drawer's Saturday column flips
 * from red to green.
 * ────────────────────────────────────────────────────────────────────── */
const POST_SWAP_PATCHES = {
  'diane:sat':   { start: '12:00p', end: '8:00p',  role: 'F&B',          venue: "Levi's", status: 'upcoming' },
  'carlos:sat':  { start: '4:00p',  end: '11:00p', role: 'Premium Host', venue: "Levi's", status: 'upcoming' },
  'maria-c:sat': { start: '4:00p',  end: '11:00p', role: 'Bev Service',  venue: "Levi's", status: 'upcoming' },
  'ravi:sat':    { start: '4:00p',  end: '12:00a', role: 'Security',     venue: "Levi's", status: 'upcoming' },
  'david:sat':   { start: '4:00p',  end: '11:00p', role: 'Security',     venue: "Levi's", status: 'upcoming' },
}

function applyShiftPatches(rows, patches) {
  return rows.map(row => {
    const shifts = { ...row.shifts }
    let touched = false
    Object.keys(shifts).forEach(dayId => {
      const key = `${row.userId}:${dayId}`
      if (patches[key]) {
        shifts[dayId] = { ...shifts[dayId], ...patches[key] }
        touched = true
      }
    })
    return touched ? { ...row, shifts } : row
  })
}

/* Saturday OT collapses from 50 → 8 hrs after the swap; weekday peaks
   redistribute lightly because the absorbing workers were already on
   the schedule below 40 hrs. */
const STATS_ROWS_POST_SWAP = [
  {
    label: 'Overtime % of Total Hours',
    cells: [
      { value: '5%' },
      { value: '7%' },
      { value: '8%' },
      { value: '9%' },
      { value: '13%' },
      { value: '8%' },
      { value: '8%' },
    ],
  },
  {
    label: 'Overtime vs Budgeted Hours',
    cells: [
      { value: '3 / 10',  chip: '−70%', tone: 'ok' },
      { value: '4 / 10',  chip: '−60%', tone: 'ok' },
      { value: '6 / 10',  chip: '−40%', tone: 'ok' },
      { value: '8 / 10',  chip: '−20%', tone: 'ok' },
      { value: '12 / 10', chip: '+20%', tone: 'warn' },
      { value: '8 / 10',  chip: '−20%', tone: 'ok' },
      { value: '5 / 10',  chip: '−50%', tone: 'ok' },
    ],
  },
  {
    label: 'Overtime Hours',
    suffix: 'hr',
    cells: [
      { value: '3' },
      { value: '4' },
      { value: '6' },
      { value: '8' },
      { value: '12' },
      { value: '8' },
      { value: '5' },
    ],
  },
  {
    label: 'Overtime Costs',
    suffix: '$',
    cells: [
      { value: '$400' },
      { value: '$500' },
      { value: '$800' },
      { value: '$1.0k' },
      { value: '$1.5k' },
      { value: '$1.0k' },
      { value: '$700' },
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
export default function ScheduleCalendar({ data, onDemo, onToggleActivityDrawer, activityDrawerOpen, swapsApplied = false, onBackToIntacct }) {
  const schedule = data.schedule
  const [statsOpen, setStatsOpen] = useState(true)
  const [statsTab,  setStatsTab]  = useState('stats')
  if (!schedule) return null
  // Dummy shifts in the data are keyed by weekday id (sun, mon, …), so the
  // shift assignments stay valid week-to-week — we just relabel the headers
  // and the highlighted "today" column to match the actual current week.
  // When the OT-crisis scene completes, swapsApplied flips on and we
  // patch in the shortened Saturday shifts so the over-cap workers
  // visibly land back under 40 hrs.
  const rows = swapsApplied ? applyShiftPatches(schedule.rows, POST_SWAP_PATCHES) : schedule.rows
  const { dates: weekDates, todayId, weekLabel } = getCurrentWeek()
  const buzz = () => onDemo?.()

  // Past-day shifts read as completed (or no-show, if the data flagged them
  // that way); future-day shifts are always upcoming. Today keeps whatever
  // status the data carries so a mid-day mix still looks plausible.
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)
  const dayCmp = (i) => {
    const t = weekDates[i].getTime()
    const tt = todayMidnight.getTime()
    return t < tt ? 'past' : t > tt ? 'future' : 'today'
  }
  const effectiveStatus = (rawStatus, i) => {
    const when = dayCmp(i)
    if (when === 'future') return 'upcoming'
    if (when === 'past') return rawStatus === 'no-show' ? 'no-show' : 'completed'
    return rawStatus // today
  }

  // Per-shift policy violations, keyed `userId:dayId`.
  const violations = computeViolations(rows, weekDates)
  const [violationCtx, setViolationCtx] = useState(null) // { row, dayIndex, shift, list }

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
          <button
            type="button"
            className={`schedule-icon-btn ${activityDrawerOpen ? 'is-active' : ''}`}
            onClick={onToggleActivityDrawer ?? buzz}
            aria-label={activityDrawerOpen ? 'Close activity drawer' : 'Open activity drawer'}
            aria-pressed={activityDrawerOpen ?? false}
          >
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
              {DAYS.map((d, i) => {
                const shift = row.shifts[d.id]
                const list = shift ? (violations.get(`${row.userId}:${d.id}`) ?? []) : []
                return (
                  <div key={d.id} className={`schedule-cell ${d.id === todayId ? 'is-today' : ''}`}>
                    {shift && (
                      <ShiftCell
                        shift={{ ...shift, status: effectiveStatus(shift.status, i) }}
                        violations={list}
                        onClick={buzz}
                        onShowViolations={() => setViolationCtx({
                          row, dayIndex: i, shift, list,
                        })}
                      />
                    )}
                  </div>
                )
              })}
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
        swapsApplied={swapsApplied}
        onBackToIntacct={onBackToIntacct}
      />

      {violationCtx && (
        <ViolationsDialog
          ctx={violationCtx}
          weekDates={weekDates}
          onClose={() => setViolationCtx(null)}
          onResolve={() => { buzz(); setViolationCtx(null) }}
        />
      )}
    </section>
  )
}

function ScheduleStatsDrawer({ open, tab, onSetTab, onToggle, onConfigure, swapsApplied, onBackToIntacct }) {
  const rows = swapsApplied ? STATS_ROWS_POST_SWAP : STATS_ROWS
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
          {/* When the operator came from Sage Intacct (sageMode threads
              onBackToIntacct down), give them a one-click route back —
              especially useful after the swap so they can see the OT
              numbers go green on the CFO dashboard. */}
          {onBackToIntacct && (
            <button
              type="button"
              className={`schedule-stats-config schedule-stats-back ${swapsApplied ? 'is-fixed' : ''}`}
              onClick={onBackToIntacct}
            >
              <ArrowNarrowRightIcon size={14} />
              {swapsApplied ? 'See fixed Intacct dashboard' : 'Back to Intacct dashboard'}
            </button>
          )}
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
            {rows.map(row => (
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

function shiftSeverity(violations) {
  // Highest severity wins for badge color: any severe → severe, else warn.
  return violations.some(v => POLICIES[v.policyId]?.severity === 'severe') ? 'severe' : 'warn'
}

function ShiftCell({ shift, violations = [], onClick, onShowViolations }) {
  const hasViolation = violations.length > 0
  const sev = hasViolation ? shiftSeverity(violations) : null
  return (
    <button
      type="button"
      className={`schedule-shift schedule-shift-${shift.status} ${hasViolation ? 'has-violation' : ''}`}
      onClick={onClick}
    >
      <div className="schedule-shift-time">{shift.start}-{shift.end}</div>
      <div className="schedule-shift-body">
        <span className="schedule-shift-role">{shift.role}</span>
        {shift.venue && <span className="schedule-shift-venue">{shift.venue}</span>}
      </div>
      {hasViolation && (
        <span
          className={`schedule-shift-violation-badge schedule-shift-violation-badge--${sev}`}
          role="button"
          tabIndex={0}
          aria-label={`${violations.length} polic${violations.length === 1 ? 'y' : 'ies'} violated`}
          onClick={(e) => { e.stopPropagation(); onShowViolations?.() }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onShowViolations?.() }
          }}
        >
          {violations.length}
        </span>
      )}
    </button>
  )
}

const SEVERITY_LABEL = { severe: 'Severe', warn: 'Warning' }

function ViolationsDialog({ ctx, weekDates, onClose, onResolve }) {
  const { row, dayIndex, shift, list } = ctx
  const date = weekDates[dayIndex]
  const dayName = DAYS[dayIndex].label
  const dateLabel = `${MONTHS[date.getMonth()]} ${date.getDate()}`
  // Sort violations severe-first so OT cap reads above warn-level entries.
  const ordered = [...list].sort((a, b) => {
    const sa = POLICIES[a.policyId]?.severity === 'severe' ? 0 : 1
    const sb = POLICIES[b.policyId]?.severity === 'severe' ? 0 : 1
    return sa - sb
  })
  const dialogSev = ordered.some(v => POLICIES[v.policyId]?.severity === 'severe') ? 'severe' : 'warn'

  return (
    <div className="violations-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className={`violations-dialog violations-dialog--${dialogSev}`} onClick={(e) => e.stopPropagation()}>
        <header className="violations-head">
          <div className="violations-head-text">
            <div className={`violations-head-eyebrow violations-head-eyebrow--${dialogSev}`}>
              <AlertTriangleIcon size={14} />
              {ordered.length} polic{ordered.length === 1 ? 'y' : 'ies'} {dialogSev === 'severe' ? 'broken' : 'flagged'} on this shift
            </div>
            <div className="violations-head-title">{row.name} · {dayName}, {dateLabel}</div>
            <div className="violations-head-meta">
              {shift.start}–{shift.end} · {shift.role}{shift.venue ? ` · ${shift.venue}` : ''}
            </div>
          </div>
          <button type="button" className="violations-close" aria-label="Close" onClick={onClose}>
            <XIcon size={16} />
          </button>
        </header>

        <div className="violations-body">
          {ordered.map((v, i) => {
            const def = POLICIES[v.policyId]
            if (!def) return null
            const Icon = def.Icon
            return (
              <div key={`${v.policyId}-${i}`} className={`violation-card violation-card--${def.severity}`}>
                <div className="violation-card-icon" aria-hidden="true">
                  <Icon size={16} />
                </div>
                <div className="violation-card-text">
                  <div className="violation-card-row">
                    <span className="violation-card-name">{def.name}</span>
                    <span className={`violation-card-severity violation-card-severity--${def.severity}`}>
                      {SEVERITY_LABEL[def.severity] ?? 'Info'}
                    </span>
                  </div>
                  <div className="violation-card-folder">{def.folder}</div>
                  <p className="violation-card-detail">{v.detail}</p>
                  <p className="violation-card-summary">{def.summary}</p>
                </div>
              </div>
            )
          })}
        </div>

        <footer className="violations-foot">
          <button type="button" className="violations-btn" onClick={onClose}>
            Acknowledge
          </button>
          <button type="button" className="violations-btn violations-btn--ai" onClick={onResolve}>
            <TeambridgeAIIcon size={14} />
            Resolve with Nova
          </button>
        </footer>
      </div>
    </div>
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
