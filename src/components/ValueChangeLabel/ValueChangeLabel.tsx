import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import styles from './ValueChangeLabel.module.css';
import { ArrowNarrowUpIcon } from '../icons/ArrowNarrowUpIcon';
import { ArrowNarrowDownIcon } from '../icons/ArrowNarrowDownIcon';

// ── Types ────────────────────────────────────────────────────────────────────

export type ValueChangeTrend = 'up' | 'down';
export type ValueChangeSeverity = 'positive' | 'warning' | 'negative';

/**
 * Trend mode — shows an arrow icon + text.
 * Arrow direction comes from `trend`. Color defaults to green (up) or red (down),
 * override with `severity`.
 */
interface TrendModeProps {
  mode: 'trend';
  /** Display text (e.g. "12%", "+$4.2K") */
  value: string;
  /** Arrow direction — also determines default color mapping */
  trend: ValueChangeTrend;
  /** Explicit severity — overrides the default up=positive / down=negative mapping */
  severity?: ValueChangeSeverity;
}

/**
 * Text mode — plain text with a severity color.
 * Use this for non-directional change indicators (e.g. "Overdue", "On track").
 */
interface TextModeProps {
  mode: 'text';
  /** Display text */
  value: string;
  /** Color based on attention level */
  severity: ValueChangeSeverity;
}

export type ValueChangeLabelProps = (TrendModeProps | TextModeProps) &
  Omit<ComponentPropsWithoutRef<'span'>, 'children'>;

// ── Helpers ──────────────────────────────────────────────────────────────────

function trendToSeverity(trend: ValueChangeTrend): ValueChangeSeverity {
  return trend === 'up' ? 'positive' : 'negative';
}

// ── Component ────────────────────────────────────────────────────────────────

export const ValueChangeLabel = forwardRef<HTMLSpanElement, ValueChangeLabelProps>(
  (props, ref) => {
    const { mode, value, className, ...rest } = props;

    const severity: ValueChangeSeverity =
      mode === 'trend'
        ? (props.severity ?? trendToSeverity(props.trend))
        : props.severity;

    // Strip mode-specific props before spreading onto DOM element
    const { severity: _s, ..._rest } = rest as TextModeProps & Record<string, unknown>;
    const domProps = mode === 'trend'
      ? (({ trend: _t, severity: _sv, ...r }) => r)(_rest as TrendModeProps & Record<string, unknown>)
      : _rest;

    const Icon =
      mode === 'trend'
        ? props.trend === 'up'
          ? ArrowNarrowUpIcon
          : ArrowNarrowDownIcon
        : null;

    return (
      <span
        ref={ref}
        className={clsx(styles.root, styles[severity], className)}
        {...domProps}
      >
        <span className={styles.text}>{value}</span>
        {Icon && (
          <span className={styles.icon} aria-hidden="true">
            <Icon size={14} />
          </span>
        )}
      </span>
    );
  },
);

ValueChangeLabel.displayName = 'ValueChangeLabel';
