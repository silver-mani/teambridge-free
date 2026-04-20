import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import styles from './Table.module.css';

export interface TableRowProps extends ComponentPropsWithoutRef<'tr'> {
  /**
   * Applies a background-color change on hover.
   * @default true
   */
  hoverable?: boolean;
  /**
   * Marks the row as the active/selected item.
   * Applies `--color-bg-tertiary` background.
   */
  selected?: boolean;
}

/**
 * A table row (`<tr>`). Use inside `TableHeader` (with `hoverable={false}`)
 * or `TableBody`.
 */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ hoverable = true, selected, className, children, ...props }, ref) => (
    <tr
      ref={ref}
      className={clsx(styles.row, className)}
      data-hoverable={hoverable || undefined}
      data-selected={selected || undefined}
      aria-selected={selected}
      {...props}
    >
      {children}
    </tr>
  ),
);

TableRow.displayName = 'TableRow';
