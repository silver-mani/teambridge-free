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
import { CurrencyDollarCircleIcon } from '../../../src/components/icons/CurrencyDollarCircleIcon.tsx'
import { Users03Icon }         from '../../../src/components/icons/Users03Icon.tsx'
import { GitBranch01Icon }     from '../../../src/components/icons/GitBranch01Icon.tsx'
import { BookOpen01Icon }     from '../../../src/components/icons/BookOpen01Icon.tsx'
import { MessageDotsSquareIcon } from '../../../src/components/icons/MessageDotsSquareIcon.tsx'
import { SearchSmIcon }        from '../../../src/components/icons/SearchSmIcon.tsx'
import { XIcon }                from '../../../src/components/icons/XIcon.tsx'
import { Microphone02Icon }    from '../../../src/components/icons/Microphone02Icon.tsx'
import { Mail01Icon }          from '../../../src/components/icons/Mail01Icon.tsx'
import { Map01Icon }           from '../../../src/components/icons/Map01Icon.tsx'
import { ArrowCircleBrokenRightIcon } from '../../../src/components/icons/ArrowCircleBrokenRightIcon.tsx'
import { SettingsGearIcon }    from '../../../src/components/icons/SettingsGearIcon.tsx'
import { ClockIcon }           from '../../../src/components/icons/ClockIcon.tsx'
import { PuzzlePiece01Icon }   from '../../../src/components/icons/PuzzlePiece01Icon.tsx'
import { getIndustryData }     from '../data/industryData.js'
import { getAgent, AGENTS }   from '../data/agents.js'
import { getCardDetail }       from '../data/cardDetails.js'
import { getPeriodSummary, getUserPeriod, fmt } from '../data/payData.js'
import ScheduleCalendar        from './ScheduleCalendar.jsx'
import PeopleList              from './PeopleList.jsx'
import PayView                 from './PayView.jsx'
import WorkflowsView           from './WorkflowsView.jsx'
import PoliciesView            from './PoliciesView.jsx'
import EngageView              from './EngageView.jsx'
import TimeTracking            from './TimeTracking.jsx'
import ShiftRequests           from './ShiftRequests.jsx'
import SettingsView            from './SettingsView.jsx'
import OnboardingView          from './OnboardingView.jsx'
import TimesheetsView          from './TimesheetsView.jsx'
import ReviewView              from './ReviewView.jsx'
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

/* Top groups + a bottom-pinned admin group. The bottom group lives in
   its own list with margin-top: auto so Workflows / Policy Builder /
   Settings always sit flush with the foot, regardless of how many
   items are in the top groups. */
const NAV_GROUPS = [
  {
    label: null, // Home gets its own ungrouped slot
    items: [
      { id: 'overview', label: 'Home', Icon: Home02Icon },
    ],
  },
  {
    label: 'Team',
    items: [
      { id: 'people',     label: 'People',     Icon: Users03Icon           },
      { id: 'onboarding', label: 'Onboarding', Icon: PuzzlePiece01Icon     },
      { id: 'engage',     label: 'Engage',     Icon: MessageDotsSquareIcon },
    ],
  },
  {
    label: 'Schedule',
    items: [
      { id: 'schedule',       label: 'Full Schedule',  Icon: Grid01Icon                 },
      { id: 'shift-requests', label: 'Shift Requests', Icon: ArrowCircleBrokenRightIcon },
    ],
  },
  {
    label: 'Time Tracking',
    items: [
      { id: 'time-tracking', label: 'Live Tracking', Icon: Map01Icon  },
      { id: 'timesheets',    label: 'Timesheets',    Icon: ClockIcon  },
    ],
  },
  {
    label: 'Pay',
    items: [
      { id: 'pay',    label: 'Payroll', Icon: CurrencyDollarCircleIcon },
      { id: 'review', label: 'Review',  Icon: ClipboardCheckIcon       },
    ],
  },
]

const NAV_BOTTOM_GROUP = {
  label: 'Admin',
  items: [
    { id: 'workflows', label: 'Agent Workflows', Icon: GitBranch01Icon },
    { id: 'policies',  label: 'Policy Builder',  Icon: BookOpen01Icon  },
    { id: 'settings',  label: 'Settings',        Icon: SettingsGearIcon },
  ],
}

function LeftNav({ industryLabel, view, onBrand, onAsk, onSelectView, sageMode = false }) {
  const renderItem = (item) => {
    const active = item.id === view || (item.id === 'overview' && view === 'overview')
    return (
      <button
        key={item.id}
        type="button"
        className={`act1-nav-item ${active ? 'act1-nav-item-active' : ''} ${item.ai ? 'act1-nav-item-ai' : ''}`}
        onClick={() => onSelectView?.(item.id)}
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
  }
  const renderGroup = (group, key) => (
    <div className="act1-nav-group" key={key}>
      {group.label && <div className="act1-nav-group-label">{group.label}</div>}
      {group.items.map(renderItem)}
    </div>
  )

  return (
    <aside className="act1-nav" aria-label="Primary">
      {!sageMode && (
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
      )}

      <nav className="act1-nav-list">
        {NAV_GROUPS.map((g, i) => renderGroup(g, `top-${i}`))}
        <div className="act1-nav-spacer" />
        {renderGroup(NAV_BOTTOM_GROUP, 'bottom')}
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

function ActivityCard({ card, expanded = false, onToggle, dimmed = false, live = false }) {
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
    live       && 'activity-card-live-in',
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

function ActivityFeed({ data, injectedCard, cardOverrides, onClose }) {
  const [expandedId, setExpandedId] = useState(null)
  const toggle = id => setExpandedId(curr => curr === id ? null : id)
  // When the scripted scene has posted a live card, render it above the
  // data-driven cards so it reads as the freshest event.
  const applyOverride = (card) => cardOverrides?.[card.id] ? { ...card, ...cardOverrides[card.id] } : card
  return (
    <aside className="activity-feed" aria-label="Activity">
      <div className="activity-feed-inner">
        <div className="activity-feed-header">
          <h2 className="activity-feed-title">Activity</h2>
          {onClose && (
            <button
              type="button"
              className="activity-feed-close"
              onClick={onClose}
              aria-label="Close activity drawer"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
        <div className="feed">
          {injectedCard && (() => {
            const shown = applyOverride(injectedCard)
            return (
              <ActivityCard
                key={shown.id}
                card={shown}
                expanded={expandedId === shown.id}
                onToggle={() => toggle(shown.id)}
                live
              />
            )
          })()}
          {data.activeCard && (
            <ActivityCard
              card={applyOverride(data.activeCard)}
              expanded={expandedId === data.activeCard.id}
              onToggle={() => toggle(data.activeCard.id)}
            />
          )}
          {data.feed.map(card => {
            const shown = applyOverride(card)
            return (
              <ActivityCard
                key={shown.id}
                card={shown}
                expanded={expandedId === shown.id}
                onToggle={() => toggle(shown.id)}
              />
            )
          })}
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
      { id: 'coverage-chart', tone: 'warning',
        title: 'Gate coverage for Saturday',
        desc:  '47 of 48 confirmed · 1 open role at Gate 3.',
        action: { label: 'See coverage', prompt: 'Coverage by gate for Saturday' } },
      { id: 'prebrief', tone: 'info',
        title: 'Pre-game crew brief not drafted',
        desc:  '48 staff report Saturday at 5 PM.',
        action: { label: 'Draft brief', prompt: 'Draft the pre-game crew briefing' } },
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

/* Briefing set when the user is on Onboarding — insights are pipeline:
   what's stuck, what's running clean, and which workflow owns the
   automation behind it. */
const ONBOARDING_BRIEFING = {
  events: {
    time: '9:04 AM',
    greeting: "30 candidates in the funnel — here's where to push next.",
    situations: [
      { id: 'background-stuck', tone: 'warning',
        title: '6 candidates stuck in Background Check',
        desc:  'Median time-in-stage is 9 days — vendor SLA is 48 hrs. James Ulrich has been there 6 weeks.',
        action: { label: 'Chase vendor', prompt: "Chase the background-check vendor on the 6 stuck candidates" } },
      { id: 'docusign-pending', tone: 'warning',
        title: '5 in DocuSign · oldest is 1 year old',
        desc:  'Jane Matthews and Milly Gold have packets out since 2025. Send a reminder or close them out.',
        action: { label: 'Send reminders', prompt: 'Send DocuSign reminders to candidates older than 30 days' } },
      { id: 'auto-advance', tone: 'info',
        title: 'Onboarding Auto-Advance handled 4 candidates this week',
        desc:  'Iris pushed Olivia, Diego, Devon, and Priya through Form → Hired with no human touch.',
        action: { label: 'Open workflow', prompt: 'Open the Onboarding Auto-Advance workflow' } },
      { id: 'cred-tier', tone: 'info',
        title: 'Amy Jain ready for Platinum tier review',
        desc:  '7 role qualifications · 9 months tenure pending · waiting on Super Admin sign-off.',
        action: { label: 'Promote', prompt: "Open Amy Jain's tier review" } },
    ],
  },
}

/* Briefing set when the user is on Time Tracking — insights are live-ops:
   who's currently in / on break / late, where the load is concentrated,
   and one anomaly worth surfacing. Events-only for now. */
const TIME_TRACKING_BRIEFING = {
  events: {
    time: '9:04 AM',
    greeting: "Live ops snapshot — here's what's happening on the floor right now.",
    situations: [
      { id: 'levi-load', tone: 'info',
        title: '14 clocked in at Levi\'s Stadium',
        desc:  'Heaviest concentration of the day — pre-game prep is on track.',
        action: { label: 'Open venue', prompt: "Show me everyone clocked in at Levi's right now" } },
      { id: 'late', tone: 'warning',
        title: 'Marcus J. is 9 min late',
        desc:  'Civic Arena, Friday 4 PM usher shift. Sera attempted contact twice.',
        action: { label: 'Notify backup', prompt: 'Find a backup for the Civic 4 PM usher shift' } },
      { id: 'breaks', tone: 'info',
        title: '2 on break right now',
        desc:  'Diane Kim and Tasha K. — both due back within 10 minutes.',
        action: { label: 'Track returns', prompt: 'Ping Diane and Tasha when their breaks end' } },
      { id: 'mobile', tone: 'info',
        title: 'Trevor on mobile crew, 1h 48m elapsed',
        desc:  'Off-site security run. Geofence active, no flags.',
        action: { label: 'Last location', prompt: "Show Trevor's last clock-in location" } },
    ],
  },
}

/* Briefing set when the user is viewing the Shift Requests queue —
   insights call out the highest-impact pending requests and what
   Nova would do with them. */
const SHIFT_REQUESTS_BRIEFING = {
  events: {
    time: '9:04 AM',
    greeting: "8 pending requests — here's what to clear first.",
    situations: [
      { id: 'miguel-swap', tone: 'warning',
        title: 'Miguel\'s Sat swap restores the OT cap',
        desc:  'Approving the swap to Jordan K. drops Miguel from 41 → 32 hrs. No pay change.',
        action: { label: 'Approve', prompt: 'Approve Miguel\'s Saturday swap to Jordan' } },
      { id: 'carlos-extend', tone: 'warning',
        title: 'Carlos\'s Friday→Saturday extension would cost $420 OT',
        desc:  'Approving pushes him to 47 hrs and trips the cap. Nova recommends decline.',
        action: { label: 'Decline', prompt: 'Decline Carlos\'s Saturday extension request' } },
      { id: 'auto-approve', tone: 'info',
        title: '5 requests are clean approvals',
        desc:  'No cap impact, qualified candidates on file. One-click bulk approve.',
        action: { label: 'Bulk approve', prompt: 'Approve all clean shift requests' } },
      { id: 'sandra-cover', tone: 'info',
        title: 'Sandra needs Saturday cover',
        desc:  'Rachel W. is the best fit (qualified, lands at 31 hrs after).',
        action: { label: 'Suggest Rachel', prompt: 'Offer Sandra\'s Saturday shift to Rachel W.' } },
    ],
  },
}

/* Briefing set when the user is on Timesheets — flags the rows that
   need eyes before the period closes. Numbers reconcile with the
   table rendered alongside. */
const TIMESHEETS_BRIEFING = {
  events: {
    time: '9:04 AM',
    greeting: "Apr 27 – May 3 timesheets — here's what's blocking sign-off.",
    situations: [
      { id: 'flagged', tone: 'warning',
        title: '5 timesheets flagged for OT/cap breach',
        desc:  'Diane, Carlos, Maria, Ravi, David — all from Saturday Niners-game extensions.',
        action: { label: 'Open flagged', prompt: 'Show only the flagged timesheets' } },
      { id: 'approaching', tone: 'info',
        title: '2 approaching the 40-hr cap',
        desc:  'Jordan K. (37 hrs) and Hugo Reyes (39 hrs) need sign-off after a re-balance.',
        action: { label: 'Review approaching', prompt: 'Show approaching-OT timesheets' } },
      { id: 'late', tone: 'warning',
        title: 'Tasha K. — 2 late clock-ins this period',
        desc:  'Pattern flag triggered. Pay clocked time as-is and surface to Engage.',
        action: { label: 'Send Engage note', prompt: 'Open an Engage thread with Tasha about lateness' } },
      { id: 'bulk', tone: 'info',
        title: '5 clean rows ready to approve in one click',
        desc:  'Rachel, Priya, Sofia, Amir, plus Marcus once his Friday clock-out finalizes.',
        action: { label: 'Approve clean', prompt: 'Approve all clean timesheets for this period' } },
    ],
  },
}

/* Briefing set when the user is on Pay Review — exception queue with
   pay impact, ordered by Nova's "do this next" sequence. */
const REVIEW_BRIEFING = {
  events: {
    time: '9:04 AM',
    greeting: "Apr 27 – May 3 pay review — 6 exceptions before payroll runs Friday.",
    situations: [
      { id: 'diane-cap', tone: 'warning',
        title: 'Diane Kim Sat shift exceeds 12-hr cap',
        desc:  '14 hrs logged. Daily-cap policy auto-blocks pay until ops signs off the 2-hr overage.',
        action: { label: 'Resolve', prompt: 'Apply Nova\'s recommendation for Diane\'s Saturday shift' } },
      { id: 'carlos-ot', tone: 'warning',
        title: 'Carlos +5 hrs OT — GM-approved',
        desc:  'Needs 1.5× rate applied. ~$420 premium. Sign-off already on file.',
        action: { label: 'Apply rate', prompt: 'Apply 1.5× OT rate to Carlos\'s 5 OT hours' } },
      { id: 'auto-clear', tone: 'info',
        title: '4 exceptions are auto-resolvable',
        desc:  'Tasha late clock-ins, Marcus Friday auto-out, Priya PTO split, Sandra no-show drop.',
        action: { label: 'Bulk clear', prompt: 'Clear the 4 auto-resolvable exceptions' } },
      { id: 'budget', tone: 'warning',
        title: 'OT premium $3,840 this period',
        desc:  '+182% vs. budget. Most of it concentrates on Saturday Levi\'s shifts.',
        action: { label: 'Budget breakdown', prompt: 'Show OT premium breakdown by venue' } },
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

/* Briefing set when the user is on the People page — insights focus on
   credentials, new hires, leaves, and overtime risk across the roster. */
const PEOPLE_BRIEFING = {
  events: {
    time: '9:04 AM',
    greeting: "Scanning your people — here's what needs attention.",
    situations: [
      { id: 'cert-expiring', tone: 'warning',
        title: '2 TABC certs expire this week',
        desc:  'Priya and Lydia — renewal session Tuesday.',
        action: { label: 'Renew certs', prompt: 'Renew expiring TABC certs' } },
      { id: 'new-hires', tone: 'info',
        title: '3 new hires pending',
        desc:  'Diego, Sarah, Elena — first-shift packets due.',
        action: { label: 'Draft packets', prompt: 'Draft the onboarding packet for Sarah' } },
      { id: 'sandra-leave', tone: 'warning',
        title: 'Sandra still on leave',
        desc:  'No projected return date — covering 2 shifts this week.',
        action: { label: 'Follow up', prompt: 'Follow up with Sandra on return date' } },
      { id: 'ot-marcus', tone: 'warning',
        title: 'Marcus J. at 38 of 40 hrs',
        desc:  'Drop Saturday or shift to Sunday to avoid overtime.',
        action: { label: 'Check OT', prompt: 'Check overtime risk for Saturday' } },
    ],
  },
}

/* Pay briefings — static for the home (dashboard) screen, dynamically
   computed for the period and user drill-ins so every number in the chat
   matches the number on screen. */
const PAY_HOME_BRIEFING = {
  events: {
    time: '9:04 AM',
    greeting: 'Scanning payroll across open periods — here\'s what to tackle first.',
    situations: [
      { id: 'pending', tone: 'warning',
        title: '12 timecards pending across 2 open periods',
        desc:  'Feb 16–29 is in approval; Jan 16–31 still has workers outstanding.',
        action: { label: 'Open Feb 16–29', prompt: 'Open the Feb 16–29 pay period' } },
      { id: 'instant-pay', tone: 'info',
        title: 'Instant Pay at 4% of current-period gross',
        desc:  'Well within plan. Three workers pulled early payouts this period.',
        action: { label: 'See breakdown', prompt: 'Break down instant pay usage by worker' } },
      { id: 'adjustments', tone: 'info',
        title: '4 adjustments waiting approval',
        desc:  'Mileage, coverage bonuses, and a manual time correction.',
        action: { label: 'Review adjustments', prompt: 'Open the adjustments queue' } },
    ],
  },
}

/* Build a period-specific briefing from the actual summary data so copy and
   numbers stay in lockstep with the table on screen. */
function buildPeriodBriefing(industryId, periodId) {
  const summary = getPeriodSummary(industryId, periodId)
  const { period, rows, totals } = summary
  const pct = totals.totalGross ? Math.round((totals.totalInstantPay / totals.totalGross) * 100) : 0
  const otWorkers = rows
    .filter(r => r.otHours > 0 || r.dotHours > 0)
    .sort((a, b) => (b.otHours + b.dotHours) - (a.otHours + a.dotHours))
  const topOt = otWorkers[0]

  const situations = []
  if (totals.pendingApproval > 0) {
    situations.push({
      id: 'pending', tone: 'warning',
      title: `${totals.pendingApproval} timecard${totals.pendingApproval === 1 ? '' : 's'} still pending`,
      desc:  `Approve to close ${period.short} cleanly. Total gross ${fmt(totals.totalGross)}.`,
      action: { label: 'Approve remaining', prompt: `Approve the ${totals.pendingApproval} pending timecards` },
    })
  }
  situations.push({
    id: 'instant-pay', tone: 'info',
    title: `Instant Pay at ${pct}% of gross`,
    desc:  `${fmt(totals.totalInstantPay)} issued · ${totals.workers} workers this period.`,
    action: { label: 'See breakdown', prompt: 'Break down instant pay usage by worker' },
  })
  if (topOt) {
    const hrs = topOt.otHours + topOt.dotHours
    const first = topOt.person.name.split(' ')[0]
    situations.push({
      id: 'ot', tone: 'warning',
      title: `${first} logged ${hrs} hrs at OT rates`,
      desc:  `Premium pay ${fmt(topOt.overtime + topOt.doubleOt)}. Verify coverage approval.`,
      action: { label: 'Verify OT', prompt: `Show ${topOt.person.name}'s OT shifts this period` },
    })
  }
  if (totals.adjustmentsCount > 0) {
    situations.push({
      id: 'adjustments', tone: 'info',
      title: `${totals.adjustmentsCount} adjustment${totals.adjustmentsCount === 1 ? '' : 's'} this period`,
      desc:  `Net ${totals.totalAdjustments >= 0 ? '+' : ''}${fmt(totals.totalAdjustments)} across mileage + corrections.`,
      action: { label: 'Review adjustments', prompt: 'Open the adjustments queue' },
    })
  }
  return {
    time: '9:04 AM',
    greeting: `Zoomed in on ${period.short} — here's what's outstanding.`,
    situations,
  }
}

/* Build a user-in-period briefing. Maximally specific: this person, this
   period, their gross/net/OT/adjustment lines straight off their breakdown. */
function buildUserBriefing(industryId, periodId, personId) {
  const detail = getUserPeriod(industryId, periodId, personId)
  const { period, person, breakdown, shifts, timeOff } = detail
  const first = person.name.split(' ')[0]

  const situations = []
  situations.push({
    id: 'summary', tone: 'info',
    title: `${first}'s gross: ${fmt(breakdown.gross)}`,
    desc:  `Net ${fmt(breakdown.net)} after ${fmt(breakdown.instantPay)} instant pay · ${breakdown.regularHours + breakdown.otHours + breakdown.dotHours + breakdown.holidayHours} hrs total.`,
    action: { label: 'Open profile', prompt: `Open ${person.name}'s profile` },
  })

  const premiumHours = breakdown.otHours + breakdown.dotHours
  if (premiumHours > 0) {
    situations.push({
      id: 'ot', tone: 'warning',
      title: `${premiumHours} hrs at OT rates`,
      desc:  `Premium pay ${fmt(breakdown.overtime + breakdown.doubleOt)}. Confirm approval before sign-off.`,
      action: { label: 'Review OT shifts', prompt: `Show ${first}'s OT shifts this period` },
    })
  }

  if (breakdown.adjustments.length > 0) {
    const a = breakdown.adjustments[0]
    situations.push({
      id: 'adj', tone: 'info',
      title: a.label,
      desc:  `${a.amount >= 0 ? '+' : ''}${fmt(a.amount)} applied to ${first}'s net pay.`,
      action: { label: 'View adjustment', prompt: `Show the ${a.label.toLowerCase()} adjustment for ${first}` },
    })
  }

  if (breakdown.instantPay > 0) {
    situations.push({
      id: 'instant', tone: 'info',
      title: `Instant Pay: ${fmt(breakdown.instantPay)}`,
      desc:  `Already paid out · nets against this period's gross.`,
      action: { label: 'Audit trail', prompt: `Show ${first}'s instant pay history` },
    })
  }

  const pendingShifts = shifts.filter(s => !s.paid).length
  if (pendingShifts > 0) {
    situations.push({
      id: 'pending', tone: 'warning',
      title: `${pendingShifts} shift${pendingShifts === 1 ? '' : 's'} pending approval`,
      desc:  `${first}'s most recent shifts haven't been signed off yet.`,
      action: { label: 'Approve shifts', prompt: `Approve ${first}'s pending shifts` },
    })
  }

  if (timeOff.length > 0) {
    const t = timeOff[0]
    situations.push({
      id: 'pto', tone: 'info',
      title: `${t.type} on ${t.endTime}`,
      desc:  `${t.hours} hrs · ${t.paid ? 'Paid' : 'Unpaid'}.`,
      action: { label: 'Review PTO', prompt: `Show ${first}'s time off` },
    })
  }

  return {
    time: '9:04 AM',
    greeting: `${person.name} · ${period.short} — here's the snapshot.`,
    situations,
  }
}

function briefingFor(view, industryId, paySubRoute) {
  if (view === 'schedule')        return SCHEDULE_BRIEFING
  if (view === 'people')          return PEOPLE_BRIEFING
  if (view === 'time-tracking')   return TIME_TRACKING_BRIEFING
  if (view === 'shift-requests')  return SHIFT_REQUESTS_BRIEFING
  if (view === 'timesheets')      return TIMESHEETS_BRIEFING
  if (view === 'review')          return REVIEW_BRIEFING
  if (view === 'onboarding')      return ONBOARDING_BRIEFING
  if (view === 'pay') {
    if (paySubRoute?.screen === 'user' && paySubRoute.periodId && paySubRoute.personId) {
      return { events: buildUserBriefing(industryId, paySubRoute.periodId, paySubRoute.personId) }
    }
    if (paySubRoute?.screen === 'period' && paySubRoute.periodId) {
      return { events: buildPeriodBriefing(industryId, paySubRoute.periodId) }
    }
    return PAY_HOME_BRIEFING
  }
  return BRIEFING
}

function DailyBriefing({ industryId, view = 'overview', paySubRoute, briefKey, onAction }) {
  const set = briefingFor(view, industryId, paySubRoute)
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
        /* Keying the article on briefKey remounts the animated content when
           the user drills into a Pay sub-screen, so the greeting re-types and
           the situation cards re-stagger in. */
        <article key={briefKey} className="briefing-compact">
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

/* Total char count a thinking segment will stream, derived from its titled
   steps. Must mirror the per-char accounting done by revealThinkingSteps
   so the streaming state machine knows when to advance to the next
   segment. Title + '\n' + detail, joined by '\n' between steps. */
function thinkingSegmentLength(seg) {
  const steps = seg.steps ?? []
  if (!steps.length) return 0
  let total = 0
  steps.forEach((s, i) => {
    total += (s.title?.length ?? 0) + 1 + (s.detail?.length ?? 0)
    if (i < steps.length - 1) total += 1 // separator between steps
  })
  return total
}

/* Walk through the steps consuming `charsRevealed` chars — title first,
   then detail (prefixed by one char for the title/detail separator), then
   move to the next step (skipping one more char for the step separator). */
function revealThinkingSteps(steps, charsRevealed) {
  if (charsRevealed === Infinity) return steps.map(s => ({ title: s.title, detail: s.detail }))
  const out = []
  let remaining = charsRevealed
  for (const step of steps) {
    if (remaining <= 0) break
    const titleLen = step.title?.length ?? 0
    if (remaining < titleLen) {
      out.push({ title: step.title.slice(0, remaining), detail: '' })
      remaining = 0
      break
    }
    remaining -= titleLen
    // One char gap between title and detail.
    if (remaining <= 0) { out.push({ title: step.title, detail: '' }); break }
    remaining -= 1
    const detailLen = step.detail?.length ?? 0
    if (remaining < detailLen) {
      out.push({ title: step.title, detail: step.detail.slice(0, remaining) })
      remaining = 0
      break
    }
    remaining -= detailLen
    out.push({ title: step.title, detail: step.detail })
    // One char gap between this step and the next.
    if (remaining <= 0) break
    remaining -= 1
  }
  return out
}

/* Reasoning block — titled steps (title + detail) like Claude's "Used N
   tools" accordions. Each title is clickable to collapse or expand its
   detail; default expanded so the chain of reasoning reads naturally
   as it streams in, but the operator can fold any step away once it's
   landed. */
function ThinkingSegment({ seg, charsRevealed }) {
  const steps = seg.steps ?? []
  const revealed = revealThinkingSteps(steps, charsRevealed)
  // Steps collapse to just their titles by default — the operator scans
  // the chain of reasoning at a glance and opens any one that's worth a
  // closer look. Track per-step open state explicitly so an early user
  // click doesn't get undone when more steps stream in.
  const [open, setOpen] = useState({})
  const isOpen = (i) => !!open[i]
  const toggle = (i) => setOpen(prev => ({ ...prev, [i]: !prev[i] }))

  return (
    <div className="prompt-seg prompt-seg-thinking">
      <div className="prompt-seg-thinking-eyebrow">
        <span className="prompt-seg-thinking-pulse" aria-hidden="true" />
        Thinking
      </div>
      <ul className="prompt-seg-thinking-steps">
        {revealed.map((r, i) => {
          const hasDetail = !!r.detail
          const expanded = isOpen(i)
          return (
            <li key={i} className={`prompt-seg-thinking-step${expanded ? ' is-open' : ''}`}>
              <button
                type="button"
                className="prompt-seg-thinking-step-title"
                onClick={hasDetail ? () => toggle(i) : undefined}
                aria-expanded={hasDetail ? expanded : undefined}
              >
                <span className="prompt-seg-thinking-step-chevron" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="prompt-seg-thinking-step-label">{r.title}</span>
              </button>
              {hasDetail && expanded && (
                <div className="prompt-seg-thinking-step-detail">{r.detail}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Segment({ seg, charsRevealed }) {
  if (seg.type === 'text' || seg.type === 'cta') {
    const text = seg.text.slice(0, charsRevealed)
    const cls  = seg.type === 'cta' ? 'prompt-seg prompt-seg-cta' : 'prompt-seg prompt-seg-text'
    return <div className={cls}>{renderInlineBold(text)}</div>
  }
  if (seg.type === 'signal') {
    // "We noticed something" card — transparent fill, light grey stroke,
    // shown BEFORE the thinking block so the operator sees what event
    // triggered the reasoning. Non-streaming; appears as a single unit.
    return (
      <div className="prompt-seg prompt-seg-signal">
        <span className="prompt-seg-signal-icon" aria-hidden="true">
          <AlertTriangleIcon size={14} />
        </span>
        <div className="prompt-seg-signal-text">
          {seg.eyebrow && <div className="prompt-seg-signal-eyebrow">{seg.eyebrow}</div>}
          <div className="prompt-seg-signal-title">{seg.title}</div>
          {seg.detail && <div className="prompt-seg-signal-detail">{seg.detail}</div>}
        </div>
      </div>
    )
  }
  if (seg.type === 'thinking') {
    return <ThinkingSegment seg={seg} charsRevealed={charsRevealed} />
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

/* Per-action CTA copy for the link below a progress message. The action
   is set on the message itself (see `workflowAction` on scripted scenes
   and inline replies). Returning null hides the link entirely — useful
   for runs whose outcome is the workflow itself (e.g. "Save as workflow"
   has its own confirmation bubble afterwards). */
const WORKFLOW_CTA_LABELS = {
  review:   'Review workflow',
  create:   'Save as new workflow',
  update:   'Update workflow with this change',
  'add-step': 'Add notification step to workflow',
  none:     null,
}
function workflowCta(action) {
  if (!action) return WORKFLOW_CTA_LABELS.review
  return WORKFLOW_CTA_LABELS[action] ?? WORKFLOW_CTA_LABELS.review
}

function ProgressMessage({ message }) {
  const agent = message.agentId ? getAgent(message.agentId) : null
  const steps = message.steps ?? []
  const agentName = agent ? `${agent.name} (${agent.role})` : 'Teambridge AI'
  const isThinking = message.status === 'thinking'
  // Per-message override so scripted scenes can advance faster than the
  // default 18s pacing used for background workflows.
  const stepDuration = message.stepDurationMs ?? PROGRESS_STEP_DURATION_MS

  const [activeIdx, setActiveIdx] = useState(0)
  const allDone = !isThinking && activeIdx >= steps.length

  // CTA below the step list — what clicking it actually does depends on
  // whether this run is creating a workflow, modifying one, or just
  // executing an existing one. Default reads "Review workflow"; scripted
  // scenes that create or update a workflow can pass an action explicitly.
  const cta = workflowCta(message.workflowAction)

  useEffect(() => {
    if (isThinking || allDone) return
    const t = setTimeout(() => setActiveIdx(i => i + 1), stepDuration)
    return () => clearTimeout(t)
  }, [activeIdx, allDone, isThinking, stepDuration])

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
        {cta && (
          <button type="button" className="progress-workflow-link" onClick={() => showDemoToast()}>
            <GitBranch01Icon size={12} />
            <span>{cta}</span>
            <ArrowNarrowRightIcon size={12} />
          </button>
        )}
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

/* ─── Scripted "Sandra cancelled" scene ───────────────────────────────────
   Four message specs that play back sequentially when the user lands on
   the Events home with an empty chat. Shape matches the normal assistant
   message shape so the streaming state machine animates them naturally. */
const RACHEL_ATTACHMENT = {
  type: 'attachment',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces&auto=format',
  title: 'Rachel Williams · Usher',
  subtitle: '1.7 mi · 18 hrs this week · 4 events this month · 100% last-min accept rate',
  actions: [{ label: 'View shift' }],
}

const SANDRA_SCENE = {
  // 1) The first message the prospect sees — AI reasoning through the
  //    replacement search, ending with a canned "Yes, reach out" button.
  reachOutPrompt: {
    content: { segments: [
      { type: 'signal',
        eyebrow: 'Activity flagged · might need resolution',
        title: 'Sandra Lee cancelled her Saturday 7pm usher shift',
        detail: 'Civic Auditorium · 3.5 hrs notice' },
      { type: 'thinking', steps: [
        { title: 'Parsed the cancellation',
          detail: 'Sandra Lee cancelled her Saturday 7pm usher shift at Civic Auditorium. 3.5 hrs notice.' },
        { title: 'Pulled the candidate pool',
          detail: 'Civic-credentialed ushers in a sensible commute radius who are under 32 hrs this week, so no one gets pushed into overtime.' },
        { title: 'Filtered down to 12',
          detail: '64 ushers in range → 38 Civic-qualified → 21 free at 7pm → 18 under OT cap → 12 opted in to last-min offers.' },
        { title: 'Ranked the 12',
          detail: 'Proximity (traffic-adjusted), 90-day performance, last-min accept rate, and hours fairness so the same people aren\'t always on call.' },
      ] },
      { type: 'text', text: "Found **12 qualified replacements**. Top 3 are inside 4 miles with 90%+ accept rates. Want me to reach out to them in parallel?" },
    ] },
    specialist: 'nova',
    approveLabel: 'Yes, reach out',
    approvePlan: [
      'Dispatching offers to Rachel W., David K., Priya S.',
      'Monitoring responses (cut-off: 90 seconds)',
      'Confirming the winner and locking the schedule',
    ],
    // Reach-out should feel like real work, not a blink. ~3.5s per step is
    // the sweet spot — fast enough to keep momentum, long enough that the
    // prospect reads each step and trusts Nova isn't faking it.
    stepDurationMs: 3500,
    sceneAfter: ({ postAssistant }) => postAssistant(SANDRA_SCENE.rachelAccepted),
  },

  // 2) Outcome of reach-out — Rachel accepted. Prospect clicks Approve.
  rachelAccepted: {
    content: { segments: [
      { type: 'text', text: "**Rachel Williams** accepted at the posted rate — no pay change needed. Offered in **47 seconds**." },
      RACHEL_ATTACHMENT,
      { type: 'cta', text: "Send her the pre-shift brief and lock the schedule?" },
    ] },
    specialist: 'nova',
    approveLabel: 'Approve & notify',
    approvePlan: [
      'Send the pre-shift brief to Rachel',
      'Update the Saturday schedule at Civic Auditorium',
      'Log the swap with Miguel (event lead)',
    ],
    stepDurationMs: 1200,
    sceneAfter: ({ postAssistant, overrideActivityCard }) => {
      overrideActivityCard?.('sandra-cancellation-live', {
        status: 'resolved',
        statusLabel: 'Resolved',
        description: 'Rachel Williams picked up the shift · 47s to fill · no pay delta.',
      })
      postAssistant(SANDRA_SCENE.success)
    },
  },

  // 3) Covered. Metrics block + offer to codify the pattern.
  success: {
    content: { segments: [
      { type: 'text', text: "Shift covered. Schedule is locked and Miguel is notified." },
      { type: 'metrics', items: [
        { value: '✓',    label: 'Coverage' },
        { value: '47 s', label: 'Time to fill' },
        { value: '$0',   label: 'Pay delta' },
        { value: 'None', label: 'OT risk' },
      ] },
      { type: 'cta', text: "Want to save this as a **Last-min Replacement** workflow? Nova will handle cancellations the same way next time — no approval required unless something's off." },
    ] },
    specialist: 'nova',
    approveLabel: 'Save as workflow',
    workflowAction: 'create',
    approvePlan: [
      'Capture the ranking rules and notification policy',
      'Save as "Last-min Replacement" workflow · owner: you',
    ],
    stepDurationMs: 1200,
    sceneAfter: ({ postAssistant }) => postAssistant(SANDRA_SCENE.savedConfirmation),
  },

  // 4) Final bubble — saved. The CTA button routes the operator straight
  //    into the Workflow editor on the Last-min Replacement detail.
  savedConfirmation: {
    content: { segments: [
      { type: 'text', text: "Saved. Nova will auto-run **Last-min Replacement** next time someone cancels — I'll only ping you if hours are tight or a pay bump is needed." },
      { type: 'cta', text: "Open in **Agent Workflows** to tweak the rules." },
    ] },
    specialist: 'nova',
    approveLabel: 'Open workflow editor',
    target: 'workflows',
    workflowId: 'last-min-replacement',
  },
}

/* ─── OT crisis scene (Sage Intacct → Workforce handoff) ────────────────
   Plays automatically when the operator lands on the Schedule view via
   the Sage embed (sageMode + events + view=schedule + empty chat). The
   CFO dashboard flagged OT +232% over budget; Nova picks it up here,
   names the at-risk staff, and offers to redistribute shifts. */
const OT_SCENE = {
  alert: {
    content: { segments: [
      { type: 'signal',
        eyebrow: 'Handoff from Sage Intacct · OT crisis',
        title: '5 employees projected to exceed their OT cap this week',
        detail: 'Levi\'s Stadium · combined exposure $27.5k · 7 departments affected' },
      { type: 'thinking', steps: [
        { title: 'Pulled the OT-risk roster',
          detail: 'Cross-referenced this week\'s schedule against the 40-hr OT cap. Anyone projected ≥38 hrs is on the list.' },
        { title: 'Named the exposure',
          detail: 'Miguel R. (32 → 46 proj.), Marcus J. (38 → 44), Priya S. (36 → 42), Diane K. (37 → 41), Carlos M. (35 → 41).' },
        { title: 'Costed it',
          detail: 'At the venue\'s 1.5× OT rate, that\'s $27,500 of preventable overtime — about 57% of the MTD overage Sage Intacct flagged.' },
        { title: 'Identified swap candidates',
          detail: 'Same venue, same credentials, under-cap, opted into shift offers: 14 viable workers across the affected shifts.' },
      ] },
      { type: 'text', text: "I can run a **replacement-shift workflow** — redistribute the at-risk shifts to qualified, under-cap workers and bring this week back inside the OT line. **Want me to run it?**" },
    ] },
    specialist: 'nova',
    approveLabel: 'Yes, run replacement flow',
    approvePlan: [
      'Drafting swap proposals for the 5 OT-risk employees',
      'Pinging candidates in priority order (cut-off: 90 seconds)',
      'Locking confirmed swaps and updating the schedule',
    ],
    stepDurationMs: 3500,
    sceneAfter: ({ postAssistant }) => postAssistant(OT_SCENE.proposals),
  },

  proposals: {
    content: { segments: [
      { type: 'text', text: "Drafted **5 swaps**. Every candidate is under-cap, same-venue, and credentialed. Total OT prevented: **23.5 hrs · $27,500** — and zero coverage gaps." },
      { type: 'metrics', items: [
        { value: '5',      label: 'Swaps proposed' },
        { value: '23.5h',  label: 'OT redistributed' },
        { value: '$27.5k', label: 'OT prevented' },
        { value: '0',      label: 'Coverage gaps' },
      ] },
      { type: 'cta', text: "Approve all 5 swaps and notify the affected staff?" },
    ] },
    specialist: 'nova',
    approveLabel: 'Approve all swaps',
    approvePlan: [
      'Sending swap offers to the 5 replacement workers',
      'Notifying the 5 OT-risk employees of their changed shifts',
      'Updating Saturday + Sunday schedules at Levi\'s Stadium',
    ],
    stepDurationMs: 1500,
    sceneAfter: ({ postAssistant }) => postAssistant(OT_SCENE.success),
  },

  success: {
    content: { segments: [
      { type: 'text', text: "Done. Schedule is locked, OT cap is restored, and Sage Intacct will pick up the labor-cost correction in tonight's sync." },
      { type: 'metrics', items: [
        { value: '✓',      label: 'OT under cap' },
        { value: '$27.5k', label: 'Saved this week' },
        { value: '5/5',    label: 'Swaps confirmed' },
        { value: 'None',   label: 'Coverage gaps' },
      ] },
      { type: 'cta', text: "Want to save this as an **OT Cap Enforcement** workflow? Nova will run it automatically whenever projected hours cross the line." },
    ] },
    specialist: 'nova',
    approveLabel: 'Save as workflow',
    approvePlan: [
      'Capturing the OT-cap rule and replacement policy',
      'Saving as "OT Cap Enforcement" workflow · owner: you',
    ],
    stepDurationMs: 1200,
    sceneAfter: ({ postAssistant }) => postAssistant(OT_SCENE.savedConfirmation),
  },

  savedConfirmation: {
    content: { segments: [
      { type: 'text', text: "Saved. Nova will auto-run **OT Cap Enforcement** going forward — I'll only escalate if a swap can't be filled or no credentialed match is available." },
    ] },
    specialist: 'nova',
  },
}

/* ─── Prompt panel ──────────────────────────────────────────────────────── */

function PromptPanel({ industryId, view = 'overview', paySubRoute, sageMode = false, onInjectActivityCard, onOverrideActivityCard, onResetScene, onOpenWorkflow }) {
  const suggestions = PROMPT_SUGGESTIONS[industryId] ?? PROMPT_SUGGESTIONS.events
  const [input, setInput]       = useState('')
  const [messages, setMessages] = useState([])
  const scrollRef   = useRef(null)
  const idRef       = useRef(0)
  // Compound key so the reignite effect fires not just on top-level view
  // changes but also on pay drill-downs (home → period → user).
  const briefKey = `${view}|${paySubRoute?.screen ?? ''}|${paySubRoute?.periodId ?? ''}|${paySubRoute?.personId ?? ''}`
  const lastBriefKeyRef = useRef(briefKey)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  // Mid-conversation, when the briefing context changes (switch views, click
  // into a pay period, open a specific worker), append a matching briefing
  // as an inline AI message so the chat scrolls naturally to the new
  // insights instead of leaving them hidden behind existing history.
  useEffect(() => {
    const prev = lastBriefKeyRef.current
    lastBriefKeyRef.current = briefKey
    if (briefKey === prev) return
    if (messages.length === 0) return  // empty state already renders the briefing
    const set = briefingFor(view, industryId, paySubRoute)
    const brief = set[industryId] ?? set.events
    if (!brief?.situations?.length) return
    setMessages(prev => [
      ...prev,
      { id: ++idRef.current, role: 'briefing', brief, onAction: (prompt) => submitRef.current?.(prompt) },
    ])
  }, [briefKey, industryId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-clear the chat when the operator navigates to a non-home page so
  // each surface (Schedule, Pay, People, Workflows) starts fresh with its
  // own briefing instead of inheriting Sandra-scene history. Home is
  // excluded so the scripted Sandra scene can build up naturally there.
  // Runs after the briefing-reignite effect above so its trailing
  // setMessages([]) wipes any briefing that effect may have just appended.
  const lastViewRef = useRef(view)
  useEffect(() => {
    const prev = lastViewRef.current
    lastViewRef.current = view
    if (view === prev) return
    if (view === 'overview') return
    // In Sage embed mode the OT-crisis scene plays on the Schedule view;
    // wiping it as the user pokes around the LeftNav would erase the very
    // story they came here for.
    if (sageMode) return
    setMessages([])
    setInput('')
  }, [view, sageMode])

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
      if (seg.type === 'text' || seg.type === 'cta' || seg.type === 'thinking') {
        const isThinking = seg.type === 'thinking'
        const fullLen = isThinking ? thinkingSegmentLength(seg) : seg.text.length
        // Thinking deliberately types slower than a normal answer — the
        // reasoning is the product here, so each line should land as a
        // considered thought, not a blur. 2 chars every 35ms ≈ 57 chars/s
        // so a ~470-char Sandra reasoning lands in roughly 8 seconds.
        // Normal text still pings in at 6 chars / 20ms.
        const charsPerTick = isThinking ? 2 : 6
        const tickMs       = isThinking ? 35 : 20
        if (m.chars < fullLen) {
          const t = setTimeout(() => updateMsg(m.id, { chars: Math.min(fullLen, m.chars + charsPerTick) }), tickMs)
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
    // Navigation-target approvals (e.g. Sandra's "Open in Agent Workflows")
    // route the operator to another view instead of running a progress
    // plan. We still drop the clicked chat bubble so it reads as their
    // action, but the follow-up work happens in the new surface.
    if (msg.target === 'workflows') {
      setMessages(prev => [
        ...prev.map(m => m.specialist ? { ...m, specialist: null, approveLabel: null } : m),
        { id: ++idRef.current, role: 'user', content: msg.approveLabel ?? 'Open workflow editor', status: 'done' },
      ])
      onOpenWorkflow?.(msg.workflowId ?? null)
      return
    }

    const agentId = msg.specialist ?? 'nova'
    const steps   = msg.approvePlan ?? SPECIALIST_PLAN[agentId] ?? SPECIALIST_PLAN.nova
    const userLabel = msg.approveLabel ?? `Have ${getAgent(agentId)?.name ?? 'Nova'} take it`
    const stepDurationMs = msg.stepDurationMs ?? PROGRESS_STEP_DURATION_MS
    const progressId = ++idRef.current
    // 1) Post the user's "click" as a chat bubble right away, and drop a
    //    placeholder assistant bubble showing thinking dots.
    setMessages(prev => [
      ...prev.map(m => m.specialist ? { ...m, specialist: null, approveLabel: null } : m),
      { id: ++idRef.current, role: 'user', content: userLabel, status: 'done' },
      { id: progressId, role: 'progress', agentId, steps, status: 'thinking', stepDurationMs, workflowAction: msg.workflowAction },
    ])
    // 2) After a beat, flip the progress bubble into its running state so
    //    the plan reveals sequentially from zero.
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === progressId ? { ...m, status: 'running' } : m))
    }, 900)
    // 3) Scripted scenes can queue a follow-up assistant message to land
    //    after the progress completes. Each step takes `stepDurationMs`
    //    before the next one advances, plus the 900ms thinking→running
    //    preamble and a small buffer for the final "Complete" pill.
    if (typeof msg.sceneAfter === 'function') {
      const total = 900 + steps.length * stepDurationMs + 500
      setTimeout(() => msg.sceneAfter({ postAssistant, overrideActivityCard: onOverrideActivityCard }), total)
    }
  }

  /* Low-level post helper used by the scripted scene. Goes through the
     normal streaming state machine so every scene message animates like a
     real agent reply. */
  const postAssistant = (spec) => {
    const id = ++idRef.current
    setMessages(prev => [...prev, { id, role: 'assistant', content: spec.content, status: 'thinking',
      specialist:    spec.specialist ?? null,
      approveLabel:  spec.approveLabel ?? null,
      approvePlan:   spec.approvePlan ?? null,
      stepDurationMs: spec.stepDurationMs,
      sceneAfter:    spec.sceneAfter,
    }])
  }

  /* ── Scripted "Sandra cancelled" live scene ─────────────────────────
     Plays only when the operator lands on the Events home with an empty
     chat. Deterministic timeline; the orchestrator re-runs on any empty
     state so Clear-chat replays it cleanly. */
  const sceneStartedRef = useRef(false)
  useEffect(() => {
    if (industryId !== 'events' || view !== 'overview') {
      sceneStartedRef.current = false
      return
    }
    if (messages.length > 0) {
      sceneStartedRef.current = false
      return
    }
    if (sceneStartedRef.current) return
    sceneStartedRef.current = true

    // T=3s — Sandra's cancellation event arrives on its own. No agent is
    // attached yet; the card is anchored to the person so the prospect sees
    // it as a raw inbound event before the AI reacts.
    const activityTimer = setTimeout(() => {
      onInjectActivityCard?.({
        id: 'sandra-cancellation-live',
        eyebrow: 'Shift update',
        status: 'watching',
        statusLabel: 'New',
        timestamp: 'Just now',
        title: 'Sandra Lee cancelled her Saturday 7pm usher shift',
        description: 'Sandra Lee cancelled her Saturday 7pm usher shift · Civic Auditorium · 3.5 hrs notice',
        subject: {
          kind: 'person',
          primary: 'Sandra Lee',
          secondary: 'Usher · Civic Auditorium · Sat 7:00p',
          image: 'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=160&h=160&fit=crop&crop=faces&auto=format',
        },
      })
    }, 3000)

    // T=~6s — only after the operator has had time to notice the activity
    // popup does the chat react. We deliberately do NOT re-post the daily
    // briefing into the chat: the empty-state greeting has already typed
    // itself and re-rendering it would look like the AI was retyping.
    const chatTimer = setTimeout(() => {
      postAssistant(SANDRA_SCENE.reachOutPrompt)
    }, 6000)

    return () => {
      clearTimeout(activityTimer)
      clearTimeout(chatTimer)
    }
  }, [industryId, view, messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Scripted OT crisis scene (Sage Intacct → Workforce handoff) ────
     Plays only inside the Sage embed when the operator lands on the
     Schedule view with an empty chat, mirroring the Sandra-scene
     pattern so the stream/approve/follow-up state machine just works. */
  const otSceneStartedRef = useRef(false)
  useEffect(() => {
    if (!sageMode || industryId !== 'events' || view !== 'schedule') {
      otSceneStartedRef.current = false
      return
    }
    if (messages.length > 0) {
      otSceneStartedRef.current = false
      return
    }
    if (otSceneStartedRef.current) return
    otSceneStartedRef.current = true

    // Slightly snappier than Sandra (2.5s) — the operator just clicked
    // "Resolve OT Crisis" on the CFO dashboard, so they're already
    // primed for an answer.
    const t = setTimeout(() => {
      postAssistant(OT_SCENE.alert)
    }, 2500)
    return () => clearTimeout(t)
  }, [sageMode, industryId, view, messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const clear = () => { setMessages([]); setInput(''); onResetScene?.() }

  const hasChat = messages.length > 0

  const askedLabels = new Set(
    messages.filter(m => m.role === 'user' && typeof m.content === 'string').map(m => m.content.toLowerCase())
  )
  // On the Schedule page, follow-up chips mirror the schedule briefing's
  // action prompts instead of the home canned suggestions. On overview (and
  // any other view) we fall back to the industry's PROMPT_SUGGESTIONS.
  const viewBriefingSet = briefingFor(view, industryId, paySubRoute)
  const viewBrief = viewBriefingSet[industryId] ?? viewBriefingSet.events
  const chipPool = (view === 'overview' || !viewBrief?.situations?.length)
    ? (suggestions ?? [])
    : viewBrief.situations.map(s => s.action).filter(Boolean).map(a => ({ label: a.prompt }))
  const followupChips = chipPool
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

        {/* Unified scroll column: briefing + messages flow inside this
            single container so the operator never sees a second inner
            scrollbar. Follow-up chips + compose input stay pinned below. */}
        <div className="prompt-scroll" ref={scrollRef}>
          {(!hasChat || (industryId === 'events' && view === 'overview')) && (
            <DailyBriefing industryId={industryId} view={view} paySubRoute={paySubRoute} briefKey={briefKey} onAction={submit} />
          )}
          {hasChat && (
            <div className="prompt-messages">
              {messages.map(m => <Message key={m.id} message={m} onApprove={handleApprove} />)}
            </div>
          )}
        </div>

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

export default function Act1Dashboard({ industryId, view = 'overview', sageMode = false, onBack, onExplore, onSelectView }) {
  const data = useMemo(() => getIndustryData(industryId), [industryId])
  // Pay sub-route lives here so the chat panel can observe drill-downs
  // (home → period → user) alongside top-level view changes.
  const [paySubRoute, setPaySubRoute] = useState({ screen: 'home' })

  // Scripted-scene state, owned here so the chat (PromptPanel) can post
  // reasoning while the activity feed (ActivityFeed) renders a live card.
  // Null means the scene has not injected anything yet.
  const [sceneInjectedCard, setSceneInjectedCard] = useState(null)
  const [sceneCardOverrides, setSceneCardOverrides] = useState({})

  // Navigation handoff from chat → Agent Workflows. When the Sandra CTA
  // clicks "Open workflow editor", we flip to the workflows view and
  // tell the workflows view which workflow to auto-open.
  const [pendingWorkflowId, setPendingWorkflowId] = useState(null)
  const openWorkflow = (id) => {
    setPendingWorkflowId(id)
    onSelectView?.('workflows')
  }

  // Reset the pay drill-down whenever the user leaves the Pay tab or
  // switches industries; otherwise chat briefings would reference stale
  // period/person state on re-entry.
  useEffect(() => {
    if (view !== 'pay') setPaySubRoute({ screen: 'home' })
  }, [view, industryId])

  // Scene state is scoped to events/overview; wipe on industry or view change
  // so a user bouncing through Schedule/Pay doesn't return to a stale card.
  useEffect(() => {
    if (industryId !== 'events' || view !== 'overview') {
      setSceneInjectedCard(null)
      setSceneCardOverrides({})
    }
  }, [industryId, view])

  // Activity-drawer toggle. On overview the feed is the page itself, so
  // the drawer doesn't apply. Workflows + Policies + Settings opt out
  // (admin / system pages). Reset to closed whenever the user navigates
  // between views so the drawer doesn't surprise-pop on the next page.
  const noDrawer = new Set(['overview', 'workflows', 'policies', 'settings', 'onboarding'])
  const supportsActivityDrawer = !noDrawer.has(view)
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false)
  useEffect(() => { setActivityDrawerOpen(false) }, [view, industryId])
  const toggleActivityDrawer = () => setActivityDrawerOpen(o => !o)

  return (
    <div className={`act1-root${view === 'overview' ? '' : ` act1-root--${view}`}`}>
      <LeftNav
        industryLabel={data.label}
        view={view}
        sageMode={sageMode}
        onBrand={onBack}
        onAsk={onExplore}
        onSelectView={onSelectView}
      />

      {/* Engage is a chat module of its own, Policies is a doc browser,
          Settings is a system-config page — surfacing Nova's chat panel
          alongside any of them is just noise. Onboarding keeps the chat
          so Iris can surface candidate-pipeline insights. */}
      {view !== 'engage' && view !== 'policies' && view !== 'settings' && (
        <PromptPanel
          industryId={industryId}
          view={view}
          sageMode={sageMode}
          paySubRoute={paySubRoute}
          onInjectActivityCard={setSceneInjectedCard}
          onOverrideActivityCard={(id, patch) => setSceneCardOverrides(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }))}
          onResetScene={() => { setSceneInjectedCard(null); setSceneCardOverrides({}) }}
          onOpenWorkflow={openWorkflow}
        />
      )}

      {view === 'schedule'        ? <ScheduleCalendar data={data} onDemo={() => showDemoToast()} onToggleActivityDrawer={toggleActivityDrawer} activityDrawerOpen={activityDrawerOpen} />
       : view === 'people'        ? <PeopleList       data={data} onDemo={() => showDemoToast()} onToggleActivityDrawer={toggleActivityDrawer} activityDrawerOpen={activityDrawerOpen} />
       : view === 'pay'           ? <PayView          industryId={industryId} route={paySubRoute} onChangeRoute={setPaySubRoute} onDemo={() => showDemoToast()} onToggleActivityDrawer={toggleActivityDrawer} activityDrawerOpen={activityDrawerOpen} />
       : view === 'time-tracking' ? <TimeTracking     data={data} onDemo={() => showDemoToast()} onToggleActivityDrawer={toggleActivityDrawer} activityDrawerOpen={activityDrawerOpen} />
       : view === 'shift-requests' ? <ShiftRequests   data={data} onDemo={() => showDemoToast()} onToggleActivityDrawer={toggleActivityDrawer} activityDrawerOpen={activityDrawerOpen} />
       : view === 'onboarding'    ? <OnboardingView   data={data} onDemo={() => showDemoToast()} />
       : view === 'timesheets'    ? <TimesheetsView   data={data} onDemo={() => showDemoToast()} onToggleActivityDrawer={toggleActivityDrawer} activityDrawerOpen={activityDrawerOpen} />
       : view === 'review'        ? <ReviewView       data={data} onDemo={() => showDemoToast()} onToggleActivityDrawer={toggleActivityDrawer} activityDrawerOpen={activityDrawerOpen} />
       : view === 'workflows'     ? <WorkflowsView    industryId={industryId} pendingWorkflowId={pendingWorkflowId} onConsumePending={() => setPendingWorkflowId(null)} onDemo={() => showDemoToast()} />
       : view === 'policies'      ? <PoliciesView     onDemo={() => showDemoToast()} />
       : view === 'engage'        ? <EngageView       onDemo={() => showDemoToast()} onToggleActivityDrawer={toggleActivityDrawer} activityDrawerOpen={activityDrawerOpen} />
       : view === 'settings'      ? <SettingsView     onDemo={() => showDemoToast()} />
       :                            <ActivityFeed     data={data} injectedCard={sceneInjectedCard} cardOverrides={sceneCardOverrides} />}

      {supportsActivityDrawer && (
        <>
          <div
            className={`activity-drawer-scrim ${activityDrawerOpen ? 'is-open' : ''}`}
            aria-hidden="true"
            onClick={() => setActivityDrawerOpen(false)}
          />
          <aside
            className={`activity-drawer-overlay ${activityDrawerOpen ? 'is-open' : ''}`}
            aria-hidden={!activityDrawerOpen}
          >
            <ActivityFeed
              data={data}
              injectedCard={sceneInjectedCard}
              cardOverrides={sceneCardOverrides}
              onClose={() => setActivityDrawerOpen(false)}
            />
          </aside>
        </>
      )}

      <ToastHost />
    </div>
  )
}
