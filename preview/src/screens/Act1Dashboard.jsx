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
import { ChevronDownIcon }     from '../../../src/components/icons/ChevronDownIcon.tsx'
import { Home02Icon }          from '../../../src/components/icons/Home02Icon.tsx'
import { Grid01Icon }          from '../../../src/components/icons/Grid01Icon.tsx'
import { ClipboardCheckIcon }  from '../../../src/components/icons/ClipboardCheckIcon.tsx'
import { Users03Icon }         from '../../../src/components/icons/Users03Icon.tsx'
import { GitBranch01Icon }     from '../../../src/components/icons/GitBranch01Icon.tsx'
import { MessageDotsSquareIcon } from '../../../src/components/icons/MessageDotsSquareIcon.tsx'
import { XIcon }               from '../../../src/components/icons/XIcon.tsx'
import { getIndustryData }     from '../data/industryData.js'
import './act1.css'

/* Map feed-card "status" values to Alloy StatusTag status + a small icon.  */
const STATUS_MAP = {
  'in-progress': { tagStatus: 'warning', Icon: AILoader,         color: 'warning' },
  'resolved':    { tagStatus: 'success', Icon: CheckIcon,        color: 'success' },
  'monitoring':  { tagStatus: 'info',    Icon: EyeIcon,          color: 'info'    },
  'watching':    { tagStatus: 'warning', Icon: AlertTriangleIcon,color: 'warning' },
  'sent':        { tagStatus: 'neutral', Icon: ArrowNarrowRightIcon, color: 'neutral' },
}

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

/* ─── Left nav ────────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { id: 'overview',      label: 'Overview',        Icon: Home02Icon        },
  { id: 'schedule',      label: 'Schedule',        Icon: Grid01Icon        },
  { id: 'time',          label: 'Time & Attendance', Icon: ClipboardCheckIcon },
  { id: 'people',        label: 'People',          Icon: Users03Icon       },
  { id: 'workflows',     label: 'Agent Workflows', Icon: GitBranch01Icon   },
  { id: 'ask',           label: 'Ask Teambridge',  Icon: MessageDotsSquareIcon, ai: true },
]

function LeftNav({ industryLabel, onBrand, onAsk }) {
  return (
    <aside className="act1-nav" aria-label="Primary">
      <button
        type="button"
        className="act1-nav-brand"
        onClick={onBrand}
        aria-label="Change industry"
      >
        <span className="act1-nav-brandmark">
          <TeambridgeAIIcon size={16} />
        </span>
        <span className="act1-nav-brandtext">
          <span className="act1-nav-brandname">Teambridge</span>
          <span className="act1-nav-brandindustry">{industryLabel}</span>
        </span>
      </button>

      <nav className="act1-nav-list">
        {NAV_ITEMS.map(item => {
          const active = item.id === 'overview'
          const onClick = item.id === 'ask' ? onAsk : undefined
          return (
            <button
              key={item.id}
              type="button"
              className={`act1-nav-item ${active ? 'act1-nav-item-active' : ''} ${item.ai ? 'act1-nav-item-ai' : ''}`}
              onClick={onClick}
              aria-current={active ? 'page' : undefined}
            >
              <span className="act1-nav-icon" aria-hidden="true">
                <item.Icon size={18} />
              </span>
              <span className="act1-nav-label">{item.label}</span>
              {item.ai && (
                <span className="act1-nav-ai-badge" aria-hidden="true">
                  <TeambridgeAIIcon size={12} />
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="act1-nav-foot">
        <span className="act1-nav-foot-date">{formatToday()}</span>
      </div>
    </aside>
  )
}

/* ─── Mission briefing ────────────────────────────────────────────────────── */

function MissionBriefing({ mission, industryLabel }) {
  return (
    <section className="mission">
      <div className="mission-head">
        <Eyebrow style={{ color: 'var(--color-content-tertiary)' }}>
          {industryLabel} · Mission briefing
        </Eyebrow>
        <h1 className="mission-headline">{mission.headline}</h1>
      </div>
      <div className="mission-stats">
        {mission.stats.map(s => (
          <div key={s.label} className={`mission-stat mission-stat-${s.tone}`}>
            <div className="mission-stat-value">{s.value}</div>
            <div className="mission-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Activity card (used in Zone 2 + drill-in) ──────────────────────────── */

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

/* ─── Zone 1: Needs your attention ───────────────────────────────────────── */

function NeedsCard({ card, expanded, onToggle, onApprove, onReject, state }) {
  const resolving = state === 'resolving'
  const resolved  = state === 'resolved'

  if (resolved) {
    return (
      <article className="needs-card needs-card-resolved">
        <div className="activity-card-row">
          <span className="activity-card-iconwrap activity-card-iconwrap-success" aria-hidden="true">
            <CheckIcon size={16} />
          </span>
          <StatusTag status="success" size="sm" dot={false}>Resolved</StatusTag>
          <span className="activity-card-dot" aria-hidden="true">·</span>
          <span className="activity-card-time">Just now</span>
        </div>
        <h3 className="activity-card-title">{card.resolvedTitle}</h3>
        <p  className="activity-card-desc">{card.resolvedDescription}</p>
      </article>
    )
  }

  return (
    <article className={`needs-card ${expanded ? 'needs-card-expanded' : ''} ${resolving ? 'needs-card-resolving' : ''}`}>
      <button
        type="button"
        className="needs-card-head"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="needs-card-meta">
          <span className="needs-card-iconwrap" aria-hidden="true">
            <TeambridgeAIIcon size={14} />
          </span>
          <StatusTag status="warning" size="sm" dot={false}>Needs approval</StatusTag>
          <span className="activity-card-dot" aria-hidden="true">·</span>
          <span className="activity-card-time">{card.timestamp}</span>
        </div>
        <span className="needs-card-chevron" aria-hidden="true">
          <ChevronDownIcon size={16} />
        </span>
      </button>

      <h3 className="needs-card-title">{card.title}</h3>
      <p  className="needs-card-summary">{card.summary}</p>

      {expanded && (
        <div className="needs-card-detail">
          <div className="needs-card-reasoning-head">
            <span className="needs-card-reasoning-mark" aria-hidden="true">
              <TeambridgeAIIcon size={12} />
            </span>
            <span>Teambridge reasoning</span>
          </div>
          <ul className="needs-card-reasoning">
            {card.reasoning.map((line, i) => (
              <li key={i}>
                <span className="needs-card-reasoning-check" aria-hidden="true">
                  <CheckIcon size={12} />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="needs-card-recommendation">
            <span className="needs-card-recommendation-label">Recommended</span>
            <span>{card.recommendation}</span>
          </div>
        </div>
      )}

      <div className="needs-card-actions">
        <Button variant="primary" size="sm" onClick={onApprove} disabled={resolving}>
          {resolving ? 'Resolving...' : 'Approve'}
        </Button>
        <Button variant="tertiary" size="sm" onClick={onToggle} disabled={resolving}>
          {expanded ? 'Hide reasoning' : 'Adjust'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leadingArtwork={<XIcon size={14} />}
          onClick={onReject}
          disabled={resolving}
        >
          Reject
        </Button>
      </div>
    </article>
  )
}

function NeedsZone({ cards, onEmptied }) {
  const [expandedId, setExpandedId] = useState(null)
  const [states, setStates] = useState(() =>
    cards.reduce((acc, c) => { acc[c.id] = 'pending'; return acc }, {})
  )

  useEffect(() => {
    if (cards.every(c => states[c.id] === 'resolved') && cards.length > 0) {
      const t = setTimeout(() => onEmptied?.(), 1200)
      return () => clearTimeout(t)
    }
  }, [states, cards, onEmptied])

  const approve = id => {
    setStates(prev => ({ ...prev, [id]: 'resolving' }))
    setExpandedId(prev => prev === id ? null : prev)
    setTimeout(() => {
      setStates(prev => ({ ...prev, [id]: 'resolved' }))
    }, 1400)
  }

  const reject = id => {
    setStates(prev => ({ ...prev, [id]: 'resolved' }))
  }

  const remaining = cards.filter(c => states[c.id] !== 'resolved').length

  return (
    <section className="zone zone-needs">
      <div className="zone-head">
        <h2 className="zone-title">Needs your attention</h2>
        <span className="zone-count">{remaining} waiting</span>
      </div>
      <p className="zone-sub">
        Teambridge has prepared recommendations. Approve to execute, or expand to review the reasoning.
      </p>
      <div className="needs-list">
        {cards.map(card => (
          <NeedsCard
            key={card.id}
            card={card}
            state={states[card.id]}
            expanded={expandedId === card.id && states[card.id] === 'pending'}
            onToggle={() =>
              setExpandedId(prev => prev === card.id ? null : card.id)
            }
            onApprove={() => approve(card.id)}
            onReject={()  => reject(card.id)}
          />
        ))}
      </div>
    </section>
  )
}

/* ─── Zone 2: Teambridge is handling ─────────────────────────────────────── */

function HandlingZone({ data, onActivate }) {
  return (
    <section className="zone zone-handling">
      <div className="zone-head">
        <h2 className="zone-title">Teambridge is handling</h2>
        <span className="zone-count">{1 + data.feed.length} active</span>
      </div>
      <p className="zone-sub">
        Running automatically in the background. Open any card to see how it was resolved.
      </p>

      <div className="feed">
        <ActivityCard card={data.activeCard} emphasis="active" onClick={onActivate} />
        {data.feed.map(card => (
          <ActivityCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  )
}

/* ─── Drill-in (reasoning for Marcus cancellation) ───────────────────────── */

function StepItem({ step, state, winnerName }) {
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

/* ─── Overview (default phase) ───────────────────────────────────────────── */

function Overview({ data, onActivate }) {
  return (
    <div className="overview">
      <MissionBriefing mission={data.mission} industryLabel={data.label} />
      <NeedsZone cards={data.needsYou} />
      <HandlingZone data={data} onActivate={onActivate} />
    </div>
  )
}

/* ─── Screen root ────────────────────────────────────────────────────────── */

export default function Act1Dashboard({ industryId, onBack, onExplore }) {
  const data = useMemo(() => getIndustryData(industryId), [industryId])
  const [phase, setPhase] = useState('overview')

  return (
    <div className="act1-root">
      <LeftNav
        industryLabel={data.label}
        onBrand={onBack}
        onAsk={onExplore}
      />

      <main className="act1-main">
        <div className="act1-content">
          {phase === 'overview' ? (
            <Overview data={data} onActivate={() => setPhase('drill-in')} />
          ) : (
            <DrillInPanel
              data={data}
              onExplore={onExplore}
              onBack={() => setPhase('overview')}
            />
          )}
        </div>
      </main>
    </div>
  )
}
