import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './ChartCard.module.css';

export interface ChartCardProps extends ComponentPropsWithoutRef<'div'> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export const ChartCard = forwardRef<HTMLDivElement, ChartCardProps>(
  ({ title, subtitle, action, children, className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.root, className)} {...props}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {action && <div className={styles.action}>{action}</div>}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  )
);

ChartCard.displayName = 'ChartCard';
