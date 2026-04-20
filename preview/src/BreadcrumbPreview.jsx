/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Breadcrumb Preview
   Slash · Chevron · With icon · Without icon · Current-page state · Dark mode
   ───────────────────────────────────────────────────────────────────────────── */

import { useIsMobile } from './useIsMobile.js'

/* ── Icons ─────────────────────────────────────────────────────────────────── */

const HomeLineIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 21V15H15V21" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChevronRightSmIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6L15 12L9 18" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ── Breadcrumb mirror ──────────────────────────────────────────────────────── */

function Breadcrumb({ items = [], separator = 'slash' }) {
  return (
    <nav aria-label="Breadcrumb" style={{ fontFamily: 'var(--font-sans)' }}>
      <ol style={{ display: 'flex', alignItems: 'center', gap: 6, listStyle: 'none', padding: 0, margin: 0, flexWrap: 'wrap' }}>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1
          const isClickable = !isCurrent && (!!item.href || !!item.onClick)

          const labelStyle = {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: 'var(--line-height-snug)',
            letterSpacing: 'var(--tracking-tight)',
            color: isCurrent ? 'var(--color-content-tertiary)' : 'var(--color-content-primary)',
            textDecoration: (isClickable || (!isCurrent && !isClickable)) && !isCurrent ? 'underline' : 'none',
            textUnderlineOffset: 2,
            whiteSpace: 'nowrap',
            cursor: isClickable ? 'pointer' : 'default',
          }

          const separatorStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            color: 'var(--color-content-tertiary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            userSelect: 'none',
            flexShrink: 0,
          }

          return (
            <li key={index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {index > 0 && (
                <span aria-hidden="true" style={separatorStyle}>
                  {separator === 'chevron'
                    ? <ChevronRightSmIcon size={12} />
                    : '/'}
                </span>
              )}
              {isClickable ? (
                <a
                  href={item.href || '#'}
                  onClick={e => { e.preventDefault(); item.onClick?.() }}
                  style={{ ...labelStyle, textDecoration: 'underline' }}
                >
                  {item.icon && (
                    <span className="alloy-icon-slot" style={{ width: 16, height: 16, flexShrink: 0 }}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </a>
              ) : (
                <span style={labelStyle} aria-current={isCurrent ? 'page' : undefined}>
                  {item.icon && (
                    <span className="alloy-icon-slot" style={{ width: 16, height: 16, flexShrink: 0 }}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
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
      <span className="specimen-import-exp">{'{ Breadcrumb }'}</span>
      <span className="specimen-import-kw"> from </span>
      <span className="specimen-import-src">'alloy-design-system'</span>
    </div>
  )
}

/* ── Preview shell ──────────────────────────────────────────────────────────── */

function Section({ title, note, children, isMobile }) {
  return (
    <section style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-xl)', padding: isMobile ? 20 : 32 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 4px' }}>{title}</p>
        {note && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>{note}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>
    </section>
  )
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', margin: 0 }}>{label}</p>}
      {children}
    </div>
  )
}

/* ── Demo data ──────────────────────────────────────────────────────────────── */

const home = { label: 'Home', href: '/', icon: <HomeLineIcon size={16} /> }
const settings = { label: 'Settings', href: '/settings' }
const profile = { label: 'Profile', href: '/profile' }
const account = { label: 'Account' /* no href = current */ }

export default function BreadcrumbPreview() {
  const isMobile = useIsMobile()
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        .alloy-icon-slot { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .alloy-icon-slot > svg, .alloy-icon-slot > svg * { stroke-width: 1.75; }
        .alloy-icon-slot > svg { display: block; width: 100%; height: 100%; }

        a { color: inherit; }

        /* ─ Specimen ─ */
        .specimen-import-kw  { color: var(--color-content-disabled); }
        .specimen-import-exp { color: var(--color-content-primary); font-weight: 500; }
        .specimen-import-src { color: var(--color-content-secondary); }

      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Navigation</p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Breadcrumb</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 1.6 }}>slash & chevron separators · optional leading icon · current-page state · aria-current</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Slash separator */}
          <Section title="Slash separator" note="Default — / character, 20px wide, centered" isMobile={isMobile}>
            <Row label="3 items — home icon on first">
              <Breadcrumb separator="slash" items={[home, settings, account]} />
            </Row>
            <Row label="3 items — no icons">
              <Breadcrumb separator="slash" items={[
                { label: 'Dashboard', href: '/' },
                { label: 'Users', href: '/users' },
                { label: 'Edit profile' },
              ]} />
            </Row>
            <Row label="2 items">
              <Breadcrumb separator="slash" items={[
                { label: 'Home', href: '/', icon: <HomeLineIcon size={16} /> },
                { label: 'Notifications' },
              ]} />
            </Row>
            <Row label="1 item — no separators">
              <Breadcrumb separator="slash" items={[{ label: 'Home', icon: <HomeLineIcon size={16} /> }]} />
            </Row>
          </Section>

          {/* Chevron separator */}
          <Section title="Chevron separator" note="Chevron › replaces the slash — same sizing and spacing" isMobile={isMobile}>
            <Row label="3 items — home icon on first">
              <Breadcrumb separator="chevron" items={[home, settings, account]} />
            </Row>
            <Row label="3 items — no icons">
              <Breadcrumb separator="chevron" items={[
                { label: 'Dashboard', href: '/' },
                { label: 'Projects', href: '/projects' },
                { label: 'Alloy Design Kit' },
              ]} />
            </Row>
            <Row label="4 items">
              <Breadcrumb separator="chevron" items={[
                { label: 'Home', href: '/', icon: <HomeLineIcon size={16} /> },
                { label: 'Settings', href: '/settings' },
                { label: 'Privacy', href: '/settings/privacy' },
                { label: 'Data & cookies' },
              ]} />
            </Row>
          </Section>

          {/* With icons */}
          <Section title="With leading icon" note="Icon is wrapped in alloy-icon-slot — stroke-width follows the artwork system" isMobile={isMobile}>
            <Row label="home icon on first item only">
              <Breadcrumb separator="slash" items={[
                { label: 'Home', href: '/', icon: <HomeLineIcon size={16} /> },
                { label: 'Account', href: '/account' },
                { label: 'Profile' },
              ]} />
            </Row>
            <Row label="home icon on every item">
              <Breadcrumb separator="slash" items={[
                { label: 'Home', href: '/', icon: <HomeLineIcon size={16} /> },
                { label: 'Settings', href: '/settings', icon: <HomeLineIcon size={16} /> },
                { label: 'Profile', icon: <HomeLineIcon size={16} /> },
              ]} />
            </Row>
          </Section>

          {/* Current page */}
          <Section title="Current page state" note="Last item has no href — renders as non-interactive with tertiary color and no underline" isMobile={isMobile}>
            <Row label="middle item is clickable, last is current">
              <Breadcrumb separator="slash" items={[home, profile, account]} />
            </Row>
            <Row label="first two clickable">
              <Breadcrumb separator="chevron" items={[
                { label: 'Home', href: '/', icon: <HomeLineIcon size={16} /> },
                { label: 'Reports', href: '/reports' },
                { label: 'Q4 2025 Summary' },
              ]} />
            </Row>
          </Section>

          {/* 5 — Specimen */}
          <Section
            title="Specimen"
            note="Quick-reference table — scan to identify the exact separator, depth, and item configuration to name when prompting."
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

              {/* ── Separator ── */}
              <SpecimenGroup label="Separator" />
              <SpecimenRow label="Slash" tags={['separator="slash"', 'default']} isMobile={isMobile}>
                <Breadcrumb separator="slash" items={[home, settings, account]} />
              </SpecimenRow>
              <SpecimenRow label="Chevron" tags={['separator="chevron"']} isMobile={isMobile}>
                <Breadcrumb separator="chevron" items={[home, settings, account]} />
              </SpecimenRow>

              {/* ── Depth ── */}
              <SpecimenGroup label="Depth" />
              <SpecimenRow label="1 item" tags={['items.length = 1']} note="No separator rendered" isMobile={isMobile}>
                <Breadcrumb separator="slash" items={[{ label: 'Home', icon: <HomeLineIcon size={16} /> }]} />
              </SpecimenRow>
              <SpecimenRow label="2 items" tags={['items.length = 2']} isMobile={isMobile}>
                <Breadcrumb separator="slash" items={[
                  { label: 'Home', href: '/', icon: <HomeLineIcon size={16} /> },
                  { label: 'Notifications' },
                ]} />
              </SpecimenRow>
              <SpecimenRow label="3 items" tags={['items.length = 3']} isMobile={isMobile}>
                <Breadcrumb separator="slash" items={[home, settings, account]} />
              </SpecimenRow>
              <SpecimenRow label="4 items" tags={['items.length = 4']} isMobile={isMobile}>
                <Breadcrumb separator="chevron" items={[
                  { label: 'Home', href: '/', icon: <HomeLineIcon size={16} /> },
                  { label: 'Settings', href: '/settings' },
                  { label: 'Privacy', href: '/settings/privacy' },
                  { label: 'Data & cookies' },
                ]} />
              </SpecimenRow>

              {/* ── Icon ── */}
              <SpecimenGroup label="Leading icon" />
              <SpecimenRow label="First item only" tags={['icon (first item)']} isMobile={isMobile}>
                <Breadcrumb separator="slash" items={[home, settings, account]} />
              </SpecimenRow>
              <SpecimenRow label="All items" tags={['icon (all items)']} isMobile={isMobile}>
                <Breadcrumb separator="slash" items={[
                  { label: 'Home',     href: '/',         icon: <HomeLineIcon size={16} /> },
                  { label: 'Settings', href: '/settings', icon: <HomeLineIcon size={16} /> },
                  { label: 'Profile',                     icon: <HomeLineIcon size={16} /> },
                ]} />
              </SpecimenRow>
              <SpecimenRow label="No icon" tags={['icon omitted']} isMobile={isMobile}>
                <Breadcrumb separator="slash" items={[
                  { label: 'Dashboard', href: '/' },
                  { label: 'Users',     href: '/users' },
                  { label: 'Edit profile' },
                ]} />
              </SpecimenRow>

              {/* ── State ── */}
              <SpecimenGroup label="State" />
              <SpecimenRow label="Current page" tags={['no href on last item']} note="Last item renders as non-interactive with tertiary color" isMobile={isMobile}>
                <Breadcrumb separator="slash" items={[home, settings, account]} />
              </SpecimenRow>
              <SpecimenRow label="Clickable items" tags={['href']} note="Items with href render as <a> with underline" isMobile={isMobile}>
                <Breadcrumb separator="slash" items={[
                  { label: 'Home',     href: '/' },
                  { label: 'Settings', href: '/settings' },
                  { label: 'Account',  href: '/account' },
                ]} />
              </SpecimenRow>

            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Breadcrumb v1</span>
        </div>

      </div>
    </>
  )
}
