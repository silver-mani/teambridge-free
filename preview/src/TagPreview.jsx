/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Tag & StatusTag Preview
   Variants · Colors · Sizes · Dot · Leading Icon · Dismissible · Status
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useIsMobile } from './useIsMobile.js'

/* ── Inline icon ─────────────────────────────────────────────────────────────── */
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ── Tag component ───────────────────────────────────────────────────────────── */
function Tag({ variant = 'subtle', color = 'neutral', size = 'md', dot, leadingIcon, dismissible, onDismiss, children }) {
  return (
    <span className={`alloy-tag tag-${size} tag-${color} tag-${variant}`}>
      {dot && <span className="tag-dot" />}
      {leadingIcon && <span className="tag-icon alloy-icon-slot">{leadingIcon}</span>}
      {children}
      {dismissible && (
        <button className="tag-dismiss" onClick={onDismiss} type="button" aria-label="Remove">
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  )
}

/* ── StatusTag component ─────────────────────────────────────────────────────── */
function StatusTag({ status = 'neutral', size = 'md', dot = true, children }) {
  return (
    <span className={`alloy-status-tag st-${size} st-${status}`}>
      {dot && <span className="st-dot" />}
      {children}
    </span>
  )
}

/* ── Data ────────────────────────────────────────────────────────────────────── */
const COLORS   = ['neutral', 'blue', 'azure', 'purple', 'pink', 'red', 'orange', 'yellow', 'matcha', 'green']
const VARIANTS = ['subtle', 'outline', 'solid']
const STATUSES = ['success', 'warning', 'error', 'info', 'neutral', 'pending']

/* ── Layout helpers ──────────────────────────────────────────────────────────── */
function Section({ title, note, isMobile, children }) {
  return (
    <section style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-xl)', padding: isMobile ? 20 : 32 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 4px' }}>{title}</p>
        {note && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>{note}</p>}
      </div>
      {children}
    </section>
  )
}

function ColLabel({ w = 80, children }) {
  return (
    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', width: w, flexShrink: 0 }}>
      {children}
    </span>
  )
}

/* ── Specimen sub-components ─────────────────────────────────────────────────── */

function SpecimenGroup({ label }) {
  return (
    <div style={{
      padding:       '9px 20px 8px',
      borderTop:     '1px solid var(--color-border-opaque)',
      borderBottom:  '1px solid var(--color-border-opaque)',
      background:    'var(--color-bg-secondary)',
    }}>
      <span style={{
        fontFamily:    'var(--font-sans)',
        fontSize:      '10px',
        fontWeight:    700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color:         'var(--color-content-disabled)',
      }}>{label}</span>
    </div>
  )
}

function SpecimenRow({ label, tags = [], note, wide, isMobile, children }) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: isMobile ? '1fr' : wide ? '1fr 360px' : '1fr 200px',
      alignItems:          'center',
      borderBottom:        '1px solid var(--color-border-opaque)',
      minHeight:           '48px',
    }}>
      <div style={{
        padding:     '10px 20px',
        borderRight: '1px solid var(--color-border-opaque)',
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
        flexWrap:    'wrap',
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize:   'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color:      'var(--color-content-primary)',
          lineHeight: 1,
        }}>{label}</span>
        {tags.map(t => (
          <span key={t} style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '10.5px',
            fontWeight:    500,
            color:         'var(--color-content-tertiary)',
            background:    'var(--color-bg-secondary)',
            border:        '1px solid var(--color-border-opaque)',
            borderRadius:  'var(--radius-sm)',
            padding:       '1px 6px',
            lineHeight:    1.6,
          }}>{t}</span>
        ))}
        {note && (
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize:   'var(--text-xs)',
            color:      'var(--color-content-disabled)',
            width:      '100%',
            marginTop:  '2px',
          }}>{note}</span>
        )}
      </div>
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '10px 20px',
        gap:            '6px',
        flexWrap:       'wrap',
      }}>
        {children}
      </div>
    </div>
  )
}

function ImportRow() {
  return (
    <div style={{
      padding:      '14px 20px',
      borderBottom: '1px solid var(--color-border-opaque)',
      fontFamily:   'var(--font-mono)',
      fontSize:     '12.5px',
      color:        'var(--color-content-secondary)',
    }}>
      <span style={{ color: 'var(--color-content-disabled)' }}>import </span>
      <span style={{ color: 'var(--color-content-primary)', fontWeight: 500 }}>{'{ Tag, StatusTag }'}</span>
      <span style={{ color: 'var(--color-content-disabled)' }}> from </span>
      <span style={{ color: 'var(--color-content-secondary)' }}>'alloy-design-system'</span>
    </div>
  )
}

/* ── Preview ─────────────────────────────────────────────────────────────────── */
export default function TagPreview() {
  const isMobile = useIsMobile()
  const [dismissibleTags, setDismissibleTags] = useState(['Design', 'Engineering', 'Product', 'Marketing', 'Operations'])

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        /* ─ Tag base ─ */
        .alloy-tag {
          display: inline-flex;
          align-items: center;
          gap: var(--tag-gap);
          height: var(--tag-height);
          padding: 0 var(--tag-px);
          border-radius: 6px;
          border: 1px solid transparent;
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
          letter-spacing: var(--tracking-wide);
          white-space: nowrap;
          user-select: none;
          vertical-align: middle;
        }

        /* ─ Tag sizes ─ */
        .tag-sm {
          --tag-height:       20px;
          --tag-px:           6px;
          --tag-gap:          3px;
          --tag-dot-size:     6px;
          --tag-icon-size:    12px;
          --tag-dismiss-size: 14px;
        }
        .tag-md {
          --tag-height:       24px;
          --tag-px:           var(--space-2);
          --tag-gap:          4px;
          --tag-dot-size:     7px;
          --tag-icon-size:    14px;
          --tag-dismiss-size: 16px;
        }
        .tag-lg {
          --tag-height:       32px;
          --tag-px:           var(--space-2);
          --tag-gap:          5px;
          --tag-dot-size:     8px;
          --tag-icon-size:    16px;
          --tag-dismiss-size: 18px;
          font-size: var(--text-sm);
        }

        /* ─ Tag colors ─ */
        .tag-neutral {
          --tag-dot:            var(--color-content-disabled);
          --tag-subtle-bg:      var(--color-bg-tertiary);
          --tag-subtle-border:  var(--color-border-opaque);
          --tag-subtle-color:   var(--color-content-secondary);
          --tag-outline-bg:     transparent;
          --tag-outline-border: var(--color-border-opaque);
          --tag-outline-color:  var(--color-content-secondary);
          --tag-solid-bg:       var(--color-bg-inverse-primary);
          --tag-solid-border:   transparent;
          --tag-solid-color:    var(--color-content-inverse-primary);
        }
        .tag-blue {
          --tag-dot:            var(--color-blue-bg-primary);
          --tag-subtle-bg:      var(--color-blue-bg-tertiary);
          --tag-subtle-border:  var(--color-blue-border-tertiary);
          --tag-subtle-color:   var(--color-blue-content-primary);
          --tag-outline-bg:     transparent;
          --tag-outline-border: var(--color-blue-border-primary);
          --tag-outline-color:  var(--color-blue-content-primary);
          --tag-solid-bg:       var(--color-blue-bg-primary);
          --tag-solid-border:   transparent;
          --tag-solid-color:    var(--color-content-inverse-primary);
        }
        .tag-azure {
          --tag-dot:            var(--color-azure-bg-primary);
          --tag-subtle-bg:      var(--color-azure-bg-tertiary);
          --tag-subtle-border:  var(--color-azure-border-tertiary);
          --tag-subtle-color:   var(--color-azure-content-primary);
          --tag-outline-bg:     transparent;
          --tag-outline-border: var(--color-azure-border-primary);
          --tag-outline-color:  var(--color-azure-content-primary);
          --tag-solid-bg:       var(--color-azure-bg-primary);
          --tag-solid-border:   transparent;
          --tag-solid-color:    var(--color-content-inverse-primary);
        }
        .tag-purple {
          --tag-dot:            var(--color-purple-bg-primary);
          --tag-subtle-bg:      var(--color-purple-bg-tertiary);
          --tag-subtle-border:  var(--color-purple-border-tertiary);
          --tag-subtle-color:   var(--color-purple-content-primary);
          --tag-outline-bg:     transparent;
          --tag-outline-border: var(--color-purple-border-primary);
          --tag-outline-color:  var(--color-purple-content-primary);
          --tag-solid-bg:       var(--color-purple-bg-primary);
          --tag-solid-border:   transparent;
          --tag-solid-color:    var(--color-content-inverse-primary);
        }
        .tag-pink {
          --tag-dot:            var(--color-pink-bg-primary);
          --tag-subtle-bg:      var(--color-pink-bg-tertiary);
          --tag-subtle-border:  var(--color-pink-border-tertiary);
          --tag-subtle-color:   var(--color-pink-content-primary);
          --tag-outline-bg:     transparent;
          --tag-outline-border: var(--color-pink-border-primary);
          --tag-outline-color:  var(--color-pink-content-primary);
          --tag-solid-bg:       var(--color-pink-bg-primary);
          --tag-solid-border:   transparent;
          --tag-solid-color:    var(--color-content-inverse-primary);
        }
        .tag-red {
          --tag-dot:            var(--color-red-bg-primary);
          --tag-subtle-bg:      var(--color-red-bg-tertiary);
          --tag-subtle-border:  var(--color-red-border-tertiary);
          --tag-subtle-color:   var(--color-red-content-primary);
          --tag-outline-bg:     transparent;
          --tag-outline-border: var(--color-red-border-primary);
          --tag-outline-color:  var(--color-red-content-primary);
          --tag-solid-bg:       var(--color-red-bg-primary);
          --tag-solid-border:   transparent;
          --tag-solid-color:    var(--color-content-inverse-primary);
        }
        .tag-orange {
          --tag-dot:            var(--color-orange-bg-primary);
          --tag-subtle-bg:      var(--color-orange-bg-tertiary);
          --tag-subtle-border:  var(--color-orange-border-tertiary);
          --tag-subtle-color:   var(--color-orange-content-primary);
          --tag-outline-bg:     transparent;
          --tag-outline-border: var(--color-orange-border-primary);
          --tag-outline-color:  var(--color-orange-content-primary);
          --tag-solid-bg:       var(--color-orange-bg-primary);
          --tag-solid-border:   transparent;
          --tag-solid-color:    var(--color-content-inverse-primary);
        }
        .tag-yellow {
          --tag-dot:            var(--color-yellow-bg-primary);
          --tag-subtle-bg:      var(--color-yellow-bg-tertiary);
          --tag-subtle-border:  var(--color-yellow-border-tertiary);
          --tag-subtle-color:   var(--color-yellow-content-primary);
          --tag-outline-bg:     transparent;
          --tag-outline-border: var(--color-yellow-border-primary);
          --tag-outline-color:  var(--color-yellow-content-primary);
          --tag-solid-bg:       var(--color-yellow-bg-primary);
          --tag-solid-border:   transparent;
          --tag-solid-color:    var(--color-content-inverse-primary);
        }
        .tag-matcha {
          --tag-dot:            var(--color-matcha-bg-primary);
          --tag-subtle-bg:      var(--color-matcha-bg-tertiary);
          --tag-subtle-border:  var(--color-matcha-border-tertiary);
          --tag-subtle-color:   var(--color-matcha-content-primary);
          --tag-outline-bg:     transparent;
          --tag-outline-border: var(--color-matcha-border-primary);
          --tag-outline-color:  var(--color-matcha-content-primary);
          --tag-solid-bg:       var(--color-matcha-bg-primary);
          --tag-solid-border:   transparent;
          --tag-solid-color:    var(--color-content-inverse-primary);
        }
        .tag-green {
          --tag-dot:            var(--color-green-bg-primary);
          --tag-subtle-bg:      var(--color-green-bg-tertiary);
          --tag-subtle-border:  var(--color-green-border-tertiary);
          --tag-subtle-color:   var(--color-green-content-primary);
          --tag-outline-bg:     transparent;
          --tag-outline-border: var(--color-green-border-primary);
          --tag-outline-color:  var(--color-green-content-primary);
          --tag-solid-bg:       var(--color-green-bg-primary);
          --tag-solid-border:   transparent;
          --tag-solid-color:    var(--color-content-inverse-primary);
        }

        /* ─ Tag variants ─ */
        .tag-subtle  { background-color: var(--tag-subtle-bg);  color: var(--tag-subtle-color);  border-color: var(--tag-subtle-border);  }
        .tag-outline { background-color: var(--tag-outline-bg); color: var(--tag-outline-color); border-color: var(--tag-outline-border); }
        .tag-solid   { background-color: var(--tag-solid-bg);   color: var(--tag-solid-color);   border-color: var(--tag-solid-border);   }

        /* ─ Tag dot ─ */
        .tag-dot {
          width: var(--tag-dot-size);
          height: var(--tag-dot-size);
          border-radius: var(--radius-full);
          background-color: var(--tag-dot);
          flex-shrink: 0;
        }

        /* ─ Tag icon slot ─ */
        .tag-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: var(--tag-icon-size);
          height: var(--tag-icon-size);
        }
        /* ─ Shared icon slot (mirrors Alloy artwork.css) ─ */
        .alloy-icon-slot > svg,
        .alloy-icon-slot > svg * { stroke-width: var(--icon-stroke-width, 1.75); }
        .alloy-icon-slot > svg { display: block; width: 100%; height: 100%; }

        /* ─ Tag dismiss ─ */
        .tag-dismiss {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: var(--tag-dismiss-size);
          height: var(--tag-dismiss-size);
          border-radius: var(--radius-full);
          border: none;
          background: none;
          color: currentColor;
          cursor: pointer;
          padding: 0;
          margin-left: 1px;
          margin-right: -4px;
          opacity: 0.55;
          transition:
            opacity var(--duration-fast) var(--ease-default),
            background-color var(--duration-fast) var(--ease-default);
          flex-shrink: 0;
        }
        .tag-dismiss:hover {
          opacity: 1;
          background-color: rgba(0, 0, 0, 0.08);
        }

        /* ─ StatusTag base ─ */
        .alloy-status-tag {
          display: inline-flex;
          align-items: center;
          gap: var(--st-gap);
          height: var(--st-height);
          padding: 0 var(--st-px);
          border-radius: 6px;
          border: 1px solid var(--tag-subtle-border);
          background-color: var(--tag-subtle-bg);
          color: var(--tag-subtle-color);
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
          letter-spacing: var(--tracking-wide);
          white-space: nowrap;
          user-select: none;
          vertical-align: middle;
        }

        /* ─ StatusTag sizes ─ */
        .st-sm { --st-height: 20px; --st-px: 6px;             --st-gap: 4px;             --st-dot-size: 6px; }
        .st-md { --st-height: 24px; --st-px: var(--space-2); --st-gap: var(--space-1);  --st-dot-size: 7px; }
        .st-lg { --st-height: 32px; --st-px: var(--space-2); --st-gap: 5px;             --st-dot-size: 8px; font-size: var(--text-sm); }

        /* ─ StatusTag dot ─ */
        .st-dot {
          width: var(--st-dot-size);
          height: var(--st-dot-size);
          border-radius: var(--radius-full);
          background-color: var(--tag-dot);
          flex-shrink: 0;
        }

        /* ─ StatusTag statuses ─ */
        .st-success { --tag-dot: var(--color-success-fill); --tag-subtle-bg: var(--color-success-bg); --tag-subtle-border: var(--color-success-border); --tag-subtle-color: var(--color-success-content); }
        .st-warning { --tag-dot: var(--color-warning-fill); --tag-subtle-bg: var(--color-warning-bg); --tag-subtle-border: var(--color-warning-border); --tag-subtle-color: var(--color-warning-content); }
        .st-error   { --tag-dot: var(--color-error-fill);   --tag-subtle-bg: var(--color-error-bg);   --tag-subtle-border: var(--color-error-border);   --tag-subtle-color: var(--color-error-content);   }
        .st-info    { --tag-dot: var(--color-info-fill);    --tag-subtle-bg: var(--color-info-bg);    --tag-subtle-border: var(--color-info-border);    --tag-subtle-color: var(--color-info-content);    }
        .st-neutral { --tag-dot: var(--color-content-disabled); --tag-subtle-bg: var(--color-bg-tertiary); --tag-subtle-border: var(--color-border-opaque); --tag-subtle-color: var(--color-content-secondary); }
        .st-pending { --tag-dot: var(--color-yellow-bg-primary); --tag-subtle-bg: var(--color-yellow-bg-tertiary); --tag-subtle-border: var(--color-yellow-border-tertiary); --tag-subtle-color: var(--color-yellow-content-primary); }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Data Display</p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Tag &amp; StatusTag</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 'var(--line-height-loose)' }}>3 variants · 10 colors + neutral · 3 sizes · dot · leading icon · dismissible · 6 status types</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>

          {/* 1 — Variants × Colors */}
          <Section title="Tag — Variants & Colors" note="subtle · outline · solid across all 10 colors + neutral · md size" isMobile={isMobile}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ width: 80 }} />
              {VARIANTS.map(v => (
                <span key={v} style={{ width: 88, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)' }}>{v}</span>
              ))}
            </div>
            {COLORS.map(color => (
              <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <ColLabel w={80}>{color}</ColLabel>
                {VARIANTS.map(v => (
                  <div key={v} style={{ width: 88 }}>
                    <Tag variant={v} color={color} size="md">{color.charAt(0).toUpperCase() + color.slice(1)}</Tag>
                  </div>
                ))}
              </div>
            ))}
          </Section>

          {/* 2 — Sizes */}
          <Section title="Tag — Sizes" note="sm (20px) · md (24px) · lg (32px) · subtle variant" isMobile={isMobile}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ width: 80 }} />
              {['sm', 'md', 'lg'].map(s => (
                <span key={s} style={{ width: 88, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)' }}>{s.toUpperCase()}</span>
              ))}
            </div>
            {COLORS.map(color => (
              <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <ColLabel w={80}>{color}</ColLabel>
                {['sm', 'md', 'lg'].map(s => (
                  <div key={s} style={{ width: 88 }}>
                    <Tag variant="subtle" color={color} size={s}>{color.charAt(0).toUpperCase() + color.slice(1)}</Tag>
                  </div>
                ))}
              </div>
            ))}
          </Section>

          {/* 3 — With Dot */}
          <Section title="Tag — With Dot" note="dot prop renders a colored indicator before the label" isMobile={isMobile}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              {COLORS.map(color => (
                <Tag key={color} variant="subtle" color={color} size="md" dot>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </Tag>
              ))}
            </div>
          </Section>

          {/* 4 — With Leading Icon */}
          <Section title="Tag — With Leading Icon" note="leadingIcon slot accepts any React node · icon scales with tag size" isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <ColLabel w={80}>subtle</ColLabel>
                {['blue', 'purple', 'green', 'orange', 'neutral'].map(color => (
                  <Tag key={color} variant="subtle" color={color} size="md" leadingIcon={<SunIcon />}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </Tag>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <ColLabel w={80}>outline</ColLabel>
                {['blue', 'purple', 'green', 'orange', 'neutral'].map(color => (
                  <Tag key={color} variant="outline" color={color} size="md" leadingIcon={<SunIcon />}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </Tag>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <ColLabel w={80}>solid</ColLabel>
                {['blue', 'purple', 'green', 'orange', 'neutral'].map(color => (
                  <Tag key={color} variant="solid" color={color} size="md" leadingIcon={<SunIcon />}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </Tag>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <ColLabel w={80}>sm</ColLabel>
                {['blue', 'purple', 'green', 'orange', 'neutral'].map(color => (
                  <Tag key={color} variant="subtle" color={color} size="sm" leadingIcon={<SunIcon />}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </Tag>
                ))}
              </div>
            </div>
          </Section>

          {/* 5 — Dismissible */}
          <Section title="Tag — Dismissible" note="Click the × to remove a tag · tags are removed from the list" isMobile={isMobile}>
            {dismissibleTags.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {dismissibleTags.map((label, i) => {
                  const colors = ['blue', 'purple', 'pink', 'orange', 'matcha']
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
                  )
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
          <Section title="StatusTag" note="6 semantic statuses · sm · md · lg sizes · dot always visible by default" isMobile={isMobile}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ width: 80 }} />
              {['sm', 'md', 'lg'].map(s => (
                <span key={s} style={{ width: 100, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)' }}>{s.toUpperCase()}</span>
              ))}
            </div>
            {STATUSES.map(status => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <ColLabel w={80}>{status}</ColLabel>
                {['sm', 'md', 'lg'].map(s => (
                  <div key={s} style={{ width: 100 }}>
                    <StatusTag status={status} size={s}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </StatusTag>
                  </div>
                ))}
              </div>
            ))}
          </Section>

          {/* 7 — Specimen */}
          <Section title="Specimen" note="Quick-reference table — scan to identify the exact variant, color, size, and layout to name when prompting." isMobile={isMobile}>
            <div style={{
              background:   'var(--color-bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border:       '1px solid var(--color-border-opaque)',
              overflow:     'hidden',
            }}>

              {/* Import */}
              <SpecimenGroup label="Package" />
              <ImportRow />

              {/* Tag — Variant */}
              <SpecimenGroup label="Tag · Variant" />
              <SpecimenRow label="Subtle" tags={['variant="subtle"']} note="Default — tinted background, muted border" wide isMobile={isMobile}>
                <Tag variant="subtle"  color="blue" size="md">Blue</Tag>
                <Tag variant="subtle"  color="purple" size="md">Purple</Tag>
                <Tag variant="subtle"  color="neutral" size="md">Neutral</Tag>
              </SpecimenRow>
              <SpecimenRow label="Outline" tags={['variant="outline"']} note="Transparent fill, colored border" wide isMobile={isMobile}>
                <Tag variant="outline" color="blue" size="md">Blue</Tag>
                <Tag variant="outline" color="purple" size="md">Purple</Tag>
                <Tag variant="outline" color="neutral" size="md">Neutral</Tag>
              </SpecimenRow>
              <SpecimenRow label="Solid" tags={['variant="solid"']} note="Filled background, inverse label text" wide isMobile={isMobile}>
                <Tag variant="solid"   color="blue" size="md">Blue</Tag>
                <Tag variant="solid"   color="purple" size="md">Purple</Tag>
                <Tag variant="solid"   color="neutral" size="md">Neutral</Tag>
              </SpecimenRow>

              {/* Tag — Color */}
              <SpecimenGroup label="Tag · Color" />
              {COLORS.map(c => (
                <SpecimenRow key={c} label={c.charAt(0).toUpperCase() + c.slice(1)} tags={[`color="${c}"`]} wide isMobile={isMobile}>
                  <Tag variant="subtle"  color={c} size="md">{c.charAt(0).toUpperCase() + c.slice(1)}</Tag>
                  <Tag variant="outline" color={c} size="md">{c.charAt(0).toUpperCase() + c.slice(1)}</Tag>
                  <Tag variant="solid"   color={c} size="md">{c.charAt(0).toUpperCase() + c.slice(1)}</Tag>
                </SpecimenRow>
              ))}

              {/* Tag — Size */}
              <SpecimenGroup label="Tag · Size" />
              <SpecimenRow label="SM" tags={['size="sm"', '20px height']} isMobile={isMobile}>
                <Tag variant="subtle" color="blue" size="sm">Label</Tag>
              </SpecimenRow>
              <SpecimenRow label="MD" tags={['size="md"', '24px height', 'default']} isMobile={isMobile}>
                <Tag variant="subtle" color="blue" size="md">Label</Tag>
              </SpecimenRow>
              <SpecimenRow label="LG" tags={['size="lg"', '32px height']} isMobile={isMobile}>
                <Tag variant="subtle" color="blue" size="lg">Label</Tag>
              </SpecimenRow>

              {/* Tag — Layout / Artwork */}
              <SpecimenGroup label="Tag · Layout & Artwork" />
              <SpecimenRow label="Default" tags={[]} note="Text only" isMobile={isMobile}>
                <Tag variant="subtle" color="blue" size="md">Design</Tag>
              </SpecimenRow>
              <SpecimenRow label="With Dot" tags={['dot']} note="Colored indicator before label" isMobile={isMobile}>
                <Tag variant="subtle" color="blue"   size="md" dot>Blue</Tag>
                <Tag variant="subtle" color="purple" size="md" dot>Purple</Tag>
                <Tag variant="subtle" color="green"  size="md" dot>Green</Tag>
              </SpecimenRow>
              <SpecimenRow label="Leading Icon" tags={['leadingIcon']} note="Any React node — scales with size" wide isMobile={isMobile}>
                <Tag variant="subtle"  color="blue"   size="md" leadingIcon={<SunIcon />}>Subtle</Tag>
                <Tag variant="outline" color="purple" size="md" leadingIcon={<SunIcon />}>Outline</Tag>
                <Tag variant="solid"   color="neutral" size="md" leadingIcon={<SunIcon />}>Solid</Tag>
              </SpecimenRow>
              <SpecimenRow label="Dismissible" tags={['dismissible', 'onDismiss']} note="Renders a × button — wire onDismiss to remove from state" wide isMobile={isMobile}>
                <Tag variant="subtle" color="blue"   size="md" dismissible>Design</Tag>
                <Tag variant="subtle" color="purple" size="md" dismissible>Engineering</Tag>
              </SpecimenRow>

              {/* StatusTag — Status */}
              <SpecimenGroup label="StatusTag · Status" />
              {STATUSES.map(s => (
                <SpecimenRow key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} tags={[`status="${s}"`]} wide isMobile={isMobile}>
                  <StatusTag status={s} size="sm">{s.charAt(0).toUpperCase() + s.slice(1)}</StatusTag>
                  <StatusTag status={s} size="md">{s.charAt(0).toUpperCase() + s.slice(1)}</StatusTag>
                  <StatusTag status={s} size="lg">{s.charAt(0).toUpperCase() + s.slice(1)}</StatusTag>
                </SpecimenRow>
              ))}

              {/* StatusTag — Size */}
              <SpecimenGroup label="StatusTag · Size" />
              <SpecimenRow label="SM" tags={['size="sm"', '20px height']} isMobile={isMobile}>
                <StatusTag status="success" size="sm">Success</StatusTag>
              </SpecimenRow>
              <SpecimenRow label="MD" tags={['size="md"', '24px height', 'default']} isMobile={isMobile}>
                <StatusTag status="success" size="md">Success</StatusTag>
              </SpecimenRow>
              <SpecimenRow label="LG" tags={['size="lg"', '32px height']} isMobile={isMobile}>
                <StatusTag status="success" size="lg">Success</StatusTag>
              </SpecimenRow>

            </div>
          </Section>

        </div>{/* end flex column */}

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Tag &amp; StatusTag v1</span>
        </div>

      </div>
    </>
  )
}
