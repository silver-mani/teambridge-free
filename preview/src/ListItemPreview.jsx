/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · ListItem Preview
   Sizes · Slots · States · Realistic examples · Dark mode
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useIsMobile } from './useIsMobile.js'

/* ── Icons ───────────────────────────────────────────────────────────────────── */
const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.35419 21C10.0593 21.6224 10.9856 22 12.0001 22C13.0146 22 13.9409 21.6224 14.6461 21M18.0001 8C18.0001 6.4087 17.3680 4.88258 16.2428 3.75736C15.1176 2.63214 13.5914 2 12.0001 2C10.4088 2 8.88265 2.63214 7.75744 3.75736C6.63222 4.88258 6.00008 6.4087 6.00008 8C6.00008 11.0902 5.22056 13.206 4.34976 14.6054C3.61513 15.7859 3.24781 16.3761 3.26157 16.5408C3.27695 16.7231 3.31568 16.7926 3.46253 16.9016C3.59521 17 4.19334 17 5.38961 17H18.6106C19.8069 17 20.405 17 20.5377 16.9016C20.6845 16.7926 20.7233 16.7231 20.7387 16.5408C20.7524 16.3761 20.3851 15.7859 19.6505 14.6054C18.7797 13.206 18.0001 11.0902 18.0001 8Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 11H7C5.89543 11 5 11.8954 5 13V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V13C19 11.8954 18.1046 11 17 11ZM17 11V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const LifeBuoyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.13626 9.13628L4.92893 4.92896M9.13626 14.8638L4.92893 19.0711M14.8638 14.8638L19.0711 19.0711M14.8638 9.13628L19.0711 4.92896M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const Trash2Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const CreditCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 10H2M2 8.2L2 15.8C2 16.9201 2 17.4802 2.21799 17.908C2.40973 18.2843 2.71569 18.5903 3.09202 18.782C3.51984 19 4.07989 19 5.2 19L18.8 19C19.9201 19 20.4802 19 20.908 18.782C21.2843 18.5903 21.5903 18.2843 21.782 17.908C22 17.4802 22 16.9201 22 15.8V8.2C22 7.07989 22 6.51984 21.782 6.09202C21.5903 5.71569 21.2843 5.40973 20.908 5.21799C20.4802 5 19.9201 5 18.8 5L5.2 5C4.07989 5 3.51984 5 3.09202 5.21799C2.71569 5.40973 2.40973 5.71569 2.21799 6.09202C2 6.51984 2 7.07989 2 8.2Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12H22M12 2C9.33333 5.33333 8 8.66667 8 12C8 15.3333 9.33333 18.6667 12 22C14.6667 18.6667 16 15.3333 16 12C16 8.66667 14.6667 5.33333 12 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.75"/>
    <path d="M6.6 15C7.32843 15 7.9 14.4284 7.9 13.7C7.9 12.9716 7.32843 12.4 6.6 12.4C5.87157 12.4 5.3 12.9716 5.3 13.7C5.3 14.4284 5.87157 15 6.6 15Z" fill="currentColor"/>
    <path d="M8.6 10C9.32843 10 9.9 9.42843 9.9 8.7C9.9 7.97157 9.32843 7.4 8.6 7.4C7.87157 7.4 7.3 7.97157 7.3 8.7C7.3 9.42843 7.87157 10 8.6 10Z" fill="currentColor"/>
    <path d="M15.4 10C16.1284 10 16.7 9.42843 16.7 8.7C16.7 7.97157 16.1284 7.4 15.4 7.4C14.6716 7.4 14.1 7.97157 14.1 8.7C14.1 9.42843 14.6716 10 15.4 10Z" fill="currentColor"/>
    <path d="M17.4 15C18.1284 15 18.7 14.4284 18.7 13.7C18.7 12.9716 18.1284 12.4 17.4 12.4C16.6716 12.4 16.1 12.9716 16.1 13.7C16.1 14.4284 16.6716 15 17.4 15Z" fill="currentColor"/>
  </svg>
)
const MoreHorizIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2.26946V6.4C14 6.96005 14 7.24008 14.109 7.45399C14.2049 7.64215 14.3578 7.79513 14.546 7.89101C14.7599 8 15.0399 8 15.6 8H19.7305M20 9.98822V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H12.0118C12.7455 2 13.1124 2 13.4577 2.08289C13.7638 2.15638 14.0564 2.27759 14.3249 2.44208C14.6276 2.6276 14.887 2.88703 15.4059 3.40589L18.5941 6.59411C19.113 7.11297 19.3724 7.3724 19.5579 7.67515C19.7224 7.94356 19.8436 8.2362 19.9171 8.5423C20 8.88757 20 9.25445 20 9.98822Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ArrowUpRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C12 22 4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const WifiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12.55C7.24 10.12 10.46 9 12 9C13.54 9 16.76 10.12 19 12.55M1.42 9C4.56 5.69 8.53 4 12 4C15.47 4 19.44 5.69 22.58 9M8.53 16.11C9.58 14.97 10.76 14.45 12 14.45C13.24 14.45 14.42 14.97 15.47 16.11M12 20H12.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const HashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 9H20M4 15H20M10 3L8 21M16 3L14 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ChevronDownPreviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Icon slot wrapper ────────────────────────────────────────────────────────── */
const Icon = ({ children, size = 16, color }) => (
  <span
    className="alloy-icon-slot"
    style={{ width: size, height: size, color: color || 'currentColor' }}
  >
    {children}
  </span>
)

/* ── Avatar ───────────────────────────────────────────────────────────────────── */
const Avatar = ({ initials, bg, size = 32 }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: size, height: size, borderRadius: '50%',
    background: bg || 'var(--color-bg-tertiary)',
    color: 'var(--color-content-inverse-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: size <= 28 ? 'var(--text-xs)' : '11px',
    fontWeight: 'var(--font-weight-semibold)',
    flexShrink: 0,
    userSelect: 'none',
  }}>
    {initials}
  </span>
)

/* ── Icon container ───────────────────────────────────────────────────────────── */
const IconBox = ({ children, bg, color, size = 32 }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: size, height: size, borderRadius: 8,
    background: bg || 'var(--color-bg-tertiary)',
    color: color || 'var(--color-content-secondary)',
    flexShrink: 0,
  }}>
    <span className="alloy-icon-slot" style={{ width: 16, height: 16 }}>
      {children}
    </span>
  </span>
)

/* ── Badge (mirrors Alloy Badge component — use className for variants) ──────── */
const Badge = ({ children, variant = 'neutral' }) => (
  <span className={`alloy-badge alloy-badge-${variant}`}>{children}</span>
)

/* ── Trailing action helpers ─────────────────────────────────────────────────── */
function TaSwitch({ checked }) {
  return (
    <span className="li-ta-switch" data-checked={checked || undefined} aria-hidden="true">
      <span className="li-ta-switch-thumb" />
    </span>
  )
}
function TaCheckbox({ checked }) {
  return (
    <span className="li-ta-checkbox" data-checked={checked || undefined} aria-hidden="true">
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </span>
  )
}
function TaRadio({ checked }) {
  return (
    <span className="li-ta-radio" data-checked={checked || undefined} aria-hidden="true">
      {checked && <span className="li-ta-radio-dot" />}
    </span>
  )
}
function TaBadge({ count, label }) {
  const text = count !== undefined ? String(count) : label
  if (!text) return null
  return <span className="alloy-badge alloy-badge-neutral" aria-hidden="true">{text}</span>
}
function TaExpand({ expanded }) {
  return (
    <span className="li-ta-expand" data-expanded={expanded || undefined} aria-hidden="true">
      <span className="alloy-icon-slot" style={{ width: 16, height: 16 }}><ChevronRightIcon /></span>
    </span>
  )
}
function TaStatus({ variant = 'success' }) {
  return <span className={`li-ta-status li-ta-status-${variant}`} aria-hidden="true" />
}

/* ── ListItem component (preview mirror of Alloy ListItem) ───────────────────── */
const NON_INTERACTIVE_ACTIONS = new Set(['badge', 'status'])

function ListItem({
  label, description, leadingSlot, trailingSlot,
  trailingAction, checked: controlledChecked, defaultChecked = false,
  onCheckedChange, badgeCount, badgeLabel, expanded = false, statusVariant = 'success',
  divider = true, size = 'md', interactive, selected, destructive, disabled, onClick,
}) {
  const isTogglable = trailingAction === 'switch' || trailingAction === 'checkbox' || trailingAction === 'radio'
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isChecked = isTogglable
    ? (controlledChecked !== undefined ? controlledChecked : internalChecked)
    : false

  const isInteractive = interactive || !!onClick || isTogglable ||
    (trailingAction !== undefined && !NON_INTERACTIVE_ACTIONS.has(trailingAction))

  const ariaRole =
    trailingAction === 'switch'   ? 'switch' :
    trailingAction === 'checkbox' ? 'checkbox' :
    trailingAction === 'radio'    ? 'radio' :
    isInteractive                 ? 'button' : undefined

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

  // Resolve trailing element (explicit trailingSlot wins)
  let resolvedTrailing = trailingSlot
  if (resolvedTrailing === undefined && trailingAction) {
    switch (trailingAction) {
      case 'chevron':
        resolvedTrailing = <span className="alloy-icon-slot" style={{ width: 16, height: 16, color: 'var(--color-content-tertiary)' }}><ChevronRightIcon /></span>
        break
      case 'external-link':
        resolvedTrailing = <span className="alloy-icon-slot" style={{ width: 16, height: 16, color: 'var(--color-content-tertiary)' }}><ArrowUpRightIcon /></span>
        break
      case 'switch':    resolvedTrailing = <TaSwitch checked={isChecked} />; break
      case 'checkbox':  resolvedTrailing = <TaCheckbox checked={isChecked} />; break
      case 'radio':     resolvedTrailing = <TaRadio checked={isChecked} />; break
      case 'badge':     resolvedTrailing = <TaBadge count={badgeCount} label={badgeLabel} />; break
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
      data-trailing-action={trailingAction || undefined}
      onClick={!disabled ? handleClick : undefined}
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

/* ── Section / layout helpers ────────────────────────────────────────────────── */
function Section({ title, note, children, isMobile }) {
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

function SubLabel({ children }) {
  return <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>{children}</p>
}

/* ── Card wrapper (rounded border around list groups) ────────────────────────── */
function ListCard({ children, style }) {
  return (
    <div style={{ border: '1px solid var(--color-border-opaque)', borderRadius: 10, overflow: 'hidden', background: 'var(--color-bg-primary)', ...style }}>
      {children}
    </div>
  )
}

/* ── Selectable row (stateful wrapper) ───────────────────────────────────────── */
function SelectableItem(props) {
  const [selected, setSelected] = useState(props.selected || false)
  return <ListItem {...props} selected={selected} onClick={() => setSelected(s => !s)} interactive />
}

/* ── Trailing Actions section (stateful demo) ────────────────────────────────── */
function TrailingActionsSection({ isMobile }) {
  // Switch states (independent per row)
  const [sw1, setSw1] = useState(true)
  const [sw2, setSw2] = useState(false)
  const [sw3, setSw3] = useState(true)
  const [sw4, setSw4] = useState(false)

  // Checkbox states (multi-select)
  const [cb1, setCb1] = useState(true)
  const [cb2, setCb2] = useState(false)
  const [cb3, setCb3] = useState(true)

  // Radio state (single-select — only one active)
  const [radio, setRadio] = useState('system')

  // Expand state
  const [expanded, setExpanded] = useState(false)

  return (
    <Section
      title="Trailing Actions"
      note="Built-in trailingAction prop — chevron · external-link · switch · checkbox · radio · badge · expand · status"
      isMobile={isMobile}
    >
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* ── Chevron & External Link ── */}
        <div>
          <SubLabel>chevron + external-link</SubLabel>
          <ListCard>
            <ListItem size="md" trailingAction="chevron" label="Profile" description="Name, photo, username" leadingSlot={<Icon size={16}><UserIcon /></Icon>} onClick={() => {}} />
            <ListItem size="md" trailingAction="chevron" label="Notifications" description="Push, email, Slack" leadingSlot={<Icon size={16}><BellIcon /></Icon>} onClick={() => {}} />
            <ListItem size="md" trailingAction="external-link" label="Documentation" description="Opens in new tab" leadingSlot={<Icon size={16}><GlobeIcon /></Icon>} onClick={() => {}} />
            <ListItem size="md" trailingAction="external-link" label="API Reference" description="Developer docs" leadingSlot={<Icon size={16}><HashIcon /></Icon>} onClick={() => {}} divider={false} />
          </ListCard>
        </div>

        {/* ── Switch ── */}
        <div>
          <SubLabel>switch — on/off toggle</SubLabel>
          <ListCard>
            <ListItem size="md" trailingAction="switch" checked={sw1} onCheckedChange={setSw1} label="Dark mode" description="Follow system theme" leadingSlot={<Icon size={16}><MoonIcon /></Icon>} />
            <ListItem size="md" trailingAction="switch" checked={sw2} onCheckedChange={setSw2} label="Notifications" description="Push & email alerts" leadingSlot={<Icon size={16}><BellIcon /></Icon>} />
            <ListItem size="md" trailingAction="switch" checked={sw3} onCheckedChange={setSw3} label="Two-factor auth" description="TOTP or SMS" leadingSlot={<Icon size={16}><ShieldIcon /></Icon>} />
            <ListItem size="md" trailingAction="switch" checked={sw4} onCheckedChange={setSw4} label="Wi-Fi sync" description="Background uploads" leadingSlot={<Icon size={16}><WifiIcon /></Icon>} divider={false} />
          </ListCard>
        </div>

        {/* ── Checkbox ── */}
        <div>
          <SubLabel>checkbox — multi-select</SubLabel>
          <ListCard>
            <ListItem size="md" trailingAction="checkbox" checked={cb1} onCheckedChange={setCb1} label="Design tokens" description="Colors, type, spacing" leadingSlot={<Icon size={16}><PaletteIcon /></Icon>} />
            <ListItem size="md" trailingAction="checkbox" checked={cb2} onCheckedChange={setCb2} label="Components" description="Buttons, inputs, cards" leadingSlot={<Icon size={16}><FileIcon /></Icon>} />
            <ListItem size="md" trailingAction="checkbox" checked={cb3} onCheckedChange={setCb3} label="Documentation" description="Usage guides & API" leadingSlot={<Icon size={16}><GlobeIcon /></Icon>} divider={false} />
          </ListCard>
        </div>

        {/* ── Radio ── */}
        <div>
          <SubLabel>radio — single-select</SubLabel>
          <ListCard>
            <ListItem size="md" trailingAction="radio" checked={radio === 'light'} onCheckedChange={() => setRadio('light')} label="Light" description="Always light mode" leadingSlot={<Icon size={16}><SunIcon /></Icon>} />
            <ListItem size="md" trailingAction="radio" checked={radio === 'dark'} onCheckedChange={() => setRadio('dark')} label="Dark" description="Always dark mode" leadingSlot={<Icon size={16}><MoonIcon /></Icon>} />
            <ListItem size="md" trailingAction="radio" checked={radio === 'system'} onCheckedChange={() => setRadio('system')} label="System" description="Follow OS preference" leadingSlot={<Icon size={16}><GlobeIcon /></Icon>} divider={false} />
          </ListCard>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 16 }}>

        {/* ── Badge ── */}
        <div>
          <SubLabel>badge — count & label</SubLabel>
          <ListCard>
            <ListItem size="md" trailingAction="badge" badgeCount={12} label="Inbox" description="Unread messages" leadingSlot={<Icon size={16}><BellIcon /></Icon>} />
            <ListItem size="md" trailingAction="badge" badgeCount={3} label="Mentions" description="You were tagged" leadingSlot={<Icon size={16}><HashIcon /></Icon>} />
            <ListItem size="md" trailingAction="badge" badgeLabel="Beta" label="AI features" description="Experimental" leadingSlot={<Icon size={16}><PaletteIcon /></Icon>} />
            <ListItem size="md" trailingAction="badge" badgeLabel="New" label="Changelog" description="What's new" leadingSlot={<Icon size={16}><FileIcon /></Icon>} divider={false} />
          </ListCard>
        </div>

        {/* ── Expand ── */}
        <div>
          <SubLabel>expand — accordion header</SubLabel>
          <ListCard>
            <ListItem size="md" trailingAction="expand" expanded={expanded} label="Advanced settings" description={expanded ? 'Collapse to hide' : 'Click to expand'} leadingSlot={<Icon size={16}><LockIcon /></Icon>} onClick={() => setExpanded(e => !e)} />
            {expanded && (
              <>
                <ListItem size="md" trailingAction="chevron" label="API keys" leadingSlot={<Icon size={16}><HashIcon /></Icon>} onClick={() => {}} />
                <ListItem size="md" trailingAction="chevron" label="Webhooks" leadingSlot={<Icon size={16}><GlobeIcon /></Icon>} onClick={() => {}} />
                <ListItem size="md" trailingAction="switch" defaultChecked={true} label="Debug mode" leadingSlot={<Icon size={16}><ShieldIcon /></Icon>} />
              </>
            )}
            <ListItem size="md" trailingAction="chevron" label="Billing" leadingSlot={<Icon size={16}><CreditCardIcon /></Icon>} onClick={() => {}} divider={false} />
          </ListCard>
        </div>

        {/* ── Status ── */}
        <div>
          <SubLabel>status — colored dot indicator</SubLabel>
          <ListCard>
            <ListItem size="md" trailingAction="status" statusVariant="success" label="Production" description="All systems operational" leadingSlot={<Icon size={16}><ShieldIcon /></Icon>} />
            <ListItem size="md" trailingAction="status" statusVariant="warning" label="Staging" description="Elevated error rate" leadingSlot={<Icon size={16}><WifiIcon /></Icon>} />
            <ListItem size="md" trailingAction="status" statusVariant="error" label="Database" description="Connection timeout" leadingSlot={<Icon size={16}><LockIcon /></Icon>} />
            <ListItem size="md" trailingAction="status" statusVariant="info" label="CDN" description="Deploying update" leadingSlot={<Icon size={16}><GlobeIcon /></Icon>} divider={false} />
          </ListCard>
        </div>
      </div>
    </Section>
  )
}

// Import SunIcon used in TrailingActionsSection — it already exists in the icon set above
// (reusing the inline SVG SunIcon is fine here)
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Preview ─────────────────────────────────────────────────────────────────── */
export default function ListItemPreview() {
  const isMobile = useIsMobile()
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        /* ─ Shared icon slot ─ */
        .alloy-icon-slot { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .alloy-icon-slot > svg,
        .alloy-icon-slot > svg * { stroke-width: var(--icon-stroke-width, 1.75); }
        .alloy-icon-slot > svg { display: block; width: 100%; height: 100%; }

        /* ─ ListItem root ─ */
        .li-root {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--li-gap, var(--space-3));
          min-height: var(--li-min-height, 48px);
          padding: var(--li-py, 10px) var(--li-px, var(--space-4));
          background: transparent;
          border-bottom: 1px solid transparent;
          box-sizing: border-box;
        }

        /* ─ Sizes ─ */
        .li-sm { --li-min-height: 40px; --li-py: var(--space-2); --li-px: var(--space-3); --li-gap: var(--space-2); --li-label-size: var(--text-xs); --li-desc-size: var(--text-xs); }
        .li-md { --li-min-height: 48px; --li-py: 10px;           --li-px: var(--space-4); --li-gap: var(--space-3); --li-label-size: var(--text-sm);  --li-desc-size: var(--text-xs); }
        .li-lg { --li-min-height: 56px; --li-py: var(--space-3); --li-px: var(--space-4); --li-gap: var(--space-3); --li-label-size: var(--text-base); --li-desc-size: var(--text-sm);  }

        /* ─ Divider ─ */
        .li-divider { border-bottom-color: var(--color-border-opaque); }

        /* ─ Interactive ─ */
        .li-interactive {
          cursor: pointer;
          user-select: none;
          outline: none;
          transition: background-color var(--duration-fast) var(--ease-default);
        }
        .li-interactive:hover:not(.li-disabled) { background: var(--color-bg-transparent); }
        .li-interactive:active:not(.li-disabled) { background: var(--color-bg-secondary); }
        .li-interactive:focus-visible { box-shadow: inset 0 0 0 2px var(--color-border-focus); border-radius: var(--radius-sm); }

        /* ─ Selected ─ */
        .li-selected { background: var(--color-bg-secondary); }
        .li-selected.li-interactive:hover:not(.li-disabled) { background: var(--color-bg-tertiary); }

        /* ─ Destructive ─ */
        .li-destructive .li-label { color: var(--color-red-content-primary); }

        /* ─ Disabled ─ */
        .li-disabled { pointer-events: none; }
        .li-disabled .li-label,
        .li-disabled .li-desc { color: var(--color-content-disabled); }
        .li-disabled .li-leading,
        .li-disabled .li-trailing { opacity: 0.4; }

        /* ─ Slots ─ */
        .li-leading  { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .li-trailing { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        /* ─ Content ─ */
        .li-content { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 2px; }

        /* ─ Label ─ */
        .li-label {
          font-family: var(--font-sans);
          font-size: var(--li-label-size, var(--text-sm));
          font-weight: var(--font-weight-medium);
          color: var(--color-content-primary);
          line-height: var(--line-height-snug);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* ─ Description ─ */
        .li-desc {
          font-family: var(--font-sans);
          font-size: var(--li-desc-size, var(--text-xs));
          font-weight: var(--font-weight-regular);
          color: var(--color-content-tertiary);
          line-height: var(--line-height-snug);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* ─ Trailing action controls ─ */

        /* Switch */
        .li-ta-switch {
          position: relative; display: inline-flex; align-items: center;
          width: 36px; height: 20px; border-radius: 999px;
          background: var(--color-bg-tertiary); border: 1.5px solid var(--color-border-opaque);
          flex-shrink: 0; box-sizing: border-box;
          transition: background-color 120ms ease, border-color 120ms ease;
        }
        .li-ta-switch[data-checked] { background: var(--color-bg-inverse-primary); border-color: var(--color-bg-inverse-primary); }
        .li-ta-switch-thumb {
          position: absolute; left: 2px;
          width: 14px; height: 14px; border-radius: 50%;
          background: var(--color-content-inverse-primary);
          transition: transform 120ms ease;
        }
        .li-ta-switch[data-checked] .li-ta-switch-thumb { transform: translateX(16px); }

        /* Checkbox */
        .li-ta-checkbox {
          display: inline-flex; align-items: center; justify-content: center;
          width: 18px; height: 18px; border-radius: 4px;
          border: 1.5px solid var(--color-border-opaque); background: transparent;
          color: var(--color-content-inverse-primary); box-sizing: border-box; flex-shrink: 0;
          transition: background-color 120ms ease, border-color 120ms ease;
        }
        .li-ta-checkbox[data-checked] { background: var(--color-bg-inverse-primary); border-color: var(--color-bg-inverse-primary); }

        /* Radio */
        .li-ta-radio {
          display: inline-flex; align-items: center; justify-content: center;
          width: 18px; height: 18px; border-radius: 50%;
          border: 1.5px solid var(--color-border-opaque); background: transparent;
          box-sizing: border-box; flex-shrink: 0;
          transition: border-color 120ms ease;
        }
        .li-ta-radio[data-checked] { border-color: var(--color-bg-inverse-primary); }
        .li-ta-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-bg-inverse-primary); }

        /* ─ Alloy Badge (mirrors Badge component) ─ */
        .alloy-badge {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 20px; height: 20px; padding: 0 calc(var(--space-1) + 2px);
          border-radius: var(--radius-full);
          font-family: var(--font-sans); font-size: var(--text-xs);
          font-weight: var(--font-weight-medium); line-height: 1;
          white-space: nowrap; box-sizing: border-box; flex-shrink: 0; user-select: none;
        }
        .alloy-badge-neutral { background: var(--color-bg-tertiary);        color: var(--color-content-secondary);        }
        .alloy-badge-primary { background: var(--color-bg-inverse-primary);  color: var(--color-content-inverse-primary);  }
        .alloy-badge-success { background: var(--color-success-bg);          color: var(--color-success-content);          }
        .alloy-badge-warning { background: var(--color-warning-bg);          color: var(--color-warning-content);          }
        .alloy-badge-error   { background: var(--color-error-bg);            color: var(--color-error-content);            }
        .alloy-badge-info    { background: var(--color-info-bg);             color: var(--color-info-content);             }

        /* Expand */
        .li-ta-expand {
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--color-content-tertiary); flex-shrink: 0;
          transition: transform 120ms ease;
        }
        .li-ta-expand[data-expanded] { transform: rotate(90deg); }

        /* Status dot */
        .li-ta-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .li-ta-status-success { background: var(--color-success-fill); }
        .li-ta-status-warning { background: var(--color-warning-fill); }
        .li-ta-status-error   { background: var(--color-error-fill);   }
        .li-ta-status-info    { background: var(--color-info-fill);     }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Data Display</p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>List Item</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 1.6 }}>3 sizes · leading & trailing slots · divider · interactive · selected · destructive · disabled · dark mode</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 1 — Sizes */}
          <Section title="Sizes" note="sm (40px) · md (48px) · lg (56px) — label + description + leading icon" isMobile={isMobile}>
            <SubLabel>sm</SubLabel>
            <ListCard style={{ marginBottom: 12 }}>
              <ListItem size="sm" label="Account settings" description="Manage your personal information" leadingSlot={<Icon size={14}><UserIcon /></Icon>} trailingSlot={<Icon size={14} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
              <ListItem size="sm" label="Notifications" description="Alerts, emails and push notifications" leadingSlot={<Icon size={14}><BellIcon /></Icon>} trailingSlot={<Icon size={14} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
              <ListItem size="sm" label="Privacy & security" description="Two-factor, sessions, data export" leadingSlot={<Icon size={14}><LockIcon /></Icon>} trailingSlot={<Icon size={14} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} divider={false} />
            </ListCard>

            <SubLabel>md</SubLabel>
            <ListCard style={{ marginBottom: 12 }}>
              <ListItem size="md" label="Account settings" description="Manage your personal information" leadingSlot={<Icon size={16}><UserIcon /></Icon>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
              <ListItem size="md" label="Notifications" description="Alerts, emails and push notifications" leadingSlot={<Icon size={16}><BellIcon /></Icon>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
              <ListItem size="md" label="Privacy & security" description="Two-factor, sessions, data export" leadingSlot={<Icon size={16}><LockIcon /></Icon>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} divider={false} />
            </ListCard>

            <SubLabel>lg</SubLabel>
            <ListCard>
              <ListItem size="lg" label="Account settings" description="Manage your personal information" leadingSlot={<Icon size={20}><UserIcon /></Icon>} trailingSlot={<Icon size={20} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
              <ListItem size="lg" label="Notifications" description="Alerts, emails and push notifications" leadingSlot={<Icon size={20}><BellIcon /></Icon>} trailingSlot={<Icon size={20} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
              <ListItem size="lg" label="Privacy & security" description="Two-factor, sessions, data export" leadingSlot={<Icon size={20}><LockIcon /></Icon>} trailingSlot={<Icon size={20} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} divider={false} />
            </ListCard>
          </Section>

          {/* 2 — Slots */}
          <Section title="Slot Configurations" note="Mix and match leading + trailing slot content" isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div>
                <SubLabel>label only</SubLabel>
                <ListCard>
                  <ListItem label="Day view" />
                  <ListItem label="Week view" />
                  <ListItem label="Month view" divider={false} />
                </ListCard>
              </div>
              <div>
                <SubLabel>label + description</SubLabel>
                <ListCard>
                  <ListItem label="Invoices" description="12 documents" />
                  <ListItem label="Contracts" description="4 documents" />
                  <ListItem label="Receipts" description="38 documents" divider={false} />
                </ListCard>
              </div>
              <div>
                <SubLabel>leading icon + label</SubLabel>
                <ListCard>
                  <ListItem label="Billing" leadingSlot={<Icon size={16}><CreditCardIcon /></Icon>} />
                  <ListItem label="Language" leadingSlot={<Icon size={16}><GlobeIcon /></Icon>} />
                  <ListItem label="Appearance" leadingSlot={<Icon size={16}><PaletteIcon /></Icon>} divider={false} />
                </ListCard>
              </div>
              <div>
                <SubLabel>trailing badge + chevron</SubLabel>
                <ListCard>
                  <ListItem label="Inbox" trailingSlot={<Badge>12</Badge>} />
                  <ListItem label="Notifications" trailingSlot={<Badge>3</Badge>} />
                  <ListItem label="Drafts" trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} divider={false} />
                </ListCard>
              </div>
              <div>
                <SubLabel>icon box leading slot</SubLabel>
                <ListCard>
                  <ListItem label="Security" description="Passwords & 2FA" leadingSlot={<IconBox bg="var(--color-bg-tertiary)"><LockIcon /></IconBox>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
                  <ListItem label="Notifications" description="Push & email" leadingSlot={<IconBox bg="var(--color-bg-tertiary)"><BellIcon /></IconBox>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
                  <ListItem label="Support" description="Help centre" leadingSlot={<IconBox bg="var(--color-bg-tertiary)"><LifeBuoyIcon /></IconBox>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} divider={false} />
                </ListCard>
              </div>
              <div>
                <SubLabel>avatar leading slot</SubLabel>
                <ListCard>
                  <ListItem label="Alex Rivera" description="alex@company.com" leadingSlot={<Avatar initials="AR" bg="var(--Alloy-blue-500)" />} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><MoreHorizIcon /></Icon>} />
                  <ListItem label="Sam Chen" description="sam@company.com" leadingSlot={<Avatar initials="SC" bg="var(--Alloy-purple-500)" />} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><MoreHorizIcon /></Icon>} />
                  <ListItem label="Jordan Kim" description="jordan@company.com" leadingSlot={<Avatar initials="JK" bg="var(--Alloy-matcha-500)" />} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><MoreHorizIcon /></Icon>} divider={false} />
                </ListCard>
              </div>
            </div>
          </Section>

          {/* 3 — States */}
          <Section title="States" note="interactive · selected · destructive · disabled" isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div>
                <SubLabel>interactive (hover me)</SubLabel>
                <ListCard>
                  <ListItem interactive label="Profile" description="Update your photo and name" leadingSlot={<Icon size={16}><UserIcon /></Icon>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
                  <ListItem interactive label="Notifications" leadingSlot={<Icon size={16}><BellIcon /></Icon>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
                  <ListItem interactive label="Security" leadingSlot={<Icon size={16}><LockIcon /></Icon>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} divider={false} />
                </ListCard>
              </div>
              <div>
                <SubLabel>selected (click to toggle)</SubLabel>
                <ListCard>
                  <SelectableItem label="List view" leadingSlot={<Icon size={16}><FileIcon /></Icon>} />
                  <SelectableItem label="Grid view" selected leadingSlot={<Icon size={16}><PaletteIcon /></Icon>} />
                  <SelectableItem label="Calendar view" leadingSlot={<Icon size={16}><BellIcon /></Icon>} divider={false} />
                </ListCard>
              </div>
              <div>
                <SubLabel>destructive</SubLabel>
                <ListCard>
                  <ListItem interactive label="Leave workspace" leadingSlot={<Icon size={16}><GlobeIcon /></Icon>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
                  <ListItem interactive destructive label="Delete account" description="This action cannot be undone" leadingSlot={<Icon size={16} color="var(--color-red-content-primary)"><Trash2Icon /></Icon>} trailingSlot={<Icon size={16} color="var(--color-red-content-primary)"><ChevronRightIcon /></Icon>} divider={false} />
                </ListCard>
              </div>
              <div>
                <SubLabel>disabled</SubLabel>
                <ListCard>
                  <ListItem disabled label="Export data" description="Requires admin access" leadingSlot={<Icon size={16}><FileIcon /></Icon>} trailingSlot={<Icon size={16}><ChevronRightIcon /></Icon>} />
                  <ListItem disabled label="Billing settings" description="No billing permission" leadingSlot={<Icon size={16}><CreditCardIcon /></Icon>} trailingSlot={<Icon size={16}><ChevronRightIcon /></Icon>} />
                  <ListItem label="Available setting" leadingSlot={<Icon size={16}><BellIcon /></Icon>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} divider={false} />
                </ListCard>
              </div>
            </div>
          </Section>

          {/* 4 — Realistic examples */}
          <Section title="Realistic Examples" note="Settings panel · Contacts · File list" isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>

              {/* Settings panel */}
              <div>
                <SubLabel>Settings panel</SubLabel>
                <ListCard>
                  <div style={{ padding: '10px 16px 6px', borderBottom: '1px solid var(--color-border-opaque)' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>Account</span>
                  </div>
                  <ListItem interactive size="md" label="Profile" description="Photo, name, username" leadingSlot={<IconBox bg="var(--color-bg-tertiary)"><UserIcon /></IconBox>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
                  <ListItem interactive size="md" label="Notifications" description="Push, email, Slack" leadingSlot={<IconBox bg="var(--color-bg-tertiary)"><BellIcon /></IconBox>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
                  <ListItem interactive size="md" label="Privacy" description="Two-factor, sessions" leadingSlot={<IconBox bg="var(--color-bg-tertiary)"><LockIcon /></IconBox>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} />
                  <div style={{ padding: '10px 16px 6px', borderTop: '1px solid var(--color-border-opaque)', borderBottom: '1px solid var(--color-border-opaque)' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>Danger zone</span>
                  </div>
                  <ListItem interactive size="md" destructive label="Delete account" description="Permanently remove data" leadingSlot={<Icon size={16} color="var(--color-red-content-primary)"><Trash2Icon /></Icon>} trailingSlot={<Icon size={16} color="var(--color-red-content-primary)"><ChevronRightIcon /></Icon>} divider={false} />
                </ListCard>
              </div>

              {/* Contacts */}
              <div>
                <SubLabel>Contacts</SubLabel>
                <ListCard>
                  {[
                    { name: 'Alex Rivera',   email: 'alex@co.io',    role: 'Designer',        bg: 'var(--Alloy-blue-500)',    initials: 'AR' },
                    { name: 'Sam Chen',      email: 'sam@co.io',     role: 'Engineer',        bg: 'var(--Alloy-purple-500)', initials: 'SC' },
                    { name: 'Jordan Kim',    email: 'jordan@co.io',  role: 'Product Manager', bg: 'var(--Alloy-matcha-500)', initials: 'JK' },
                    { name: 'Riley Moore',   email: 'riley@co.io',   role: 'Marketing',       bg: 'var(--Alloy-orange-500)', initials: 'RM' },
                    { name: 'Taylor Brooks', email: 'taylor@co.io',  role: 'Sales',           bg: 'var(--Alloy-pink-500)',   initials: 'TB' },
                  ].map((p, i, arr) => (
                    <ListItem
                      key={p.name}
                      interactive
                      size="md"
                      label={p.name}
                      description={p.role}
                      leadingSlot={<Avatar initials={p.initials} bg={p.bg} />}
                      trailingSlot={<Icon size={16} color="var(--color-content-disabled)"><MoreHorizIcon /></Icon>}
                      divider={i < arr.length - 1}
                    />
                  ))}
                </ListCard>
              </div>

              {/* File list */}
              <div>
                <SubLabel>File list</SubLabel>
                <ListCard>
                  {[
                    { name: 'Q4 Report.pdf',         size: '2.4 MB',  date: 'Nov 14', check: true  },
                    { name: 'Brand Guidelines.fig',  size: '14.8 MB', date: 'Nov 9',  check: true  },
                    { name: 'User Research.docx',    size: '890 KB',  date: 'Nov 7',  check: false },
                    { name: 'Sprint Planning.xlsx',  size: '1.1 MB',  date: 'Nov 2',  check: false },
                    { name: 'Onboarding Draft.pptx', size: '5.2 MB',  date: 'Oct 28', check: false },
                  ].map((f, i, arr) => (
                    <ListItem
                      key={f.name}
                      interactive
                      size="md"
                      label={f.name}
                      description={`${f.size} · ${f.date}`}
                      leadingSlot={
                        <IconBox bg={f.check ? 'var(--color-bg-tertiary)' : 'var(--color-bg-tertiary)'}>
                          <FileIcon />
                        </IconBox>
                      }
                      trailingSlot={
                        f.check
                          ? <Icon size={16} color="var(--color-content-secondary)"><CheckIcon /></Icon>
                          : <Icon size={16} color="var(--color-content-disabled)"><MoreHorizIcon /></Icon>
                      }
                      selected={f.check}
                      divider={i < arr.length - 1}
                    />
                  ))}
                </ListCard>
              </div>
            </div>
          </Section>

          {/* 5 — No divider */}
          <Section title="Divider Control" note="divider=true (default) vs divider=false on the last item to prevent double borders" isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div>
                <SubLabel>all items with divider (last has extra border)</SubLabel>
                <ListCard>
                  <ListItem size="md" label="First item" divider={true} />
                  <ListItem size="md" label="Second item" divider={true} />
                  <ListItem size="md" label="Last item — divider=true leaves extra border" divider={true} />
                </ListCard>
              </div>
              <div>
                <SubLabel>last item divider=false (clean)</SubLabel>
                <ListCard>
                  <ListItem size="md" label="First item" divider={true} />
                  <ListItem size="md" label="Second item" divider={true} />
                  <ListItem size="md" label="Last item — divider=false, no border" divider={false} />
                </ListCard>
              </div>
            </div>
          </Section>

          {/* 6 — Trailing Actions */}
          <TrailingActionsSection isMobile={isMobile} />

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — ListItem v1</span>
        </div>

      </div>
    </>
  )
}
