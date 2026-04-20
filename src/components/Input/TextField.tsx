/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · TextField
   Single-line text input supporting text / email / number types.
   For password → use PasswordField. For search → use SearchField.
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef, useId } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import { FieldWrapper } from './FieldWrapper';
import { FieldShell }  from './FieldShell';
import type { FieldVariant, FieldSize } from './FieldShell';
import type { FieldLayout } from './FieldWrapper';
import styles from './Input.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

export type TextFieldType = 'text' | 'email' | 'number';

export interface TextFieldProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'size' | 'type'> {
  /** Visible label rendered above the field. */
  label?: ReactNode;
  /** Icon rendered immediately after the label text (e.g. InfoCircleIcon). */
  labelIcon?: ReactNode;
  /** Subtle helper text shown below the field. */
  hint?: string;
  /** Error message — overrides hint, styles the footer and border red. */
  error?: string;
  /** Success message — overrides hint, styles the footer and border green. */
  success?: string;
  /** Appends a red asterisk to the label. */
  required?: boolean;
  /** Visual style. @default 'outlined' */
  variant?: FieldVariant;
  /** Height / type-scale tier. @default 'md' */
  size?: FieldSize;
  /** Input type. @default 'text' */
  type?: TextFieldType;
  /** SVG icon rendered on the leading edge. */
  leadingIcon?: ReactNode;
  /** SVG icon rendered on the trailing edge. */
  trailingIcon?: ReactNode;
  /** Label / control layout direction. @default 'vertical' */
  layout?: FieldLayout;
  /** Label column width in horizontal layout. @default 160 */
  labelWidth?: number | string;
  /** Secondary description line shown below the label in horizontal layout. */
  labelDescription?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      labelIcon,
      hint,
      error,
      success,
      required,
      variant = 'outlined',
      size    = 'md',
      type    = 'text',
      leadingIcon,
      trailingIcon,
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
          trailingIcon={trailingIcon}
        >
          <input
            ref={ref}
            id={fieldId}
            type={type}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={error ? true : undefined}
            aria-describedby={hint || error || success ? `${fieldId}-footer` : undefined}
            className={clsx(styles.control)}
            {...props}
          />
        </FieldShell>
      </FieldWrapper>
    );
  },
);

TextField.displayName = 'TextField';
