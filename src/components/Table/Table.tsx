import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import styles from './Table.module.css';

export type TableSize = 'sm' | 'md';

export interface TableProps extends ComponentPropsWithoutRef<'table'> {
  /**
   * Row height scale.
   * - `md` — 48px rows, 32px header (default)
   * - `sm` — 40px rows, 28px header
   */
  size?: TableSize;
}

/**
 * Root table element. Sets the size-token CSS custom properties that cascade
 * to all descendant `TableHead` and `TableCell` components.
 *
 * Wrap in `ScrollArea` (or a CSS `overflow-x: auto` container) to enable
 * horizontal scrolling on narrow viewports.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ size = 'md', className, children, ...props }, ref) => (
    <table
      ref={ref}
      className={clsx(styles.table, size === 'sm' && styles.sm, className)}
      {...props}
    >
      {children}
    </table>
  ),
);

Table.displayName = 'Table';
