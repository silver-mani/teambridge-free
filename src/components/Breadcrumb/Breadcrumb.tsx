import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './Breadcrumb.module.css';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

export interface BreadcrumbItem {
  /** Visible label */
  label: string;
  /** Optional leading icon (e.g. HomeLineIcon) */
  icon?: ReactNode;
  /** If provided the item renders as a clickable link */
  href?: string;
  /** Click handler (used alongside or instead of href) */
  onClick?: () => void;
}

export type BreadcrumbSeparator = 'slash' | 'chevron';

export interface BreadcrumbProps extends ComponentPropsWithoutRef<'nav'> {
  /** Ordered list of breadcrumb items — last item is the current page */
  items: BreadcrumbItem[];
  /** '/' slash (default) or '›' chevron separator */
  separator?: BreadcrumbSeparator;
}

/* ─── Separator glyphs ──────────────────────────────────────────────────────── */

const SlashSeparator = () => (
  <span className={styles.separator} aria-hidden="true">/</span>
);

const ChevronSeparator = () => (
  <span className={styles.separator} aria-hidden="true">
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

/* ─── Component ─────────────────────────────────────────────────────────────── */

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = 'slash', className, ...props }, ref) => {
    const Separator = separator === 'chevron' ? ChevronSeparator : SlashSeparator;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={clsx(styles.root, className)}
        {...props}
      >
        <ol className={styles.list}>
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1;
            const isClickable = !isCurrent && (!!item.href || !!item.onClick);

            return (
              <li key={index} className={styles.item}>
                {/* Separator (not before first item) */}
                {index > 0 && <Separator />}

                {/* Item content */}
                {isClickable ? (
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    className={styles.link}
                    aria-label={item.label}
                  >
                    {item.icon && (
                      <span className={clsx(styles.iconSlot, 'alloy-icon-slot')}>
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <span
                    className={clsx(styles.link, isCurrent && styles.current)}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {item.icon && (
                      <span className={clsx(styles.iconSlot, 'alloy-icon-slot')}>
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
