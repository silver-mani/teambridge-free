import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import styles from './StatusTag.module.css';

export type StatusTagStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending';
export type StatusTagSize = 'sm' | 'md' | 'lg';

export interface StatusTagProps extends ComponentPropsWithoutRef<'span'> {
  status?: StatusTagStatus;
  size?: StatusTagSize;
  dot?: boolean;
}

export const StatusTag = forwardRef<HTMLSpanElement, StatusTagProps>(
  ({ status = 'neutral', size = 'md', dot = true, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(styles.root, styles[size], styles[status], className)}
      {...props}
    >
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  )
);

StatusTag.displayName = 'StatusTag';
