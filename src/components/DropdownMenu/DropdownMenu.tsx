/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · DropdownMenu
   Floating panel triggered by any element. Items are grouped with optional
   collapsible headings; each option is a full Alloy ListItem.
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import { ListItem } from '../ListItem/ListItem';
import type { ListItemTrailingAction, ListItemStatusVariant, ListItemSize } from '../ListItem/ListItem';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import styles from './DropdownMenu.module.css';

/* ─── Types ──────────────────────────────────────────────────────────────────── */

export interface DropdownMenuOption {
  /** Unique key */
  id: string;
  /** Primary row text */
  label: string;
  /** Secondary line below the label */
  description?: string;
  /** Leading slot — icon, avatar, color swatch, etc. */
  leadingSlot?: ReactNode;
  /** Built-in trailing element */
  trailingAction?: ListItemTrailingAction;
  /** Custom trailing slot (overrides trailingAction) */
  trailingSlot?: ReactNode;
  /** Mutes the row and blocks interaction */
  disabled?: boolean;
  /** Labels the row as a destructive action (red label) */
  destructive?: boolean;
  /** Highlights the row as currently active */
  selected?: boolean;
  /** Controlled checked state (switch / checkbox / radio) */
  checked?: boolean;
  /** Initial checked state for uncontrolled toggles */
  defaultChecked?: boolean;
  /** Called when a togglable trailing action changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Numeric count for the badge trailing action */
  badgeCount?: number;
  /** Label text for the badge trailing action */
  badgeLabel?: string;
  /** Controls the expand chevron rotation */
  expanded?: boolean;
  /** Color of the status dot */
  statusVariant?: ListItemStatusVariant;
  /** Click handler */
  onClick?: () => void;
  /** Show a bottom divider. Defaults to true for all but the last item in a group. */
  divider?: boolean;
}

export interface DropdownMenuGroup {
  /** Unique key */
  id: string;
  /** Optional label rendered above the group's options */
  heading?: string;
  /** When true, the heading row acts as a toggle that collapses/expands options */
  collapsible?: boolean;
  /** Initial expanded state when collapsible. Defaults to true. */
  defaultExpanded?: boolean;
  /** The option rows inside this group */
  options: DropdownMenuOption[];
}

export type DropdownMenuPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end';

export interface DropdownMenuProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Element that opens/closes the menu on click */
  trigger: ReactNode;
  /** Ordered list of option groups */
  groups: DropdownMenuGroup[];
  /** ListItem size applied to every row */
  size?: ListItemSize;
  /** Panel width — number is treated as px */
  width?: number | string;
  /** Where the panel anchors relative to the trigger */
  placement?: DropdownMenuPlacement;
  /** Controlled open state */
  open?: boolean;
  /** Initial open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Prevents the trigger from opening the menu */
  disabled?: boolean;
  /**
   * Close the panel after an option is clicked.
   * Toggle actions (switch / checkbox / radio) always keep the menu open.
   * @default true
   */
  closeOnSelect?: boolean;
  /** Stretches the root and trigger wrapper to fill their container's width. */
  fullWidth?: boolean;
}

/* ─── Internal group section ──────────────────────────────────────────────── */

interface GroupSectionProps {
  group: DropdownMenuGroup;
  size: ListItemSize;
  closeOnSelect: boolean;
  onClose: () => void;
}

function GroupSection({ group, size, closeOnSelect, onClose }: GroupSectionProps) {
  const [expanded, setExpanded] = useState(group.defaultExpanded ?? true);

  return (
    <div>
      {group.heading && (
        <div
          className={clsx(
            styles.groupHeading,
            group.collapsible && styles.groupHeadingCollapsible,
          )}
          onClick={group.collapsible ? () => setExpanded(v => !v) : undefined}
          aria-expanded={group.collapsible ? expanded : undefined}
        >
          <span className={styles.groupHeadingLabel}>{group.heading}</span>
          {group.collapsible && (
            <span
              className={styles.groupChevron}
              data-expanded={expanded || undefined}
              aria-hidden="true"
            >
              <ChevronRightIcon size={12} />
            </span>
          )}
        </div>
      )}

      {expanded && (
        <div role="group" aria-label={group.heading}>
          {group.options.map((option, i) => {
            const isToggle =
              option.trailingAction === 'switch' ||
              option.trailingAction === 'checkbox' ||
              option.trailingAction === 'radio';

            return (
              <ListItem
                key={option.id}
                role="menuitem"
                size={size}
                label={option.label}
                description={option.description}
                leadingSlot={option.leadingSlot}
                trailingAction={option.trailingAction}
                trailingSlot={option.trailingSlot}
                disabled={option.disabled}
                destructive={option.destructive}
                selected={option.selected}
                checked={option.checked}
                defaultChecked={option.defaultChecked}
                onCheckedChange={option.onCheckedChange}
                badgeCount={option.badgeCount}
                badgeLabel={option.badgeLabel}
                expanded={option.expanded}
                statusVariant={option.statusVariant}
                divider={option.divider ?? false}
                className={styles.item}
                onClick={() => {
                  option.onClick?.();
                  if (closeOnSelect && !isToggle) onClose();
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  (
    {
      trigger,
      groups,
      size = 'sm',
      width = 260,
      placement = 'bottom-start',
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      closeOnSelect = true,
      fullWidth = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const containerRef = useRef<HTMLDivElement>(null);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    /* Merge forwarded ref with internal ref */
    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (!ref) return;
        if (typeof ref === 'function') ref(node);
        else (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref],
    );

    const handleSetOpen = useCallback(
      (next: boolean) => {
        if (controlledOpen === undefined) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [controlledOpen, onOpenChange],
    );

    /* Close on outside click */
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        if (!containerRef.current?.contains(e.target as Node)) handleSetOpen(false);
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, handleSetOpen]);

    /* Close on Escape */
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleSetOpen(false);
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [isOpen, handleSetOpen]);

    return (
      <div ref={setRef} className={clsx(styles.root, fullWidth && styles.fullWidth, className)} {...props}>
        {/* Trigger wrapper */}
        <div
          style={{ display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : undefined }}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          tabIndex={disabled ? -1 : 0}
          onClick={!disabled ? () => handleSetOpen(!isOpen) : undefined}
          onKeyDown={!disabled ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSetOpen(!isOpen); }
          } : undefined}
        >
          {trigger}
        </div>

        {/* Floating panel */}
        <div
          className={styles.panel}
          data-open={isOpen || undefined}
          data-placement={placement}
          style={{ width: typeof width === 'number' ? `${width}px` : width }}
          role="menu"
          aria-orientation="vertical"
        >
          <div className={styles.panelInner}>
            {groups.map((group, gi) => (
              <div key={group.id}>
                {gi > 0 && <div className={styles.groupDivider} aria-hidden="true" />}
                <GroupSection
                  group={group}
                  size={size}
                  closeOnSelect={closeOnSelect}
                  onClose={() => handleSetOpen(false)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

DropdownMenu.displayName = 'DropdownMenu';
