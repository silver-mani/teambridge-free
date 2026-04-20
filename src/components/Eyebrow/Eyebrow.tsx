import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { clsx } from 'clsx';
import styles from './Eyebrow.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

export interface EyebrowProps extends ComponentPropsWithoutRef<'span'> {
  /**
   * Renders the eyebrow as a different HTML element.
   * Useful for semantic headings (`h2`–`h6`) or `p` in context.
   * @default 'span'
   */
  as?: ElementType;
}

// ── Component ────────────────────────────────────────────────────────────────

export const Eyebrow = forwardRef<HTMLSpanElement, EyebrowProps>(
  ({ as: Tag = 'span', className, children, ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={clsx(styles.root, className)}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);

Eyebrow.displayName = 'Eyebrow';
