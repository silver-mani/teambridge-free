import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowNarrowUpIcon } from '../../../../src/components/icons/ArrowNarrowUpIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { ChevronDownIcon } from '../../../../src/components/icons/ChevronDownIcon.tsx'
import { SearchSmIcon } from '../../../../src/components/icons/SearchSmIcon.tsx'
import TeambridgeLogo from './TeambridgeLogo.jsx'

const ROBOT_ANIMATION = `${import.meta.env.BASE_URL}agents/nova.gif`

/* ──────────────────────────────────────────────────────────────────────
 * OnboardingChat — Nova's chat panel. Uses ITS OWN class names (no
 * inheritance from act1.css's .prompt-panel-* family) so the grid
 * layout for the scrollable middle is bulletproof:
 *
 *   .ob-chat-section          host (grid item from DashboardShell)
 *     .ob-chat-frame          CSS grid: head / scroll / footer
 *       .ob-chat-head         pinned top
 *       .ob-chat-scroll       1fr row, min-height: 0, overflow-y: auto
 *       .ob-drawer-slot |     pinned bottom (either drawer or compose)
 *       .ob-compose
 *
 * Earlier iterations layered .prompt-panel-inner on top with flex: 1 +
 * gap + max-width that fought the grid override and broke the scroll.
 * This is self-contained.
 * ────────────────────────────────────────────────────────────────────── */

function Bubble({ from, children }) {
  if (from === 'nova') {
    return <div className="ob-msg ob-msg--nova">{children}</div>
  }
  return (
    <div className="ob-bubble-row ob-bubble-row--user">
      <div className="ob-bubble ob-bubble--user">{children}</div>
    </div>
  )
}

/* ResearchBubble — Alloy AIActivityTrail structure.
 *   · Collapsible body with a left-border timeline.
 *   · Header summary: "Working · <current step>" while live, then
 *     "Thought · N steps" once everything is done.
 *   · Live state paints a flowing AI gradient on the header text;
 *     done state collapses by default but stays toggleable.
 *   · Pending steps are filtered out of the visible body so the log
 *     reads as work-so-far, not work-to-come. */
function ResearchBubble({ headline, steps }) {
  const trailState = steps.every(s => s.status === 'done') ? 'done' : 'live'
  const [manualExpanded, setManualExpanded] = useState(null)
  // Reset manual override when the lifecycle flips (e.g. live → done),
  // so the new default (collapsed-on-done) takes over unless the user
  // re-toggles afterwards.
  useEffect(() => { setManualExpanded(null) }, [trailState])

  const defaultExpanded = trailState === 'live'
  const expanded = manualExpanded !== null ? manualExpanded : defaultExpanded
  const toggle = () => setManualExpanded(!expanded)

  // Steps to render in the body. Drop pending — they preview future
  // work and clutter the trail. Active + done flow into the timeline.
  const visibleSteps = useMemo(
    () => steps.filter(s => s.status !== 'pending'),
    [steps],
  )

  // Build the header summary. Live: "Working · <active step text>".
  // Done: use the caller-provided headline if any, else "Thought · N steps".
  const activeIdx = visibleSteps.findIndex(s => s.status === 'active')
  const lastIdx = visibleSteps.length - 1
  const currentIdx = activeIdx >= 0 ? activeIdx : lastIdx
  const currentText =
    currentIdx >= 0 ? visibleSteps[currentIdx].text : null

  let summary
  if (trailState === 'live') {
    summary = (
      <>
        Working
        {currentText != null && (
          <>
            {' · '}
            <span key={currentIdx} className="ob-trail-header-current">
              {currentText}
            </span>
          </>
        )}
      </>
    )
  } else {
    const tail =
      steps.length === 1 ? '1 step' : `${steps.length} steps`
    summary = (
      <>
        {headline ? headline.replace(/\.$/, '') : 'Thought'}
        {' · '}
        {tail}
      </>
    )
  }

  return (
    <div
      className="ob-msg ob-msg--nova ob-trail"
      data-state={trailState}
      data-expanded={expanded}
    >
      <button
        type="button"
        className="ob-trail-header"
        onClick={toggle}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse activity trail' : 'Expand activity trail'}
      >
        <span key={trailState} className="ob-trail-header-summary">{summary}</span>
        <span
          className={`ob-trail-header-chevron ${expanded ? 'is-expanded' : ''}`}
          aria-hidden="true"
        >
          <ChevronDownIcon size={14} />
        </span>
      </button>

      <div
        className={`ob-trail-body ${expanded ? 'is-expanded' : ''}`}
        aria-hidden={!expanded}
      >
        <div className="ob-trail-body-inner">
          <div className="ob-trail-body-content">
            {visibleSteps.map((s, i) => {
              const isActive = s.status === 'active'
              const animate = isActive && trailState === 'live'
              return (
                <div
                  key={i}
                  className={`ob-trail-step ob-trail-step--${s.status} ${animate ? 'is-animating' : ''}`}
                  data-step-status={s.status}
                >
                  <span className="ob-trail-step-icon" aria-hidden="true">
                    {s.status === 'done'
                      ? <CheckCircleIcon size={14} />
                      : <SearchSmIcon size={14} />}
                  </span>
                  <span className="ob-trail-step-body">
                    <span className="ob-trail-step-label">{s.text}</span>
                  </span>
                </div>
              )
            })}
            {trailState === 'done' && (
              <div className="ob-trail-step ob-trail-step--done">
                <span className="ob-trail-step-icon" aria-hidden="true">
                  <CheckCircleIcon size={14} />
                </span>
                <span className="ob-trail-step-body">
                  <span className="ob-trail-step-label">Done</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* Insights bubble — rendered in-chat so the operator sees Nova's
 * "thinking" instead of the right pane growing a wall of bullets.
 * Same visual chassis as the research bubble but styled as a soft
 * purple thinking panel. */
function InsightsBubble({ headline, items }) {
  return (
    <div className="ob-msg ob-msg--nova ob-msg--insights">
      <div className="ob-insights-headline">{headline}</div>
      <ul className="ob-insights-list">
        {items.map((text, i) => (
          <li key={i} className="ob-insights-item">
            <span className="ob-insights-bullet" aria-hidden="true">•</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function OnboardingChat({
  messages,
  composerPlaceholder = 'Type a message…',
  composerDisabled = false,
  drawer = null,
  onSend,
}) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
  }, [messages, composerDisabled, drawer])

  useEffect(() => {
    if (!composerDisabled) inputRef.current?.focus()
  }, [composerDisabled])

  const submit = (e) => {
    e?.preventDefault?.()
    const v = draft.trim()
    if (!v || composerDisabled) return
    setDraft('')
    onSend?.(v)
  }

  return (
    <section className="ob-chat-section" aria-label="Teambridge AI">
      <div className="ob-chat-frame">
        <header className="ob-chat-head">
          <div className="ob-chat-title">
            <span className="ob-chat-avatar" aria-hidden="true">
              <img src={ROBOT_ANIMATION} alt="" />
            </span>
            <span className="ob-chat-title-copy">
              <span>Nova</span>
              <span>Teambridge specialist</span>
            </span>
          </div>
          <div className="ob-chat-status" aria-hidden="true">
            <TeambridgeLogo size={14} />
            <span>Live setup</span>
          </div>
        </header>

        <div className="ob-chat-scroll" ref={scrollRef}>
          <div className="ob-chat-messages">
            {messages.map((m, i) => {
              if (m.kind === 'research' || m.kind === 'thinking') {
                return <ResearchBubble key={m.id || i} headline={m.headline} steps={m.steps} />
              }
              if (m.kind === 'insights') {
                return <InsightsBubble key={m.id || i} headline={m.headline} items={m.items} />
              }
              if (m.kind === 'typing') {
                return (
                  <div key={m.id || i} className="ob-msg ob-msg--nova ob-msg--typing" aria-label="Composing…">
                    <span className="ob-typing-dots" aria-hidden="true">
                      <span /><span /><span />
                    </span>
                  </div>
                )
              }
              return (
                <Bubble key={m.id || i} from={m.from}>
                  {m.text}
                </Bubble>
              )
            })}
          </div>
        </div>

        {drawer ? (
          <div className="ob-drawer-slot">{drawer}</div>
        ) : (
          <footer className="ob-compose">
            <form className="ob-compose-row" onSubmit={submit}>
              <input
                ref={inputRef}
                type="text"
                className="ob-compose-input"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={composerPlaceholder}
                disabled={composerDisabled}
                autoComplete="off"
              />
              <button
                type="submit"
                className="ob-compose-send"
                disabled={composerDisabled || !draft.trim()}
                aria-label="Send"
              >
                <ArrowNarrowUpIcon size={16} />
              </button>
            </form>
          </footer>
        )}
      </div>
    </section>
  )
}
