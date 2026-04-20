/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Alert / Notification / Toast Preview
   Status: error · warning · success · info · feature
   Variants: lighter · stroke   Sizes: sm · lg
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { Alert, ToastProvider, useToast } from '../../src/index.ts'
import { useIsMobile } from './useIsMobile.js'

/* ── Preview shell ────────────────────────────────────────────────────────────── */

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

/* ── Main export ─────────────────────────────────────────────────────────────── */

const STATUSES = ['error', 'warning', 'success', 'info', 'feature']

/* ── Toast trigger section ───────────────────────────────────────────────────── */

const TOAST_EXAMPLES = [
  { label: 'Success',  status: 'success', title: 'Changes saved',               description: undefined },
  { label: 'Error',    status: 'error',   title: 'Something went wrong',         description: 'Please try again or contact support.' },
  { label: 'Warning',  status: 'warning', title: 'Session expiring soon',        description: undefined },
  { label: 'Info',     status: 'info',    title: 'Update available',             description: 'A new version is ready to install.' },
  { label: 'Feature',  status: 'feature', title: 'New feature: smart filters',   description: undefined },
]

function ToastTriggers({ isMobile }) {
  const { toast } = useToast()

  const btnStyle = (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 14px',
    border: '1px solid var(--color-border-opaque)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: color ?? 'var(--color-content-primary)',
    cursor: 'pointer',
    transition: 'background 100ms',
  })

  return (
    <section style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-xl)', padding: isMobile ? 20 : 32 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 4px' }}>Toast · Live Demo</p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>
          Click to fire a toast — appears top-right with 20 px padding, auto-dismisses after 4 s, or click × to dismiss early.
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {TOAST_EXAMPLES.map(({ label, status, title, description }) => (
          <button
            key={status}
            type="button"
            style={btnStyle()}
            onClick={() => toast({ title, description, status, variant: 'stroke', size: description ? 'lg' : 'sm' })}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          style={btnStyle()}
          onClick={() => toast({ title: 'Workflow saved', status: 'success', action: 'View', onAction: () => alert('View clicked') })}
        >
          With action
        </button>
        <button
          type="button"
          style={btnStyle()}
          onClick={() => toast({ title: 'This one stays until you dismiss it', status: 'info', duration: 0 })}
        >
          Persist (no auto-dismiss)
        </button>
        <button
          type="button"
          style={btnStyle()}
          onClick={() => {
            ['success', 'error', 'warning', 'info'].forEach((status, i) =>
              setTimeout(() => toast({ title: `${status.charAt(0).toUpperCase() + status.slice(1)} toast`, status, variant: 'stroke' }), i * 300)
            )
          }}
        >
          Stack 4 toasts
        </button>
      </div>
    </section>
  )
}

export default function AlertPreview() {
  const isMobile = useIsMobile()
  const [dismissed, setDismissed] = useState({})
  const dismiss = (key) => setDismissed(d => ({ ...d, [key]: true }))
  const reset   = () => setDismissed({})

  return (
    <ToastProvider>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }
        button { font-family: var(--font-sans); }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Feedback</p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Alert / Toast</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 1.6 }}>5 statuses · lighter & stroke variants · sm & lg sizes · action links · dismiss</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Toast live demo */}
          <ToastTriggers isMobile={isMobile} />

          {/* Small · Lighter */}
          <Section title="Small · Lighter" isMobile={isMobile} note="Single-line title, action link, dismiss — tinted background per status">
            {STATUSES.map(s => (
              <Row key={s} label={s}>
                <Alert status={s} variant="lighter" size="sm" title="Insert your alert title here!" action="Action" onDismiss={() => {}} />
              </Row>
            ))}
          </Section>

          {/* Small · Stroke */}
          <Section title="Small · Stroke" isMobile={isMobile} note="White background with opaque border — status indicated by badge only">
            {STATUSES.map(s => (
              <Row key={s} label={s}>
                <Alert status={s} variant="stroke" size="sm" title="Insert your alert title here!" action="Action" onDismiss={() => {}} />
              </Row>
            ))}
          </Section>

          {/* Large · Lighter */}
          <Section title="Large · Lighter" isMobile={isMobile} note="Title + description + action links + dismiss">
            {STATUSES.map(s => (
              <Row key={s} label={s}>
                <Alert
                  status={s}
                  variant="lighter"
                  size="lg"
                  title="Insert your alert title here!"
                  description="Insert the alert description here. It would look better as two lines of text."
                  action="Action"
                  learnMore="Learn more"
                  onDismiss={() => {}}
                />
              </Row>
            ))}
          </Section>

          {/* Large · Stroke */}
          <Section title="Large · Stroke" isMobile={isMobile}>
            {STATUSES.map(s => (
              <Row key={s} label={s}>
                <Alert
                  status={s}
                  variant="stroke"
                  size="lg"
                  title="Insert your alert title here!"
                  description="Insert the alert description here. It would look better as two lines of text."
                  action="Action"
                  learnMore="Learn more"
                  onDismiss={() => {}}
                />
              </Row>
            ))}
          </Section>

          {/* Interactive dismiss */}
          <Section title="Interactive" isMobile={isMobile} note="Dismiss removes the alert. Click Reset to restore.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STATUSES.map(s => !dismissed[s] && (
                <Alert key={s} status={s} size="sm" title="Insert your alert title here!" action="Action" onDismiss={() => dismiss(s)} />
              ))}
              <button
                type="button"
                onClick={reset}
                style={{ marginTop: 8, alignSelf: 'flex-start', background: 'none', border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-button)', padding: '6px 12px', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-secondary)', cursor: 'pointer' }}
              >
                Reset
              </button>
            </div>
          </Section>

          {/* No trailing / minimal */}
          <Section title="Minimal" isMobile={isMobile} note="Title only — no action, no dismiss">
            <Row label="sm · lighter">
              {STATUSES.map(s => (
                <Alert key={s} status={s} size="sm" title="Insert your alert title here!" />
              ))}
            </Row>
            <Row label="lg · lighter">
              {STATUSES.map(s => (
                <Alert key={s} status={s} size="lg" title="Insert your alert title here!" description="Supporting description text goes here." />
              ))}
            </Row>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Alert / Toast v1</span>
        </div>

      </div>
    </ToastProvider>
  )
}
