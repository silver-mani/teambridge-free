import { useEffect, useMemo, useRef, useState } from 'react'
import { Eyebrow }             from '../../../src/components/Eyebrow/Eyebrow.tsx'
import { StatusTag }           from '../../../src/components/StatusTag/StatusTag.tsx'
import { Button }              from '../../../src/components/Button/Button.tsx'
import { AILoader }            from '../../../src/components/ai/AILoader/AILoader.tsx'
import { TeambridgeAIIcon }    from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ArrowNarrowRightIcon }from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { CheckIcon }           from '../../../src/components/icons/CheckIcon.tsx'
import { EyeIcon }             from '../../../src/components/icons/EyeIcon.tsx'
import { AlertTriangleIcon }   from '../../../src/components/icons/AlertTriangleIcon.tsx'
import { Home02Icon }          from '../../../src/components/icons/Home02Icon.tsx'
import { Grid01Icon }          from '../../../src/components/icons/Grid01Icon.tsx'
import { ClipboardCheckIcon }  from '../../../src/components/icons/ClipboardCheckIcon.tsx'
import { Users03Icon }         from '../../../src/components/icons/Users03Icon.tsx'
import { GitBranch01Icon }     from '../../../src/components/icons/GitBranch01Icon.tsx'
import { MessageDotsSquareIcon } from '../../../src/components/icons/MessageDotsSquareIcon.tsx'
import { Microphone02Icon }    from '../../../src/components/icons/Microphone02Icon.tsx'
import { Mail01Icon }          from '../../../src/components/icons/Mail01Icon.tsx'
import { XIcon }               from '../../../src/components/icons/XIcon.tsx'
import { getIndustryData }     from '../data/industryData.js'
import { getAgent }            from '../data/agents.js'
import { getCardDetail }       from '../data/cardDetails.js'
import './act1.css'

/* ─── Agent avatar (animated GIF in a color-tinted ring) ─────────────────── */

function AgentAvatar({ agent, size = 32 }) {
  return (
    <span
      className={`agent-avatar agent-avatar-${agent.color}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${agent.avatar})`,
      }}
      aria-label={agent.name}
      role="img"
    />
  )
}

function AgentHeader({ agent, task, size = 32 }) {
  return (
    <div className="agent-header">
      <AgentAvatar agent={agent} size={size} />
      <div className="agent-header-text">
        <span className="agent-header-role">
          {agent.role}
          <span className="agent-header-sep" aria-hidden="true">·</span>
          <span className="agent-header-task">{task}</span>
        </span>
        <span className="agent-header-name">{agent.name}</span>
      </div>
    </div>
  )
}

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

function ActivityCard({ card, emphasis = 'normal', onClick, selected = false, dimmed = false }) {
  const meta = STATUS_MAP[card.status] ?? STATUS_MAP.resolved
  const { Icon, tagStatus } = meta
  const agent = card.agentId ? getAgent(card.agentId) : null
  const isActive    = emphasis === 'active' || emphasis === 'selected-active'
  const interactive = typeof onClick === 'function'

  const inner = (
    <>
      <div className="activity-card-head">
        {agent && <AgentHeader agent={agent} task={card.agentTask} />}
        <div className="activity-card-status">
          <span className={`activity-card-iconwrap activity-card-iconwrap-${meta.color}`} aria-hidden="true">
            {card.status === 'in-progress'
              ? <AILoader size="sm" variant="gradient" />
              : <Icon size={14} />}
          </span>
          <StatusTag status={tagStatus} size="sm" dot={false}>{card.statusLabel}</StatusTag>
          <span className="activity-card-dot" aria-hidden="true">·</span>
          <span className="activity-card-time">{card.timestamp}</span>
          {isActive && <span className="activity-card-pulse" aria-hidden="true" />}
        </div>
      </div>

      <div className="activity-card-body">
        <h3 className="activity-card-title">{card.title}</h3>
        <p  className="activity-card-desc">{card.description}</p>
      </div>

      {isActive && !selected && (
        <div className="activity-card-cta" aria-hidden="true">
          Click to see how Teambridge is resolving this
          <ArrowNarrowRightIcon size={16} />
        </div>
      )}
    </>
  )

  const className = [
    'activity-card',
    isActive  && 'activity-card-active',
    selected  && 'activity-card-selected',
    dimmed    && 'activity-card-dimmed',
  ].filter(Boolean).join(' ')

  return interactive ? (
    <button type="button" className={className} onClick={onClick} aria-pressed={selected}>{inner}</button>
  ) : (
    <div className={className}>{inner}</div>
  )
}

/* ─── Zone 1: Needs your attention ───────────────────────────────────────── */

function NeedsCard({ card, state, selected = false, onSelect, onApprove, onReject }) {
  const resolving = state === 'resolving'
  const resolved  = state === 'resolved'
  const agent     = card.agentId ? getAgent(card.agentId) : null

  if (resolved) {
    return (
      <article className="needs-card needs-card-resolved">
        <div className="activity-card-head">
          {agent && <AgentHeader agent={agent} task={card.agentTask} />}
          <div className="activity-card-status">
            <span className="activity-card-iconwrap activity-card-iconwrap-success" aria-hidden="true">
              <CheckIcon size={14} />
            </span>
            <StatusTag status="success" size="sm" dot={false}>Resolved</StatusTag>
            <span className="activity-card-dot" aria-hidden="true">·</span>
            <span className="activity-card-time">Just now</span>
          </div>
        </div>
        <div className="activity-card-body">
          <h3 className="activity-card-title">{card.resolvedTitle}</h3>
          <p  className="activity-card-desc">{card.resolvedDescription}</p>
        </div>
      </article>
    )
  }

  const stopAndCall = (fn) => (e) => { e.stopPropagation(); fn?.() }

  return (
    <article
      className={`needs-card ${resolving ? 'needs-card-resolving' : ''} ${selected ? 'needs-card-selected' : ''}`}
      onClick={resolving ? undefined : onSelect}
      role="button"
      tabIndex={resolving ? -1 : 0}
      aria-pressed={selected}
      onKeyDown={(e) => {
        if (resolving) return
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.() }
      }}
    >
      <div className="needs-card-head-row">
        {agent && <AgentHeader agent={agent} task={card.agentTask} />}
        <div className="needs-card-meta">
          <StatusTag status="warning" size="sm" dot={false}>Needs approval</StatusTag>
          <span className="activity-card-dot" aria-hidden="true">·</span>
          <span className="activity-card-time">{card.timestamp}</span>
        </div>
      </div>

      <h3 className="needs-card-title">{card.title}</h3>
      <p  className="needs-card-summary">{card.summary}</p>

      <div className="needs-card-actions">
        <Button variant="primary" size="sm" onClick={stopAndCall(onApprove)} disabled={resolving}>
          {resolving ? 'Resolving...' : 'Approve'}
        </Button>
        <Button variant="tertiary" size="sm" onClick={stopAndCall(onSelect)} disabled={resolving}>
          View reasoning
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leadingArtwork={<XIcon size={14} />}
          onClick={stopAndCall(onReject)}
          disabled={resolving}
        >
          Reject
        </Button>
      </div>
    </article>
  )
}

/* ─── Step items (used by AnimatedSteps inside the detail panel) ─────────── */

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


/* ─── Detail panel — communications rendering ────────────────────────────── */

const COMM_TYPE_META = {
  sms:   { Icon: MessageDotsSquareIcon, label: 'SMS' },
  call:  { Icon: Microphone02Icon,      label: 'AI Call' },
  email: { Icon: Mail01Icon,            label: 'Email' },
}

function SmsThread({ comm }) {
  return (
    <div className="comm-body comm-body-sms">
      {comm.messages.map((m, i) => (
        <div key={i} className={`sms-bubble sms-bubble-${m.from}`}>
          <p className="sms-bubble-text">{m.text}</p>
          <span className="sms-bubble-time">{m.time}</span>
        </div>
      ))}
    </div>
  )
}

function CallBody({ comm }) {
  return (
    <div className="comm-body comm-body-call">
      <div className="call-summary">
        <span className="call-summary-duration">{comm.duration}</span>
        <span className="call-summary-sep" aria-hidden="true">·</span>
        <span className="call-summary-outcome">{comm.outcome}</span>
      </div>
      {comm.transcript?.length > 0 && (
        <div className="call-transcript">
          {comm.transcript.map((t, i) => (
            <div key={i} className={`call-line call-line-${t.speaker}`}>
              <span className="call-line-speaker">{t.speaker === 'agent' ? 'Teambridge' : comm.contact}</span>
              <span className="call-line-time">{t.time}</span>
              <p className="call-line-text">{t.text}</p>
            </div>
          ))}
        </div>
      )}
      {comm.summary && <p className="call-summary-note">{comm.summary}</p>}
    </div>
  )
}

function EmailBody({ comm }) {
  return (
    <div className="comm-body comm-body-email">
      <div className="email-meta">
        <span className="email-meta-label">To</span>
        <span className="email-meta-value">{comm.to}</span>
      </div>
      <div className="email-subject">{comm.subject}</div>
      <pre className="email-body-text">{comm.body}</pre>
    </div>
  )
}

function Communication({ comm }) {
  const meta = COMM_TYPE_META[comm.type] ?? COMM_TYPE_META.sms
  const { Icon, label } = meta

  return (
    <div className={`comm comm-${comm.type}`}>
      <div className="comm-head">
        <span className={`comm-icon comm-icon-${comm.type}`} aria-hidden="true">
          <Icon size={14} />
        </span>
        <span className="comm-type">{label}</span>
        <span className="comm-dot" aria-hidden="true">·</span>
        <span className="comm-contact">{comm.contact}</span>
        {comm.phone && (
          <>
            <span className="comm-dot" aria-hidden="true">·</span>
            <span className="comm-phone">{comm.phone}</span>
          </>
        )}
        {comm.status && (
          <span className={`comm-status comm-status-${comm.status}`}>{comm.status.replace(/-/g, ' ')}</span>
        )}
      </div>
      {comm.note && <p className="comm-note">{comm.note}</p>}

      {comm.type === 'sms'   && <SmsThread comm={comm} />}
      {comm.type === 'call'  && <CallBody  comm={comm} />}
      {comm.type === 'email' && <EmailBody comm={comm} />}
    </div>
  )
}

/* ─── Detail panel — reasoning timelines ─────────────────────────────────── */

function StaticTimeline({ items }) {
  return (
    <ol className="detail-timeline">
      {items.map((it, i) => (
        <li key={i} className="detail-timeline-item">
          <span className="detail-timeline-icon" aria-hidden="true">
            <CheckIcon size={12} />
          </span>
          <div className="detail-timeline-body">
            <div className="detail-timeline-head">
              <span className="detail-timeline-title">{it.title}</span>
              <span className="detail-timeline-time">{it.time}</span>
            </div>
            {it.detail && <p className="detail-timeline-detail">{it.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}

/* Animated playback for the Marcus active card — wraps the existing StepItem
   pipeline used by the old DrillInPanel, so we keep the wow-moment cadence. */
function AnimatedSteps({ steps, onResolved }) {
  const [activeIdx, setActiveIdx]  = useState(0)
  const [resolved, setResolved]    = useState(false)
  const timersRef = useRef([])

  const winnerName = useMemo(() => {
    const matchesStep = steps.find(s => s.kind === 'matches')
    return matchesStep?.matches?.find(m => m.winner)?.name ?? ''
  }, [steps])

  useEffect(() => {
    setActiveIdx(0)
    setResolved(false)
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    let cumulative = 0
    steps.forEach((step, i) => {
      cumulative += step.delay ?? 2000
      if (i === 0) return
      timersRef.current.push(setTimeout(() => setActiveIdx(i), cumulative))
    })
    const resolvedAt = cumulative + 800
    timersRef.current.push(setTimeout(() => { setResolved(true); onResolved?.() }, resolvedAt))

    return () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }
  }, [steps, onResolved])

  return (
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
  )
}

/* ─── Detail panel ───────────────────────────────────────────────────────── */

function CardDetailPanel({ card, detail, onClose, onExplore }) {
  const agent = card.agentId ? getAgent(card.agentId) : null
  const [animationDone, setAnimationDone] = useState(false)

  return (
    <aside className="detail-panel" aria-label="Card detail">
      <header className="detail-panel-head">
        {agent && <AgentHeader agent={agent} task={card.agentTask} size={36} />}
        <button type="button" className="detail-panel-close" onClick={onClose} aria-label="Close detail">
          <XIcon size={16} />
        </button>
      </header>

      <div className="detail-panel-body">
        <div className="detail-panel-summary">
          <h2 className="detail-panel-title">{card.title}</h2>
          {card.description && <p className="detail-panel-desc">{card.description}</p>}
          {card.summary && <p className="detail-panel-desc">{card.summary}</p>}
        </div>

        <section className="detail-section">
          <h3 className="detail-section-title">Reasoning</h3>
          {detail.mode === 'animated' ? (
            <AnimatedSteps steps={detail.steps} onResolved={() => setAnimationDone(true)} />
          ) : (
            <StaticTimeline items={detail.timeline} />
          )}
        </section>

        {detail.communications?.length > 0 && (
          <section className="detail-section">
            <h3 className="detail-section-title">Communications</h3>
            <div className="comm-list">
              {detail.communications.map((comm, i) => <Communication key={i} comm={comm} />)}
            </div>
          </section>
        )}

        {detail.outcome && (
          <section className="detail-section">
            <h3 className="detail-section-title">Outcome</h3>
            <div className="detail-outcome">
              <div className="detail-outcome-title">{detail.outcome.title}</div>
              {detail.outcome.description && <p className="detail-outcome-desc">{detail.outcome.description}</p>}
              {detail.outcome.metrics?.length > 0 && (
                <div className="detail-outcome-metrics">
                  {detail.outcome.metrics.map((m, i) => (
                    <div key={i} className="detail-outcome-metric">
                      <div className="detail-outcome-metric-value">{m.value}</div>
                      <div className="detail-outcome-metric-label">{m.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {detail.mode === 'animated' && animationDone && detail.kicker && (
          <div className="detail-kicker">
            <p className="kicker-text">{detail.kicker}</p>
            <Button
              variant="primary"
              size="lg"
              trailingArtwork={<ArrowNarrowRightIcon size={18} />}
              onClick={onExplore}
            >
              Want to see what else Teambridge can do?
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}

/* ─── Overview (list view) ───────────────────────────────────────────────── */

function Overview({ data, selectedCardId, onSelect }) {
  return (
    <div className="overview">
      <MissionBriefing mission={data.mission} industryLabel={data.label} />
      <NeedsZoneWithSelect cards={data.needsYou} selectedCardId={selectedCardId} onSelect={onSelect} />
      <HandlingZoneWithSelect data={data} selectedCardId={selectedCardId} onSelect={onSelect} />
    </div>
  )
}

function HandlingZoneWithSelect({ data, selectedCardId, onSelect }) {
  const isActiveSelected = selectedCardId === data.activeCard.id
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
        <ActivityCard
          card={data.activeCard}
          emphasis={isActiveSelected ? 'selected-active' : 'active'}
          selected={isActiveSelected}
          onClick={() => onSelect(data.activeCard.id)}
        />
        {data.feed.map(card => (
          <ActivityCard
            key={card.id}
            card={card}
            selected={selectedCardId === card.id}
            onClick={() => onSelect(card.id)}
          />
        ))}
      </div>
    </section>
  )
}

function NeedsZoneWithSelect({ cards, selectedCardId, onSelect }) {
  const [states, setStates] = useState(() =>
    cards.reduce((acc, c) => { acc[c.id] = 'pending'; return acc }, {})
  )

  const approve = id => {
    setStates(prev => ({ ...prev, [id]: 'resolving' }))
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
        Teambridge has prepared recommendations. Click a card to review the full agent reasoning, or approve directly.
      </p>
      <div className="needs-list">
        {cards.map(card => (
          <NeedsCard
            key={card.id}
            card={card}
            state={states[card.id]}
            selected={selectedCardId === card.id}
            onSelect={()   => onSelect(card.id)}
            onApprove={()  => approve(card.id)}
            onReject={()   => reject(card.id)}
          />
        ))}
      </div>
    </section>
  )
}

/* ─── Screen root ────────────────────────────────────────────────────────── */

export default function Act1Dashboard({ industryId, onBack, onExplore }) {
  const data = useMemo(() => getIndustryData(industryId), [industryId])
  const [selectedCardId, setSelectedCardId] = useState(null)

  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null
    if (data.activeCard.id === selectedCardId) return data.activeCard
    const fromFeed  = data.feed.find(c => c.id === selectedCardId)
    if (fromFeed) return fromFeed
    const fromNeeds = data.needsYou.find(c => c.id === selectedCardId)
    if (fromNeeds) return fromNeeds
    return null
  }, [selectedCardId, data])

  const detail = useMemo(
    () => selectedCard ? getCardDetail(selectedCard, data) : null,
    [selectedCard, data],
  )

  const hasSelection = !!selectedCard

  return (
    <div className="act1-root">
      <LeftNav
        industryLabel={data.label}
        onBrand={onBack}
        onAsk={onExplore}
      />

      <main className="act1-main">
        <div className={`act1-content ${hasSelection ? 'act1-content-split' : ''}`}>
          <div className="act1-list">
            <Overview
              data={data}
              selectedCardId={selectedCardId}
              onSelect={setSelectedCardId}
            />
          </div>
          {hasSelection && detail && (
            <CardDetailPanel
              card={selectedCard}
              detail={detail}
              onClose={() => setSelectedCardId(null)}
              onExplore={onExplore}
            />
          )}
        </div>
      </main>
    </div>
  )
}
