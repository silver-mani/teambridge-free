import { useEffect, useState } from 'react'
import { CheckCircleIcon }     from '../../../src/components/icons/CheckCircleIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { TeambridgeAIIcon }    from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ChevronDownIcon }     from '../../../src/components/icons/ChevronDownIcon.tsx'
import { ClockIcon }           from '../../../src/components/icons/ClockIcon.tsx'
import { AlertTriangleIcon }   from '../../../src/components/icons/AlertTriangleIcon.tsx'
import { XIcon }               from '../../../src/components/icons/XIcon.tsx'
import { SUPER_AGENT_ACTIONS } from '../data/superAgentActions.js'
import { AGENTS }              from '../data/agents.js'

/* ──────────────────────────────────────────────────────────────────────
 * Super-Agent Feed — the home view re-imagined as a list of action
 * cards the always-on agent has uncovered, thought through, and is
 * ready to fix on the operator's behalf.
 *
 * Each card shows:
 *   - eyebrow + timestamp + severity     (what kind of thing this is)
 *   - subject avatar + headline          (who/what is affected)
 *   - "How I'm thinking about it" steps  (agent's reasoning)
 *   - "My plan" steps                    (what it will do)
 *   - forecast + confidence              (expected outcome)
 *   - primary CTA "Let me handle this"   (one-tap delegation)
 *   - secondary CTA "Show details"       (buzzes for the demo)
 *
 * Click the primary CTA → card transitions through a brief "Working
 * on it" pulse, then settles into a Handled state showing the outcome.
 * That's the whole point of this surface — the agent doesn't just
 * surface problems, it shows you it can already see the fix, and one
 * tap delegates it. ────────────────────────────────────────────────── */

export function hasSuperAgentActions(industryId) {
  return Array.isArray(SUPER_AGENT_ACTIONS[industryId]) && SUPER_AGENT_ACTIONS[industryId].length > 0
}

export default function SuperAgentFeed({ industryId, streamIn = false, onDemo, onClose, mobileOpen = false }) {
  const actions = SUPER_AGENT_ACTIONS[industryId] ?? []

  // Stream the cards in one at a time on first home visit so the
  // panel populates from empty — same calm reveal as the legacy feed.
  const [streaming] = useState(streamIn)
  const [revealed, setRevealed] = useState(streamIn ? 0 : actions.length)
  useEffect(() => {
    if (!streaming) { setRevealed(actions.length); return }
    setRevealed(0)
    const timers = actions.map((_, i) =>
      setTimeout(() => setRevealed(n => Math.max(n, i + 1)), 350 + i * 650)
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming, actions.length])

  const shown = actions.slice(0, revealed)

  return (
    <aside className={`sa-feed ${mobileOpen ? 'is-mobile-open' : ''}`} aria-label="Agent action feed">
      <header className="sa-feed-head">
        <div className="sa-feed-headtext">
          <span className="sa-feed-eyebrow">
            <TeambridgeAIIcon size={12} /> Super Agent
          </span>
          <h2 className="sa-feed-title">5 things I caught for you</h2>
          <p className="sa-feed-sub">
            Each one has a plan ready. Tap "Let me handle this" and I'll close it out.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            className="sa-feed-close"
            onClick={onClose}
            aria-label="Close feed"
          >
            <XIcon size={16} />
          </button>
        )}
      </header>

      <div className="sa-feed-list">
        {shown.map(action => (
          <div className="sa-card-streamed" key={action.id}>
            <SuperAgentCard action={action} onDemo={onDemo} />
          </div>
        ))}
      </div>
    </aside>
  )
}

const SEVERITY_META = {
  urgent: { label: 'Urgent',  className: 'sa-card--urgent', Icon: AlertTriangleIcon },
  watch:  { label: 'Watching', className: 'sa-card--watch',  Icon: ClockIcon },
  info:   { label: 'Heads-up', className: 'sa-card--info',   Icon: CheckCircleIcon },
}

function SuperAgentCard({ action, onDemo }) {
  const [state, setState] = useState('idle') // 'idle' | 'working' | 'handled'
  const [detailsOpen, setDetailsOpen] = useState(false)
  const sev = SEVERITY_META[action.severity] ?? SEVERITY_META.info
  const SevIcon = sev.Icon

  const handleAccept = () => {
    if (state !== 'idle') return
    setState('working')
    setTimeout(() => setState('handled'), 1800)
  }

  if (state === 'handled') {
    return <SuperAgentHandledCard action={action} onDemo={onDemo} />
  }

  const agent = AGENTS[action.cta?.agentId] ?? null
  const ctaLabel = action.cta?.label ?? 'Let me handle this'
  const planTitle = action.planTitle ?? 'My plan'

  return (
    <article className={`sa-card ${sev.className} ${state === 'working' ? 'is-working' : ''}`}>
      {/* Eyebrow row — severity + timestamp inline on the left so the
          eye reads top-down. */}
      <header className="sa-card-head">
        <span className="sa-card-severity">
          <SevIcon size={10} /> {action.eyebrow}
        </span>
        <span className="sa-card-head-sep" aria-hidden="true">·</span>
        <span className="sa-card-time">{action.timestamp}</span>
      </header>

      <div className="sa-card-subject">
        <SubjectAvatar subject={action.subject} />
        <div className="sa-card-subjecttext">
          <div className="sa-card-headline">{action.headline}</div>
        </div>
      </div>

      {/* One dropdown carries the agent's full thinking: reasoning
          bullets, then the workflow plan it maps to. */}
      <div className="sa-card-collapsibles">
        <CollapsibleSection
          title="How I'm thinking about it"
          count={action.reasoning.length + (action.plan?.length ?? 0)}
          open={detailsOpen}
          onToggle={() => setDetailsOpen(o => !o)}
        >
          <ul className="sa-card-reasoning-list">
            {action.reasoning.map((step, i) => (
              <li key={i} className="sa-card-reasoning-item">
                <span className="sa-card-reasoning-mark" aria-hidden="true">
                  <CheckCircleIcon size={11} />
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
          <div className="sa-card-plan-head">
            <span className="sa-card-plan-title">{planTitle}</span>
            {action.planScope && <span className="sa-card-plan-scope">{action.planScope}</span>}
          </div>
          <ol className="sa-card-plan-list">
            {(action.plan ?? []).map((step, i) => (
              <li key={i} className="sa-card-plan-item">
                <span className="sa-card-plan-num" aria-hidden="true">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CollapsibleSection>
      </div>

      {/* Forecast — outcome + confidence bar, anchored just above the
          action so the operator reads "what I expect" then approves. */}
      <div className="sa-card-forecast">
        <div className="sa-card-forecast-text">
          <span className="sa-card-forecast-label">{action.forecast.label}</span>
          <span className="sa-card-forecast-value">{action.forecast.value}</span>
        </div>
        <div className="sa-card-forecast-conf" title={action.forecast.confidenceLabel}>
          <div className="sa-card-forecast-bar" style={{ '--conf': `${action.forecast.confidence}%` }} />
          <span className="sa-card-forecast-pct">{action.forecast.confidence}%</span>
        </div>
      </div>

      {/* Primary action — left-aligned, prominent. Carries the specific
          agent's avatar so the operator sees who's running it. */}
      <footer className="sa-card-foot">
        <button
          type="button"
          className="sa-card-primary"
          onClick={handleAccept}
          disabled={state === 'working'}
        >
          {agent && (
            <span
              className={`sa-card-primary-avatar agent-avatar-${agent.color}`}
              style={{ backgroundImage: `url(${agent.avatar})` }}
              aria-hidden="true"
            />
          )}
          <span className="sa-card-primary-label">
            {state === 'working' ? 'Working on it' : ctaLabel}
          </span>
          {state === 'working'
            ? <span className="sa-card-spin" aria-hidden="true" />
            : <ArrowNarrowRightIcon size={13} />}
        </button>
        <button type="button" className="sa-card-secondary" onClick={onDemo}>
          Show details
        </button>
      </footer>
    </article>
  )
}

/* Real-photo avatar with initials fallback (used when the action data
 * has no image URL or the image fails to load). */
function SubjectAvatar({ subject }) {
  const [failed, setFailed] = useState(false)
  if (subject.avatar && !failed) {
    return (
      <span className="sa-card-avatar sa-card-avatar--image" aria-hidden="true">
        <img
          src={subject.avatar}
          alt={subject.name}
          onError={() => setFailed(true)}
        />
      </span>
    )
  }
  return (
    <span
      className="sa-card-avatar sa-card-avatar--initials"
      style={{ background: subject.bg, color: subject.color }}
      aria-hidden="true"
    >
      {subject.initials}
    </span>
  )
}

function CollapsibleSection({ title, subtitle, leadingIcon, count, open, onToggle, children }) {
  return (
    <section className={`sa-card-section sa-card-section--collapsible ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="sa-card-section-toggle"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="sa-card-section-toggleleft">
          {leadingIcon}
          <span className="sa-card-section-titlewrap">
            <span className="sa-card-section-title">{title}</span>
            {subtitle && <span className="sa-card-section-subtitle">{subtitle}</span>}
          </span>
          {typeof count === 'number' && <span className="sa-card-section-count">{count}</span>}
        </span>
        <span className={`sa-card-section-chev ${open ? 'is-open' : ''}`} aria-hidden="true">
          <ChevronDownIcon size={12} />
        </span>
      </button>
      {open && <div className="sa-card-section-body">{children}</div>}
    </section>
  )
}

function SuperAgentHandledCard({ action, onDemo }) {
  const h = action.handled
  return (
    <article className="sa-card sa-card--handled" aria-label={`${action.eyebrow} — handled`}>
      <header className="sa-card-head">
        <span className="sa-card-severity sa-card-severity--handled">
          <CheckCircleIcon size={12} /> {h.eyebrow}
        </span>
        <span className="sa-card-time">{h.timestamp}</span>
      </header>

      <div className="sa-card-subject">
        <span
          className="sa-card-avatar"
          style={{ background: action.subject.bg, color: action.subject.color }}
          aria-hidden="true"
        >
          {action.subject.initials}
        </span>
        <div className="sa-card-subjecttext">
          <div className="sa-card-headline">{h.headline}</div>
          <div className="sa-card-context">{h.detail}</div>
        </div>
      </div>

      {h.outcomeBullets?.length > 0 && (
        <ul className="sa-card-outcome">
          {h.outcomeBullets.map((b, i) => (
            <li key={i} className="sa-card-outcome-item">
              <CheckCircleIcon size={12} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      <footer className="sa-card-foot">
        <button
          type="button"
          className="sa-card-secondary"
          onClick={onDemo}
        >
          See the recap
        </button>
      </footer>
    </article>
  )
}
