import { useState } from 'react'
import { Eyebrow } from '../../../src/components/Eyebrow/Eyebrow.tsx'
import { ArrowNarrowRightIcon } from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'

const BASE = import.meta.env.BASE_URL
const TEAMBRIDGE_LOGO =
  'https://cdn.prod.website-files.com/67adea23aa73a53ff4afb197/67b499f67cace40b0939e859_teambridge%20logo%20main.svg'
const ROBOT_ANIMATION = `${BASE}agents/nova.gif`

/* ──────────────────────────────────────────────────────────────────────
 * EntryChoice — first screen of the demo. Two paths:
 *   1. "Build your account"     → guided onboarding chat at #/build
 *   2. "Explore demo accounts"  → existing industry picker at #/demos
 * Keeps the brand lockup quiet, like the real product.
 * ────────────────────────────────────────────────────────────────────── */

function ProductPreview({ kind }) {
  if (kind === 'build') {
    return (
      <div className="entry-product-preview entry-product-preview--build" aria-hidden="true">
        <img src={ROBOT_ANIMATION} alt="" />
        <div>
          <span>Company found</span>
          <strong>Workspace being built</strong>
        </div>
      </div>
    )
  }

  return (
    <div className="entry-product-preview entry-product-preview--demo" aria-hidden="true">
      <div><span>Coverage</span><strong>Resolved</strong></div>
      <div><span>Payroll</span><strong>Ready</strong></div>
      <div><span>Agents</span><strong>Live</strong></div>
    </div>
  )
}

function ChoiceCard({ kind, title, lede, action, onClick }) {
  const [hover, setHover]     = useState(false)
  const [pressed, setPressed] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={`entry-choice-card entry-choice-card--${kind}`}
      style={{
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        padding: 'var(--space-8)',
        background: 'var(--color-bg-primary)',
        border: `1px solid ${hover ? 'var(--color-border-selected)' : 'var(--color-border-opaque)'}`,
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        boxShadow: hover ? 'var(--shadow-below-md)' : 'none',
        transform: pressed ? 'translateY(0)' : hover ? 'translateY(-2px)' : 'translateY(0)',
        fontFamily: 'var(--font-sans)',
        minHeight: 280,
      }}
    >
      <ProductPreview kind={kind} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
        <span
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: 'var(--line-height-snug)',
            letterSpacing: '-0.01em',
            color: 'var(--color-content-primary)',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-regular)',
            lineHeight: 'var(--line-height-loose)',
            color: 'var(--color-content-tertiary)',
          }}
        >
          {lede}
        </span>
      </div>

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          color: hover ? 'var(--color-content-primary)' : 'var(--color-content-secondary)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          transition: 'color 160ms ease, transform 160ms ease',
          transform: hover ? 'translateX(2px)' : 'translateX(0)',
        }}
      >
        {action}
        <ArrowNarrowRightIcon size={16} />
      </span>
    </button>
  )
}

export default function EntryChoice({ onBuild, onExplore }) {
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
        <div
          style={{
            width: '100%',
            maxWidth: 1120,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'center',
          }}
        >
          <section style={{ minWidth: 0 }}>
            <Eyebrow style={{ color: 'var(--color-content-tertiary)', marginBottom: 'var(--space-4)' }}>
              Teambridge demo
            </Eyebrow>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(42px, 6vw, 72px)',
                fontWeight: 'var(--font-weight-regular)',
                lineHeight: 1.02,
                letterSpacing: 0,
                color: 'var(--color-content-primary)',
              }}
            >
              Start with a workspace that feels like yours.
            </h1>
            <p
              style={{
                margin: 'var(--space-5) 0 0',
                maxWidth: 520,
                fontSize: 'var(--text-lg)',
                lineHeight: 'var(--line-height-loose)',
                color: 'var(--color-content-tertiary)',
              }}
            >
              Let Nova build a workspace from your company context, or open a realistic
              industry account with scheduling, payroll, onboarding, compliance, and agents already running.
            </p>
            <div
              style={{
                marginTop: 'var(--space-8)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                color: 'var(--color-content-secondary)',
                fontSize: 'var(--text-sm)',
              }}
            >
              <img
                src={ROBOT_ANIMATION}
                alt=""
                aria-hidden="true"
                style={{
                  width: 52,
                  height: 52,
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-opaque)',
                  background: 'var(--color-bg-primary)',
                }}
              />
              <span>Nova stays with the demo and can walk the product with voice once you are inside.</span>
            </div>
          </section>

          <div
            className="entry-choice-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-5)',
              padding: 'var(--space-4)',
              border: '1px solid var(--color-border-opaque)',
              borderRadius: 'var(--radius-xl)',
              background: 'color-mix(in srgb, var(--color-bg-primary) 92%, transparent)',
              boxShadow: 'var(--shadow-below-lg)',
            }}
          >
            <ChoiceCard
              kind="build"
              title="Build my workspace"
              lede="Give Nova your website or a short description. It fills in locations, roles, goals, policies, and the first set of Teambridge agents."
              action="Start with my company"
              onClick={onBuild}
            />
            <ChoiceCard
              kind="demo"
              title="Open a live demo account"
              lede="Choose an operating model and jump into a working Teambridge workspace with realistic shifts, staff, payroll, and agent activity."
              action="Choose an industry"
              onClick={onExplore}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
