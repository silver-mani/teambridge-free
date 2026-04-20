/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · DropdownMenu Preview
   Basic · Groups · Collapsible · All trailing actions · Leading slots ·
   States · Sizes · Placements · Dark mode
   ───────────────────────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useIsMobile } from './useIsMobile.js'
import { Eyebrow } from '../../src/components/Eyebrow/Eyebrow'

/* ── Icons ────────────────────────────────────────────────────────────────── */
const ChevronRightIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ChevronDownIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ArrowUpRightIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M9.35419 21C10.0593 21.6224 10.9856 22 12.0001 22C13.0146 22 13.9409 21.6224 14.6461 21M18.0001 8C18.0001 6.4087 17.3680 4.88258 16.2428 3.75736C15.1176 2.63214 13.5914 2 12.0001 2C10.4088 2 8.88265 2.63214 7.75744 3.75736C6.63222 4.88258 6.00008 6.4087 6.00008 8C6.00008 11.0902 5.22056 13.206 4.34976 14.6054C3.61513 15.7859 3.24781 16.3761 3.26157 16.5408C3.27695 16.7231 3.31568 16.7926 3.46253 16.9016C3.59521 17 4.19334 17 5.38961 17H18.6106C19.8069 17 20.405 17 20.5377 16.9016C20.6845 16.7926 20.7233 16.7231 20.7387 16.5408C20.7524 16.3761 20.3851 15.7859 19.6505 14.6054C18.7797 13.206 18.0001 11.0902 18.0001 8Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const LogOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Trash2Icon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 12H22M12 2C9.33333 5.33333 8 8.66667 8 12C8 15.3333 9.33333 18.6667 12 22C14.6667 18.6667 16 15.3333 16 12C16 8.66667 14.6667 5.33333 12 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 22C12 22 4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const CreditCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M22 10H2M2 8.2L2 15.8C2 16.9201 2 17.4802 2.21799 17.908C2.40973 18.2843 2.71569 18.5903 3.09202 18.782C3.51984 19 4.07989 19 5.2 19L18.8 19C19.9201 19 20.4802 19 20.908 18.782C21.2843 18.5903 21.5903 18.2843 21.782 17.908C22 17.4802 22 16.9201 22 15.8V8.2C22 7.07989 22 6.51984 21.782 6.09202C21.5903 5.71569 21.2843 5.40973 20.908 5.21799C20.4802 5 19.9201 5 18.8 5L5.2 5C4.07989 5 3.51984 5 3.09202 5.21799C2.71569 5.40973 2.40973 5.71569 2.21799 6.09202C2 6.51984 2 7.07989 2 8.2Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const WifiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M5 12.55C7.24 10.12 10.46 9 12 9C13.54 9 16.76 10.12 19 12.55M1.42 9C4.56 5.69 8.53 4 12 4C15.47 4 19.44 5.69 22.58 9M8.53 16.11C9.58 14.97 10.76 14.45 12 14.45C13.24 14.45 14.42 14.97 15.47 16.11M12 20H12.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const HashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M4 9H20M4 15H20M10 3L8 21M16 3L14 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M14 2.26946V6.4C14 6.96005 14 7.24008 14.109 7.45399C14.2049 7.64215 14.3578 7.79513 14.546 7.89101C14.7599 8 15.0399 8 15.6 8H19.7305M20 9.98822V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H12.0118C12.7455 2 13.1124 2 13.4577 2.08289C13.7638 2.15638 14.0564 2.27759 14.3249 2.44208C14.6276 2.6276 14.887 2.88703 15.4059 3.40589L18.5941 6.59411C19.113 7.11297 19.3724 7.3724 19.5579 7.67515C19.7224 7.94356 19.8436 8.2362 19.9171 8.5423C20 8.88757 20 9.25445 20 9.98822Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M17 11H7C5.89543 11 5 11.8954 5 13V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V13C19 11.8954 18.1046 11 17 11ZM17 11V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.75" />
    <path d="M6.6 15C7.32843 15 7.9 14.4284 7.9 13.7C7.9 12.9716 7.32843 12.4 6.6 12.4C5.87157 12.4 5.3 12.9716 5.3 13.7C5.3 14.4284 5.87157 15 6.6 15Z" fill="currentColor" />
    <path d="M8.6 10C9.32843 10 9.9 9.42843 9.9 8.7C9.9 7.97157 9.32843 7.4 8.6 7.4C7.87157 7.4 7.3 7.97157 7.3 8.7C7.3 9.42843 7.87157 10 8.6 10Z" fill="currentColor" />
    <path d="M15.4 10C16.1284 10 16.7 9.42843 16.7 8.7C16.7 7.97157 16.1284 7.4 15.4 7.4C14.6716 7.4 14.1 7.97157 14.1 8.7C14.1 9.42843 14.6716 10 15.4 10Z" fill="currentColor" />
    <path d="M17.4 15C18.1284 15 18.7 14.4284 18.7 13.7C18.7 12.9716 18.1284 12.4 17.4 12.4C16.6716 12.4 16.1 12.9716 16.1 13.7C16.1 14.4284 16.6716 15 17.4 15Z" fill="currentColor" />
  </svg>
)

/* ── Icon wrapper ─────────────────────────────────────────────────────────── */
const Icon = ({ children, size = 16 }) => (
  <span className="alloy-icon-slot" style={{ width: size, height: size }}>
    {children}
  </span>
)

/* ── Avatar ───────────────────────────────────────────────────────────────── */
const Avatar = ({ initials, bg, size = 28 }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: size, height: size, borderRadius: '50%',
    background: bg || 'var(--color-bg-inverse-primary)',
    color: 'var(--color-content-inverse-primary)',
    fontFamily: 'var(--font-sans)', fontSize: 10,
    fontWeight: 'var(--font-weight-semibold)',
    flexShrink: 0, userSelect: 'none',
  }}>
    {initials}
  </span>
)

/* ── Color swatch ─────────────────────────────────────────────────────────── */
const Swatch = ({ color, size = 16 }) => (
  <span style={{
    display: 'inline-block', width: size, height: size,
    borderRadius: 'var(--radius-sm)', background: color, flexShrink: 0,
    border: '1px solid rgba(0,0,0,0.08)',
  }} />
)

/* ── Trailing action controls ────────────────────────────────────────────── */
function TaSwitch({ checked }) {
  return (
    <span className="dm-ta-switch" data-checked={checked || undefined} aria-hidden="true">
      <span className="dm-ta-switch-thumb" />
    </span>
  )
}
function TaCheckbox({ checked }) {
  return (
    <span className="dm-ta-checkbox" data-checked={checked || undefined} aria-hidden="true">
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}
function TaRadio({ checked }) {
  return (
    <span className="dm-ta-radio" data-checked={checked || undefined} aria-hidden="true">
      {checked && <span className="dm-ta-radio-dot" />}
    </span>
  )
}
function TaExpand({ expanded }) {
  return (
    <span className="dm-ta-expand" data-expanded={expanded || undefined} aria-hidden="true">
      <span className="alloy-icon-slot" style={{ width: 16, height: 16 }}>
        <ChevronRightIcon size={16} />
      </span>
    </span>
  )
}
function TaStatus({ variant = 'success' }) {
  return <span className={`dm-ta-status dm-ta-status-${variant}`} aria-hidden="true" />
}

/* ── ListItem (preview mirror) ────────────────────────────────────────────── */
const NON_INTERACTIVE = new Set(['badge', 'status'])

function ListItem({
  label, description, leadingSlot, trailingSlot,
  trailingAction, checked: controlledChecked, defaultChecked = false,
  onCheckedChange, badgeCount, badgeLabel, expanded = false,
  statusVariant = 'success', divider = true, size = 'md',
  interactive, selected, destructive, disabled, onClick,
  role: roleProp,
}) {
  const isTogglable = trailingAction === 'switch' || trailingAction === 'checkbox' || trailingAction === 'radio'
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isChecked = isTogglable
    ? (controlledChecked !== undefined ? controlledChecked : internalChecked)
    : false

  const isInteractive = interactive || !!onClick || isTogglable ||
    (trailingAction !== undefined && !NON_INTERACTIVE.has(trailingAction))

  const ariaRole = roleProp || (
    trailingAction === 'switch'   ? 'switch' :
    trailingAction === 'checkbox' ? 'checkbox' :
    trailingAction === 'radio'    ? 'radio' :
    isInteractive                 ? 'button' : undefined
  )

  const handleClick = () => {
    if (!disabled) {
      if (isTogglable) {
        const next = !isChecked
        if (controlledChecked === undefined) setInternalChecked(next)
        onCheckedChange?.(next)
      }
      onClick?.()
    }
  }

  const handleKeyDown = (e) => {
    if (isInteractive && !disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      handleClick()
    }
  }

  let resolvedTrailing = trailingSlot
  if (resolvedTrailing === undefined && trailingAction) {
    switch (trailingAction) {
      case 'chevron':
        resolvedTrailing = <span className="alloy-icon-slot" style={{ width: 16, height: 16, color: 'var(--color-content-tertiary)' }}><ChevronRightIcon size={16} /></span>
        break
      case 'external-link':
        resolvedTrailing = <span className="alloy-icon-slot" style={{ width: 16, height: 16, color: 'var(--color-content-tertiary)' }}><ArrowUpRightIcon size={16} /></span>
        break
      case 'switch':    resolvedTrailing = <TaSwitch checked={isChecked} />; break
      case 'checkbox':  resolvedTrailing = <TaCheckbox checked={isChecked} />; break
      case 'radio':     resolvedTrailing = <TaRadio checked={isChecked} />; break
      case 'badge':     resolvedTrailing = badgeCount !== undefined
        ? <span className="dm-badge">{String(badgeCount)}</span>
        : badgeLabel
          ? <span className="dm-badge">{badgeLabel}</span>
          : null
        break
      case 'expand':    resolvedTrailing = <TaExpand expanded={expanded} />; break
      case 'status':    resolvedTrailing = <TaStatus variant={statusVariant} />; break
      default:          resolvedTrailing = null
    }
  }

  const cls = [
    'li-root',
    `li-${size}`,
    divider       && 'li-divider',
    isInteractive && 'li-interactive',
    selected      && 'li-selected',
    destructive   && 'li-destructive',
    disabled      && 'li-disabled',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cls}
      role={ariaRole}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      aria-checked={isTogglable ? isChecked : undefined}
      aria-selected={selected || undefined}
      aria-disabled={disabled || undefined}
      onClick={!disabled ? handleClick : undefined}
      onKeyDown={handleKeyDown}
    >
      {leadingSlot && <div className="li-leading">{leadingSlot}</div>}
      <div className="li-content">
        <span className="li-label">{label}</span>
        {description && <span className="li-desc">{description}</span>}
      </div>
      {resolvedTrailing && <div className="li-trailing">{resolvedTrailing}</div>}
    </div>
  )
}

/* ── GroupSection ──────────────────────────────────────────────────────────── */
function GroupSection({ group, size, closeOnSelect, onClose }) {
  const [expanded, setExpanded] = useState(group.defaultExpanded !== false)

  return (
    <div>
      {group.heading && (
        <div
          className={['dm-group-heading', group.collapsible && 'dm-group-heading-collapsible'].filter(Boolean).join(' ')}
          onClick={group.collapsible ? () => setExpanded(v => !v) : undefined}
          aria-expanded={group.collapsible ? expanded : undefined}
        >
          <Eyebrow className="dm-group-heading-label">{group.heading}</Eyebrow>
          {group.collapsible && (
            <span className="dm-group-chevron" data-expanded={expanded || undefined} aria-hidden="true">
              <span className="alloy-icon-slot" style={{ width: 16, height: 16 }}>
                <ChevronRightIcon size={16} />
              </span>
            </span>
          )}
        </div>
      )}
      {expanded && (
        <div role="group" aria-label={group.heading}>
          {group.options.map((option, i) => {
            const isToggle = option.trailingAction === 'switch' ||
              option.trailingAction === 'checkbox' ||
              option.trailingAction === 'radio'
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
                onClick={() => {
                  option.onClick?.()
                  if (closeOnSelect && !isToggle) onClose()
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── DropdownMenu (preview mirror) ───────────────────────────────────────── */
function DropdownMenu({
  trigger, groups, size = 'sm', width = 260,
  placement = 'bottom-start', defaultOpen = false,
  disabled = false, closeOnSelect = true,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const containerRef = useRef(null)

  /* Close on outside click */
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div ref={containerRef} className="dm-root">
      <div
        style={{ display: 'inline-flex' }}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={!disabled ? () => setOpen(v => !v) : undefined}
      >
        {trigger}
      </div>
      <div
        className="dm-panel"
        data-open={open || undefined}
        data-placement={placement}
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
        role="menu"
        aria-orientation="vertical"
      >
        <div className="dm-panel-inner">
          {groups.map((group, gi) => (
            <div key={group.id}>
              {gi > 0 && <div className="dm-group-divider" aria-hidden="true" />}
              <GroupSection
                group={group}
                size={size}
                closeOnSelect={closeOnSelect}
                onClose={() => setOpen(false)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Trigger button ───────────────────────────────────────────────────────── */
function TriggerBtn({ children, icon }) {
  return (
    <button className="dm-trigger-btn">
      {icon && <span className="alloy-icon-slot" style={{ width: 16, height: 16 }}>{icon}</span>}
      <span>{children}</span>
      <span className="alloy-icon-slot" style={{ width: 16, height: 16, color: 'var(--color-content-tertiary)' }}>
        <ChevronDownIcon size={16} />
      </span>
    </button>
  )
}

/* ── Section / Row helpers ────────────────────────────────────────────────── */
function Section({ title, note, children }) {
  const isMobile = useIsMobile()
  return (
    <section style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-xl)', padding: isMobile ? 20 : 32 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 4px' }}>{title}</p>
        {note && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>{note}</p>}
      </div>
      {children}
    </section>
  )
}
function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', margin: 0 }}>{label}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 16 }}>
        {children}
      </div>
    </div>
  )
}

/* ── Stateful demos ───────────────────────────────────────────────────────── */
function TrailingActionsDemo() {
  const [sw1, setSw1] = useState(true)
  const [sw2, setSw2] = useState(false)
  const [sw3, setSw3] = useState(true)
  const [cb1, setCb1] = useState(true)
  const [cb2, setCb2] = useState(false)
  const [cb3, setCb3] = useState(true)
  const [theme, setTheme] = useState('system')

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>

      {/* Chevron + external-link */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>chevron · external-link</p>
        <DropdownMenu
          trigger={<TriggerBtn>Navigate</TriggerBtn>}
          width={240}
          groups={[{
            id: 'nav',
            options: [
              { id: 'profile', label: 'Profile', description: 'Account details', leadingSlot: <Icon><UserIcon /></Icon>, trailingAction: 'chevron' },
              { id: 'settings', label: 'Settings', description: 'Preferences', leadingSlot: <Icon><SettingsIcon /></Icon>, trailingAction: 'chevron' },
              { id: 'docs', label: 'Documentation', description: 'Opens in new tab', leadingSlot: <Icon><GlobeIcon /></Icon>, trailingAction: 'external-link' },
              { id: 'api', label: 'API Reference', description: 'Developer docs', leadingSlot: <Icon><HashIcon /></Icon>, trailingAction: 'external-link' },
            ]
          }]}
        />
      </div>

      {/* Switch */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>switch</p>
        <DropdownMenu
          trigger={<TriggerBtn>Preferences</TriggerBtn>}
          width={252}
          closeOnSelect={false}
          groups={[{
            id: 'prefs',
            options: [
              { id: 'dark', label: 'Dark mode', leadingSlot: <Icon><MoonIcon /></Icon>, trailingAction: 'switch', checked: sw1, onCheckedChange: setSw1 },
              { id: 'notif', label: 'Notifications', leadingSlot: <Icon><BellIcon /></Icon>, trailingAction: 'switch', checked: sw2, onCheckedChange: setSw2 },
              { id: 'wifi', label: 'Wi-Fi sync', leadingSlot: <Icon><WifiIcon /></Icon>, trailingAction: 'switch', checked: sw3, onCheckedChange: setSw3 },
            ]
          }]}
        />
      </div>

      {/* Checkbox */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>checkbox</p>
        <DropdownMenu
          trigger={<TriggerBtn>Include</TriggerBtn>}
          width={240}
          closeOnSelect={false}
          groups={[{
            id: 'include',
            options: [
              { id: 'tokens', label: 'Design tokens', leadingSlot: <Icon><PaletteIcon /></Icon>, trailingAction: 'checkbox', checked: cb1, onCheckedChange: setCb1 },
              { id: 'comps', label: 'Components', leadingSlot: <Icon><FileIcon /></Icon>, trailingAction: 'checkbox', checked: cb2, onCheckedChange: setCb2 },
              { id: 'docs', label: 'Documentation', leadingSlot: <Icon><GlobeIcon /></Icon>, trailingAction: 'checkbox', checked: cb3, onCheckedChange: setCb3 },
            ]
          }]}
        />
      </div>

      {/* Radio */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>radio</p>
        <DropdownMenu
          trigger={<TriggerBtn>Theme</TriggerBtn>}
          width={220}
          closeOnSelect={false}
          groups={[{
            id: 'theme',
            options: [
              { id: 'light', label: 'Light', leadingSlot: <Icon><SunIcon /></Icon>, trailingAction: 'radio', checked: theme === 'light', onCheckedChange: () => setTheme('light') },
              { id: 'dark', label: 'Dark', leadingSlot: <Icon><MoonIcon /></Icon>, trailingAction: 'radio', checked: theme === 'dark', onCheckedChange: () => setTheme('dark') },
              { id: 'system', label: 'System', leadingSlot: <Icon><GlobeIcon /></Icon>, trailingAction: 'radio', checked: theme === 'system', onCheckedChange: () => setTheme('system') },
            ]
          }]}
        />
      </div>

      {/* Badge + status */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>badge · status</p>
        <DropdownMenu
          trigger={<TriggerBtn>View</TriggerBtn>}
          width={260}
          groups={[{
            id: 'view',
            options: [
              { id: 'inbox', label: 'Inbox', leadingSlot: <Icon><BellIcon /></Icon>, trailingAction: 'badge', badgeCount: 12 },
              { id: 'mentions', label: 'Mentions', leadingSlot: <Icon><HashIcon /></Icon>, trailingAction: 'badge', badgeCount: 3 },
              { id: 'ai', label: 'AI Features', leadingSlot: <Icon><PaletteIcon /></Icon>, trailingAction: 'badge', badgeLabel: 'Beta' },
              { id: 'prod', label: 'Production', leadingSlot: <Icon><ShieldIcon /></Icon>, trailingAction: 'status', statusVariant: 'success' },
              { id: 'staging', label: 'Staging', leadingSlot: <Icon><WifiIcon /></Icon>, trailingAction: 'status', statusVariant: 'warning' },
              { id: 'db', label: 'Database', leadingSlot: <Icon><LockIcon /></Icon>, trailingAction: 'status', statusVariant: 'error' },
            ]
          }]}
        />
      </div>

    </div>
  )
}

function CollapsibleDemo() {
  return (
    <DropdownMenu
      trigger={<TriggerBtn>Workspace</TriggerBtn>}
      width={260}
      groups={[
        {
          id: 'account',
          heading: 'Account',
          collapsible: true,
          defaultExpanded: true,
          options: [
            { id: 'profile', label: 'Profile', leadingSlot: <Icon><UserIcon /></Icon>, trailingAction: 'chevron' },
            { id: 'billing', label: 'Billing', leadingSlot: <Icon><CreditCardIcon /></Icon>, trailingAction: 'chevron' },
            { id: 'security', label: 'Security', leadingSlot: <Icon><ShieldIcon /></Icon>, trailingAction: 'chevron' },
          ]
        },
        {
          id: 'project',
          heading: 'Project',
          collapsible: true,
          defaultExpanded: true,
          options: [
            { id: 'settings', label: 'Settings', leadingSlot: <Icon><SettingsIcon /></Icon>, trailingAction: 'chevron' },
            { id: 'integrations', label: 'Integrations', leadingSlot: <Icon><GlobeIcon /></Icon>, trailingAction: 'external-link' },
          ]
        },
        {
          id: 'danger',
          heading: 'Danger zone',
          collapsible: true,
          defaultExpanded: false,
          options: [
            { id: 'delete', label: 'Delete project', leadingSlot: <Icon><Trash2Icon /></Icon>, destructive: true },
          ]
        },
      ]}
    />
  )
}

function LeadingSlotsDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
      {/* Icons */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>icons</p>
        <DropdownMenu
          trigger={<TriggerBtn>Options</TriggerBtn>}
          width={240}
          groups={[{
            id: 'g',
            options: [
              { id: 'a', label: 'Edit profile', leadingSlot: <Icon><UserIcon /></Icon>, trailingAction: 'chevron' },
              { id: 'b', label: 'Notifications', leadingSlot: <Icon><BellIcon /></Icon>, trailingAction: 'chevron' },
              { id: 'c', label: 'Security', leadingSlot: <Icon><ShieldIcon /></Icon>, trailingAction: 'chevron' },
              { id: 'd', label: 'Billing', leadingSlot: <Icon><CreditCardIcon /></Icon>, trailingAction: 'chevron' },
            ]
          }]}
        />
      </div>

      {/* Avatars */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>avatars</p>
        <DropdownMenu
          trigger={<TriggerBtn>Team</TriggerBtn>}
          width={260}
          groups={[{
            id: 'team',
            heading: 'Switch account',
            options: [
              { id: 'u1', label: 'Alex Morgan', description: 'alex@company.io', leadingSlot: <Avatar initials="AM" bg="var(--Alloy-blue-500)" /> },
              { id: 'u2', label: 'Jamie Liu', description: 'jamie@company.io', leadingSlot: <Avatar initials="JL" bg="var(--Alloy-purple-500)" /> },
              { id: 'u3', label: 'Sam Park', description: 'sam@company.io', leadingSlot: <Avatar initials="SP" bg="var(--Alloy-green-500)" /> },
            ]
          }]}
        />
      </div>

      {/* Color swatches */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>color swatches</p>
        <DropdownMenu
          trigger={<TriggerBtn>Label color</TriggerBtn>}
          width={200}
          groups={[{
            id: 'colors',
            options: [
              { id: 'blue',   label: 'Blue',   leadingSlot: <Swatch color="var(--Alloy-blue-500)" /> },
              { id: 'purple', label: 'Purple', leadingSlot: <Swatch color="var(--Alloy-purple-500)" /> },
              { id: 'pink',   label: 'Pink',   leadingSlot: <Swatch color="var(--Alloy-pink-500)" /> },
              { id: 'green',  label: 'Green',  leadingSlot: <Swatch color="var(--Alloy-green-500)" /> },
              { id: 'orange', label: 'Orange', leadingSlot: <Swatch color="var(--Alloy-orange-500)" /> },
            ]
          }]}
        />
      </div>
    </div>
  )
}

function StatesDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
      {/* Selected */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>selected row</p>
        <DropdownMenu
          trigger={<TriggerBtn>Sort by</TriggerBtn>}
          width={220}
          groups={[{
            id: 'sort',
            options: [
              { id: 'name', label: 'Name', selected: true },
              { id: 'date', label: 'Date modified' },
              { id: 'size', label: 'File size' },
              { id: 'kind', label: 'Kind' },
            ]
          }]}
        />
      </div>

      {/* Disabled row */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>disabled rows</p>
        <DropdownMenu
          trigger={<TriggerBtn>Export</TriggerBtn>}
          width={220}
          groups={[{
            id: 'export',
            options: [
              { id: 'pdf', label: 'Export as PDF', leadingSlot: <Icon><FileIcon /></Icon> },
              { id: 'csv', label: 'Export as CSV', leadingSlot: <Icon><FileIcon /></Icon> },
              { id: 'api', label: 'Export via API', leadingSlot: <Icon><HashIcon /></Icon>, disabled: true, description: 'Upgrade to unlock' },
              { id: 'bulk', label: 'Bulk export', leadingSlot: <Icon><GlobeIcon /></Icon>, disabled: true },
            ]
          }]}
        />
      </div>

      {/* Destructive row */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>destructive row</p>
        <DropdownMenu
          trigger={<TriggerBtn icon={<UserIcon />}>User</TriggerBtn>}
          width={240}
          groups={[
            {
              id: 'user-actions',
              options: [
                { id: 'edit', label: 'Edit profile', leadingSlot: <Icon><UserIcon /></Icon>, trailingAction: 'chevron' },
                { id: 'settings', label: 'Settings', leadingSlot: <Icon><SettingsIcon /></Icon>, trailingAction: 'chevron' },
              ]
            },
            {
              id: 'danger',
              options: [
                { id: 'logout', label: 'Sign out', leadingSlot: <Icon><LogOutIcon /></Icon> },
                { id: 'delete', label: 'Delete account', leadingSlot: <Icon><Trash2Icon /></Icon>, destructive: true },
              ]
            }
          ]}
        />
      </div>
    </div>
  )
}

function SizesDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
      {['sm', 'md', 'lg'].map(size => (
        <div key={size}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>{size}</p>
          <DropdownMenu
            trigger={<TriggerBtn>Size {size}</TriggerBtn>}
            size={size}
            width={240}
            groups={[{
              id: 'g',
              heading: `${size.toUpperCase()} rows`,
              options: [
                { id: 'a', label: 'First option', leadingSlot: <Icon size={size === 'lg' ? 18 : 16}><FileIcon /></Icon>, trailingAction: 'chevron' },
                { id: 'b', label: 'Second option', description: 'With description', leadingSlot: <Icon size={size === 'lg' ? 18 : 16}><GlobeIcon /></Icon>, trailingAction: 'chevron' },
                { id: 'c', label: 'Third option', leadingSlot: <Icon size={size === 'lg' ? 18 : 16}><ShieldIcon /></Icon> },
              ]
            }]}
          />
        </div>
      ))}
    </div>
  )
}

function PlacementsDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
      {['bottom-start', 'bottom-end', 'top-start', 'top-end'].map(placement => (
        <div key={placement} style={{ paddingTop: placement.startsWith('top') ? 120 : 0 }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>{placement}</p>
          <DropdownMenu
            trigger={<TriggerBtn>{placement}</TriggerBtn>}
            placement={placement}
            width={200}
            groups={[{
              id: 'g',
              options: [
                { id: 'a', label: 'Option A', trailingAction: 'chevron' },
                { id: 'b', label: 'Option B', trailingAction: 'chevron' },
                { id: 'c', label: 'Option C' },
              ]
            }]}
          />
        </div>
      ))}
    </div>
  )
}

/* ── Main export ──────────────────────────────────────────────────────────── */
export default function DropdownMenuPreview() {
  const isMobile = useIsMobile()
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        /* ─ Icon slot ─ */
        .alloy-icon-slot { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .alloy-icon-slot > svg,
        .alloy-icon-slot > svg * { stroke-width: var(--icon-stroke-width, 1.75); }
        .alloy-icon-slot > svg { display: block; width: 100%; height: 100%; }

        /* ─ Trigger button — mirrors Alloy outlined input shell ─ */
        .dm-trigger-btn {
          display: inline-flex; align-items: center; gap: var(--space-2);
          height: 36px; padding: 0 var(--space-3);
          background: var(--color-bg-primary); border: 1px solid var(--color-border-opaque);
          border-radius: var(--radius-button);
          font-family: var(--font-sans); font-size: var(--text-sm); font-weight: var(--font-weight-medium);
          color: var(--color-content-primary);
          cursor: pointer; white-space: nowrap;
          transition: border-color var(--duration-fast) var(--ease-default),
                      box-shadow var(--duration-fast) var(--ease-default);
          outline: none;
        }
        .dm-trigger-btn:hover:not(:focus-visible) { border-color: var(--color-content-disabled); }
        .dm-trigger-btn:focus-visible {
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px var(--color-bg-focus-ring);
        }

        /* ─ DropdownMenu root ─ */
        .dm-root { position: relative; display: inline-block; }

        /* ─ Panel ─ */
        .dm-panel {
          position: absolute;
          z-index: 200;
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border-opaque);
          border-radius: var(--radius-button);
          box-shadow: var(--shadow-below-md);
          overflow: hidden;
          min-width: 180px;

          opacity: 0;
          transform: translateY(4px) scale(0.98);
          transform-origin: top left;
          pointer-events: none;
          transition:
            opacity var(--duration-fast) var(--ease-default),
            transform var(--duration-fast) var(--ease-default);
        }
        .dm-panel[data-open] {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        /* ─ Placement ─ */
        .dm-panel[data-placement='bottom-start'] { top: calc(100% + 6px); left: 0; transform-origin: top left; }
        .dm-panel[data-placement='bottom-end']   { top: calc(100% + 6px); right: 0; transform-origin: top right; }
        .dm-panel[data-placement='top-start']    { bottom: calc(100% + 6px); left: 0; transform-origin: bottom left; }
        .dm-panel[data-placement='top-end']      { bottom: calc(100% + 6px); right: 0; transform-origin: bottom right; }

        /* ─ Panel inner padding ─ */
        .dm-panel-inner { padding: var(--space-1); }

        /* ─ Item — individually rounded, no per-item dividers ─ */
        .dm-panel .li-root { border-radius: var(--radius-sm); }
        .dm-panel .li-interactive:hover:not(.li-disabled) { background: var(--color-bg-secondary); }
        .dm-panel .li-destructive.li-interactive:hover:not(.li-disabled) { background: var(--color-error-bg); }

        /* ─ Group heading ─ */
        .dm-group-heading {
          display: flex; align-items: center; gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
        }
        .dm-group-heading-label {
          flex: 1; min-width: 0;
          color: var(--color-content-disabled);
        }
        .dm-group-heading-collapsible {
          cursor: pointer; user-select: none; border-radius: var(--radius-sm);
          transition: background-color var(--duration-fast) var(--ease-default);
        }
        .dm-group-heading-collapsible:hover .dm-group-heading-label { color: var(--color-content-secondary); }

        /* ─ Collapse chevron ─ */
        .dm-group-chevron {
          display: inline-flex; align-items: center; flex-shrink: 0;
          color: var(--color-content-tertiary);
          transition: transform var(--duration-fast) var(--ease-default);
        }
        .dm-group-chevron[data-expanded] { transform: rotate(90deg); }

        /* ─ Group divider ─ */
        .dm-group-divider { height: 1px; background: var(--color-border-opaque); margin: var(--space-1) 0; }

        /* ─ ListItem root ─ */
        .li-root {
          position: relative; display: flex; align-items: center;
          gap: var(--li-gap, var(--space-3)); min-height: var(--li-min-height, 40px);
          padding: var(--li-py, var(--space-2)) var(--li-px, var(--space-3));
          background: transparent; border-bottom: 1px solid transparent; box-sizing: border-box;
        }
        .li-sm { --li-min-height: 36px; --li-py: var(--space-1); --li-px: var(--space-3); --li-gap: var(--space-2); --li-label-size: var(--text-xs); --li-desc-size: var(--text-xs); }
        .li-md { --li-min-height: 44px; --li-py: 10px;           --li-px: var(--space-4); --li-gap: var(--space-3); --li-label-size: var(--text-sm);  --li-desc-size: var(--text-xs); }
        .li-lg { --li-min-height: 52px; --li-py: var(--space-3); --li-px: var(--space-4); --li-gap: var(--space-3); --li-label-size: var(--text-base); --li-desc-size: var(--text-sm); }

        .li-divider { border-bottom-color: var(--color-border-opaque); }

        .li-interactive {
          cursor: pointer; user-select: none; outline: none;
          transition: background-color var(--duration-fast) var(--ease-default);
        }
        .li-interactive:hover:not(.li-disabled) { background: var(--color-bg-transparent); }
        .li-destructive.li-interactive:hover:not(.li-disabled) { background: var(--color-error-bg); }
        .li-interactive:active:not(.li-disabled) { background: var(--color-bg-secondary); }
        .li-interactive:focus-visible { box-shadow: inset 0 0 0 2px var(--color-border-focus); border-radius: var(--radius-sm); }

        .li-selected { background: var(--color-bg-secondary); }
        .li-selected.li-interactive:hover:not(.li-disabled) { background: var(--color-bg-tertiary); }

        .li-destructive .li-label { color: var(--color-error-content); }

        .li-disabled { pointer-events: none; }
        .li-disabled .li-label,
        .li-disabled .li-desc { color: var(--color-content-disabled); }
        .li-disabled .li-leading,
        .li-disabled .li-trailing { opacity: 0.4; }

        .li-leading  { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .li-trailing { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        .li-content { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 2px; }

        .li-label {
          font-family: var(--font-sans); font-size: var(--li-label-size, var(--text-sm));
          font-weight: var(--font-weight-medium); color: var(--color-content-primary);
          line-height: var(--line-height-snug); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .li-desc {
          font-family: var(--font-sans); font-size: var(--li-desc-size, var(--text-xs));
          font-weight: var(--font-weight-regular); color: var(--color-content-tertiary);
          line-height: var(--line-height-snug); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* ─ Trailing action controls ─ */
        .dm-ta-switch {
          position: relative; display: inline-flex; align-items: center;
          width: 36px; height: 20px; border-radius: 999px; flex-shrink: 0; box-sizing: border-box;
          background: var(--color-bg-tertiary); border: 1.5px solid var(--color-border-opaque);
          transition: background-color 120ms ease, border-color 120ms ease;
        }
        .dm-ta-switch[data-checked] { background: var(--color-bg-inverse-primary); border-color: var(--color-bg-inverse-primary); }
        .dm-ta-switch-thumb {
          position: absolute; left: 2px; width: 14px; height: 14px; border-radius: 50%;
          background: var(--color-content-inverse-primary);
          transition: transform 120ms ease;
        }
        .dm-ta-switch[data-checked] .dm-ta-switch-thumb { transform: translateX(16px); }

        .dm-ta-checkbox {
          display: inline-flex; align-items: center; justify-content: center;
          width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0; box-sizing: border-box;
          border: 1.5px solid var(--color-border-opaque); background: transparent;
          color: var(--color-content-inverse-primary);
          transition: background-color 120ms ease, border-color 120ms ease;
        }
        .dm-ta-checkbox[data-checked] { background: var(--color-bg-inverse-primary); border-color: var(--color-bg-inverse-primary); }

        .dm-ta-radio {
          display: inline-flex; align-items: center; justify-content: center;
          width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; box-sizing: border-box;
          border: 1.5px solid var(--color-border-opaque); background: transparent;
          transition: border-color 120ms ease;
        }
        .dm-ta-radio[data-checked] { border-color: var(--color-bg-inverse-primary); }
        .dm-ta-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-bg-inverse-primary); }

        .dm-ta-expand {
          display: inline-flex; align-items: center; color: var(--color-content-tertiary);
          transition: transform var(--duration-fast) var(--ease-default);
        }
        .dm-ta-expand[data-expanded] { transform: rotate(90deg); }

        .dm-ta-status {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .dm-ta-status-success { background: var(--color-success-fill); }
        .dm-ta-status-warning { background: var(--color-warning-fill); }
        .dm-ta-status-error   { background: var(--color-error-fill); }
        .dm-ta-status-info    { background: var(--color-info-fill); }

        /* ─ Badge ─ */
        .dm-badge {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px;
          background: var(--color-bg-tertiary); border: 1px solid var(--color-border-opaque);
          font-family: var(--font-sans); font-size: var(--text-xs); font-weight: var(--font-weight-medium);
          color: var(--color-content-secondary); line-height: 1; white-space: nowrap;
          box-sizing: border-box; flex-shrink: 0;
        }

      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Feedback</p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Dropdown Menu</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 1.6 }}>floating panel · group headings · collapsible groups · all trailing actions · click outside / Escape to close</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Basic */}
          <Section title="Basic" note="Single group, no heading — simplest use case">
            <Row label="account context menu">
              <DropdownMenu
                trigger={<TriggerBtn icon={<UserIcon />}>My Account</TriggerBtn>}
                width={240}
                groups={[
                  {
                    id: 'account',
                    options: [
                      { id: 'profile', label: 'View profile', leadingSlot: <Icon><UserIcon /></Icon>, trailingAction: 'chevron' },
                      { id: 'settings', label: 'Settings', leadingSlot: <Icon><SettingsIcon /></Icon>, trailingAction: 'chevron' },
                      { id: 'billing', label: 'Billing', leadingSlot: <Icon><CreditCardIcon /></Icon>, trailingAction: 'chevron' },
                    ]
                  },
                  {
                    id: 'session',
                    options: [
                      { id: 'logout', label: 'Sign out', leadingSlot: <Icon><LogOutIcon /></Icon> },
                    ]
                  }
                ]}
              />
            </Row>
          </Section>

          {/* Group headings */}
          <Section title="Group headings" note="Named sections separated by dividers — non-collapsible labels">
            <Row>
              <DropdownMenu
                trigger={<TriggerBtn>File</TriggerBtn>}
                width={260}
                groups={[
                  {
                    id: 'new',
                    heading: 'Create',
                    options: [
                      { id: 'new-file', label: 'New file', leadingSlot: <Icon><FileIcon /></Icon>, description: '⌘N' },
                      { id: 'new-folder', label: 'New folder', leadingSlot: <Icon><GlobeIcon /></Icon>, description: '⌘⇧N' },
                    ]
                  },
                  {
                    id: 'open',
                    heading: 'Open',
                    options: [
                      { id: 'open-file', label: 'Open file…', leadingSlot: <Icon><FileIcon /></Icon>, description: '⌘O' },
                      { id: 'recent', label: 'Recent files', leadingSlot: <Icon><HashIcon /></Icon>, trailingAction: 'chevron' },
                    ]
                  },
                  {
                    id: 'actions',
                    heading: 'Actions',
                    options: [
                      { id: 'save', label: 'Save', leadingSlot: <Icon><ShieldIcon /></Icon>, description: '⌘S' },
                      { id: 'export', label: 'Export as…', leadingSlot: <Icon><ArrowUpRightIcon size={16} /></Icon>, trailingAction: 'chevron' },
                    ]
                  }
                ]}
              />

              <DropdownMenu
                trigger={<TriggerBtn>Settings</TriggerBtn>}
                width={260}
                groups={[
                  {
                    id: 'workspace',
                    heading: 'Workspace',
                    options: [
                      { id: 'general', label: 'General', leadingSlot: <Icon><SettingsIcon /></Icon>, trailingAction: 'chevron' },
                      { id: 'members', label: 'Members', leadingSlot: <Icon><UserIcon /></Icon>, trailingAction: 'chevron' },
                      { id: 'billing', label: 'Billing', leadingSlot: <Icon><CreditCardIcon /></Icon>, trailingAction: 'chevron' },
                    ]
                  },
                  {
                    id: 'personal',
                    heading: 'Personal',
                    options: [
                      { id: 'profile', label: 'Profile', leadingSlot: <Icon><UserIcon /></Icon>, trailingAction: 'chevron' },
                      { id: 'security', label: 'Security', leadingSlot: <Icon><LockIcon /></Icon>, trailingAction: 'chevron' },
                      { id: 'notifs', label: 'Notifications', leadingSlot: <Icon><BellIcon /></Icon>, trailingAction: 'chevron' },
                    ]
                  }
                ]}
              />
            </Row>
          </Section>

          {/* Collapsible groups */}
          <Section title="Collapsible groups" note="Heading row acts as a toggle — click to collapse/expand the group's options">
            <Row>
              <CollapsibleDemo />
            </Row>
          </Section>

          {/* Trailing actions */}
          <Section title="Trailing actions" note="All 8 built-in trailingAction variants — chevron · external-link · switch · checkbox · radio · badge · expand · status">
            <TrailingActionsDemo />
          </Section>

          {/* Leading slots */}
          <Section title="Leading slots" note="Icons · avatars · color swatches — any React node in the leadingSlot prop">
            <LeadingSlotsDemo />
          </Section>

          {/* States */}
          <Section title="States" note="selected · disabled · destructive — applied per-option">
            <StatesDemo />
          </Section>

          {/* Sizes */}
          <Section title="Sizes" note="sm · md · lg — applied to all ListItem rows via the size prop">
            <SizesDemo />
          </Section>

          {/* Placement */}
          <Section title="Placement" note="bottom-start · bottom-end · top-start · top-end — panel anchors relative to the trigger">
            <PlacementsDemo />
          </Section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Dropdown Menu v1</span>
        </div>

      </div>
    </>
  )
}
