import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './DataCard.module.css';

// ── Types ───────────────────────────────────────────────────────────────────

/**
 * Badge color — maps directly to Alloy's semantic color token families.
 * Each value sets the badge background to `--color-{color}-bg-tertiary`
 * and the icon fill to `--color-{color}-content-secondary`.
 */
export type DataCardColor =
  | 'green'
  | 'yellow'
  | 'matcha'
  | 'purple'
  | 'blue'
  | 'azure'
  | 'red'
  | 'orange'
  | 'pink'
  | 'slate';

export interface DataCardProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Color theme of the icon badge. Controls the badge background and icon tint.
   * Uses Alloy's -tertiary (light) bg + -secondary content tokens per color.
   * @default 'slate'
   */
  color?: DataCardColor;

  /**
   * Icon node to render inside the 48×48 badge.
   * Pass any Alloy icon component at size={24} — color is inherited automatically.
   */
  icon: ReactNode;

  /**
   * Short metric name displayed below the badge.
   * Rendered in Alloy Paragraph/sm (12px Regular).
   */
  label: string;

  /**
   * Primary data value.
   * Rendered in Alloy Heading/sm Medium (20px, weight 500).
   */
  value: string | number;

  /**
   * Optional change indicator shown next to the value.
   * Pass a <ValueChangeLabel> component for trend or severity-based displays.
   */
  change?: ReactNode;
}

// ── Component ───────────────────────────────────────────────────────────────

/**
 * DataCard — a compact metric tile used in dashboards and summary views.
 *
 * Structure:
 * 1. Colored icon badge (48×48, Alloy semantic color tokens)
 * 2. Label (Alloy Paragraph/sm)
 * 3. Value + optional ValueChangeLabel (Alloy Heading/sm Medium)
 */
export const DataCard = forwardRef<HTMLDivElement, DataCardProps>(
  (
    {
      color = 'slate',
      icon,
      label,
      value,
      change,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(styles.root, className)}
        {...props}
      >
        {/* ── Badge ── */}
        <div
          className={clsx(styles.badge, styles[color])}
          aria-hidden="true"
        >
          <span className={styles.badgeIcon}>{icon}</span>
        </div>

        {/* ── Content ── */}
        <div className={styles.content}>
          <span className={styles.label}>{label}</span>
          <div className={styles.valueRow}>
            <span className={styles.value}>{value}</span>
            {change != null && (
              <span className={styles.change}>{change}</span>
            )}
          </div>
        </div>
      </div>
    );
  },
);

DataCard.displayName = 'DataCard';
