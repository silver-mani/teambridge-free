import SageShell from './SageShell.jsx'
import {
  SageKpiCard, SageWidgetCard, SageAlertCard,
} from './components.jsx'

/* ──────────────────────────────────────────────────────────────────────
 * Mock data — Levi's Stadium operating account, single-venue context.
 * All workforce figures roll up to the same totals so the math is
 * internally consistent:
 *   Labor budget total   = $2.4M  (sum of department budgets)
 *   Labor actual total   = $2.904M (sum of department actuals; +21% var)
 *   Net Income            = Revenue − Expenses = 8,503,118 − 7,225,643
 * ────────────────────────────────────────────────────────────────────── */

const DEPARTMENTS = [
  { name: 'Event Staff & Ushers',   budget: 720_000, actual: 912_000 },
  { name: 'Security',               budget: 480_000, actual: 568_000 },
  { name: 'F&B / Concessions',      budget: 540_000, actual: 645_000 },
  { name: 'Premium / Hospitality',  budget: 260_000, actual: 312_000 },
  { name: 'Cleaning & Janitorial',  budget: 180_000, actual: 222_000 },
  { name: 'Engineering',            budget: 150_000, actual: 158_000 },
  { name: 'Box Office & Retail',    budget:  70_000, actual:  87_000 },
]

const OVERTIME_SERIES = [
  { week: 'Wk 1', hrs: 142 },
  { week: 'Wk 2', hrs: 158 },
  { week: 'Wk 3', hrs: 171 },
  { week: 'Wk 4', hrs: 165 },
  { week: 'Wk 5', hrs: 198 },
  { week: 'Wk 6', hrs: 224 },
  { week: 'Wk 7', hrs: 247 },
  { week: 'Wk 8', hrs: 286 },
]

const OT_COST_SPARK = [22, 28, 31, 27, 38, 44, 51, 58] // $k per week, MTD trending up

const EVENT_TYPES = [
  { label: '49ers / NFL',     pct: 38, color: '#1ea54a' },
  { label: 'Concerts',        pct: 27, color: '#1170ff' },
  { label: 'Private Events',  pct: 19, color: '#a663ff' },
  { label: 'Other Events',    pct: 16, color: '#c47800' },
]

const TOP_EARNERS = [
  { name: 'Janelle Rivera',  dept: 'Event Staff',   hrs: 18.5, cost: 2_840 },
  { name: 'Marcus Thomas',   dept: 'Security',      hrs: 16.0, cost: 2_460 },
  { name: 'Diane Kim',       dept: 'F&B',           hrs: 14.5, cost: 2_120 },
  { name: 'Carlos Mendez',   dept: 'Premium',       hrs: 13.0, cost: 2_040 },
  { name: 'Priya Shah',      dept: 'Event Staff',   hrs: 12.5, cost: 1_910 },
]

const COMPLIANCE = [
  { label: 'Schedule compliance',    sub: 'Scheduled vs. clocked',          value: '96.2%', tone: 'ok'   },
  { label: 'Open shifts (next 7d)',  sub: 'Includes weekend Niners home',   value: '12',    tone: 'bad'  },
  { label: 'Credentials expiring',   sub: 'Within next 7 days',             value: '5',     tone: 'warn' },
  { label: 'Avg. fill time',         sub: 'Last 30 days',                   value: '23m',   tone: 'ok'   },
]

const fmtCompactK = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}k`
  return `$${n}`
}
const initials = (name) =>
  name.split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase()

/* ───── Inline SVG line chart ───── */
function OvertimeLineChart({ data }) {
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
        <path d={areaPath} fill="rgba(217,31,31,0.08)" />
        <path d={linePath} fill="none" stroke="#d91f1f" strokeWidth="2.25"
              strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.hrs)} r="3"
                  fill="#fff" stroke="#d91f1f" strokeWidth="2" />
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
  return (
    <svg className="sage-otcost-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={areaPath} fill="rgba(217,31,31,0.10)" />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ───── Workforce Cost vs Budget ───── */
function WorkforceCostBudget() {
  const budget = 2_400_000
  const actual = 2_904_000
  const max = Math.max(budget, actual)
  return (
    <div className="sage-budget">
      <div className="sage-budget-bars">
        <div className="sage-budget-row">
          <div className="sage-budget-label">Budget</div>
          <div className="sage-budget-track">
            <div className="sage-budget-fill sage-budget-fill--budget"
                 style={{ width: `${(budget / max) * 100}%` }} />
          </div>
          <div className="sage-budget-amount">$2.40M</div>
        </div>
        <div className="sage-budget-row">
          <div className="sage-budget-label">Actual</div>
          <div className="sage-budget-track">
            <div className="sage-budget-fill sage-budget-fill--actual"
                 style={{ width: `${(actual / max) * 100}%` }} />
          </div>
          <div className="sage-budget-amount">$2.90M</div>
        </div>
      </div>
      <div className="sage-variance-chip" aria-label="Variance plus 21 percent over budget">
        <div className="sage-variance-chip-label">Variance</div>
        <div className="sage-variance-chip-value">+21%</div>
      </div>
    </div>
  )
}

/* ───── Overtime Cost panel ───── */
function OvertimeCostPanel() {
  return (
    <div className="sage-otcost">
      <div className="sage-otcost-head">
        <div className="sage-otcost-value">$186,400</div>
        <div className="sage-otcost-pill">+29% vs. budget</div>
      </div>
      <div className="sage-otcost-meta">Month-to-date · OT budget $145,000</div>
      <Sparkline values={OT_COST_SPARK} />
      <div className="sage-otcost-grid">
        <div>
          <div className="sage-otcost-stat-label">This week</div>
          <div className="sage-otcost-stat-value">$58,200</div>
        </div>
        <div>
          <div className="sage-otcost-stat-label">vs. last month</div>
          <div className="sage-otcost-stat-value" style={{ color: '#d91f1f' }}>+18%</div>
        </div>
      </div>
    </div>
  )
}

/* ───── Department breakdown table (Levi's Stadium internal) ───── */
function DepartmentTable() {
  const maxActual = Math.max(...DEPARTMENTS.map(d => d.actual))
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
        {DEPARTMENTS.map(d => {
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
          <div className="sage-donut-center-value">42,180</div>
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

export default function SageDashboard({ onNavigate }) {
  return (
    <SageShell module="financials" viewLabel="CFO - Daily View · Levi's Stadium" onNavigate={onNavigate}>
      <div className="sage-row sage-row--kpis">
        <SageKpiCard
          label="Revenue"
          value="$8,503,118"
          trend="up"
          footer="+$890,747 vs. prior month"
        />
        <SageKpiCard
          label="Net Income"
          value="$1,277,475"
          trend="up"
          footer="+$385,704 vs. prior month"
        />
        <SageKpiCard
          label="Expenses"
          value="$7,225,643"
          trend="up"
          trendIsBad
          footer="+$505,043 vs. prior month"
        />
        <SageKpiCard
          label="Labor Cost"
          value="$2,904,000"
          trend="up"
          trendIsBad
          footer="+$485,200 vs. prior month"
        />
      </div>

      <div className="sage-row sage-row--budget">
        <SageWidgetCard title="Workforce Cost vs Budget" subtitle="Month to date · all departments">
          <WorkforceCostBudget />
        </SageWidgetCard>
        <SageWidgetCard title="Overtime Cost" subtitle="Month-to-date spend">
          <OvertimeCostPanel />
        </SageWidgetCard>
      </div>

      <div className="sage-row sage-row--two">
        <SageWidgetCard title="Overtime Trend" subtitle="Hours, last 8 weeks">
          <OvertimeLineChart data={OVERTIME_SERIES} />
        </SageWidgetCard>
        <SageWidgetCard title="Labor Cost by Department" subtitle="Month to date">
          <DepartmentTable />
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

      <div className="sage-row">
        <SageAlertCard
          title="3 Critical Workforce Risks Detected"
          items={[
            'Overtime threshold exceeded — 5 departments over OT budget',
            '12 unfilled shifts this weekend (Niners home game)',
            '5 credential compliance issues expiring within 7 days',
          ]}
          ctaLabel="Open in Sage Workforce"
          onCta={() => onNavigate && onNavigate('workforce')}
        />
      </div>
    </SageShell>
  )
}
