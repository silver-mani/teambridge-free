/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Switch
   Standalone pill toggle — controlled / uncontrolled · sm / md / lg · with label
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './Switch.module.css';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps {
  /** Controlled checked state */
  checked?: boolean;
  /** Uncontrolled default */
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** @default 'md' */
  size?: SwitchSize;
  label?: ReactNode;
  description?: string;
  id?: string;
  name?: string;
  value?: string;
  className?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      disabled,
      size = 'md',
      label,
      description,
      id,
      name,
      value,
      className,
    },
    ref,
  ) => {
    const generatedId = useId();
    const switchId = id ?? generatedId;
    const labelId = `${switchId}-label`;

    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isChecked = isControlled ? controlledChecked! : internalChecked;

    const handleClick = () => {
      if (disabled) return;
      const next = !isChecked;
      if (!isControlled) setInternalChecked(next);
      onChange?.(next);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div className={clsx(styles.root, styles[size], disabled && styles.disabled, className)}>
        <button
          ref={ref}
          type="button"
          role="switch"
          id={switchId}
          aria-checked={isChecked}
          aria-labelledby={label ? labelId : undefined}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          disabled={disabled}
          name={name}
          value={value}
          className={clsx(styles.track, isChecked && styles.trackChecked)}
          data-checked={isChecked || undefined}
          data-disabled={disabled || undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          <span className={styles.thumb} />
        </button>

        {(label || description) && (
          <div className={styles.labelWrap}>
            {label && (
              <label id={labelId} htmlFor={switchId} className={styles.label}>
                {label}
              </label>
            )}
            {description && <span className={styles.description}>{description}</span>}
          </div>
        )}
      </div>
    );
  },
);

Switch.displayName = 'Switch';
