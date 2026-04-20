import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './Button.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant =
  | 'primary'               // Dark inverse fill — highest emphasis
  | 'secondary'             // Light gray fill — medium emphasis
  | 'tertiary'              // White + border — outlined
  | 'ghost'                 // Transparent — low emphasis
  | 'destructive'           // Solid red fill — primary destructive
  | 'destructive-secondary'; // Light red tint — secondary destructive

export type ButtonSize =
  | 'xs'  // 24px  · artwork 12px
  | 'sm'  // 32px  · artwork 14px
  | 'md'  // 36px  · artwork 16px
  | 'lg'  // 48px  · artwork 20px
  | 'xl'; // 56px  · artwork 24px

// Maps API variant names → CSS Module class names.
// Required because CSS Modules uses camelCase for multi-word classes
// while the public API uses kebab-case for readability.
const variantClass: Record<ButtonVariant, string> = {
  'primary':               styles.primary,
  'secondary':             styles.secondary,
  'tertiary':              styles.tertiary,
  'ghost':                 styles.ghost,
  'destructive':           styles.destructive,
  'destructive-secondary': styles.destructiveSecondary,
};

// ── Props ────────────────────────────────────────────────────────────────────

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Visual style of the button. @default 'primary' */
  variant?: ButtonVariant;
  /** Height and artwork scale. @default 'md' */
  size?: ButtonSize;
  /** Shows a spinner and disables interaction while true. */
  loading?: boolean;
  /**
   * Artwork (icon, avatar, badge…) at the leading (left) position.
   * Sized automatically to match the button's size.
   * Hidden while `loading` is true.
   */
  leadingArtwork?: ReactNode;
  /**
   * Artwork (icon, avatar, badge…) at the trailing (right) position.
   * Sized automatically to match the button's size.
   * Hidden while `loading` is true.
   */
  trailingArtwork?: ReactNode;
  /**
   * Square icon-only layout.
   * Pass the icon as `children` and always provide an `aria-label`.
   */
  iconOnly?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant        = 'primary',
      size           = 'md',
      loading        = false,
      leadingArtwork,
      trailingArtwork,
      iconOnly       = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={clsx(
          styles.root,
          variantClass[variant],
          styles[size],
          iconOnly && styles.iconOnly,
          className,
        )}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        data-loading={loading   || undefined}
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {/* Spinner — replaces all content while loading */}
        {loading && (
          <span className={styles.spinner} aria-hidden="true" />
        )}

        {/* Icon-only: children IS the artwork — wrap in .artwork so size/stroke tokens apply */}
        {!loading && iconOnly && (
          <span className={clsx(styles.artwork, 'alloy-icon-slot')} aria-hidden="true">
            {children}
          </span>
        )}

        {/* Standard layout: leading artwork · label · trailing artwork */}
        {!loading && !iconOnly && (
          <>
            {leadingArtwork && (
              <span className={clsx(styles.artwork, 'alloy-icon-slot')} aria-hidden="true">
                {leadingArtwork}
              </span>
            )}
            {children && (
              <span className={styles.label}>{children}</span>
            )}
            {trailingArtwork && (
              <span className={clsx(styles.artwork, 'alloy-icon-slot')} aria-hidden="true">
                {trailingArtwork}
              </span>
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
