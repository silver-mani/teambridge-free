import { forwardRef } from 'react';
import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import { PlusIcon } from '../icons/PlusIcon';
import styles from './AreaButton.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

export type AreaButtonSize = 'sm' | 'md' | 'lg';
export type AreaButtonLayout = 'vertical' | 'horizontal';
export type AreaButtonAlign = 'center' | 'start';

export interface AreaButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Height of the button — matches the adjacent card height. @default 'md' */
  size?: AreaButtonSize;
  /** Icon + label stacked (vertical) or side-by-side (horizontal). @default 'horizontal' */
  layout?: AreaButtonLayout;
  /**
   * Content alignment along the main axis.
   * `'center'` (default) — content is centred inside the button.
   * `'start'`  — content is pushed to the leading (left) edge.
   * Most useful with `layout='horizontal'`.
   * @default 'center'
   */
  align?: AreaButtonAlign;
  /** Label shown below/beside the icon. @default 'Add' */
  label?: string;
  /** Hides the text label, leaving only the icon. @default false */
  hideLabel?: boolean;
  /** Custom icon. Defaults to PlusIcon. */
  icon?: ReactNode;
  /**
   * Override the min-height. Accepts any CSS length value or a number (px).
   * Useful when the button needs to match a specific card or row height.
   */
  height?: number | string;
  /**
   * Override the border-radius. Accepts any CSS length value or a number (px).
   * Defaults to `--radius-lg`.
   */
  borderRadius?: number | string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toCSSValue(v: number | string): string {
  return typeof v === 'number' ? `${v}px` : v;
}

// ── Component ────────────────────────────────────────────────────────────────

export const AreaButton = forwardRef<HTMLButtonElement, AreaButtonProps>(
  (
    {
      size         = 'md',
      layout       = 'horizontal',
      align        = 'center',
      label        = 'Add',
      hideLabel    = false,
      icon,
      height,
      borderRadius,
      className,
      style,
      disabled,
      type         = 'button',
      ...props
    },
    ref,
  ) => {
    const iconNode = icon ?? <PlusIcon size="100%" />;

    const customVars: Record<string, string> = {};
    if (height       !== undefined) customVars['--area-min-height'] = toCSSValue(height);
    if (borderRadius !== undefined) customVars['--area-radius']     = toCSSValue(borderRadius);

    return (
      <button
        ref={ref}
        type={type}
        className={clsx(styles.root, styles[size], styles[layout], align === 'start' && styles.alignStart, className)}
        disabled={disabled}
        data-size={size}
        data-layout={layout}
        style={{ ...(customVars as CSSProperties), ...style }}
        {...props}
      >
        <span className={styles.inner}>
          <span className={styles.iconSlot} aria-hidden="true">
            {iconNode}
          </span>
          {!hideLabel && label && (
            <span className={styles.label}>{label}</span>
          )}
        </span>
      </button>
    );
  },
);

AreaButton.displayName = 'AreaButton';
