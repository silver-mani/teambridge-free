import { forwardRef, useRef, useState, useCallback, useEffect } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import styles from './BarChart.module.css';

/* ── Types ──────────────────────────────────────────────────────────────────── */
export type BarChartVariant = 'grouped' | 'stacked' | 'horizontal';

export interface BarChartSeries {
  label: string;
  data: number[];
  color?: string;
}

export interface BarChartProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  series: BarChartSeries[];
  labels: string[];
  variant?: BarChartVariant;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  yUnit?: string;
  barRadius?: number;
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const CHART_PALETTE = [
  'var(--Alloy-blue-500)',
  'var(--Alloy-green-500)',
  'var(--Alloy-yellow-400)',
  'var(--Alloy-red-500)',
  'var(--Alloy-purple-500)',
  'var(--Alloy-orange-500)',
  'var(--Alloy-azure-500)',
  'var(--Alloy-blue-300)',
];

function niceMax(max: number): number {
  if (max === 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const residual = max / magnitude;
  if (residual <= 1) return magnitude;
  if (residual <= 2) return 2 * magnitude;
  if (residual <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function formatValue(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return String(Math.round(v));
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  items: { color: string; series: string; value: number }[];
}

/* ── Component ──────────────────────────────────────────────────────────────── */
export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      series,
      labels,
      variant = 'grouped',
      height = 260,
      showGrid = true,
      showLegend = true,
      yUnit = '',
      barRadius = 2,
      className,
      ...props
    },
    ref
  ) => {
    const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, label: '', items: [] });

    /* ── ResizeObserver: keep SVG coordinate space = actual pixel space ─── */
    const wrapRef = useRef<HTMLDivElement>(null);
    const [svgWidth, setSvgWidth] = useState(540);

    useEffect(() => {
      const el = wrapRef.current;
      if (!el) return;
      const ro = new ResizeObserver(entries => {
        const w = entries[0]?.contentRect.width;
        if (w > 0) setSvgWidth(Math.floor(w));
      });
      ro.observe(el);
      const initialW = Math.floor(el.getBoundingClientRect().width);
      if (initialW > 0) setSvgWidth(initialW);
      return () => ro.disconnect();
    }, []);

    /* ── Layout constants ─── */
    const L = 24; // left pad: enough for short y-axis labels + 8px gap
    const B = 28; // bottom pad for x-axis labels
    const T = 8;  // top pad
    const W = svgWidth;
    const H = height;
    const chartW = W - L;
    const chartH = H - B - T;
    const TICK_COUNT = 5;

    /* ── Data calculations ─── */
    const seriesColors = series.map((s, i) => s.color ?? CHART_PALETTE[i % CHART_PALETTE.length]);

    let yMax = 0;
    if (variant === 'stacked') {
      labels.forEach((_, ci) => {
        const total = series.reduce((sum, s) => sum + (s.data[ci] ?? 0), 0);
        if (total > yMax) yMax = total;
      });
    } else if (variant === 'horizontal') {
      yMax = Math.max(...(series[0]?.data ?? [0]));
    } else {
      series.forEach(s => s.data.forEach(v => { if (v > yMax) yMax = v; }));
    }
    const yNiceMax = niceMax(yMax);

    const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) =>
      yNiceMax * (i / TICK_COUNT)
    ).reverse();

    /* ── Coordinate helpers ─── */
    const toY = (value: number) =>
      T + chartH - (value / yNiceMax) * chartH;

    /* ── Vertical bar sizing ─── */
    const groupW = chartW / labels.length;
    const BAR_GAP = 3;
    const barW = variant === 'grouped'
      ? Math.max(4, (groupW - BAR_GAP * (series.length + 1)) / series.length)
      : Math.max(6, groupW * 0.55);

    const hideTooltip = () => setTooltip(t => ({ ...t, visible: false }));

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      // SVG width = svgWidth, so pixel offset maps directly to SVG units
      const svgX = e.clientX - rect.left;
      const ci = Math.floor((svgX - L) / groupW);
      if (ci < 0 || ci >= labels.length) { hideTooltip(); return; }
      const items = series.map((s, si) => ({
        color: seriesColors[si],
        series: s.label,
        value: s.data[ci] ?? 0,
      }));
      setTooltip({
        visible: true,
        x: e.clientX + 12,
        y: e.clientY - 8,
        label: labels[ci],
        items,
      });
    }, [series, labels, groupW, seriesColors, L]);

    /* ── Horizontal variant ─── */
    if (variant === 'horizontal') {
      const values: number[] = series[0]?.data ?? [];
      const hMax = niceMax(Math.max(...values, 1));
      const BAR_H = 28;
      const GAP = 10;
      const HL = 120; // category label width
      const HR = 44;  // value label width
      const hChartW = W - HL - HR;
      const hSvgH = labels.length * (BAR_H + GAP) + GAP;

      return (
        <div ref={ref} className={clsx(styles.root, className)} {...props}>
          <div ref={wrapRef} className={styles.svgWrap}>
            <svg
              width={W}
              height={hSvgH}
              viewBox={`0 0 ${W} ${hSvgH}`}
              className={styles.svg}
              onMouseLeave={hideTooltip}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const svgY = e.clientY - rect.top;
                const ci = Math.floor(svgY / (BAR_H + GAP));
                if (ci < 0 || ci >= labels.length) { hideTooltip(); return; }
                setTooltip({
                  visible: true,
                  x: e.clientX + 12,
                  y: e.clientY - 8,
                  label: labels[ci],
                  items: [{ color: seriesColors[0], series: series[0]?.label ?? '', value: values[ci] ?? 0 }],
                });
              }}
            >
              {labels.map((lbl: string, i: number) => {
                const y = GAP + i * (BAR_H + GAP);
                const value = values[i] ?? 0;
                const bw = (value / hMax) * hChartW;
                return (
                  <g key={lbl}>
                    <text x={HL - 8} y={y + BAR_H / 2 + 4} className={styles.axisLabel} textAnchor="end">
                      {lbl}
                    </text>
                    <rect x={HL} y={y} width={bw} height={BAR_H} rx={barRadius} fill={seriesColors[0]} />
                    <text x={HL + bw + 6} y={y + BAR_H / 2 + 4} className={styles.axisLabel} textAnchor="start">
                      {formatValue(value)}{yUnit}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          {tooltip.visible && (
            <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
              <div className={styles.tooltipLabel}>{tooltip.label}</div>
              {tooltip.items.map((item) => (
                <div key={item.series} className={styles.tooltipRow}>
                  <span className={styles.tooltipDot} style={{ background: item.color }} />
                  <span className={styles.tooltipSeries}>{item.series}</span>
                  <span className={styles.tooltipValue}>{formatValue(item.value)}{yUnit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    /* ── Vertical (grouped / stacked) ─── */
    return (
      <div ref={ref} className={clsx(styles.root, className)} {...props}>
        {showLegend && series.length > 1 && (
          <div className={styles.legend}>
            {series.map((s, i) => (
              <div key={s.label} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: seriesColors[i] }} />
                <span className={styles.legendLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <div ref={wrapRef} className={styles.svgWrap}>
          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            className={styles.svg}
            onMouseMove={handleMouseMove}
            onMouseLeave={hideTooltip}
          >
            {/* Grid lines + Y-axis labels */}
            {ticks.map(tick => {
              const y = toY(tick);
              return (
                <g key={tick}>
                  {showGrid && (
                    <line x1={L} y1={y} x2={W} y2={y} className={styles.gridLine} />
                  )}
                  <text x={L - 8} y={y + 4} className={styles.axisLabel} textAnchor="end">
                    {formatValue(tick)}{yUnit}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {labels.map((lbl, ci) => {
              const gx = L + ci * groupW;

              if (variant === 'stacked') {
                let cumulative = 0;
                // Find the last series with a non-zero value for this column so
                // border-radius applies to the actual topmost visible segment.
                let topIdx = -1;
                for (let i = series.length - 1; i >= 0; i--) {
                  if ((series[i].data[ci] ?? 0) > 0) { topIdx = i; break; }
                }
                return (
                  <g key={lbl}>
                    {series.map((s, si) => {
                      const value = s.data[ci] ?? 0;
                      const barH = (value / yNiceMax) * chartH;
                      const y = toY(cumulative + value);
                      cumulative += value;
                      return (
                        <rect
                          key={si}
                          x={gx + (groupW - barW) / 2}
                          y={y}
                          width={barW}
                          height={barH}
                          rx={si === topIdx ? barRadius : 0}
                          fill={seriesColors[si]}
                        />
                      );
                    })}
                    <text x={gx + groupW / 2} y={H - 6} className={styles.axisLabel} textAnchor="middle">
                      {lbl}
                    </text>
                  </g>
                );
              }

              // grouped
              const totalBarsW = series.length * barW + (series.length - 1) * BAR_GAP;
              const startX = gx + (groupW - totalBarsW) / 2;
              return (
                <g key={lbl}>
                  {series.map((s, si) => {
                    const value = s.data[ci] ?? 0;
                    const barH = (value / yNiceMax) * chartH;
                    const bx = startX + si * (barW + BAR_GAP);
                    return (
                      <rect
                        key={si}
                        x={bx}
                        y={toY(value)}
                        width={barW}
                        height={barH}
                        rx={barRadius}
                        fill={seriesColors[si]}
                      />
                    );
                  })}
                  <text x={gx + groupW / 2} y={H - 6} className={styles.axisLabel} textAnchor="middle">
                    {lbl}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Tooltip */}
        {tooltip.visible && (
          <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
            <div className={styles.tooltipLabel}>{tooltip.label}</div>
            {tooltip.items.map(item => (
              <div key={item.series} className={styles.tooltipRow}>
                <span className={styles.tooltipDot} style={{ background: item.color }} />
                <span className={styles.tooltipSeries}>{item.series}</span>
                <span className={styles.tooltipValue}>{formatValue(item.value)}{yUnit}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

BarChart.displayName = 'BarChart';
