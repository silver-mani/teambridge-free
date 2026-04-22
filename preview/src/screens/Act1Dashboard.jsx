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
          {isAgent && (
            <>
              <span className="activity-row-agent-glyph" aria-hidden="true">
                <TeambridgeAIIcon size={10} />
              </span>
              <span className="activity-row-agent-role">{agent.role}</span>
            </>
          )}
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

/* ─── Overview (list view) ───────────────────────────────────────────────── */

function Overview({ data, selectedCardId, onSelect }) {
  return (
    <div className="overview">
      <WelcomeHeader />
      <NeedsZoneWithSelect cards={data.needsYou} selectedCardId={selectedCardId} onSelect={onSelect} />
      <HandlingZoneWithSelect data={data} selectedCardId={selectedCardId} onSelect={onSelect} />
    </div>
  )
}

function HandlingZoneWithSelect({ data, selectedCardId, onSelect }) {
  const total = (data.activeCard ? 1 : 0) + data.feed.length
  return (
    <section className="zone zone-handling">
      <div className="zone-head">
        <h2 className="zone-title">Teambridge is handling</h2>
        <span className="zone-count">{total} active</span>
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
      answer: `One open role left for 49ers vs Rams Saturday: Gate 3 usher (6:30 PM report).

Top matches:
• Jordan K. — 4.9 guest rating, worked Gate 3 twice this month
• Priya S. — 4.7 rating, 1.9 mi, under hours

Recommend offering Jordan first. Want me to send it?` },
    { label: 'Draft the pre-game crew briefing',
      answer: `Draft briefing for 48 staff, Saturday 5:00 PM call:

• Event: 49ers vs Rams · Sellout (68,500) · Kickoff 7:15 PM
• Gates 1–6 open at 5:00 PM. Surge crew stays post-kickoff.
• TABC badges visible at every beverage post. Alcohol cut-off 3rd quarter.
• Weather: clear, 62°F at kickoff
• Roster change: Rachel Williams in for Sandra Lee at East Entry

Ready to dispatch via SMS + in-app push?` },
    { label: 'Coverage by gate for Saturday',
      answer: `Coverage across the 6 gates:

• Gate 1 (North): 8 of 8 ✓
• Gate 2 (North): 8 of 8 ✓
• Gate 3 (East):  7 of 8 — 1 open
• Gate 4 (East):  8 of 8 ✓ (incl. Rachel for Sandra)
• Gate 5 (South): 8 of 8 ✓
• Gate 6 (South): 9 of 8 ✓ (surge +1)

47 of 48 confirmed. One role pending.` },
    { label: 'Pre-brief for Harbor Theater opener',
      answer: `Harbor Theater opens May 1. Readiness:

• 18 of 24 staff pre-staged (within 5 mi)
• 14 of 18 have TABC. 4 cert renewals in-flight (Tuesday session).
• 6 slots still open. I have 9 more candidates in reach.

Want me to ping the 9 now?` },
    { label: 'Summarise auto-approved swaps',
      answer: `This week: 12 shift swaps auto-approved, 0 manager intervention.

• 10 weekday shifts (usher, beverage)
• 2 Saturday event shifts
• Avg response time: 18 minutes
• 0 overtime triggers, 0 one-sided-trade patterns

Full audit log available in Agent Workflows.` },
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

function Message({ role, text }) {
  return (
    <div className={`prompt-msg prompt-msg-${role}`}>
      {role === 'assistant' && (
        <span className="prompt-msg-mark" aria-hidden="true">
          <TeambridgeAIIcon size={12} />
        </span>
      )}
      <div className="prompt-msg-text">{text}</div>
    </div>
  )
}

function PromptPanel({ industryId }) {
  const suggestions = PROMPT_SUGGESTIONS[industryId] ?? PROMPT_SUGGESTIONS.events
  const [input, setInput]       = useState('')
  const [messages, setMessages] = useState([])
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const mockAnswer = (text) => {
    const match = suggestions.find(s => s.label.toLowerCase() === text.toLowerCase())
    if (match) return match.answer
    // Fallback for free-form input — a lightly personalised generic reply.
    return `I'll look into that across your data. Give me a few seconds and I'll come back with a recommendation.`
  }

  const submit = (text) => {
    const t = (text ?? input).trim()
    if (!t) return
    setMessages(prev => [...prev, { role: 'user', text: t }, { role: 'assistant', text: mockAnswer(t) }])
    setInput('')
  }

  const clear = () => { setMessages([]); setInput('') }

  const hasChat = messages.length > 0

  return (
    <aside className="prompt-panel" aria-label="Ask Teambridge">
      <header className="prompt-panel-head">
        <div className="prompt-panel-title">
          <span className="prompt-panel-mark" aria-hidden="true">
            <TeambridgeAIIcon size={12} />
          </span>
          <span>New chat</span>
        </div>
        {hasChat && (
          <button type="button" className="prompt-panel-clear" onClick={clear} title="New chat">
            <XIcon size={14} />
          </button>
        )}
      </header>

      {hasChat && (
        <div className="prompt-messages" ref={scrollRef}>
          {messages.map((m, i) => <Message key={i} role={m.role} text={m.text} />)}
        </div>
      )}

      <div className="prompt-input">
        <textarea
          className="prompt-input-field"
          placeholder="Ask anything, or type @ to add context"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          rows={hasChat ? 2 : 3}
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

      {!hasChat && (
        <div className="prompt-suggestions">
          <h4 className="prompt-suggestions-title">Saved prompts</h4>
          <ul className="prompt-suggestions-list">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button type="button" className="prompt-suggestion" onClick={() => submit(s.label)}>
                  <span className="prompt-suggestion-mark" aria-hidden="true">
                    <TeambridgeAIIcon size={10} />
                  </span>
                  <span>{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
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

      <main className="act1-main">
        <div className="act1-content">
          <Overview
            data={data}
            selectedCardId={selectedCardId}
            onSelect={setSelectedCardId}
          />
        </div>
      </main>

      {!selectedCard && <PromptPanel industryId={industryId} />}

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
