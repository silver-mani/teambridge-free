/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · SearchField
   Search input with a leading magnifying-glass icon and an inline clear button
   that appears when the field has a value.
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef, useId, useCallback } from 'react';
import type { ChangeEvent, ComponentPropsWithoutRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import { FieldWrapper } from './FieldWrapper';
import { FieldShell }  from './FieldShell';
import type { FieldVariant, FieldSize } from './FieldShell';
import type { FieldLayout } from './FieldWrapper';
import { SearchSmIcon } from '../icons/SearchSmIcon';
import { XIcon }        from '../icons/XIcon';
import styles from './Input.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SearchFieldProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'size' | 'type'> {
  label?:         ReactNode;
  /** Icon rendered immediately after the label text (e.g. InfoCircleIcon). */
  labelIcon?:     ReactNode;
  hint?:          string;
  error?:         string;
  success?:       string;
  required?:      boolean;
  /** @default 'outlined' */
  variant?:       FieldVariant;
  /** @default 'md' */
  size?:          FieldSize;
  /** Called when the clear (×) button is clicked. Receives an empty string. */
  onClear?:       () => void;
  layout?: FieldLayout;
  labelWidth?: number | string;
  labelDescription?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      label,
      labelIcon,
      hint,
      error,
      success,
      required,
      variant  = 'outlined',
      size     = 'md',
      onClear,
      onChange,
      layout,
      labelWidth,
      labelDescription,
      id,
      value,
      defaultValue,
      disabled,
      readOnly,
      className,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId     = id ?? generatedId;
    const iconSize    = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

    // Determine if a clear button should show (controlled or uncontrolled)
    const hasValue = value !== undefined ? String(value).length > 0 : undefined;

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
      },
      [onChange],
    );

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
          leadingIcon={<SearchSmIcon size={iconSize} />}
          trailingAction={
            hasValue ? (
              <button
                type="button"
                className={`${styles.trailingActionBtn} alloy-icon-slot`}
                onClick={onClear}
                tabIndex={disabled ? -1 : 0}
                aria-label="Clear search"
              >
                <XIcon size={iconSize} />
              </button>
            ) : undefined
          }
        >
          <input
            ref={ref}
            id={fieldId}
            type="search"
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={error ? true : undefined}
            onChange={handleChange}
            className={clsx(styles.control)}
            {...props}
          />
        </FieldShell>
      </FieldWrapper>
    );
  },
);

SearchField.displayName = 'SearchField';
