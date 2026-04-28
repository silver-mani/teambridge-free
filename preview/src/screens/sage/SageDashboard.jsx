import SageShell from './SageShell.jsx'
import {
  SageKpiCard, SageWidgetCard, SageAlertCard,
} from './components.jsx'

/* ──────────────────────────────────────────────────────────────────────
 * Mock data — Levi's Stadium operating account, single-venue context.
 * All workforce figures roll up to the same totals so the math is
 * internally consistent:
 *   Labor budget total   = $240k  (sum of department budgets)
 *   Labor actual total   = $320k  (sum of department actuals; +33% var)
 *   OT MTD               = $48.2k vs $14.5k budget (+232% — the crisis)
 *   Net Income           = Revenue − Expenses = 850,312 − 722,564
 * ────────────────────────────────────────────────────────────────────── */

const DEPARTMENTS = [
  { name: 'Event Staff & Ushers',   budget: 72_000, actual: 105_000 },
  { name: 'Security',               budget: 48_000, actual:  66_000 },
  { name: 'F&B / Concessions',      budget: 54_000, actual:  70_000 },
  { name: 'Premium / Hospitality',  budget: 26_000, actual:  32_500 },
  { name: 'Cleaning & Janitorial',  budget: 18_000, actual:  22_500 },
  { name: 'Engineering',            budget: 15_000, actual:  15_500 },
  { name: 'Box Office & Retail',    budget:  7_000, actual:   8_500 },
]

const OVERTIME_SERIES = [
  { week: 'Wk 1', hrs: 14 },
  { week: 'Wk 2', hrs: 16 },
  { week: 'Wk 3', hrs: 17 },
  { week: 'Wk 4', hrs: 17 },
  { week: 'Wk 5', hrs: 28 },
  { week: 'Wk 6', hrs: 41 },
  { week: 'Wk 7', hrs: 56 },
  { week: 'Wk 8', hrs: 68 },
]
const OVERTIME_SERIES_FIXED = [
  { week: 'Wk 1', hrs: 14 },
  { week: 'Wk 2', hrs: 16 },
  { week: 'Wk 3', hrs: 17 },
  { week: 'Wk 4', hrs: 17 },
  { week: 'Wk 5', hrs: 28 },
  { week: 'Wk 6', hrs: 41 },
  { week: 'Wk 7', hrs: 56 },
  { week: 'Wk 8', hrs: 22 },
]

// Weekly OT cost in $ (raw). Steady through Wk 4, then spikes hard
// from Wk 5 onward — that's the story the panel and sparkline are telling.
const OT_COST_SPARK = [2_200, 2_800, 3_100, 2_700, 5_800, 9_400, 13_200, 15_200]

const EVENT_TYPES = [
  { label: '49ers / NFL',     pct: 38, color: '#1ea54a' },
  { label: 'Concerts',        pct: 27, color: '#1170ff' },
  { label: 'Private Events',  pct: 19, color: '#a663ff' },
  { label: 'Other Events',    pct: 16, color: '#c47800' },
]

const TOP_EARNERS = [
  { name: 'Janelle Rivera',  dept: 'Event Staff',   hrs: 18.5, cost: 284 },
  { name: 'Marcus Thomas',   dept: 'Security',      hrs: 16.0, cost: 246 },
  { name: 'Diane Kim',       dept: 'F&B',           hrs: 14.5, cost: 212 },
  { name: 'Carlos Mendez',   dept: 'Premium',       hrs: 13.0, cost: 204 },
  { name: 'Priya Shah',      dept: 'Event Staff',   hrs: 12.5, cost: 191 },
]

const COMPLIANCE = [
  { label: 'Schedule compliance',    sub: 'Scheduled vs. clocked',          value: '96.2%', tone: 'ok'   },
  { label: 'Open shifts (next 7d)',  sub: 'Includes weekend Niners home',   value: '12',    tone: 'bad'  },
  { label: 'Credentials expiring',   sub: 'Within next 7 days',             value: '5',     tone: 'warn' },
  { label: 'Avg. fill time',         sub: 'Last 30 days',                   value: '23m',   tone: 'ok'   },
]

const fmtCompactK = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 100_000)   return `$${Math.round(n / 1_000)}k`
  if (n >= 1_000) {
    const k = n / 1_000
    return `$${Number.isInteger(k) ? k.toFixed(0) : k.toFixed(1)}k`
  }
  return `$${n}`
}
const initials = (name) =>
  name.split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase()

/* ───── Inline SVG line chart ───── */
function OvertimeLineChart({ data, otFixed = false }) {
  const W = 520, H = 180, P = { t: 16, r: 16, b: 28, l: 32 }
  const innerW = W - P.l - P.r
  const innerH = H - P.t - P.b
  const max = Math.max(...data.map(d => d.hrs)) * 1.1
  const min = 0
  const x = (i) => P.l + (i * innerW) / (data.length - 1)
  const y = (v) => P.t + innerH - ((v - min) / (max - min)) * innerH

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.hrs)}`).join(' ')
  const areaPath = `${linePath} L ${x(data.length - 1)} ${P.t + innerH} L ${x(0)} ${P.t + innerH} Z`

  const ticks = [0, max / 2, max]

  return (
    <div>
      <svg className="sage-line-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Overtime trend, last 8 weeks">
        {ticks.map((t, i) => (
          <line key={i} x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)}
                stroke="#eceef0" strokeWidth="1" />
        ))}
        {ticks.map((t, i) => (
          <text key={i} x={P.l - 8} y={y(t) + 4} fill="#9aa0a6"
                fontSize="10" textAnchor="end">{Math.round(t)}</text>
        ))}
        <path d={areaPath} fill={otFixed ? 'rgba(22,163,74,0.10)' : 'rgba(217,31,31,0.08)'} />
        <path d={linePath} fill="none" stroke={otFixed ? '#16a34a' : '#d91f1f'} strokeWidth="2.25"
              strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.hrs)} r="3"
                  fill="#fff" stroke={otFixed ? '#16a34a' : '#d91f1f'} strokeWidth="2" />
        ))}
      </svg>
      <div className="sage-line-chart-legend">
        {data.map(d => <span key={d.week}>{d.week}</span>)}
      </div>
    </div>
  )
}

/* ───── Inline SVG sparkline (small) ───── */
function Sparkline({ values, stroke = '#d91f1f' }) {
  const W = 240, H = 56, P = 4
  const max = Math.max(...values), min = Math.min(...values)
  const x = (i) => P + (i * (W - 2 * P)) / (values.length - 1)
  const y = (v) => H - P - ((v - min) / (max - min || 1)) * (H - 2 * P)
  const linePath = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')
  const areaPath = `${linePath} L ${x(values.length - 1)} ${H - P} L ${x(0)} ${H - P} Z`
  // Derive area fill from the line color so the sparkline tones match
  // when we flip to the green "fixed" palette.
  const areaFill = stroke === '#16a34a'
    ? 'rgba(22, 163, 74, 0.12)'
    : 'rgba(217, 31, 31, 0.10)'
  return (
    <svg className="sage-otcost-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={areaPath} fill={areaFill} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ───── Workforce Cost vs Budget ───── */
function WorkforceCostBudget({ otFixed = false }) {
  const budget = 240_000
  const actual = otFixed ? 268_000 : 320_000
  const max = Math.max(budget, actual)
  const variance = Math.round(((actual - budget) / budget) * 100)
  return (
    <div className="sage-budget">
      <div className="sage-budget-bars">
        <div className="sage-budget-row">
          <div className="sage-budget-label">Budget</div>
          <div className="sage-budget-track">
            <div className="sage-budget-fill sage-budget-fill--budget"
                 style={{ width: `${(budget / max) * 100}%` }} />
          </div>
          <div className="sage-budget-amount">$240k</div>
        </div>
        <div className="sage-budget-row">
          <div className="sage-budget-label">Actual</div>
          <div className="sage-budget-track">
            <div className={`sage-budget-fill ${otFixed ? 'sage-budget-fill--ok' : 'sage-budget-fill--actual'}`}
                 style={{ width: `${(actual / max) * 100}%` }} />
          </div>
          <div className="sage-budget-amount">{otFixed ? '$268k' : '$320k'}</div>
        </div>
      </div>
      <div className={`sage-variance-chip ${otFixed ? 'sage-variance-chip--ok' : ''}`}
           aria-label={`Variance ${variance >= 0 ? 'plus' : 'minus'} ${Math.abs(variance)} percent`}>
        <div className="sage-variance-chip-label">Variance</div>
        <div className="sage-variance-chip-value">{variance >= 0 ? '+' : ''}{variance}%</div>
      </div>
    </div>
  )
}

/* ───── Overtime Cost panel ───── */
const OT_COST_SPARK_FIXED = [2_200, 2_800, 3_100, 2_700, 5_800, 9_400, 13_200, 6_400]
function OvertimeCostPanel({ otFixed = false }) {
  return (
    <div className="sage-otcost">
      <div className="sage-otcost-head">
        <div className="sage-otcost-value">{otFixed ? '$24,500' : '$48,200'}</div>
        <div className={`sage-otcost-pill ${otFixed ? 'sage-otcost-pill--ok' : ''}`}>
          {otFixed ? '+69% vs. budget' : '+232% vs. budget'}
        </div>
      </div>
      <div className="sage-otcost-meta">Month-to-date · OT budget $14,500</div>
      <Sparkline values={otFixed ? OT_COST_SPARK_FIXED : OT_COST_SPARK} stroke={otFixed ? '#16a34a' : '#d91f1f'} />
      <div className="sage-otcost-grid">
        <div>
          <div className="sage-otcost-stat-label">This week</div>
          <div className="sage-otcost-stat-value">{otFixed ? '$6,400' : '$15,200'}</div>
        </div>
        <div>
          <div className="sage-otcost-stat-label">vs. last month</div>
          <div className="sage-otcost-stat-value" style={{ color: otFixed ? '#16a34a' : '#d91f1f' }}>
            {otFixed ? '+22%' : '+187%'}
          </div>
        </div>
      </div>
    </div>
  )
}

const DEPARTMENTS_FIXED = [
  { name: 'Event Staff & Ushers',   budget: 72_000, actual:  75_000 },
  { name: 'Security',               budget: 48_000, actual:  52_000 },
  { name: 'F&B / Concessions',      budget: 54_000, actual:  58_000 },
  { name: 'Premium / Hospitality',  budget: 26_000, actual:  28_000 },
  { name: 'Cleaning & Janitorial',  budget: 18_000, actual:  19_000 },
  { name: 'Engineering',            budget: 15_000, actual:  15_500 },
  { name: 'Box Office & Retail',    budget:  7_000, actual:   7_500 },
]

/* ───── Department breakdown table (Levi's Stadium internal) ───── */
function DepartmentTable({ otFixed = false }) {
  const rows = otFixed ? DEPARTMENTS_FIXED : DEPARTMENTS
  const maxActual = Math.max(...rows.map(d => d.actual))
  return (
    <table className="sage-dept-table">
      <thead>
        <tr>
          <th>Department</th>
          <th className="num">Budget</th>
          <th>Actual</th>
          <th className="num">Var</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(d => {
          const variance = Math.round(((d.actual - d.budget) / d.budget) * 100)
          const overBudget = d.actual > d.budget * 1.10
          return (
            <tr key={d.name}>
              <td className="dept-name">{d.name}</td>
              <td className="num">{fmtCompactK(d.budget)}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="sage-dept-bar">
                    <div className={`sage-dept-bar-fill ${overBudget ? '' : 'sage-dept-bar-fill--ok'}`}
                         style={{ width: `${(d.actual / maxActual) * 100}%` }} />
                  </div>
                  <span className="num" style={{ minWidth: 56 }}>{fmtCompactK(d.actual)}</span>
                </div>
              </td>
              <td className={`num ${overBudget ? 'sage-dept-var-pos' : 'sage-dept-var-low'}`}>
                {variance >= 0 ? `+${variance}%` : `${variance}%`}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/* ───── Donut: Hours by Event Type ───── */
function EventTypeDonut() {
  const R = 16          // small radius, viewBox 50x50
  const C = 2 * Math.PI * R
  let cumulative = 0
  return (
    <div className="sage-donut-wrap">
      <div className="sage-donut">
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r={R} fill="none" stroke="#f0f2f4" strokeWidth="8" />
          {EVENT_TYPES.map((s, i) => {
            const len = (s.pct / 100) * C
            const offset = -((cumulative / 100) * C)
            cumulative += s.pct
            return (
              <circle
                key={i}
                cx="25" cy="25" r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="8"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={offset}
              />
            )
          })}
        </svg>
        <div className="sage-donut-center">
          <div className="sage-donut-center-value">4,218</div>
          <div className="sage-donut-center-label">Hrs MTD</div>
        </div>
      </div>
      <div className="sage-donut-legend">
        {EVENT_TYPES.map(s => (
          <div className="sage-donut-legend-row" key={s.label}>
            <span className="sage-donut-swatch" style={{ background: s.color }} />
            <span className="sage-donut-legend-label">{s.label}</span>
            <span className="sage-donut-legend-value">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───── Top OT earners ───── */
function TopOvertimeEarners() {
  return (
    <div className="sage-earners">
      {TOP_EARNERS.map(e => (
        <div className="sage-earner-row" key={e.name}>
          <span className="sage-earner-avatar" aria-hidden="true">{initials(e.name)}</span>
          <div>
            <div className="sage-earner-name">{e.name}</div>
            <div className="sage-earner-meta">{e.dept}</div>
          </div>
          <div className="sage-earner-figs">
            <div className="sage-earner-hrs">{e.hrs.toFixed(1)} OT hrs</div>
            <div className="sage-earner-cost">${e.cost.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ───── Compliance snapshot ───── */
function ComplianceSnapshot() {
  return (
    <div className="sage-compliance">
      {COMPLIANCE.map(c => (
        <div className="sage-compliance-row" key={c.label}>
          <div>
            <div className="sage-compliance-label">{c.label}</div>
            <div className="sage-compliance-sub">{c.sub}</div>
          </div>
          <div className={`sage-compliance-value is-${c.tone}`}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}

export default function SageDashboard({ onNavigate, otFixed = false, onResetOTFix }) {
  return (
    <SageShell module="financials" viewLabel="CFO - Daily View · Levi's Stadium" onNavigate={onNavigate}>
      {otFixed && (
        <div className="sage-row sage-row--banner">
          <div className="sage-fix-banner" role="status">
            <span className="sage-fix-banner-pill">OT crisis resolved</span>
            <div className="sage-fix-banner-text">
              Workforce repushed the Saturday schedule —
              <strong> labor cost down $52k</strong>, overtime back inside budget,
              and the at-risk roster is clear.
            </div>
            {onResetOTFix && (
              <button type="button" className="sage-fix-banner-undo" onClick={onResetOTFix}>
                Replay scenario
              </button>
            )}
          </div>
        </div>
      )}

      <div className="sage-row sage-row--kpis">
        <SageKpiCard
          label="Revenue"
          value="$850,312"
          trend="up"
          footer="+$89,075 vs. prior month"
        />
        <SageKpiCard
          label="Net Income"
          value={otFixed ? '$179,748' : '$127,748'}
          trend="up"
          footer={otFixed ? '+$90,571 vs. prior month' : '+$38,571 vs. prior month'}
        />
        <SageKpiCard
          label="Expenses"
          value={otFixed ? '$670,564' : '$722,564'}
          trend={otFixed ? 'down' : 'up'}
          trendIsBad={!otFixed}
          footer={otFixed ? '−$1,496 vs. prior month' : '+$50,504 vs. prior month'}
        />
        <SageKpiCard
          label="Labor Cost"
          value={otFixed ? '$268,000' : '$320,000'}
          trend={otFixed ? 'down' : 'up'}
          trendIsBad={!otFixed}
          footer={otFixed ? '+$26,120 vs. prior month' : '+$78,120 vs. prior month'}
        />
      </div>

      <div className="sage-row sage-row--budget">
        <SageWidgetCard title="Workforce Cost vs Budget" subtitle="Month to date · all departments">
          <WorkforceCostBudget otFixed={otFixed} />
          <div className="sage-widget-alert-slot">
            {otFixed ? (
              <SageAlertCard
                tone="ok"
                title="All workforce risks resolved"
                items={[
                  'Overtime spend back inside budget — 7 departments cleared',
                  'Saturday Niners-game schedule fully staffed',
                  'No outstanding credential compliance flags',
                ]}
                ctaLabel="Open weekly recap"
                onCta={() => onNavigate && onNavigate('workforce')}
              />
            ) : (
              <SageAlertCard
                title="3 Critical Workforce Risks Detected"
                items={[
                  'Overtime spend +232% over budget — 7 departments affected',
                  '12 unfilled shifts this weekend (Niners home game)',
                  '5 credential compliance issues expiring within 7 days',
                ]}
                ctaLabel="Resolve OT Crisis"
                onCta={() => onNavigate && onNavigate('workforce')}
              />
            )}
          </div>
        </SageWidgetCard>
        <SageWidgetCard title="Overtime Cost" subtitle="Month-to-date spend">
          <OvertimeCostPanel otFixed={otFixed} />
        </SageWidgetCard>
      </div>

      <div className="sage-row sage-row--two">
        <SageWidgetCard title="Overtime Trend" subtitle="Hours, last 8 weeks">
          <OvertimeLineChart data={otFixed ? OVERTIME_SERIES_FIXED : OVERTIME_SERIES} otFixed={otFixed} />
        </SageWidgetCard>
        <SageWidgetCard title="Labor Cost by Department" subtitle="Month to date">
          <DepartmentTable otFixed={otFixed} />
        </SageWidgetCard>
      </div>

      <div className="sage-row sage-row--three">
        <SageWidgetCard title="Hours by Event Type" subtitle="Month to date">
          <EventTypeDonut />
        </SageWidgetCard>
        <SageWidgetCard title="Top Overtime Earners" subtitle="Last 7 days">
          <TopOvertimeEarners />
        </SageWidgetCard>
        <SageWidgetCard title="Compliance Snapshot" subtitle="Workforce health">
          <ComplianceSnapshot />
        </SageWidgetCard>
      </div>

    </SageShell>
  )
}
