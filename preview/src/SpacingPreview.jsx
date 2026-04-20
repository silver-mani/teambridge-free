/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Spacing & Radius Preview
   Spacing scale (4px base) · border radius tokens
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

/* ── Token data ──────────────────────────────────────────────────────────────── */
const SPACING = [
  { token: '--space-0',  px: 0   },
  { token: '--space-1',  px: 4   },
  { token: '--space-2',  px: 8   },
  { token: '--space-3',  px: 12  },
  { token: '--space-4',  px: 16  },
  { token: '--space-5',  px: 20  },
  { token: '--space-6',  px: 24  },
  { token: '--space-8',  px: 32  },
  { token: '--space-10', px: 40  },
  { token: '--space-12', px: 48  },
  { token: '--space-16', px: 64  },
  { token: '--space-20', px: 80  },
  { token: '--space-24', px: 96  },
]

const RADII = [
  { token: '--radius-xs',     px: '2px',    label: 'XS'     },
  { token: '--radius-sm',     px: '4px',    label: 'SM'     },
  { token: '--radius-button', px: '6px',    label: 'Button' },
  { token: '--radius-md',     px: '8px',    label: 'MD'     },
  { token: '--radius-lg',     px: '12px',   label: 'LG'     },
  { token: '--radius-xl',     px: '16px',   label: 'XL'     },
  { token: '--radius-2xl',    px: '24px',   label: '2XL'    },
  { token: '--radius-full',   px: '9999px', label: 'Full'   },
]

/* ── Main export ─────────────────────────────────────────────────────────────── */
export default function SpacingPreview() {
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
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Spacing & Radius</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 1.6 }}>Spacing scale (4px base) · border radius tokens</p>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Section 1 — Spacing Scale */}
          <Section
            title="Spacing Scale"
            note="Base unit: 4px · token: --space-{n}"
            isMobile={isMobile}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {SPACING.map(({ token, px }, i) => (
                <div key={token}>
                  {i > 0 && (
                    <div style={{
                      height: 1,
                      background: 'var(--color-border-opaque)',
                      margin: '0',
                    }} />
                  )}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '10px 0',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-content-secondary)',
                      width: isMobile ? 100 : 160,
                      flexShrink: 0,
                    }}>{token}</span>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-content-disabled)',
                      width: 60,
                      flexShrink: 0,
                    }}>{px}px</span>
                    <div style={{
                      background: 'var(--color-content-tertiary)',
                      height: 6,
                      borderRadius: 'var(--radius-full)',
                      width: Math.max(2, px * 5) + 'px',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Section 2 — Border Radius */}
          <Section
            title="Border Radius"
            note="8 radius tokens from xs (2px) to full (9999px)"
            isMobile={isMobile}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {RADII.map(({ token, px, label }) => (
                <div key={token} style={{
                  width: 110,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border-opaque)',
                    borderRadius: `var(${token})`,
                    flexShrink: 0,
                  }} />
                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-content-secondary)',
                    textAlign: 'center',
                    margin: 0,
                    wordBreak: 'break-all',
                  }}>{token}</p>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-content-disabled)',
                    textAlign: 'center',
                    margin: 0,
                  }}>{px}</p>
                </div>
              ))}
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ maxWidth: 1100, margin: '40px auto 0', paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Spacing & Radius v1</span>
        </div>

      </div>
    </>
  )
}
