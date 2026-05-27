import { useEffect, useRef, useState } from 'react'
import { ArrowNarrowUpIcon } from '../../../../src/components/icons/ArrowNarrowUpIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import TeambridgeLogo from './TeambridgeLogo.jsx'

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

function ResearchBubble({ headline, steps }) {
  return (
    <div className="ob-msg ob-msg--nova">
      <div className="ob-research-headline">{headline}</div>
      <ul className="ob-research-list">
        {steps.map((s, i) => (
          <li key={i} className={`ob-research-step ob-research-step--${s.status}`}>
            <span className="ob-research-mark" aria-hidden="true">
              {s.status === 'done' && <CheckCircleIcon size={11} />}
              {s.status === 'active' && <span className="ob-research-spin" />}
            </span>
            <span className="ob-research-text">{s.text}</span>
          </li>
        ))}
      </ul>
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
            <span className="ob-chat-mark" aria-hidden="true">
              <TeambridgeLogo size={16} />
            </span>
            <span>Teambridge AI</span>
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
