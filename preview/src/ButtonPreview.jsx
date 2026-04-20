/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Button Preview
   6 variants × 5 sizes × states × artwork × code specimen — light + dark
   ───────────────────────────────────────────────────────────────────────────── */

/* ── Icons — SVG paths mirror the Alloy icon components exactly ──────────────── */
const PlusIcon             = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
const SearchSmIcon         = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Trash03Icon          = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6M10 10.5V15.5M14 10.5V15.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
const SunIcon              = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
const ChevronDownIcon      = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
const ArrowNarrowRightIcon = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>

/* ── Button — mirrors Alloy Button using token vars ─────────────────────────── */
function Button({ variant = 'primary', size = 'md', loading, disabled, leadingArtwork, trailingArtwork, iconOnly, style, className, children }) {
  const cls = [
    'alloy-btn',
    `v-${variant}`,
    `s-${size}`,
    iconOnly ? 'icon-only' : '',
    className || '',
  ].filter(Boolean).join(' ')

  return (
    <button disabled={disabled || loading} data-loading={loading || undefined} className={cls} style={style}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {!loading && iconOnly && <span className="artwork alloy-icon-slot" aria-hidden="true">{children}</span>}
      {!loading && !iconOnly && <>
        {leadingArtwork  && <span className="artwork alloy-icon-slot">{leadingArtwork}</span>}
        {children        && <span className="label">{children}</span>}
        {trailingArtwork && <span className="artwork alloy-icon-slot">{trailingArtwork}</span>}
      </>}
    </button>
  )
}

/* ── Data ───────────────────────────────────────────────────────────────────── */
const VARIANTS = ['primary', 'secondary', 'tertiary', 'ghost', 'destructive', 'destructive-secondary']
const SIZES    = ['xs', 'sm', 'md', 'lg', 'xl']

const VARIANT_LABEL = {
  'primary':               'primary',
  'secondary':             'secondary',
  'tertiary':              'tertiary',
  'ghost':                 'ghost',
  'destructive':           'destructive',
  'destructive-secondary': 'destr. secondary',
}

const VARIANT_LABEL_TEXT = {
  'primary':               'Save',
  'secondary':             'Save',
  'tertiary':              'Save',
  'ghost':                 'Dismiss',
  'destructive':           'Delete',
  'destructive-secondary': 'Remove',
}

/* ── Specimen sub-components ─────────────────────────────────────────────────── */

/** Section divider row inside the specimen table */
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

/**
 * A single specimen row.
 * label   — primary name, e.g. "Primary", "SM", "Leading"
 * tags    — array of small badge strings, e.g. ["variant", "32px", "default"]
 * note    — faint explanatory text on a second line
 * wide    — expands the render column to 260px (for full-width override demos)
 */
function SpecimenRow({ label, tags = [], note, wide, isMobile, children }) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: isMobile ? '1fr' : wide ? '1fr 260px' : '1fr 200px',
      alignItems:          'center',
      borderBottom:        '1px solid var(--color-border-opaque)',
      minHeight:           '52px',
    }}>
      {/* Label side */}
      <div style={{
        padding:     '12px 20px',
        borderRight: '1px solid var(--color-border-opaque)',
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
        flexWrap:    'wrap',
      }}>
        <span style={{
          fontFamily:  'var(--font-sans)',
          fontSize:    'var(--text-sm)',
          fontWeight:  'var(--font-weight-medium)',
          color:       'var(--color-content-primary)',
          lineHeight:  1,
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

      {/* Live render side */}
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

/** Import row — full width, monospace, no live render */
function ImportRow() {
  return (
    <div style={{
      padding:       '14px 20px',
      borderBottom:  '1px solid var(--color-border-opaque)',
      fontFamily:    'var(--font-mono)',
      fontSize:      '12.5px',
      color:         'var(--color-content-secondary)',
    }}>
      <span style={{ color: 'var(--color-content-disabled)' }}>import </span>
      <span style={{ color: 'var(--color-content-primary)', fontWeight: 500 }}>{'{ Button }'}</span>
      <span style={{ color: 'var(--color-content-disabled)' }}> from </span>
      <span style={{ color: 'var(--color-content-secondary)' }}>'alloy-design-system'</span>
    </div>
  )
}

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

function ColLabel({ w = 96, children, dark }) {
  return <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: dark ? 'rgba(255,255,255,0.3)' : 'var(--color-content-disabled)', width: w, flexShrink: 0 }}>{children}</span>
}

import { useIsMobile } from './useIsMobile.js'

/* ── Preview ─────────────────────────────────────────────────────────────────── */
export default function ButtonPreview() {
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
        .alloy-btn[data-loading] { cursor: wait; }

        /* ─ Sizes + artwork token cascade ─ */
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

        /* ─ Artwork slot ─ */
        .artwork {
          display:inline-flex; align-items:center; justify-content:center;
          flex-shrink:0;
          width: var(--btn-artwork-size, 1em);
          height: var(--btn-artwork-size, 1em);
        }
        .alloy-icon-slot > svg,
        .alloy-icon-slot > svg * { stroke-width: var(--icon-stroke-width, 1.75); }
        .alloy-icon-slot > svg { display: block; width: 100%; height: 100%; }
        .label { display:inline-flex; align-items:center; }

        /* ─ Variants ─ */
        .v-primary { background-color:var(--color-bg-inverse-primary); color:var(--color-content-inverse-primary); }
        .v-primary:hover:not(:disabled) { background-color:var(--color-bg-inverse-secondary); }
        .v-primary:active:not(:disabled) { background-color:var(--color-bg-inverse-tertiary); }

        .v-secondary { background-color:var(--color-bg-secondary); color:var(--color-content-primary); }
        .v-secondary:hover:not(:disabled) { background-color:var(--color-bg-tertiary); border-color:var(--color-border-hover); }
        .v-secondary:active:not(:disabled) { filter:brightness(0.97); }

        .v-tertiary { background-color:var(--color-bg-primary); color:var(--color-content-primary); border-color:var(--color-border-opaque); }
        .v-tertiary:hover:not(:disabled) { background-color:var(--color-bg-secondary); border-color:var(--color-border-hover); }
        .v-tertiary:active:not(:disabled) { background-color:var(--color-bg-tertiary); }

        .v-ghost { background-color:transparent; color:var(--color-content-primary); }
        .v-ghost:hover:not(:disabled) { background-color:var(--color-bg-transparent); border-color:var(--color-border-hover); }
        .v-ghost:active:not(:disabled) { background-color:var(--color-bg-secondary); }

        .v-destructive { background-color:var(--color-red-bg-primary); color:var(--color-content-inverse-primary); }
        .v-destructive:hover:not(:disabled) { border-color:var(--color-red-border-primary); filter:brightness(0.92); }
        .v-destructive:active:not(:disabled) { filter:brightness(0.84); }

        .v-destructive-secondary { background-color:var(--color-red-bg-tertiary); color:var(--color-red-content-primary); }
        .v-destructive-secondary:hover:not(:disabled) { border-color:var(--color-border-hover); filter:brightness(0.96); }
        .v-destructive-secondary:active:not(:disabled) { filter:brightness(0.92); }

        /* ─ Spinner ─ */
        .spinner {
          display:inline-block; flex-shrink:0;
          width:var(--btn-artwork-size, 1em); height:var(--btn-artwork-size, 1em);
          border:1.5px solid currentColor; border-right-color:transparent;
          border-radius:9999px; animation:alloy-spin 600ms linear infinite;
        }
        @keyframes alloy-spin { to { transform:rotate(360deg); } }

        /* ─ Specimen ─ */
        .specimen-import-kw  { color: var(--color-content-disabled); }
        .specimen-import-exp { color: var(--color-content-primary); font-weight: 500; }
        .specimen-import-src { color: var(--color-content-secondary); }
      `}</style>

      <div style={{ minHeight:'100vh', background:'var(--color-bg-secondary)', fontFamily:'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize:'var(--text-xs)', letterSpacing:'var(--tracking-wider)', textTransform:'uppercase', color:'var(--color-content-disabled)', marginBottom: 6 }}>Actions</p>
          <h1 style={{ fontSize:'var(--text-4-5xl)', fontWeight:'var(--font-weight-regular)', lineHeight:'var(--line-height-snug)', color:'var(--color-content-primary)', marginBottom: 8 }}>Button</h1>
          <p style={{ fontSize:'var(--text-base)', color:'var(--color-content-tertiary)', lineHeight:'var(--line-height-loose)' }}>6 variants · 5 sizes · scaled artwork · light &amp; dark</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap: isMobile ? 12 : 20 }}>

          {/* 1 — Variants × Sizes */}
          <Section title="Variants & Sizes" note="Hover and click to test interactive states · artwork scales with size" isMobile={isMobile}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap' }}>
              <span style={{ width:128 }} />
              {SIZES.map(s => (
                <span key={s} style={{ width:88, textAlign:'center', fontFamily:'var(--font-sans)', fontSize:'var(--text-xs)', letterSpacing:'var(--tracking-wide)', color:'var(--color-content-disabled)' }}>{s.toUpperCase()}</span>
              ))}
            </div>
            {VARIANTS.map(v => (
              <div key={v} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10, flexWrap:'wrap' }}>
                <ColLabel w={128}>{VARIANT_LABEL[v]}</ColLabel>
                {SIZES.map(s => (
                  <div key={s} style={{ width:88, display:'flex', justifyContent:'center' }}>
                    <Button variant={v} size={s}>{VARIANT_LABEL_TEXT[v]}</Button>
                  </div>
                ))}
              </div>
            ))}
          </Section>

          {/* 2 — States */}
          <Section title="States" note="Default · Loading (animated) · Disabled — md size" isMobile={isMobile}>
            <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 12 : 20, marginBottom:16, flexWrap:'wrap' }}>
              <span style={{ width:128 }} />
              {['Default', 'Loading', 'Disabled'].map(s => (
                <span key={s} style={{ width:110, textAlign:'center', fontFamily:'var(--font-sans)', fontSize:'var(--text-xs)', letterSpacing:'var(--tracking-wide)', color:'var(--color-content-disabled)' }}>{s}</span>
              ))}
            </div>
            {VARIANTS.map(v => (
              <div key={v} style={{ display:'flex', alignItems:'center', gap: isMobile ? 12 : 20, marginBottom:10, flexWrap:'wrap' }}>
                <ColLabel w={128}>{VARIANT_LABEL[v]}</ColLabel>
                <div style={{ width:110, display:'flex', justifyContent:'center' }}><Button variant={v}>{VARIANT_LABEL_TEXT[v]}</Button></div>
                <div style={{ width:110, display:'flex', justifyContent:'center' }}><Button variant={v} loading>{VARIANT_LABEL_TEXT[v]}</Button></div>
                <div style={{ width:110, display:'flex', justifyContent:'center' }}><Button variant={v} disabled>{VARIANT_LABEL_TEXT[v]}</Button></div>
              </div>
            ))}
          </Section>

          {/* 3 — Artwork */}
          <Section title="Artwork" note="Leading · Trailing · Both · Icon-only — stroke scales automatically with size" isMobile={isMobile}>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <ColLabel w={128}>Leading</ColLabel>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                  <Button variant="primary"   size="xl" leadingArtwork={<PlusIcon />}>Add member</Button>
                  <Button variant="secondary" size="lg" leadingArtwork={<SearchSmIcon />}>Search</Button>
                  <Button variant="tertiary"  size="md" leadingArtwork={<SunIcon />}>Settings</Button>
                  <Button variant="ghost"     size="sm" leadingArtwork={<ChevronDownIcon />}>More</Button>
                  <Button variant="ghost"     size="xs" leadingArtwork={<ChevronDownIcon />}>Tiny</Button>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <ColLabel w={128}>Trailing</ColLabel>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                  <Button variant="primary"   size="xl" trailingArtwork={<ArrowNarrowRightIcon />}>Get started</Button>
                  <Button variant="secondary" size="lg" trailingArtwork={<ArrowNarrowRightIcon />}>Learn more</Button>
                  <Button variant="tertiary"  size="md" trailingArtwork={<ChevronDownIcon />}>Options</Button>
                  <Button variant="ghost"     size="sm" trailingArtwork={<ArrowNarrowRightIcon />}>View all</Button>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <ColLabel w={128}>Both</ColLabel>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <Button variant="primary"   size="lg" leadingArtwork={<SearchSmIcon />} trailingArtwork={<ChevronDownIcon />}>Browse</Button>
                  <Button variant="tertiary"  size="md" leadingArtwork={<PlusIcon />}   trailingArtwork={<ChevronDownIcon />}>Create new</Button>
                  <Button variant="destructive-secondary" size="md" leadingArtwork={<Trash03Icon />}>Remove item</Button>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <ColLabel w={128}>Icon-only</ColLabel>
                <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                  {VARIANTS.map(v =>
                    SIZES.map(s => (
                      <Button key={`${v}-${s}`} variant={v} size={s} iconOnly aria-label={`${v} ${s}`}>
                        {v.startsWith('destructive') ? <Trash03Icon /> : v === 'ghost' ? <SunIcon /> : v === 'secondary' ? <SearchSmIcon /> : <PlusIcon />}
                      </Button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* ── 4 — Specimen ─────────────────────────────────────────────────── */}
          <Section
            title="Specimen"
            note="Quick-reference table — scan to identify the exact variant, size, and layout to name when prompting."
            isMobile={isMobile}
          >
            <div style={{
              background:   'var(--color-bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border:       '1px solid var(--color-border-opaque)',
              overflow:     'hidden',
            }}>

              {/* ── Import ── */}
              <SpecimenGroup label="Package" />
              <ImportRow />

              {/* ── Variants ── */}
              <SpecimenGroup label="Variant" />
              <SpecimenRow label="Primary" tags={['variant="primary"']} isMobile={isMobile}>
                <Button variant="primary">Save</Button>
              </SpecimenRow>
              <SpecimenRow label="Secondary" tags={['variant="secondary"']} isMobile={isMobile}>
                <Button variant="secondary">Save</Button>
              </SpecimenRow>
              <SpecimenRow label="Tertiary" tags={['variant="tertiary"']} isMobile={isMobile}>
                <Button variant="tertiary">Save</Button>
              </SpecimenRow>
              <SpecimenRow label="Ghost" tags={['variant="ghost"']} isMobile={isMobile}>
                <Button variant="ghost">Dismiss</Button>
              </SpecimenRow>
              <SpecimenRow label="Destructive" tags={['variant="destructive"']} isMobile={isMobile}>
                <Button variant="destructive">Delete</Button>
              </SpecimenRow>
              <SpecimenRow label="Destructive Secondary" tags={['variant="destructive-secondary"']} isMobile={isMobile}>
                <Button variant="destructive-secondary">Remove</Button>
              </SpecimenRow>

              {/* ── Sizes ── */}
              <SpecimenGroup label="Size" />
              <SpecimenRow label="XS" tags={['size="xs"', '24px height']} isMobile={isMobile}>
                <Button size="xs">Confirm</Button>
              </SpecimenRow>
              <SpecimenRow label="SM" tags={['size="sm"', '32px height']} isMobile={isMobile}>
                <Button size="sm">Confirm</Button>
              </SpecimenRow>
              <SpecimenRow label="MD" tags={['size="md"', '36px height', 'default']} isMobile={isMobile}>
                <Button size="md">Confirm</Button>
              </SpecimenRow>
              <SpecimenRow label="LG" tags={['size="lg"', '48px height']} isMobile={isMobile}>
                <Button size="lg">Confirm</Button>
              </SpecimenRow>
              <SpecimenRow label="XL" tags={['size="xl"', '56px height']} isMobile={isMobile}>
                <Button size="xl">Confirm</Button>
              </SpecimenRow>

              {/* ── Artwork & Layout ── */}
              <SpecimenGroup label="Artwork & Layout" />
              <SpecimenRow label="Leading artwork" tags={['leadingArtwork']} wide isMobile={isMobile}>
                <Button leadingArtwork={<PlusIcon />}>Add member</Button>
              </SpecimenRow>
              <SpecimenRow label="Trailing artwork" tags={['trailingArtwork']} wide isMobile={isMobile}>
                <Button trailingArtwork={<ArrowNarrowRightIcon />}>View all</Button>
              </SpecimenRow>
              <SpecimenRow label="Leading + Trailing" tags={['leadingArtwork', 'trailingArtwork']} wide isMobile={isMobile}>
                <Button leadingArtwork={<SearchSmIcon />} trailingArtwork={<ChevronDownIcon />}>Browse</Button>
              </SpecimenRow>
              <SpecimenRow label="Icon Only" tags={['iconOnly', 'aria-label']} wide isMobile={isMobile}>
                <Button iconOnly aria-label="Add"><PlusIcon /></Button>
              </SpecimenRow>

              {/* ── States ── */}
              <SpecimenGroup label="State" />
              <SpecimenRow label="Default" tags={[]} isMobile={isMobile}>
                <Button>Save</Button>
              </SpecimenRow>
              <SpecimenRow label="Loading" tags={['loading']} note="Shows spinner, blocks interaction" isMobile={isMobile}>
                <Button loading>Saving…</Button>
              </SpecimenRow>
              <SpecimenRow label="Disabled" tags={['disabled']} note="Cursor not-allowed, all variants collapse to same muted style" isMobile={isMobile}>
                <Button disabled>Save</Button>
              </SpecimenRow>

              {/* ── Overrides ── */}
              <SpecimenGroup label="Override" />
              <SpecimenRow label="Full width" tags={["style={{ width: '100%' }}"]} note="Stretches to fill its container" wide isMobile={isMobile}>
                <div style={{ width: '100%' }}>
                  <Button style={{ width: '100%' }}>Full width</Button>
                </div>
              </SpecimenRow>
              <SpecimenRow label="Custom height" tags={['style={{ height: 44 }}']} wide isMobile={isMobile}>
                <Button style={{ height: 44 }}>Custom height</Button>
              </SpecimenRow>
              <SpecimenRow label="Pill shape" tags={["style={{ borderRadius: 'var(--radius-full)' }}"]} wide isMobile={isMobile}>
                <Button style={{ borderRadius: 'var(--radius-full)' }}>Pill shape</Button>
              </SpecimenRow>
              <SpecimenRow label="className forwarded" tags={['className']} note="Spreads onto the root <button> element" wide isMobile={isMobile}>
                <Button>Custom class</Button>
              </SpecimenRow>
              <SpecimenRow label="Native button attributes" tags={['type', 'form', '...props']} note="All native attributes forwarded via rest props" wide isMobile={isMobile}>
                <Button type="submit">Place order</Button>
              </SpecimenRow>

            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Button v1</span>
        </div>

      </div>
    </>
  )
}
