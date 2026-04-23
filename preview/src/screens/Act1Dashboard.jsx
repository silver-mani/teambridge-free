import { useEffect, useMemo, useRef, useState } from 'react'
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
import { SearchSmIcon }        from '../../../src/components/icons/SearchSmIcon.tsx'
import { Microphone02Icon }    from '../../../src/components/icons/Microphone02Icon.tsx'
import { Mail01Icon }          from '../../../src/components/icons/Mail01Icon.tsx'
import { XIcon }               from '../../../src/components/icons/XIcon.tsx'
import { getIndustryData }     from '../data/industryData.js'
import { getAgent, AGENTS }   from '../data/agents.js'
import { getCardDetail }       from '../data/cardDetails.js'
import ScheduleCalendar        from './ScheduleCalendar.jsx'
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

/* ─── Demo-only toast: signals dead links without navigating away ────────── */
const DEMO_TOAST_EVENT = 'teambridge:demo-toast'
function showDemoToast(message = 'This action is available in the full Teambridge product.') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(DEMO_TOAST_EVENT, { detail: message }))
}

function ToastHost() {
  const [toast, setToast] = useState(null)
  useEffect(() => {
    const onMsg = (e) => setToast({ id: Date.now(), text: e.detail })
    window.addEventListener(DEMO_TOAST_EVENT, onMsg)
    return () => window.removeEventListener(DEMO_TOAST_EVENT, onMsg)
  }, [])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])
  if (!toast) return null
  return (
    <div key={toast.id} className="demo-toast" role="status" aria-live="polite">
      {toast.text}
    </div>
  )
}

function AgentHeader({ agent, task, size = 28 }) {
  return (
    <div className="agent-header">
      <AgentAvatar agent={agent} size={size} />
      <span className="agent-header-role">
        {agent.role}
        {task && <><span className="agent-header-sep" aria-hidden="true">·</span><span className="agent-header-task">{task}</span></>}
      </span>
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

function LeftNav({ industryLabel, view, onBrand, onAsk, onSelectView }) {
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
          const active = item.id === view || (item.id === 'overview' && view === 'overview')
          const onClick =
              item.id === 'ask'      ? onAsk
            : item.id === 'overview' ? () => onSelectView?.('overview')
            : item.id === 'schedule' ? () => onSelectView?.('schedule')
            : () => showDemoToast()
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

function WelcomeHeader({ name = 'Alex' }) {
  return (
    <section className="welcome">
      <h1 className="welcome-headline">Welcome back, {name}.</h1>
    </section>
  )
}

/* ─── Subject header + agent footer (subject-first cards) ────────────────── */

const SUBJECT_ICON_META = {
  swap:  { color: 'blue',   glyph: '⇄' },
  alert: { color: 'orange', glyph: '!' },
  clock: { color: 'purple', glyph: '⏱' },
  bell:  { color: 'matcha', glyph: '🔔' },
}

function SubjectImage({ subject, size = 56 }) {
  const { kind, image, images, imageKind, icon, badge } = subject
  const radius = kind === 'person' || imageKind === 'round' ? '50%' : 'var(--radius-md)'

  if (kind === 'pair' && images?.length >= 2) {
    const slot = size * 0.72
    const containerWidth = slot * 1.6  /* two slots with slight overlap */
    return (
      <span className="subject-image subject-image-pair" style={{ height: size, width: containerWidth }} aria-hidden="true">
        <span
          className="subject-image-pair-slot subject-image-pair-slot-a"
          style={{ width: slot, height: slot, backgroundImage: `url(${images[0]})` }}
        />
        <span
          className="subject-image-pair-slot subject-image-pair-slot-b"
          style={{ width: slot, height: slot, backgroundImage: `url(${images[1]})` }}
        />
      </span>
    )
  }

  if (kind === 'group' && images?.length > 0) {
    const slot = size * 0.7
    const overlap = slot * 0.4
    const count = Math.min(images.length, 3)
    const containerWidth = slot + (count - 1) * (slot - overlap)
    return (
      <span className="subject-image subject-image-group" style={{ height: size, width: containerWidth }} aria-hidden="true">
        {images.slice(0, 3).map((src, i) => (
          <span
            key={i}
            className="subject-image-group-slot"
            style={{
              width: slot,
              height: slot,
              marginLeft: i === 0 ? 0 : -overlap,
              backgroundImage: `url(${src})`,
              zIndex: images.length - i,
            }}
          />
        ))}
      </span>
    )
  }

  const style = { width: size, height: size, borderRadius: radius }

  if (image) {
    return (
      <span
        className={`subject-image subject-image-${kind}`}
        style={{ ...style, backgroundImage: `url(${image})` }}
        role="img"
        aria-label={subject.primary}
      />
    )
  }

  if (icon && SUBJECT_ICON_META[icon]) {
    const { color, glyph } = SUBJECT_ICON_META[icon]
    return (
      <span
        className={`subject-image subject-image-icon subject-image-icon-${color}`}
        style={style}
        aria-hidden="true"
      >{glyph}</span>
    )
  }

  if (badge) {
    return (
      <span
        className={`subject-image subject-image-badge subject-image-badge-${badge.color || 'slate'}`}
        style={style}
        aria-hidden="true"
      >{badge.text}</span>
    )
  }

  return <span className="subject-image subject-image-empty" style={style} aria-hidden="true" />
}

function SubjectHeader({ subject }) {
  return (
    <div className="subject-header">
      <SubjectImage subject={subject} />
      <div className="subject-header-text">
        <span className="subject-header-primary">{subject.primary}</span>
        {subject.secondary && <span className="subject-header-secondary">{subject.secondary}</span>}
        {subject.metric && <span className="subject-header-metric">{subject.metric}</span>}
      </div>
    </div>
  )
}

function AgentFooter({ agent, task, rightNode }) {
  return (
    <div className="agent-footer">
      <AgentAvatar agent={agent} size={20} />
      <span className="agent-footer-role">{agent.role}</span>
      {task && (
        <>
          <span className="agent-footer-sep" aria-hidden="true">·</span>
          <span className="agent-footer-task">{task}</span>
        </>
      )}
      {rightNode && <span className="agent-footer-right">{rightNode}</span>}
    </div>
  )
}

/* ─── Standardized card header row (eyebrow + right-aligned status) ──────── */

function CardHeaderRow({ eyebrow, statusBadge, timestamp }) {
  return (
    <div className="card-eyebrow-row">
      <div className="card-eyebrow-left">
        {eyebrow && <span className="card-eyebrow">{eyebrow}</span>}
        {statusBadge && <span className="card-eyebrow-status">{statusBadge}</span>}
      </div>
      {timestamp && <span className="card-time">{timestamp}</span>}
    </div>
  )
}

/* ─── Activity card (used in Zone 2 + drill-in) ──────────────────────────── */

function ActivityCard({ card, expanded = false, onToggle, dimmed = false }) {
  const meta = STATUS_MAP[card.status] ?? STATUS_MAP.resolved
  const agent = card.agentId ? getAgent(card.agentId) : null
  const pulsing = card.status === 'in-progress'

  const summary       = card.record?.summary
  const dataChanges   = card.record?.dataChanges
  const conversations = card.record?.conversations
  const workflow      = card.record?.workflow
  const expandable = (
    (!!dataChanges?.length || !!conversations?.length || !!workflow)
    && typeof onToggle === 'function'
  )
  const showBody = expandable && expanded

  const headline = summary?.headline ?? card.description ?? card.subject?.secondary ?? card.title
  const actorLabel = agent?.name ?? null

  const inner = (
    <div className="activity-card-compact-oneline">
      {agent ? (
        <span
          className={`activity-card-compact-main-avatar agent-avatar-${agent.color}`}
          style={{ backgroundImage: `url(${agent.avatar})` }}
          aria-label={agent.name}
        />
      ) : card.subject ? (
        <SubjectImage subject={card.subject} size={24} />
      ) : null}
      <p className="activity-card-compact-headline">
        {actorLabel && (
          <span className="activity-card-compact-actor">{actorLabel}</span>
        )}
        {actorLabel && <span> </span>}
        <span>{headline}</span>
      </p>
      <div className="activity-card-compact-right">
        {card.statusLabel && (
          <StatusTag status={meta.tagStatus} size="sm" dot={false}>{card.statusLabel}</StatusTag>
        )}
        <span className="activity-card-compact-time">{card.timestamp}</span>
        {pulsing && <span className="activity-card-pulse" aria-hidden="true" />}
      </div>
    </div>
  )

  const className = [
    'activity-card',
    'activity-card-compact-wrap',
    expandable && 'activity-card-expandable',
    showBody   && 'activity-card-open',
    dimmed     && 'activity-card-dimmed',
  ].filter(Boolean).join(' ')

  if (!expandable) {
    return <div className={className}>{inner}</div>
  }

  return (
    <div className={className}>
      <button
        type="button"
        className="activity-card-trigger"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        {inner}
      </button>
      {showBody && (
        <div className="activity-card-body">
          {!!dataChanges?.length   && <DataChangeBlock changes={dataChanges} />}
          {!!conversations?.length && <ConversationsBlock conversations={conversations} />}
          {workflow                && <WorkflowLink workflow={workflow} />}
          {summary                 && <OutcomeSummary summary={summary} />}
        </div>
      )}
    </div>
  )
}

/* ─── Data-change diff block ─────────────────────────────────────────────── */
function DataChangeBlock({ changes }) {
  return (
    <section className="card-body-section">
      <h4 className="body-section-label">Data change</h4>
      <div className="data-change-rows">
        {changes.map((c, i) => (
          <div key={i} className="data-change-row">
            <div className="data-change-field">{c.field}</div>
            <div className="data-change-diff">
              <DataChangeChip node={c.before} tone="before" />
              <span className="data-change-arrow" aria-hidden="true">→</span>
              <DataChangeChip node={c.after} tone="after" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function DataChangeChip({ node, tone }) {
  return (
    <span className={`data-change-chip data-change-chip-${tone}`}>
      {node.avatar && <span className="data-change-chip-avatar" style={{ backgroundImage: `url(${node.avatar})` }} />}
      <span>{node.name ?? node.value}</span>
    </span>
  )
}

/* ─── Conversations block (pills + inline expansion) ─────────────────────── */
function ConversationsBlock({ conversations }) {
  const [openId, setOpenId] = useState(null)
  return (
    <section className="card-body-section">
      <h4 className="body-section-label">Conversations</h4>
      <div className="conversation-items">
        {conversations.map(c => {
          const M = COMM_TYPE_META[c.kind] ?? COMM_TYPE_META.sms
          const isOpen = c.id === openId
          return (
            <div key={c.id} className={`conversation-item ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className={`conversation-pill conversation-pill-${c.kind} ${isOpen ? 'is-open' : ''}`}
                onClick={e => { e.stopPropagation(); setOpenId(isOpen ? null : c.id) }}
                aria-expanded={isOpen}
              >
                <span className={`comm-icon comm-icon-${c.kind}`} aria-hidden="true"><M.Icon size={12} /></span>
                <span className="conversation-pill-label">{c.contact}</span>
                {c.summary && <span className="conversation-pill-meta">· {c.summary}</span>}
              </button>
              {isOpen && (
                <div className="conversation-body" onClick={e => e.stopPropagation()}>
                  {c.kind === 'voice' && <VoiceCallPlayer call={c} />}
                  {c.kind === 'sms'   && <SmsThread comm={c} />}
                  {c.kind === 'email' && <EmailBody comm={c} />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ─── Voice-call player — streams ElevenLabs TTS for the scripted turns ── */
const AGENT_VOICE_ID  = 'EXAVITQu4vr4xnSDxMaL' // Bella — warm female, used for agents
const CALLER_VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel — natural female, used for workers

function voiceIdFor(turn) {
  if (turn.voiceId) return turn.voiceId
  return turn.speaker === 'agent' ? AGENT_VOICE_ID : CALLER_VOICE_ID
}

function VoiceCallPlayer({ call }) {
  const audioRef    = useRef(null)
  const cacheRef    = useRef({})          // key `${voiceId}:${text}` → blob URL
  const abortRef    = useRef(false)
  const [playing, setPlaying]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [errored, setErrored]     = useState(false)

  useEffect(() => () => {
    // Cleanup: stop audio + revoke blob URLs on unmount.
    abortRef.current = true
    audioRef.current?.pause()
    Object.values(cacheRef.current).forEach(url => URL.revokeObjectURL(url))
  }, [])

  const fetchTurn = async (turn) => {
    const voiceId = voiceIdFor(turn)
    const key = `${voiceId}:${turn.text}`
    if (cacheRef.current[key]) return cacheRef.current[key]
    const r = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: turn.text, voiceId }),
    })
    if (!r.ok) throw new Error(await r.text().catch(() => r.statusText))
    const blob = await r.blob()
    const url  = URL.createObjectURL(blob)
    cacheRef.current[key] = url
    return url
  }

  const stop = () => {
    abortRef.current = true
    const a = audioRef.current
    if (a) { a.pause(); a.currentTime = 0 }
    setPlaying(false)
    setCurrentIdx(-1)
  }

  const play = async () => {
    if (!call.turns?.length) return
    abortRef.current = false
    setErrored(false)
    setPlaying(true)
    setLoading(true)
    try {
      // Pre-fetch all turns in parallel so playback is gapless.
      const urls = await Promise.all(call.turns.map(fetchTurn))
      if (abortRef.current) return
      setLoading(false)
      for (let i = 0; i < urls.length; i++) {
        if (abortRef.current) break
        setCurrentIdx(i)
        const audio = audioRef.current
        if (!audio) break
        audio.src = urls[i]
        audio.currentTime = 0
        await new Promise((resolve) => {
          audio.onended = () => resolve()
          audio.onerror = () => resolve()
          audio.play().catch(() => resolve())
        })
      }
    } catch (e) {
      console.error('TTS error:', e)
      setErrored(true)
    } finally {
      setPlaying(false)
      setLoading(false)
      setCurrentIdx(-1)
    }
  }

  const toggle = (e) => {
    e.stopPropagation()
    if (playing) { stop() } else { play() }
  }

  return (
    <div className="voice-call">
      <audio ref={audioRef} preload="none" />
      <div className="voice-call-head">
        <button type="button" className="voice-call-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} disabled={loading && !playing}>
          {loading ? '…' : playing ? '⏸' : '▶'}
        </button>
        <div className="voice-call-meta">
          <div className="voice-call-title">
            <span>{call.contact}</span>
            {call.duration && <span className="voice-call-duration">· {call.duration}</span>}
            {loading && <span className="voice-call-mode">· loading</span>}
            {errored && <span className="voice-call-mode voice-call-mode-error">· audio unavailable</span>}
          </div>
          <div className="voice-call-progress">
            <span style={{ width: call.turns?.length ? `${((currentIdx + 1) / call.turns.length) * 100}%` : 0 }} />
          </div>
        </div>
      </div>
      {!!call.turns?.length && (
        <ol className="voice-call-transcript">
          {call.turns.map((t, i) => (
            <li key={i} className={`voice-turn voice-turn-${t.speaker} ${i === currentIdx ? 'is-speaking' : ''}`}>
              <span className="voice-turn-speaker">{t.speakerName ?? (t.speaker === 'agent' ? 'Agent' : call.contact)}</span>
              <span className="voice-turn-text">{t.text}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/* ─── Workflow link button ───────────────────────────────────────────────── */
function WorkflowLink({ workflow }) {
  return (
    <button
      type="button"
      className="workflow-link"
      onClick={e => { e.stopPropagation(); showDemoToast() }}
    >
      <span className="workflow-link-label">Open in Agent Workflows</span>
      <ArrowNarrowRightIcon size={14} />
    </button>
  )
}

/* ─── Outcome summary (existing) ─────────────────────────────────────────── */
function OutcomeSummary({ summary }) {
  return (
    <div className="activity-card-summary">
      <div className="activity-card-summary-head">
        <span className="activity-card-summary-check" aria-hidden="true">✓</span>
        <span className="activity-card-summary-title">{summary.outcome}</span>
      </div>
      <dl className="activity-card-summary-metrics">
        <div className="activity-card-summary-metric">
          <dt>Agent time</dt>
          <dd>{summary.duration}</dd>
        </div>
        <div className="activity-card-summary-metric">
          <dt>Manual</dt>
          <dd>{summary.manual}</dd>
        </div>
        <div className="activity-card-summary-metric activity-card-summary-metric-saved">
          <dt>Time saved</dt>
          <dd>{summary.saved}</dd>
        </div>
      </dl>
    </div>
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
        <CardHeaderRow
          eyebrow={card.eyebrow}
          statusBadge={<StatusTag status="success" size="sm" dot={false}>Resolved</StatusTag>}
          timestamp="Just now"
        />
        {card.subject
          ? <SubjectHeader subject={card.subject} />
          : <h3 className="needs-card-title">{card.resolvedTitle}</h3>}
        {agent && <AgentFooter agent={agent} task={card.agentTask} />}
      </article>
    )
  }

  const stopAndCall = (fn) => (e) => { e.stopPropagation(); fn?.() }
  const hasApproval = Boolean(card.reasoning || card.recommendation)

  const statusBadge = hasApproval
    ? <StatusTag status="warning" size="sm" dot={false}>Awaiting approval</StatusTag>
    : card.statusLabel
    ? <StatusTag status={STATUS_MAP[card.status]?.tagStatus ?? 'neutral'} size="sm" dot={false}>{card.statusLabel}</StatusTag>
    : null

  const actionsRight = hasApproval ? (
    <div className="needs-card-actions-inline">
      <Button variant="secondary" size="sm" onClick={stopAndCall(onApprove)} disabled={resolving}>
        {resolving ? 'Resolving...' : 'Approve'}
      </Button>
      <Button variant="ghost" size="sm" onClick={stopAndCall(onReject)} disabled={resolving}>
        Reject
      </Button>
    </div>
  ) : null

  return (
    <article
      className={`needs-card ${card.subject ? 'needs-card-subject' : ''} ${resolving ? 'needs-card-resolving' : ''} ${selected ? 'needs-card-selected' : ''}`}
      onClick={resolving ? undefined : onSelect}
      role="button"
      tabIndex={resolving ? -1 : 0}
      aria-pressed={selected}
      onKeyDown={(e) => {
        if (resolving) return
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.() }
      }}
    >
      <CardHeaderRow eyebrow={card.eyebrow} statusBadge={statusBadge} timestamp={card.timestamp} />

      {card.subject
        ? <SubjectHeader subject={card.subject} />
        : <h3 className="needs-card-title">{card.title}</h3>}

      {agent && <AgentFooter agent={agent} task={card.agentTask} rightNode={actionsRight} />}
    </article>
  )
}

/* ─── Timeline step card + inline comm accordion ─────────────────────────── */

const STEP_KIND_META = {
  dropout:      { color: 'red',    Icon: AlertTriangleIcon      },
  detect:       { color: 'blue',   Icon: EyeIcon                },
  scan:         { color: 'blue',   Icon: SearchSmIcon           },
  outreach:     { color: 'purple', Icon: ArrowNarrowRightIcon   },
  conversation: { color: 'purple', Icon: MessageDotsSquareIcon  },
  confirmed:    { color: 'matcha', Icon: CheckIcon              },
  cleared:      { color: 'matcha', Icon: CheckIcon              },
  approval:     { color: 'orange', Icon: AlertTriangleIcon      },
  monitoring:   { color: 'blue',   Icon: EyeIcon                },
  alert:        { color: 'orange', Icon: AlertTriangleIcon      },
}

const COMM_KIND_LABEL = { sms: 'Text message', call: 'AI phone call', email: 'Email' }

function StepStatusChip({ status }) {
  if (!status) return null
  if (status === 'complete') {
    return (
      <span className="timeline-step-chip timeline-step-chip-complete">
        <CheckIcon size={12} /> Complete
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="timeline-step-chip timeline-step-chip-pending">
        <AlertTriangleIcon size={12} /> Pending approval
      </span>
    )
  }
  if (status === 'in-progress') {
    return (
      <span className="timeline-step-chip timeline-step-chip-progress">
        <AILoader size="xs" variant="gradient" /> In progress
      </span>
    )
  }
  return null
}

function CommAccordion({ comm, defaultOpen }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  const typeMeta = COMM_TYPE_META[comm.type] ?? COMM_TYPE_META.sms
  const { Icon } = typeMeta
  const label = COMM_KIND_LABEL[comm.type] ?? 'Message'

  const preview = comm.type === 'sms' && comm.messages?.length
    ? `${comm.messages.length} message${comm.messages.length > 1 ? 's' : ''}`
    : comm.type === 'email' && comm.subject
    ? comm.subject
    : comm.type === 'call' && comm.duration
    ? `${comm.duration} · ${comm.outcome ?? 'call'}`
    : 'View'

  return (
    <div className={`timeline-step-comm ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="timeline-step-comm-toggle"
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        aria-expanded={open}
      >
        <span className={`comm-icon comm-icon-${comm.type}`} aria-hidden="true">
          <Icon size={14} />
        </span>
        <span className="timeline-step-comm-label">{label}</span>
        <span className="timeline-step-comm-sep" aria-hidden="true">·</span>
        <span className="timeline-step-comm-contact">{comm.contact}</span>
        <span className="timeline-step-comm-preview">{preview}</span>
        <span className={`timeline-step-comm-chevron ${open ? 'is-open' : ''}`} aria-hidden="true">⌄</span>
      </button>

      {open && (
        <div className="timeline-step-comm-body">
          {comm.type === 'sms'   && <SmsThread comm={comm} />}
          {comm.type === 'call'  && <CallBody  comm={comm} />}
          {comm.type === 'email' && <EmailBody comm={comm} />}
        </div>
      )}
    </div>
  )
}

function TimelineStep({ item, isLast, defaultCommOpen }) {
  const meta = STEP_KIND_META[item.kind] ?? STEP_KIND_META.scan
  const { Icon, color } = meta

  return (
    <li className={`timeline-step ${isLast ? 'timeline-step-last' : ''}`}>
      <span className={`timeline-dot timeline-dot-${color}`} aria-hidden="true" />
      <article className="timeline-step-card">
        <div className="timeline-step-head">
          <span className={`timeline-step-eyebrow timeline-step-eyebrow-${color}`}>
            <Icon size={12} />
            <span>{item.eyebrow}</span>
          </span>
          {item.time && <span className="timeline-step-time">{item.time}</span>}
        </div>

        <h4 className="timeline-step-title">{item.title}</h4>
        {item.subtitle && <p className="timeline-step-subtitle">{item.subtitle}</p>}
        <StepStatusChip status={item.status} />

        {item.comm && <CommAccordion comm={item.comm} defaultOpen={defaultCommOpen} />}
      </article>
    </li>
  )
}

function TimelineList({ items, animated }) {
  const [visibleCount, setVisibleCount] = useState(animated ? 1 : items.length)

  useEffect(() => {
    if (!animated) { setVisibleCount(items.length); return }
    if (visibleCount >= items.length) return
    const t = setTimeout(() => setVisibleCount(c => Math.min(c + 1, items.length)), 1600)
    return () => clearTimeout(t)
  }, [animated, visibleCount, items.length])

  return (
    <ol className="timeline-list">
      {items.slice(0, visibleCount).map((item, i) => (
        <TimelineStep
          key={i}
          item={item}
          isLast={i === items.length - 1}
          defaultCommOpen={item.kind === 'conversation' || item.kind === 'dropout'}
        />
      ))}
    </ol>
  )
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

/* ─── Record drawer (fixed right) ────────────────────────────────────────── */

const RECORD_TYPE_LABEL = {
  shift:  'Shift',
  event:  'Event',
  user:   'User',
  venue:  'Venue',
  swap:   'Shift swap',
  batch:  'Reminder batch',
}

function UserChip({ user, onOpen }) {
  return (
    <button
      type="button"
      className="record-chip record-chip-user"
      onClick={(e) => { e.stopPropagation(); onOpen(e.currentTarget, { ...user.popover, kind: 'user' }) }}
    >
      <span className="record-chip-avatar" style={user.avatar ? { backgroundImage: `url(${user.avatar})` } : undefined} />
      <span className="record-chip-label">{user.name}</span>
    </button>
  )
}

function LinkChip({ link, onOpen }) {
  return (
    <button
      type="button"
      className="record-chip record-chip-link"
      onClick={(e) => { e.stopPropagation(); onOpen(e.currentTarget, { ...link.popover, kind: 'link', recordType: link.recordType }) }}
    >
      <span className="record-chip-dot" aria-hidden="true" />
      <span className="record-chip-label">{link.display}</span>
    </button>
  )
}

function RecordField({ field, onOpenPopover }) {
  const { label, value } = field
  let content

  if (value && typeof value === 'object' && value.kind === 'user') {
    content = <UserChip user={value} onOpen={onOpenPopover} />
  } else if (value && typeof value === 'object' && value.kind === 'link') {
    content = <LinkChip link={value} onOpen={onOpenPopover} />
  } else {
    content = <span>{value}</span>
  }

  return (
    <div className="record-field">
      <span className="record-field-label">{label}</span>
      <span className="record-field-value">{content}</span>
    </div>
  )
}

function RecordPopover({ anchor, payload, onClose }) {
  if (!anchor || !payload) return null
  const rect = anchor.getBoundingClientRect()
  const top  = Math.min(rect.bottom + 8, window.innerHeight - 280)
  const left = Math.min(rect.left, window.innerWidth - 340)

  return (
    <>
      <div className="record-popover-scrim" onClick={onClose} />
      <div className="record-popover" style={{ top, left }} role="dialog">
        <div className="record-popover-head">
          <span className="record-popover-type">{payload.recordType ?? payload.kind ?? 'Record'}</span>
          <button type="button" className="record-popover-close" onClick={onClose} aria-label="Close">
            <XIcon size={14} />
          </button>
        </div>
        <div className="record-popover-title">{payload.title}</div>
        {payload.subtitle && <div className="record-popover-subtitle">{payload.subtitle}</div>}
        {payload.status && (
          <div style={{ marginTop: 'var(--space-2)' }}>
            <StatusTag status={payload.status.tone ?? 'neutral'} size="sm" dot={false}>{payload.status.label}</StatusTag>
          </div>
        )}
        {payload.fields?.length > 0 && (
          <div className="record-popover-fields">
            {payload.fields.map((f, i) => (
              <div key={i} className="record-popover-field">
                <span className="record-popover-field-label">{f.label}</span>
                <span className="record-popover-field-value">{f.value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="record-popover-actions">
          <Button variant="tertiary" size="sm" onClick={() => showDemoToast()} trailingArtwork={<ArrowNarrowRightIcon size={14} />}>
            View {payload.recordType ?? 'record'}
          </Button>
        </div>
      </div>
    </>
  )
}

/* Unified activity row — used for both agents and humans so they look identical. */
function ActivityRow({ row, suppressAvatar = false }) {
  const initials = row.actor.split(' ').map(p => p[0]).join('').slice(0, 2)
  const [open, setOpen] = useState(false)
  const agent = row.kind === 'agent' && row.agentId ? getAgent(row.agentId) : null
  const isAgent = !!agent

  let avatarNode
  if (suppressAvatar) {
    avatarNode = <span className="activity-row-avatar-spacer" aria-hidden="true" />
  } else if (agent) {
    avatarNode = (
      <span
        className={`activity-row-avatar activity-row-avatar-agent agent-avatar-${agent.color}`}
        style={{ backgroundImage: `url(${agent.avatar})` }}
      />
    )
  } else if (row.avatar) {
    avatarNode = <span className="activity-row-avatar" style={{ backgroundImage: `url(${row.avatar})` }} />
  } else {
    avatarNode = <span className="activity-row-avatar activity-row-avatar-system">{initials}</span>
  }

  const commMeta  = row.comm ? (COMM_TYPE_META[row.comm.type] ?? COMM_TYPE_META.sms) : null
  const commLabel = row.comm?.type === 'sms'
    ? `${row.comm.messages?.length ?? 0} message${(row.comm.messages?.length ?? 0) === 1 ? '' : 's'}`
    : row.comm?.type === 'email'
    ? row.comm.subject
    : row.comm?.type === 'call'
    ? `${row.comm.duration ?? 'Call'} · ${row.comm.outcome ?? ''}`
    : null

  const wrapClass = ['activity-row-wrap', isAgent && 'activity-row-wrap-agent-dim'].filter(Boolean).join(' ')

  return (
    <li className={wrapClass}>
      <div className="activity-row">
        {avatarNode}
        <span className="activity-row-text">
          {!suppressAvatar && (
            <>
              <span className="activity-row-actor">{row.actor}</span>
              {isAgent && <span className="activity-row-agent-role"> ({agent.role})</span>}
              {' '}
            </>
          )}
          <span className="activity-row-verb">
            {suppressAvatar && row.verb ? row.verb.charAt(0).toUpperCase() + row.verb.slice(1) : row.verb}
          </span>
        </span>
        <span className="activity-row-time">{row.time}</span>
      </div>

      {row.comm && (
        <div className="activity-row-comm">
          <button
            type="button"
            className={`activity-row-comm-toggle ${open ? 'is-open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
          >
            <span className={`comm-icon comm-icon-${row.comm.type}`} aria-hidden="true">
              <commMeta.Icon size={12} />
            </span>
            <span className="activity-row-comm-label">{commMeta.label}</span>
            {commLabel && <span className="activity-row-comm-preview">· {commLabel}</span>}
            <span className={`timeline-step-comm-chevron ${open ? 'is-open' : ''}`} aria-hidden="true">⌄</span>
          </button>
          {open && (
            <div className="activity-row-comm-body">
              {row.comm.type === 'sms'   && <SmsThread comm={row.comm} />}
              {row.comm.type === 'call'  && <CallBody  comm={row.comm} />}
              {row.comm.type === 'email' && <EmailBody comm={row.comm} />}
            </div>
          )}
        </div>
      )}
    </li>
  )
}

function DetailsTab({ record, fallback, onOpenPopover }) {
  if (record?.fields?.length) {
    return (
      <div className="record-fields">
        {record.fields.map((f, i) => <RecordField key={i} field={f} onOpenPopover={onOpenPopover} />)}
      </div>
    )
  }
  return (
    <div className="record-fields">
      {fallback && <p className="detail-panel-desc" style={{ padding: 'var(--space-3) 0' }}>{fallback}</p>}
    </div>
  )
}

function ActivityTab({ record, detail, onExplore }) {
  // Prefer the unified record.activity (Events prototype); fall back to the
  // old detail.timeline for industries that haven't been migrated yet.
  const entries = record?.activity
  if (entries?.length) {
    return (
      <ul className="activity-rows">
        {entries.map((row, i) => <ActivityRow key={i} row={row} />)}
      </ul>
    )
  }

  if (detail?.timeline?.length) {
    return (
      <>
        <TimelineList items={detail.timeline} animated={detail.mode === 'animated'} />
        {detail.mode === 'animated' && detail.kicker && (
          <div className="detail-kicker">
            <p className="kicker-text">{detail.kicker}</p>
            <Button variant="secondary" size="lg" trailingArtwork={<ArrowNarrowRightIcon size={18} />} onClick={onExplore}>
              Want to see what else Teambridge can do?
            </Button>
          </div>
        )}
      </>
    )
  }

  return <p className="detail-panel-desc" style={{ padding: 'var(--space-3) 0' }}>No activity yet.</p>
}

function RecordDrawer({ card, detail, onClose, onExplore }) {
  const record   = card.record
  const [tab, setTab] = useState('activity')
  const [popover, setPopover] = useState(null)  // { anchor, payload } | null

  const openPopover  = (anchor, payload) => setPopover({ anchor, payload })
  const closePopover = () => setPopover(null)

  const title    = record?.title    ?? card.title
  const subtitle = record?.subtitle ?? card.description ?? card.summary
  const typeLabel = RECORD_TYPE_LABEL[record?.type] ?? 'Activity'
  const agent    = card.agentId ? getAgent(card.agentId) : null

  return (
    <aside className="detail-panel" aria-label="Record detail">
      <header className="record-header">
        <div className="record-header-top">
          {agent ? (
            <span className="record-header-agent">
              <span className="record-header-agent-avatar" style={{ backgroundImage: `url(${agent.avatar})` }} />
              <span>{agent.name}</span>
              <span className="record-header-agent-role">· {agent.role}</span>
            </span>
          ) : (
            <span className="record-header-type">{typeLabel}</span>
          )}
          <button type="button" className="detail-panel-close" onClick={onClose} aria-label="Close">
            <XIcon size={14} />
          </button>
        </div>
        <h2 className="record-header-title">{title}</h2>
        {subtitle && <p className="record-header-subtitle">{subtitle}</p>}
        {record?.status && (
          <div style={{ marginTop: 'var(--space-1)' }}>
            <StatusTag status={record.status.tone ?? 'neutral'} size="sm" dot={false}>{record.status.label}</StatusTag>
          </div>
        )}
      </header>

      <div className="detail-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'details'}
          className={`detail-tab ${tab === 'details' ? 'is-active' : ''}`}
          onClick={() => setTab('details')}
        >Details</button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'activity'}
          className={`detail-tab ${tab === 'activity' ? 'is-active' : ''}`}
          onClick={() => setTab('activity')}
        >Activity</button>
      </div>

      <div className="detail-panel-body">
        {tab === 'details'
          ? <DetailsTab record={record} fallback={card.description ?? card.summary} onOpenPopover={openPopover} />
          : <ActivityTab record={record} detail={detail} onExplore={onExplore} />
        }
      </div>

      {popover && <RecordPopover anchor={popover.anchor} payload={popover.payload} onClose={closePopover} />}
    </aside>
  )
}

/* ─── Activity feed (right column) ───────────────────────────────────────── */

function ActivityFeed({ data }) {
  const [expandedId, setExpandedId] = useState(null)
  const toggle = id => setExpandedId(curr => curr === id ? null : id)
  return (
    <aside className="activity-feed" aria-label="Activity">
      <div className="activity-feed-inner">
        <h2 className="activity-feed-title">Activity</h2>
        <div className="feed">
          {data.activeCard && (
            <ActivityCard
              card={data.activeCard}
              expanded={expandedId === data.activeCard.id}
              onToggle={() => toggle(data.activeCard.id)}
            />
          )}
          {data.feed.map(card => (
            <ActivityCard
              key={card.id}
              card={card}
              expanded={expandedId === card.id}
              onToggle={() => toggle(card.id)}
            />
          ))}
        </div>
      </div>
    </aside>
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

/* ─── Right-side Prompt panel (peek at Act 2) ────────────────────────────── */

/* Canned prompts + canned mock answers, keyed by industry. Clicking any
   suggestion submits the label as a user message and appends the mock
   response. Feels like a real prompt-driven AI. */
/* Daily briefing content — the empty-state of the chat column for each
   industry. A short narrative summary + 2-3 action chips that submit to
   the normal chat pipeline (matching canned prompts get rich answers,
   everything else routes through /api/chat). */
const BRIEFING = {
  events: {
    time: '9:04 AM',
    greeting: "Good morning. Here's your Saturday briefing.",
    situations: [
      { id: 'rachel', tone: 'warning',
        title: 'Sandra Lee cancelled',
        desc:  'Rachel Williams selected · awaiting your approval.',
        action: { label: 'Approve Rachel', prompt: 'Approve the Rachel Williams replacement' } },
      { id: 'coverage-chart', tone: 'warning',
        title: 'Gate coverage for Saturday',
        desc:  '47 of 48 confirmed · 1 open role at Gate 3.',
        action: { label: 'See coverage', prompt: 'Coverage by gate for Saturday' } },
      { id: 'prebrief', tone: 'info',
        title: 'Pre-game crew brief not drafted',
        desc:  '48 staff report Saturday at 5 PM.',
        action: { label: 'Draft brief', prompt: 'Draft the pre-game crew briefing' } },
      { id: 'weekly', tone: 'info',
        title: 'Weekly coverage recap',
        desc:  'Civic Arena + Harbor Theater · ready for the client.',
        action: { label: 'Build report', prompt: 'Build this week’s coverage report' } },
    ],
  },
  healthcare: {
    time: '7:12 AM',
    lines: [
      "Good morning. Here's today's briefing:",
      "",
      "**ICU floor at 94% readiness.** 2 decisions waiting on you.",
      "⚠️ **Keisha N.** PTO Saturday would thin ICU to 3 of 4 RNs.",
      "⚠️ **Diana R.** cleared and waiting for a first-shift assignment.",
      "",
      "What would you like me to handle first?",
    ],
    actions: [
      { label: 'Handle PTO',       prompt: 'Flag PTO that would thin coverage' },
      { label: 'Fill weekend',     prompt: 'Fill my weekend ICU gaps' },
      { label: 'Onboard Diana',    prompt: 'Onboard a new hire' },
    ],
  },
  staffing: {
    time: '8:30 AM',
    lines: [
      "Good morning. Here's today's briefing:",
      "",
      "**Fill rate 97%** across 6 clients this week.",
      "⚠️ **Meridian Healthcare** posted a 3-RN order for the weekend — 96 hours.",
      "⚠️ **David K.** rate-increase request is sitting on your desk.",
      "",
      "What would you like me to handle first?",
    ],
    actions: [
      { label: 'Dispatch order',  prompt: 'Dispatch weekend order' },
      { label: 'Rate review',     prompt: 'Review rate request' },
      { label: 'Find contractors', prompt: 'Find contractors for a new client' },
    ],
  },
  security: {
    time: '6:45 AM',
    lines: [
      "Good morning. Here's today's briefing:",
      "",
      "**Every post manned overnight.** 2 items for you.",
      "⚠️ **Armed post swap** (Rivera ↔ Chen) Thursday — safe to auto-approve.",
      "⚠️ **Corporate Campus A** asked for +1 nightly patrol for 2 weeks.",
      "",
      "What would you like me to handle first?",
    ],
    actions: [
      { label: 'Approve swap',     prompt: 'Approve the armed post swap' },
      { label: 'Stage coverage',   prompt: 'Stage coverage for Corporate Campus A' },
      { label: 'Overtime watch',   prompt: 'Show guards nearing overtime' },
    ],
  },
  'light-industrial': {
    time: '5:20 AM',
    lines: [
      "Good morning. Here's today's briefing:",
      "",
      "**Lines running at 96%.** 2 decisions waiting.",
      "⚠️ **DC East** peak surge — 22% above forecast next 5 days.",
      "⚠️ **5 forklift certs** expiring in 14 days.",
      "",
      "What would you like me to handle first?",
    ],
    actions: [
      { label: 'Stage surge',      prompt: 'Add associates for peak volume' },
      { label: 'Renew certs',      prompt: 'Renew forklift certs' },
      { label: 'Overtime watch',   prompt: 'Show associates approaching overtime' },
    ],
  },
  construction: {
    time: '6:00 AM',
    lines: [
      "Good morning. Here's today's briefing:",
      "",
      "**4 sites on schedule.** 2 items for you.",
      "⚠️ **Thursday** rain forecast — framing at 5th & Main would be unsafe.",
      "⚠️ **4 OSHA 30** certs expiring in 21 days.",
      "",
      "What would you like me to handle first?",
    ],
    actions: [
      { label: 'Swap for rain',    prompt: 'Swap crews for Thursday rain' },
      { label: 'Renew OSHA',       prompt: 'Renew OSHA certs' },
      { label: 'Morning plan',     prompt: 'Draft foreman\'s morning plan' },
    ],
  },
}

/* Briefing set when the user is viewing the Schedule — insights focus on
   coverage, no-shows, overtime risk, and upcoming shift reminders. Events-only
   for now; other industries fall back to the home briefing. */
const SCHEDULE_BRIEFING = {
  events: {
    time: '9:04 AM',
    greeting: "Looking at this week's schedule — here's what to act on.",
    situations: [
      { id: 'no-shows', tone: 'warning',
        title: '2 no-shows logged this week',
        desc:  'Sandra (Wed) and Ashley (Tue) missed their call times.',
        action: { label: 'Review no-shows', prompt: "Summarise this week's no-shows" } },
      { id: 'saturday', tone: 'warning',
        title: 'Saturday coverage at 98%',
        desc:  'Gate 3 still has one open usher role 2 days out.',
        action: { label: 'Fill Gate 3', prompt: 'Fill the last open Saturday role' } },
      { id: 'ot-miguel', tone: 'info',
        title: 'Miguel projecting 32 hrs',
        desc:  'Event-lead load is on the overtime edge for Saturday.',
        action: { label: 'Check OT risk', prompt: 'Check overtime risk for Saturday' } },
      { id: 'reminders', tone: 'info',
        title: "Tomorrow's early call",
        desc:  '6 staff report 5 AM at Harbor Theater load-in.',
        action: { label: 'Send reminders', prompt: 'Draft the pre-game crew briefing' } },
    ],
  },
}

function DailyBriefing({ industryId, view = 'overview', onAction }) {
  const set = view === 'schedule' ? SCHEDULE_BRIEFING : BRIEFING
  const brief = set[industryId] ?? set.events ?? BRIEFING.events
  const hasSituations = Array.isArray(brief.situations)

  return (
    <div className="briefing">
      <header className="briefing-agent">
        <span className="briefing-agent-status" aria-hidden="true" />
        <div className="briefing-agent-text">
          <div className="briefing-agent-name">Teambridge</div>
          <div className="briefing-agent-role">Super Agent · Monitoring all</div>
        </div>
      </header>

      {hasSituations ? (
        <article className="briefing-compact">
          <div className="briefing-compact-head">
            <span className="briefing-compact-time">{brief.time}</span>
            <p className="briefing-compact-greeting">
              {brief.greeting.split(/(\s+)/).map((tok, i) => (
                /\S/.test(tok)
                  ? <span key={i} className="briefing-word" style={{ animationDelay: `${i * 90}ms` }}>{tok}</span>
                  : <span key={i}>{tok}</span>
              ))}
            </p>
          </div>
          <ul className="briefing-situations">
            {brief.situations.map((s, i) => (
              <li
                key={s.id}
                className={`briefing-situation briefing-situation-${s.tone}`}
                style={{ animationDelay: `${2200 + i * 420}ms` }}
              >
                <span className="briefing-situation-dot" aria-hidden="true" />
                <div className="briefing-situation-text">
                  <div className="briefing-situation-title">{s.title}</div>
                  {s.desc && <div className="briefing-situation-desc">{s.desc}</div>}
                </div>
                {s.action && (
                  <button type="button" className="briefing-situation-action" onClick={() => onAction(s.action.prompt)}>
                    {s.action.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </article>
      ) : (
        <article className="briefing-message">
          <div className="briefing-message-head">
            <span className="briefing-message-sender">Teambridge</span>
            <span className="briefing-message-time">{brief.time}</span>
          </div>
          <div className="briefing-message-body">
            {brief.lines.map((line, i) => (
              line === '' ? <div key={i} className="briefing-message-break" />
                          : <p key={i} className="briefing-message-line">{renderInlineBold(line)}</p>
            ))}
          </div>
          <div className="briefing-actions">
            {brief.actions.map((a, i) => (
              <button key={i} type="button" className="briefing-action" onClick={() => onAction(a.prompt)}>
                {a.label}
              </button>
            ))}
          </div>
        </article>
      )}
    </div>
  )
}

const PROMPT_SUGGESTIONS = {
  healthcare: [
    { label: 'Fill my weekend ICU gaps',
      answer: `Three weekend gaps today: Saturday 7a ICU, Sunday 3p ICU, Sunday 11p ICU.

• Saturday 7a — Ashley P. is closest (2.1 mi), under hours, ICU-certified.
• Sunday 3p — Priya S. is the fit, 3.1 mi, 24 hrs this week.
• Sunday 11p — David K. (4.2 mi) but he's at 36 hrs — would trip overtime. Safer: Maria L. (5.0 mi, 22 hrs).

Want me to dispatch all three offers now?` },
    { label: 'Onboard a new hire',
      answer: `I can clear Diana R. end-to-end:

• RN license active (state board verified)
• BLS, ACLS, PALS current through 2027
• Background check clean
• Requested Memorial South · 3.2 mi

I'll assign her first shift Monday 7am and send her the welcome packet. Approve to run?` },
    { label: 'Flag PTO that would thin coverage',
      answer: `One PTO request at risk:

• Keisha N. — Saturday 7a–7p. ICU will drop to 3 of 4 required nurses.
• Ashley P. is the strongest backfill (high acceptance rate on Keisha's prior swaps).

Shall I approve the PTO and auto-offer the shift to Ashley?` },
    { label: 'Credential hires',
      answer: `4 hires in the credentialing queue:

• Sarah M. · Cleared (TABC + BLS) → assigned Monday
• Diana R. · Ready for approval
• Omar S. · Waiting on state-board re-verification (~2 hrs)
• Lydia C. · Missing PALS doc (auto-requested from her)

Want me to send a status summary to the hiring manager?` },
    { label: 'Draft a pre-shift safety briefing',
      answer: `Here's a draft for the 7am ICU huddle:

• Census: 18 of 22 beds (82%). No new admits overnight.
• High-acuity: Bay 3 (post-op, titrating pressors), Bay 7 (ECMO).
• Staffing: 4 RNs + 1 float. Ashley P. on for Keisha.
• Safety focus: CAUTI bundle audit today. BLS refresher for 2 new hires.

Ready to dispatch to the team?` },
  ],
  staffing: [
    { label: 'Dispatch weekend order',
      answer: `Meridian's weekend order (3 RNs, 96 hrs) — I have 5 qualified contractors above 4.7 rating, all under hours. Top picks: Janelle R., David K., Priya S.

Want me to dispatch offers in that order?` },
    { label: 'Review rate request',
      answer: `David K. requested +$3/hr. Evidence:

• 4.9 rating over 6 months
• 8 placements, zero complaints, 98% attendance
• Current rate is $2/hr below contractors with his profile
• Meridian and Stellar both requested him by name

Margin impact: minimal. Recommend approve?` },
    { label: 'Find contractors for a new client',
      answer: `New client Horizon Labs posted 2 RN slots for Friday. Matching against roster:

• 7 contractors within 10 mi + rating ≥ 4.7
• 4 with Horizon's required cert (CRNI)
• Top 3 all over 95% historical acceptance

Ready to push offers to the top 3?` },
    { label: 'Show low-fill-rate clients',
      answer: `Last 30 days — clients below 90% fill:

• Stellar Events · 74% — pay rate 8% under market
• Lakeside Clinic · 82% — late-notice pattern (avg 9 hr lead)

Both have clear fixes. Want me to draft outreach?` },
    { label: 'Draft weekly client digest',
      answer: `This week across clients:

• 11 placements dispatched, 11 filled · 97% fill rate
• Median time-to-fill: 34 min
• 1 cancellation (Meridian covered in 22 min)
• Margin: +4.2% vs last week

Ready to email to the client ops channel?` },
  ],
  events: [
    { label: 'Approve the Rachel Williams replacement',
      specialist: 'nova',
      approveLabel: 'Confirm Rachel & notify',
      approvePlan: [
        'Send Rachel her confirmed shift brief',
        'Update the Civic Arena schedule',
        'Log the replacement with Miguel',
      ],
      answer: {
        segments: [
          { type: 'text', text: "Rachel Williams is locked in for Sandra Lee's Saturday 7pm usher shift. Rachel accepted over SMS — approving just confirms and notifies." },
          { type: 'attachment',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces&auto=format',
            title: 'Rachel Williams · Usher',
            subtitle: 'East Entry · Gate 3 · 6:30 PM report · Sat Apr 26',
            actions: [{ label: 'View shift' }],
          },
          { type: 'cta', text: "Approve **Nova** to send Rachel her brief and lock the schedule?" },
        ],
      } },
    { label: 'Fill the last open Saturday role',
      specialist: 'nova',
      approveLabel: 'Offer Jordan the shift',
      answer: {
        segments: [
          { type: 'text', text: "One role left for the 49ers vs Rams Saturday call: Gate 3 usher · 6:30 PM report. I ranked 2 strong candidates under hours:" },
          { type: 'records', records: [
            { name: 'Jordan K.', role: 'Usher · 4.9 rating',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces&auto=format', meta: '1.2 mi · 28 hrs · Worked Gate 3 twice this month' },
            { name: 'Priya S.',  role: 'Usher · 4.7 rating',  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces&auto=format', meta: '1.9 mi · 24 hrs · Clean attendance last 60 days' },
          ]},
          { type: 'cta', text: "Recommend offering Jordan first. Want me to send it?" },
        ],
      } },
    { label: 'Draft the pre-game crew briefing',
      specialist: 'sofia',
      approveLabel: 'Dispatch brief to the team',
      answer: {
        segments: [
          { type: 'text', text: "Draft briefing for 48 staff · Saturday 5:00 PM call:" },
          { type: 'list', items: [
            '**Event:** 49ers vs Rams · Sellout (68,500) · Kickoff 7:15 PM',
            '**Gates:** 1–6 open at 5:00 PM · surge crew stays post-kickoff',
            '**Alcohol:** TABC badges visible · cut-off 3rd quarter',
            '**Weather:** clear · 62°F at kickoff',
            '**Roster change:** Rachel Williams in for Sandra Lee at East Entry',
          ]},
          { type: 'attachment',
            icon: 'event',
            title: 'Saturday Pre-Game Brief',
            subtitle: '48 staff · 5 PM call · 49ers vs Rams · Civic Arena',
            actions: [{ label: 'Preview brief' }],
          },
          { type: 'cta', text: "Ready to dispatch via SMS + in-app push?" },
        ],
      } },
    { label: 'Build this week’s coverage report',
      specialist: 'atlas',
      approveLabel: 'Email report to client ops',
      answer: {
        segments: [
          { type: 'text', text: "Generated this week's coverage report across Civic Arena + Harbor Theater:" },
          { type: 'attachment',
            icon: 'chart',
            title: 'Weekly Coverage Report',
            subtitle: 'Civic Arena + Harbor Theater · Apr 20–26',
            metrics: [
              { value: '98%',    label: 'Coverage' },
              { value: '12',     label: 'Swaps · auto' },
              { value: '1m 52s', label: 'Avg fill' },
              { value: '0',      label: 'No-shows' },
            ],
            actions: [{ label: 'Open report' }],
          },
          { type: 'cta', text: "Email this to Miguel + the venue client ops channel?" },
        ],
      } },
    { label: 'Draft the onboarding packet for Sarah',
      specialist: 'sofia',
      approveLabel: 'Send packet to Sarah',
      answer: {
        segments: [
          { type: 'text', text: "First-shift packet ready for Sarah M. — Saturday 7 PM Civic Arena bev-service." },
          { type: 'attachment',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces&auto=format',
            title: 'Sarah M. · Beverage service',
            subtitle: 'Saturday 6:30 PM · East Concourse · buddy Priya S.',
            actions: [{ label: 'View packet' }],
          },
          { type: 'cta', text: "Send the packet to Sarah via SMS + email?" },
        ],
      } },
    { label: 'Coverage by gate for Saturday',
      specialist: 'nova',
      approveLabel: 'Close the Gate 3 gap',
      answer: {
        segments: [
          { type: 'text', text: "47 of 48 confirmed · one role pending approval." },
          { type: 'chart', title: 'Gate coverage · target 8 each', bars: [
            { label: 'Gate 1 · North', value: 8, target: 8 },
            { label: 'Gate 2 · North', value: 8, target: 8 },
            { label: 'Gate 3 · East',  value: 7, target: 8, note: '1 open' },
            { label: 'Gate 4 · East',  value: 8, target: 8, note: 'Rachel in for Sandra' },
            { label: 'Gate 5 · South', value: 8, target: 8 },
            { label: 'Gate 6 · South', value: 9, target: 8, note: 'surge +1' },
          ]},
          { type: 'cta', text: "Close the gap on Gate 3? I have two qualified candidates." },
        ],
      } },
    { label: 'Pre-brief for Harbor Theater opener',
      specialist: 'sofia',
      approveLabel: 'Send interest pings',
      answer: {
        segments: [
          { type: 'text', text: "Harbor Theater opens May 1. Current readiness:" },
          { type: 'metrics', items: [
            { value: '18/24', label: 'Pre-staged' },
            { value: '14/18', label: 'TABC certified' },
            { value: '6',     label: 'Open slots' },
            { value: '9',     label: 'In-reach candidates' },
          ]},
          { type: 'cta', text: "Want me to send interest pings to the 9 in-reach candidates now?" },
        ],
      } },
    { label: 'Summarise auto-approved swaps',
      // Pure summary — no action required.
      answer: {
        segments: [
          { type: 'text', text: "This week across 4 venues: **12 shift swaps auto-approved, 0 manager intervention.**" },
          { type: 'metrics', items: [
            { value: '12',    label: 'Swaps processed' },
            { value: '18 min', label: 'Avg response' },
            { value: '0',     label: 'Overtime triggers' },
            { value: '0',     label: 'Manager actions' },
          ]},
          { type: 'text', text: "Breakdown: 10 weekday shifts, 2 Saturday event shifts. No one-sided-trade patterns." },
        ],
      } },
  ],
  security: [
    { label: 'Approve the armed post swap',
      answer: `Rivera ↔ Chen Thursday armed post swap:

• Both armed-certified, firearm permits current
• Chen has worked this post 11 times; Rivera 14 times
• No overtime risk, no client restrictions
• Client auto-notification drafted

Recommend approve — safe to auto-run.` },
    { label: 'Stage coverage for Corporate Campus A',
      answer: `Client requested +1 nightly patrol for 2 weeks. Plan:

• 14 armed-cert guards available nightly, all under hours
• Propose rotation: Singh, Patel, Harris across 2 weeks
• Rate matches contract, no scope change

Ready to stage and notify the three?` },
    { label: 'Show guards nearing overtime',
      answer: `4 guards within 4 hrs of the 40 hr cap:

• Ramon G. (36 hrs) — Friday shift would trip
• Daniela T. (37 hrs) — Saturday shift risk
• Marcus B. (38 hrs) — Sunday at risk
• Priya K. (36 hrs) — OK if Friday swap approved

Want me to offer them keep/swap/drop SMS?` },
    { label: 'Verify next hire\'s license',
      answer: `Sarah M. guard license check:

• State license #G-92184 — Active through Dec 2028
• Firearm permit not required for her first post
• Background check clean (state + federal)

Cleared for North Gate Monday. Want me to send welcome + schedule?` },
    { label: 'Draft an incident digest',
      answer: `This week's incident log (9 events):

• 5 routine (minor visitor escalations, resolved on-site)
• 2 medical (ambulance dispatched, no follow-up needed)
• 1 lockdown drill (all posts passed checklist)
• 1 access-control glitch (badge reader replaced)

0 escalations to client. Ready to email the summary?` },
  ],
  'light-industrial': [
    { label: 'Add associates for peak volume',
      answer: `DC East forecast is 22% above normal for the next 5 days. Plan:

• 12 forklift-certified associates available, all under hours
• Proposal: +8 associates covers throughput with 15% buffer
• Shift leads notified automatically

Approve to add the 8?` },
    { label: 'Renew forklift certs',
      answer: `5 forklift certs expiring in 14 days. Batch renewal option:

• $45 per associate ($225 total)
• Thursday 2pm on-site session (2 hrs, paid as training)
• All 5 are top performers, zero safety incidents

Want me to approve and book the session?` },
    { label: 'Show associates approaching overtime',
      answer: `3 associates within 4 hrs of overtime this week:

• Luis M. — 36 hrs · Friday shift would trip
• Priya S. — 37 hrs · Saturday risk
• Derek K. — 36 hrs · OK if swap approved

Want me to ask each to keep/swap/drop?` },
    { label: 'Draft shift reminder',
      answer: `Draft for tomorrow's 5am pick-and-pack:

"Reminder: your shift starts at 5am at DC East. Report to the north dock. Reply Y to confirm. — Teambridge"

Dispatching to all 12 scheduled associates. Send?` },
    { label: 'Summarise auto-approved swaps',
      answer: `This week: 8 swaps auto-approved, 0 manager time.

• Median turnaround: 22 min
• No overtime triggers, no reciprocity imbalance
• All 8 parties confirmed within 30 min

Audit trail in Agent Workflows.` },
  ],
  construction: [
    { label: 'Swap crews for Thursday rain',
      answer: `Thursday forecast: 85% chance of 1"+ rain. Framing at 5th and Main would be unsafe.

Proposal:
• Move the 5th/Main crew to Elm Street (interior drywall + trim)
• Resume framing Friday 6am
• No overtime risk, no comp risk, same pay rate

Foreman is pre-notified. Approve the swap?` },
    { label: 'Renew OSHA certs',
      answer: `4 OSHA 30 certs expiring in 21 days. Group renewal:

• Online self-paced (~4 hrs each)
• $75 per crew member ($300 total)
• Can start this week — avg completion 5 days

All 4 are senior crew. Recommend approve.` },
    { label: 'Show crew hours by site',
      answer: `This week across active sites:

• 5th and Main: 42% of target hours (rain risk Thursday)
• Elm Street: 108% (extra interior work coming)
• Harbor Build: 96% (on-track)
• West Row: 91% (framing delayed 1 day)

Net: on-track. Want a site-by-site throughput report?` },
    { label: 'Draft foreman\'s morning plan',
      answer: `Tomorrow 6am at 5th and Main:

• Crew: 12 (framing lead + 9 framers + 2 apprentices)
• Material: Truss delivery 7:30am (confirmed)
• Focus: Section B framing, 40% complete
• Safety: OSHA 30 audit visit window 9–11am
• Contingency: If truss delayed, crew moves to finish Section A

Dispatch to foreman + crew leads?` },
    { label: 'Weekly throughput summary',
      answer: `This week across 4 sites:

• 98% of target hours delivered
• 0 safety incidents
• 2 weather adjustments (auto-handled)
• Projected finish: 3 of 4 sites on schedule, 1 (West Row) -1 day

Report available for client share?` },
  ],
}

/* ─── Rich-answer rendering primitives ──────────────────────────────────── */

function renderInlineBold(text) {
  // Minimal **bold** handling for message segments.
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
    return <span key={i}>{p}</span>
  })
}

function ThinkingDots() {
  return (
    <span className="prompt-thinking" aria-label="Thinking">
      <span className="prompt-thinking-dot" />
      <span className="prompt-thinking-dot" />
      <span className="prompt-thinking-dot" />
    </span>
  )
}

function RecordPromptCard({ record }) {
  return (
    <button type="button" className="prompt-record-card">
      <span className="prompt-record-avatar" style={record.avatar ? { backgroundImage: `url(${record.avatar})` } : undefined} />
      <span className="prompt-record-body">
        <span className="prompt-record-name">{record.name}</span>
        <span className="prompt-record-role">{record.role}</span>
        <span className="prompt-record-meta">{record.meta}</span>
      </span>
      <span className="prompt-record-chev" aria-hidden="true">›</span>
    </button>
  )
}

function ChartBlock({ chart }) {
  const max = Math.max(...chart.bars.map(b => Math.max(b.value, b.target)))
  return (
    <div className="prompt-chart">
      {chart.title && <div className="prompt-chart-title">{chart.title}</div>}
      <ul className="prompt-chart-bars">
        {chart.bars.map((b, i) => {
          const pct  = max > 0 ? (b.value / max) * 100 : 0
          const full = b.value >= b.target
          return (
            <li key={i} className="prompt-chart-row">
              <span className="prompt-chart-label">{b.label}</span>
              <span className="prompt-chart-track">
                <span
                  className={`prompt-chart-fill ${full ? 'is-full' : 'is-short'}`}
                  style={{ width: `${pct}%`, animationDelay: `${i * 60}ms` }}
                />
              </span>
              <span className={`prompt-chart-value ${full ? 'is-full' : 'is-short'}`}>{b.value} / {b.target}{b.note ? ` · ${b.note}` : ''}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function MetricsBlock({ items }) {
  return (
    <div className="prompt-metrics">
      {items.map((m, i) => (
        <div key={i} className="prompt-metric">
          <div className="prompt-metric-value">{m.value}</div>
          <div className="prompt-metric-label">{m.label}</div>
        </div>
      ))}
    </div>
  )
}

function Segment({ seg, charsRevealed }) {
  if (seg.type === 'text' || seg.type === 'cta') {
    const text = seg.text.slice(0, charsRevealed)
    const cls  = seg.type === 'cta' ? 'prompt-seg prompt-seg-cta' : 'prompt-seg prompt-seg-text'
    return <div className={cls}>{renderInlineBold(text)}</div>
  }
  if (seg.type === 'list') {
    return (
      <ul className="prompt-seg prompt-seg-list">
        {seg.items.map((item, i) => <li key={i}>{renderInlineBold(item)}</li>)}
      </ul>
    )
  }
  if (seg.type === 'records') {
    return (
      <div className="prompt-seg prompt-seg-records">
        {seg.records.map((r, i) => <RecordPromptCard key={i} record={r} />)}
      </div>
    )
  }
  if (seg.type === 'chart')   return <ChartBlock chart={seg} />
  if (seg.type === 'metrics') return <MetricsBlock items={seg.items} />
  if (seg.type === 'attachment') return <AttachmentBlock attachment={seg} />
  return null
}

function AttachmentBlock({ attachment }) {
  const { title, subtitle, avatar, icon, actions, metrics } = attachment
  return (
    <div className={`prompt-seg prompt-seg-attachment ${metrics?.length ? 'prompt-seg-attachment-with-stats' : ''}`}>
      {avatar ? (
        <span className="attachment-avatar" style={{ backgroundImage: `url(${avatar})` }} aria-hidden="true" />
      ) : (
        <span className={`attachment-icon attachment-icon-${icon ?? 'file'}`} aria-hidden="true">
          <AttachmentIcon name={icon ?? 'file'} />
        </span>
      )}
      <div className="attachment-meta">
        <div className="attachment-title">{title}</div>
        {subtitle && <div className="attachment-subtitle">{subtitle}</div>}
      </div>
      <div className="attachment-actions">
        {(actions ?? []).map((a, i) => (
          <button
            key={i}
            type="button"
            className="attachment-btn"
            onClick={e => { e.stopPropagation(); showDemoToast() }}
          >
            {a.label}
          </button>
        ))}
      </div>
      {metrics?.length > 0 && (
        <div className="attachment-stats">
          {metrics.map((m, i) => (
            <div key={i} className="attachment-stat">
              <div className="attachment-stat-value">{m.value}</div>
              <div className="attachment-stat-label">{m.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AttachmentIcon({ name }) {
  if (name === 'chart') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (name === 'event') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* Light markdown-ish parser: turns a raw AI text reply into a list of segments
   so it renders with the same structure as the canned prompts. */
function parseMarkdownToSegments(text) {
  const segments = []
  const lines    = text.split(/\r?\n/)
  let textBuf    = []
  let listBuf    = null

  const flushText = () => {
    if (textBuf.length === 0) return
    const joined = textBuf.join(' ').trim()
    if (joined) segments.push({ type: 'text', text: joined })
    textBuf = []
  }
  const flushList = () => {
    if (!listBuf) return
    segments.push({ type: 'list', items: listBuf })
    listBuf = null
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flushText(); flushList(); continue }
    const bullet = line.match(/^[•\-\*]\s+(.+)/)
    if (bullet) {
      flushText()
      if (!listBuf) listBuf = []
      listBuf.push(bullet[1])
    } else {
      flushList()
      textBuf.push(line)
    }
  }
  flushText(); flushList()
  return segments
}

function normalizeSegments(content) {
  if (!content) return []
  if (typeof content === 'string') return parseMarkdownToSegments(content)
  if (Array.isArray(content.segments)) return content.segments
  return []
}

/* Heuristic — find which specialist the AI recommended in a free-form answer. */
/* Detect the right follow-up for a free-form AI reply:
   - Explicit "Next: [label]" marker → a contextual action button
   - "Approve/Have/Send **Nova** to <verb> …" phrasing → a specialist approval
   - Nothing → no button (the reply was purely informational)
   When we detect an approval, we also pull out the verb phrase that
   comes after "to …" so the button can read "Dispatch the brief"
   instead of the generic "Have Nova take it". */
function detectFollowup(text) {
  if (typeof text !== 'string' || !text.trim()) return null
  const nextMatch = text.match(/^[ \t]*Next:\s*\*?\*?([^\n*]+?)\*?\*?\s*$/im)
  if (nextMatch) {
    const label = nextMatch[1].trim().replace(/[.!?]+$/, '')
    if (label) return { kind: 'action', label }
  }
  const approveMatch = text.match(
    /\b(?:approve|have|dispatch|send|let)\s+\*?\*?(nova|atlas|iris|sofia|leo)\*?\*?\s+to\s+([^?\n]+?)\s*[?.!]?\s*$/im
  )
  if (approveMatch) {
    const agentId = approveMatch[1].toLowerCase()
    const phrase  = approveMatch[2].trim().replace(/[.!?,]+$/, '')
    const label   = phrase ? phrase.charAt(0).toUpperCase() + phrase.slice(1) : null
    return { kind: 'approve', agentId, label }
  }
  return null
}

/* Strip the "Next: …" line from the visible reply body so it only surfaces as
   a button. Also trims trailing markdown dividers Claude sometimes appends. */
function stripFollowupLine(text) {
  return text
    .replace(/^[ \t]*Next:[^\n]*\n?/im, '')
    .replace(/\n?[-—_]{3,}\s*$/m, '')
    .trimEnd()
}

/* Progress bubble — agent is starting work. Tasks advance one at a time
   with ~18s between transitions so it feels paced and real (not faked-fast).
   When the last task lands, the pill flips to "Complete". */
const PROGRESS_STEP_DURATION_MS = 18000

function ProgressMessage({ message }) {
  const agent = message.agentId ? getAgent(message.agentId) : null
  const steps = message.steps ?? []
  const agentName = agent ? `${agent.name} (${agent.role})` : 'Teambridge AI'
  const isThinking = message.status === 'thinking'

  const [activeIdx, setActiveIdx] = useState(0)
  const allDone = !isThinking && activeIdx >= steps.length

  useEffect(() => {
    if (isThinking || allDone) return
    const t = setTimeout(() => setActiveIdx(i => i + 1), PROGRESS_STEP_DURATION_MS)
    return () => clearTimeout(t)
  }, [activeIdx, allDone, isThinking])

  if (isThinking) {
    return (
      <div className="prompt-msg prompt-msg-assistant prompt-msg-progress">
        <span className={`prompt-msg-mark ${agent ? `agent-avatar-${agent.color}` : ''}`} aria-hidden="true"
              style={agent?.avatar ? { backgroundImage: `url(${agent.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
          {!agent && <TeambridgeAIIcon size={12} />}
        </span>
        <div className="prompt-msg-body">
          <ThinkingDots />
        </div>
      </div>
    )
  }

  return (
    <div className="prompt-msg prompt-msg-assistant prompt-msg-progress">
      <span className={`prompt-msg-mark ${agent ? `agent-avatar-${agent.color}` : ''}`} aria-hidden="true"
            style={agent?.avatar ? { backgroundImage: `url(${agent.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
        {!agent && <TeambridgeAIIcon size={12} />}
      </span>
      <div className="prompt-msg-body">
        <div className="progress-header">
          <span className="progress-actor">{agentName} {allDone ? 'wrapped up' : 'started'}</span>
          <span className={`progress-status-pill ${allDone ? 'is-done' : ''}`}>
            <span className="progress-status-dot" aria-hidden="true" />
            {allDone ? 'Complete' : 'Working'}
          </span>
        </div>
        <ul className="progress-tasks">
          {steps.map((s, i) => {
            const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'queued'
            return (
              <li key={i} className={`progress-task progress-task-${state}`} style={{ animationDelay: `${i * 90}ms` }}>
                <span className="progress-task-mark" aria-hidden="true">
                  {state === 'done'   && <CheckIcon size={11} />}
                  {state === 'active' && <AILoader size="xs" variant="gradient" />}
                </span>
                <span className="progress-task-label">{s}</span>
              </li>
            )
          })}
        </ul>
        <button type="button" className="progress-workflow-link" onClick={() => showDemoToast()}>
          <GitBranch01Icon size={12} />
          <span>Upgrade workflow to add this notification</span>
          <ArrowNarrowRightIcon size={12} />
        </button>
      </div>
    </div>
  )
}

function ActionButtons({ specialist, actionHint, approveLabel, onApprove }) {
  if (actionHint) {
    return (
      <div className="prompt-actions-row">
        <button
          type="button"
          className="prompt-action prompt-action-primary"
          onClick={e => { e.stopPropagation(); showDemoToast() }}
        >
          {actionHint}
        </button>
      </div>
    )
  }
  const agent = specialist ? getAgent(specialist) : null
  if (!agent) return null
  const label = approveLabel ?? `Have ${agent.name} take it`
  return (
    <div className="prompt-actions-row">
      <button type="button" className="prompt-action prompt-action-primary" onClick={onApprove}>
        <span className="prompt-action-agent" style={{ backgroundImage: `url(${agent.avatar})` }} />
        {label}
      </button>
    </div>
  )
}

/* A chat-embedded version of the briefing card. Used when we inject a new
   briefing on view-change (e.g., entering Schedule mid-conversation) so the
   existing chat history stays intact and the new insights scroll into view. */
function InlineBriefing({ brief, onAction }) {
  if (!brief) return null
  return (
    <div className="prompt-msg prompt-msg-assistant">
      <span className="prompt-msg-mark" aria-hidden="true">
        <TeambridgeAIIcon size={12} />
      </span>
      <div className="prompt-msg-body">
        <p className="briefing-compact-greeting">
          {(brief.greeting ?? '').split(/(\s+)/).map((tok, i) => (
            /\S/.test(tok)
              ? <span key={i} className="briefing-word" style={{ animationDelay: `${i * 90}ms` }}>{tok}</span>
              : <span key={i}>{tok}</span>
          ))}
        </p>
        <ul className="briefing-situations">
          {(brief.situations ?? []).map((s, i) => (
            <li
              key={s.id}
              className={`briefing-situation briefing-situation-${s.tone}`}
              style={{ animationDelay: `${2200 + i * 420}ms` }}
            >
              <span className="briefing-situation-dot" aria-hidden="true" />
              <div className="briefing-situation-text">
                <div className="briefing-situation-title">{s.title}</div>
                {s.desc && <div className="briefing-situation-desc">{s.desc}</div>}
              </div>
              {s.action && (
                <button type="button" className="briefing-situation-action" onClick={() => onAction?.(s.action.prompt)}>
                  {s.action.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Message({ message, onApprove }) {
  if (message.role === 'user') {
    return (
      <div className="prompt-msg prompt-msg-user">
        <div className="prompt-msg-text">{message.content}</div>
      </div>
    )
  }

  if (message.role === 'progress') {
    return <ProgressMessage message={message} />
  }

  if (message.role === 'briefing') {
    return <InlineBriefing brief={message.brief} onAction={message.onAction} />
  }

  const segments   = normalizeSegments(message.content)
  const isThinking = message.status === 'thinking'
  const step       = message.step ?? 0
  const chars      = message.chars ?? 0

  return (
    <div className="prompt-msg prompt-msg-assistant">
      <span className="prompt-msg-mark" aria-hidden="true">
        <TeambridgeAIIcon size={12} />
      </span>
      <div className="prompt-msg-body">
        {isThinking && <ThinkingDots />}
        {!isThinking && segments.slice(0, step + 1).map((seg, i) => {
          const isCurrent = i === step && message.status === 'streaming'
          const revealed  = isCurrent ? chars : Infinity
          return <Segment key={i} seg={seg} charsRevealed={revealed} />
        })}
        {message.status === 'done' && (message.specialist || message.actionHint) && (
          <ActionButtons
            specialist={message.specialist}
            actionHint={message.actionHint}
            approveLabel={message.approveLabel}
            onApprove={() => onApprove(message)}
          />
        )}
      </div>
    </div>
  )
}

/* ─── Prompt panel ──────────────────────────────────────────────────────── */

function PromptPanel({ industryId, view = 'overview' }) {
  const suggestions = PROMPT_SUGGESTIONS[industryId] ?? PROMPT_SUGGESTIONS.events
  const [input, setInput]       = useState('')
  const [messages, setMessages] = useState([])
  const scrollRef   = useRef(null)
  const idRef       = useRef(0)
  const lastViewRef = useRef(view)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  // Mid-conversation, when the user switches views (e.g. overview → schedule),
  // append a matching briefing as an inline AI message so the chat scrolls
  // naturally to the new insights instead of leaving them hidden behind the
  // existing history.
  useEffect(() => {
    const prev = lastViewRef.current
    lastViewRef.current = view
    if (view === prev) return
    if (messages.length === 0) return  // empty state already renders the briefing
    const set = view === 'schedule' ? SCHEDULE_BRIEFING : BRIEFING
    const brief = set[industryId] ?? set.events
    if (!brief?.situations?.length) return
    setMessages(prev => [
      ...prev,
      { id: ++idRef.current, role: 'briefing', brief, onAction: (prompt) => submitRef.current?.(prompt) },
    ])
  }, [view, industryId]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateMsg = (id, patch) =>
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m))

  // Streaming state machine for in-flight assistant messages.
  useEffect(() => {
    const m = messages.find(x => x.role === 'assistant' && x.status !== 'done')
    if (!m) return

    if (m.status === 'thinking') {
      if (!m.content) return
      const t = setTimeout(() => updateMsg(m.id, { status: 'streaming', step: 0, chars: 0 }), 550)
      return () => clearTimeout(t)
    }

    if (m.status === 'streaming') {
      const segments = normalizeSegments(m.content)
      const seg = segments[m.step]
      if (!seg) {
        updateMsg(m.id, { status: 'done' })
        return
      }
      if (seg.type === 'text' || seg.type === 'cta') {
        const full = seg.text
        if (m.chars < full.length) {
          const t = setTimeout(() => updateMsg(m.id, { chars: Math.min(full.length, m.chars + 6) }), 20)
          return () => clearTimeout(t)
        }
        const t = setTimeout(() => updateMsg(m.id, { step: m.step + 1, chars: 0 }), 240)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => updateMsg(m.id, { step: m.step + 1, chars: 0 }), 420)
      return () => clearTimeout(t)
    }
  }, [messages])

  const submitCanned = (label, content, specialist, approvePlan, approveLabel) => {
    setMessages(prev => [
      ...prev,
      { id: ++idRef.current, role: 'user', content: label, status: 'done' },
      { id: ++idRef.current, role: 'assistant', content, status: 'thinking',
        specialist: specialist ?? null,
        approvePlan: approvePlan ?? null,
        approveLabel: approveLabel ?? null },
    ])
  }

  const submitFreeForm = async (text) => {
    const userId      = ++idRef.current
    const assistantId = ++idRef.current
    const history     = [...messages].filter(m => m.role === 'user' || (m.role === 'assistant' && typeof m.content === 'string'))

    setMessages(prev => [
      ...prev,
      { id: userId, role: 'user', content: text, status: 'done' },
      { id: assistantId, role: 'assistant', content: null, status: 'thinking' },
    ])

    const apiMessages = [
      ...history.map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : '' })),
      { role: 'user', content: text },
    ]

    let replyText = null
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })
      if (r.ok) {
        const data = await r.json()
        replyText = typeof data?.text === 'string' && data.text.length > 0 ? data.text : null
      }
    } catch (_) { /* network error, fall through */ }

    if (!replyText) {
      replyText = "I'm offline from the live AI right now, but here's where I'd start: check the open role for Saturday, roster changes in the last hour, and any credentialing still in-flight. Nova can handle this when you're ready — set ANTHROPIC_API_KEY on the Vercel deploy for real answers."
    }

    const followup = detectFollowup(replyText)
    const visibleText = followup?.kind === 'action' ? stripFollowupLine(replyText) : replyText
    updateMsg(assistantId, {
      content:      visibleText,
      specialist:   followup?.kind === 'approve' ? followup.agentId : null,
      actionHint:   followup?.kind === 'action'  ? followup.label   : null,
      approveLabel: followup?.kind === 'approve' ? followup.label   : null,
    })
  }

  const submit = (text) => {
    const t = (text ?? input).trim()
    if (!t) return
    setInput('')
    const canned = suggestions.find(s => s.label.toLowerCase() === t.toLowerCase())
    if (canned) return submitCanned(canned.label, canned.answer, canned.specialist, canned.approvePlan, canned.approveLabel)
    return submitFreeForm(t)
  }

  // Keep a live ref to `submit` so the briefing-injection effect above can
  // wire click handlers on InlineBriefing without stale-closure pitfalls.
  const submitRef = useRef(submit)
  useEffect(() => { submitRef.current = submit })

  // Plan items shown when an agent is delegated. These describe what the
  // agent WILL DO — not what they've already finished. The actual work
  // happens in the background and the operator follows it in Agent Workflows.
  const SPECIALIST_PLAN = {
    nova:  ['Score qualified candidates by proximity, hours, and rating', 'Dispatch shift offer to the top match', 'Confirm acceptance and notify the charge lead'],
    atlas: ['Pull historical patterns for similar events', 'Stage the surge roster across affected positions', 'Hand the dispatch plan to Nova for offers'],
    iris:  ['Verify documents with the issuing authority', 'Run identity + background match', 'Clear and add to the appropriate roster'],
    sofia: ['Draft the communication with personal context', 'Stage delivery via SMS + in-app push', 'Monitor confirmations and follow up at the cut-off'],
    leo:   ['Pull overtime + certification records', 'Flag any compliance risk', 'Notify the affected workers and your ops lead'],
  }

  const handleApprove = (msg) => {
    const agentId = msg.specialist ?? 'nova'
    const steps   = msg.approvePlan ?? SPECIALIST_PLAN[agentId] ?? SPECIALIST_PLAN.nova
    const userLabel = msg.approveLabel ?? `Have ${getAgent(agentId)?.name ?? 'Nova'} take it`
    const progressId = ++idRef.current
    // 1) Post the user's "click" as a chat bubble right away, and drop a
    //    placeholder assistant bubble showing thinking dots.
    setMessages(prev => [
      ...prev.map(m => m.specialist ? { ...m, specialist: null, approveLabel: null } : m),
      { id: ++idRef.current, role: 'user', content: userLabel, status: 'done' },
      { id: progressId, role: 'progress', agentId, steps, status: 'thinking' },
    ])
    // 2) After a beat, flip the progress bubble into its running state so
    //    the plan reveals sequentially from zero.
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === progressId ? { ...m, status: 'running' } : m))
    }, 900)
  }

  const clear = () => { setMessages([]); setInput('') }

  const hasChat = messages.length > 0

  const askedLabels = new Set(
    messages.filter(m => m.role === 'user' && typeof m.content === 'string').map(m => m.content.toLowerCase())
  )
  const followupChips = (suggestions ?? [])
    .filter(s => !askedLabels.has(s.label.toLowerCase()))
    .slice(0, 3)

  return (
    <section className="prompt-panel" aria-label="Ask Teambridge">
      <div className="prompt-panel-inner">
        {hasChat && (
          <div className="prompt-panel-topbar">
            <button type="button" className="prompt-panel-clear" onClick={clear}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 15.5-6.2M21 4v5h-5M21 12a9 9 0 0 1-15.5 6.2M3 20v-5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Clear chat</span>
            </button>
          </div>
        )}

        {!hasChat
          ? <DailyBriefing industryId={industryId} view={view} onAction={submit} />
          : (
            <div className="prompt-messages" ref={scrollRef}>
              {messages.map(m => <Message key={m.id} message={m} onApprove={handleApprove} />)}
            </div>
          )}

        {hasChat && followupChips.length > 0 && (
          <div className="prompt-input-chips" role="list">
            {followupChips.map(s => (
              <button
                key={s.label}
                type="button"
                className="prompt-input-chip"
                onClick={() => submit(s.label)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="prompt-input">
          <textarea
            className="prompt-input-field"
            placeholder="Ask Teambridge…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            rows={hasChat ? 2 : 2}
          />
          <div className="prompt-input-footer">
            <button
              type="button"
              className="prompt-submit"
              aria-label="Send"
              onClick={() => submit()}
              disabled={input.trim().length === 0}
            >
              <ArrowNarrowRightIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Act1Dashboard({ industryId, view = 'overview', onBack, onExplore, onSelectView }) {
  const data = useMemo(() => getIndustryData(industryId), [industryId])

  return (
    <div className={`act1-root${view === 'schedule' ? ' act1-root--schedule' : ''}`}>
      <LeftNav
        industryLabel={data.label}
        view={view}
        onBrand={onBack}
        onAsk={onExplore}
        onSelectView={onSelectView}
      />

      <PromptPanel industryId={industryId} view={view} />

      {view === 'schedule'
        ? <ScheduleCalendar data={data} onDemo={() => showDemoToast()} />
        : <ActivityFeed data={data} />}

      <ToastHost />
    </div>
  )
}
