/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · FilterPill Preview
   Toggle · Removable · With icon · Sizes · Dark mode
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useIsMobile } from './useIsMobile.js'

/* ── Inline FilterPill mirror ─────────────────────────────────────────────── */

function FilterPill({ active = false, icon, onRemove, size = 'sm', disabled, className, children, ...props }) {
  const height = size === 'md' ? 26 : 22
  const paddingRight = onRemove ? 4 : 8

  const base = {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height,
    paddingLeft: 8,
    paddingRight,
    borderRadius: 'var(--radius-full)',
    border: '1px solid',
    borderColor: active ? 'var(--color-border-selected)' : 'var(--color-border-opaque)',
    background: active ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-weight-medium)',
    color: active ? 'var(--color-content-primary)' : 'var(--color-content-secondary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap',
    opacity: disabled ? 0.4 : 1,
    transition: 'background 100ms, border-color 100ms, color 100ms',
    outline: 'none',
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    onRemove?.(e)
  }

  return (
    <button type="button" disabled={disabled} style={base} {...props}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center', color: 'inherit' }}>{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          disabled={disabled}
          aria-label="Remove filter"
          onClick={handleRemove}
          tabIndex={-1}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, width: 14, height: 14,
            borderRadius: 'var(--radius-full)', border: 'none',
            background: 'transparent', color: 'var(--color-content-tertiary)',
            cursor: 'pointer', padding: 0,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </button>
  )
}

function FilterPillGroup({ children, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      flexWrap: 'wrap',
      paddingBottom: 1, ...style
    }}>
      {children}
    </div>
  )
}

/* ── Icon samples ─────────────────────────────────────────────────────────── */

const TriggerIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const ActionIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 8 12 12 14 14" />
  </svg>
)

const ConditionIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
)

/* ── Specimen sub-components ─────────────────────────────────────────────────── */

function SpecimenGroup({ label: groupLabel }) {
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
      }}>{groupLabel}</span>
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
      <span className="specimen-import-exp">{'{ FilterPill }'}</span>
      <span className="specimen-import-kw"> from </span>
      <span className="specimen-import-src">'alloy-design-system'</span>
    </div>
  )
}

/* ── Section wrapper ──────────────────────────────────────────────────────── */

function Section({ label, description, children }) {
  const isMobile = useIsMobile()
  return (
    <div style={{
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-opaque)',
      borderRadius: 'var(--radius-xl)',
      padding: isMobile ? 20 : 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-content-disabled)', textTransform: 'uppercase', margin: '0 0 4px' }}>
          {label}
        </p>
        {description && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)', margin: '4px 0 0' }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>
          {label}
        </span>
      )}
      <FilterPillGroup>{children}</FilterPillGroup>
    </div>
  )
}

/* ── Preview ──────────────────────────────────────────────────────────────── */

const TYPE_FILTERS = [
  { value: 'all',       label: 'All' },
  { value: 'trigger',   label: 'Trigger' },
  { value: 'action',    label: 'Action' },
  { value: 'condition', label: 'Condition' },
  { value: 'transform', label: 'Transform' },
  { value: 'output',    label: 'Output' },
]

export default function FilterPillPreview() {
  const isMobile = useIsMobile()
  const [typeFilter, setTypeFilter]     = useState('all')
  const [multiActive, setMultiActive]   = useState({ trigger: true, action: false, condition: true })
  const [applied, setApplied]           = useState(['Status: Active', 'Role: Engineer', 'Location: Remote', 'Start: 2022'])

  const toggleMulti = (key) => setMultiActive(prev => ({ ...prev, [key]: !prev[key] }))
  const removeApplied = (label) => setApplied(prev => prev.filter(l => l !== label))

  return (
    <>
      <style>{`
        .fp-demo button:hover:not([disabled]):not([data-active]) {
          background: var(--color-bg-secondary) !important;
          color: var(--color-content-primary) !important;
        }
        .fp-demo button:focus-visible {
          outline: 2px solid var(--color-border-focus);
          outline-offset: 2px;
        }
        .specimen-import-kw  { color: var(--color-content-disabled); }
        .specimen-import-exp { color: var(--color-content-primary); font-weight: 500; }
        .specimen-import-src { color: var(--color-content-secondary); }
      `}</style>

      <div className="fp-demo" style={{
        minHeight: '100vh',
        background: 'var(--color-bg-secondary)',
        padding: isMobile ? '24px 16px' : '48px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--color-content-primary)',
            margin: 0,
          }}>
            Filter Pill
          </h1>
        </div>

        {/* Single-select toggle (Automation 2.0 palette style) */}
        <Section
          label="Toggle — single select"
          description="Matches the Automation 2.0 palette filter row exactly. One active at a time."
        >
          <Row label="sm (default)">
            {TYPE_FILTERS.map(f => (
              <FilterPill
                key={f.value}
                active={typeFilter === f.value}
                onClick={() => setTypeFilter(f.value)}
              >
                {f.label}
              </FilterPill>
            ))}
          </Row>

          <Row label="md">
            {TYPE_FILTERS.map(f => (
              <FilterPill
                key={f.value}
                size="md"
                active={typeFilter === f.value}
                onClick={() => setTypeFilter(f.value)}
              >
                {f.label}
              </FilterPill>
            ))}
          </Row>
        </Section>

        {/* Multi-select toggle */}
        <Section
          label="Toggle — multi select"
          description="Multiple pills can be active simultaneously."
        >
          <Row label="sm">
            {Object.entries(multiActive).map(([key, isActive]) => (
              <FilterPill
                key={key}
                active={isActive}
                onClick={() => toggleMulti(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </FilterPill>
            ))}
          </Row>
        </Section>

        {/* With leading icon */}
        <Section
          label="With icon"
          description="Leading icon slot — 10×10 SVG glyph aligned to the label baseline."
        >
          <Row label="inactive">
            <FilterPill icon={<TriggerIcon />}>Trigger</FilterPill>
            <FilterPill icon={<ActionIcon />}>Action</FilterPill>
            <FilterPill icon={<ConditionIcon />}>Condition</FilterPill>
          </Row>
          <Row label="active">
            <FilterPill icon={<TriggerIcon />} active>Trigger</FilterPill>
            <FilterPill icon={<ActionIcon />} active>Action</FilterPill>
            <FilterPill icon={<ConditionIcon />} active>Condition</FilterPill>
          </Row>
        </Section>

        {/* Removable applied filters */}
        <Section
          label="Removable"
          description="Applied filter chips with a trailing × button. Click × to dismiss."
        >
          <Row label={applied.length ? `${applied.length} applied` : 'all removed — try reloading'}>
            {applied.map(label => (
              <FilterPill
                key={label}
                active
                onRemove={() => removeApplied(label)}
              >
                {label}
              </FilterPill>
            ))}
            {applied.length === 0 && (
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)' }}>
                All filters removed
              </span>
            )}
          </Row>
          <Row label="inactive + removable">
            <FilterPill onRemove={() => {}}>Draft</FilterPill>
            <FilterPill onRemove={() => {}}>Unassigned</FilterPill>
            <FilterPill onRemove={() => {}}>This week</FilterPill>
          </Row>
        </Section>

        {/* States */}
        <Section
          label="States"
          description="Default · Active · Disabled · Disabled active"
        >
          <FilterPillGroup>
            <FilterPill>Default</FilterPill>
            <FilterPill active>Active</FilterPill>
            <FilterPill disabled>Disabled</FilterPill>
            <FilterPill disabled active>Disabled active</FilterPill>
          </FilterPillGroup>
        </Section>

        {/* Dark mode */}
        <Section
          label="Dark mode"
          description="Same tokens — dark surface overrides for reference."
        >
          <div className="dark" style={{
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <Row label="toggle">
              {TYPE_FILTERS.map(f => (
                <FilterPill
                  key={f.value}
                  active={typeFilter === f.value}
                  onClick={() => setTypeFilter(f.value)}
                >
                  {f.label}
                </FilterPill>
              ))}
            </Row>
            <Row label="removable">
              <FilterPill active onRemove={() => {}}>Status: Active</FilterPill>
              <FilterPill active onRemove={() => {}}>Role: Engineer</FilterPill>
              <FilterPill onRemove={() => {}}>Location: Remote</FilterPill>
            </Row>
          </div>
        </Section>

        {/* Specimen */}
        <Section
          label="Specimen"
          description="Quick-reference table — scan to identify the exact prop combination to name when prompting."
        >
          <div style={{
            background:   'var(--color-bg-primary)',
            borderRadius: 'var(--radius-lg)',
            border:       '1px solid var(--color-border-opaque)',
            overflow:     'hidden',
            margin:       '-20px',
          }}>

            {/* ── Package ── */}
            <SpecimenGroup label="Package" />
            <ImportRow />

            {/* ── Size ── */}
            <SpecimenGroup label="Size" />
            <SpecimenRow label="SM" tags={['size="sm"', '22px height', 'default']} isMobile={isMobile}>
              <FilterPill size="sm">Label</FilterPill>
            </SpecimenRow>
            <SpecimenRow label="MD" tags={['size="md"', '26px height']} isMobile={isMobile}>
              <FilterPill size="md">Label</FilterPill>
            </SpecimenRow>

            {/* ── Active state ── */}
            <SpecimenGroup label="Active" />
            <SpecimenRow label="Inactive" tags={['active={false}', 'default']} isMobile={isMobile}>
              <FilterPill>Label</FilterPill>
            </SpecimenRow>
            <SpecimenRow label="Active" tags={['active']} isMobile={isMobile}>
              <FilterPill active>Label</FilterPill>
            </SpecimenRow>

            {/* ── Icon ── */}
            <SpecimenGroup label="Leading icon" />
            <SpecimenRow label="No icon" tags={['icon omitted', 'default']} isMobile={isMobile}>
              <FilterPill>Trigger</FilterPill>
            </SpecimenRow>
            <SpecimenRow label="With icon" tags={['icon={…}']} note="10×10 SVG glyph aligned to label baseline" isMobile={isMobile}>
              <FilterPill icon={<TriggerIcon />}>Trigger</FilterPill>
            </SpecimenRow>
            <SpecimenRow label="Icon + active" tags={['icon', 'active']} isMobile={isMobile}>
              <FilterPill icon={<TriggerIcon />} active>Trigger</FilterPill>
            </SpecimenRow>

            {/* ── Removable ── */}
            <SpecimenGroup label="Removable" />
            <SpecimenRow label="Without remove" tags={['onRemove omitted', 'default']} isMobile={isMobile}>
              <FilterPill>Status: Active</FilterPill>
            </SpecimenRow>
            <SpecimenRow label="Inactive + removable" tags={['onRemove']} isMobile={isMobile}>
              <FilterPill onRemove={() => {}}>Status: Active</FilterPill>
            </SpecimenRow>
            <SpecimenRow label="Active + removable" tags={['active', 'onRemove']} isMobile={isMobile}>
              <FilterPill active onRemove={() => {}}>Status: Active</FilterPill>
            </SpecimenRow>

            {/* ── State ── */}
            <SpecimenGroup label="State" />
            <SpecimenRow label="Default" tags={[]} isMobile={isMobile}>
              <FilterPill>Label</FilterPill>
            </SpecimenRow>
            <SpecimenRow label="Disabled" tags={['disabled']} note="Opacity 0.4, cursor not-allowed" isMobile={isMobile}>
              <FilterPill disabled>Label</FilterPill>
            </SpecimenRow>
            <SpecimenRow label="Disabled active" tags={['disabled', 'active']} isMobile={isMobile}>
              <FilterPill disabled active>Label</FilterPill>
            </SpecimenRow>

          </div>
        </Section>

        {/* Footer */}
        <div style={{
          marginTop: 40,
          paddingTop: 20,
          borderTop: '1px solid var(--color-border-opaque)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-content-disabled)',
            letterSpacing: 'var(--tracking-wide)',
          }}>
            Alloy — Filter Pill v1
          </span>
        </div>
      </div>
    </>
  )
}
