/**
 * Alloy · Table — Cell content helpers
 *
 * These lightweight wrappers provide consistent typography, spacing, and
 * alignment for common cell content patterns. They are independent of
 * `TableCell` — import and compose them freely.
 *
 * Available helpers:
 *   CellText       — single line of styled text
 *   CellStack      — stacked primary + secondary text lines
 *   CellTag        — Alloy Tag sized for table rows
 *   CellStatusTag  — Alloy StatusTag sized for table rows
 *   CellActions    — inline row of action controls (buttons, dropdowns…)
 *   CellControl    — centered wrapper for a single interactive control
 */

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './Table.module.css';
import { Tag } from '../Tag/Tag';
import type { TagProps } from '../Tag/Tag';
import { StatusTag } from '../StatusTag/StatusTag';
import type { StatusTagProps } from '../StatusTag/StatusTag';

// ─────────────────────────────────────────────────────────────────────────────
// CellText
// ─────────────────────────────────────────────────────────────────────────────

export type CellTextVariant = 'primary' | 'secondary' | 'muted' | 'mono';
export type CellTextSize    = 'sm' | 'md';

export interface CellTextProps extends ComponentPropsWithoutRef<'span'> {
  /**
   * Typography style:
   * - `primary`   — default body text (--color-content-primary)
   * - `secondary` — supporting text (--color-content-secondary)
   * - `muted`     — captions / timestamps (--color-content-tertiary, xs)
   * - `mono`      — monospace, useful for IDs, codes, amounts
   */
  variant?: CellTextVariant;
  /** Font size. `md` = --text-sm (default), `sm` = --text-xs. */
  size?: CellTextSize;
  /** Allow the text to wrap across multiple lines. */
  wrap?: boolean;
}

/** Single line of styled text inside a cell. Truncates with ellipsis by default. */
export const CellText = forwardRef<HTMLSpanElement, CellTextProps>(
  ({ variant = 'primary', size = 'md', wrap, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(styles.cellText, className)}
      data-variant={variant !== 'primary' ? variant : undefined}
      data-size={size !== 'md' ? size : undefined}
      data-wrap={wrap || undefined}
      {...props}
    >
      {children}
    </span>
  ),
);

CellText.displayName = 'CellText';

// ─────────────────────────────────────────────────────────────────────────────
// CellStack
// ─────────────────────────────────────────────────────────────────────────────

export interface CellStackProps extends ComponentPropsWithoutRef<'div'> {
  /** Primary (top) line — rendered in --color-content-primary, --text-sm. */
  primary: ReactNode;
  /** Secondary (bottom) line — rendered in --color-content-tertiary, --text-xs. */
  secondary?: ReactNode;
}

/**
 * Stacked two-line cell content (e.g. name + email, title + subtitle).
 * Truncates both lines independently with ellipsis.
 */
export const CellStack = forwardRef<HTMLDivElement, CellStackProps>(
  ({ primary, secondary, className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.cellStack, className)} {...props}>
      <span className={styles.cellStackPrimary}>{primary}</span>
      {secondary && (
        <span className={styles.cellStackSecondary}>{secondary}</span>
      )}
    </div>
  ),
);

CellStack.displayName = 'CellStack';

// ─────────────────────────────────────────────────────────────────────────────
// CellTag
// ─────────────────────────────────────────────────────────────────────────────

export interface CellTagProps extends Omit<TagProps, 'size'> {
  /** Override the default table-row size (sm). */
  size?: TagProps['size'];
}

/**
 * Alloy `Tag` pre-sized for table rows (`size="sm"`).
 * Accepts all `Tag` props — variant, color, dot, leadingIcon, dismissible.
 */
export const CellTag = forwardRef<HTMLSpanElement, CellTagProps>(
  ({ size = 'sm', ...props }, ref) => (
    <Tag ref={ref} size={size} {...props} />
  ),
);

CellTag.displayName = 'CellTag';

// ─────────────────────────────────────────────────────────────────────────────
// CellStatusTag
// ─────────────────────────────────────────────────────────────────────────────

export interface CellStatusTagProps extends Omit<StatusTagProps, 'size'> {
  /** Override the default table-row size (sm). */
  size?: StatusTagProps['size'];
}

/**
 * Alloy `StatusTag` pre-sized for table rows (`size="sm"`).
 * Accepts all `StatusTag` props — status, dot.
 */
export const CellStatusTag = forwardRef<HTMLSpanElement, CellStatusTagProps>(
  ({ size = 'sm', ...props }, ref) => (
    <StatusTag ref={ref} size={size} {...props} />
  ),
);

CellStatusTag.displayName = 'CellStatusTag';

// ─────────────────────────────────────────────────────────────────────────────
// CellActions
// ─────────────────────────────────────────────────────────────────────────────

export type CellActionsProps = ComponentPropsWithoutRef<'div'>;

/**
 * Inline horizontal row of action controls (buttons, icon buttons, dropdowns).
 * Children are spaced with `--space-2` (8px) gap.
 *
 * @example
 * <CellActions>
 *   <Button size="sm" variant="ghost" iconOnly aria-label="Edit">
 *     <EditIcon />
 *   </Button>
 *   <DropdownMenu ... />
 * </CellActions>
 */
export const CellActions = forwardRef<HTMLDivElement, CellActionsProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.cellActions, className)} {...props}>
      {children}
    </div>
  ),
);

CellActions.displayName = 'CellActions';

// ─────────────────────────────────────────────────────────────────────────────
// CellControl
// ─────────────────────────────────────────────────────────────────────────────

export type CellControlProps = ComponentPropsWithoutRef<'div'>;

/**
 * Centered wrapper for a single interactive control — checkbox, toggle switch,
 * radio button, etc. Centers the child both horizontally and vertically within
 * the cell padding box.
 *
 * Pair `TableCell` with `compact` to reduce horizontal padding for control columns.
 *
 * @example
 * <TableCell compact align="center">
 *   <CellControl>
 *     <input type="checkbox" checked={row.selected} onChange={...} />
 *   </CellControl>
 * </TableCell>
 */
export const CellControl = forwardRef<HTMLDivElement, CellControlProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.cellControl, className)} {...props}>
      {children}
    </div>
  ),
);

CellControl.displayName = 'CellControl';
