import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

export type TableHeaderProps = ComponentPropsWithoutRef<'thead'>;

/** Semantic `<thead>` wrapper. Place `TableRow` + `TableHead` cells inside. */
export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, ...props }, ref) => (
    <thead ref={ref} {...props}>
      {children}
    </thead>
  ),
);

TableHeader.displayName = 'TableHeader';
