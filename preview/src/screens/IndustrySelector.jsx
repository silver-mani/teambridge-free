import { useState } from 'react'
import { Eyebrow } from '../../../src/components/Eyebrow/Eyebrow.tsx'
import { TeambridgeAIIcon } from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { Users03Icon } from '../../../src/components/icons/Users03Icon.tsx'
import { Microphone02Icon } from '../../../src/components/icons/Microphone02Icon.tsx'
import { Bell01Icon } from '../../../src/components/icons/Bell01Icon.tsx'
import { PackageIcon } from '../../../src/components/icons/PackageIcon.tsx'
import { Home02Icon } from '../../../src/components/icons/Home02Icon.tsx'
import { Trash03Icon } from '../../../src/components/icons/Trash03Icon.tsx'

/* ─────────────────────────────────────────────────────────────────────────────
   Industry icons — strict order of preference:
     1. An Alloy icon that semantically fits the industry (wrapped at 24px so
        the IndustryCard's 44×44 chip and the ConfigCard's 24×24 chip both
        render at the expected pixel sizes via parent CSS).
     2. An inline stroke icon (currentColor, round caps, sw 1.5 at 24px),
        used only when no Alloy icon represents the concept well — e.g.
        healthcare's heart-pulse, security's shield, construction's hard hat.
   ───────────────────────────────────────────────────────────────────────────── */

// Wrap an Alloy icon to render at 24×24 by default (matches the chip sizes
// our INDUSTRIES catalogue expects). The .cc-industry-mark CSS shrinks it
// to 14px inside the small chip.
const AlloyWrap = (Icon) => () => <Icon size={24} />


const iconBase = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  strokeWidth: 1.5,
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const HealthcareIcon = () => (
  <svg {...iconBase}>
    <path d="M12 21s-8-5.2-8-11.5A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 8 3.5C20 15.8 12 21 12 21Z" />
    <path d="M3.5 13h3.8l1.7-3 2.8 6 1.7-3h7" />
  </svg>
)

// Staffing → Users03 (group of three people, the staffing/agency archetype)
const StaffingIcon = AlloyWrap(Users03Icon)

// Events & Venues → Microphone02 (stage / performance / event mark)
const EventsIcon = AlloyWrap(Microphone02Icon)

const SecurityIcon = () => (
  <svg {...iconBase}>
    <path d="M12 3 4 6v5.2c0 4.6 3.3 8.9 8 10.3 4.7-1.4 8-5.7 8-10.3V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

// Light Industrial → Package (warehouse / logistics / shipping box)
const LightIndustrialIcon = AlloyWrap(PackageIcon)

const ConstructionIcon = () => (
  <svg {...iconBase}>
    <path d="M3 18h18" />
    <path d="M5 18v-4a7 7 0 0 1 14 0v4" />
    <path d="M10 7.2V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2.2" />
    <path d="M12 11v3" />
  </svg>
)

// Hospitality → Bell01 (the universal hotel / room-service bell)
const HospitalityIcon = AlloyWrap(Bell01Icon)

// Long Term Care → Home02 (in-home / assisted-living setting; closest
// match in Alloy. No heart/hand-care icon exists in the set.)
const LongTermCareIcon = AlloyWrap(Home02Icon)

// Janitorial & Facilities → Trash03 (waste / cleaning; closest match
// in Alloy. No spray-bottle or broom icon exists in the set.)
const JanitorialIcon = AlloyWrap(Trash03Icon)

/* ─────────────────────────────────────────────────────────────────────────────
   Industry catalogue
   Colors pull from Alloy's semantic color families (e.g. --color-blue-bg-tertiary
   / --color-blue-content-secondary), consistent with DataCard badge pattern.
   ───────────────────────────────────────────────────────────────────────────── */

export const INDUSTRIES = [
  { id: 'healthcare',       name: 'Healthcare',          description: 'Nursing, clinical, allied health',      color: 'blue',   Icon: HealthcareIcon },
  { id: 'staffing',         name: 'Staffing',            description: 'Agency placements and per-diem',        color: 'purple', Icon: StaffingIcon },
  { id: 'events',           name: 'Events & Venues',     description: 'Stadiums, arenas, conferences',         color: 'pink',   Icon: EventsIcon },
  { id: 'hospitality',      name: 'Hospitality',         description: 'Hotels, restaurants, guest services',   color: 'matcha', Icon: HospitalityIcon },
  { id: 'long-term-care',   name: 'Long Term Care',      description: 'Skilled nursing, assisted living, home', color: 'green', Icon: LongTermCareIcon },
  { id: 'security',         name: 'Security',            description: 'Guard services and site patrols',       color: 'slate',  Icon: SecurityIcon },
  { id: 'janitorial',       name: 'Janitorial & Facilities', description: 'Cleaning, building services, maintenance', color: 'azure', Icon: JanitorialIcon },
  { id: 'light-industrial', name: 'Light Industrial',    description: 'Warehousing, logistics, manufacturing', color: 'orange', Icon: LightIndustrialIcon },
  { id: 'construction',     name: 'Construction',        description: 'Trades, job sites, project crews',      color: 'matcha', Icon: ConstructionIcon },
]

/* ─────────────────────────────────────────────────────────────────────────────
   Industry card
   Hoverable tile: colored icon badge + name + short descriptor. Arrow fades in
   on hover to signal "click to enter". Semantic tokens only — no raw hex.
   ───────────────────────────────────────────────────────────────────────────── */

function IndustryCard({ industry, onSelect }) {
  const [hover, setHover]     = useState(false)
  const [pressed, setPressed] = useState(false)
  const { Icon, color, name, description, id } = industry

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-5)',
        background: 'var(--color-bg-primary)',
        border: `1px solid ${hover ? 'var(--color-border-selected)' : 'var(--color-border-opaque)'}`,
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease',
        boxShadow: hover ? 'var(--shadow-below-md)' : 'none',
        transform: pressed ? 'translateY(0)' : hover ? 'translateY(-1px)' : 'translateY(0)',
        fontFamily: 'var(--font-sans)',
        minHeight: 148,
      }}
    >
      {/* Top row: colored icon badge + trailing arrow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: `var(--color-${color}-bg-tertiary)`,
            color:      `var(--color-${color}-content-secondary)`,
          }}
        >
          <Icon />
        </span>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            color: 'var(--color-content-tertiary)',
            opacity: hover ? 1 : 0,
            transform: hover ? 'translateX(0)' : 'translateX(-4px)',
            transition: 'opacity 140ms ease, transform 140ms ease',
          }}
        >
          <ArrowNarrowRightIcon size={20} />
        </span>
      </div>

      {/* Copy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <span
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: 'var(--line-height-normal)',
            color: 'var(--color-content-primary)',
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-regular)',
            lineHeight: 'var(--line-height-relaxed)',
            color: 'var(--color-content-tertiary)',
          }}
        >
          {description}
        </span>
      </div>
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Industry selector — Screen 1
   Entry point for the Teambridge Free sandbox. One click to pick an industry
   and drop into Act 1 (the live agent dashboard).
   ───────────────────────────────────────────────────────────────────────────── */

export default function IndustrySelector({ onSelect = () => {} }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-primary)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand lockup — kept small and quiet, like the real product */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-6) var(--space-8)',
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-inverse-primary)',
            color: 'var(--color-content-inverse-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TeambridgeAIIcon size={16} />
        </span>
        <span
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-content-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Teambridge
        </span>
      </header>

      {/* Centered content column */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8) var(--space-6) var(--space-16)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 880 }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <Eyebrow style={{ color: 'var(--color-content-tertiary)', marginBottom: 'var(--space-3)' }}>
              Teambridge Access
            </Eyebrow>
            <h1
              style={{
                margin: 0,
                fontSize: 'var(--text-5xl)',
                fontWeight: 'var(--font-weight-regular)',
                lineHeight: 'var(--line-height-snug)',
                letterSpacing: '-0.02em',
                color: 'var(--color-content-primary)',
              }}
            >
              Which world are you in?
            </h1>
            <p
              style={{
                margin: 'var(--space-4) auto 0',
                maxWidth: 560,
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--line-height-loose)',
                color: 'var(--color-content-tertiary)',
              }}
            >
              We&rsquo;ll load realistic data for your shifts, your staff, and your workflows.
              Pick an industry to begin.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {INDUSTRIES.map(industry => (
              <IndustryCard key={industry.id} industry={industry} onSelect={onSelect} />
            ))}
          </div>

          <p
            style={{
              margin: 'var(--space-10) 0 0',
              textAlign: 'center',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-content-tertiary)',
            }}
          >
            One click. No signup. You can switch industries anytime.
          </p>
        </div>
      </main>
    </div>
  )
}
