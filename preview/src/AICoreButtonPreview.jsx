import { AICoreButton } from '../../src/components/ai/AICoreButton/AICoreButton'
import { useIsMobile } from './useIsMobile.js'

/* ── Layout helpers ─────────────────────────────────────────────────────────── */
function Section({ title, note, dark, children, isMobile }) {
  return (
    <section style={{ background: dark ? 'var(--Alloy-slate-950)' : 'var(--color-bg-primary)', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'var(--color-border-opaque)'}`, borderRadius: 'var(--radius-xl)', padding: isMobile ? 20 : 32 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.3)' : 'var(--color-content-disabled)', margin: '0 0 4px' }}>{title}</p>
        {note && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: dark ? 'rgba(255,255,255,0.45)' : 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>{note}</p>}
      </div>
      {children}
    </section>
  )
}

/* ── Preview ─────────────────────────────────────────────────────────────────── */
export default function AICoreButtonPreview() {
  const isMobile = useIsMobile()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>AI</p>
        <h1 style={{ fontSize: 'var(--text-4-5xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>AI Core Button</h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 'var(--line-height-loose)' }}>
          Entry-point button for the Ponder AI surface. Card-styled with a gradient border derived from
          the Ponder.svg design token. On hover the border transitions to a slowly spinning conic glow
          and the sparkle icon swaps for the animated AILoader.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>

        {/* Sizes */}
        <Section title="Sizes" note="Three sizes for use across different nav densities." isMobile={isMobile}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap' }}>
            {['sm', 'md', 'lg'].map(size => (
              <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <AICoreButton size={size} aria-label={`Ponder AI (${size})`} />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>
                  {size} — {size === 'sm' ? '28' : size === 'md' ? '32' : '40'}px
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Hover Interaction */}
        <Section
          title="Hover Interaction"
          note="Hover to see the conic glow and radius pulse — sparkle icon stays static."
          isMobile={isMobile}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {['sm', 'md', 'lg'].map(size => (
              <AICoreButton key={size} size={size} aria-label={`Ponder AI (${size})`} />
            ))}
          </div>
          <p style={{ marginTop: 16, marginBottom: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)' }}>
            ↑ Hover to preview — static gradient border → conic glow + radius pulse, icon unchanged
          </p>
        </Section>

        {/* States */}
        <Section title="States" note="Default · Loading (persistent conic glow) — all sizes" isMobile={isMobile}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Default */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', width: 60 }}>Default</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {['sm', 'md', 'lg'].map(size => (
                  <AICoreButton key={size} size={size} aria-label={`Ponder AI (${size})`} />
                ))}
              </div>
            </div>
            {/* Loading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', width: 60 }}>Loading</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {['sm', 'md', 'lg'].map(size => (
                  <AICoreButton key={size} loading size={size} aria-label={`Ponder AI loading (${size})`} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Usage in Context */}
        <Section title="Usage in Context" note="How it appears inside a TopNav bar." isMobile={isMobile}>
          <div style={{ border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {/* Simulated TopNav */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 48,
              padding: '0 12px',
              borderBottom: '1px solid var(--color-border-opaque)',
            }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-content-primary)' }}>
                Overview
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32,
                  borderRadius: 6,
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-opaque)',
                }} />
                <AICoreButton aria-label="Ponder AI" />
              </div>
            </div>
            <div style={{ padding: '20px 16px', color: 'var(--color-content-disabled)', fontSize: 14 }}>
              Page content…
            </div>
          </div>
        </Section>

        {/* Dark — Sizes */}
        <Section title="Dark Mode" note="Dark inner fill with inverse-light sparkle and loader." dark isMobile={isMobile}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap' }}>
            {['sm', 'md', 'lg'].map(size => (
              <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <AICoreButton dark size={size} aria-label={`Ponder AI (${size})`} />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.3)', letterSpacing: 'var(--tracking-wide)' }}>
                  {size} — {size === 'sm' ? '28' : size === 'md' ? '32' : '40'}px
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Dark — Hover */}
        <Section
          title="Dark Mode · Hover"
          note="Spinning conic glow on a dark surface."
          dark
          isMobile={isMobile}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {['sm', 'md', 'lg'].map(size => (
              <AICoreButton dark key={size} size={size} aria-label={`Ponder AI (${size})`} />
            ))}
          </div>
          <p style={{ marginTop: 16, marginBottom: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.3)' }}>
            ↑ Hover to preview
          </p>
        </Section>

        {/* Dark — Usage in context */}
        <Section title="Dark Mode · Usage in Context" note="How it appears in a dark TopNav." dark isMobile={isMobile}>
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 48,
              padding: '0 12px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'var(--Alloy-slate-900)',
            }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
                Overview
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32,
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }} />
                <AICoreButton dark aria-label="Ponder AI" />
              </div>
            </div>
            <div style={{ padding: '20px 16px', background: 'var(--Alloy-slate-900)', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
              Page content…
            </div>
          </div>
        </Section>

        {/* Design Tokens */}
        <Section title="Design Tokens" isMobile={isMobile}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            <thead>
              <tr>
                {['Token', 'Value', 'Usage'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '6px 12px 10px 0',
                    fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)',
                    fontWeight: 500,
                    color: 'var(--color-content-disabled)',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid var(--color-border-opaque)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['--duration-slow', '250ms', 'Shadow + border-radius + filter transition'],
                ['--ease-out', 'cubic-bezier(0,0,0.2,1)', 'All hover transitions'],
                ['border-spin', '3000ms linear ∞', 'Conic gradient rotation on hover'],
                ['paint2_linear', '#8C4FE2 → #446CFF → #1EDFDE', 'Static border gradient (from Ponder.svg)'],
              ].map(([token, value, usage]) => (
                <tr key={token}>
                  <td style={{ padding: '8px 12px 8px 0', fontFamily: 'var(--font-mono)', color: 'var(--color-content-primary)' }}>{token}</td>
                  <td style={{ padding: '8px 12px 8px 0', color: 'var(--color-content-secondary)' }}>{value}</td>
                  <td style={{ padding: '8px 0', color: 'var(--color-content-tertiary)' }}>{usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

      </div>

      {/* Footer */}
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — AI Core Button v1</span>
      </div>

    </div>
  )
}
