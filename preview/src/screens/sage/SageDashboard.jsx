import SageShell from './SageShell.jsx'
import {
  SageKpiCard, SageWidgetCard, SageAlertCard,
} from './components.jsx'

const LOCATIONS = [
  { name: "Levi's Stadium", budget: 480_000, actual: 620_000, variance:  29 },
  { name: 'Chase Center',   budget: 520_000, actual: 510_000, variance:  -2 },
  { name: 'SAP Center',     budget: 400_000, actual: 455_000, variance:  14 },
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

const fmtCompactK = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}k`
  return `$${n}`
}

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
        {/* horizontal grid */}
        {ticks.map((t, i) => (
          <line key={i} x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)}
                stroke="#eceef0" strokeWidth="1" />
        ))}
        {/* y-axis labels */}
        {ticks.map((t, i) => (
          <text key={i} x={P.l - 8} y={y(t) + 4} fill="#9aa0a6"
                fontSize="10" textAnchor="end">{Math.round(t)}</text>
        ))}
        {/* area fill */}
        <path d={areaPath} fill="rgba(217,31,31,0.08)" />
        {/* line */}
        <path d={linePath} fill="none" stroke="#d91f1f" strokeWidth="2.25"
              strokeLinecap="round" strokeLinejoin="round" />
        {/* points */}
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

/* ───── Workforce Cost vs Budget ───── */
function WorkforceCostBudget() {
  const budget = 2_400_000
  const actual = 2_900_000
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
          <div className="sage-budget-amount">$2.4M</div>
        </div>
        <div className="sage-budget-row">
          <div className="sage-budget-label">Actual</div>
          <div className="sage-budget-track">
            <div className="sage-budget-fill sage-budget-fill--actual"
                 style={{ width: `${(actual / max) * 100}%` }} />
          </div>
          <div className="sage-budget-amount">$2.9M</div>
        </div>
      </div>
      <div className="sage-variance-chip" aria-label="Variance plus 21 percent over budget">
        <div className="sage-variance-chip-label">Variance</div>
        <div className="sage-variance-chip-value">+21%</div>
      </div>
    </div>
  )
}

/* ───── Labor Cost by Location table ───── */
function LocationTable() {
  return (
    <table className="sage-table">
      <thead>
        <tr>
          <th>Location</th>
          <th className="num">Budget</th>
          <th className="num">Actual</th>
          <th className="num">Variance</th>
        </tr>
      </thead>
      <tbody>
        {LOCATIONS.map(loc => (
          <tr key={loc.name}>
            <td>{loc.name}</td>
            <td className="num">{fmtCompactK(loc.budget)}</td>
            <td className="num">{fmtCompactK(loc.actual)}</td>
            <td className={`num ${loc.variance > 0 ? 'var-pos' : 'var-neg'}`}>
              {loc.variance > 0 ? `+${loc.variance}%` : `${loc.variance}%`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function SageDashboard({ onNavigate }) {
  return (
    <SageShell module="financials" viewLabel="CFO - Daily View" onNavigate={onNavigate}>
      <div className="sage-row sage-row--kpis">
        <SageKpiCard
          label="Revenue"
          value="$503,118"
          trend="up"
          footer="+$90,747 vs. prior month"
        />
        <SageKpiCard
          label="Net Income"
          value="$277,475"
          trend="up"
          footer="+$85,704 vs. prior month"
        />
        <SageKpiCard
          label="Expenses"
          value="$225,643"
          trend="up"
          trendIsBad
          footer="+$5,043 vs. prior month"
        />
      </div>

      <div className="sage-row">
        <SageWidgetCard title="Workforce Cost vs Budget" subtitle="Month to date">
          <WorkforceCostBudget />
        </SageWidgetCard>
      </div>

      <div className="sage-row sage-row--two">
        <SageWidgetCard title="Overtime Trend" subtitle="Hours, last 8 weeks">
          <OvertimeLineChart data={OVERTIME_SERIES} />
        </SageWidgetCard>
        <SageWidgetCard title="Labor Cost by Location" subtitle="Month to date">
          <LocationTable />
        </SageWidgetCard>
      </div>

      <div className="sage-row">
        <SageAlertCard
          title="3 Critical Workforce Risks Detected"
          items={[
            'Overtime threshold exceeded across 4 venues',
            '12 unfilled shifts this weekend',
            '5 credential compliance issues',
          ]}
          ctaLabel="Open in Sage Workforce"
          onCta={() => onNavigate && onNavigate('workforce')}
        />
      </div>
    </SageShell>
  )
}
