/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · FieldShell — internal visual shell (not exported publicly)
   The outlined / underlined box that wraps icon slots and the native control.
   ───────────────────────────────────────────────────────────────────────────── */

import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { AlertCircleIcon } from '../icons/AlertCircleIcon';
import styles from './Input.module.css';

export type FieldVariant = 'outlined' | 'underlined';
export type FieldSize    = 'sm' | 'md' | 'lg';

export interface FieldShellProps {
  variant?:       FieldVariant;
  size?:          FieldSize;
  error?:         boolean;
  success?:       boolean;
  disabled?:      boolean;
  readOnly?:      boolean;
  /** Non-interactive icon rendered on the leading edge. */
  leadingIcon?:   ReactNode;
  /** Non-interactive icon rendered on the trailing edge. */
  trailingIcon?:  ReactNode;
  /** Interactive element (button) rendered on the trailing edge.
   *  Use the exported `styles.trailingActionBtn` class on the inner button. */
  trailingAction?: ReactNode;
  isTextarea?:    boolean;
  /** Programmatically apply the focus-active styling (e.g. when a custom trigger owns focus). */
  focused?:       boolean;
  className?:     string;
  children:       ReactNode;
}

export function FieldShell({
  variant       = 'outlined',
  size          = 'md',
  error,
  success,
  disabled,
  readOnly,
  leadingIcon,
  trailingIcon,
  trailingAction,
  isTextarea,
  focused,
  className,
  children,
}: FieldShellProps) {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  const successIcon = success && !error && !trailingIcon && !trailingAction
    ? <CheckCircleIcon size={iconSize} />
    : null;
  const errorIcon = error && !trailingIcon && !trailingAction
    ? <AlertCircleIcon size={iconSize} />
    : null;

  const hasLeading  = !!leadingIcon;
  const hasTrailing = !!(trailingIcon || trailingAction || successIcon || errorIcon);

  return (
    <div
      className={clsx(
        styles.shell,
        styles[variant],
        styles[size],
        isTextarea && styles.textareaShell,
        className,
      )}
      data-error={error    || undefined}
      data-success={success  || undefined}
      data-disabled={disabled  || undefined}
      data-readonly={readOnly  || undefined}
      data-focused={focused  || undefined}
      data-has-leading={hasLeading  || undefined}
      data-has-trailing={hasTrailing || undefined}
    >
      {leadingIcon && (
        <span className={clsx(styles.leadingSlot, 'alloy-icon-slot')}>
          {leadingIcon}
        </span>
      )}

      {children}

      {trailingAction ? (
        <span className={styles.trailingActionWrap}>
          {trailingAction}
        </span>
      ) : (trailingIcon || successIcon || errorIcon) ? (
        <span className={clsx(
          styles.trailingSlot,
          'alloy-icon-slot',
          successIcon && styles.successTrailingSlot,
          errorIcon   && styles.errorTrailingSlot,
        )}>
          {trailingIcon ?? successIcon ?? errorIcon}
        </span>
      ) : null}
    </div>
  );
}

/** CSS module reference — consumers import this to style the trailing action button. */
export { styles as fieldStyles };
