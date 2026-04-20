/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · TextArea
   Multi-line text input. Vertically resizable by default.
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

export interface TextAreaProps
  extends Omit<ComponentPropsWithoutRef<'textarea'>, 'size'> {
  label?:       ReactNode;
  /** Icon rendered immediately after the label text (e.g. InfoCircleIcon). */
  labelIcon?:   ReactNode;
  hint?:        string;
  error?:       string;
  success?:     string;
  required?:    boolean;
  /** @default 'outlined' */
  variant?:     FieldVariant;
  /** @default 'md' */
  size?:        FieldSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  layout?: FieldLayout;
  labelWidth?: number | string;
  labelDescription?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
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
          isTextarea
        >
          <textarea
            ref={ref}
            id={fieldId}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={error ? true : undefined}
            className={clsx(styles.control, styles.textareaControl)}
            {...props}
          />
        </FieldShell>
      </FieldWrapper>
    );
  },
);

TextArea.displayName = 'TextArea';
