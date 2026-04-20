/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Radio
   Standalone radio button — must be grouped via RadioGroup or name attr
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef, useId } from 'react';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './Radio.module.css';

export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioProps {
  /** The value this radio represents */
  value: string;
  /** Controlled checked state */
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  /** @default 'md' */
  size?: RadioSize;
  label?: ReactNode;
  description?: string;
  id?: string;
  name?: string;
  required?: boolean;
  className?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      value,
      checked,
      onChange,
      disabled,
      error,
      size = 'md',
      label,
      description,
      id,
      name,
      required,
      className,
    },
    ref,
  ) => {
    const generatedId = useId();
    const radioId = id ?? generatedId;

    return (
      <div
        className={clsx(
          styles.root,
          styles[size],
          disabled && styles.disabled,
          error    && styles.error,
          className,
        )}
      >
        <div className={styles.controlWrap}>
          <input
            ref={ref}
            type="radio"
            id={radioId}
            name={name}
            value={value}
            checked={checked}
            disabled={disabled}
            required={required}
            aria-invalid={error || undefined}
            onChange={() => onChange?.(value)}
            className={styles.input}
          />
          <span className={clsx(styles.ring, checked && styles.ringChecked, error && styles.ringError)} aria-hidden="true">
            {checked && <span className={styles.dot} />}
          </span>
        </div>

        {(label || description) && (
          <div className={styles.labelWrap}>
            {label && (
              <label htmlFor={radioId} className={styles.label}>
                {label}
                {required && <span className={styles.required} aria-hidden="true"> *</span>}
              </label>
            )}
            {description && <span className={styles.description}>{description}</span>}
          </div>
        )}
      </div>
    );
  },
);

Radio.displayName = 'Radio';
