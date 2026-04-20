/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Tooltip Preview
   ───────────────────────────────────────────────────────────────────────────── */

import { Tooltip } from '../../src/components/Tooltip/Tooltip'
import { Button }  from '../../src/components/Button/Button'
import { useIsMobile } from './useIsMobile.js'

/* ── Layout helpers ─────────────────────────────────────────────────────────── */

function Section({ title, note, children, isMobile }) {
  return (
    <section style={{
      background:    'var(--color-bg-primary)',
      border:        '1px solid var(--color-border-opaque)',
      borderRadius:  'var(--radius-xl)',
      padding:       isMobile ? 20 : 32,
      overflow:      'visible',
    }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
          letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
          color: 'var(--color-content-disabled)', margin: '0 0 4px',
        }}>
          {title}
        </p>
        {note && (
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
            color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5,
          }}>
            {note}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

function Label({ text }) {
  return (
    <p style={{
      fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase',
      color: 'var(--color-content-disabled)', margin: '0 0 16px',
    }}>
      {text}
    </p>
  )
}

/* ── Icon — Info circle (inline SVG) ─────────────────────────────────────────── */
function InfoIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <line x1="8" y1="7.5" x2="8" y2="11" />
      <circle cx="8" cy="5.5" r="0.5" fill={color} stroke="none" />
    </svg>
  )
}

function HelpIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M6 6c0-1.1.9-2 2-2s2 .9 2 2c0 .8-.5 1.5-1.2 1.8L8 8.5V10" />
      <circle cx="8" cy="12" r="0.5" fill={color} stroke="none" />
    </svg>
  )
}

function CopyIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" />
      <path d="M1.5 9.5V2.5a1 1 0 0 1 1-1h7" />
    </svg>
  )
}

function TrashIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5h10M5.5 3.5V2h3v1.5M4 3.5l.7 8h4.6l.7-8" />
    </svg>
  )
}

function SettingsIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="2" />
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.6 2.6l1 1M10.4 10.4l1 1M11.4 2.6l-1 1M3.6 10.4l-1 1" />
    </svg>
  )
}

/* ── Preview ─────────────────────────────────────────────────────────────────── */

export default function TooltipPreview() {
  const isMobile = useIsMobile()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', padding: isMobile ? '24px 16px' : '48px 40px' }}>
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>
          Feedback
        </p>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>
          Tooltip
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 'var(--line-height-relaxed)' }}>
          4 placements · fade + slide animation · inverse tokens · keyboard accessible
        </p>
      </div>

      {/* ── 1. Placements ───────────────────────────────────────────────────── */}
      <Section title="Placement" note="top (default) · bottom · left · right — each slides in from the trigger direction" isMobile={isMobile}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 12 : 24, padding: '40px 0' }}>
          <Tooltip content="Above the trigger" placement="top">
            <Button variant="secondary" size="sm">Top</Button>
          </Tooltip>
          <Tooltip content="Below the trigger" placement="bottom">
            <Button variant="secondary" size="sm">Bottom</Button>
          </Tooltip>
          <Tooltip content="To the left" placement="left">
            <Button variant="secondary" size="sm">Left</Button>
          </Tooltip>
          <Tooltip content="To the right" placement="right">
            <Button variant="secondary" size="sm">Right</Button>
          </Tooltip>
        </div>
      </Section>

      {/* ── 2. Delay ─────────────────────────────────────────────────────────── */}
      <Section title="Show Delay" note="delay=0 is instant · delay=300 gives users a moment to move the cursor without triggering every tooltip they pass" isMobile={isMobile}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: isMobile ? 12 : 24, padding: '40px 0' }}>
          <div>
            <Label text="Instant (delay=0)" />
            <Tooltip content="Instant — no delay" delay={0}>
              <Button variant="secondary">Instant</Button>
            </Tooltip>
          </div>
          <div>
            <Label text="300ms delay" />
            <Tooltip content="Appears after 300ms" delay={300}>
              <Button variant="secondary">300ms</Button>
            </Tooltip>
          </div>
          <div>
            <Label text="600ms delay" />
            <Tooltip content="Appears after 600ms" delay={600}>
              <Button variant="secondary">600ms</Button>
            </Tooltip>
          </div>
        </div>
      </Section>

      {/* ── 3. Content length ────────────────────────────────────────────────── */}
      <Section title="Content" note="Short label · longer description · rich ReactNode content" isMobile={isMobile}>
        <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: isMobile ? 12 : 24, padding: '40px 0' }}>
          <div>
            <Label text="Short label" />
            <Tooltip content="Delete" placement="top">
              <Button variant="secondary" size="sm">Hover</Button>
            </Tooltip>
          </div>
          <div>
            <Label text="Medium phrase" />
            <Tooltip content="Hold ⌘ to select multiple items" placement="top">
              <Button variant="secondary" size="sm">Hover</Button>
            </Tooltip>
          </div>
          <div>
            <Label text="Long wrapping text (maxWidth=200)" />
            <Tooltip
              content="This explanation is longer and wraps across multiple lines to give the user more context about this action."
              placement="top"
              maxWidth={200}
            >
              <Button variant="secondary" size="sm">Hover</Button>
            </Tooltip>
          </div>
          <div>
            <Label text="Rich content" />
            <Tooltip
              placement="top"
              maxWidth={200}
              content={
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <strong style={{ fontWeight: 'var(--font-weight-semibold)' }}>Keyboard shortcut</strong>
                  <span style={{ opacity: 0.7 }}>⌘ + Shift + P</span>
                </span>
              }
            >
              <Button variant="secondary" size="sm">Hover</Button>
            </Tooltip>
          </div>
        </div>
      </Section>

      {/* ── 4. Usage in context ─────────────────────────────────────────────── */}
      <Section title="Usage in Context" note="Most common trigger types — icon-only buttons, help icons on form labels, inline text" isMobile={isMobile}>

        {/* Icon-only action bar */}
        <Label text="Icon-only action buttons" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 32 }}>
          <Tooltip content="Copy" placement="top">
            <Button variant="ghost" size="sm" iconOnly aria-label="Copy">
              <CopyIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Settings" placement="top">
            <Button variant="ghost" size="sm" iconOnly aria-label="Settings">
              <SettingsIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Delete" placement="top">
            <Button variant="ghost" size="sm" iconOnly aria-label="Delete">
              <TrashIcon />
            </Button>
          </Tooltip>
        </div>

        {/* Form label + help icon */}
        <Label text="Form label with contextual help" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-primary)' }}>
              Pay period
            </span>
            <Tooltip content="The date range for which employee hours are tracked and compensation is calculated." maxWidth={220} placement="right">
              <button type="button" style={{ display: 'inline-flex', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-content-tertiary)', outline: 'none' }}>
                <InfoIcon size={14} />
              </button>
            </Tooltip>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-primary)' }}>
              Billing threshold
            </span>
            <Tooltip content="Transactions below this amount are grouped and billed together at the end of each cycle." maxWidth={220} placement="right">
              <button type="button" style={{ display: 'inline-flex', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-content-tertiary)', outline: 'none' }}>
                <HelpIcon size={14} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Truncated text */}
        <Label text="Truncated text — reveals full value on hover" />
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { short: 'EMP-00412', full: 'Employee ID: EMP-00412' },
            { short: 'TXN-98871…', full: 'Transaction ID: TXN-9887123456' },
          ].map(({ short, full }) => (
            <Tooltip key={short} content={full} placement="top">
              <span style={{
                display: 'inline-block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-content-secondary)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-opaque)',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 8px',
                cursor: 'default',
              }}>
                {short}
              </span>
            </Tooltip>
          ))}
        </div>
      </Section>

      {/* ── 5. Disabled state ───────────────────────────────────────────────── */}
      <Section title="Disabled" note="disabled=true — tooltip never shows · useful when the trigger itself is disabled" isMobile={isMobile}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 12 : 24, padding: '40px 0', alignItems: 'center' }}>
          <div>
            <Label text="Active tooltip" />
            <Tooltip content="This tooltip is active" placement="top">
              <Button variant="secondary">Hover me</Button>
            </Tooltip>
          </div>
          <div>
            <Label text="disabled=true" />
            <Tooltip content="This tooltip is disabled" placement="top" disabled>
              <Button variant="secondary">No tooltip</Button>
            </Tooltip>
          </div>
        </div>
      </Section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>
          Alloy — Tooltip v1
        </span>
      </div>

    </div>
    </div>
  )
}
