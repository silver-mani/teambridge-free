/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · SegmentedControl
   Compound component: <SegmentedControl> + <SegmentedControl.Item>
   Mutually-exclusive selection with radio semantics.
   ───────────────────────────────────────────────────────────────────────────── */

import { createContext, forwardRef, useContext, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, MutableRefObject, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './SegmentedControl.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

export type SegmentedControlSize = 'sm' | 'md' | 'lg';

export interface SegmentedControlProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /**
   * Controlled selected value.
   */
  value?: string;
  /**
   * Initial selected value for uncontrolled usage.
   * @default ''
   */
  defaultValue?: string;
  /**
   * Called when the user selects a different item.
   */
  onChange?: (value: string) => void;
  /**
   * Visual size of the control.
   * @default 'md'
   */
  size?: SegmentedControlSize;
  /**
   * Disables all items in the control.
   * @default false
   */
  disabled?: boolean;
  /**
   * Stretches the control to fill its container; items grow to equal widths.
   * @default false
   */
  fullWidth?: boolean;
}

export interface SegmentedControlItemProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'value'> {
  /**
   * The value this item represents — matched against the parent's `value`.
   */
  value: string;
  /**
   * Optional icon rendered before the label.
   */
  leadingIcon?: ReactNode;
}

// ── Context ──────────────────────────────────────────────────────────────────

interface SCContextValue {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  name: string;
}

const SCContext = createContext<SCContextValue | null>(null);

function useSCContext(displayName: string): SCContextValue {
  const ctx = useContext(SCContext);
  if (!ctx) {
    throw new Error(`<${displayName}> must be rendered inside <SegmentedControl>`);
  }
  return ctx;
}

// ── Item ─────────────────────────────────────────────────────────────────────

const Item = forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  (
    {
      value: itemValue,
      leadingIcon,
      className,
      children,
      disabled: itemDisabled,
      onClick,
      ...props
    },
    ref,
  ) => {
    const { value, onChange, disabled: ctxDisabled, name } = useSCContext(
      'SegmentedControl.Item',
    );
    const selected = value === itemValue;
    const disabled = ctxDisabled || !!itemDisabled;

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={selected}
        name={name}
        disabled={disabled}
        className={clsx(
          styles.item,
          selected && styles.itemSelected,
          className,
        )}
        onClick={(e) => {
          if (!disabled) onChange(itemValue);
          onClick?.(e);
        }}
        {...props}
      >
        {leadingIcon && (
          <span className={clsx(styles.itemIcon, 'alloy-icon-slot')} aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        {children !== undefined && (
          <span className={styles.itemLabel}>{children}</span>
        )}
      </button>
    );
  },
);
Item.displayName = 'SegmentedControl.Item';

// ── Root ─────────────────────────────────────────────────────────────────────

const SegmentedControlRoot = forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      value: valueProp,
      defaultValue = '',
      onChange,
      size = 'md',
      disabled = false,
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : internalValue;
    const name = useId();

    // Internal ref for indicator positioning; merged with the forwarded ref below.
    const containerRef = useRef<HTMLDivElement>(null);

    // Slide the indicator to the currently selected button.
    useLayoutEffect(() => {
      const root = containerRef.current;
      if (!root) return;
      const btn = root.querySelector<HTMLElement>('[aria-checked="true"]');
      if (!btn) return;
      root.style.setProperty('--sc-indicator-x', `${btn.offsetLeft}px`);
      root.style.setProperty('--sc-indicator-w', `${btn.offsetWidth}px`);
    }, [value, size]);

    const handleChange = (v: string) => {
      if (!isControlled) setInternalValue(v);
      onChange?.(v);
    };

    return (
      <SCContext.Provider value={{ value, onChange: handleChange, disabled, name }}>
        <div
          ref={(node) => {
            (containerRef as MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          role="radiogroup"
          className={clsx(
            styles.root,
            styles[size],
            fullWidth && styles.fullWidth,
            className,
          )}
          {...props}
        >
          {/* Sliding selection indicator — positioned via CSS custom properties */}
          <span className={styles.indicator} aria-hidden="true" />
          {children}
        </div>
      </SCContext.Provider>
    );
  },
);
SegmentedControlRoot.displayName = 'SegmentedControl';

// ── Compound export ───────────────────────────────────────────────────────────

export const SegmentedControl = Object.assign(SegmentedControlRoot, { Item });
