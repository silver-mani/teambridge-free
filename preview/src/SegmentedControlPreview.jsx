/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · SegmentedControl Preview
   Sizes · Icons · Icon-only · Full-width · Disabled · Dark mode
   ───────────────────────────────────────────────────────────────────────────── */

import { useState, useRef, useLayoutEffect } from 'react'
import { useIsMobile } from './useIsMobile.js'

/* ── Icons (from Alloy icon library — 24×24 viewBox, currentColor stroke) ────── */
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.4 3H4.6C4.03995 3 3.75992 3 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3 3.75992 3 4.03995 3 4.6V8.4C3 8.96005 3 9.24008 3.10899 9.45399C3.20487 9.64215 3.35785 9.79513 3.54601 9.89101C3.75992 10 4.03995 10 4.6 10H8.4C8.96005 10 9.24008 10 9.45399 9.89101C9.64215 9.79513 9.79513 9.64215 9.89101 9.45399C10 9.24008 10 8.96005 10 8.4V4.6C10 4.03995 10 3.75992 9.89101 3.54601C9.79513 3.35785 9.64215 3.20487 9.45399 3.10899C9.24008 3 8.96005 3 8.4 3Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.4 3H15.6C15.0399 3 14.7599 3 14.546 3.10899C14.3578 3.20487 14.2049 3.35785 14.109 3.54601C14 3.75992 14 4.03995 14 4.6V8.4C14 8.96005 14 9.24008 14.109 9.45399C14.2049 9.64215 14.3578 9.79513 14.546 9.89101C14.7599 10 15.0399 10 15.6 10H19.4C19.9601 10 20.2401 10 20.454 9.89101C20.6422 9.79513 20.7951 9.64215 20.891 9.45399C21 9.24008 21 8.96005 21 8.4V4.6C21 4.03995 21 3.75992 20.891 3.54601C20.7951 3.35785 20.6422 3.20487 20.454 3.10899C20.2401 3 19.9601 3 19.4 3Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.4 14H15.6C15.0399 14 14.7599 14 14.546 14.109C14.3578 14.2049 14.2049 14.3578 14.109 14.546C14 14.7599 14 15.0399 14 15.6V19.4C14 19.9601 14 20.2401 14.109 20.454C14.2049 20.6422 14.3578 20.7951 14.546 20.891C14.7599 21 15.0399 21 15.6 21H19.4C19.9601 21 20.2401 21 20.454 20.891C20.6422 20.7951 20.7951 20.6422 20.891 20.454C21 20.2401 21 19.9601 21 19.4V15.6C21 15.0399 21 14.7599 20.891 14.546C20.7951 14.3578 20.6422 14.2049 20.454 14.109C20.2401 14 19.9601 14 19.4 14Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.4 14H4.6C4.03995 14 3.75992 14 3.54601 14.109C3.35785 14.2049 3.20487 14.3578 3.10899 14.546C3 14.7599 3 15.0399 3 15.6V19.4C3 19.9601 3 20.2401 3.10899 20.454C3.20487 20.6422 3.35785 20.7951 3.54601 20.891C3.75992 21 4.03995 21 4.6 21H8.4C8.96005 21 9.24008 21 9.45399 20.891C9.64215 20.7951 9.79513 20.6422 9.89101 20.454C10 20.2401 10 19.9601 10 19.4V15.6C10 15.0399 10 14.7599 9.89101 14.546C9.79513 14.3578 9.64215 14.2049 9.45399 14.109C9.24008 14 8.96005 14 8.4 14Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12L9 12M21 6L9 6M21 18L9 18M5 12C5 12.5523 4.55228 13 4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11C4.55228 11 5 11.4477 5 12ZM5 6C5 6.55228 4.55228 7 4 7C3.44772 7 3 6.55228 3 6C3 5.44772 3.44772 5 4 5C4.55228 5 5 5.44772 5 6ZM5 18C5 18.5523 4.55228 19 4 19C3.44772 19 3 18.5523 3 18C3 17.4477 3.44772 17 4 17C4.55228 17 5 17.4477 5 18Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ColumnsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.8 3H6.2C5.0799 3 4.51984 3 4.09202 3.21799C3.71569 3.40973 3.40973 3.71569 3.21799 4.09202C3 4.51984 3 5.07989 3 6.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.0799 21 6.2 21H6.8C7.9201 21 8.48016 21 8.90798 20.782C9.28431 20.5903 9.59027 20.2843 9.78201 19.908C10 19.4802 10 18.9201 10 17.8V6.2C10 5.0799 10 4.51984 9.78201 4.09202C9.59027 3.71569 9.28431 3.40973 8.90798 3.21799C8.48016 3 7.9201 3 6.8 3Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.8 3H17.2C16.0799 3 15.5198 3 15.092 3.21799C14.7157 3.40973 14.4097 3.71569 14.218 4.09202C14 4.51984 14 5.0799 14 6.2V17.8C14 18.9201 14 19.4802 14.218 19.908C14.4097 20.2843 14.7157 20.5903 15.092 20.782C15.5198 21 16.0799 21 17.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V6.2C21 5.0799 21 4.51984 20.782 4.09202C20.5903 3.71569 20.2843 3.40973 19.908 3.21799C19.4802 3 18.9201 3 17.8 3Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const DayIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 2v2M11 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="5" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
  </svg>
)
const WeekIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 2v2M11 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4.5 10h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const MonthIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 2v2M11 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="5.5" cy="10" r="0.75" fill="currentColor" />
    <circle cx="8" cy="10" r="0.75" fill="currentColor" />
    <circle cx="10.5" cy="10" r="0.75" fill="currentColor" />
  </svg>
)
const ChartBarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 20V4M6 20V16M12 20V10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ChartLineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M20 8L16.0811 12.1827C15.9326 12.3412 15.8584 12.4204 15.7688 12.4614C15.6897 12.4976 15.6026 12.5125 15.516 12.5047C15.4179 12.4958 15.3215 12.4458 15.1287 12.3457L11.8713 10.6543C11.6785 10.5542 11.5821 10.5042 11.484 10.4953C11.3974 10.4875 11.3103 10.5024 11.2312 10.5386C11.1416 10.5796 11.0674 10.6588 10.9189 10.8173L7 15" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ChartAreaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.2104 15.89C20.5742 17.3945 19.5792 18.7202 18.3123 19.7513C17.0454 20.7824 15.5452 21.4874 13.9428 21.8048C12.3405 22.1221 10.6848 22.0422 9.12055 21.5718C7.55627 21.1015 6.13103 20.2551 4.96942 19.1067C3.80782 17.9582 2.94522 16.5428 2.45704 14.984C1.96886 13.4252 1.86996 11.7705 2.169 10.1646C2.46804 8.55879 3.1559 7.05064 4.17245 5.77204C5.189 4.49344 6.50329 3.48333 8.0004 2.83001M21.2392 8.17317C21.6395 9.13964 21.8851 10.1614 21.9684 11.2009C21.989 11.4577 21.9993 11.5861 21.9483 11.7017C21.9057 11.7983 21.8213 11.8898 21.7284 11.9399C21.6172 12 21.4783 12 21.2004 12H12.8004C12.5204 12 12.3804 12 12.2734 11.9455C12.1793 11.8976 12.1028 11.8211 12.0549 11.727C12.0004 11.62 12.0004 11.48 12.0004 11.2V2.80001C12.0004 2.52214 12.0004 2.38321 12.0605 2.27199C12.1107 2.17909 12.2021 2.0947 12.2987 2.0521C12.4144 2.00111 12.5428 2.0114 12.7996 2.03199C13.839 2.11533 14.8608 2.36089 15.8272 2.76121C17.0405 3.26376 18.1429 4.00035 19.0715 4.92894C20.0001 5.85753 20.7367 6.95992 21.2392 8.17317Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ── Stateful segmented control ───────────────────────────────────────────────── */
function ControlledSC({ defaultValue, size = 'md', disabled = false, fullWidth = false, items, extraClass = '' }) {
  const [value, setValue] = useState(defaultValue)
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const btn = root.querySelector('[aria-checked="true"]')
    if (!btn) return
    root.style.setProperty('--sc-indicator-x', `${btn.offsetLeft}px`)
    root.style.setProperty('--sc-indicator-w', `${btn.offsetWidth}px`)
  }, [value])

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      className={`sc-root sc-${size}${fullWidth ? ' sc-full' : ''}${extraClass ? ' ' + extraClass : ''}`}
    >
      <span className="sc-indicator" aria-hidden="true" />
      {items.map(item => {
        const selected = value === item.value
        const isDisabled = disabled || item.disabled
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={isDisabled}
            className={`sc-item${selected ? ' sc-selected' : ''}`}
            onClick={() => { if (!isDisabled) setValue(item.value) }}
          >
            {item.icon && <span className="sc-icon alloy-icon-slot" aria-hidden="true">{item.icon}</span>}
            {item.label !== undefined && <span className="sc-label">{item.label}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* ── Specimen sub-components ─────────────────────────────────────────────────── */

function SpecimenGroup({ label }) {
  return (
    <div style={{
      padding:      '9px 20px 8px',
      borderTop:    '1px solid var(--color-border-opaque)',
      borderBottom: '1px solid var(--color-border-opaque)',
      background:   'var(--color-bg-secondary)',
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

function SpecimenRow({ label, tags = [], note, isMobile, children }) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: isMobile ? '1fr' : '200px 1fr',
      alignItems:          'center',
      borderBottom:        '1px solid var(--color-border-opaque)',
      minHeight:           '52px',
    }}>
      <div style={{
        padding:     '12px 20px',
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
            fontFamily:   'var(--font-mono)',
            fontSize:     '10.5px',
            fontWeight:   500,
            color:        'var(--color-content-tertiary)',
            background:   'var(--color-bg-secondary)',
            border:       '1px solid var(--color-border-opaque)',
            borderRadius: 'var(--radius-sm)',
            padding:      '1px 6px',
            lineHeight:   1.6,
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
      <div style={{ padding: '12px 20px', overflowX: 'auto' }}>
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
      <span className="specimen-import-kw">import </span>
      <span className="specimen-import-exp">{'{ SegmentedControl }'}</span>
      <span className="specimen-import-kw"> from </span>
      <span className="specimen-import-src">'alloy-design-system'</span>
    </div>
  )
}

/* ── Section layout ───────────────────────────────────────────────────────────── */
function Section({ title, note, children, isMobile }) {
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

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', width: 56, flexShrink: 0, letterSpacing: 'var(--tracking-wide)' }}>{label}</span>
      {children}
    </div>
  )
}

/* ── Preview ─────────────────────────────────────────────────────────────────── */
export default function SegmentedControlPreview() {
  const isMobile = useIsMobile()
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        /* ─ Specimen ─ */
        .specimen-import-kw  { color: var(--color-content-disabled); }
        .specimen-import-exp { color: var(--color-content-primary); font-weight: 500; }
        .specimen-import-src { color: var(--color-content-secondary); }

        /* ─ Root track ─ */
        .sc-root {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 2px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-opaque);
          border-radius: 6px;
        }
        .sc-full { display: flex; width: 100%; }
        .sc-full .sc-item { flex: 1; }

        /* ─ Sliding indicator ─ */
        .sc-indicator {
          position: absolute;
          top: 2px;
          left: var(--sc-indicator-x, 0px);
          width: var(--sc-indicator-w, 0px);
          height: calc(100% - 4px);
          background: var(--color-bg-primary);
          border-radius: 4px;
          box-shadow: var(--shadow-below-low);
          transition:
            left  150ms cubic-bezier(0.4, 0, 0.2, 1),
            width 80ms  cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          z-index: 0;
          will-change: left, width;
        }

        /* ─ Sizes ─ */
        .sc-sm { --sc-h: 24px; --sc-px: var(--space-2); --sc-gap: var(--space-1); --sc-icon: 14px; font-size: var(--text-xs); }
        .sc-md { --sc-h: 28px; --sc-px: 10px;           --sc-gap: var(--space-1); --sc-icon: 15px; font-size: var(--text-sm); }
        .sc-lg { --sc-h: 32px; --sc-px: var(--space-3); --sc-gap: var(--space-1); --sc-icon: 16px; font-size: var(--text-sm); }

        /* ─ Item ─ */
        .sc-item {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--sc-gap);
          height: var(--sc-h);
          padding: 0 var(--sc-px);
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--color-content-tertiary);
          font-family: var(--font-sans);
          font-size: inherit;
          font-weight: var(--font-weight-medium);
          letter-spacing: var(--tracking-normal);
          white-space: nowrap;
          cursor: pointer;
          transition: color var(--duration-fast) var(--ease-default);
        }
        .sc-item:hover:not(:disabled):not([aria-checked="true"]) {
          color: var(--color-content-secondary);
        }
        .sc-item:disabled {
          color: var(--color-content-disabled);
          cursor: not-allowed;
        }

        /* ─ Selected — indicator handles bg/shadow ─ */
        .sc-selected {
          color: var(--color-content-primary);
          font-weight: var(--font-weight-semibold);
        }

        /* ─ Icon slot ─ */
        .sc-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: var(--sc-icon);
          height: var(--sc-icon);
        }
        /* ─ Shared icon slot (mirrors Alloy artwork.css) ─ */
        .alloy-icon-slot > svg,
        .alloy-icon-slot > svg * { stroke-width: var(--icon-stroke-width, 1.75); }
        .alloy-icon-slot > svg { display: block; width: 100%; height: 100%; }
        .sc-label { line-height: 1; }

      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Navigation</p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Segmented Control</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 1.6 }}>Sliding selection · 3 sizes · label · icon · icon-only · full-width · disabled · dark mode</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 1 — Sizes */}
          <Section title="Sizes" note="sm (28px) · md (32px) · lg (36px) outer height" isMobile={isMobile}>
            <Row label="sm">
              <ControlledSC size="sm" defaultValue="week" items={[
                { value: 'day',   label: 'Day'   },
                { value: 'week',  label: 'Week'  },
                { value: 'month', label: 'Month' },
              ]} />
            </Row>
            <Row label="md">
              <ControlledSC size="md" defaultValue="week" items={[
                { value: 'day',   label: 'Day'   },
                { value: 'week',  label: 'Week'  },
                { value: 'month', label: 'Month' },
              ]} />
            </Row>
            <Row label="lg">
              <ControlledSC size="lg" defaultValue="week" items={[
                { value: 'day',   label: 'Day'   },
                { value: 'week',  label: 'Week'  },
                { value: 'month', label: 'Month' },
              ]} />
            </Row>
          </Section>

          {/* 2 — With leading icon */}
          <Section title="With Leading Icon" note="leadingIcon renders before the label and scales with size" isMobile={isMobile}>
            <Row label="sm">
              <ControlledSC size="sm" defaultValue="grid" items={[
                { value: 'grid',    icon: <GridIcon />,    label: 'Grid'    },
                { value: 'list',    icon: <ListIcon />,    label: 'List'    },
                { value: 'columns', icon: <ColumnsIcon />, label: 'Columns' },
              ]} />
            </Row>
            <Row label="md">
              <ControlledSC size="md" defaultValue="grid" items={[
                { value: 'grid',    icon: <GridIcon />,    label: 'Grid'    },
                { value: 'list',    icon: <ListIcon />,    label: 'List'    },
                { value: 'columns', icon: <ColumnsIcon />, label: 'Columns' },
              ]} />
            </Row>
            <Row label="lg">
              <ControlledSC size="lg" defaultValue="grid" items={[
                { value: 'grid',    icon: <GridIcon />,    label: 'Grid'    },
                { value: 'list',    icon: <ListIcon />,    label: 'List'    },
                { value: 'columns', icon: <ColumnsIcon />, label: 'Columns' },
              ]} />
            </Row>
          </Section>

          {/* 3 — Icon only */}
          <Section title="Icon Only" note="Omit the label to render an icon-only control" isMobile={isMobile}>
            <Row label="sm">
              <ControlledSC size="sm" defaultValue="bar" items={[
                { value: 'bar',  icon: <ChartBarIcon />,  label: undefined },
                { value: 'line', icon: <ChartLineIcon />, label: undefined },
                { value: 'area', icon: <ChartAreaIcon />, label: undefined },
              ]} />
            </Row>
            <Row label="md">
              <ControlledSC size="md" defaultValue="bar" items={[
                { value: 'bar',  icon: <ChartBarIcon />,  label: undefined },
                { value: 'line', icon: <ChartLineIcon />, label: undefined },
                { value: 'area', icon: <ChartAreaIcon />, label: undefined },
              ]} />
            </Row>
            <Row label="lg">
              <ControlledSC size="lg" defaultValue="bar" items={[
                { value: 'bar',  icon: <ChartBarIcon />,  label: undefined },
                { value: 'line', icon: <ChartLineIcon />, label: undefined },
                { value: 'area', icon: <ChartAreaIcon />, label: undefined },
              ]} />
            </Row>
          </Section>

          {/* 4 — Full width */}
          <Section title="Full Width" note="fullWidth stretches the control and distributes items equally" isMobile={isMobile}>
            <ControlledSC size="md" defaultValue="week" fullWidth items={[
              { value: 'day',   label: 'Day'   },
              { value: 'week',  label: 'Week'  },
              { value: 'month', label: 'Month' },
              { value: 'year',  label: 'Year'  },
            ]} />
            <div style={{ marginTop: 12 }}>
              <ControlledSC size="md" defaultValue="list" fullWidth items={[
                { value: 'grid',    icon: <GridIcon />,    label: 'Grid'    },
                { value: 'list',    icon: <ListIcon />,    label: 'List'    },
                { value: 'columns', icon: <ColumnsIcon />, label: 'Columns' },
              ]} />
            </div>
          </Section>

          {/* 5 — Disabled */}
          <Section title="Disabled" note="disabled on root kills all items · disabled on individual items disables only those" isMobile={isMobile}>
            <Row label="all off">
              <ControlledSC size="md" defaultValue="week" disabled items={[
                { value: 'day',   label: 'Day'   },
                { value: 'week',  label: 'Week'  },
                { value: 'month', label: 'Month' },
              ]} />
            </Row>
            <Row label="item off">
              <ControlledSC size="md" defaultValue="week" items={[
                { value: 'day',   label: 'Day',   disabled: true },
                { value: 'week',  label: 'Week'                  },
                { value: 'month', label: 'Month', disabled: true },
              ]} />
            </Row>
          </Section>

          {/* 6 — Specimen */}
          <Section
            title="Specimen"
            note="Quick-reference table — scan to identify the exact size, items configuration, and state to name when prompting."
            isMobile={isMobile}
          >
            <div style={{
              background:   'var(--color-bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border:       '1px solid var(--color-border-opaque)',
              overflow:     'hidden',
            }}>

              {/* ── Package ── */}
              <SpecimenGroup label="Package" />
              <ImportRow />

              {/* ── Size ── */}
              <SpecimenGroup label="Size" />
              <SpecimenRow label="SM" tags={['size="sm"', '24px height']} isMobile={isMobile}>
                <ControlledSC size="sm" defaultValue="week" items={[
                  { value: 'day',   label: 'Day'   },
                  { value: 'week',  label: 'Week'  },
                  { value: 'month', label: 'Month' },
                ]} />
              </SpecimenRow>
              <SpecimenRow label="MD" tags={['size="md"', '28px height', 'default']} isMobile={isMobile}>
                <ControlledSC size="md" defaultValue="week" items={[
                  { value: 'day',   label: 'Day'   },
                  { value: 'week',  label: 'Week'  },
                  { value: 'month', label: 'Month' },
                ]} />
              </SpecimenRow>
              <SpecimenRow label="LG" tags={['size="lg"', '32px height']} isMobile={isMobile}>
                <ControlledSC size="lg" defaultValue="week" items={[
                  { value: 'day',   label: 'Day'   },
                  { value: 'week',  label: 'Week'  },
                  { value: 'month', label: 'Month' },
                ]} />
              </SpecimenRow>

              {/* ── Items ── */}
              <SpecimenGroup label="Items" />
              <SpecimenRow label="Label only" tags={['label']} isMobile={isMobile}>
                <ControlledSC size="md" defaultValue="week" items={[
                  { value: 'day',   label: 'Day'   },
                  { value: 'week',  label: 'Week'  },
                  { value: 'month', label: 'Month' },
                ]} />
              </SpecimenRow>
              <SpecimenRow label="With leading icon" tags={['icon', 'label']} isMobile={isMobile}>
                <ControlledSC size="md" defaultValue="grid" items={[
                  { value: 'grid',    icon: <GridIcon />,    label: 'Grid'    },
                  { value: 'list',    icon: <ListIcon />,    label: 'List'    },
                  { value: 'columns', icon: <ColumnsIcon />, label: 'Columns' },
                ]} />
              </SpecimenRow>
              <SpecimenRow label="Icon only" tags={['icon', 'no label']} note="Omit label to render icon-only items" isMobile={isMobile}>
                <ControlledSC size="md" defaultValue="bar" items={[
                  { value: 'bar',  icon: <ChartBarIcon />,  label: undefined },
                  { value: 'line', icon: <ChartLineIcon />, label: undefined },
                  { value: 'area', icon: <ChartAreaIcon />, label: undefined },
                ]} />
              </SpecimenRow>

              {/* ── Width ── */}
              <SpecimenGroup label="Width" />
              <SpecimenRow label="Inline" tags={['default']} note="Shrinks to fit content" isMobile={isMobile}>
                <ControlledSC size="md" defaultValue="week" items={[
                  { value: 'day',   label: 'Day'   },
                  { value: 'week',  label: 'Week'  },
                  { value: 'month', label: 'Month' },
                ]} />
              </SpecimenRow>
              <SpecimenRow label="Full width" tags={['fullWidth']} note="Stretches to fill container, items share space equally" isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <ControlledSC size="md" defaultValue="week" fullWidth items={[
                    { value: 'day',   label: 'Day'   },
                    { value: 'week',  label: 'Week'  },
                    { value: 'month', label: 'Month' },
                    { value: 'year',  label: 'Year'  },
                  ]} />
                </div>
              </SpecimenRow>

              {/* ── State ── */}
              <SpecimenGroup label="State" />
              <SpecimenRow label="Default" tags={[]} isMobile={isMobile}>
                <ControlledSC size="md" defaultValue="week" items={[
                  { value: 'day',   label: 'Day'   },
                  { value: 'week',  label: 'Week'  },
                  { value: 'month', label: 'Month' },
                ]} />
              </SpecimenRow>
              <SpecimenRow label="All disabled" tags={['disabled']} note="Pass disabled on the root to disable all items" isMobile={isMobile}>
                <ControlledSC size="md" defaultValue="week" disabled items={[
                  { value: 'day',   label: 'Day'   },
                  { value: 'week',  label: 'Week'  },
                  { value: 'month', label: 'Month' },
                ]} />
              </SpecimenRow>
              <SpecimenRow label="Per-item disabled" tags={['disabled (item)']} note="Day and Month are disabled individually" isMobile={isMobile}>
                <ControlledSC size="md" defaultValue="week" items={[
                  { value: 'day',   label: 'Day',   disabled: true },
                  { value: 'week',  label: 'Week'                  },
                  { value: 'month', label: 'Month', disabled: true },
                ]} />
              </SpecimenRow>

            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — SegmentedControl v1</span>
        </div>

      </div>
    </>
  )
}
