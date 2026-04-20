/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Tag Specimen
   Uses the real Tag and StatusTag components from the library source.
   Variants · Colors · Sizes · Dot · Leading Icon · Dismissible · StatusTag
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Tag } from '../src/components/Tag';
import { StatusTag } from '../src/components/StatusTag/StatusTag';

/* ── Inline icon ─────────────────────────────────────────────────────────────── */
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ── Data ────────────────────────────────────────────────────────────────────── */
const COLORS   = ['neutral', 'blue', 'azure', 'purple', 'pink', 'red', 'orange', 'yellow', 'matcha', 'green'] as const;
const VARIANTS = ['subtle', 'outline', 'solid'] as const;
const SIZES    = ['sm', 'md', 'lg'] as const;
const STATUSES = ['success', 'warning', 'error', 'info', 'neutral', 'pending'] as const;

/* ── Layout helpers ──────────────────────────────────────────────────────────── */
function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 4px' }}>{title}</p>
        {note && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>{note}</p>}
      </div>
      {children}
    </section>
  );
}

function ColLabel({ w = 80, children }: { w?: number; children: ReactNode }) {
  return (
    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', width: w, flexShrink: 0 }}>
      {children}
    </span>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ── Specimen ────────────────────────────────────────────────────────────────── */
export default function TagSpecimen() {
  const [dismissibleTags, setDismissibleTags] = useState(['Design', 'Engineering', 'Product', 'Marketing', 'Operations']);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: '48px 40px' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Alloy Design System · Specimen</p>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Tag &amp; StatusTag</h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 'var(--line-height-relaxed)', margin: 0 }}>3 variants · 10 colors + neutral · 3 sizes · dot · leading icon · dismissible · 6 status types</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* 1 — Variants × Colors */}
        <Section title="Tag — Variants & Colors" note="subtle · outline · solid across all 10 colors + neutral · md size">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ width: 80 }} />
            {VARIANTS.map(v => (
              <span key={v} style={{ width: 88, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)' }}>{v}</span>
            ))}
          </div>
          {COLORS.map(color => (
            <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <ColLabel w={80}>{color}</ColLabel>
              {VARIANTS.map(v => (
                <div key={v} style={{ width: 88 }}>
                  <Tag variant={v} color={color} size="md">{capitalize(color)}</Tag>
                </div>
              ))}
            </div>
          ))}
        </Section>

        {/* 2 — Sizes */}
        <Section title="Tag — Sizes" note="sm (20px) · md (24px) · lg (32px) · subtle variant">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ width: 80 }} />
            {SIZES.map(s => (
              <span key={s} style={{ width: 88, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)' }}>{s.toUpperCase()}</span>
            ))}
          </div>
          {COLORS.map(color => (
            <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <ColLabel w={80}>{color}</ColLabel>
              {SIZES.map(s => (
                <div key={s} style={{ width: 88 }}>
                  <Tag variant="subtle" color={color} size={s}>{capitalize(color)}</Tag>
                </div>
              ))}
            </div>
          ))}
        </Section>

        {/* 3 — With Dot */}
        <Section title="Tag — With Dot" note="dot prop renders a colored indicator before the label">
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            {COLORS.map(color => (
              <Tag key={color} variant="subtle" color={color} size="md" dot>
                {capitalize(color)}
              </Tag>
            ))}
          </div>
        </Section>

        {/* 4 — With Leading Icon */}
        <Section title="Tag — With Leading Icon" note="leadingIcon slot accepts any React node · icon scales with tag size">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(['subtle', 'outline', 'solid'] as const).map(variant => (
              <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <ColLabel w={80}>{variant}</ColLabel>
                {(['blue', 'purple', 'green', 'orange', 'neutral'] as const).map(color => (
                  <Tag key={color} variant={variant} color={color} size="md" leadingIcon={<SunIcon />}>
                    {capitalize(color)}
                  </Tag>
                ))}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <ColLabel w={80}>sm</ColLabel>
              {(['blue', 'purple', 'green', 'orange', 'neutral'] as const).map(color => (
                <Tag key={color} variant="subtle" color={color} size="sm" leadingIcon={<SunIcon />}>
                  {capitalize(color)}
                </Tag>
              ))}
            </div>
          </div>
        </Section>

        {/* 5 — Dismissible */}
        <Section title="Tag — Dismissible" note="Click the × to remove a tag · tags are removed from the list">
          {dismissibleTags.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {dismissibleTags.map((label, i) => {
                const colors = ['blue', 'purple', 'pink', 'orange', 'matcha'] as const;
                return (
                  <Tag
                    key={label}
                    variant="subtle"
                    color={colors[i % colors.length]}
                    size="md"
                    dismissible
                    onDismiss={() => setDismissibleTags(prev => prev.filter(t => t !== label))}
                  >
                    {label}
                  </Tag>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-tertiary)' }}>All tags removed.</span>
              <button
                onClick={() => setDismissibleTags(['Design', 'Engineering', 'Product', 'Marketing', 'Operations'])}
                style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-link)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, letterSpacing: 'var(--tracking-wide)' }}
              >
                Reset
              </button>
            </div>
          )}
        </Section>

        {/* 6 — StatusTag */}
        <Section title="StatusTag" note="6 semantic statuses · sm · md · lg sizes · dot visible by default">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ width: 80 }} />
            {SIZES.map(s => (
              <span key={s} style={{ width: 100, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)' }}>{s.toUpperCase()}</span>
            ))}
          </div>
          {STATUSES.map(status => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <ColLabel w={80}>{status}</ColLabel>
              {SIZES.map(s => (
                <div key={s} style={{ width: 100 }}>
                  <StatusTag status={status} size={s}>{capitalize(status)}</StatusTag>
                </div>
              ))}
            </div>
          ))}
        </Section>

      </div>

      {/* Footer */}
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Tag &amp; StatusTag Specimen</span>
      </div>

    </div>
  );
}
