/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Badge
   Compact pill for counts, labels, and semantic state indicators.
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './Badge.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  /**
   * Visual color treatment.
   * - `neutral` — subtle surface (default, for counts and labels)
   * - `primary` — inverted fill (for high-emphasis notification counts)
   * - `success / warning / error / info` — semantic color fill
   * @default 'neutral'
   */
  variant?: BadgeVariant;

  /** Badge content — a number, short text string, or any inline node. */
  children: ReactNode;
}

// ── Component ────────────────────────────────────────────────────────────────

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(styles.root, styles[variant], className)}
      {...props}
    >
      {children}
    </span>
  ),
);

Badge.displayName = 'Badge';
