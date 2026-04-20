import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import { XIcon } from '../icons/XIcon';
import { Button } from '../Button/Button';
import styles from './Alert.module.css';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

export type AlertStatus  = 'error' | 'warning' | 'success' | 'info' | 'feature';
export type AlertVariant = 'lighter' | 'stroke';
export type AlertSize    = 'sm' | 'lg';

export interface AlertProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  /** Semantic status — drives icon and color scheme */
  status?: AlertStatus;
  /** lighter = tinted bg; stroke = white bg with opaque border */
  variant?: AlertVariant;
  /** sm = single-line title; lg = title + description + actions */
  size?: AlertSize;
  /** Alert heading (required) */
  title: string;
  /** Supporting description — large size only */
  description?: string;
  /** Primary action link label */
  action?: string;
  /** Primary action click handler */
  onAction?: () => void;
  /** Secondary "Learn more" link label */
  learnMore?: string;
  /** Secondary link click handler */
  onLearnMore?: () => void;
  /** Dismiss handler — when provided the × button is rendered */
  onDismiss?: () => void;
}

/* ─── Badge icons
 *  All icons use viewBox="0 0 10 10" so stroke-width: 1.75 (from alloy-icon-slot)
 *  maps directly to 1.75px on screen — no viewBox scaling distortion.
 *  Paths for warning/info/feature are sourced from alert.svg / info.svg,
 *  coordinates scaled from 24→10 (factor 10/24 ≈ 0.4167).
 * ────────────────────────────────────────────────────────────────────────────── */

// error — X cross
const BadgeXIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeLinecap="round" />
  </svg>
);

// success — checkmark
const BadgeCheckIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M1.5 5L3.5 7.5L8.5 2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// warning — exclamation mark (alert.svg paths scaled ×0.4167)
const BadgeAlertIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M5 1.667V6.405M5 8.333H5.002" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// info / feature — lowercase i (info.svg paths scaled ×0.4167)
const BadgeInfoIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M5 8.333V3.595M5 1.667H5.002" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BADGE_ICON: Record<AlertStatus, () => JSX.Element> = {
  error:   BadgeXIcon,
  warning: BadgeAlertIcon,
  success: BadgeCheckIcon,
  info:    BadgeInfoIcon,
  feature: BadgeInfoIcon,
};

/* ─── Component ─────────────────────────────────────────────────────────────── */

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      status   = 'info',
      variant  = 'lighter',
      size     = 'sm',
      title,
      description,
      action,
      onAction,
      learnMore,
      onLearnMore,
      onDismiss,
      className,
      ...props
    },
    ref,
  ) => {
    const StatusIcon = BADGE_ICON[status];
    const isLg = size === 'lg';

    const dismissBtn = onDismiss ? (
      <Button
        variant="ghost"
        size="xs"
        iconOnly
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <XIcon size={12} />
      </Button>
    ) : null;

    return (
      <div
        ref={ref}
        role="alert"
        className={clsx(styles.root, className)}
        data-status={status}
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {/* Status badge — alloy-icon-slot handles stroke-width; color:white flows into currentColor */}
        <span className={styles.badge} aria-hidden="true">
          <span className={clsx('alloy-icon-slot', styles.badgeIconSlot)}>
            <StatusIcon />
          </span>
        </span>

        {/* Content */}
        {isLg ? (
          <div className={styles.content}>
            <div className={styles.text}>
              <p className={styles.title}>{title}</p>
              {description && <p className={styles.description}>{description}</p>}
            </div>

            {(action || learnMore) && (
              <div className={styles.actions}>
                {action && (
                  <button
                    type="button"
                    className={clsx(styles.actionLink, styles.primaryAction)}
                    onClick={onAction}
                  >
                    {action}
                  </button>
                )}
                {action && learnMore && (
                  <span className={styles.dot} aria-hidden="true">·</span>
                )}
                {learnMore && (
                  <button
                    type="button"
                    className={styles.actionLink}
                    onClick={onLearnMore}
                  >
                    {learnMore}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className={styles.title}>{title}</p>
        )}

        {/* Trailing — small size: action + dismiss grouped; large: dismiss alone */}
        {isLg ? (
          dismissBtn
        ) : (
          (action || onDismiss) && (
            <div className={styles.trailing}>
              {action && (
                <button
                  type="button"
                  className={clsx(styles.actionLink, styles.primaryAction)}
                  onClick={onAction}
                >
                  {action}
                </button>
              )}
              {dismissBtn}
            </div>
          )
        )}
      </div>
    );
  },
);

Alert.displayName = 'Alert';
