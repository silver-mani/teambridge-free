/* ─────────────────────────────────────────────────────────────────────────────
   Teambridge AI · AILoader Preview
   ───────────────────────────────────────────────────────────────────────────── */

import { AILoader } from '../../src/components/ai/AILoader/AILoader'
import { useIsMobile } from './useIsMobile.js'

/* ── Shared layout primitives ────────────────────────────────────────────── */
const wrap = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg-secondary)',
  fontFamily: 'var(--font-sans)',
  paddingBottom: '80px',
}

const header = {
  padding: '48px 48px 0',
  marginBottom: '40px',
}

const label = {
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-weight-semibold)',
  letterSpacing: 'var(--tracking-wider)',
  textTransform: 'uppercase',
  color: 'var(--color-content-tertiary)',
  marginBottom: '8px',
}

const title = {
  fontSize: 'var(--text-3xl)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-content-primary)',
  margin: '0 0 8px',
}

const subtitle = {
  fontSize: 'var(--text-base)',
  color: 'var(--color-content-secondary)',
  margin: 0,
}

const section = (extra = {}) => ({
  margin: '0 48px 32px',
  backgroundColor: 'var(--color-bg-primary)',
  borderRadius: 'var(--radius-xl)',
  padding: '32px',
  border: '1px solid var(--color-border-opaque)',
  ...extra,
})

const sectionTitle = {
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-weight-semibold)',
  letterSpacing: 'var(--tracking-wider)',
  textTransform: 'uppercase',
  color: 'var(--color-content-tertiary)',
  marginBottom: '24px',
}

const row = (extra = {}) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
  flexWrap: 'wrap',
  ...extra,
})

const cell = (extra = {}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  ...extra,
})

const cellLabel = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-content-secondary)',
  fontFamily: 'var(--font-mono)',
}

const divider = {
  height: '1px',
  backgroundColor: 'var(--color-border-opaque)',
  margin: '28px 0',
}

const footer = {
  padding: '40px 48px 0',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-content-tertiary)',
  borderTop: '1px solid var(--color-border-opaque)',
  margin: '0 48px',
}

/* ── Variant metadata ────────────────────────────────────────────────────── */
// swatchBg overrides swatch cell background so every variant is always legible.
const VARIANTS = [
  { variant: 'gradient',      label: 'gradient',      note: 'Default — gradient stroke',                swatchBg: null },
  { variant: 'gradient-fill', label: 'gradient-fill', note: 'Gradient stroke + fill',                   swatchBg: null },
  { variant: 'inverse',       label: 'inverse',       note: 'Solid dark — always black',                swatchBg: 'var(--Alloy-slate-100)' },
  { variant: 'inverse-light', label: 'inverse-light', note: 'Solid white — gradient & dark surfaces',   swatchBg: 'var(--Alloy-slate-900)' },
  { variant: 'stroke',        label: 'stroke',        note: 'Outline dark — always black',              swatchBg: 'var(--Alloy-slate-100)' },
  { variant: 'stroke-light',  label: 'stroke-light',  note: 'Outline white — gradient & dark surfaces', swatchBg: 'var(--Alloy-slate-900)' },
]

export default function AILoaderPreview() {
  const isMobile = useIsMobile()

  const dynWrap = { ...wrap }
  const dynHeader = { ...header, padding: isMobile ? '24px 16px 0' : '48px 48px 0' }
  const dynSection = (extra = {}) => ({
    ...section(extra),
    margin: isMobile ? '0 0 32px' : '0 48px 32px',
    padding: isMobile ? '20px' : '32px',
  })
  const dynFooter = { ...footer, padding: isMobile ? '40px 16px 0' : '40px 48px 0', margin: isMobile ? '0 0' : '0 48px' }
  const dynRow = (extra = {}) => ({ ...row(extra), gap: isMobile ? '16px' : '32px' })

  return (
    <div style={dynWrap}>
      {/* ── Header ── */}
      <div style={dynHeader}>
        <p style={label}>Teambridge AI</p>
        <h1 style={title}>AI Loader</h1>
        <p style={subtitle}>
          An animated star loader that morphs between the Teambridge AI mark and a circle.
          Combines a smooth shape morph with a steady clockwise rotation for a fluid loading state.
        </p>
      </div>

      {/* ── Section 1: Sizes ── */}
      <div style={dynSection()}>
        <p style={sectionTitle}>Sizes</p>
        <div style={dynRow({ alignItems: 'flex-end' })}>
          {[
            { size: 'xs', label: 'xs · 16px' },
            { size: 'sm', label: 'sm · 24px' },
            { size: 'md', label: 'md · 32px' },
            { size: 'lg', label: 'lg · 48px' },
            { size: 'xl', label: 'xl · 64px' },
          ].map(({ size, label: l }) => (
            <div key={size} style={cell()}>
              <AILoader size={size} />
              <span style={cellLabel}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Variants ── */}
      <div style={dynSection()}>
        <p style={sectionTitle}>Variants</p>
        <div style={dynRow({ alignItems: 'flex-start', flexWrap: 'wrap' })}>
          {VARIANTS.map(({ variant, label: l, note, swatchBg }) => (
            <div key={variant} style={cell({ alignItems: 'flex-start', gap: '8px' })}>
              <div style={{
                width: 88,
                height: 88,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: swatchBg ?? 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-opaque)',
              }}>
                <AILoader size="lg" variant={variant} />
              </div>
              <span style={{ ...cellLabel, color: 'var(--color-content-primary)', fontWeight: 'var(--font-weight-semibold)' }}>{l}</span>
              <span style={{ ...cellLabel, color: 'var(--color-content-tertiary)', maxWidth: 108 }}>{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Usage in Context ── */}
      <div style={dynSection()}>
        <p style={sectionTitle}>Usage in Context</p>

        {/* Inline with text */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: '12px', fontWeight: 'var(--font-weight-semibold)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Inline with text</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AILoader size="xs" />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)' }}>Generating summary…</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AILoader size="sm" />
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-primary)' }}>Teambridge AI is thinking</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AILoader size="md" />
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-primary)' }}>Drafting your schedule…</span>
            </div>
          </div>
        </div>

        <div style={divider} />

        {/* Button-style trigger */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: '12px', fontWeight: 'var(--font-weight-semibold)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Loading button</p>
          <div style={dynRow({ gap: '12px' })}>
            {/* Primary AI button loading state */}
            <button
              disabled
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #0891B2 100%)',
                border: 'none', cursor: 'not-allowed', opacity: 0.85,
                fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)',
                color: '#fff', fontFamily: 'var(--font-sans)',
              }}
            >
              <AILoader size="xs" variant="inverse-light" />
              Generating…
            </button>

            {/* Ghost loading state */}
            <button
              disabled
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-opaque)',
                cursor: 'not-allowed',
                fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-content-secondary)', fontFamily: 'var(--font-sans)',
              }}
            >
              <AILoader size="xs" />
              Processing
            </button>
          </div>
        </div>

        <div style={divider} />

        {/* Centered card empty state */}
        <div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: '12px', fontWeight: 'var(--font-weight-semibold)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Card loading state</p>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '16px',
            padding: '48px 32px',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--color-border-opaque)',
            backgroundColor: 'var(--color-bg-secondary)',
          }}>
            <AILoader size="xl" variant="gradient-fill" />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-content-primary)' }}>
                AI is analyzing your data
              </p>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)' }}>
                This usually takes a few seconds
              </p>
            </div>
          </div>
        </div>

        <div style={divider} />

        {/* Progress bar */}
        <div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: '12px', fontWeight: 'var(--font-weight-semibold)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>With progress bar</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Determinate — 35% */}
            {[
              { pct: 35,  label: 'Analyzing documents…',   sub: 'Step 1 of 3' },
              { pct: 68,  label: 'Building your schedule…', sub: 'Step 2 of 3' },
              { pct: 94,  label: 'Almost done',             sub: 'Finalizing' },
            ].map(({ pct, label, sub }) => (
              <div key={pct} style={{
                padding: '20px 24px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-opaque)',
                backgroundColor: 'var(--color-bg-secondary)',
              }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AILoader size="sm" variant="gradient" />
                    <div>
                      <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-content-primary)' }}>{label}</p>
                      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)' }}>{sub}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-content-secondary)', fontFamily: 'var(--font-mono)' }}>{pct}%</span>
                </div>
                {/* Track */}
                <div style={{
                  height: '4px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(90deg, var(--ai-grad-start, #22D3EE) 0%, var(--ai-grad-mid, #818CF8) 60%, var(--ai-grad-end, #A855F7) 100%)',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            ))}

            {/* Compact inline progress — gradient bg */}
            <div style={{
              padding: '20px 24px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 45%, #0891B2 100%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AILoader size="sm" variant="inverse-light" />
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: '#fff' }}>Generating report…</p>
                </div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>52%</span>
              </div>
              <div style={{
                height: '4px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255,255,255,0.2)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: '52%',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── Section 4: Custom Sizes ── */}
      <div style={dynSection()}>
        <p style={sectionTitle}>Custom numeric sizes</p>
        <div style={dynRow({ alignItems: 'flex-end' })}>
          {[20, 28, 40, 56, 80, 96].map(px => (
            <div key={px} style={cell()}>
              <AILoader size={px} />
              <span style={cellLabel}>{px}px</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={dynFooter}>
        <strong style={{ color: 'var(--color-content-secondary)' }}>AILoader</strong>
        {' — '}Teambridge AI
      </div>
    </div>
  )
}
