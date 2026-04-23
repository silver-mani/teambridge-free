import { useMemo } from 'react'
import { ChevronDownIcon }      from '../../../src/components/icons/ChevronDownIcon.tsx'
import { ChevronRightIcon }     from '../../../src/components/icons/ChevronRightIcon.tsx'
import { ListBulletIcon }       from '../../../src/components/icons/ListBulletIcon.tsx'
import { Grid01Icon }           from '../../../src/components/icons/Grid01Icon.tsx'
import { TeambridgeAIIcon }     from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { ArrowUpRightIcon }     from '../../../src/components/icons/ArrowUpRightIcon.tsx'
import { PlusIcon }             from '../../../src/components/icons/PlusIcon.tsx'
import { CurrencyDollarCircleIcon } from '../../../src/components/icons/CurrencyDollarCircleIcon.tsx'
import { BookOpen01Icon }       from '../../../src/components/icons/BookOpen01Icon.tsx'
import { CheckCircleDashedIcon }from '../../../src/components/icons/CheckCircleDashedIcon.tsx'
import { LineChartUp01Icon }    from '../../../src/components/icons/LineChartUp01Icon.tsx'
import { File04Icon }           from '../../../src/components/icons/File04Icon.tsx'
import {
  getPayPeople, getPayPeriods, getPayDashboard, getPeriodSummary, getUserPeriod,
  PERIOD_STATUS_META, fmt, fmtCompact,
} from '../data/payData.js'

/* PayView is a controlled tri-screen experience: dashboard → pay period →
   individual user. Sub-screen state is owned by the parent (Act1Dashboard)
   so the surrounding chat panel can reignite briefings when the user drills
   down, without PayView needing to know the chat exists. */
export default function PayView({ industryId, route = { screen: 'home' }, onChangeRoute, onDemo }) {
  const buzz = () => onDemo?.()
  const setRoute = (next) => onChangeRoute?.(next)

  if (route.screen === 'user') {
    return (
      <PayUserScreen
        industryId={industryId}
        periodId={route.periodId}
        personId={route.personId}
        onBack={(periodId) => setRoute({ screen: 'period', periodId })}
        onHome={() => setRoute({ screen: 'home' })}
        onDemo={buzz}
      />
    )
  }
  if (route.screen === 'period') {
    return (
      <PayPeriodScreen
        industryId={industryId}
        periodId={route.periodId}
        onBack={() => setRoute({ screen: 'home' })}
        onSelectUser={(personId) => setRoute({ screen: 'user', periodId: route.periodId, personId })}
        onDemo={buzz}
      />
    )
  }
  return (
    <PayHomeScreen
      industryId={industryId}
      onSelectPeriod={(periodId) => setRoute({ screen: 'period', periodId })}
      onDemo={buzz}
    />
  )
}

/* ─── Pay Home ──────────────────────────────────────────────────────────── */

function PayHomeScreen({ industryId, onSelectPeriod, onDemo }) {
  const dash = useMemo(() => getPayDashboard(industryId), [industryId])
  const buzz = () => onDemo?.()

  return (
    <section className="pay" aria-label="Pay">
      <header className="pay-head">
        <h1 className="pay-title">Dashboard</h1>
        <div className="pay-head-actions">
          <button type="button" className="pay-icon-btn" onClick={buzz} aria-label="Open menu">
            <ListBulletIcon size={16} />
          </button>
          <button type="button" className="pay-icon-btn pay-icon-btn-ai" onClick={buzz} aria-label="Ask Teambridge">
            <TeambridgeAIIcon size={16} />
          </button>
        </div>
      </header>

      <div className="pay-stats">
        <PayStatCard
          tone="matcha"
          label="Open Pay Period"
          value={String(dash.cards.openPeriods)}
          Icon={BookOpen01Icon}
        />
        <PayStatCard
          tone="warning"
          label="Pending Approvals"
          value={String(dash.cards.pendingApprovals)}
          Icon={CheckCircleDashedIcon}
        />
        <PayStatCard
          tone="success"
          label="Total Gross Pay (Current Period)"
          value={fmtCompact(dash.cards.currentGross)}
          Icon={CurrencyDollarCircleIcon}
        />
        <PayStatCard
          tone="info"
          label="Instant Pay Usage"
          value={fmtCompact(dash.cards.currentInstantPay)}
          suffix={<span className="pay-stat-suffix">{dash.cards.instantPayPct}%</span>}
          Icon={LineChartUp01Icon}
        />
      </div>

      <div className="pay-divider" aria-hidden="true" />

      <div className="pay-subhead">
        <h2 className="pay-subtitle">Open Pay Periods</h2>
      </div>

      <div className="pay-search" role="search">
        <SearchGlyph />
        <input type="text" placeholder="Search…" onClick={buzz} onChange={() => {}} />
      </div>

      <div className="pay-table" role="table">
        <div className="pay-table-head pay-table-head--home" role="row">
          <button type="button" className="pay-th" onClick={buzz}>Pay Period <ChevronDownIcon size={12} /></button>
          <button type="button" className="pay-th" onClick={buzz}>Workers <ChevronDownIcon size={12} /></button>
          <button type="button" className="pay-th" onClick={buzz}>Instant Pay Used ($) <ChevronDownIcon size={12} /></button>
          <button type="button" className="pay-th" onClick={buzz}>Total Gross ($) <ChevronDownIcon size={12} /></button>
          <button type="button" className="pay-th" onClick={buzz}>Pending Approval <ChevronDownIcon size={12} /></button>
          <button type="button" className="pay-th" onClick={buzz}>Status <ChevronDownIcon size={12} /></button>
        </div>
        {dash.openPeriods.map(({ period, totals }) => {
          const meta = PERIOD_STATUS_META[period.status]
          return (
            <button
              key={period.id}
              type="button"
              className="pay-row pay-row--home"
              role="row"
              onClick={() => onSelectPeriod(period.id)}
            >
              <div className="pay-cell pay-cell-strong">{period.short}</div>
              <div className="pay-cell">{totals.workers}</div>
              <div className="pay-cell pay-cell-num">{fmtPlain(totals.totalInstantPay)}</div>
              <div className="pay-cell pay-cell-num">{fmtPlain(totals.totalGross)}</div>
              <div className="pay-cell">{totals.pendingApproval}</div>
              <div className="pay-cell">
                <StatusPill tone={meta.tone} label={meta.label} />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* ─── Pay Period detail ─────────────────────────────────────────────────── */

function PayPeriodScreen({ industryId, periodId, onBack, onSelectUser, onDemo }) {
  const summary = useMemo(() => getPeriodSummary(industryId, periodId), [industryId, periodId])
  const meta = PERIOD_STATUS_META[summary.period.status]
  const buzz = () => onDemo?.()

  return (
    <section className="pay" aria-label="Pay period">
      <Breadcrumbs
        items={[
          { label: 'Pay Periods', onClick: onBack },
          { label: summary.period.short },
        ]}
      />

      <header className="pay-head">
        <div className="pay-head-titlewrap">
          <h1 className="pay-title">{summary.period.short}</h1>
          <StatusPill tone={meta.tone} label={meta.label} />
        </div>
        <button type="button" className="pay-btn pay-btn-dark" onClick={buzz}>
          <ArrowUpRightIcon size={14} /> Export Pay Period
        </button>
      </header>

      <div className="pay-summary">
        <PaySummaryCell label="Total Gross Pay"     value={fmt(summary.totals.totalGross)} />
        <PaySummaryCell label="Adjustments"          value={`+${fmt(summary.totals.totalAdjustments)}`} badge={String(summary.totals.adjustmentsCount)} />
        <PaySummaryCell label="Instant Pay Issued"   value={fmt(summary.totals.totalInstantPay)} />
        <PaySummaryCell label="Est. Taxes"           value={fmt(summary.totals.estTaxes)} />
        <PaySummaryCell label="Total"                value={fmt(summary.totals.total)} strong />
      </div>

      <div className="pay-toolbar">
        <button type="button" className="pay-filter" onClick={buzz}>
          <CalendarGlyph /> <span className="pay-filter-placeholder">Select date range…</span> <ChevronDownIcon size={12} />
        </button>
        <button type="button" className="pay-filter" onClick={buzz}>
          Group by: <b>User</b> <ChevronDownIcon size={12} />
        </button>
        <button type="button" className="pay-filter pay-filter-icon" onClick={buzz} aria-label="Filter">
          <FilterGlyph />
        </button>
        <div className="pay-viewtoggle">
          <button type="button" className="pay-viewtoggle-btn is-active" onClick={buzz} aria-label="List view">
            <ListBulletIcon size={14} />
          </button>
          <button type="button" className="pay-viewtoggle-btn" onClick={buzz} aria-label="Grid view">
            <Grid01Icon size={14} />
          </button>
        </div>
      </div>

      <div className="pay-tabs" role="tablist">
        {['All', 'Pending', 'Submitted', 'Approved', 'Rejected'].map((t, i) => (
          <button key={t} type="button" className={`pay-tab ${i === 0 ? 'is-active' : ''}`} onClick={buzz} role="tab">
            {t}
          </button>
        ))}
      </div>

      <div className="pay-table" role="table">
        <div className="pay-table-head pay-table-head--period" role="row">
          <button type="button" className="pay-th" onClick={buzz}>Name <ChevronDownIcon size={12} /></button>
          <button type="button" className="pay-th" onClick={buzz}>Gross ($) <ChevronDownIcon size={12} /></button>
          <button type="button" className="pay-th" onClick={buzz}>Instant Pay ($) <ChevronDownIcon size={12} /></button>
          <button type="button" className="pay-th" onClick={buzz}>Net ($) <ChevronDownIcon size={12} /></button>
          <button type="button" className="pay-th" onClick={buzz}>Adjustments ($) <ChevronDownIcon size={12} /></button>
          <button type="button" className="pay-th" onClick={buzz}>Status <ChevronDownIcon size={12} /></button>
        </div>
        {summary.rows.map(row => {
          const m = PERIOD_STATUS_META[row.status]
          return (
            <button
              key={row.person.id}
              type="button"
              className="pay-row pay-row--period"
              role="row"
              onClick={() => onSelectUser(row.person.id)}
            >
              <div className="pay-cell pay-cell-person">
                <span className="pay-avatar" style={{ backgroundImage: `url(${row.person.avatar})` }} aria-hidden="true" />
                <span className="pay-name">{row.person.name}</span>
              </div>
              <div className="pay-cell pay-cell-num">{fmt(row.gross)}</div>
              <div className="pay-cell pay-cell-num">{fmt(row.instantPay)}</div>
              <div className="pay-cell pay-cell-num">{fmt(row.net)}</div>
              <div className="pay-cell pay-cell-num">
                {row.adjustmentsTotal === 0
                  ? fmt(0)
                  : (row.adjustmentsTotal > 0 ? `+${fmt(row.adjustmentsTotal)}` : fmt(row.adjustmentsTotal))}
              </div>
              <div className="pay-cell">
                <StatusPill tone={m.tone} label={m.label} />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* ─── User-within-period detail ─────────────────────────────────────────── */

function PayUserScreen({ industryId, periodId, personId, onBack, onHome, onDemo }) {
  const detail = useMemo(
    () => getUserPeriod(industryId, periodId, personId),
    [industryId, periodId, personId],
  )
  const { period, person, breakdown, shifts, timeOff } = detail
  const buzz = () => onDemo?.()

  return (
    <section className="pay" aria-label="User pay period">
      <Breadcrumbs
        items={[
          { label: 'Pay Periods', onClick: onHome },
          { label: period.short, onClick: () => onBack(periodId) },
          { label: person.name },
        ]}
      />

      <div className="pay-user-card">
        <div className="pay-user-card-head">
          <div className="pay-user-card-id">
            <span className="pay-user-avatar-lg" style={{ backgroundImage: `url(${person.avatar})` }} aria-hidden="true" />
            <div>
              <div className="pay-user-card-name">{person.name}</div>
              <div className="pay-user-card-meta">
                Gross: {fmt(breakdown.gross)} · Net Pay: {fmt(breakdown.net)}
              </div>
            </div>
          </div>
          <div className="pay-user-card-actions">
            <button type="button" className="pay-icon-btn" onClick={buzz} aria-label="Open shift">
              <ArrowUpRightIcon size={14} />
            </button>
            <button type="button" className="pay-icon-btn" onClick={buzz} aria-label="Print">
              <PrintGlyph />
            </button>
            <button type="button" className="pay-btn pay-btn-dark" onClick={buzz}>
              Export <DownloadGlyph />
            </button>
          </div>
        </div>

        <div className="pay-user-breakdown">
          <BreakdownCell label="Regular"          value={fmt(breakdown.regular)}  hours={`${breakdown.regularHours}.00 hrs`} />
          <BreakdownCell label="Overtime"         value={fmt(breakdown.overtime)} hours={`${breakdown.otHours}.00 hrs`} />
          <BreakdownCell label="Double Overtime"  value={fmt(breakdown.doubleOt)} hours={`${breakdown.dotHours}.00 hrs`} />
          <BreakdownCell label="Holiday"          value={fmt(breakdown.holiday)}  hours={breakdown.holidayHours ? `${breakdown.holidayHours}.00 hrs` : undefined} />
          <BreakdownCell
            label="Total"
            value={fmt(breakdown.gross)}
            hours={`${(breakdown.regularHours + breakdown.otHours + breakdown.dotHours + breakdown.holidayHours).toFixed(2)} hrs`}
            strong
          />
        </div>
      </div>

      <div className="pay-section">
        <div className="pay-section-head">
          <h2 className="pay-section-title">Shifts</h2>
          <div className="pay-section-actions">
            <button type="button" className="pay-icon-btn" onClick={buzz} aria-label="Filter columns">
              <ColumnsGlyph />
            </button>
            <button type="button" className="pay-btn" onClick={buzz}>
              <PlusIcon size={12} /> Shift
            </button>
          </div>
        </div>
        <div className="pay-table" role="table">
          <div className="pay-table-head pay-table-head--shifts" role="row">
            <button type="button" className="pay-th" onClick={buzz}>Date <ChevronDownIcon size={12} /></button>
            <button type="button" className="pay-th" onClick={buzz}>Hours <ChevronDownIcon size={12} /></button>
            <button type="button" className="pay-th" onClick={buzz}>Rate <ChevronDownIcon size={12} /></button>
            <button type="button" className="pay-th" onClick={buzz}>Gross <ChevronDownIcon size={12} /></button>
            <button type="button" className="pay-th" onClick={buzz}>Paid <ChevronDownIcon size={12} /></button>
            <button type="button" className="pay-th" onClick={buzz}>Billed <ChevronDownIcon size={12} /></button>
          </div>
          {shifts.map(s => (
            <button key={s.id} type="button" className="pay-row pay-row--shifts" role="row" onClick={buzz}>
              <div className="pay-cell pay-cell-strong">{s.date}</div>
              <div className="pay-cell pay-cell-num">{s.hours.toFixed(2)}</div>
              <div className="pay-cell pay-cell-num">{fmt(s.rate)}</div>
              <div className="pay-cell pay-cell-num">{fmt(s.gross)}</div>
              <div className="pay-cell"><YesNoPill yes={s.paid} /></div>
              <div className="pay-cell"><YesNoPill yes={s.billed} /></div>
            </button>
          ))}
        </div>
      </div>

      <div className="pay-section">
        <div className="pay-section-head">
          <h2 className="pay-section-title">Time Off</h2>
          <div className="pay-section-actions">
            <button type="button" className="pay-icon-btn" onClick={buzz} aria-label="Filter columns">
              <ColumnsGlyph />
            </button>
            <button type="button" className="pay-btn" onClick={buzz}>
              <PlusIcon size={12} /> Time Off
            </button>
          </div>
        </div>
        {timeOff.length === 0 ? (
          <div className="pay-empty">
            <File04Icon size={18} />
            <span>No time off requested in this period.</span>
          </div>
        ) : (
          <div className="pay-table" role="table">
            <div className="pay-table-head pay-table-head--pto" role="row">
              <button type="button" className="pay-th" onClick={buzz}>Requested by <ChevronDownIcon size={12} /></button>
              <button type="button" className="pay-th" onClick={buzz}>Type <ChevronDownIcon size={12} /></button>
              <button type="button" className="pay-th" onClick={buzz}>Hours <ChevronDownIcon size={12} /></button>
              <button type="button" className="pay-th" onClick={buzz}>Gross <ChevronDownIcon size={12} /></button>
              <button type="button" className="pay-th" onClick={buzz}>End Time <ChevronDownIcon size={12} /></button>
              <button type="button" className="pay-th" onClick={buzz}>Paid <ChevronDownIcon size={12} /></button>
              <button type="button" className="pay-th" onClick={buzz}>Billed <ChevronDownIcon size={12} /></button>
            </div>
            {timeOff.map(t => (
              <button key={t.id} type="button" className="pay-row pay-row--pto" role="row" onClick={buzz}>
                <div className="pay-cell pay-cell-strong">{t.requestedBy}</div>
                <div className="pay-cell">{t.type}</div>
                <div className="pay-cell pay-cell-num">{t.hours.toFixed(2)}</div>
                <div className="pay-cell pay-cell-num">{fmt(t.gross)}</div>
                <div className="pay-cell">{t.endTime}</div>
                <div className="pay-cell"><YesNoPill yes={t.paid} /></div>
                <div className="pay-cell"><YesNoPill yes={t.billed} /></div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function PayStatCard({ tone, label, value, suffix, Icon }) {
  return (
    <div className={`pay-stat pay-stat-${tone}`}>
      <div className="pay-stat-icon" aria-hidden="true">
        <Icon size={18} />
      </div>
      <div className="pay-stat-text">
        <div className="pay-stat-label">{label}</div>
        <div className="pay-stat-valuewrap">
          <span className="pay-stat-value">{value}</span>
          {suffix}
        </div>
      </div>
    </div>
  )
}

function PaySummaryCell({ label, value, badge, strong = false }) {
  return (
    <div className={`pay-summary-cell ${strong ? 'is-strong' : ''}`}>
      <div className="pay-summary-cell-label">{label}</div>
      <div className="pay-summary-cell-value">
        <span>{value}</span>
        {badge && <span className="pay-summary-cell-badge">{badge}</span>}
      </div>
    </div>
  )
}

function BreakdownCell({ label, value, hours, strong = false }) {
  return (
    <div className={`pay-user-breakdown-cell ${strong ? 'is-strong' : ''}`}>
      <div className="pay-user-breakdown-label">{label}</div>
      <div className="pay-user-breakdown-row">
        <span className="pay-user-breakdown-value">{value}</span>
        {hours && <span className="pay-user-breakdown-hours">{hours}</span>}
      </div>
    </div>
  )
}

function StatusPill({ tone, label }) {
  return (
    <span className={`pay-status pay-status-${tone}`}>
      <span className="pay-status-dot" aria-hidden="true" />
      {label}
    </span>
  )
}

function YesNoPill({ yes }) {
  return (
    <span className={`pay-yesno pay-yesno-${yes ? 'yes' : 'no'}`}>{yes ? 'Yes' : 'No'}</span>
  )
}

function Breadcrumbs({ items }) {
  return (
    <nav className="pay-breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <span key={i} className="pay-breadcrumbs-item">
            {item.onClick && !last ? (
              <button type="button" className="pay-breadcrumbs-link" onClick={item.onClick}>
                {item.label}
              </button>
            ) : (
              <span className={last ? 'pay-breadcrumbs-current' : 'pay-breadcrumbs-link'}>
                {item.label}
              </span>
            )}
            {!last && <span className="pay-breadcrumbs-sep" aria-hidden="true">/</span>}
          </span>
        )
      })}
    </nav>
  )
}

/* ─── Inline glyphs (kept here so PayView is a single drop-in file) ─────── */

function fmtPlain(amount) {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function SearchGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function FilterGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function CalendarGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function ColumnsGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function PrintGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function DownloadGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
