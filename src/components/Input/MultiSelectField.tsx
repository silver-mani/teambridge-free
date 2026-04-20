/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · MultiSelectField
   Multi-select combobox — chips rendered via Tag · options rendered via ListItem.
   ───────────────────────────────────────────────────────────────────────────── */

import {
  forwardRef,
  useId,
  useRef,
  useState,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { clsx } from 'clsx';
import { FieldWrapper }      from './FieldWrapper';
import type { FieldVariant, FieldSize } from './FieldShell';
import type { FieldLayout }  from './FieldWrapper';
import { ChevronDownIcon }   from '../icons/ChevronDownIcon';
import { Tag }               from '../Tag/Tag';
import type { TagSize }      from '../Tag/Tag';
import { ListItem }          from '../ListItem/ListItem';
import type { ListItemSize } from '../ListItem/ListItem';
import styles                from './Input.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MultiSelectOption {
  value:     string;
  label:     string;
  disabled?: boolean;
}

export interface MultiSelectFieldProps {
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
  layout?:           FieldLayout;
  labelWidth?:       number | string;
  labelDescription?: string;
  /** Option list — each needs a unique `value`. */
  options:           MultiSelectOption[];
  /** Controlled: selected values array. */
  value?:            string[];
  /** Uncontrolled default selection. */
  defaultValue?:     string[];
  /** Called whenever selection changes. */
  onChange?:         (value: string[]) => void;
  placeholder?:      string;
  disabled?:         boolean;
  readOnly?:         boolean;
  id?:               string;
  className?:        string;
}

// ── Size mapping ───────────────────────────────────────────────────────────────
// Chips should be 1 step smaller than the field to sit comfortably inside it.
const CHIP_SIZE: Record<FieldSize, TagSize>      = { sm: 'sm', md: 'sm', lg: 'md' };
const OPTION_SIZE: Record<FieldSize, ListItemSize> = { sm: 'sm', md: 'md', lg: 'lg' };

// ── Component ─────────────────────────────────────────────────────────────────

export const MultiSelectField = forwardRef<HTMLDivElement, MultiSelectFieldProps>(
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
      layout,
      labelWidth,
      labelDescription,
      options,
      value:     controlledValue,
      defaultValue = [],
      onChange,
      placeholder  = 'Select options…',
      disabled,
      readOnly,
      id,
      className,
    },
    ref,
  ) => {
    const generatedId  = useId();
    const fieldId      = id ?? generatedId;
    const listId       = `${fieldId}-list`;
    const containerRef = useRef<HTMLDivElement>(null);

    // ── Selection state (controlled / uncontrolled) ───────────────────────────
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
    const selected = isControlled ? controlledValue! : internalValue;

    const setSelected = useCallback(
      (next: string[]) => {
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    // ── Open state ────────────────────────────────────────────────────────────
    const [open, setOpen] = useState(false);

    useEffect(() => {
      if (!open) return;
      const onMouseDown = (e: globalThis.MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      const onKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('keydown', onKeyDown);
      };
    }, [open]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const toggleOption = (val: string) => {
      if (disabled || readOnly) return;
      const next = selected.includes(val)
        ? selected.filter(v => v !== val)
        : [...selected, val];
      setSelected(next);
    };

    const handleShellKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled || readOnly) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Backspace' && selected.length > 0 && !open) {
        setSelected(selected.slice(0, -1));
      }
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const chevronSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
    const chipSize    = CHIP_SIZE[size];
    const optionSize  = OPTION_SIZE[size];
    const labelMap    = Object.fromEntries(options.map(o => [o.value, o.label]));

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
        <div ref={containerRef} className={styles.msContainer}>

          {/* ── Shell ── */}
          <div
            ref={ref}
            id={fieldId}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            className={clsx(
              styles.msShell,
              styles[variant],
              styles[size],
              open     && styles.msOpen,
              disabled && styles.msDisabled,
            )}
            data-error={error             ? true : undefined}
            data-success={success && !error ? true : undefined}
            data-disabled={disabled        || undefined}
            onClick={() => { if (!disabled && !readOnly) setOpen(o => !o); }}
            onKeyDown={handleShellKeyDown}
          >
            {/* Chips (Alloy Tag) + placeholder */}
            <div className={styles.msBody}>
              {selected.length === 0 ? (
                <span className={styles.msPlaceholder}>{placeholder}</span>
              ) : (
                selected.map(val => (
                  <Tag
                    key={val}
                    size={chipSize}
                    variant="subtle"
                    dismissible={!disabled && !readOnly}
                    onDismiss={() => setSelected(selected.filter(v => v !== val))}
                  >
                    {labelMap[val] ?? val}
                  </Tag>
                ))
              )}
            </div>

            {/* Trailing chevron */}
            <span className={clsx(styles.msChevron, 'alloy-icon-slot', open && styles.msChevronOpen)}>
              <ChevronDownIcon size={chevronSize} />
            </span>
          </div>

          {/* ── Dropdown panel (options via Alloy ListItem) ── */}
          {open && (
            <div
              id={listId}
              role="listbox"
              aria-multiselectable="true"
              aria-label={typeof label === 'string' ? label : 'Options'}
              className={styles.msPanel}
            >
              {options.map(opt => {
                const isSelected = selected.includes(opt.value);
                return (
                  <ListItem
                    key={opt.value}
                    label={opt.label}
                    size={optionSize}
                    trailingAction="checkbox"
                    checked={isSelected}
                    disabled={opt.disabled}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={e => {
                      e.preventDefault(); // keep focus on shell
                    }}
                    onCheckedChange={() => {
                      if (!opt.disabled) toggleOption(opt.value);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </FieldWrapper>
    );
  },
);

MultiSelectField.displayName = 'MultiSelectField';
