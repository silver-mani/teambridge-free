import { forwardRef, useRef, useState, useCallback, useEffect } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import styles from './LineChart.module.css';

/* ── Types ──────────────────────────────────────────────────────────────────── */
export interface LineChartSeries {
  label: string;
  data: number[];
  color?: string;
  area?: boolean;
}

export interface LineChartProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  series: LineChartSeries[];
  labels: string[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  smooth?: boolean;
  yUnit?: string;
  yTickCount?: number;
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const CHART_PALETTE = [
  'var(--Alloy-blue-500)',
  'var(--Alloy-green-500)',
  'var(--Alloy-yellow-400)',
  'var(--Alloy-red-500)',
  'var(--Alloy-purple-500)',
  'var(--Alloy-orange-500)',
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

function smoothPath(points: [number, number][], tension = 0.35): string {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const dx = (x1 - x0) * tension;
    d += ` C ${x0 + dx} ${y0}, ${x1 - dx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

function linePath(points: [number, number][]): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  items: { color: string; series: string; value: number }[];
}

/* ── Component ──────────────────────────────────────────────────────────────── */
export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(
  (
    {
      series,
      labels,
      height = 260,
      showGrid = true,
      showLegend = true,
      smooth = true,
      yUnit = '',
      yTickCount = 5,
      className,
      ...props
    },
    ref
  ) => {
    const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, label: '', items: [] });

    /* ── ResizeObserver ─── */
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

    const L = 52;
    const B = 28;
    const T = 8;
    const W = svgWidth;
    const H = height;
    const chartW = W - L;
    const chartH = H - B - T;

    const seriesColors = series.map((s, i) => s.color ?? CHART_PALETTE[i % CHART_PALETTE.length]);

    const allValues = series.flatMap(s => s.data);
    const yMax = niceMax(Math.max(...allValues, 1));

    const ticks = Array.from({ length: yTickCount + 1 }, (_, i) =>
      yMax * (i / yTickCount)
    ).reverse();

    const toY = (v: number) => T + chartH - (v / yMax) * chartH;
    const toX = (i: number) =>
      labels.length > 1
        ? L + (i / (labels.length - 1)) * chartW
        : L + chartW / 2;

    const getPoints = (data: number[]): [number, number][] =>
      data.map((v, i) => [toX(i), toY(v)]);

    const hideTooltip = () => setTooltip(t => ({ ...t, visible: false }));

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const svgX = e.clientX - rect.left;
      const relX = svgX - L;
      const step = chartW / Math.max(labels.length - 1, 1);
      const ci = Math.round(relX / step);
      const clampedCi = Math.max(0, Math.min(ci, labels.length - 1));
      const items = series.map((s, si) => ({
        color: seriesColors[si],
        series: s.label,
        value: s.data[clampedCi] ?? 0,
      }));
      setTooltip({
        visible: true,
        x: e.clientX + 12,
        y: e.clientY - 8,
        label: labels[clampedCi],
        items,
      });
    }, [series, labels, seriesColors, chartW, L]);

    return (
      <div ref={ref} className={clsx(styles.root, className)} {...props}>
        {showLegend && series.length > 0 && (
          <div className={styles.legend}>
            {series.map((s, i) => (
              <div key={s.label} className={styles.legendItem}>
                <span className={styles.legendLine} style={{ background: seriesColors[i] }} />
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
            <defs>
              {series.map((s, si) =>
                s.area ? (
                  <linearGradient key={si} id={`area-grad-${si}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={seriesColors[si]} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={seriesColors[si]} stopOpacity="0.02" />
                  </linearGradient>
                ) : null
              )}
            </defs>

            {/* Grid lines */}
            {ticks.map(tick => {
              const y = toY(tick);
              return (
                <g key={tick}>
                  {showGrid && (
                    <line x1={L} y1={y} x2={W} y2={y} className={styles.gridLine} />
                  )}
                  <text x={L - 6} y={y + 4} className={styles.axisLabel} textAnchor="end">
                    {formatValue(tick)}{yUnit}
                  </text>
                </g>
              );
            })}

            {/* Area fills (behind lines) */}
            {series.map((s, si) => {
              if (!s.area) return null;
              const pts = getPoints(s.data);
              const pathD = smooth ? smoothPath(pts) : linePath(pts);
              const bottomY = T + chartH;
              const areaD = `${pathD} L ${pts[pts.length - 1][0]} ${bottomY} L ${pts[0][0]} ${bottomY} Z`;
              return (
                <path key={si} d={areaD} fill={`url(#area-grad-${si})`} />
              );
            })}

            {/* Lines */}
            {series.map((s, si) => {
              const pts = getPoints(s.data);
              const pathD = smooth ? smoothPath(pts) : linePath(pts);
              return (
                <path
                  key={si}
                  d={pathD}
                  fill="none"
                  stroke={seriesColors[si]}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Dots */}
            {series.map((s, si) =>
              getPoints(s.data).map(([x, y], ci) => (
                <circle key={`${si}-${ci}`} cx={x} cy={y} r={3} fill={seriesColors[si]} />
              ))
            )}

            {/* X-axis labels */}
            {labels.map((lbl, i) => (
              <text key={lbl} x={toX(i)} y={H - 6} className={styles.axisLabel} textAnchor="middle">
                {lbl}
              </text>
            ))}
          </svg>
        </div>

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

LineChart.displayName = 'LineChart';
