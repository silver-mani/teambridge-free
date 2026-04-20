/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · ValueChangeLabel Preview
   trend & text modes · in table cells, chart cards, data cards · light + dark
   ───────────────────────────────────────────────────────────────────────────── */

import { useIsMobile } from './useIsMobile.js'
import {
  ValueChangeLabel,
  DataCard,
  CurrencyDollarIcon,
  LineChartUp02Icon,
  Users03Icon,
  AlertTriangleIcon,
  BarChart02Icon,
  Target04Icon,
} from '../../src/index.ts';
import '../../src/styles/tokens.css';

const DARK_VARS = {
  '--color-bg-primary':         'var(--Alloy-slate-950)',
  '--color-bg-secondary':       'var(--Alloy-slate-900)',
  '--color-bg-tertiary':        'var(--Alloy-slate-800)',
  '--color-content-primary':    'var(--Alloy-white)',
  '--color-content-secondary':  'var(--Alloy-slate-200)',
  '--color-content-tertiary':   'var(--Alloy-slate-400)',
  '--color-content-disabled':   'var(--Alloy-slate-600)',
  '--color-border-opaque':      'var(--Alloy-slate-700)',
  '--color-border-transparent': 'rgba(255,255,255,0.08)',
  '--color-success-content':    'var(--Alloy-green-400)',
  '--color-warning-content':    'var(--Alloy-yellow-400)',
  '--color-error-content':      'var(--Alloy-red-400)',
};

/* ── Shell helpers ──────────────────────────────────────────────────────────── */

function Section({ title, subtitle, children, isMobile }) {
  return (
    <div style={{ background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', padding: isMobile ? '20px' : '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-tertiary)', marginBottom: '4px' }}>{title}</p>
        {subtitle && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)' }}>{children}</span>;
}

/* ── Table cell component ─────────────────────────────────────────────────────
   Lightweight table used to show ValueChangeLabel in numeric data rows       */

const TABLE_DATA = [
  { metric: 'Monthly Revenue',  value: '$124,800', change: '8.4%',  trend: 'up',   severity: undefined },
  { metric: 'New Signups',      value: '1,204',    change: '22%',   trend: 'up',   severity: undefined },
  { metric: 'Churn Rate',       value: '2.1%',     change: '0.3%',  trend: 'up',   severity: 'negative' },
  { metric: 'Avg Session Time', value: '4m 12s',   change: '18%',   trend: 'down', severity: 'warning' },
  { metric: 'Support Tickets',  value: '34',       change: '12%',   trend: 'down', severity: undefined },
  { metric: 'NPS Score',        value: '71',       change: '5pts',  trend: 'up',   severity: undefined },
];

function MetricTable({ dark }) {
  const th = {
    fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
    color: 'var(--color-content-tertiary)', padding: '0 16px 10px',
    textAlign: 'left', borderBottom: '1px solid var(--color-border-opaque)',
  };
  const td = {
    fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
    color: 'var(--color-content-primary)', padding: '12px 16px',
    borderBottom: '1px solid var(--color-border-opaque)',
  };
  const tdNum = { ...td, fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-medium)' };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={th}>Metric</th>
          <th style={{ ...th, textAlign: 'right' }}>Value</th>
          <th style={{ ...th, textAlign: 'right' }}>vs Last Month</th>
        </tr>
      </thead>
      <tbody>
        {TABLE_DATA.map(({ metric, value, change, trend, severity }) => (
          <tr key={metric}>
            <td style={td}>{metric}</td>
            <td style={{ ...tdNum, textAlign: 'right' }}>{value}</td>
            <td style={{ ...tdNum, textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ValueChangeLabel
                  mode="trend"
                  value={change}
                  trend={trend}
                  severity={severity}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Chart card component ─────────────────────────────────────────────────────
   Minimal chart card shell that shows the label below the headline metric    */

function ChartCard({ title, value, change, trend, severity, mode = 'trend', children }) {
  return (
    <div style={{
      background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-opaque)',
      borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)' }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-content-primary)' }}>{value}</span>
          {mode === 'trend'
            ? <ValueChangeLabel mode="trend" value={change} trend={trend} severity={severity} />
            : <ValueChangeLabel mode="text" value={change} severity={severity} />}
        </div>
      </div>
      {/* Sparkline placeholder */}
      {children}
    </div>
  );
}

function Sparkline({ color, points }) {
  const w = 160, h = 40;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const min = Math.min(...points), max = Math.max(...points);
  const ys = points.map(p => h - ((p - min) / (max - min || 1)) * (h - 6) - 3);
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Preview ─────────────────────────────────────────────────────────────────── */

export default function ValueChangeLabelPreview() {
  const isMobile = useIsMobile()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-tertiary)', marginBottom: '8px' }}>
          DATA DISPLAY
        </p>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-content-primary)', lineHeight: 'var(--line-height-tight)', marginBottom: '12px' }}>
          Value Change Label
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', color: 'var(--color-content-secondary)' }}>
          trend (arrow + value) &amp; text (severity) · in tables, chart cards, and data cards · light &amp; dark
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* All variants reference */}
        <Section title="ALL VARIANTS" subtitle="Trend mode: value + arrow, color from direction. Text mode: value only, color from severity." isMobile={isMobile}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <Label>mode="trend"</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24, marginTop: '10px', flexWrap: 'wrap' }}>
                <ValueChangeLabel mode="trend" value="12%" trend="up" />
                <ValueChangeLabel mode="trend" value="8.4%" trend="up" severity="positive" />
                <ValueChangeLabel mode="trend" value="0.3%" trend="up" severity="negative" />
                <ValueChangeLabel mode="trend" value="5%" trend="up" severity="warning" />
                <ValueChangeLabel mode="trend" value="3.2%" trend="down" />
                <ValueChangeLabel mode="trend" value="18%" trend="down" severity="warning" />
                <ValueChangeLabel mode="trend" value="7%" trend="down" severity="positive" />
              </div>
            </div>
            <div>
              <Label>mode="text"</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24, marginTop: '10px', flexWrap: 'wrap' }}>
                <ValueChangeLabel mode="text" value="On track" severity="positive" />
                <ValueChangeLabel mode="text" value="Review needed" severity="warning" />
                <ValueChangeLabel mode="text" value="Overdue" severity="negative" />
                <ValueChangeLabel mode="text" value="6% of payroll" severity="positive" />
                <ValueChangeLabel mode="text" value="Near limit" severity="warning" />
                <ValueChangeLabel mode="text" value="Critical" severity="negative" />
              </div>
            </div>
          </div>
        </Section>

        {/* In a table */}
        <Section title="IN A TABLE" subtitle="Right-aligned in the change column — tabular-nums value, trend arrow after." isMobile={isMobile}>
          <MetricTable />
        </Section>

        {/* In chart cards */}
        <Section title="IN CHART CARDS" subtitle="Trend label sits inline with the headline metric below the card title." isMobile={isMobile}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
            <ChartCard title="Total Revenue" value="$1.4M" change="12%" trend="up">
              <Sparkline color="var(--color-success-content)" points={[40, 55, 48, 62, 70, 65, 80, 88, 95]} />
            </ChartCard>
            <ChartCard title="Churn Rate" value="2.1%" change="0.3%" trend="up" severity="negative">
              <Sparkline color="var(--color-error-content)" points={[30, 28, 35, 32, 38, 34, 40, 38, 42]} />
            </ChartCard>
            <ChartCard title="Avg Session" value="4m 12s" change="18%" trend="down" severity="warning">
              <Sparkline color="var(--color-warning-content)" points={[80, 75, 78, 70, 65, 68, 60, 58, 54]} />
            </ChartCard>
            <ChartCard title="NPS Score" value="71" change="On track" mode="text" severity="positive">
              <Sparkline color="var(--color-success-content)" points={[60, 63, 61, 65, 68, 66, 70, 69, 71]} />
            </ChartCard>
            <ChartCard title="Support Tickets" value="34" change="Review needed" mode="text" severity="warning">
              <Sparkline color="var(--color-warning-content)" points={[20, 22, 25, 28, 30, 27, 32, 34, 34]} />
            </ChartCard>
            <ChartCard title="Failed Payments" value="7" change="Critical" mode="text" severity="negative">
              <Sparkline color="var(--color-error-content)" points={[2, 2, 3, 3, 4, 5, 5, 6, 7]} />
            </ChartCard>
          </div>
        </Section>

        {/* In data cards */}
        <Section title="IN DATA CARDS" subtitle="change prop on DataCard — ValueChangeLabel sits beside the headline value." isMobile={isMobile}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
            <DataCard
              color="green"
              icon={<CurrencyDollarIcon size={24} />}
              label="Revenue"
              value="$1.4M"
              change={<ValueChangeLabel mode="trend" value="12%" trend="up" />}
            />
            <DataCard
              color="red"
              icon={<AlertTriangleIcon size={24} />}
              label="Churn Rate"
              value="3.2%"
              change={<ValueChangeLabel mode="trend" value="0.4%" trend="up" severity="negative" />}
            />
            <DataCard
              color="yellow"
              icon={<Target04Icon size={24} />}
              label="Pending Reviews"
              value="12"
              change={<ValueChangeLabel mode="text" value="Review needed" severity="warning" />}
            />
            <DataCard
              color="blue"
              icon={<BarChart02Icon size={24} />}
              label="Active Users"
              value="4,821"
              change={<ValueChangeLabel mode="trend" value="8%" trend="down" severity="positive" />}
            />
          </div>
        </Section>

        {/* Dark mode */}
        <div className="dark" style={{ ...DARK_VARS }}>
          <Section title="DARK MODE" isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Trend row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24, flexWrap: 'wrap' }}>
                <ValueChangeLabel mode="trend" value="12%" trend="up" />
                <ValueChangeLabel mode="trend" value="0.3%" trend="up" severity="negative" />
                <ValueChangeLabel mode="trend" value="18%" trend="down" severity="warning" />
                <ValueChangeLabel mode="trend" value="3.2%" trend="down" />
                <ValueChangeLabel mode="text" value="On track" severity="positive" />
                <ValueChangeLabel mode="text" value="Review needed" severity="warning" />
                <ValueChangeLabel mode="text" value="Critical" severity="negative" />
              </div>
              {/* Data cards in dark */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
                <DataCard color="green" icon={<CurrencyDollarIcon size={24} />} label="Revenue" value="$1.4M"
                  change={<ValueChangeLabel mode="trend" value="12%" trend="up" />} />
                <DataCard color="red" icon={<AlertTriangleIcon size={24} />} label="Churn" value="2.1%"
                  change={<ValueChangeLabel mode="trend" value="0.3%" trend="up" severity="negative" />} />
                <DataCard color="yellow" icon={<Target04Icon size={24} />} label="Pending" value="12"
                  change={<ValueChangeLabel mode="text" value="Review needed" severity="warning" />} />
                <DataCard color="blue" icon={<BarChart02Icon size={24} />} label="Users" value="4,821"
                  change={<ValueChangeLabel mode="trend" value="8%" trend="down" severity="positive" />} />
              </div>
            </div>
          </Section>
        </div>

      </div>
    </div>
  );
}
