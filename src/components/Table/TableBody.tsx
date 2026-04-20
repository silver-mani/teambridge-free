import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

export type TableBodyProps = ComponentPropsWithoutRef<'tbody'>;

/** Semantic `<tbody>` wrapper. Place `TableRow` + `TableCell` contents inside. */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, ...props }, ref) => (
    <tbody ref={ref} {...props}>
      {children}
    </tbody>
  ),
);

TableBody.displayName = 'TableBody';
