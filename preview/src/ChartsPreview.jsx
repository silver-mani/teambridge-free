/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Charts Preview
   Shows all chart types with their ChartCard wrappers, multiple variants,
   and dark mode demonstration panels.
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useIsMobile } from './useIsMobile.js'
import {
  ChartCard,
  BarChart,
  LineChart,
  DonutChart,
  HeatMap,
} from '../../src/index.ts'

/* ── Sample data ──────────────────────────────────────────────────────────────── */

// Shift Hours (stacked bar): regular + overtime per day
const SHIFT_LABELS = ['Jan 15', 'Jan 16', 'Jan 17', 'Jan 18', 'Jan 19', 'Jan 20', 'Jan 21']
const SHIFT_SERIES = [
  { label: 'Regular hours', data: [159, 192, 146, 205, 230, 211, 237], color: 'var(--Alloy-green-500)' },
  { label: 'Overtime hours', data: [53, 45, 75, 32, 19, 38, 12], color: 'var(--Alloy-yellow-400)' },
]

// Fill Rate (vertical grouped bars)
const FILL_LABELS = ['12/12', '12/13', '12/14', '12/15', '12/16', '12/17', '12/18']
const FILL_SERIES = [
  { label: 'Filled', data: [1750, 1100, 1620, 1200, 1750, 400, 400], color: 'var(--Alloy-blue-500)' },
]

// Multi-series line (fill rate over time — two locations)
const LINE_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const LINE_SERIES = [
  { label: 'New York', data: [820, 932, 901, 934, 1290, 1330, 1320], area: true },
  { label: 'Chicago', data: [620, 732, 701, 734, 990, 1030, 1120], area: true },
]

// Risk distribution donut
const RISK_SEGMENTS = [
  { label: 'Low', value: 60, color: 'var(--Alloy-green-500)' },
  { label: 'Medium', value: 28, color: 'var(--Alloy-yellow-400)' },
  { label: 'High', value: 12, color: 'var(--Alloy-red-500)' },
]

// Horizontal bar — overtime by location
const OVERTIME_LABELS = ['Brooklyn Center', 'Austin North', 'Chicago West', 'Denver Central', 'Seattle South']
const OVERTIME_SERIES = [
  { label: 'Overtime %', data: [65, 72, 73, 78, 82], color: 'var(--Alloy-blue-500)' },
]

// Coverage heatmap (schedule coverage: 0=green, 0.5=yellow, 1=red)
const HEATMAP_COLS = ['12', '13', '14', '15', '16', '17', '18']
const HEATMAP_ROWS = ['12a', '2a', '6a', '8a', '12P', '2P', '4P', '6P', '8P', '8P', '10P']
const HEATMAP_MATRIX = [
  [0.5, 0.1, 0.5, 0.1, 0.1, 0.5, 1.0],
  [0.5, 0.1, 0.1, 0.1, 1.0, 0.1, 0.5],
  [0.1, 0.1, 0.1, 1.0, 0.1, 0.1, 0.1],
  [0.1, 0.1, 0.1, 0.1, 0.1, 1.0, 0.1],
  [0.1, 0.1, 0.1, 1.0, 0.1, 0.5, 0.1],
  [0.5, 0.1, 0.5, 0.5, 0.1, 0.1, 1.0],
  [1.0, 0.1, 0.1, 0.1, 0.5, 0.1, 0.1],
  [0.5, 0.1, 0.5, 0.5, 0.1, 0.1, 1.0],
  [0.1, 0.1, 0.1, 0.1, 0.1, 1.0, 0.1],
  [1.0, 0.1, 0.1, 0.1, 0.5, 0.1, 0.1],
  [1.0, 0.1, 0.1, 0.1, 0.5, 0.1, 0.1],
]
const HEATMAP_CELLS = HEATMAP_ROWS.flatMap((row, ri) =>
  HEATMAP_COLS.map((col, ci) => ({
    row,
    col,
    value: HEATMAP_MATRIX[ri][ci],
  }))
)

/* ── Section helpers ──────────────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-weight-semibold)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--color-content-disabled)',
        marginBottom: 16,
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

/* ── Grid layout ─────────────────────────────────────────────────────────────── */
function Grid({ children, cols = 2, isMobile }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : `repeat(${cols}, 1fr)`,
      gap: isMobile ? 'var(--space-3)' : 'var(--space-4)',
    }}>
      {children}
    </div>
  )
}

/* ── Preview page ─────────────────────────────────────────────────────────────── */
export default function ChartsPreview() {
  const isMobile = useIsMobile()
  const [activeSection, setActiveSection] = useState('bar')

  const NAV = [
    { id: 'bar', label: 'Bar Chart' },
    { id: 'line', label: 'Line Chart' },
    { id: 'donut', label: 'Donut / Pie' },
    { id: 'heatmap', label: 'Heat Map' },
    { id: 'horizontal', label: 'Horizontal Bar' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh' }}>
      {/* Inner sub-nav */}
      <div style={{
        width: isMobile ? '100%' : 160,
        flexShrink: 0,
        padding: '24px 12px',
        borderRight: isMobile ? 'none' : '1px solid var(--color-border-opaque)',
        borderBottom: isMobile ? '1px solid var(--color-border-opaque)' : 'none',
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-weight-medium)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-content-disabled)',
          padding: '0 8px',
          marginBottom: 8,
          display: 'block',
        }}>Charts</span>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '7px 10px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeSection === item.id ? 'var(--color-bg-tertiary)' : 'transparent',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: activeSection === item.id ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
              color: activeSection === item.id ? 'var(--color-content-primary)' : 'var(--color-content-tertiary)',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: isMobile ? '24px 16px' : '40px 48px', maxWidth: 1100, overflowY: 'auto' }}>

        {/* ─── BAR CHART ─── */}
        {activeSection === 'bar' && (
          <>
            <Section title="Stacked Bar Chart">
              <ChartCard
                title="Shift Hours"
                subtitle="Daily Regular hours vs Overtime hours"
              >
                <BarChart
                  series={SHIFT_SERIES}
                  labels={SHIFT_LABELS}
                  variant="stacked"
                  height={280}
                  showLegend
                />
              </ChartCard>
            </Section>

            <Section title="Grouped Bar Chart">
              <Grid isMobile={isMobile}>
                <ChartCard title="Fill Rate" subtitle="Dec. 12 – Dec. 18, 2025">
                  <BarChart series={FILL_SERIES} labels={FILL_LABELS} variant="grouped" height={220} yUnit="k" />
                </ChartCard>
                <ChartCard title="Multi-Series Comparison" subtitle="Two locations">
                  <BarChart
                    series={[
                      { label: 'New York', data: [820, 932, 901, 934, 1290, 1330, 1320] },
                      { label: 'Chicago', data: [620, 732, 701, 734, 990, 1030, 1120] },
                    ]}
                    labels={LINE_LABELS}
                    variant="grouped"
                    height={220}
                    showLegend
                  />
                </ChartCard>
              </Grid>
            </Section>
          </>
        )}

        {/* ─── LINE CHART ─── */}
        {activeSection === 'line' && (
          <>
            <Section title="Multi-Series Line (with area fill)">
              <ChartCard title="Staffing Volume" subtitle="Weekly fill count by location">
                <LineChart
                  series={LINE_SERIES}
                  labels={LINE_LABELS}
                  height={280}
                  smooth
                  showLegend
                  showGrid
                />
              </ChartCard>
            </Section>

            <Section title="Single Line">
              <Grid isMobile={isMobile}>
                <ChartCard title="Fill Rate Trend" subtitle="Dec. 12 – Dec. 18">
                  <LineChart
                    series={[{ label: 'Fill Rate', data: [1750, 1100, 1620, 1200, 1750, 400, 450], area: true }]}
                    labels={FILL_LABELS}
                    height={220}
                    smooth
                    showGrid
                  />
                </ChartCard>
                <ChartCard title="Polyline Variant" subtitle="smooth=false">
                  <LineChart
                    series={[
                      { label: 'Series A', data: [100, 340, 220, 480, 350, 500, 430] },
                      { label: 'Series B', data: [200, 180, 320, 290, 450, 380, 510] },
                    ]}
                    labels={LINE_LABELS}
                    height={220}
                    smooth={false}
                    showLegend
                    showGrid
                  />
                </ChartCard>
              </Grid>
            </Section>
          </>
        )}

        {/* ─── DONUT / PIE ─── */}
        {activeSection === 'donut' && (
          <>
            <Section title="Donut with Stat Legend">
              <Grid isMobile={isMobile}>
                <ChartCard title="Risk Distribution" subtitle="Dec. 12 – Dec. 18, 2025">
                  <DonutChart
                    segments={RISK_SEGMENTS}
                    innerRadius={60}
                    size={188}
                    legendVariant="stat"
                    showLegend
                  />
                </ChartCard>
              </Grid>
            </Section>

            <Section title="Pie Chart (innerRadius=0) + List Legend">
              <Grid isMobile={isMobile}>
                <ChartCard title="Shift Type Mix" subtitle="Current week">
                  <DonutChart
                    segments={[
                      { label: 'Day shift', value: 45 },
                      { label: 'Evening', value: 30 },
                      { label: 'Night', value: 25 },
                    ]}
                    innerRadius={0}
                    size={180}
                    legendVariant="list"
                    showLegend
                  />
                </ChartCard>
                <ChartCard title="Location Split" subtitle="5 locations">
                  <DonutChart
                    segments={[
                      { label: 'New York', value: 34 },
                      { label: 'Chicago', value: 22 },
                      { label: 'Denver', value: 18 },
                      { label: 'Seattle', value: 15 },
                      { label: 'Other', value: 11 },
                    ]}
                    innerRadius={50}
                    size={180}
                    legendVariant="list"
                    showLegend
                  />
                </ChartCard>
              </Grid>
            </Section>
          </>
        )}

        {/* ─── HEATMAP ─── */}
        {activeSection === 'heatmap' && (
          <>
            <Section title="Coverage Heatmap (Green / Yellow / Red)">
              <ChartCard
                title="Coverage Heatmap"
                subtitle="Dec. 12, 2025 – Dec. 18, 2025"
              >
                <HeatMap
                  cells={HEATMAP_CELLS}
                  rows={HEATMAP_ROWS}
                  cols={HEATMAP_COLS}
                  cellRadius={4}
                  cellGap={6}
                  showTooltip
                />
              </ChartCard>
            </Section>

            <Section title="Custom color scale">
              <ChartCard title="Intensity Map" subtitle="Blue scale">
                <HeatMap
                  cells={HEATMAP_CELLS}
                  rows={HEATMAP_ROWS}
                  cols={HEATMAP_COLS}
                  colorScale={(v) => {
                    if (v < 0.33) return 'var(--Alloy-blue-100)'
                    if (v < 0.66) return 'var(--Alloy-blue-300)'
                    return 'var(--Alloy-blue-500)'
                  }}
                  cellRadius={4}
                  cellGap={6}
                />
              </ChartCard>
            </Section>
          </>
        )}

        {/* ─── HORIZONTAL BAR ─── */}
        {activeSection === 'horizontal' && (
          <>
            <Section title="Horizontal Bar Chart">
              <ChartCard
                title="Overtime %"
                subtitle="By Location"
              >
                <BarChart
                  series={OVERTIME_SERIES}
                  labels={OVERTIME_LABELS}
                  variant="horizontal"
                  yUnit="%"
                />
              </ChartCard>
            </Section>

            <Section title="Horizontal with multiple colors">
              <ChartCard title="Performance by Region" subtitle="Q4 2025">
                <BarChart
                  series={[{
                    label: 'Score',
                    data: [88, 74, 91, 63, 82, 77],
                    color: 'var(--Alloy-purple-500)',
                  }]}
                  labels={['Northeast', 'Southeast', 'Midwest', 'Southwest', 'Northwest', 'Central']}
                  variant="horizontal"
                  yUnit="%"
                />
              </ChartCard>
            </Section>
          </>
        )}

      </div>
    </div>
  )
}
