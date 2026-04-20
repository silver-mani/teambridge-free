/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · RadioGroup
   Managed group of Radio buttons with label, hint, error
   ───────────────────────────────────────────────────────────────────────────── */

import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { Radio } from '../Radio/Radio';
import type { RadioSize } from '../Radio/Radio';
import styles from './RadioGroup.module.css';

export interface RadioGroupOption {
  value:        string;
  label:        ReactNode;
  description?: string;
  disabled?:    boolean;
}

export interface RadioGroupProps {
  options:        RadioGroupOption[];
  /** Controlled selected value */
  value?:         string;
  defaultValue?:  string;
  onChange?:      (value: string) => void;
  /** Applied to every radio in the group */
  name?:          string;
  disabled?:      boolean;
  /** @default 'md' */
  size?:          RadioSize;
  /** @default 'vertical' */
  orientation?:   'vertical' | 'horizontal';
  label?:         string;
  hint?:          string;
  error?:         string;
  required?:      boolean;
  className?:     string;
}

export function RadioGroup({
  options,
  value:    controlledValue,
  defaultValue,
  onChange,
  name,
  disabled,
  size = 'md',
  orientation = 'vertical',
  label,
  hint,
  error,
  required,
  className,
}: RadioGroupProps) {
  const groupId = useId();
  const groupName = name ?? groupId;
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const selected = isControlled ? controlledValue! : internalValue;

  const handleChange = (val: string) => {
    if (!isControlled) setInternalValue(val);
    onChange?.(val);
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      aria-describedby={hint || error ? `${groupId}-footer` : undefined}
      aria-required={required || undefined}
      aria-invalid={!!error || undefined}
      className={clsx(styles.root, className)}
    >
      {label && (
        <span id={`${groupId}-label`} className={styles.groupLabel}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </span>
      )}

      <div className={clsx(styles.options, orientation === 'horizontal' && styles.horizontal)}>
        {options.map(opt => (
          <Radio
            key={opt.value}
            value={opt.value}
            checked={selected === opt.value}
            onChange={handleChange}
            name={groupName}
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
