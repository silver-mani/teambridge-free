import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './FilterPill.module.css';
import { XIcon } from '../icons/XIcon';

export type FilterPillSize = 'sm' | 'md';

export interface FilterPillProps extends ComponentPropsWithoutRef<'button'> {
  /** Whether the pill is in its active/selected state. */
  active?: boolean;
  /** Optional leading icon — should be a 12×12 or 14×14 SVG element. */
  icon?: ReactNode;
  /**
   * If provided, renders a × remove button at the trailing edge and calls
   * this handler when it is clicked. The pill's own `onClick` is NOT fired
   * when the remove button is clicked.
   */
  onRemove?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Pill size. Defaults to 'sm' (22 px) matching Automation 2.0. */
  size?: FilterPillSize;
}

/**
 * FilterPill
 *
 * A compact pill-shaped toggle used for filter rows. Matches the Automation 2.0
 * palette filter chip style exactly.
 *
 * - Click to toggle `active` state (controlled via `onClick`)
 * - Pass `onRemove` to render a trailing × for removable applied-filter chips
 * - Pass `icon` for a leading glyph (e.g. a category icon)
 *
 * @example
 * // Toggle filter
 * <FilterPill active={typeFilter === 'trigger'} onClick={() => setTypeFilter('trigger')}>
 *   Trigger
 * </FilterPill>
 *
 * @example
 * // Removable applied filter
 * <FilterPill active onRemove={() => removeFilter('status')}>
 *   Status: Active
 * </FilterPill>
 */
export const FilterPill = forwardRef<HTMLButtonElement, FilterPillProps>(
  (
    {
      active = false,
      icon,
      onRemove,
      size = 'sm',
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const handleRemove = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation(); // don't fire the pill's onClick
      onRemove?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        data-active={active || undefined}
        data-size={size}
        className={clsx(
          styles.root,
          active && styles.active,
          onRemove && styles.removable,
          styles[size],
          className,
        )}
        {...props}
      >
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}

        <span className={styles.label}>{children}</span>

        {onRemove && (
          <button
            type="button"
            disabled={disabled}
            aria-label="Remove filter"
            className={styles.removeBtn}
            onClick={handleRemove}
            tabIndex={-1}
          >
            <XIcon size={10} aria-hidden="true" />
          </button>
        )}
      </button>
    );
  },
);

FilterPill.displayName = 'FilterPill';

/* ─── FilterPillGroup ────────────────────────────────────────────────────────
 * Thin container that renders pills in a horizontally-scrollable row,
 * matching the `.paletteFilters` pattern from Automation 2.0.
 * ─────────────────────────────────────────────────────────────────────────── */

export interface FilterPillGroupProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
}

export const FilterPillGroup = forwardRef<HTMLDivElement, FilterPillGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.group, className)} {...props}>
      {children}
    </div>
  ),
);

FilterPillGroup.displayName = 'FilterPillGroup';
