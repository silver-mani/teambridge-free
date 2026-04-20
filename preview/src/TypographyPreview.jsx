/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Typography Preview
   Type scale · weights · line heights · letter spacing · composite styles
   ───────────────────────────────────────────────────────────────────────────── */

import { useIsMobile } from './useIsMobile.js'

/* ── Section wrapper ─────────────────────────────────────────────────────────── */
function Section({ title, note, children, isMobile }) {
  return (
    <section style={{
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-opaque)',
      borderRadius: 'var(--radius-xl)',
      padding: isMobile ? 20 : 32,
      overflow: 'hidden',
    }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
          letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
          color: 'var(--color-content-disabled)', margin: '0 0 4px',
        }}>{title}</p>
        {note && (
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
            color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5,
          }}>{note}</p>
        )}
      </div>
      {children}
    </section>
  )
}

/* ── Data ────────────────────────────────────────────────────────────────────── */
const TYPE_SCALE = [
  { token: '--text-xs',   rem: '0.75rem',  px: '12px' },
  { token: '--text-sm',   rem: '0.875rem', px: '14px' },
  { token: '--text-base', rem: '1rem',     px: '16px' },
  { token: '--text-lg',   rem: '1.125rem', px: '18px' },
  { token: '--text-xl',   rem: '1.25rem',  px: '20px' },
  { token: '--text-2xl',  rem: '1.5rem',   px: '24px' },
  { token: '--text-3xl',  rem: '1.875rem', px: '30px' },
  { token: '--text-4xl',  rem: '2.25rem',  px: '36px' },
  { token: '--text-5xl',  rem: '3rem',     px: '48px' },
  { token: '--text-6xl',  rem: '4rem',     px: '64px' },
  { token: '--text-7xl',  rem: '6rem',     px: '96px' },
]

const WEIGHTS = [
  { token: '--font-weight-light',    label: 'Light',    value: '300' },
  { token: '--font-weight-regular',  label: 'Regular',  value: '400' },
  { token: '--font-weight-medium',   label: 'Medium',   value: '500' },
  { token: '--font-weight-semibold', label: 'Semibold', value: '600' },
  { token: '--font-weight-bold',     label: 'Bold',     value: '700' },
]

const LINE_HEIGHTS = [
  { token: '--line-height-none',    label: 'none',    value: '1' },
  { token: '--line-height-tight',   label: 'tight',   value: '1.1' },
  { token: '--line-height-snug',    label: 'snug',    value: '1.2' },
  { token: '--line-height-normal',  label: 'normal',  value: '1.3' },
  { token: '--line-height-relaxed', label: 'relaxed', value: '1.5' },
  { token: '--line-height-loose',   label: 'loose',   value: '1.6' },
]

const TRACKING = [
  { token: '--tracking-tight',  label: 'tight',  value: '-0.03em' },
  { token: '--tracking-normal', label: 'normal', value: '0em' },
  { token: '--tracking-wide',   label: 'wide',   value: '0.02em' },
  { token: '--tracking-wider',  label: 'wider',  value: '0.05em' },
]

const COMPOSITE = [
  // Display
  { group: 'Display', name: 'Display XL',  size: '--text-7xl',  weight: '--font-weight-bold',     lh: '--line-height-tighter', tracking: '--tracking-tight' },
  { group: 'Display', name: 'Display LG',  size: '--text-5xl',  weight: '--font-weight-bold',     lh: '--line-height-tighter', tracking: '--tracking-tight' },
  { group: 'Display', name: 'Display MD',  size: '--text-4xl',  weight: '--font-weight-bold',     lh: '--line-height-tight',   tracking: '--tracking-tight' },
  { group: 'Display', name: 'Display SM',  size: '--text-3xl',  weight: '--font-weight-semibold', lh: '--line-height-tight',   tracking: '--tracking-tight' },
  { group: 'Display', name: 'Display XS',  size: '--text-2xl',  weight: '--font-weight-semibold', lh: '--line-height-snug',    tracking: '--tracking-tight' },
  // Heading
  { group: 'Heading', name: 'Heading XL',  size: '--text-xl',   weight: '--font-weight-semibold', lh: '--line-height-snug',    tracking: '--tracking-normal' },
  { group: 'Heading', name: 'Heading LG',  size: '--text-lg',   weight: '--font-weight-semibold', lh: '--line-height-snug',    tracking: '--tracking-normal' },
  { group: 'Heading', name: 'Heading MD',  size: '--text-base', weight: '--font-weight-semibold', lh: '--line-height-normal',  tracking: '--tracking-normal' },
  { group: 'Heading', name: 'Heading SM',  size: '--text-sm',   weight: '--font-weight-semibold', lh: '--line-height-normal',  tracking: '--tracking-normal' },
  { group: 'Heading', name: 'Heading XS',  size: '--text-xs',   weight: '--font-weight-semibold', lh: '--line-height-normal',  tracking: '--tracking-normal' },
  // Paragraph
  { group: 'Paragraph', name: 'Paragraph LG', size: '--text-lg',   weight: '--font-weight-regular', lh: '--line-height-loose',   tracking: '--tracking-normal' },
  { group: 'Paragraph', name: 'Paragraph MD', size: '--text-base', weight: '--font-weight-regular', lh: '--line-height-loose',   tracking: '--tracking-normal' },
  { group: 'Paragraph', name: 'Paragraph SM', size: '--text-sm',   weight: '--font-weight-regular', lh: '--line-height-relaxed', tracking: '--tracking-normal' },
  // Label
  { group: 'Label', name: 'Label LG', size: '--text-base', weight: '--font-weight-medium', lh: '--line-height-normal',  tracking: '--tracking-normal' },
  { group: 'Label', name: 'Label MD', size: '--text-sm',   weight: '--font-weight-medium', lh: '--line-height-normal',  tracking: '--tracking-normal' },
  { group: 'Label', name: 'Label SM', size: '--text-xs',   weight: '--font-weight-medium', lh: '--line-height-relaxed', tracking: '--tracking-wider' },
]

/* ── Shared row divider style ────────────────────────────────────────────────── */
const rowDivider = {
  borderTop: '1px solid var(--color-border-opaque)',
}

/* ── Shared row layout ───────────────────────────────────────────────────────── */
const rowBase = {
  display: 'flex',
  alignItems: 'center',
  gap: 24,
  padding: '12px 0',
}

/* ── Left meta col ───────────────────────────────────────────────────────────── */
function MetaCol({ token, sub }) {
  return (
    <div style={{ width: 200, flexShrink: 0 }}>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-content-secondary)',
        margin: 0,
        lineHeight: 1.4,
      }}>{token}</p>
      {sub && (
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-content-disabled)',
          margin: '2px 0 0',
          lineHeight: 1.4,
        }}>{sub}</p>
      )}
    </div>
  )
}

/* ── Main export ─────────────────────────────────────────────────────────────── */
export default function TypographyPreview() {
  const isMobile = useIsMobile()
  /* Group COMPOSITE entries by group label */
  const compositeGroups = COMPOSITE.reduce((acc, entry) => {
    if (!acc[entry.group]) acc[entry.group] = []
    acc[entry.group].push(entry)
    return acc
  }, {})

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-secondary)',
      padding: isMobile ? '24px 16px' : '48px 40px',
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>

        {/* ── Page header ─────────────────────────────────────────────────────── */}
        <div style={{ paddingBottom: 8 }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-medium)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--color-content-tertiary)',
            margin: '0 0 8px',
          }}>Foundation</p>
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-content-primary)',
            margin: '0 0 10px',
            lineHeight: 'var(--line-height-tight)',
            letterSpacing: 'var(--tracking-tight)',
          }}>Typography</h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-content-secondary)',
            margin: 0,
            lineHeight: 'var(--line-height-relaxed)',
          }}>Type scale · weights · line heights · letter spacing · composite styles</p>
        </div>

        {/* ── Section 1: Type Scale ────────────────────────────────────────────── */}
        <Section title="Type Scale" note="All --text-* size tokens · Geist Sans" isMobile={isMobile}>
          {TYPE_SCALE.map((item, i) => {
            const isLarge = ['--text-5xl', '--text-6xl', '--text-7xl'].includes(item.token)
            return (
              <div
                key={item.token}
                style={{
                  ...rowBase,
                  ...(i > 0 ? rowDivider : {}),
                  alignItems: isLarge ? 'flex-start' : 'center',
                  padding: isLarge ? '16px 0' : '12px 0',
                  flexWrap: 'wrap',
                }}
              >
                <MetaCol token={item.token} sub={`${item.rem} · ${item.px}`} />
                <div style={{
                  flex: 1,
                  overflow: isLarge ? 'visible' : 'hidden',
                  whiteSpace: isLarge ? 'normal' : 'nowrap',
                  wordBreak: isLarge ? 'break-word' : undefined,
                }}>
                  <span style={{
                    fontSize: `var(${item.token})`,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--color-content-primary)',
                    fontWeight: 'var(--font-weight-regular)',
                    lineHeight: 1,
                    display: 'block',
                  }}>Alloy</span>
                </div>
              </div>
            )
          })}
        </Section>

        {/* ── Section 2: Font Weights ──────────────────────────────────────────── */}
        <Section title="Font Weights" note="Five weights — applied to Geist Sans" isMobile={isMobile}>
          {WEIGHTS.map((item, i) => (
            <div
              key={item.token}
              style={{
                ...rowBase,
                ...(i > 0 ? rowDivider : {}),
              }}
            >
              <MetaCol token={item.token} sub={item.value} />
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-lg)',
                fontWeight: `var(${item.token})`,
                color: 'var(--color-content-primary)',
                margin: 0,
                lineHeight: 'var(--line-height-normal)',
              }}>The quick brown fox jumps over the lazy dog</p>
            </div>
          ))}
        </Section>

        {/* ── Section 3: Line Heights ──────────────────────────────────────────── */}
        <Section title="Line Heights" note="Rhythm scale from none (1) to loose (1.6)" isMobile={isMobile}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: 16,
          }}>
            {LINE_HEIGHTS.map((item) => (
              <div
                key={item.token}
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-opaque)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-content-secondary)',
                  margin: '0 0 2px',
                  lineHeight: 1.4,
                }}>{item.token}</p>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-content-disabled)',
                  margin: '0 0 12px',
                  lineHeight: 1.4,
                }}>{item.value}</p>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-content-secondary)',
                  lineHeight: `var(${item.token})`,
                  margin: 0,
                }}>Alloy helps teams ship consistent, accessible interfaces faster. Every token has a purpose.</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section 4: Letter Spacing ────────────────────────────────────────── */}
        <Section title="Letter Spacing" note="Four tracking values" isMobile={isMobile}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 16,
          }}>
            {TRACKING.map((item) => (
              <div
                key={item.token}
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-opaque)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-content-tertiary)',
                  margin: '0 0 2px',
                  lineHeight: 1.4,
                }}>{item.token}</p>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-content-disabled)',
                  margin: '0 0 14px',
                  lineHeight: 1.4,
                }}>{item.value}</p>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-content-primary)',
                  letterSpacing: `var(${item.token})`,
                  margin: 0,
                  lineHeight: 'var(--line-height-normal)',
                }}>ALLOY DESIGN SYSTEM</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section 5: Composite Styles ─────────────────────────────────────── */}
        <Section title="Composite Styles" note="Named type ramps — Display, Heading, Paragraph, Label" isMobile={isMobile}>
          {Object.entries(compositeGroups).map(([group, entries], groupIndex) => (
            <div key={group}>
              {/* Group sub-header */}
              <div style={{
                ...(groupIndex > 0 ? { borderTop: '1px solid var(--color-border-opaque)', marginTop: 8, paddingTop: 20 } : {}),
                marginBottom: 4,
              }}>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase',
                  color: 'var(--color-content-disabled)',
                  margin: 0,
                }}>{group}</p>
              </div>

              {/* Rows */}
              {entries.map((item, i) => (
                <div
                  key={item.name}
                  style={{
                    ...rowBase,
                    ...(i > 0 ? rowDivider : { borderTop: '1px solid var(--color-border-opaque)' }),
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ width: 200, flexShrink: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-content-tertiary)',
                      margin: 0,
                      lineHeight: 1.4,
                    }}>{item.name}</p>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: `var(${item.size})`,
                    fontWeight: `var(${item.weight})`,
                    lineHeight: `var(${item.lh})`,
                    letterSpacing: `var(${item.tracking})`,
                    color: 'var(--color-content-primary)',
                    margin: 0,
                    flex: 1,
                  }}>Alloy Design System</p>
                </div>
              ))}
            </div>
          ))}
        </Section>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-content-disabled)',
          textAlign: 'center',
          margin: '12px 0 0',
          letterSpacing: 'var(--tracking-wide)',
        }}>Alloy — Typography v1</p>

      </div>
    </div>
  )
}
