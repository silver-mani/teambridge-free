/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Shadows Preview
   Elevation shadows (below/above × low/md/high) · focus rings · light and dark
   ───────────────────────────────────────────────────────────────────────────── */

import { useIsMobile } from './useIsMobile.js'

/* ── Dark-mode CSS variable overrides ────────────────────────────────────────── */
const DARK_VARS = {
  '--color-bg-primary':              'rgba(255,255,255,0.04)',
  '--color-bg-secondary':            'rgba(255,255,255,0.07)',
  '--color-bg-tertiary':             'rgba(255,255,255,0.11)',
  '--color-bg-disabled':             'rgba(255,255,255,0.05)',
  '--color-border-opaque':           'rgba(255,255,255,0.10)',
  '--color-border-selected':         'var(--Alloy-slate-200)',
  '--color-border-disabled':         'rgba(255,255,255,0.06)',
  '--color-content-primary':         'rgba(255,255,255,0.88)',
  '--color-content-secondary':       'rgba(255,255,255,0.55)',
  '--color-content-tertiary':        'rgba(255,255,255,0.35)',
  '--color-content-disabled':        'rgba(255,255,255,0.22)',
  '--color-content-inverse-primary': 'rgba(0,0,0,0.88)',
  '--color-bg-inverse-primary':      '#FFFFFF',
}

/* ── Section wrapper ─────────────────────────────────────────────────────────── */
function Section({ title, note, dark, children, isMobile }) {
  return (
    <section style={{
      background: dark ? 'rgba(14,17,21,1)' : 'var(--color-bg-primary)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'var(--color-border-opaque)'}`,
      borderRadius: 'var(--radius-xl)',
      padding: isMobile ? 20 : 32,
      overflow: 'hidden',
      ...(dark ? DARK_VARS : {}),
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

/* ── Shadow card grid ────────────────────────────────────────────────────────── */
function ShadowGrid({ shadows, isDark, isMobile }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(3, 1fr)', gap: 20 }}>
      {shadows.map(({ token, level, marginTop, marginBottom }) => (
        <div key={token}>
          <div style={{
            background: isDark ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-opaque)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            boxShadow: `var(${token})`,
            height: 80,
            margin: marginTop
              ? `${marginTop}px 4px ${marginBottom ?? 4}px`
              : '4px',
          }} />
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
            color: 'var(--color-content-secondary)', marginTop: 12, marginBottom: 4,
          }}>{token}</p>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
            color: 'var(--color-content-disabled)', margin: 0,
          }}>{level}</p>
        </div>
      ))}
    </div>
  )
}

const BELOW_SHADOWS = [
  { token: '--shadow-below-low',  level: 'low' },
  { token: '--shadow-below-md',   level: 'md'  },
  { token: '--shadow-below-high', level: 'high' },
]

const ABOVE_SHADOWS = [
  { token: '--shadow-above-low',  level: 'low',  marginTop: 16, marginBottom: 4 },
  { token: '--shadow-above-md',   level: 'md',   marginTop: 16, marginBottom: 4 },
  { token: '--shadow-above-high', level: 'high', marginTop: 16, marginBottom: 4 },
]

const FOCUS_RINGS = [
  { token: '--shadow-ring-default', label: 'Default / Neutral' },
  { token: '--shadow-ring-focus',   label: 'Focus / Blue'      },
  { token: '--shadow-ring-error',   label: 'Error / Red'       },
  { token: '--shadow-ring-success', label: 'Success / Green'   },
]

/* ── Main export ─────────────────────────────────────────────────────────────── */
export default function ShadowsPreview() {
  const isMobile = useIsMobile()
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Foundation</p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Shadows</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 1.6 }}>Elevation shadows (below/above × low/md/high) · focus rings · light and dark</p>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Section 1 — Below Shadows (Light) */}
          <Section
            title="Below Shadows — Light"
            note="Downward projection · token: --shadow-below-{low|md|high}"
            isMobile={isMobile}
          >
            <ShadowGrid shadows={BELOW_SHADOWS} isDark={false} isMobile={isMobile} />
          </Section>

          {/* Section 2 — Above Shadows (Light) */}
          <Section
            title="Above Shadows — Light"
            note="Upward projection · token: --shadow-above-{low|md|high}"
            isMobile={isMobile}
          >
            <ShadowGrid shadows={ABOVE_SHADOWS} isDark={false} isMobile={isMobile} />
          </Section>

          {/* Section 3 — Shadows on Dark Surface */}
          <Section
            title="Shadows — Dark Surface"
            note="Dark mode shadows are more pronounced for visibility on dark backgrounds"
            dark={true}
            isMobile={isMobile}
          >
            <div style={{ marginBottom: 32 }}>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
                color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)',
                marginBottom: 16,
              }}>below</p>
              <ShadowGrid shadows={BELOW_SHADOWS} isDark={true} isMobile={isMobile} />
            </div>
            <div>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
                color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)',
                marginBottom: 16,
              }}>above</p>
              <ShadowGrid shadows={ABOVE_SHADOWS} isDark={true} isMobile={isMobile} />
            </div>
          </Section>

          {/* Section 4 — Focus Rings */}
          <Section
            title="Focus Rings"
            note="3px spread rings for keyboard-navigable elements · token: --shadow-ring-{default|focus|error|success}"
            isMobile={isMobile}
          >
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20 }}>
              {FOCUS_RINGS.map(({ token, label }) => (
                <div key={token}>
                  <div style={{
                    width: 80,
                    height: 80,
                    background: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-opaque)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: `var(${token})`,
                    margin: 4,
                  }} />
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                    color: 'var(--color-content-secondary)', marginTop: 12, marginBottom: 4,
                  }}>{token}</p>
                  <p style={{
                    fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
                    color: 'var(--color-content-disabled)', margin: 0,
                  }}>{label}</p>
                </div>
              ))}
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ maxWidth: 1100, margin: '40px auto 0', paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Shadows v1</span>
        </div>

      </div>
    </>
  )
}
