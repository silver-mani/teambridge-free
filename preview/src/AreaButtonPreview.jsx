/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Area Button Preview
   Ghost "add zone" — dashed border card-placeholder
   ───────────────────────────────────────────────────────────────────────────── */

/* ── Icons ───────────────────────────────────────────────────────────────────── */
const PlusIcon = ({ size = 24 }) => {
  const s = typeof size === 'number' ? size : parseFloat(size)
  const sw = s <= 12 ? 2 : s <= 16 ? 1.75 : s <= 20 ? 1.5 : 1.25
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth={sw}>
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const PlusSquareIcon = ({ size = 24 }) => {
  const s = typeof size === 'number' ? size : parseFloat(size)
  const sw = s <= 12 ? 2 : s <= 16 ? 1.75 : s <= 20 ? 1.5 : 1.25
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth={sw}>
      <path d="M9 12H15M12 9V15M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── AreaButton — mirrors Alloy AreaButton using token vars ─────────────────── */
function AreaButton({ size = 'md', layout = 'horizontal', align = 'center', label = 'Add', hideLabel = false, icon, disabled, onClick, height, borderRadius, style }) {
  const iconNode = icon ?? <PlusIcon size="100%" />
  const customVars = {}
  if (height       != null) customVars['--area-min-height'] = typeof height === 'number' ? `${height}px` : height
  if (borderRadius != null) customVars['--area-radius']     = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius
  return (
    <button
      className={['area-btn', `s-${size}`, `l-${layout}`, align === 'start' ? 'a-start' : ''].filter(Boolean).join(' ')}
      disabled={disabled}
      onClick={onClick}
      type="button"
      style={{ ...customVars, ...style }}
    >
      <span className="area-inner">
        <span className="area-icon" aria-hidden="true">{iconNode}</span>
        {!hideLabel && label && <span className="area-label">{label}</span>}
      </span>
    </button>
  )
}

/* ── Mock data card ─────────────────────────────────────────────────────────── */
function DataCard({ title, value, trend }) {
  const isUp = trend === 'up'
  return (
    <div style={{
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-opaque)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      flex: 1,
      minWidth: 0,
    }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', fontWeight: 'var(--font-weight-medium)', letterSpacing: 'var(--tracking-wide)' }}>{title}</span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-content-primary)', lineHeight: 1 }}>{value}</span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: isUp ? 'var(--color-success-content)' : 'var(--color-error-content)', fontWeight: 'var(--font-weight-medium)' }}>
        {isUp ? '↑' : '↓'} {isUp ? '+12.4%' : '−3.2%'} vs last month
      </span>
    </div>
  )
}

/* ── Mock form card ─────────────────────────────────────────────────────────── */
function FormCard({ title, fields }) {
  return (
    <div style={{
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-opaque)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-opaque)' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-content-primary)' }}>{title}</span>
      </div>
      {/* Fields */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {fields.map((f, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-secondary)', letterSpacing: 'var(--tracking-wide)' }}>{f.label}</span>
            <div style={{
              height: 36,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-opaque)',
              background: 'var(--color-bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
            }}>
              {f.value && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)' }}>{f.value}</span>}
            </div>
          </div>
        ))}
      </div>
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

function SpecimenRow({ label, tags = [], note, wide, isMobile, children }) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: isMobile ? '1fr' : wide ? '1fr 260px' : '1fr 200px',
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
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '12px 20px',
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
      <span className="specimen-import-kw">import </span>
      <span className="specimen-import-exp">{'{ AreaButton }'}</span>
      <span className="specimen-import-kw"> from </span>
      <span className="specimen-import-src">'alloy-design-system'</span>
    </div>
  )
}

/* ── Layout helpers ─────────────────────────────────────────────────────────── */
function Section({ title, note, isMobile, children }) {
  return (
    <section style={{
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-opaque)',
      borderRadius: 'var(--radius-xl)',
      padding: isMobile ? 20 : 32,
    }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 4px' }}>{title}</p>
        {note && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>{note}</p>}
      </div>
      {children}
    </section>
  )
}

import { useIsMobile } from './useIsMobile.js'

/* ── Preview ─────────────────────────────────────────────────────────────────── */
export default function AreaButtonPreview() {
  const isMobile = useIsMobile()
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        /* ─ Base ─ */
        .area-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          border-radius: var(--area-radius, var(--radius-lg));
          min-height: var(--area-min-height);
          border: 1.5px dashed var(--color-border-opaque);
          padding: var(--space-4);
          background-color: transparent;
          color: var(--color-content-tertiary);
          cursor: pointer;
          user-select: none;
          appearance: none;
          outline: none;
          transition:
            background-color var(--duration-fast) var(--ease-default),
            border-color     var(--duration-fast) var(--ease-default),
            color            var(--duration-fast) var(--ease-default);
        }
        .area-btn:focus, .area-btn:focus-visible { outline: none; box-shadow: none; }
        .area-btn:hover:not(:disabled) {
          background-color: var(--color-bg-secondary);
          border-color: var(--color-border-hover);
          color: var(--color-content-secondary);
        }
        .area-btn:active:not(:disabled) {
          background-color: var(--color-bg-tertiary);
          border-color: var(--color-border-hover);
        }
        .area-btn:disabled {
          cursor: not-allowed;
          border-color: var(--color-border-disabled);
          color: var(--color-content-disabled);
          background-color: transparent;
        }

        /* ─ Sizes (vertical) ─ */
        .s-sm { --area-min-height: 80px;  --area-icon-size: 16px; --area-label-size: var(--text-xs); }
        .s-md { --area-min-height: 120px; --area-icon-size: 20px; --area-label-size: var(--text-sm); }
        .s-lg { --area-min-height: 160px; --area-icon-size: 24px; --area-label-size: var(--text-sm); }

        /* ─ Horizontal layout — 36px default, icon/label size from size class ─ */
        .l-horizontal { --area-min-height: 36px; --area-icon-size: 16px; --area-label-size: var(--text-sm); }
        .l-horizontal .area-inner { flex-direction: row; }

        /* ─ Align: start ─ */
        .a-start { justify-content: flex-start; }
        .a-start.l-vertical { align-items: flex-start; }

        /* ─ Inner ─ */
        .area-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          pointer-events: none;
        }

        /* ─ Icon ─ */
        .area-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width:  var(--area-icon-size, 20px);
          height: var(--area-icon-size, 20px);
        }
        .area-icon > svg { display: block; width: 100%; height: 100%; }

        /* ─ Label ─ */
        .area-label {
          font-family: var(--font-sans);
          font-size: var(--area-label-size, var(--text-sm));
          font-weight: var(--font-weight-medium);
          line-height: var(--line-height-normal);
          letter-spacing: var(--tracking-wide);
          color: inherit;
        }

        /* ─ Specimen ─ */
        .specimen-import-kw  { color: var(--color-content-disabled); }
        .specimen-import-exp { color: var(--color-content-primary); font-weight: 500; }
        .specimen-import-src { color: var(--color-content-secondary); }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Actions</p>
          <h1 style={{ fontSize: 'var(--text-4-5xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Area Button</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 'var(--line-height-loose)' }}>Ghost add-zone · dashed border · 3 sizes · configurable height & radius</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>

          {/* 1 — Layout: Horizontal (default) */}
          <Section title="Layout: Horizontal (Default)" note="Icon and label sit side-by-side — 36px default height · align=center or align=start" isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>align=center (default)</span>
                <AreaButton label="Add item" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>align=start</span>
                <AreaButton align="start" label="Add item" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
              {['sm', 'md', 'lg'].map(s => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>{s} · start</span>
                  <AreaButton size={s} align="start" />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>Custom label</span>
                <AreaButton align="start" label="Add metric" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>height=48</span>
                <AreaButton align="start" height={48} label="Add row" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>Disabled</span>
                <AreaButton align="start" disabled />
              </div>
            </div>
          </Section>

          {/* 2 — States */}
          <Section title="States" note="Default · Disabled — hover and active are interactive, try them" isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>Default</span>
                <AreaButton align="start" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>Disabled</span>
                <AreaButton align="start" disabled />
              </div>
            </div>
          </Section>

          {/* 3 — Customization */}
          <Section title="Customization" note="Custom label · icon-only (hideLabel) · custom icon" isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>Custom label</span>
                <AreaButton align="start" label="New card" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>Icon only</span>
                <AreaButton hideLabel />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>Custom icon</span>
                <AreaButton align="start" icon={<PlusSquareIcon size="100%" />} label="Add card" />
              </div>
            </div>
          </Section>

          {/* 4 — Layout: Vertical */}
          <Section title="Layout: Vertical" note="Icon stacked above label — height driven by size prop · sm 80px · md 120px · lg 160px" isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>
              {['sm', 'md', 'lg'].map(s => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>{s}</span>
                  <AreaButton layout="vertical" size={s} />
                </div>
              ))}
            </div>
          </Section>

          {/* 5 — Configurable height & radius */}
          <Section title="Height & Border Radius" note="height and borderRadius props override the defaults — useful to match adjacent UI" isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>height=80 · vertical</span>
                <AreaButton layout="vertical" height={80} label="Add" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>height=200 · vertical</span>
                <AreaButton layout="vertical" height={200} label="Add" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', textTransform: 'uppercase' }}>radius=var(--radius-sm)</span>
                <AreaButton layout="vertical" height={120} borderRadius="var(--radius-sm)" label="Add" />
              </div>
            </div>
          </Section>

          {/* 6 — In context: metric cards (horizontal row) */}
          <Section title="In Context — Metric Cards" note="AreaButton at the end of a horizontal card group" isMobile={isMobile}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>
              <DataCard title="Monthly Revenue" value="$84,210" trend="up" />
              <DataCard title="Churn Rate" value="2.4%" trend="down" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <AreaButton size="lg" label="Add metric" borderRadius="var(--radius-lg)" style={{ height: '100%' }} />
              </div>
            </div>
          </Section>

          {/* 7 — In context: form card group (horizontal, left-aligned) */}
          <Section title="In Context — Form Cards" note="AreaButton in horizontal left-aligned layout at the end of a stacked form section group" isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
              <FormCard
                title="Basic Information"
                fields={[
                  { label: 'Full name', value: 'Alex Johnson' },
                  { label: 'Job title', value: 'Product Designer' },
                ]}
              />
              <FormCard
                title="Contact Details"
                fields={[
                  { label: 'Email address', value: 'alex@company.com' },
                  { label: 'Phone number', value: '' },
                ]}
              />
              <AreaButton
                layout="horizontal"
                align="start"
                label="Add section"
                borderRadius="var(--radius-lg)"
              />
            </div>
          </Section>

          {/* 8 — Specimen */}
          <Section
            title="Specimen"
            note="Quick-reference table — scan to identify the exact prop combination to name when prompting."
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

              {/* ── Layout ── */}
              <SpecimenGroup label="Layout" />
              <SpecimenRow label="Horizontal" tags={['layout="horizontal"', 'default']} wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton align="start" label="Add item" />
                </div>
              </SpecimenRow>
              <SpecimenRow label="Vertical" tags={['layout="vertical"']} wide isMobile={isMobile}>
                <div style={{ width: 160 }}>
                  <AreaButton layout="vertical" size="md" />
                </div>
              </SpecimenRow>

              {/* ── Size ── */}
              <SpecimenGroup label="Size" />
              <SpecimenRow label="SM" tags={['size="sm"', '80px height']} wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton layout="vertical" size="sm" />
                </div>
              </SpecimenRow>
              <SpecimenRow label="MD" tags={['size="md"', '120px height', 'default']} wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton layout="vertical" size="md" />
                </div>
              </SpecimenRow>
              <SpecimenRow label="LG" tags={['size="lg"', '160px height']} wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton layout="vertical" size="lg" />
                </div>
              </SpecimenRow>

              {/* ── Alignment ── */}
              <SpecimenGroup label="Alignment" />
              <SpecimenRow label="Center" tags={['align="center"', 'default']} wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton label="Add item" />
                </div>
              </SpecimenRow>
              <SpecimenRow label="Start" tags={['align="start"']} wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton align="start" label="Add item" />
                </div>
              </SpecimenRow>

              {/* ── Customization ── */}
              <SpecimenGroup label="Customization" />
              <SpecimenRow label="Custom label" tags={['label="…"']} wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton align="start" label="Add metric" />
                </div>
              </SpecimenRow>
              <SpecimenRow label="Icon only" tags={['hideLabel']} note="Hides the label, shows icon only" wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton hideLabel />
                </div>
              </SpecimenRow>
              <SpecimenRow label="Custom icon" tags={['icon={…}']} note="Accepts any React node" wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton align="start" icon={<PlusSquareIcon size="100%" />} label="Add card" />
                </div>
              </SpecimenRow>

              {/* ── State ── */}
              <SpecimenGroup label="State" />
              <SpecimenRow label="Default" tags={[]} wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton align="start" />
                </div>
              </SpecimenRow>
              <SpecimenRow label="Disabled" tags={['disabled']} note="Cursor not-allowed, muted border and text" wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton align="start" disabled />
                </div>
              </SpecimenRow>

              {/* ── Override ── */}
              <SpecimenGroup label="Override" />
              <SpecimenRow label="Custom height" tags={['height={80}']} note="Overrides --area-min-height" wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton layout="vertical" height={80} label="Add" />
                </div>
              </SpecimenRow>
              <SpecimenRow label="Custom radius" tags={["borderRadius=\"var(--radius-sm)\""]} note="Overrides --area-radius" wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton layout="vertical" height={100} borderRadius="var(--radius-sm)" label="Add" />
                </div>
              </SpecimenRow>
              <SpecimenRow label="className forwarded" tags={['className']} note="Spreads onto the root <button> element" wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton align="start" label="Custom class" />
                </div>
              </SpecimenRow>
              <SpecimenRow label="Native attributes" tags={['type', '...props']} note="All native attributes forwarded via rest props" wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <AreaButton type="button" align="start" label="Place order" />
                </div>
              </SpecimenRow>

            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Area Button v1</span>
        </div>

      </div>
    </>
  )
}
