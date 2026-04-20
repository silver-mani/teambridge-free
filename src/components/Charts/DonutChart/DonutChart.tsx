import { forwardRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import styles from './DonutChart.module.css';

/* ── Types ──────────────────────────────────────────────────────────────────── */
export interface DonutChartSegment {
  label: string;
  value: number;
  color?: string;
}

export type DonutLegendVariant = 'list' | 'stat';

export interface DonutChartProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  segments: DonutChartSegment[];
  innerRadius?: number;
  size?: number;
  showLegend?: boolean;
  legendVariant?: DonutLegendVariant;
  unit?: string;
  centerLabel?: string;
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const CHART_PALETTE = [
  'var(--Alloy-green-500)',
  'var(--Alloy-yellow-400)',
  'var(--Alloy-red-500)',
  'var(--Alloy-blue-500)',
  'var(--Alloy-purple-500)',
  'var(--Alloy-orange-500)',
];

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: string;
}

/* ── Component ──────────────────────────────────────────────────────────────── */
export const DonutChart = forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      segments,
      innerRadius = 60,
      size = 200,
      showLegend = true,
      legendVariant = 'list',
      unit = '%',
      centerLabel,
      className,
      ...props
    },
    ref
  ) => {
    const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, label: '', value: '' });

    const segColors = segments.map((s, i) => s.color ?? CHART_PALETTE[i % CHART_PALETTE.length]);
    const total = segments.reduce((sum, s) => sum + s.value, 0);

    /* SVG donut using stroke-dasharray technique */
    const cx = size / 2;
    const cy = size / 2;
    const strokeW = size * 0.15; // track width ~15% of size
    const r = (size - strokeW) / 2 - 2;
    const circumference = 2 * Math.PI * r;

    /* Build arcs */
    let offset = -circumference / 4; // start from top (12 o'clock)
    const arcs = segments.map((s, i) => {
      const pct = total > 0 ? s.value / total : 0;
      const arcLen = pct * circumference;
      const dashArray = `${arcLen} ${circumference - arcLen}`;
      const dashOffset = -offset;
      offset += arcLen;
      return { dashArray, dashOffset, color: segColors[i], ...s };
    });

    return (
      <div ref={ref} className={clsx(styles.root, className)} {...props}>
        <div className={styles.chartWrap}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={styles.svg}
          >
            {/* Background track */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="var(--color-border-opaque)"
              strokeWidth={strokeW}
            />
            {arcs.map((arc, i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeW}
                strokeDasharray={arc.dashArray}
                strokeDashoffset={arc.dashOffset}
                strokeLinecap="butt"
                style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={(e) => {
                  const pct = total > 0 ? Math.round((arc.value / total) * 100) : 0;
                  setTooltip({
                    visible: true,
                    x: e.clientX + 12,
                    y: e.clientY - 8,
                    label: arc.label,
                    value: `${pct}${unit}`,
                  });
                }}
                onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
              />
            ))}
            {/* Center label */}
            {centerLabel && innerRadius > 0 && (
              <text
                x={cx}
                y={cy + 6}
                textAnchor="middle"
                className={styles.centerText}
              >
                {centerLabel}
              </text>
            )}
          </svg>
        </div>

        {showLegend && legendVariant === 'stat' && (
          <div className={styles.statLegend}>
            {segments.map((s, i) => {
              const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
              return (
                <div key={s.label} className={styles.statItem}>
                  <span className={styles.statBar} style={{ background: segColors[i] }} />
                  <div className={styles.statText}>
                    <span className={styles.statValue}>{pct}{unit}</span>
                    <span className={styles.statLabel}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showLegend && legendVariant === 'list' && (
          <div className={styles.listLegend}>
            {segments.map((s, i) => {
              const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
              return (
                <div key={s.label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: segColors[i] }} />
                  <span className={styles.legendLabel}>{s.label}</span>
                  <span className={styles.legendValue}>{pct}{unit}</span>
                </div>
              );
            })}
          </div>
        )}

        {tooltip.visible && (
          <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
            <div className={styles.tooltipLabel}>{tooltip.label}</div>
            <div className={styles.tooltipValue}>{tooltip.value}</div>
          </div>
        )}
      </div>
    );
  }
);

DonutChart.displayName = 'DonutChart';
