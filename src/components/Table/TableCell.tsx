import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import styles from './Table.module.css';
import type { TableCellAlign } from './TableHead';

export interface TableCellProps extends ComponentPropsWithoutRef<'td'> {
  /** Content alignment within the cell. @default 'left' */
  align?: TableCellAlign;
  /**
   * Reduces horizontal padding — useful for cells that contain only icon
   * buttons, checkboxes, or other compact controls.
   */
  compact?: boolean;
}

/**
 * Data cell (`<td>`). Accepts any `children` — use the `Cell*` content helpers
 * (`CellText`, `CellTag`, `CellStatusTag`, `CellStack`, `CellActions`,
 * `CellControl`) for consistent typography and layout, or render anything custom.
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ align = 'left', compact, className, children, ...props }, ref) => (
    <td
      ref={ref}
      className={clsx(styles.cell, className)}
      data-align={align !== 'left' ? align : undefined}
      data-compact={compact || undefined}
      {...props}
    >
      {children}
    </td>
  ),
);

TableCell.displayName = 'TableCell';
