/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · SelectField
   Custom single-select using Alloy DropdownMenu — no browser-native dropdown.
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef, useId, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { FieldWrapper }    from './FieldWrapper';
import { FieldShell }      from './FieldShell';
import type { FieldVariant, FieldSize } from './FieldShell';
import type { FieldLayout } from './FieldWrapper';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { DropdownMenu }    from '../DropdownMenu/DropdownMenu';
import type { ListItemSize } from '../ListItem/ListItem';
import styles              from './Input.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value:     string;
  label:     string;
  disabled?: boolean;
}

export interface SelectFieldProps {
  label?:            ReactNode;
  labelIcon?:        ReactNode;
  hint?:             string;
  error?:            string;
  success?:          string;
  required?:         boolean;
  /** @default 'outlined' */
  variant?:          FieldVariant;
  /** @default 'md' */
  size?:             FieldSize;
  leadingIcon?:      ReactNode;
  layout?:           FieldLayout;
  labelWidth?:       number | string;
  labelDescription?: string;
  /** Option list — each needs a unique `value`. */
  options:           SelectOption[];
  /** Controlled: currently selected value. */
  value?:            string;
  /** Uncontrolled default selection. */
  defaultValue?:     string;
  /** Called whenever selection changes. */
  onChange?:         (value: string) => void;
  placeholder?:      string;
  disabled?:         boolean;
  readOnly?:         boolean;
  id?:               string;
  className?:        string;
}

// ── Size mapping ───────────────────────────────────────────────────────────────
const OPTION_SIZE: Record<FieldSize, ListItemSize> = { sm: 'sm', md: 'md', lg: 'lg' };

// ── Component ─────────────────────────────────────────────────────────────────

export const SelectField = forwardRef<HTMLDivElement, SelectFieldProps>(
  (
    {
      label,
      labelIcon,
      hint,
      error,
      success,
      required,
      variant          = 'outlined',
      size             = 'md',
      leadingIcon,
      layout,
      labelWidth,
      labelDescription,
      options,
      value:     controlledValue,
      defaultValue = '',
      onChange,
      placeholder  = 'Select an option…',
      disabled,
      readOnly,
      id,
      className,
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId     = id ?? generatedId;

    // ── Selection state (controlled / uncontrolled) ───────────────────────────
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const selected = isControlled ? controlledValue! : internalValue;

    const handleSelect = useCallback(
      (val: string) => {
        if (!isControlled) setInternalValue(val);
        onChange?.(val);
      },
      [isControlled, onChange],
    );

    // ── Open state ────────────────────────────────────────────────────────────
    const [open, setOpen] = useState(false);

    // ── Derived ───────────────────────────────────────────────────────────────
    const selectedLabel = options.find(o => o.value === selected)?.label;
    const chevronSize   = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
    const optionSize    = OPTION_SIZE[size];

    // ── Trigger: FieldShell showing the selected value ────────────────────────
    const trigger = (
      <FieldShell
        variant={variant}
        size={size}
        error={!!error}
        success={!!success}
        disabled={disabled}
        readOnly={readOnly}
        focused={open}
        leadingIcon={leadingIcon}
        trailingIcon={
          <span
            className={clsx(styles.selectChevron, open && styles.selectChevronOpen)}
            aria-hidden="true"
          >
            <ChevronDownIcon size={chevronSize} />
          </span>
        }
      >
        <span
          className={clsx(
            styles.control,
            styles.selectValue,
            !selectedLabel && styles.selectPlaceholder,
          )}
        >
          {selectedLabel ?? placeholder}
        </span>
      </FieldShell>
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
        <DropdownMenu
          ref={ref}
          id={fieldId}
          fullWidth
          trigger={trigger}
          groups={[{
            id: 'options',
            options: options.map(o => ({
              id:       o.value,
              label:    o.label,
              disabled: o.disabled,
              selected: o.value === selected,
              onClick:  () => handleSelect(o.value),
            })),
          }]}
          size={optionSize}
          width="100%"
          placement="bottom-start"
          open={open}
          onOpenChange={setOpen}
          disabled={disabled || readOnly}
        />
      </FieldWrapper>
    );
  },
);

SelectField.displayName = 'SelectField';
