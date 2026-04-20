/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Pagination
   Composed from Button, SelectField, and NumberField.

   Props
   ─────
   page            Current page number (1-indexed).
   totalPages      Total number of pages.
   onPageChange    Called when the user requests a page change.
   showRowsPerPage Show "Rows per page" select. Requires rowsPerPage +
                   onRowsPerPageChange.
   showGoToPage    Show "Go to page" number input. Navigate by pressing Enter.
   totalCount      When provided alongside rowsPerPage, renders "X–Y of Z".
   siblingCount    Pages shown on each side of the active page. @default 1
   size            Controls all child element sizes. @default 'sm'
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef, useCallback, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import { Button }        from '../Button/Button';
import type { ButtonSize } from '../Button/Button';
import { SelectField }   from '../Input/SelectField';
import { NumberField }   from '../Input/NumberField';
import type { FieldSize } from '../Input/FieldShell';
import { ChevronLeftIcon }  from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import styles from './Pagination.module.css';

// ── Types ──────────────────────────────────────────────────────────────────────

export type PaginationSize = 'sm' | 'md';

export interface PaginationProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'onChange'> {
  /** Current page (1-indexed). */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Called when the user navigates to a different page. */
  onPageChange: (page: number) => void;
  /** Show "Rows per page" selector on the left. @default false */
  showRowsPerPage?: boolean;
  /** Controlled rows-per-page value (required when showRowsPerPage is true). */
  rowsPerPage?: number;
  /** Options for the rows-per-page selector. @default [10, 25, 50, 100] */
  rowsPerPageOptions?: number[];
  /** Called when the user changes rows per page. */
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  /** Show "Go to page" input on the right. @default false */
  showGoToPage?: boolean;
  /** Total record count. When provided with rowsPerPage, renders "X–Y of Z". */
  totalCount?: number;
  /** Sibling pages shown around the active page. @default 1 */
  siblingCount?: number;
  /** Size tier applied to all child controls. @default 'sm' */
  size?: PaginationSize;
  /** Disables all interactive elements. */
  disabled?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

type PageItem = number | 'ellipsis';

function getPageRange(page: number, totalPages: number, siblingCount: number): PageItem[] {
  if (totalPages <= 1) return [1];

  const rangeStart = Math.max(2, page - siblingCount);
  const rangeEnd   = Math.min(totalPages - 1, page + siblingCount);

  const items: PageItem[] = [1];

  if (rangeStart > 2)              items.push('ellipsis');
  for (let i = rangeStart; i <= rangeEnd; i++) items.push(i);
  if (rangeEnd < totalPages - 1)   items.push('ellipsis');
  if (totalPages > 1)              items.push(totalPages);

  return items;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      page,
      totalPages,
      onPageChange,
      showRowsPerPage    = false,
      rowsPerPage,
      rowsPerPageOptions = [10, 25, 50, 100],
      onRowsPerPageChange,
      showGoToPage       = false,
      totalCount,
      siblingCount       = 1,
      size               = 'sm',
      disabled           = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [goToValue, setGoToValue] = useState('');

    const btnSize:   ButtonSize = size;
    const fieldSize: FieldSize  = size;
    const iconSize  = size === 'sm' ? 14 : 16;

    const pageRange = getPageRange(page, totalPages, siblingCount);

    const navigate = useCallback(
      (target: number) => {
        const clamped = Math.min(Math.max(1, target), totalPages);
        if (clamped !== page) onPageChange(clamped);
      },
      [page, totalPages, onPageChange],
    );

    const handleGoToKey = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          const n = parseInt(goToValue, 10);
          if (!isNaN(n)) navigate(n);
          setGoToValue('');
        }
      },
      [goToValue, navigate],
    );

    const countText =
      totalCount != null && rowsPerPage != null
        ? `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
        : null;

    return (
      <nav
        ref={ref}
        aria-label="Pagination"
        className={clsx(styles.root, className)}
        data-size={size}
        {...props}
      >
        {/* ── Rows per page ──────────────────────────────────────────────── */}
        {showRowsPerPage && (
          <div className={styles.rowsGroup}>
            <span className={styles.groupLabel}>Rows per page</span>
            <div className={styles.rowsSelect}>
              <SelectField
                size={fieldSize}
                value={rowsPerPage}
                disabled={disabled}
                aria-label="Rows per page"
                onChange={e => onRowsPerPageChange?.(Number(e.target.value))}
              >
                {rowsPerPageOptions.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </SelectField>
            </div>
          </div>
        )}

        {/* ── Count text: "1–10 of 100" ──────────────────────────────────── */}
        {countText && (
          <span className={styles.countText} aria-live="polite">{countText}</span>
        )}

        {/* ── Page controls ──────────────────────────────────────────────── */}
        <div className={styles.pageControls} role="group" aria-label="Page navigation">
          {/* Previous */}
          <Button
            variant="ghost"
            size={btnSize}
            iconOnly
            aria-label="Previous page"
            disabled={disabled || page <= 1}
            onClick={() => navigate(page - 1)}
          >
            <ChevronLeftIcon size={iconSize} />
          </Button>

          {/* Page numbers */}
          {pageRange.map((item, i) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${i}`}
                className={styles.ellipsis}
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === page ? 'secondary' : 'ghost'}
                size={btnSize}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                disabled={disabled}
                onClick={() => navigate(item)}
                className={styles.pageBtn}
              >
                {item}
              </Button>
            ),
          )}

          {/* Next */}
          <Button
            variant="ghost"
            size={btnSize}
            iconOnly
            aria-label="Next page"
            disabled={disabled || page >= totalPages}
            onClick={() => navigate(page + 1)}
          >
            <ChevronRightIcon size={iconSize} />
          </Button>
        </div>

        {/* ── Go to page ─────────────────────────────────────────────────── */}
        {showGoToPage && (
          <div className={styles.goToGroup}>
            <span className={styles.groupLabel}>Go to</span>
            <div className={styles.goToInput}>
              <NumberField
                size={fieldSize}
                value={goToValue}
                placeholder={String(page)}
                min={1}
                max={totalPages}
                disabled={disabled}
                aria-label="Go to page number"
                onChange={e => setGoToValue(e.target.value)}
                onKeyDown={handleGoToKey}
              />
            </div>
          </div>
        )}
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';
