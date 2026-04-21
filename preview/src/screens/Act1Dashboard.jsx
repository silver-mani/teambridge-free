import { useEffect, useMemo, useRef, useState } from 'react'
import { Eyebrow }             from '../../../src/components/Eyebrow/Eyebrow.tsx'
import { StatusTag }           from '../../../src/components/StatusTag/StatusTag.tsx'
import { Button }              from '../../../src/components/Button/Button.tsx'
import { AILoader }            from '../../../src/components/ai/AILoader/AILoader.tsx'
import { TeambridgeAIIcon }    from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ArrowNarrowRightIcon }from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { CheckIcon }           from '../../../src/components/icons/CheckIcon.tsx'
import { ClockIcon }           from '../../../src/components/icons/ClockIcon.tsx'
import { EyeIcon }             from '../../../src/components/icons/EyeIcon.tsx'
import { AlertTriangleIcon }   from '../../../src/components/icons/AlertTriangleIcon.tsx'
import { ChevronLeftIcon }     from '../../../src/components/icons/ChevronLeftIcon.tsx'
import { getIndustryData }     from '../data/industryData.js'
import './act1.css'

/* Map feed-card "status" values to the Alloy StatusTag status + a small icon.  */
const STATUS_MAP = {
  'in-progress': { tagStatus: 'warning', Icon: AILoader,         color: 'warning' },
  'resolved':    { tagStatus: 'success', Icon: CheckIcon,        color: 'success' },
  'monitoring':  { tagStatus: 'info',    Icon: EyeIcon,          color: 'info'    },
  'watching':    { tagStatus: 'warning', Icon: AlertTriangleIcon,color: 'warning' },
  'sent':        { tagStatus: 'neutral', Icon: ArrowNarrowRightIcon, color: 'neutral' },
}

/* ─── Formatting ──────────────────────────────────────────────────────────── */

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

/* ─── Header ──────────────────────────────────────────────────────────────── */

function Header({ industryLabel, onBack }) {
  return (
    <header className="act1-header">
      <div className="act1-header-left">
        <button
          type="button"
          className="act1-brand"
          onClick={onBack}
          aria-label="Change industry"
        >
          <span className="act1-brand-mark">
            <TeambridgeAIIcon size={14} />
          </span>
          <span className="act1-brand-name">Teambridge</span>
        </button>
        <span className="act1-divider" aria-hidden="true" />
        <span className="act1-industry">{industryLabel}</span>
        <span className="act1-divider" aria-hidden="true" />
        <span className="act1-date">{formatToday()}</span>
      </div>
    </header>
  )
}

/* ─── Feed card ───────────────────────────────────────────────────────────── */

function ActivityCard({ card, emphasis = 'normal', onClick, dimmed = false }) {
  const meta = STATUS_MAP[card.status] ?? STATUS_MAP.resolved
  const { Icon, tagStatus } = meta
  const isActive    = emphasis === 'active'
  const interactive = typeof onClick === 'function' && isActive

  const inner = (
    <>
      <div className="activity-card-row">
        <span className={`activity-card-iconwrap activity-card-iconwrap-${meta.color}`} aria-hidden="true">
          {card.status === 'in-progress'
            ? <AILoader size="sm" variant="gradient" />
            : <Icon size={16} />}
        </span>
        <StatusTag status={tagStatus} size="sm" dot={false}>{card.statusLabel}</StatusTag>
        <span className="activity-card-dot" aria-hidden="true">·</span>
        <span className="activity-card-time">{card.timestamp}</span>
        {isActive && <span className="activity-card-pulse" aria-hidden="true" />}
      </div>

      <h3 className="activity-card-title">{card.title}</h3>
      <p  className="activity-card-desc">{card.description}</p>

      {isActive && (
        <div className="activity-card-cta" aria-hidden="true">
          Click to see how Teambridge is resolving this
          <ArrowNarrowRightIcon size={16} />
        </div>
      )}
    </>
  )

  const className =
    `activity-card ${isActive ? 'activity-card-active' : ''} ${dimmed ? 'activity-card-dimmed' : ''}`

  return interactive ? (
    <button type="button" className={className} onClick={onClick}>{inner}</button>
  ) : (
    <div className={className}>{inner}</div>
  )
}

/* ─── Reasoning step ──────────────────────────────────────────────────────── */

function StepItem({ step, state, winnerName }) {
  // state: 'pending' | 'active' | 'done'
  const visible = state !== 'pending'
  if (!visible) return null

  const isActive = state === 'active'
  const cls = `step-item ${isActive ? 'step-active' : 'step-done'}`

  if (step.kind === 'loading') {
    return (
      <div className={cls}>
        <span className="step-icon">
          {isActive
            ? <AILoader size="sm" variant="gradient" />
            : <CheckIcon size={16} />}
        </span>
        <div className="step-body">
          <div className="step-title">{step.title}</div>
        </div>
      </div>
    )
  }

  if (step.kind === 'status') {
    return (
      <div className={cls}>
        <span className="step-icon step-icon-check">
          <CheckIcon size={16} />
        </span>
        <div className="step-body">
          <div className="step-title">{step.title}</div>
          {step.detail && <div className="step-detail">{step.detail}</div>}
        </div>
      </div>
    )
  }

  if (step.kind === 'success') {
    return (
      <div className={`${cls} step-success`}>
        <span className="step-icon step-icon-success">
          <CheckIcon size={16} />
        </span>
        <div className="step-body">
          <div className="step-title">{step.title}</div>
          {step.detail && <div className="step-detail">{step.detail}</div>}
        </div>
      </div>
    )
  }

  if (step.kind === 'matches') {
    return (
      <div className={cls}>
        <span className="step-icon step-icon-check">
          <CheckIcon size={16} />
        </span>
        <div className="step-body">
          <div className="step-title">{step.title}</div>
          <ul className="match-list">
            {step.matches.map(m => (
              <li
                key={m.name}
                className={`match-item ${m.winner && winnerName ? 'match-winner' : ''} ${winnerName && !m.winner ? 'match-dim' : ''}`}
              >
                <span className="match-avatar" aria-hidden="true">
                  {m.name.split(' ').map(p => p[0]).join('').slice(0, 2)}
                </span>
                <div className="match-text">
                  <div className="match-name">{m.name}</div>
                  <div className="match-meta">{m.meta}</div>
                </div>
                {m.winner && winnerName && (
                  <StatusTag status="success" size="sm">Top match</StatusTag>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return null
}

/* ─── Drill-in panel ─────────────────────────────────────────────────────── */

function DrillInPanel({ data, onExplore, onBack }) {
  const steps = data.drillIn.steps
  const [activeIdx, setActiveIdx] = useState(0)
  const [resolved,  setResolved]  = useState(false)
  const [showKicker, setShowKicker] = useState(false)
  const timersRef = useRef([])

  const winnerName = useMemo(() => {
    const matchesStep = steps.find(s => s.kind === 'matches')
    return matchesStep?.matches?.find(m => m.winner)?.name ?? ''
  }, [steps])

  useEffect(() => {
    let cumulative = 0
    steps.forEach((step, i) => {
      cumulative += step.delay ?? 2000
      if (i === 0) return
      timersRef.current.push(setTimeout(() => setActiveIdx(i), cumulative))
    })
    // Resolve + kicker a beat after the last step's delay
    const resolvedAt = cumulative + 800
    timersRef.current.push(setTimeout(() => setResolved(true),  resolvedAt))
    timersRef.current.push(setTimeout(() => setShowKicker(true), resolvedAt + 600))

    return () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }
  }, [steps])

  const headerCard = resolved
    ? { ...data.activeCard, ...data.drillIn.resolution, status: 'resolved' }
    : data.activeCard

  return (
    <section className="drill-in">
      <button type="button" className="drill-back" onClick={onBack}>
        <ChevronLeftIcon size={16} />
        <span>Back to overview</span>
      </button>

      <ActivityCard card={headerCard} emphasis={resolved ? 'normal' : 'active'} />

      <ol className="step-list" aria-live="polite">
        {steps.map((step, i) => {
          let state = 'pending'
          if (i < activeIdx) state = 'done'
          else if (i === activeIdx && !resolved) state = 'active'
          else if (i === activeIdx && resolved)  state = 'done'
          else if (i < steps.length && resolved) state = 'done'
          return (
            <li key={step.id}>
              <StepItem step={step} state={state} winnerName={i < activeIdx ? winnerName : ''} />
            </li>
          )
        })}
      </ol>

      {showKicker && (
        <div className="kicker">
          <p className="kicker-text">{data.drillIn.kicker}</p>
          <div className="kicker-actions">
            <Button
              variant="primary"
              size="lg"
              trailingArtwork={<ArrowNarrowRightIcon size={18} />}
              onClick={onExplore}
            >
              Want to see what else Teambridge can do?
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

/* ─── Overview ─────────────────────────────────────────────────────────────── */

function OverviewFeed({ data, onActivate }) {
  return (
    <section className="overview">
      <div className="overview-intro">
        <Eyebrow style={{ color: 'var(--color-content-tertiary)', marginBottom: 'var(--space-3)' }}>
          Live activity
        </Eyebrow>
        <h1 className="overview-title">
          Teambridge is managing your operation right now.
        </h1>
        <p className="overview-sub">
          Every action below is being handled automatically. The card at the top is active.
        </p>
      </div>

      <div className="feed">
        <ActivityCard card={data.activeCard} emphasis="active" onClick={onActivate} />
        {data.feed.map(card => (
          <ActivityCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  )
}

/* ─── Screen root ─────────────────────────────────────────────────────────── */

export default function Act1Dashboard({ industryId, onBack, onExplore }) {
  const data = useMemo(() => getIndustryData(industryId), [industryId])
  const [phase, setPhase] = useState('overview')

  return (
    <div className="act1-root">
      <Header industryLabel={data.label} onBack={onBack} />

      <main className="act1-main">
        {phase === 'overview' ? (
          <OverviewFeed data={data} onActivate={() => setPhase('drill-in')} />
        ) : (
          <DrillInPanel
            data={data}
            onExplore={onExplore}
            onBack={() => setPhase('overview')}
          />
        )}
      </main>
    </div>
  )
}
