/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Divider Preview
   solid / dashed · 1px & 2px thickness · horizontal & vertical · light + dark
   ───────────────────────────────────────────────────────────────────────────── */

import { useIsMobile } from './useIsMobile.js'
import { Divider } from '../../src/components/Divider/index.ts'
import '../../src/styles/tokens.css'

const DARK_VARS = {
  '--color-bg-primary':        'var(--Alloy-slate-950)',
  '--color-bg-secondary':      'var(--Alloy-slate-900)',
  '--color-bg-tertiary':       'var(--Alloy-slate-800)',
  '--color-content-primary':   'var(--Alloy-white)',
  '--color-content-secondary': 'var(--Alloy-slate-200)',
  '--color-content-tertiary':  'var(--Alloy-slate-400)',
  '--color-content-disabled':  'var(--Alloy-slate-600)',
  '--color-border-opaque':     'var(--Alloy-slate-700)',
  '--color-border-transparent':'rgba(255,255,255,0.08)',
}

function Section({ title, subtitle, children, isMobile }) {
  return (
    <div style={{
      background: 'var(--color-bg-primary)',
      borderRadius: 'var(--radius-xl)',
      padding: isMobile ? '20px' : '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-tertiary)', marginBottom: '4px' }}>{title}</p>
        {subtitle && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Label({ children }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)' }}>
      {children}
    </span>
  )
}

function Row({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {children}
    </div>
  )
}

function DividerRow({ thickness, variant = 'solid' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Label>variant="{variant}" thickness={thickness}</Label>
      <Divider thickness={thickness} variant={variant} />
    </div>
  )
}

function ContentRow({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {children}
    </div>
  )
}

function ListRow({ label }) {
  return (
    <div style={{
      padding: '12px 0',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--color-content-primary)',
    }}>
      {label}
    </div>
  )
}

export default function DividerPreview() {
  const isMobile = useIsMobile()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-tertiary)', marginBottom: '8px' }}>
          LAYOUT
        </p>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-content-primary)', lineHeight: 'var(--line-height-tight)', marginBottom: '12px' }}>
          Divider
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', color: 'var(--color-content-secondary)' }}>
          solid &amp; dashed · 1px &amp; 2px · horizontal &amp; vertical · border-opaque token · light &amp; dark
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Solid variants */}
        <Section title="SOLID" subtitle="Default variant — 1px and 2px thickness" isMobile={isMobile}>
          <Row>
            <DividerRow variant="solid" thickness={1} />
            <DividerRow variant="solid" thickness={2} />
          </Row>
        </Section>

        {/* Dashed variants */}
        <Section title="DASHED" subtitle="2px dash · 2px gap — 1px and 2px thickness" isMobile={isMobile}>
          <Row>
            <DividerRow variant="dashed" thickness={1} />
            <DividerRow variant="dashed" thickness={2} />
          </Row>
        </Section>

        {/* Horizontal — in context */}
        <Section title="HORIZONTAL — IN CONTEXT" subtitle="Solid separating list rows / dashed grouping hint" isMobile={isMobile}>
          <ContentRow>
            <ListRow label="Invoice #1042 — Acme Corp" />
            <Divider thickness={1} variant="solid" />
            <ListRow label="Invoice #1043 — Globex LLC" />
            <Divider thickness={1} variant="solid" />
            <ListRow label="Invoice #1044 — Initech" />
            <Divider thickness={2} variant="dashed" />
            <ListRow label="Invoice #1045 — Umbrella Co" />
            <Divider thickness={1} variant="dashed" />
            <ListRow label="Invoice #1046 — Hooli" />
          </ContentRow>
        </Section>

        {/* Vertical — in context */}
        <Section title="VERTICAL — IN CONTEXT" subtitle="Inline separator between actions or metadata" isMobile={isMobile}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '20px' }}>
            {['Dashboard', 'Reports', 'Settings'].map((label, i, arr) => (
              <>
                <span key={label} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)' }}>{label}</span>
                {i < arr.length - 1 && <Divider key={`div-${i}`} orientation="vertical" thickness={1} variant="solid" />}
              </>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '20px' }}>
            {['Jan 2025', 'Feb 2025', 'Mar 2025'].map((label, i, arr) => (
              <>
                <span key={label} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)' }}>{label}</span>
                {i < arr.length - 1 && <Divider key={`div-${i}`} orientation="vertical" thickness={2} variant="dashed" />}
              </>
            ))}
          </div>
        </Section>

        {/* Dark mode */}
        <div className="dark" style={{ ...DARK_VARS }}>
          <Section title="DARK MODE — ALL VARIANTS" isMobile={isMobile}>
            <Row>
              <DividerRow variant="solid"  thickness={1} />
              <DividerRow variant="solid"  thickness={2} />
              <DividerRow variant="dashed" thickness={1} />
              <DividerRow variant="dashed" thickness={2} />
            </Row>
          </Section>
        </div>

      </div>
    </div>
  )
}
