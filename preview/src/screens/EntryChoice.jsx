import { useState } from 'react'
import { Eyebrow } from '../../../src/components/Eyebrow/Eyebrow.tsx'
import { ArrowNarrowRightIcon } from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { SparkleIcon } from './onboarding/SparkleIcon.jsx'
import { Grid01Icon } from '../../../src/components/icons/Grid01Icon.tsx'

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

function ChoiceCard({ kind, title, lede, Icon, accent, onClick }) {
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
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-md)',
          background: `var(--color-${accent}-bg-tertiary)`,
          color:      `var(--color-${accent}-content-secondary)`,
        }}
      >
        <Icon />
      </span>

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
        {kind === 'build' ? 'Start setup' : 'Browse industries'}
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
              Interactive demo
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
              Build or explore your Teambridge workspace.
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
              Start with a guided setup or drop into a ready-made account with realistic
              scheduling, staffing, payroll, and agent workflows.
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
              <span>Nova keeps the setup moving while the workspace fills in.</span>
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
              title="Build your account"
              lede="Walk through a quick setup. We'll personalize your dashboard, connect your tools, and stand up your first agent."
              Icon={SparkleIcon}
              accent="purple"
              onClick={onBuild}
            />
            <ChoiceCard
              kind="demo"
              title="Explore demo accounts"
              lede="Drop into a fully-loaded account for your industry. Watch how Teambridge AI runs shift coverage, scheduling, and payroll."
              Icon={Grid01Icon}
              accent="blue"
              onClick={onExplore}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
