/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · ListItem
   Flexible row for menus, settings panels, contact lists, command palettes, etc.
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef, useCallback, useState } from 'react';
import type { ComponentPropsWithoutRef, KeyboardEvent, ReactNode } from 'react';
import { clsx } from 'clsx';
import styles from './ListItem.module.css';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { ArrowUpRightIcon } from '../icons/ArrowUpRightIcon';
import { Badge } from '../Badge';

// ── Types ────────────────────────────────────────────────────────────────────

export type ListItemSize = 'sm' | 'md' | 'lg';

export type ListItemTrailingAction =
  | 'chevron'        // right-facing chevron — indicates drill-down navigation
  | 'external-link'  // ↗ arrow — opens outside the current app / context
  | 'switch'         // pill toggle — on/off feature control
  | 'checkbox'       // square checkmark — multi-select
  | 'radio'          // circle dot — single-select among options
  | 'badge'          // count or label pill — notification count, status tag
  | 'expand'         // rotating chevron — accordion / expandable row header
  | 'status';        // colored dot — presence / health / state indicator

export type ListItemStatusVariant = 'success' | 'warning' | 'error' | 'info';

export interface ListItemProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Primary text label. Required — the row always has at least a label.
   */
  label: ReactNode;

  /**
   * Optional secondary line below the label (role, email, file size, etc.).
   */
  description?: ReactNode;

  /**
   * Content rendered at the leading (left) edge of the row.
   * Accepts any node: icon, avatar, checkbox, color swatch, image…
   * For SVG icons wrap in `<span className="alloy-icon-slot">` to inherit system stroke-width.
   */
  leadingSlot?: ReactNode;

  /**
   * Content rendered at the trailing (right) edge of the row.
   * Takes precedence over `trailingAction` when both are provided (escape hatch).
   * For SVG icons wrap in `<span className="alloy-icon-slot">` to inherit system stroke-width.
   */
  trailingSlot?: ReactNode;

  /**
   * Built-in trailing element. When set, the component auto-renders the appropriate
   * control with correct ARIA semantics, animations, and token-based styling.
   * `trailingSlot` overrides this if both are provided.
   */
  trailingAction?: ListItemTrailingAction;

  /**
   * Controlled checked state for `switch`, `checkbox`, and `radio` trailing actions.
   */
  checked?: boolean;

  /**
   * Initial checked value for uncontrolled `switch`, `checkbox`, and `radio` actions.
   * @default false
   */
  defaultChecked?: boolean;

  /**
   * Called when the checked state changes (switch / checkbox / radio).
   * Clicking anywhere on the row triggers the toggle.
   */
  onCheckedChange?: (checked: boolean) => void;

  /**
   * Numeric count displayed in the `badge` trailing action.
   */
  badgeCount?: number;

  /**
   * Text label displayed in the `badge` trailing action (e.g. "Beta", "New").
   * `badgeCount` takes priority if both are provided.
   */
  badgeLabel?: string;

  /**
   * Controls the open/closed state of the `expand` trailing action chevron.
   * @default false
   */
  expanded?: boolean;

  /**
   * Semantic color of the `status` trailing action dot.
   * @default 'success'
   */
  statusVariant?: ListItemStatusVariant;

  /**
   * Renders a 1 px `--color-border-opaque` rule at the bottom of the row.
   * Set to `false` for the last item in a group to avoid a double-border.
   * @default true
   */
  divider?: boolean;

  /**
   * Visual height / text-scale tier.
   * @default 'md'
   */
  size?: ListItemSize;

  /**
   * Adds hover, active, and focus-visible states plus `cursor: pointer`.
   * Automatically enabled when an `onClick` handler or an interactive
   * `trailingAction` (anything except `badge` / `status`) is provided.
   */
  interactive?: boolean;

  /**
   * Highlights the row as the currently active / selected item.
   * Applies `--color-bg-secondary` background.
   */
  selected?: boolean;

  /**
   * Colours the label with `--color-red-content-primary`.
   * Use for irreversible / destructive actions (e.g. "Delete account").
   */
  destructive?: boolean;

  /**
   * Mutes all content to `--color-content-disabled` and blocks pointer events.
   */
  disabled?: boolean;
}

// ── Private trailing-action helpers ──────────────────────────────────────────
// All helpers are aria-hidden — the row element carries ARIA semantics.

const TrailingSwitch = ({ checked }: { checked: boolean }) => (
  <span
    className={styles.taSwitch}
    data-checked={checked || undefined}
    aria-hidden="true"
  >
    <span className={styles.taSwitchThumb} />
  </span>
);

const TrailingCheckbox = ({ checked }: { checked: boolean }) => (
  <span
    className={styles.taCheckbox}
    data-checked={checked || undefined}
    aria-hidden="true"
  >
    {checked && (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M1.5 5L4 7.5L8.5 2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </span>
);

const TrailingRadio = ({ checked }: { checked: boolean }) => (
  <span
    className={styles.taRadio}
    data-checked={checked || undefined}
    aria-hidden="true"
  >
    {checked && <span className={styles.taRadioDot} />}
  </span>
);

const TrailingBadge = ({ count, label }: { count?: number; label?: string }) => {
  const text = count !== undefined ? String(count) : label;
  if (!text) return null;
  return <Badge aria-hidden="true">{text}</Badge>;
};

const TrailingExpand = ({ expanded }: { expanded: boolean }) => (
  <span
    className={styles.taExpand}
    data-expanded={expanded || undefined}
    aria-hidden="true"
  >
    <ChevronRightIcon size={16} color="currentColor" />
  </span>
);

const TrailingStatus = ({ variant }: { variant: ListItemStatusVariant }) => (
  <span
    className={clsx(styles.taStatus, styles[`taStatus_${variant}` as keyof typeof styles])}
    aria-hidden="true"
  />
);

// ── Component ────────────────────────────────────────────────────────────────

const NON_INTERACTIVE_ACTIONS = new Set<ListItemTrailingAction>(['badge', 'status']);

export const ListItem = forwardRef<HTMLDivElement, ListItemProps>(
  (
    {
      label,
      description,
      leadingSlot,
      trailingSlot,
      trailingAction,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      badgeCount,
      badgeLabel,
      expanded = false,
      statusVariant = 'success',
      divider = true,
      size = 'md',
      interactive,
      selected = false,
      destructive = false,
      disabled = false,
      className,
      onClick,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    // ── State (switch / checkbox / radio) ───────────────────────────────────
    const isTogglable =
      trailingAction === 'switch' ||
      trailingAction === 'checkbox' ||
      trailingAction === 'radio';

    const [internalChecked, setInternalChecked] = useState(defaultChecked);

    const isChecked = isTogglable
      ? controlledChecked !== undefined
        ? controlledChecked
        : internalChecked
      : false;

    // ── Interactivity ───────────────────────────────────────────────────────
    const isInteractive =
      interactive ||
      !!onClick ||
      isTogglable ||
      (trailingAction !== undefined && !NON_INTERACTIVE_ACTIONS.has(trailingAction));

    // ── ARIA role ───────────────────────────────────────────────────────────
    const ariaRole =
      trailingAction === 'switch'
        ? ('switch' as const)
        : trailingAction === 'checkbox'
          ? ('checkbox' as const)
          : trailingAction === 'radio'
            ? ('radio' as const)
            : isInteractive
              ? ('button' as const)
              : undefined;

    // ── Unified click handler ───────────────────────────────────────────────
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!disabled) {
          if (isTogglable) {
            const next = !isChecked;
            if (controlledChecked === undefined) {
              setInternalChecked(next);
            }
            onCheckedChange?.(next);
          }
          onClick?.(e);
        }
      },
      [disabled, isTogglable, isChecked, controlledChecked, onCheckedChange, onClick],
    );

    // ── Keyboard activation ─────────────────────────────────────────────────
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (isInteractive && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
        onKeyDown?.(e);
      },
      [isInteractive, disabled, handleClick, onKeyDown],
    );

    // ── Trailing element resolver (trailingSlot wins) ───────────────────────
    const resolvedTrailing: ReactNode = trailingSlot ?? (() => {
      if (!trailingAction) return null;
      switch (trailingAction) {
        case 'chevron':
          return <ChevronRightIcon size={16} color="currentColor" aria-hidden={true} />;
        case 'external-link':
          return <ArrowUpRightIcon size={16} color="currentColor" aria-hidden={true} />;
        case 'switch':
          return <TrailingSwitch checked={isChecked} />;
        case 'checkbox':
          return <TrailingCheckbox checked={isChecked} />;
        case 'radio':
          return <TrailingRadio checked={isChecked} />;
        case 'badge':
          return <TrailingBadge count={badgeCount} label={badgeLabel} />;
        case 'expand':
          return <TrailingExpand expanded={expanded} />;
        case 'status':
          return <TrailingStatus variant={statusVariant} />;
        default:
          return null;
      }
    })();

    return (
      <div
        ref={ref}
        role={ariaRole}
        tabIndex={isInteractive && !disabled ? 0 : undefined}
        aria-checked={isTogglable ? isChecked : undefined}
        aria-selected={selected || undefined}
        aria-disabled={disabled || undefined}
        data-selected={selected || undefined}
        data-disabled={disabled || undefined}
        data-destructive={destructive || undefined}
        data-trailing-action={trailingAction ?? undefined}
        className={clsx(
          styles.root,
          styles[size],
          divider       && styles.divider,
          isInteractive && styles.interactive,
          selected      && styles.selected,
          destructive   && styles.destructive,
          disabled      && styles.disabled,
          className,
        )}
        onClick={!disabled ? handleClick : undefined}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {leadingSlot && (
          <div className={styles.leadingSlot}>
            {leadingSlot}
          </div>
        )}

        <div className={styles.content}>
          <span className={styles.label}>{label}</span>
          {description && (
            <span className={styles.description}>{description}</span>
          )}
        </div>

        {resolvedTrailing && (
          <div className={styles.trailingSlot}>
            {resolvedTrailing}
          </div>
        )}
      </div>
    );
  },
);

ListItem.displayName = 'ListItem';
