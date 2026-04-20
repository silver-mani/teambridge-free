/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · CheckboxGroup
   Managed set of Checkboxes with select-all, label, hint, error
   ───────────────────────────────────────────────────────────────────────────── */

import { useId, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { Checkbox } from '../Checkbox/Checkbox';
import type { CheckboxSize } from '../Checkbox/Checkbox';
import styles from './CheckboxGroup.module.css';

export interface CheckboxGroupOption {
  value:        string;
  label:        ReactNode;
  description?: string;
  disabled?:    boolean;
}

export interface CheckboxGroupProps {
  options:        CheckboxGroupOption[];
  /** Controlled selected values */
  value?:         string[];
  defaultValue?:  string[];
  onChange?:      (value: string[]) => void;
  disabled?:      boolean;
  /** @default 'md' */
  size?:          CheckboxSize;
  /** @default 'vertical' */
  orientation?:   'vertical' | 'horizontal';
  label?:         string;
  hint?:          string;
  error?:         string;
  required?:      boolean;
  /** Show a "Select all" master checkbox */
  selectAll?:     boolean;
  selectAllLabel?: string;
  className?:     string;
}

export function CheckboxGroup({
  options,
  value:    controlledValue,
  defaultValue = [],
  onChange,
  disabled,
  size = 'md',
  orientation = 'vertical',
  label,
  hint,
  error,
  required,
  selectAll,
  selectAllLabel = 'Select all',
  className,
}: CheckboxGroupProps) {
  const groupId    = useId();
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const selected = isControlled ? controlledValue! : internalValue;

  const setSelected = useCallback((next: string[]) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }, [isControlled, onChange]);

  const enabledValues = options.filter(o => !o.disabled).map(o => o.value);
  const allChecked    = enabledValues.length > 0 && enabledValues.every(v => selected.includes(v));
  const someChecked   = enabledValues.some(v => selected.includes(v)) && !allChecked;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected([...new Set([...selected, ...enabledValues])]);
    } else {
      setSelected(selected.filter(v => !enabledValues.includes(v)));
    }
  };

  const handleOption = (val: string, checked: boolean) => {
    setSelected(
      checked ? [...selected, val] : selected.filter(v => v !== val),
    );
  };

  return (
    <div
      role="group"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      aria-describedby={hint || error ? `${groupId}-footer` : undefined}
      className={clsx(styles.root, className)}
    >
      {label && (
        <span id={`${groupId}-label`} className={styles.groupLabel}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </span>
      )}

      {selectAll && (
        <div className={styles.selectAll}>
          <Checkbox
            checked={allChecked}
            indeterminate={someChecked}
            onChange={handleSelectAll}
            disabled={disabled}
            size={size}
            label={selectAllLabel}
          />
        </div>
      )}

      <div className={clsx(styles.options, orientation === 'horizontal' && styles.horizontal)}>
        {options.map(opt => (
          <Checkbox
            key={opt.value}
            value={opt.value}
            checked={selected.includes(opt.value)}
            onChange={checked => handleOption(opt.value, checked)}
            disabled={disabled || opt.disabled}
            error={!!error}
            size={size}
            label={opt.label}
            description={opt.description}
          />
        ))}
      </div>

      {(hint || error) && (
        <p id={`${groupId}-footer`} className={clsx(styles.footer, error && styles.footerError)}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
