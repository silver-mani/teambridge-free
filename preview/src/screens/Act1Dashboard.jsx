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
    return (
      <span className="subject-image subject-image-pair" style={{ height: size }} aria-hidden="true">
        <span
          className="subject-image-pair-slot subject-image-pair-slot-a"
          style={{ width: size * 0.72, height: size * 0.72, backgroundImage: `url(${images[0]})` }}
        />
        <span
          className="subject-image-pair-slot subject-image-pair-slot-b"
          style={{ width: size * 0.72, height: size * 0.72, backgroundImage: `url(${images[1]})` }}
        />
      </span>
    )
  }

  if (kind === 'group' && images?.length > 0) {
    return (
      <span className="subject-image subject-image-group" style={{ height: size }} aria-hidden="true">
        {images.slice(0, 3).map((src, i) => (
          <span
            key={i}
            className="subject-image-group-slot"
            style={{
              width: size * 0.7,
              height: size * 0.7,
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

function ActivityCard({ card, onClick, selected = false, dimmed = false }) {
  const meta = STATUS_MAP[card.status] ?? STATUS_MAP.resolved
  const agent = card.agentId ? getAgent(card.agentId) : null
  const interactive = typeof onClick === 'function'
  const pulsing = card.status === 'in-progress'

  const statusBadge = card.statusLabel ? (
    <>
      <StatusTag status={meta.tagStatus} size="sm" dot={false}>{card.statusLabel}</StatusTag>
      {pulsing && <span className="activity-card-pulse" aria-hidden="true" />}
    </>
  ) : null

  const inner = card.subject ? (
    <>
      <CardHeaderRow eyebrow={card.eyebrow} statusBadge={statusBadge} timestamp={card.timestamp} />
      <SubjectHeader subject={card.subject} />
      {agent && <AgentFooter agent={agent} task={card.agentTask} />}
    </>
  ) : (
    <>
      <div className="activity-card-head">
        {agent && <AgentHeader agent={agent} task={card.agentTask} />}
        <div className="activity-card-status">
          <StatusTag status={meta.tagStatus} size="sm" dot={false}>{card.statusLabel}</StatusTag>
          <span className="activity-card-dot" aria-hidden="true">·</span>
          <span className="activity-card-time">{card.timestamp}</span>
          {pulsing && <span className="activity-card-pulse" aria-hidden="true" />}
        </div>
      </div>
      <div className="activity-card-body">
        <h3 className="activity-card-title">{card.title}</h3>
      </div>
    </>
  )

  const className = [
    'activity-card',
    card.subject && 'activity-card-subject',
    pulsing  && 'activity-card-pulsing',
    selected && 'activity-card-selected',
    dimmed   && 'activity-card-dimmed',
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
          <Button variant="tertiary" size="sm" disabled trailingArtwork={<ArrowNarrowRightIcon size={14} />}>
            View {payload.recordType ?? 'record'}
          </Button>
        </div>
      </div>
    </>
  )
}

/* Unified activity row — used for both agents and humans so they look identical. */
function ActivityRow({ row }) {
  const initials = row.actor.split(' ').map(p => p[0]).join('').slice(0, 2)
  const [open, setOpen] = useState(false)
  const agent = row.kind === 'agent' && row.agentId ? getAgent(row.agentId) : null
  const isAgent = !!agent

  let avatarNode
  if (agent) {
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

  const wrapClass = [
    'activity-row-wrap',
    isAgent && 'activity-row-wrap-agent',
    isAgent && `activity-row-wrap-agent-${agent.color}`,
  ].filter(Boolean).join(' ')

  return (
    <li className={wrapClass}>
      <div className="activity-row">
        {avatarNode}
        <span className="activity-row-text">
          <span className="activity-row-actor">{row.actor}</span>
          {isAgent && <span className="activity-row-agent-role"> ({agent.role})</span>}
          <span className="activity-row-verb">{' '}{row.verb}</span>
        </span>
        <span className="activity-row-time">{row.time}</span>
      </div>

      {isAgent && row.workSteps?.length > 0 && (
        <ul className="activity-work-steps">
          {row.workSteps.map((s, i) => (
            <li key={i} className="activity-work-step">
              <span className="activity-work-step-check" aria-hidden="true">
                <CheckIcon size={10} />
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}

      {isAgent && row.metrics?.length > 0 && (
        <div className="activity-metrics">
          {row.metrics.map((m, i) => (
            <span key={i} className="activity-metric">
              <span className="activity-metric-value">{m.label}</span>
              <span className="activity-metric-label">{m.sub}</span>
            </span>
          ))}
        </div>
      )}

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

  return (
    <aside className="detail-panel" aria-label="Record detail">
      <header className="record-header">
        <div className="record-header-top">
          <span className="record-header-type">{typeLabel}</span>
          <button type="button" className="detail-panel-close" onClick={onClose} aria-label="Close">
            <XIcon size={16} />
          </button>
        </div>
        <h2 className="record-header-title">{title}</h2>
        {subtitle && <p className="record-header-subtitle">{subtitle}</p>}
        {record?.status && (
          <div style={{ marginTop: 'var(--space-2)' }}>
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

function ActivityFeed({ data, selectedCardId, onSelect }) {
  const handlingCount = (data.activeCard ? 1 : 0) + data.feed.length
  return (
    <aside className="activity-feed" aria-label="Activity feed">
      <div className="activity-feed-inner">
        {data.needsYou?.length > 0 && (
          <NeedsZoneWithSelect
            cards={data.needsYou}
            selectedCardId={selectedCardId}
            onSelect={onSelect}
          />
        )}

        <section className="zone zone-handling">
          <div className="zone-head">
            <h2 className="zone-title">Teambridge is handling</h2>
            <span className="zone-count">{handlingCount} active</span>
          </div>
          <p className="zone-sub">
            Running automatically in the background. Open any card to see how it was resolved.
          </p>

          <div className="feed">
            {data.activeCard && (
              <ActivityCard
                card={data.activeCard}
                selected={selectedCardId === data.activeCard.id}
                onClick={() => onSelect(data.activeCard.id)}
              />
            )}
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
    lines: [
      "Good morning. Here's today's briefing:",
      "",
      "48 of 48 staff confirmed for Saturday — **49ers vs Rams** tracking at **98% coverage**.",
      "⚠️ **Gate 3** still has 1 open usher role — 2 days until kickoff.",
      "⚠️ **Sandra Lee** cancelled — Rachel Williams selected, awaiting your approval.",
      "Iris cleared **Sarah M.** (alcohol service) — ready for Saturday.",
      "",
      "What would you like me to handle first?",
    ],
    actions: [
      { label: 'Approve Rachel',   prompt: 'Approve the Rachel Williams replacement' },
      { label: 'Fill Gate 3',      prompt: 'Fill the last open Saturday role' },
      { label: 'Pre-brief staff',  prompt: 'Draft the pre-game crew briefing' },
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

function DailyBriefing({ industryId, onAction }) {
  const brief = BRIEFING[industryId] ?? BRIEFING.events
  return (
    <div className="briefing">
      <header className="briefing-agent">
        <span className="briefing-agent-status" aria-hidden="true" />
        <div className="briefing-agent-text">
          <div className="briefing-agent-name">Teambridge</div>
          <div className="briefing-agent-role">Super Agent · Monitoring all</div>
        </div>
      </header>

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
    { label: 'Fill the last open Saturday role',
      specialist: 'nova',
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
          { type: 'cta', text: "Ready to dispatch via SMS + in-app push?" },
        ],
      } },
    { label: 'Coverage by gate for Saturday',
      specialist: 'nova',
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
  return null
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
function detectSpecialist(text) {
  if (typeof text !== 'string') return 'nova'
  const names = ['nova', 'atlas', 'iris', 'sofia', 'leo']
  for (const n of names) {
    if (new RegExp(`\\b${n}\\b`, 'i').test(text)) return n
  }
  return 'nova'
}

/* Progress bubble — agent is starting work. Tasks advance one at a time
   with ~18s between transitions so it feels paced and real (not faked-fast).
   When the last task lands, the pill flips to "Complete". */
const PROGRESS_STEP_DURATION_MS = 18000

function ProgressMessage({ message }) {
  const agent = message.agentId ? getAgent(message.agentId) : null
  const steps = message.steps ?? []
  const agentName = agent ? `${agent.name} (${agent.role})` : 'Teambridge AI'

  const [activeIdx, setActiveIdx] = useState(0)
  const allDone = activeIdx >= steps.length

  useEffect(() => {
    if (allDone) return
    const t = setTimeout(() => setActiveIdx(i => i + 1), PROGRESS_STEP_DURATION_MS)
    return () => clearTimeout(t)
  }, [activeIdx, allDone])

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
            {allDone ? 'Complete' : 'In progress'}
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
                {state === 'active' && <span className="progress-task-tag">Working on this</span>}
              </li>
            )
          })}
        </ul>
        <a className="progress-workflow-link" href="#agent-workflows" onClick={(e) => e.preventDefault()}>
          <GitBranch01Icon size={12} />
          <span>Open this workflow in Agent Workflows</span>
          <ArrowNarrowRightIcon size={12} />
        </a>
      </div>
    </div>
  )
}

function ActionButtons({ specialist, onApprove }) {
  const agent = specialist ? getAgent(specialist) : null
  if (!agent) return null
  return (
    <div className="prompt-actions-row">
      <button type="button" className="prompt-action prompt-action-primary" onClick={onApprove}>
        <span className="prompt-action-agent" style={{ backgroundImage: `url(${agent.avatar})` }} />
        Have {agent.name} take it
      </button>
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
        {message.status === 'done' && message.specialist && (
          <ActionButtons
            specialist={message.specialist}
            onApprove={() => onApprove(message)}
          />
        )}
      </div>
    </div>
  )
}

/* ─── Prompt panel ──────────────────────────────────────────────────────── */

function PromptPanel({ industryId }) {
  const suggestions = PROMPT_SUGGESTIONS[industryId] ?? PROMPT_SUGGESTIONS.events
  const [input, setInput]       = useState('')
  const [messages, setMessages] = useState([])
  const scrollRef = useRef(null)
  const idRef     = useRef(0)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

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

  const submitCanned = (label, content, specialist) => {
    setMessages(prev => [
      ...prev,
      { id: ++idRef.current, role: 'user', content: label, status: 'done' },
      { id: ++idRef.current, role: 'assistant', content, status: 'thinking', specialist: specialist ?? null },
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

    updateMsg(assistantId, { content: replyText, specialist: detectSpecialist(replyText) })
  }

  const submit = (text) => {
    const t = (text ?? input).trim()
    if (!t) return
    setInput('')
    const canned = suggestions.find(s => s.label.toLowerCase() === t.toLowerCase())
    if (canned) return submitCanned(canned.label, canned.answer, canned.specialist)
    return submitFreeForm(t)
  }

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
    const steps   = SPECIALIST_PLAN[agentId] ?? SPECIALIST_PLAN.nova
    setMessages(prev => prev.map(m => m.specialist ? { ...m, specialist: null } : m).concat({
      id: ++idRef.current,
      role: 'progress',
      agentId,
      steps,
    }))
  }

  const clear = () => { setMessages([]); setInput('') }

  const hasChat = messages.length > 0

  return (
    <section className="prompt-panel" aria-label="Ask Teambridge">
      <div className="prompt-panel-inner">
        {!hasChat
          ? <DailyBriefing industryId={industryId} onAction={submit} />
          : (
            <div className="prompt-messages" ref={scrollRef}>
              <button type="button" className="prompt-messages-clear" onClick={clear} title="Clear chat" aria-label="Clear chat">
                <XIcon size={14} />
              </button>
              {messages.map(m => <Message key={m.id} message={m} onApprove={handleApprove} />)}
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

export default function Act1Dashboard({ industryId, onBack, onExplore }) {
  const data = useMemo(() => getIndustryData(industryId), [industryId])
  const [selectedCardId, setSelectedCardId] = useState(null)

  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null
    if (data.activeCard?.id === selectedCardId) return data.activeCard
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

  return (
    <div className={`act1-root ${selectedCard ? 'drawer-open' : ''}`}>
      <LeftNav
        industryLabel={data.label}
        onBrand={onBack}
        onAsk={onExplore}
      />

      <PromptPanel industryId={industryId} />

      <ActivityFeed
        data={data}
        selectedCardId={selectedCardId}
        onSelect={setSelectedCardId}
      />

      {selectedCard && (
        <RecordDrawer
          key={selectedCard.id}
          card={selectedCard}
          detail={detail}
          onClose={() => setSelectedCardId(null)}
          onExplore={onExplore}
        />
      )}
    </div>
  )
}
