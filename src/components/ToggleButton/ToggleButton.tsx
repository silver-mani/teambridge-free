import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Button } from '../Button/Button';
import type { ButtonProps, ButtonVariant } from '../Button/Button';
import styles from './ToggleButton.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

export type ToggleSelectionStyle =
  | 'fill'    // Selected → inverse fill (--color-bg-inverse-primary), like primary Button
  | 'border'; // Selected → --color-border-selected border, bg stays as defaultVariant

export interface ToggleButtonProps extends Omit<ButtonProps, 'variant'> {
  /**
   * Whether the toggle is in its selected (active) state.
   * @default false
   */
  selected?: boolean;
  /**
   * Variant used for the unselected state (controls bg/color base).
   * @default 'secondary'
   */
  defaultVariant?: Extract<ButtonVariant, 'secondary' | 'tertiary' | 'ghost'>;
  /**
   * Visual treatment applied when selected.
   * - `'fill'`   — inverse dark fill (--color-bg-inverse-primary + inverse content)
   * - `'border'` — keeps defaultVariant bg, shows --color-border-selected border
   * @default 'border'
   */
  selectionStyle?: ToggleSelectionStyle;
  /**
   * Called when the user clicks the button to toggle state.
   * Receives the next `selected` value.
   */
  onSelectedChange?: (next: boolean) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      selected        = false,
      defaultVariant  = 'secondary',
      selectionStyle  = 'border',
      onSelectedChange,
      onClick,
      className,
      ...props
    },
    ref,
  ) => {
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      onSelectedChange?.(!selected);
      onClick?.(e);
    };

    const selectedClass = selected
      ? selectionStyle === 'fill'
        ? styles.selectedFill
        : styles.selectedBorder
      : undefined;

    return (
      <Button
        ref={ref}
        variant={defaultVariant}
        aria-pressed={selected}
        className={clsx(selectedClass, className)}
        onClick={handleClick}
        {...props}
      />
    );
  },
);

ToggleButton.displayName = 'ToggleButton';
