/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · PasswordField
   Password input with built-in show / hide toggle button.
   Manages visibility state internally; consumers can still control the value.
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef, useId, useState } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import { FieldWrapper } from './FieldWrapper';
import { FieldShell }  from './FieldShell';
import type { FieldVariant, FieldSize } from './FieldShell';
import type { FieldLayout } from './FieldWrapper';
import { EyeIcon }    from '../icons/EyeIcon';
import { EyeOffIcon } from '../icons/EyeOffIcon';
import styles from './Input.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

export interface PasswordFieldProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'size' | 'type'> {
  label?:      ReactNode;
  /** Icon rendered immediately after the label text (e.g. InfoCircleIcon). */
  labelIcon?:  ReactNode;
  hint?:       string;
  error?:      string;
  success?:    string;
  required?:   boolean;
  /** @default 'outlined' */
  variant?:    FieldVariant;
  /** @default 'md' */
  size?:       FieldSize;
  leadingIcon?: ReactNode;
  layout?: FieldLayout;
  labelWidth?: number | string;
  labelDescription?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      label,
      labelIcon,
      hint,
      error,
      success,
      required,
      variant     = 'outlined',
      size        = 'md',
      leadingIcon,
      layout,
      labelWidth,
      labelDescription,
      id,
      disabled,
      readOnly,
      className,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId     = id ?? generatedId;
    const [visible, setVisible] = useState(false);

    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

    return (
      <FieldWrapper
        label={label}
        labelIcon={labelIcon}
        hint={hint}
        error={error}
        success={success}
        required={required}
        htmlFor={fieldId}
        layout={layout}
        labelWidth={labelWidth}
        labelDescription={labelDescription}
        className={className}
      >
        <FieldShell
          variant={variant}
          size={size}
          error={!!error}
          success={!!success}
          disabled={disabled}
          readOnly={readOnly}
          leadingIcon={leadingIcon}
          trailingAction={
            <button
              type="button"
              className={`${styles.trailingActionBtn} alloy-icon-slot`}
              onClick={() => setVisible(v => !v)}
              tabIndex={disabled ? -1 : 0}
              aria-label={visible ? 'Hide password' : 'Show password'}
              aria-pressed={visible}
            >
              {visible
                ? <EyeOffIcon size={iconSize} />
                : <EyeIcon    size={iconSize} />
              }
            </button>
          }
        >
          <input
            ref={ref}
            id={fieldId}
            type={visible ? 'text' : 'password'}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={error ? true : undefined}
            autoComplete="current-password"
            className={clsx(styles.control)}
            {...props}
          />
        </FieldShell>
      </FieldWrapper>
    );
  },
);

PasswordField.displayName = 'PasswordField';
