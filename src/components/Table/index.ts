/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Table — public API
   ───────────────────────────────────────────────────────────────────────────── */

// ── Structural primitives ─────────────────────────────────────────────────────
export { Table }       from './Table';
export type { TableProps, TableSize }  from './Table';

export { TableHeader } from './TableHeader';
export type { TableHeaderProps }       from './TableHeader';

export { TableBody }   from './TableBody';
export type { TableBodyProps }         from './TableBody';

export { TableRow }    from './TableRow';
export type { TableRowProps }          from './TableRow';

export { TableHead }   from './TableHead';
export type { TableHeadProps, TableSortDirection, TableCellAlign } from './TableHead';

export { TableCell }   from './TableCell';
export type { TableCellProps }         from './TableCell';

// ── Cell content helpers ──────────────────────────────────────────────────────
export { CellText }      from './CellContent';
export type { CellTextProps, CellTextVariant, CellTextSize } from './CellContent';

export { CellStack }     from './CellContent';
export type { CellStackProps }    from './CellContent';

export { CellTag }       from './CellContent';
export type { CellTagProps }      from './CellContent';

export { CellStatusTag } from './CellContent';
export type { CellStatusTagProps } from './CellContent';

export { CellActions }   from './CellContent';
export type { CellActionsProps }  from './CellContent';

export { CellControl }   from './CellContent';
export type { CellControlProps }  from './CellContent';
