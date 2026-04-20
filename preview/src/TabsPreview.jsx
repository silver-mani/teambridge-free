/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Tabs Preview
   Underline (sliding indicator) · Background (pill) · Sizes · Icons · Badge · Disabled · Dark
   ───────────────────────────────────────────────────────────────────────────── */

import { useState, useRef, useLayoutEffect } from 'react'
import { useIsMobile } from './useIsMobile.js'

/* ── Icons (from Alloy icon library — 24×24 viewBox, currentColor stroke) ────── */
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21V13.6C9 13.0399 9 12.7599 9.10899 12.546C9.20487 12.3578 9.35785 12.2049 9.54601 12.109C9.75992 12 10.0399 12 10.6 12H13.4C13.9601 12 14.2401 12 14.454 12.109C14.6422 12.2049 14.7951 12.3578 14.891 12.546C15 12.7599 15 13.0399 15 13.6V21M11.0177 2.764L4.23539 8.03912C3.78202 8.39175 3.55534 8.56806 3.39203 8.78886C3.24737 8.98444 3.1396 9.20478 3.07403 9.43905C3 9.70352 3 9.9907 3 10.5651V17.8C3 18.9201 3 19.4801 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4801 21 18.9201 21 17.8V10.5651C21 9.9907 21 9.70352 20.926 9.43905C20.8604 9.20478 20.7526 8.98444 20.608 8.78886C20.4447 8.56806 20.218 8.39175 19.7646 8.03913L12.9823 2.764C12.631 2.49075 12.4553 2.35412 12.2613 2.3016C12.0902 2.25526 11.9098 2.25526 11.7387 2.3016C11.5447 2.35412 11.369 2.49075 11.0177 2.764Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2.26946V6.4C14 6.96005 14 7.24008 14.109 7.45399C14.2049 7.64215 14.3578 7.79513 14.546 7.89101C14.7599 8 15.0399 8 15.6 8H19.7305M20 9.98822V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H12.0118C12.7455 2 13.1124 2 13.4577 2.08289C13.7638 2.15638 14.0564 2.27759 14.3249 2.44208C14.6276 2.6276 14.887 2.88703 15.4059 3.40589L18.5941 6.59411C19.113 7.11297 19.3724 7.3724 19.5579 7.67515C19.7224 7.94356 19.8436 8.2362 19.9171 8.5423C20 8.88757 20 9.25445 20 9.98822Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 15.8369C19.4559 16.5683 20.7042 17.742 21.6153 19.2096C21.7957 19.5003 21.8859 19.6456 21.9171 19.8468C21.9805 20.2558 21.7008 20.7585 21.32 20.9204C21.1325 21 20.9217 21 20.5 21M16 11.5322C17.4817 10.7959 18.5 9.26686 18.5 7.5C18.5 5.73314 17.4817 4.20411 16 3.46776M14 7.5C14 9.98528 11.9853 12 9.50002 12C7.01474 12 5.00002 9.98528 5.00002 7.5C5.00002 5.01472 7.01474 3 9.50002 3C11.9853 3 14 5.01472 14 7.5ZM2.55925 18.9383C4.15356 16.5446 6.66939 15 9.50002 15C12.3306 15 14.8465 16.5446 16.4408 18.9383C16.7901 19.4628 16.9647 19.725 16.9446 20.0599C16.9289 20.3207 16.758 20.64 16.5496 20.7976C16.2819 21 15.9138 21 15.1777 21H3.82238C3.08619 21 2.7181 21 2.45046 20.7976C2.24207 20.64 2.07111 20.3207 2.05545 20.0599C2.03535 19.725 2.20998 19.4628 2.55925 18.9383Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.25" />
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
)
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 20V4M6 20V16M12 20V10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ── Stateful tab bar ─────────────────────────────────────────────────────────── */
function ControlledTabs({ defaultValue, variant = 'underline', size = 'md', items, extraClass = '' }) {
  const [value, setValue] = useState(defaultValue)
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || variant !== 'underline') return
    const btn = root.querySelector('[aria-selected="true"]')
    if (!btn) return
    root.style.setProperty('--tab-indicator-x', `${btn.offsetLeft}px`)
    root.style.setProperty('--tab-indicator-w', `${btn.offsetWidth}px`)
  }, [value, variant])

  return (
    <div
      ref={rootRef}
      role="tablist"
      className={`tab-root tab-${variant} tab-${size}${extraClass ? ' ' + extraClass : ''}`}
    >
      {variant === 'underline' && <span className="tab-underline-indicator" aria-hidden="true" />}
      {items.map(item => {
        const selected = value === item.value
        const isDisabled = item.disabled || false
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={isDisabled}
            className={`tab-trigger${selected ? ' tab-selected' : ''}`}
            onClick={() => { if (!isDisabled) setValue(item.value) }}
          >
            {item.icon && <span className="tab-icon alloy-icon-slot" aria-hidden="true">{item.icon}</span>}
            {item.label !== undefined && <span className="tab-label">{item.label}</span>}
            {item.badge !== undefined && <span className="alloy-badge alloy-badge-neutral">{item.badge}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* ── Specimen sub-components ─────────────────────────────────────────────────── */

function SpecimenGroup({ label }) {
  return (
    <div style={{
      padding:      '9px 20px 8px',
      borderTop:    '1px solid var(--color-border-opaque)',
      borderBottom: '1px solid var(--color-border-opaque)',
      background:   'var(--color-bg-secondary)',
    }}>
      <span style={{
        fontFamily:    'var(--font-sans)',
        fontSize:      '10px',
        fontWeight:    700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color:         'var(--color-content-disabled)',
      }}>{label}</span>
    </div>
  )
}

function SpecimenRow({ label, tags = [], note, isMobile, children }) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: isMobile ? '1fr' : '200px 1fr',
      alignItems:          'center',
      borderBottom:        '1px solid var(--color-border-opaque)',
      minHeight:           '52px',
    }}>
      <div style={{
        padding:     '12px 20px',
        borderRight: '1px solid var(--color-border-opaque)',
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
        flexWrap:    'wrap',
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize:   'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color:      'var(--color-content-primary)',
          lineHeight: 1,
        }}>{label}</span>
        {tags.map(t => (
          <span key={t} style={{
            fontFamily:   'var(--font-mono)',
            fontSize:     '10.5px',
            fontWeight:   500,
            color:        'var(--color-content-tertiary)',
            background:   'var(--color-bg-secondary)',
            border:       '1px solid var(--color-border-opaque)',
            borderRadius: 'var(--radius-sm)',
            padding:      '1px 6px',
            lineHeight:   1.6,
          }}>{t}</span>
        ))}
        {note && (
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize:   'var(--text-xs)',
            color:      'var(--color-content-disabled)',
            width:      '100%',
            marginTop:  '2px',
          }}>{note}</span>
        )}
      </div>
      <div style={{ padding: '12px 20px', overflowX: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

function ImportRow() {
  return (
    <div style={{
      padding:      '14px 20px',
      borderBottom: '1px solid var(--color-border-opaque)',
      fontFamily:   'var(--font-mono)',
      fontSize:     '12.5px',
      color:        'var(--color-content-secondary)',
    }}>
      <span className="specimen-import-kw">import </span>
      <span className="specimen-import-exp">{'{ Tabs }'}</span>
      <span className="specimen-import-kw"> from </span>
      <span className="specimen-import-src">'alloy-design-system'</span>
    </div>
  )
}

/* ── Layout helpers ──────────────────────────────────────────────────────────── */
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

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>{label}</span>
      <div style={{ overflowX: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

const ITEMS_BASIC = [
  { value: 'overview',  label: 'Overview'  },
  { value: 'activity',  label: 'Activity'  },
  { value: 'settings',  label: 'Settings'  },
  { value: 'members',   label: 'Members'   },
  { value: 'billing',   label: 'Billing'   },
]

const ITEMS_ICONS = [
  { value: 'home',     icon: <HomeIcon />,     label: 'Home'     },
  { value: 'files',    icon: <FileIcon />,     label: 'Files'    },
  { value: 'members',  icon: <UsersIcon />,    label: 'Members'  },
  { value: 'analytics',icon: <ChartIcon />,   label: 'Analytics'},
  { value: 'settings', icon: <SettingsIcon />, label: 'Settings' },
]

const ITEMS_BADGE = [
  { value: 'inbox',    label: 'Inbox',    badge: 12 },
  { value: 'drafts',   label: 'Drafts',   badge: 3  },
  { value: 'sent',     label: 'Sent'               },
  { value: 'archived', label: 'Archived'            },
]

const ITEMS_DISABLED = [
  { value: 'overview', label: 'Overview'              },
  { value: 'activity', label: 'Activity'              },
  { value: 'settings', label: 'Settings', disabled: true },
  { value: 'billing',  label: 'Billing',  disabled: true },
]

/* ── Preview ─────────────────────────────────────────────────────────────────── */
export default function TabsPreview() {
  const isMobile = useIsMobile()
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        /* ─ Specimen ─ */
        .specimen-import-kw  { color: var(--color-content-disabled); }
        .specimen-import-exp { color: var(--color-content-primary); font-weight: 500; }
        .specimen-import-src { color: var(--color-content-secondary); }

        /* ─ Root ─ */
        .tab-root {
          display: flex;
          gap: 20px;
          height: 56px;
          position: relative;
          background: var(--color-bg-primary);
        }
        .tab-underline {
          align-items: stretch;
          border-bottom: 1px solid var(--color-border-opaque);
        }
        .tab-background {
          align-items: center;
        }

        /* ─ Sliding underline indicator ─ */
        .tab-underline-indicator {
          position: absolute;
          bottom: -1px;
          left: var(--tab-indicator-x, 0px);
          width: var(--tab-indicator-w, 0px);
          height: 2px;
          background: var(--color-border-selected);
          border-radius: 1px;
          transition:
            left  150ms cubic-bezier(0.4, 0, 0.2, 1),
            width  80ms cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          z-index: 1;
          will-change: left, width;
        }

        /* ─ Sizes ─ */
        .tab-md { font-size: var(--text-sm); }
        .tab-lg { font-size: var(--text-base); }

        /* ─ Trigger ─ */
        .tab-trigger {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 0;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--color-content-secondary);
          font-family: var(--font-sans);
          font-size: inherit;
          font-weight: var(--font-weight-regular);
          letter-spacing: var(--tracking-normal);
          white-space: nowrap;
          cursor: pointer;
          position: relative;
          transition: color var(--duration-fast) var(--ease-default);
        }
        .tab-trigger:hover:not(:disabled) {
          color: var(--color-content-primary);
        }
        .tab-trigger:disabled {
          color: var(--color-content-disabled);
          cursor: not-allowed;
        }
        .tab-selected {
          color: var(--color-content-primary);
          font-weight: var(--font-weight-medium);
        }

        /* ─ Background variant ─ */
        .tab-background .tab-trigger {
          padding: var(--space-2) var(--space-3);
        }
        .tab-background .tab-selected {
          background: var(--color-bg-tertiary);
        }

        /* ─ Icon / label / badge ─ */
        .tab-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px; height: 16px;
          flex-shrink: 0;
        }
        /* ─ Shared icon slot (mirrors Alloy artwork.css) ─ */
        .alloy-icon-slot > svg,
        .alloy-icon-slot > svg * { stroke-width: var(--icon-stroke-width, 1.75); }
        .alloy-icon-slot > svg { display: block; width: 100%; height: 100%; }
        .tab-label { line-height: 1; }
        /* ─ Alloy Badge (mirrors Badge component) ─ */
        .alloy-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 calc(var(--space-1) + 2px);
          border-radius: var(--radius-full);
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
          line-height: 1;
          white-space: nowrap;
          box-sizing: border-box;
          flex-shrink: 0;
          user-select: none;
        }
        .alloy-badge-neutral { background: var(--color-bg-tertiary);        color: var(--color-content-secondary);        }
        .alloy-badge-primary { background: var(--color-bg-inverse-primary);  color: var(--color-content-inverse-primary);  }
        .alloy-badge-success { background: var(--color-success-bg);          color: var(--color-success-content);          }
        .alloy-badge-warning { background: var(--color-warning-bg);          color: var(--color-warning-content);          }
        .alloy-badge-error   { background: var(--color-error-bg);            color: var(--color-error-content);            }
        .alloy-badge-info    { background: var(--color-info-bg);             color: var(--color-info-content);             }

      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Navigation</p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Tabs</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 1.6 }}>Underline · Background · md &amp; lg · icon · badge · disabled · dark mode</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 1 — Variants */}
          <Section title="Variants" note="underline — sliding 2px brand indicator · background — active tab gets a rounded pill" isMobile={isMobile}>
            <Row label="underline · md">
              <ControlledTabs variant="underline" size="md" defaultValue="overview" items={ITEMS_BASIC} />
            </Row>
            <Row label="background · md">
              <ControlledTabs variant="background" size="md" defaultValue="overview" items={ITEMS_BASIC} />
            </Row>
            <Row label="underline · lg">
              <ControlledTabs variant="underline" size="lg" defaultValue="overview" items={ITEMS_BASIC} />
            </Row>
            <Row label="background · lg" >
              <ControlledTabs variant="background" size="lg" defaultValue="overview" items={ITEMS_BASIC} />
            </Row>
          </Section>

          {/* 2 — With Leading Icon */}
          <Section title="With Leading Icon" note="leadingIcon slot scales with the font size" isMobile={isMobile}>
            <Row label="underline · md">
              <ControlledTabs variant="underline" size="md" defaultValue="home" items={ITEMS_ICONS} />
            </Row>
            <Row label="background · md">
              <ControlledTabs variant="background" size="md" defaultValue="home" items={ITEMS_ICONS} />
            </Row>
            <Row label="underline · lg">
              <ControlledTabs variant="underline" size="lg" defaultValue="home" items={ITEMS_ICONS} />
            </Row>
            <Row label="background · lg">
              <ControlledTabs variant="background" size="lg" defaultValue="home" items={ITEMS_ICONS} />
            </Row>
          </Section>

          {/* 3 — With Trailing Badge */}
          <Section title="With Trailing Badge" note="trailingBadge accepts any ReactNode — number, string, or custom element" isMobile={isMobile}>
            <Row label="underline · md">
              <ControlledTabs variant="underline" size="md" defaultValue="inbox" items={ITEMS_BADGE} />
            </Row>
            <Row label="background · md">
              <ControlledTabs variant="background" size="md" defaultValue="inbox" items={ITEMS_BADGE} />
            </Row>
          </Section>

          {/* 4 — Disabled */}
          <Section title="Disabled" note="disabled on root disables all · disabled on individual items disables only those" isMobile={isMobile}>
            <Row label="individual disabled">
              <ControlledTabs variant="underline" size="md" defaultValue="overview" items={ITEMS_DISABLED} />
            </Row>
            <Row label="all disabled">
              <ControlledTabs variant="underline" size="md" defaultValue="overview" items={[
                { value: 'overview', label: 'Overview' },
                { value: 'activity', label: 'Activity' },
                { value: 'settings', label: 'Settings' },
              ].map(i => ({ ...i, disabled: true }))} />
            </Row>
            <Row label="background · individual disabled">
              <ControlledTabs variant="background" size="md" defaultValue="overview" items={ITEMS_DISABLED} />
            </Row>
          </Section>

          {/* 5 — Specimen */}
          <Section
            title="Specimen"
            note="Quick-reference table — scan to identify the exact variant, size, and configuration to name when prompting."
            isMobile={isMobile}
          >
            <div style={{
              background:   'var(--color-bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border:       '1px solid var(--color-border-opaque)',
              overflow:     'hidden',
            }}>

              {/* ── Package ── */}
              <SpecimenGroup label="Package" />
              <ImportRow />

              {/* ── Variant ── */}
              <SpecimenGroup label="Variant" />
              <SpecimenRow label="Underline" tags={['variant="underline"', 'default']} isMobile={isMobile}>
                <ControlledTabs variant="underline" size="md" defaultValue="overview" items={ITEMS_BASIC} />
              </SpecimenRow>
              <SpecimenRow label="Background" tags={['variant="background"']} isMobile={isMobile}>
                <ControlledTabs variant="background" size="md" defaultValue="overview" items={ITEMS_BASIC} />
              </SpecimenRow>

              {/* ── Size ── */}
              <SpecimenGroup label="Size" />
              <SpecimenRow label="MD" tags={['size="md"', 'default']} isMobile={isMobile}>
                <ControlledTabs variant="underline" size="md" defaultValue="overview" items={ITEMS_BASIC} />
              </SpecimenRow>
              <SpecimenRow label="LG" tags={['size="lg"']} isMobile={isMobile}>
                <ControlledTabs variant="underline" size="lg" defaultValue="overview" items={ITEMS_BASIC} />
              </SpecimenRow>

              {/* ── Content ── */}
              <SpecimenGroup label="Content" />
              <SpecimenRow label="Labels only" tags={['label']} isMobile={isMobile}>
                <ControlledTabs variant="underline" size="md" defaultValue="overview" items={ITEMS_BASIC} />
              </SpecimenRow>
              <SpecimenRow label="With leading icon" tags={['icon']} isMobile={isMobile}>
                <ControlledTabs variant="underline" size="md" defaultValue="home" items={ITEMS_ICONS} />
              </SpecimenRow>
              <SpecimenRow label="With badge" tags={['badge']} isMobile={isMobile}>
                <ControlledTabs variant="underline" size="md" defaultValue="inbox" items={ITEMS_BADGE} />
              </SpecimenRow>

              {/* ── State ── */}
              <SpecimenGroup label="State" />
              <SpecimenRow label="Default" tags={[]} isMobile={isMobile}>
                <ControlledTabs variant="underline" size="md" defaultValue="overview" items={ITEMS_BASIC} />
              </SpecimenRow>
              <SpecimenRow label="Disabled items" tags={['disabled (per item)']} note="Settings and Billing are disabled" isMobile={isMobile}>
                <ControlledTabs variant="underline" size="md" defaultValue="overview" items={ITEMS_DISABLED} />
              </SpecimenRow>
              <SpecimenRow label="All disabled" tags={['disabled (all)']} isMobile={isMobile}>
                <ControlledTabs variant="underline" size="md" defaultValue="overview" items={ITEMS_BASIC.map(i => ({ ...i, disabled: true }))} />
              </SpecimenRow>

            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Tabs v1</span>
        </div>

      </div>
    </>
  )
}
