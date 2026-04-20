/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Toggle Button Preview
   Interactive toggle states · two selectionStyle modes · dark mode
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useIsMobile } from './useIsMobile.js'

/* ── Icons ───────────────────────────────────────────────────────────────────── */
const SunIcon       = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
const AlignLeftIcon   = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H21M3 12H15M3 18H18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
const AlignCenterIcon = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H21M6 12H18M4 18H20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
const AlignRightIcon  = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H21M9 12H21M6 18H21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
const GridIcon = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H10V10H3V3ZM14 3H21V10H14V3ZM3 14H10V21H3V14ZM14 14H21V21H14V14Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
const ListIcon = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl']

/* ── Button — mirrors Alloy Button ─────────────────────────────────────────── */
function Button({ variant = 'secondary', size = 'md', disabled, leadingArtwork, iconOnly,
                  selected, selectionStyle = 'border', 'aria-pressed': ariapressed, 'aria-label': ariaLabel, children, onClick }) {
  const selectedClass = selected
    ? selectionStyle === 'fill' ? 'sel-fill' : 'sel-border'
    : ''
  const cls = ['alloy-btn', `v-${variant}`, `s-${size}`, iconOnly ? 'icon-only' : '', selectedClass]
    .filter(Boolean).join(' ')

  return (
    <button disabled={disabled} aria-pressed={ariapressed} aria-label={ariaLabel} className={cls} onClick={onClick}>
      {!iconOnly && <>
        {leadingArtwork && <span className="artwork alloy-icon-slot">{leadingArtwork}</span>}
        {children       && <span className="label">{children}</span>}
      </>}
      {iconOnly && <span className="artwork alloy-icon-slot" aria-hidden="true">{children}</span>}
    </button>
  )
}

/* ── ToggleButton — stateful ─────────────────────────────────────────────────── */
function ToggleButton({ defaultVariant = 'secondary', selectionStyle = 'border', size = 'md', iconOnly, disabled, leadingArtwork, children, label }) {
  const [selected, setSelected] = useState(false)
  return (
    <Button
      variant={defaultVariant} size={size} iconOnly={iconOnly} disabled={disabled}
      leadingArtwork={leadingArtwork} selected={selected} selectionStyle={selectionStyle}
      aria-pressed={selected} aria-label={iconOnly ? label : undefined}
      onClick={() => setSelected(s => !s)}
    >{children}</Button>
  )
}

/* ── ToggleGroup — single-select ─────────────────────────────────────────────── */
function ToggleGroup({ options, size = 'md', defaultVariant = 'secondary', selectionStyle = 'border' }) {
  const [activeId, setActiveId] = useState(options[0]?.id ?? null)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map(opt => (
        <Button key={opt.id} variant={defaultVariant} size={size} iconOnly={opt.iconOnly}
          selected={activeId === opt.id} selectionStyle={selectionStyle}
          aria-pressed={activeId === opt.id} aria-label={opt.iconOnly ? opt.label : undefined}
          onClick={() => setActiveId(opt.id)}
        >{opt.icon ?? opt.label}</Button>
      ))}
    </div>
  )
}

/* ── Section / label helpers ─────────────────────────────────────────────────── */
function Section({ title, note, dark, isMobile, children }) {
  return (
    <section style={{
      background: dark ? 'var(--Alloy-slate-950)' : 'var(--color-bg-primary)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'var(--color-border-opaque)'}`,
      borderRadius: 'var(--radius-xl)', padding: isMobile ? 20 : 32,
    }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.3)' : 'var(--color-content-disabled)', margin: '0 0 4px' }}>{title}</p>
        {note && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: dark ? 'rgba(255,255,255,0.45)' : 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>{note}</p>}
      </div>
      {children}
    </section>
  )
}
function SubLabel({ dark, children }) {
  return <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: dark ? 'rgba(255,255,255,0.3)' : 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 10 }}>{children}</p>
}
function ColLabel({ w = 80, isMobile, dark, children }) {
  const effectiveW = isMobile ? Math.min(w, 56) : w
  return <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: dark ? 'rgba(255,255,255,0.3)' : 'var(--color-content-disabled)', width: effectiveW, flexShrink: 0 }}>{children}</span>
}

/* ── Specimen helpers (same pattern as ButtonPreview) ───────────────────────── */
function SpecimenGroup({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 4px',
    }}>
      <span style={{
        fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 'var(--font-weight-semibold)',
        letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
        color: 'var(--color-content-disabled)', whiteSpace: 'nowrap',
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border-opaque)' }} />
    </div>
  )
}

function SpecimenRow({ label, tags = [], note, wide, isMobile, children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : wide ? '1fr 260px' : '1fr 200px',
      gap: 16, alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--color-border-opaque)',
    }}>
      {/* Left: label + prop tags */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-primary)' }}>{label}</span>
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {tags.map((t, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-content-secondary)',
                border: '1px solid var(--color-border-opaque)',
                borderRadius: 'var(--radius-sm)',
                padding: '1px 6px', lineHeight: '18px',
              }}>{t}</span>
            ))}
          </div>
        )}
        {note && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', lineHeight: 1.5 }}>{note}</span>}
      </div>
      {/* Right: live render */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  )
}

function ImportRow() {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 12,
      background: 'var(--color-bg-tertiary)',
      border: '1px solid var(--color-border-opaque)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px', lineHeight: '20px',
      color: 'var(--color-content-secondary)',
      overflowX: 'auto', whiteSpace: 'nowrap',
    }}>
      <span style={{ color: 'var(--color-content-tertiary)' }}>import</span>
      {' { '}
      <span style={{ color: 'var(--color-content-primary)', fontWeight: 'var(--font-weight-medium)' }}>ToggleButton</span>
      {' } '}
      <span style={{ color: 'var(--color-content-tertiary)' }}>from</span>
      {' '}
      <span style={{ color: 'var(--color-content-primary)' }}>'alloy-design-system'</span>
    </div>
  )
}

/* ── Preview ─────────────────────────────────────────────────────────────────── */
export default function ToggleButtonPreview() {
  const isMobile = useIsMobile()
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        /* ─ Base ─ */
        .alloy-btn {
          display: inline-flex; align-items: center; justify-content: center;
          font-family: var(--font-sans); font-weight: var(--font-weight-medium);
          letter-spacing: var(--tracking-wide); white-space: nowrap;
          border-radius: var(--radius-button); border: 1px solid transparent;
          cursor: pointer; user-select: none; appearance: none; outline: none;
          transition:
            background-color var(--duration-fast) var(--ease-default),
            border-color     var(--duration-fast) var(--ease-default),
            color            var(--duration-fast) var(--ease-default),
            filter           var(--duration-fast) var(--ease-default),
            box-shadow       var(--duration-fast) var(--ease-default);
        }
        .alloy-btn:focus-visible { box-shadow: none; }
        .alloy-btn:disabled {
          cursor: not-allowed !important;
          background-color: var(--color-bg-disabled) !important;
          color: var(--color-content-disabled) !important;
          border-color: var(--color-border-disabled) !important;
          filter: none !important;
        }

        /* ─ Sizes ─ */
        .s-xs { height:24px; padding:0 var(--space-2); font-size:var(--text-xs);   gap:var(--space-1); --btn-artwork-size:12px; }
        .s-sm { height:32px; padding:0 var(--space-2); font-size:var(--text-xs);   gap:var(--space-1); --btn-artwork-size:14px; }
        .s-md { height:36px; padding:0 var(--space-3); font-size:var(--text-sm);   gap:var(--space-2); --btn-artwork-size:16px; }
        .s-lg { height:48px; padding:0 var(--space-3); font-size:var(--text-sm);   gap:var(--space-2); --btn-artwork-size:20px; }
        .s-xl { height:56px; padding:0 var(--space-4); font-size:var(--text-base); gap:var(--space-2); --btn-artwork-size:24px; }

        /* ─ Icon-only ─ */
        .icon-only { padding: 0 !important; }
        .icon-only.s-xs { width:24px; } .icon-only.s-sm { width:32px; }
        .icon-only.s-md { width:36px; } .icon-only.s-lg { width:48px; }
        .icon-only.s-xl { width:56px; }

        /* ─ Artwork ─ */
        .artwork { display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; width:var(--btn-artwork-size,1em); height:var(--btn-artwork-size,1em); }
        /* ─ Shared icon slot (mirrors Alloy artwork.css) ─ */
        .alloy-icon-slot > svg,
        .alloy-icon-slot > svg * { stroke-width: var(--icon-stroke-width, 1.75); }
        .alloy-icon-slot > svg { display: block; width: 100%; height: 100%; }
        .label { display:inline-flex; align-items:center; }

        /* ─ Base variants ─ */
        .v-secondary { background-color:var(--color-bg-secondary); color:var(--color-content-primary); }
        .v-secondary:hover:not(:disabled) { background-color:var(--color-bg-tertiary); border-color:var(--color-border-hover); }
        .v-secondary:active:not(:disabled) { filter:brightness(0.97); }

        .v-tertiary { background-color:var(--color-bg-primary); color:var(--color-content-primary); border-color:var(--color-border-opaque); }
        .v-tertiary:hover:not(:disabled)  { background-color:var(--color-bg-secondary); border-color:var(--color-border-hover); }
        .v-tertiary:active:not(:disabled) { background-color:var(--color-bg-tertiary); }

        .v-ghost { background-color:transparent; color:var(--color-content-primary); }
        .v-ghost:hover:not(:disabled) { background-color:var(--color-bg-transparent); border-color:var(--color-border-hover); }
        .v-ghost:active:not(:disabled) { background-color:var(--color-bg-secondary); }

        /* ─ selectionStyle="border" — keeps bg, shows selected border ─ */
        .sel-border { border-color: var(--color-border-selected) !important; }
        .sel-border:hover:not(:disabled) { border-color: var(--color-border-selected) !important; }

        /* ─ selectionStyle="fill" — inverse fill ─ */
        .sel-fill {
          background-color: var(--color-bg-inverse-primary) !important;
          color:            var(--color-content-inverse-primary) !important;
          border-color:     transparent !important;
        }
        .sel-fill:hover:not(:disabled)  { background-color: var(--color-bg-inverse-secondary) !important; }
        .sel-fill:active:not(:disabled) { background-color: var(--color-bg-inverse-tertiary) !important; }

      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Actions</p>
          <h1 style={{ fontSize: 'var(--text-4-5xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Toggle Button</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 'var(--line-height-loose)' }}>Two selection styles · border (outline only) · fill (inverse bg)</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>

          {/* 1 — Selection styles */}
          <Section title="Selection Styles" note="Click any button to toggle · both styles available on any defaultVariant" isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              <div>
                <SubLabel>selectionStyle = "border" — keeps background, adds --color-border-selected</SubLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['secondary', 'tertiary', 'ghost'].map(v => (
                    <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <ColLabel isMobile={isMobile}>{v}</ColLabel>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {SIZES.map(s => (
                          <ToggleButton key={s} size={s} defaultVariant={v} selectionStyle="border">Toggle</ToggleButton>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-opaque)' }} />

              <div>
                <SubLabel>selectionStyle = "fill" — inverse fill (--color-bg-inverse-primary)</SubLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['secondary', 'tertiary', 'ghost'].map(v => (
                    <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <ColLabel isMobile={isMobile}>{v}</ColLabel>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {SIZES.map(s => (
                          <ToggleButton key={s} size={s} defaultVariant={v} selectionStyle="fill">Toggle</ToggleButton>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* 2 — Icon-only */}
          <Section title="Icon-only" note="Both selection styles · click to toggle" isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ColLabel isMobile={isMobile}>border</ColLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {SIZES.map(s => (
                    <ToggleButton key={s} size={s} iconOnly defaultVariant="secondary" selectionStyle="border" label="Toggle sun">
                      <SunIcon />
                    </ToggleButton>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ColLabel isMobile={isMobile}>fill</ColLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {SIZES.map(s => (
                    <ToggleButton key={s} size={s} iconOnly defaultVariant="secondary" selectionStyle="fill" label="Toggle sun">
                      <SunIcon />
                    </ToggleButton>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* 3 — Toggle groups */}
          <Section title="Toggle Groups" note="Single-select groups — one active at a time" isMobile={isMobile}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 12 : 32, flexWrap: 'wrap' }}>
                <div>
                  <SubLabel>Alignment · border</SubLabel>
                  <ToggleGroup size="md" defaultVariant="tertiary" selectionStyle="border" options={[
                    { id: 'left',   icon: <AlignLeftIcon />,   iconOnly: true, label: 'Align left' },
                    { id: 'center', icon: <AlignCenterIcon />, iconOnly: true, label: 'Align center' },
                    { id: 'right',  icon: <AlignRightIcon />,  iconOnly: true, label: 'Align right' },
                  ]} />
                </div>
                <div>
                  <SubLabel>Alignment · fill</SubLabel>
                  <ToggleGroup size="md" defaultVariant="tertiary" selectionStyle="fill" options={[
                    { id: 'left2',   icon: <AlignLeftIcon />,   iconOnly: true, label: 'Align left' },
                    { id: 'center2', icon: <AlignCenterIcon />, iconOnly: true, label: 'Align center' },
                    { id: 'right2',  icon: <AlignRightIcon />,  iconOnly: true, label: 'Align right' },
                  ]} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 12 : 32, flexWrap: 'wrap' }}>
                <div>
                  <SubLabel>View mode · border</SubLabel>
                  <ToggleGroup size="sm" defaultVariant="ghost" selectionStyle="border" options={[
                    { id: 'grid', icon: <GridIcon />, iconOnly: true, label: 'Grid view' },
                    { id: 'list', icon: <ListIcon />, iconOnly: true, label: 'List view' },
                  ]} />
                </div>
                <div>
                  <SubLabel>View mode · fill</SubLabel>
                  <ToggleGroup size="sm" defaultVariant="ghost" selectionStyle="fill" options={[
                    { id: 'grid2', icon: <GridIcon />, iconOnly: true, label: 'Grid view' },
                    { id: 'list2', icon: <ListIcon />, iconOnly: true, label: 'List view' },
                  ]} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 12 : 32, flexWrap: 'wrap' }}>
                <div>
                  <SubLabel>Label group · border</SubLabel>
                  <ToggleGroup size="sm" defaultVariant="secondary" selectionStyle="border" options={[
                    { id: 'day',   label: 'Day' },
                    { id: 'week',  label: 'Week' },
                    { id: 'month', label: 'Month' },
                  ]} />
                </div>
                <div>
                  <SubLabel>Label group · fill</SubLabel>
                  <ToggleGroup size="sm" defaultVariant="secondary" selectionStyle="fill" options={[
                    { id: 'day2',   label: 'Day' },
                    { id: 'week2',  label: 'Week' },
                    { id: 'month2', label: 'Month' },
                  ]} />
                </div>
              </div>
            </div>
          </Section>

          {/* 4 — Disabled */}
          <Section title="Disabled" isMobile={isMobile}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ToggleButton size="md" defaultVariant="secondary" selectionStyle="border" disabled>Disabled</ToggleButton>
              <ToggleButton size="md" defaultVariant="secondary" selectionStyle="fill"   disabled>Disabled</ToggleButton>
              <ToggleButton size="md" defaultVariant="tertiary"  selectionStyle="border" disabled>Disabled</ToggleButton>
              <ToggleButton size="md" defaultVariant="ghost"     selectionStyle="fill"   disabled>Disabled</ToggleButton>
            </div>
          </Section>

          {/* 5 — Specimen */}
          <section style={{
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-opaque)',
            borderRadius: 'var(--radius-xl)', padding: isMobile ? 20 : 32,
          }}>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 4px' }}>Specimen</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>Component anatomy — props, variants, sizes and states at a glance</p>
            </div>

            {/* Package */}
            <SpecimenGroup label="Package" />
            <div style={{ margin: '8px 0 16px' }}>
              <ImportRow />
            </div>

            {/* Selection Style */}
            <SpecimenGroup label="Selection Style" />
            <SpecimenRow
              label="Border"
              tags={['selectionStyle="border"']}
              note="Keeps the base background, adds --color-border-selected outline when selected"
              isMobile={isMobile}
            >
              <ToggleButton defaultVariant="secondary" selectionStyle="border">Toggle</ToggleButton>
            </SpecimenRow>
            <SpecimenRow
              label="Fill"
              tags={['selectionStyle="fill"']}
              note="Switches to inverse background (--color-bg-inverse-primary) when selected"
              isMobile={isMobile}
            >
              <ToggleButton defaultVariant="secondary" selectionStyle="fill">Toggle</ToggleButton>
            </SpecimenRow>

            {/* Base Variant */}
            <SpecimenGroup label="Base Variant" />
            <SpecimenRow label="Secondary" tags={['defaultVariant="secondary"']} note="Filled secondary background — default" isMobile={isMobile}>
              <ToggleButton defaultVariant="secondary" selectionStyle="border">Toggle</ToggleButton>
              <ToggleButton defaultVariant="secondary" selectionStyle="fill">Toggle</ToggleButton>
            </SpecimenRow>
            <SpecimenRow label="Tertiary" tags={['defaultVariant="tertiary"']} note="White background with opaque border" isMobile={isMobile}>
              <ToggleButton defaultVariant="tertiary" selectionStyle="border">Toggle</ToggleButton>
              <ToggleButton defaultVariant="tertiary" selectionStyle="fill">Toggle</ToggleButton>
            </SpecimenRow>
            <SpecimenRow label="Ghost" tags={['defaultVariant="ghost"']} note="Transparent — no background or border at rest" isMobile={isMobile}>
              <ToggleButton defaultVariant="ghost" selectionStyle="border">Toggle</ToggleButton>
              <ToggleButton defaultVariant="ghost" selectionStyle="fill">Toggle</ToggleButton>
            </SpecimenRow>

            {/* Size */}
            <SpecimenGroup label="Size" />
            <SpecimenRow label="XS" tags={['size="xs"', '24px height']} isMobile={isMobile}>
              <ToggleButton size="xs" defaultVariant="secondary" selectionStyle="border">Toggle</ToggleButton>
            </SpecimenRow>
            <SpecimenRow label="SM" tags={['size="sm"', '32px height']} isMobile={isMobile}>
              <ToggleButton size="sm" defaultVariant="secondary" selectionStyle="border">Toggle</ToggleButton>
            </SpecimenRow>
            <SpecimenRow label="MD" tags={['size="md"', '36px height', 'default']} isMobile={isMobile}>
              <ToggleButton size="md" defaultVariant="secondary" selectionStyle="border">Toggle</ToggleButton>
            </SpecimenRow>
            <SpecimenRow label="LG" tags={['size="lg"', '48px height']} isMobile={isMobile}>
              <ToggleButton size="lg" defaultVariant="secondary" selectionStyle="border">Toggle</ToggleButton>
            </SpecimenRow>
            <SpecimenRow label="XL" tags={['size="xl"', '56px height']} isMobile={isMobile}>
              <ToggleButton size="xl" defaultVariant="secondary" selectionStyle="border">Toggle</ToggleButton>
            </SpecimenRow>

            {/* Layout */}
            <SpecimenGroup label="Layout" />
            <SpecimenRow label="Text label" tags={['children="Label"']} isMobile={isMobile}>
              <ToggleButton defaultVariant="secondary" selectionStyle="border">Toggle</ToggleButton>
            </SpecimenRow>
            <SpecimenRow label="Leading artwork" tags={['leadingArtwork={<Icon />}']} isMobile={isMobile}>
              <ToggleButton defaultVariant="secondary" selectionStyle="border" leadingArtwork={<SunIcon />}>Toggle</ToggleButton>
            </SpecimenRow>
            <SpecimenRow label="Icon only" tags={['iconOnly', 'aria-label="..."']} note="Pass aria-label via label prop for accessibility" isMobile={isMobile}>
              <ToggleButton defaultVariant="secondary" selectionStyle="border" iconOnly label="Toggle sun"><SunIcon /></ToggleButton>
              <ToggleButton defaultVariant="secondary" selectionStyle="fill"   iconOnly label="Toggle sun"><SunIcon /></ToggleButton>
            </SpecimenRow>

            {/* Group Mode */}
            <SpecimenGroup label="Group Mode" />
            <SpecimenRow label="ToggleGroup · Border" tags={['selectionStyle="border"']} note="Single-select; one active at a time" wide isMobile={isMobile}>
              <ToggleGroup size="md" defaultVariant="tertiary" selectionStyle="border" options={[
                { id: 'sp-left',   icon: <AlignLeftIcon />,   iconOnly: true, label: 'Left' },
                { id: 'sp-center', icon: <AlignCenterIcon />, iconOnly: true, label: 'Center' },
                { id: 'sp-right',  icon: <AlignRightIcon />,  iconOnly: true, label: 'Right' },
              ]} />
            </SpecimenRow>
            <SpecimenRow label="ToggleGroup · Fill" tags={['selectionStyle="fill"']} note="Inverse fill on the active item" wide isMobile={isMobile}>
              <ToggleGroup size="md" defaultVariant="tertiary" selectionStyle="fill" options={[
                { id: 'sp2-left',   icon: <AlignLeftIcon />,   iconOnly: true, label: 'Left' },
                { id: 'sp2-center', icon: <AlignCenterIcon />, iconOnly: true, label: 'Center' },
                { id: 'sp2-right',  icon: <AlignRightIcon />,  iconOnly: true, label: 'Right' },
              ]} />
            </SpecimenRow>
            <SpecimenRow label="Label group" tags={['options=[{ id, label }]']} note="Text labels instead of icons" wide isMobile={isMobile}>
              <ToggleGroup size="sm" defaultVariant="secondary" selectionStyle="border" options={[
                { id: 'sp3-day',   label: 'Day' },
                { id: 'sp3-week',  label: 'Week' },
                { id: 'sp3-month', label: 'Month' },
              ]} />
            </SpecimenRow>

            {/* State */}
            <SpecimenGroup label="State" />
            <SpecimenRow label="Default (unselected)" tags={['aria-pressed="false"']} isMobile={isMobile}>
              <ToggleButton defaultVariant="secondary" selectionStyle="border">Toggle</ToggleButton>
            </SpecimenRow>
            <SpecimenRow label="Selected · Border" tags={['aria-pressed="true"', 'selectionStyle="border"']}
              note="Click the button to see selected state" isMobile={isMobile}>
              <ToggleButton defaultVariant="secondary" selectionStyle="border">Toggle</ToggleButton>
            </SpecimenRow>
            <SpecimenRow label="Selected · Fill" tags={['aria-pressed="true"', 'selectionStyle="fill"']}
              note="Click the button to see selected state" isMobile={isMobile}>
              <ToggleButton defaultVariant="secondary" selectionStyle="fill">Toggle</ToggleButton>
            </SpecimenRow>
            <SpecimenRow label="Disabled" tags={['disabled']} isMobile={isMobile}>
              <ToggleButton defaultVariant="secondary" selectionStyle="border" disabled>Toggle</ToggleButton>
              <ToggleButton defaultVariant="secondary" selectionStyle="fill"   disabled>Toggle</ToggleButton>
            </SpecimenRow>

          </section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — ToggleButton v1</span>
        </div>
      </div>
    </>
  )
}
