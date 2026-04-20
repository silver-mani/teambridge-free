/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Checkbox
   Standalone checkbox — controlled / uncontrolled · indeterminate · sm / md / lg
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef, useId, useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './Checkbox.module.css';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  error?: boolean;
  /** @default 'md' */
  size?: CheckboxSize;
  label?: ReactNode;
  description?: string;
  id?: string;
  name?: string;
  value?: string;
  required?: boolean;
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      indeterminate = false,
      onChange,
      disabled,
      error,
      size = 'md',
      label,
      description,
      id,
      name,
      value,
      required,
      className,
    },
    ref,
  ) => {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;
    const inputRef = useRef<HTMLInputElement>(null);

    // sync indeterminate imperative prop
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isChecked = isControlled ? controlledChecked! : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalChecked(e.target.checked);
      onChange?.(e.target.checked);
    };

    const isCheckedOrIndet = isChecked || indeterminate;

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
            ref={(node) => {
              // merge refs
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }}
            type="checkbox"
            id={checkboxId}
            name={name}
            value={value}
            checked={isChecked}
            disabled={disabled}
            required={required}
            aria-invalid={error || undefined}
            onChange={handleChange}
            className={styles.input}
          />
          <span
            className={clsx(
              styles.box,
              isCheckedOrIndet && styles.boxChecked,
              error            && styles.boxError,
            )}
            aria-hidden="true"
          >
            {indeterminate ? (
              <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
                <path d="M1 1H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : isChecked ? (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : null}
          </span>
        </div>

        {(label || description) && (
          <div className={styles.labelWrap}>
            {label && (
              <label htmlFor={checkboxId} className={styles.label}>
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

Checkbox.displayName = 'Checkbox';
