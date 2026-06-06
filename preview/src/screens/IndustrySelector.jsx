import { useState } from 'react'
import { Eyebrow } from '../../../src/components/Eyebrow/Eyebrow.tsx'
import { ArrowNarrowRightIcon } from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'

const BASE = import.meta.env.BASE_URL
const TEAMBRIDGE_LOGO =
  'https://cdn.prod.website-files.com/67adea23aa73a53ff4afb197/67b499f67cace40b0939e859_teambridge%20logo%20main.svg'
const ROBOT_ANIMATION = `${BASE}agents/nova.gif`

export const INDUSTRIES = [
  { id: 'healthcare',       name: 'Healthcare',          description: 'Credentialing, call-outs, float pools',         metric: '4 hr gap', status: 'Replacing' },
  { id: 'staffing',         name: 'Staffing',            description: 'Placements, availability, first-shift readiness', metric: '18 fills', status: 'Active' },
  { id: 'events',           name: 'Events & Venues',     description: 'Venue coverage, late changes, union rules',      metric: '612 crew', status: 'Live' },
  { id: 'hospitality',      name: 'Hospitality',         description: 'Housekeeping, front desk, food service teams',    metric: '23 shifts', status: 'Covered' },
  { id: 'long-term-care',   name: 'Long Term Care',      description: 'Facility staffing, certifications, compliance',   metric: '9 alerts', status: 'Cleared' },
  { id: 'security',         name: 'Security',            description: 'Post coverage, patrols, site compliance',         metric: '31 posts', status: 'Monitoring' },
  { id: 'janitorial',       name: 'Janitorial & Facilities', description: 'Building service schedules and route changes', metric: '7 sites', status: 'Ready' },
  { id: 'light-industrial', name: 'Light Industrial',    description: 'Warehouse crews, attendance, overtime risk',      metric: '42 roles', status: 'Balanced' },
  { id: 'construction',     name: 'Construction',        description: 'Trades, job sites, certifications, crews',        metric: '5 sites', status: 'Checked' },
]

/* ─────────────────────────────────────────────────────────────────────────────
   Industry card
   Hoverable tile: colored icon badge + name + short descriptor. Arrow fades in
   on hover to signal "click to enter". Semantic tokens only — no raw hex.
   ───────────────────────────────────────────────────────────────────────────── */

function IndustryCard({ industry, onSelect }) {
  const [hover, setHover]     = useState(false)
  const [pressed, setPressed] = useState(false)
  const { name, description, id, metric, status } = industry

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
            width: 92,
            minHeight: 54,
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-opaque)',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)' }}>{metric}</span>
          <strong style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-primary)' }}>{status}</strong>
        </div>
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
        background: 'linear-gradient(180deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-6) var(--space-8)',
        }}
      >
        <img
          src={TEAMBRIDGE_LOGO}
          alt="Teambridge"
          style={{
            width: 166,
            height: 'auto',
            display: 'block',
          }}
        />
      </header>

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
        <div style={{ width: '100%', maxWidth: 1120 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: 'var(--space-8)',
              alignItems: 'end',
              marginBottom: 'var(--space-8)',
            }}
          >
            <div>
              <Eyebrow style={{ color: 'var(--color-content-tertiary)', marginBottom: 'var(--space-3)' }}>
                Live demo account
              </Eyebrow>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(36px, 5vw, 60px)',
                fontWeight: 'var(--font-weight-regular)',
                lineHeight: 1.04,
                letterSpacing: 0,
                color: 'var(--color-content-primary)',
              }}
            >
              Pick the workspace closest to your operation.
            </h1>
            <p
              style={{
                margin: 'var(--space-4) 0 0',
                maxWidth: 620,
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--line-height-loose)',
                color: 'var(--color-content-tertiary)',
              }}
            >
              Every account opens inside the same Teambridge product: realistic schedules,
              staff, payroll, compliance, and AI agent activity tuned to the operating model.
            </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                minWidth: 260,
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border-opaque)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-bg-primary)',
                boxShadow: 'var(--shadow-below-sm)',
              }}
            >
              <img
                src={ROBOT_ANIMATION}
                alt=""
                aria-hidden="true"
                style={{
                  width: 54,
                  height: 54,
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-opaque)',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-primary)' }}>
                  Nova is ready inside every account
                </span>
                <span style={{ fontSize: 'var(--text-xs)', lineHeight: 'var(--line-height-relaxed)', color: 'var(--color-content-tertiary)' }}>
                  Ask questions, run scenarios, or start the voice walkthrough once you enter.
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              border: '1px solid var(--color-border-opaque)',
              borderRadius: 'var(--radius-xl)',
              background: 'color-mix(in srgb, var(--color-bg-primary) 92%, transparent)',
              boxShadow: 'var(--shadow-below-md)',
            }}
          >
            {INDUSTRIES.map(industry => (
              <IndustryCard key={industry.id} industry={industry} onSelect={onSelect} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
