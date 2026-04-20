/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Tabs
   Compound component: <Tabs> + <Tabs.Tab>
   Two visual variants — underline (sliding indicator) and background (pill).
   Manages selection state; consumers render tab panels separately.
   ───────────────────────────────────────────────────────────────────────────── */

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { ComponentPropsWithoutRef, MutableRefObject, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './Tabs.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TabsVariant = 'underline' | 'background';
export type TabsSize = 'md' | 'lg';

export interface TabsProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /**
   * Visual style of the tab bar.
   * - `'underline'` — bottom border on the container, sliding 2px brand indicator under the active tab.
   * - `'background'` — active tab gets a rounded pill background; no container border.
   * @default 'underline'
   */
  variant?: TabsVariant;
  /**
   * Size of the tab labels.
   * @default 'md'
   */
  size?: TabsSize;
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
   * Called when the user selects a different tab.
   */
  onChange?: (value: string) => void;
  /**
   * Disables all tabs in the bar.
   * @default false
   */
  disabled?: boolean;
}

export interface TabsTabProps extends Omit<ComponentPropsWithoutRef<'button'>, 'value'> {
  /**
   * The value this tab represents — matched against the parent's `value`.
   */
  value: string;
  /**
   * Optional icon rendered before the label.
   */
  leadingIcon?: ReactNode;
  /**
   * Optional trailing badge — e.g. a count chip.
   */
  trailingBadge?: ReactNode;
}

// ── Context ───────────────────────────────────────────────────────────────────

interface TabsContextValue {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  variant: TabsVariant;
  size: TabsSize;
  name: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(displayName: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${displayName}> must be rendered inside <Tabs>`);
  return ctx;
}

// ── Tab (individual trigger) ──────────────────────────────────────────────────

const Tab = forwardRef<HTMLButtonElement, TabsTabProps>(
  (
    {
      value: itemValue,
      leadingIcon,
      trailingBadge,
      disabled: itemDisabled,
      onClick,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { value, onChange, disabled: ctxDisabled, name } = useTabsContext('Tabs.Tab');
    const selected = value === itemValue;
    const disabled = ctxDisabled || !!itemDisabled;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={selected}
        name={name}
        disabled={disabled}
        className={clsx(styles.tab, selected && styles.tabSelected, className)}
        onClick={(e) => {
          if (!disabled) onChange(itemValue);
          onClick?.(e);
        }}
        {...props}
      >
        {leadingIcon && (
          <span className={clsx(styles.tabIcon, 'alloy-icon-slot')} aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        {children !== undefined && (
          <span className={styles.tabLabel}>{children}</span>
        )}
        {trailingBadge && (
          <span className={styles.tabBadge}>{trailingBadge}</span>
        )}
      </button>
    );
  },
);
Tab.displayName = 'Tabs.Tab';

// ── Root ──────────────────────────────────────────────────────────────────────

const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      variant = 'underline',
      size = 'md',
      value: valueProp,
      defaultValue = '',
      onChange,
      disabled = false,
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

    // Internal ref for sliding indicator positioning.
    const containerRef = useRef<HTMLDivElement>(null);

    // Slide the underline indicator to the active tab.
    useLayoutEffect(() => {
      const root = containerRef.current;
      if (!root || variant !== 'underline') return;
      const btn = root.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!btn) return;
      root.style.setProperty('--tab-indicator-x', `${btn.offsetLeft}px`);
      root.style.setProperty('--tab-indicator-w', `${btn.offsetWidth}px`);
    }, [value, variant]);

    const handleChange = (v: string) => {
      if (!isControlled) setInternalValue(v);
      onChange?.(v);
    };

    return (
      <TabsContext.Provider value={{ value, onChange: handleChange, disabled, variant, size, name }}>
        <div
          ref={(node) => {
            (containerRef as MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          role="tablist"
          className={clsx(
            styles.root,
            styles[variant],
            styles[size],
            className,
          )}
          {...props}
        >
          {/* Sliding underline indicator — only rendered in underline mode */}
          {variant === 'underline' && (
            <span className={styles.underlineIndicator} aria-hidden="true" />
          )}
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);
TabsRoot.displayName = 'Tabs';

// ── Compound export ───────────────────────────────────────────────────────────

export const Tabs = Object.assign(TabsRoot, { Tab });
