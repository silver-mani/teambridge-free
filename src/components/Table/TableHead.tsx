import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import styles from './Table.module.css';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

export type TableSortDirection = 'asc' | 'desc' | 'none';
export type TableCellAlign = 'left' | 'center' | 'right';

export interface TableHeadProps extends ComponentPropsWithoutRef<'th'> {
  /** Column content alignment. @default 'left' */
  align?: TableCellAlign;
  /**
   * Sort state for this column.
   * - `undefined` — column is not sortable (no chevron shown)
   * - `'none'`    — sortable but not currently the active sort key
   * - `'asc'`     — sorted ascending (chevron points up)
   * - `'desc'`    — sorted descending (chevron points down)
   */
  sort?: TableSortDirection;
  /**
   * Called when the user clicks the sort trigger.
   * Consumers are responsible for cycling the sort direction.
   */
  onSort?: () => void;
}

/**
 * Column header cell (`<th>`). When `sort` is provided the label is rendered
 * as a `<button>` so it is keyboard-accessible.
 */
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ align = 'left', sort, onSort, className, children, ...props }, ref) => {
    const isSortable = sort !== undefined;

    return (
      <th
        ref={ref}
        className={clsx(styles.head, className)}
        data-align={align !== 'left' ? align : undefined}
        scope="col"
        aria-sort={
          sort === 'asc'  ? 'ascending'  :
          sort === 'desc' ? 'descending' :
          isSortable      ? 'none'       :
          undefined
        }
        {...props}
      >
        {isSortable ? (
          <button
            type="button"
            className={styles.sortBtn}
            onClick={onSort}
            aria-label={
              typeof children === 'string'
                ? `Sort by ${children}`
                : undefined
            }
          >
            {children}
            <span
              className={styles.sortIcon}
              data-sort={sort !== 'none' ? sort : undefined}
              aria-hidden="true"
            >
              <ChevronDownIcon size={12} strokeWidth={2} />
            </span>
          </button>
        ) : (
          <span className={styles.headLabel}>{children}</span>
        )}
      </th>
    );
  },
);

TableHead.displayName = 'TableHead';
