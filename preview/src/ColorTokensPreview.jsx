/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Color Tokens Preview
   Palette · Background · Content · Border · Status
   All semantic --color-* usage tokens + raw --Alloy-* palette
   ───────────────────────────────────────────────────────────────────────────── */

import { useIsMobile } from './useIsMobile.js'

/* ── Palette data ─────────────────────────────────────────────────────────── */

const PALETTE = [
  { name: 'Blue',    hue: 'blue',    stops: { 50:'#E8F0FF', 100:'#D1E1FF', 150:'#BAD2FF', 200:'#A3C3FF', 300:'#75A5FE', 400:'#4787FE', 500:'#1969FE', 600:'#1454CB', 700:'#0F3F98', 800:'#0A2A66', 850:'#08204C', 900:'#051533', 950:'#030B19' } },
  { name: 'Azure',   hue: 'azure',   stops: { 50:'#E7F1FB', 100:'#CEE3F8', 150:'#B6D5F4', 200:'#9DC7F0', 300:'#6DACE9', 400:'#3C90E1', 500:'#0B74DA', 600:'#095DAE', 700:'#074683', 800:'#042E57', 850:'#032341', 900:'#02172C', 950:'#010C16' } },
  { name: 'Purple',  hue: 'purple',  stops: { 50:'#F0EEFA', 100:'#E1DEF5', 150:'#D2CDF0', 200:'#C3BDEB', 300:'#A69BE2', 400:'#887AD8', 500:'#6A59CE', 600:'#5547A5', 700:'#40357C', 800:'#2A2452', 850:'#201B3E', 900:'#151229', 950:'#0B0915' } },
  { name: 'Pink',    hue: 'pink',    stops: { 50:'#FFEAF4', 100:'#FFD5E9', 150:'#FFC0DE', 200:'#FFABD3', 300:'#FF82BE', 400:'#FF58A8', 500:'#FF2E92', 600:'#CD2575', 700:'#9B1C58', 800:'#69123C', 850:'#500E2D', 900:'#37091F', 950:'#1E0510' } },
  { name: 'Red',     hue: 'red',     stops: { 50:'#FFE9E9', 100:'#FFD3D3', 150:'#FFBEBD', 200:'#FFA8A7', 300:'#FF7C7C', 400:'#FF5150', 500:'#FF2524', 600:'#CC1E1D', 700:'#991616', 800:'#660F0E', 850:'#4D0B0B', 900:'#330707', 950:'#1A0404' } },
  { name: 'Orange',  hue: 'orange',  stops: { 50:'#FDF5EA', 100:'#FCEBD5', 150:'#FAE1C0', 200:'#F8D7AB', 300:'#F5C481', 400:'#F1B057', 500:'#EE9C2D', 600:'#BE7D24', 700:'#8F5E1B', 800:'#5F3E12', 850:'#472F0E', 900:'#301F09', 950:'#181005' } },
  { name: 'Yellow',  hue: 'yellow',  stops: { 50:'#FFFAE5', 100:'#FFF5CC', 150:'#FFF0B2', 200:'#FFEB99', 300:'#FFE066', 400:'#FFD633', 500:'#FFCC00', 600:'#CCA300', 700:'#997A00', 800:'#665200', 850:'#4D3D00', 900:'#332900', 950:'#1A1400' } },
  { name: 'Matcha',  hue: 'matcha',  stops: { 50:'#F5FBE6', 100:'#EBF6CD', 150:'#E1F2B3', 200:'#D7ED9A', 300:'#C4E568', 400:'#B0DC35', 500:'#9CD303', 600:'#7DA902', 700:'#5E7F02', 800:'#3E5401', 850:'#2F3F01', 900:'#1F2A01', 950:'#101500' } },
  { name: 'Green',   hue: 'green',   stops: { 50:'#E6F6E7', 100:'#D0EED3', 150:'#BBE6BF', 200:'#A5DEAB', 300:'#7ACD82', 400:'#4FBD5A', 500:'#24AD32', 600:'#1D8A28', 700:'#16681E', 800:'#0E4514', 850:'#0B340F', 900:'#07230A', 950:'#041105' } },
  { name: 'Slate',   hue: 'slate',   stops: { 50:'#F6F7F9', 100:'#E8EAEE', 150:'#CBD0D7', 200:'#A8AFBA', 300:'#87919F', 400:'#677384', 500:'#475569', 600:'#394454', 700:'#2B333F', 800:'#1C222A', 850:'#151A20', 900:'#0E1115', 950:'#07090B' } },
  { name: 'Grey',    hue: 'grey',    stops: { 50:'#F4F4F4', 100:'#EAEAEA', 150:'#DFDFDF', 200:'#D5D5D5', 300:'#BFBFBF', 400:'#AAAAAA', 500:'#959595', 600:'#777777', 700:'#5A5A5A', 800:'#3C3C3C', 850:'#2D2D2D', 900:'#1F1F1F', 950:'#101010' } },
]

const STOPS = [50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950]

/* ── Dark-mode CSS custom property overrides ──────────────────────────────── */

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

/* ── Layout helpers ──────────────────────────────────────────────────────────── */

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

/* ── Section 1 — Palette ──────────────────────────────────────────────────── */

function PaletteSection({ isMobile }) {
  /* Determine if a hex color is "dark" so we can pick a contrasting stop label */
  function isDark(hex) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 < 128
  }

  const swatchStyle = (hex) => ({
    width: 44,
    height: 44,
    background: hex,
    borderRadius: 'var(--radius-sm)',
    flexShrink: 0,
  })

  const stopLabelStyle = {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-content-disabled)',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 1,
  }

  const hueLabelStyle = {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-content-tertiary)',
    width: 64,
    flexShrink: 0,
    paddingTop: 10,
  }

  const neutralRow = (name, hex) => (
    <div key={name} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <span style={hueLabelStyle}>{name}</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <div>
          <div style={{ ...swatchStyle(hex) }} title={`${name}: ${hex}`} />
          <p style={stopLabelStyle}>—</p>
        </div>
      </div>
    </div>
  )

  return (
    <Section title="Palette" note="11 hues × 13 stops · all raw --Alloy-* tokens" isMobile={isMobile}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* White + Black at the top */}
        {neutralRow('White', '#ffffff')}
        {neutralRow('Black', '#151515')}

        {/* 11 hues */}
        {PALETTE.map(({ name, hue, stops }) => (
          <div key={hue} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={hueLabelStyle}>{name}</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STOPS.map(stop => {
                const hex = stops[stop]
                return (
                  <div key={stop} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={swatchStyle(hex)}
                      title={`--Alloy-${hue}-${stop}: ${hex}`}
                    />
                    <p style={stopLabelStyle}>{stop}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ── Section 2 — Background tokens ───────────────────────────────────────── */

const BG_TOKENS = [
  { token: '--color-bg-primary',     description: 'Default surface' },
  { token: '--color-bg-secondary',   description: 'Recessed layer' },
  { token: '--color-bg-tertiary',    description: 'Further recessed' },
  { token: '--color-bg-disabled',    description: 'Disabled state' },
  { token: '--color-bg-always-dark', description: 'Always dark' },
  { token: '--color-bg-always-light',description: 'Always light' },
]

function BackgroundSection({ isMobile }) {
  return (
    <Section title="Background Tokens" note="Use these for all filled surfaces — never use palette tokens directly in components" isMobile={isMobile}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {BG_TOKENS.map(({ token, description }) => (
          <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 36,
              height: 36,
              background: `var(${token})`,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-opaque)',
              flexShrink: 0,
            }} />
            <div>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-content-primary)',
                margin: 0,
              }}>{token}</p>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-content-tertiary)',
                margin: '2px 0 0',
              }}>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ── Section 3 — Content tokens ───────────────────────────────────────────── */

const CONTENT_TOKENS = [
  '--color-content-primary',
  '--color-content-secondary',
  '--color-content-tertiary',
  '--color-content-disabled',
  '--color-content-link',
]

function ContentSection({ isMobile }) {
  return (
    <Section title="Content Tokens" note="Text and icon color hierarchy" isMobile={isMobile}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CONTENT_TOKENS.map(token => (
          <div key={token} style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-base)',
              color: `var(${token})`,
              margin: 0,
              minWidth: 280,
            }}>
              Aa — The quick brown fox
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-content-disabled)',
              margin: 0,
              letterSpacing: 'var(--tracking-wide)',
            }}>{token}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ── Section 4 — Border tokens ────────────────────────────────────────────── */

const BORDER_TOKENS = [
  '--color-border-opaque',
  '--color-border-selected',
  '--color-border-disabled',
  '--color-border-focus',
]

function BorderSection({ isMobile }) {
  return (
    <Section title="Border Tokens" note="Stroke colors for dividers, outlines, inputs, cards" isMobile={isMobile}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {BORDER_TOKENS.map(token => (
          <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 36,
              height: 36,
              background: '#ffffff',
              border: `2px solid var(${token})`,
              borderRadius: 'var(--radius-sm)',
              flexShrink: 0,
            }} />
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-content-primary)',
              margin: 0,
            }}>{token}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ── Section 5 — Status tokens ────────────────────────────────────────────── */

const STATUSES = ['success', 'warning', 'error', 'info']

function StatusSection({ isMobile }) {
  return (
    <Section title="Status Tokens" note="success · warning · error · info — fill / bg / border / content" isMobile={isMobile}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20 }}>
        {STATUSES.map(status => (
          <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Column header */}
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-medium)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-content-disabled)',
              margin: 0,
            }}>{status}</p>

            {/* fill */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{
                width: 40,
                height: 40,
                background: `var(--color-${status}-fill)`,
                borderRadius: 'var(--radius-sm)',
              }} />
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-content-tertiary)',
                margin: 0,
              }}>fill</p>
            </div>

            {/* bg */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{
                width: 40,
                height: 40,
                background: `var(--color-${status}-bg)`,
                border: `1px solid var(--color-${status}-border)`,
                borderRadius: 'var(--radius-sm)',
              }} />
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-content-tertiary)',
                margin: 0,
              }}>bg</p>
            </div>

            {/* border */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{
                width: 40,
                height: 40,
                border: `2px solid var(--color-${status}-border)`,
                borderRadius: 'var(--radius-sm)',
              }} />
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-content-tertiary)',
                margin: 0,
              }}>border</p>
            </div>

            {/* content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                color: `var(--color-${status}-content)`,
                margin: 0,
                lineHeight: 1.4,
              }}>Sample text</p>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-content-tertiary)',
                margin: 0,
              }}>content</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ── Main export ──────────────────────────────────────────────────────────── */

export default function ColorTokensPreview() {
  const isMobile = useIsMobile()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', padding: isMobile ? '24px 16px' : '48px 40px' }}>
      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--color-content-disabled)',
            marginBottom: 6,
          }}>
            Foundation
          </p>
          <h1 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--font-weight-regular)',
            lineHeight: 'var(--line-height-snug)',
            color: 'var(--color-content-primary)',
            marginBottom: 8,
          }}>
            Colors
          </h1>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-content-tertiary)',
            lineHeight: 'var(--line-height-relaxed)',
          }}>
            Palette · Background · Content · Border · Status — all design token layers
          </p>
        </div>

        {/* ── Sections ────────────────────────────────────────────────────── */}
        <PaletteSection isMobile={isMobile} />
        <BackgroundSection isMobile={isMobile} />
        <ContentSection isMobile={isMobile} />
        <BorderSection isMobile={isMobile} />
        <StatusSection isMobile={isMobile} />

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div style={{
          marginTop: 20,
          paddingTop: 20,
          borderTop: '1px solid var(--color-border-opaque)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-content-disabled)',
            letterSpacing: 'var(--tracking-wide)',
          }}>
            Alloy — Colors v1
          </span>
        </div>

      </div>
    </div>
  )
}
