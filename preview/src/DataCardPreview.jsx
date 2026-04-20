/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · DataCard Preview
   10 badge colors · ValueChangeLabel (trend + text) · light + dark
   ───────────────────────────────────────────────────────────────────────────── */

import { useIsMobile } from './useIsMobile.js'
import {
  DataCard,
  ValueChangeLabel,
  BookOpen01Icon,
  CheckCircleDashedIcon,
  CurrencyDollarIcon,
  LineChartUp02Icon,
  LineChartUp01Icon,
  Users03Icon,
  Target04Icon,
  AlertTriangleIcon,
  BarChart02Icon,
} from '../../src/index.ts';

/* ── Layout helpers ─────────────────────────────────────────────────────────── */

function Section({ title, note, dark, children, isMobile }) {
  return (
    <section style={{ background: dark ? 'var(--Alloy-slate-950)' : 'var(--color-bg-primary)', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'var(--color-border-opaque)'}`, borderRadius: 'var(--radius-xl)', padding: isMobile ? 20 : 32 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.3)' : 'var(--color-content-disabled)', margin: '0 0 4px' }}>{title}</p>
        {note && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: dark ? 'rgba(255,255,255,0.45)' : 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>{note}</p>}
      </div>
      {children}
    </section>
  );
}

/* ── Preview ─────────────────────────────────────────────────────────────────── */

export default function DataCardPreview() {
  const isMobile = useIsMobile()
  return (
    <>
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Data Display</p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-bold)', lineHeight: 'var(--line-height-tight)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Data Card</h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-content-secondary)' }}>10 badge colors · ValueChangeLabel (trend &amp; text) · light &amp; dark</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 1 — Figma reference */}
          <Section title="Figma Reference — Payroll Overview" note="Exact reproduction of the Alloy Payroll dashboard data card row" isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16 }}>
              <DataCard
                color="green"
                icon={<BookOpen01Icon size={24} />}
                label="Open Pay Period"
                value="2"
              />
              <DataCard
                color="yellow"
                icon={<CheckCircleDashedIcon size={24} />}
                label="Pending Approvals"
                value="4"
              />
              <DataCard
                color="matcha"
                icon={<CurrencyDollarIcon size={24} />}
                label="Total Gross Pay (Current Period)"
                value="$248,400"
              />
              <DataCard
                color="purple"
                icon={<LineChartUp02Icon size={24} />}
                label="Instant Pay Usage"
                value="$18,200"
                change={<ValueChangeLabel mode="text" value="6% of payroll" severity="positive" />}
              />
            </div>
          </Section>

          {/* 2 — All 10 badge color variants */}
          <Section title="Badge Colors" note="All 10 Alloy semantic color variants — background uses -tertiary bg, icon uses -secondary content token" isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 12 }}>
              {[
                { color: 'green',  icon: <BookOpen01Icon size={24} />,        label: 'Green',  value: '42' },
                { color: 'yellow', icon: <CheckCircleDashedIcon size={24} />, label: 'Yellow', value: '18' },
                { color: 'matcha', icon: <CurrencyDollarIcon size={24} />,    label: 'Matcha', value: '$1.2M' },
                { color: 'purple', icon: <LineChartUp02Icon size={24} />,     label: 'Purple', value: '94%' },
                { color: 'blue',   icon: <BarChart02Icon size={24} />,        label: 'Blue',   value: '310' },
                { color: 'azure',  icon: <Target04Icon size={24} />,          label: 'Azure',  value: '7' },
                { color: 'red',    icon: <AlertTriangleIcon size={24} />,     label: 'Red',    value: '3' },
                { color: 'orange', icon: <LineChartUp01Icon size={24} />,     label: 'Orange', value: '56%' },
                { color: 'pink',   icon: <Users03Icon size={24} />,           label: 'Pink',   value: '128' },
                { color: 'slate',  icon: <BarChart02Icon size={24} />,        label: 'Slate',  value: '99' },
              ].map(({ color, icon, label, value }) => (
                <DataCard key={color} color={color} icon={icon} label={label} value={value} />
              ))}
            </div>
          </Section>

          {/* 3 — ValueChangeLabel: Trend mode */}
          <Section title="Value Change Label — Trend" note="Arrow icon + text. Arrow direction and color derived from trend (up = green, down = red). Override with severity prop." isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
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
                icon={<CheckCircleDashedIcon size={24} />}
                label="Pending Tasks"
                value="17"
                change={<ValueChangeLabel mode="trend" value="3" trend="down" severity="warning" />}
              />
              <DataCard
                color="blue"
                icon={<BarChart02Icon size={24} />}
                label="Active Users"
                value="4,821"
                change={<ValueChangeLabel mode="trend" value="8%" trend="down" />}
              />
            </div>
          </Section>

          {/* 4 — ValueChangeLabel: Text mode */}
          <Section title="Value Change Label — Text" note="Text-only label. Color based on severity: positive (green) · warning (yellow) · negative (red)." isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
              <DataCard
                color="green"
                icon={<LineChartUp02Icon size={24} />}
                label="NPS Score"
                value="74"
                change={<ValueChangeLabel mode="text" value="On track" severity="positive" />}
              />
              <DataCard
                color="yellow"
                icon={<CheckCircleDashedIcon size={24} />}
                label="Pending Reviews"
                value="12"
                change={<ValueChangeLabel mode="text" value="Review needed" severity="warning" />}
              />
              <DataCard
                color="red"
                icon={<AlertTriangleIcon size={24} />}
                label="Failed Payments"
                value="7"
                change={<ValueChangeLabel mode="text" value="Overdue" severity="negative" />}
              />
              <DataCard
                color="purple"
                icon={<Target04Icon size={24} />}
                label="Goal Progress"
                value="68%"
                change={<ValueChangeLabel mode="text" value="Near target" severity="positive" />}
              />
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — DataCard + ValueChangeLabel v2</span>
        </div>

      </div>
    </>
  );
}
