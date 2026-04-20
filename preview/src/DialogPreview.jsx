/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Dialog Preview
   Header · Content · Footer lego blocks · sizes · button groups · dark
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { useIsMobile } from './useIsMobile.js';
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  Button,
  TextField,
  TextArea,
  Divider,
  AlertTriangleIcon,
} from '../../src/index.ts';

/* ── Shell helpers ──────────────────────────────────────────────────────────── */

function Section({ title, note, children }) {
  const isMobile = useIsMobile()
  return (
    <div style={{
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-opaque)',
      borderRadius: 'var(--radius-xl)',
      padding: isMobile ? 20 : 32,
    }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-weight-medium)',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
          color: 'var(--color-content-disabled)',
          margin: '0 0 6px',
        }}>{title}</p>
        {note && (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-content-tertiary)',
            margin: 0,
            lineHeight: 1.5,
          }}>{note}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Trigger({ label, onClick }) {
  return (
    <Button variant="secondary" onClick={onClick}>{label}</Button>
  );
}

/* ── Preview ─────────────────────────────────────────────────────────────────── */

export default function DialogPreview() {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState({
    basic: false,
    form: false,
    destructive: false,
    noClose: false,
    md: false,
    lg: false,
    longContent: false,
  });

  const toggle = (key, val) => setOpen(s => ({ ...s, [key]: val ?? !s[key] }));

  return (
    <>
    {isMobile && (
      <style>{`
        [data-alloy-dialog], .alloy-dialog, [role="dialog"] { max-width: 90vw !important; }
      `}</style>
    )}
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Feedback</p>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-bold)', lineHeight: 'var(--line-height-tight)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Dialog</h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-content-secondary)' }}>
          DialogHeader · DialogContent · DialogFooter — composable lego blocks
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* 1 — Anatomy */}
        <Section title="Anatomy" note="The three building blocks: DialogHeader (title + close), DialogContent (body), DialogFooter (right-aligned buttons).">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Trigger label="Open basic dialog" onClick={() => toggle('basic', true)} />
          </div>
        </Section>

        {/* 2 — Form content */}
        <Section title="With Form Content" note="DialogContent wraps any consumer content. DialogFooter receives a Cancel + primary action button group.">
          <Trigger label="Open form dialog" onClick={() => toggle('form', true)} />
        </Section>

        {/* 3 — Destructive action */}
        <Section title="Destructive Action" note="Use Button variant='destructive' in DialogFooter to signal irreversible actions.">
          <Trigger label="Open destructive dialog" onClick={() => toggle('destructive', true)} />
        </Section>

        {/* 4 — No close button */}
        <Section title="No Close Button" note="Omit onClose from DialogHeader to hide the × button — useful when cancellation must go through a footer action.">
          <Trigger label="Open (no × button)" onClick={() => toggle('noClose', true)} />
        </Section>

        {/* 5 — Sizes */}
        <Section title="Sizes" note="sm = 440px (default) · md = 560px · lg = 680px">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Trigger label="sm — 440px" onClick={() => toggle('basic', true)} />
            <Trigger label="md — 560px" onClick={() => toggle('md', true)} />
            <Trigger label="lg — 680px" onClick={() => toggle('lg', true)} />
          </div>
        </Section>

        {/* 6 — Scrollable content */}
        <Section title="Scrollable Content" note="DialogContent scrolls internally — header and footer stay fixed.">
          <Trigger label="Open long content dialog" onClick={() => toggle('longContent', true)} />
        </Section>

      </div>

      {/* Footer */}
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Dialog v1.0</span>
      </div>

      {/* ── Dialog instances ───────────────────────────────────────────────────── */}

      {/* Basic */}
      <Dialog open={open.basic} onClose={() => toggle('basic', false)} size="sm">
        <DialogHeader onClose={() => toggle('basic', false)}>Workflow details</DialogHeader>
        <DialogContent>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>
            This is the dialog body. It accepts any content — text, form fields, tables, or custom layouts. The content area has 16 px padding and scrolls when it overflows.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="primary" onClick={() => toggle('basic', false)}>Got it</Button>
        </DialogFooter>
      </Dialog>

      {/* Form */}
      <Dialog open={open.form} onClose={() => toggle('form', false)} size="sm">
        <DialogHeader onClose={() => toggle('form', false)}>Edit workflow</DialogHeader>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-secondary)' }}>Name</label>
              <TextField size="md" placeholder="Workflow name" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-secondary)' }}>Description</label>
              <TextArea size="md" placeholder="Describe what this workflow does…" />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="tertiary" onClick={() => toggle('form', false)}>Cancel</Button>
          <Button variant="primary" onClick={() => toggle('form', false)}>Save changes</Button>
        </DialogFooter>
      </Dialog>

      {/* Destructive */}
      <Dialog open={open.destructive} onClose={() => toggle('destructive', false)} size="sm">
        <DialogHeader onClose={() => toggle('destructive', false)}>Delete workflow</DialogHeader>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <AlertTriangleIcon size={20} color="var(--color-error-content)" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>
                Are you sure you want to delete <strong style={{ color: 'var(--color-content-primary)', fontWeight: 'var(--font-weight-semibold)' }}>Payroll sync</strong>? This action cannot be undone and will remove all associated run history.
              </p>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="tertiary" onClick={() => toggle('destructive', false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => toggle('destructive', false)}>Delete workflow</Button>
        </DialogFooter>
      </Dialog>

      {/* No close button */}
      <Dialog open={open.noClose} onClose={() => toggle('noClose', false)} size="sm">
        <DialogHeader>Session expired</DialogHeader>
        <DialogContent>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>
            Your session has expired. Please sign in again to continue.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="primary" onClick={() => toggle('noClose', false)}>Sign in</Button>
        </DialogFooter>
      </Dialog>

      {/* md */}
      <Dialog open={open.md} onClose={() => toggle('md', false)} size="md">
        <DialogHeader onClose={() => toggle('md', false)}>Medium dialog — 560px</DialogHeader>
        <DialogContent>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>
            Use size="md" for dialogs with wider form layouts or two-column content. The dialog is 560 px wide and still responsive on smaller viewports.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="tertiary" onClick={() => toggle('md', false)}>Cancel</Button>
          <Button variant="primary" onClick={() => toggle('md', false)}>Confirm</Button>
        </DialogFooter>
      </Dialog>

      {/* lg */}
      <Dialog open={open.lg} onClose={() => toggle('lg', false)} size="lg">
        <DialogHeader onClose={() => toggle('lg', false)}>Large dialog — 680px</DialogHeader>
        <DialogContent>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>
            Use size="lg" for data-heavy dialogs — preview tables, multi-step forms, or configuration panels. The dialog is 680 px wide.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="tertiary" onClick={() => toggle('lg', false)}>Cancel</Button>
          <Button variant="primary" onClick={() => toggle('lg', false)}>Confirm</Button>
        </DialogFooter>
      </Dialog>

      {/* Long content */}
      <Dialog open={open.longContent} onClose={() => toggle('longContent', false)} size="sm">
        <DialogHeader onClose={() => toggle('longContent', false)}>Terms & conditions</DialogHeader>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-content-primary)', marginBottom: 4 }}>
                  Section {i + 1}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                </p>
                {i < 7 && <Divider style={{ marginTop: 16 }} />}
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="tertiary" onClick={() => toggle('longContent', false)}>Decline</Button>
          <Button variant="primary" onClick={() => toggle('longContent', false)}>Accept</Button>
        </DialogFooter>
      </Dialog>

    </div>
    </>
  );
}
