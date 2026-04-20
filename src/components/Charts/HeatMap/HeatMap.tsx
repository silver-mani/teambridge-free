import { forwardRef, useRef, useState, useEffect } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import styles from './HeatMap.module.css';

/* ── Types ──────────────────────────────────────────────────────────────────── */
export interface HeatMapCell {
  row: string;
  col: string;
  value: number; // 0–1 normalized
  label?: string;
}

export interface HeatMapProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  cells: HeatMapCell[];
  rows: string[];
  cols: string[];
  colorScale?: (value: number) => string;
  cellRadius?: number;
  cellGap?: number;
  showTooltip?: boolean;
}

/* ── Default color scale ────────────────────────────────────────────────────── */
function defaultColorScale(v: number): string {
  if (v < 0.35) return 'var(--Alloy-green-100)';
  if (v < 0.65) return 'var(--Alloy-yellow-300)';
  return 'var(--Alloy-red-500)';
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}

/* ── Component ──────────────────────────────────────────────────────────────── */
export const HeatMap = forwardRef<HTMLDivElement, HeatMapProps>(
  (
    {
      cells,
      rows,
      cols,
      colorScale = defaultColorScale,
      cellRadius = 4,
      cellGap = 4,
      showTooltip = true,
      className,
      ...props
    },
    ref
  ) => {
    const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, content: '' });

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

    const LABEL_W = 32;
    const CELL_H = 16;
    const W = svgWidth;
    const chartW = W - LABEL_W - cellGap;
    const cellW = Math.max(4, (chartW - (cols.length - 1) * cellGap) / cols.length);
    const svgH = rows.length * (CELL_H + cellGap) + cellGap + 24;

    const cellMap = new Map<string, HeatMapCell>();
    cells.forEach(c => cellMap.set(`${c.row}__${c.col}`, c));

    return (
      <div ref={ref} className={clsx(styles.root, className)} {...props}>
        <div ref={wrapRef} className={styles.svgWrap}>
          <svg
            width={W}
            height={svgH}
            viewBox={`0 0 ${W} ${svgH}`}
            className={styles.svg}
            onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
          >
            {/* Column headers (x-axis) */}
            {cols.map((col, ci) => {
              const x = LABEL_W + cellGap + ci * (cellW + cellGap) + cellW / 2;
              return (
                <text key={col} x={x} y={12} className={styles.axisLabel} textAnchor="middle">
                  {col}
                </text>
              );
            })}

            {/* Rows */}
            {rows.map((row, ri) => {
              const y = 24 + ri * (CELL_H + cellGap);
              return (
                <g key={row}>
                  <text
                    x={LABEL_W - 4}
                    y={y + CELL_H / 2 + 4}
                    className={styles.axisLabel}
                    textAnchor="end"
                  >
                    {row}
                  </text>
                  {cols.map((col, ci) => {
                    const cell = cellMap.get(`${row}__${col}`);
                    const v = cell?.value ?? 0;
                    const fill = colorScale(v);
                    const cx = LABEL_W + cellGap + ci * (cellW + cellGap);
                    return (
                      <rect
                        key={col}
                        x={cx}
                        y={y}
                        width={cellW}
                        height={CELL_H}
                        rx={cellRadius}
                        fill={fill}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          if (!showTooltip) return;
                          const content = cell?.label ?? `${row} / ${col}: ${Math.round(v * 100)}%`;
                          setTooltip({ visible: true, x: e.clientX + 12, y: e.clientY - 8, content });
                        }}
                        onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {tooltip.visible && (
          <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
            {tooltip.content}
          </div>
        )}
      </div>
    );
  }
);

HeatMap.displayName = 'HeatMap';
