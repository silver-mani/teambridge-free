import { useEffect, useRef, useState } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ArrowNarrowUpIcon } from '../../../../src/components/icons/ArrowNarrowUpIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * OnboardingChat — Nova's chat panel. Lives in the shell's chat column
 * (slots into `.prompt-panel` chrome from Act1) for the whole flow:
 * intake, research, review, live. The panel itself never changes; only
 * the message history and compose behavior do.
 *
 * Layout:
 *   header (Nova title)
 *   scroll (message history — grows as Nova posts + user replies)
 *   compose (locked to the bottom — text input + send button, with
 *            optional quick-reply chips)
 *
 * Messages can be plain text bubbles or "research" bubbles that
 * update in-place with a checklist as Nova works.
 * ────────────────────────────────────────────────────────────────────── */

/* Message renderer. Nova messages render as plain left-aligned text
 * (no bubble) — modeled on Claude's chat UI; the AI is the surface,
 * not a chip. User messages keep the bubble so it's obvious which
 * turns came from them. */
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

/* Nova's research turn — a self-updating checklist that fills in as
 * each discovery step completes. Plain text (no bubble) like other
 * Nova messages, with the checklist below. */
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

  // Auto-scroll to bottom whenever a new message lands or the
  // composer becomes enabled (so the operator's eye lands on the
  // input when it's their turn).
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
  }, [messages, composerDisabled, drawer])

  // Re-focus the input when it becomes available again.
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
    <section className="prompt-panel ob-chat" aria-label="Teambridge AI">
      <div className="prompt-panel-inner ob-chat-inner">
        <header className="prompt-panel-head ob-chat-head">
          <div className="prompt-panel-title">
            <span className="prompt-panel-mark" aria-hidden="true">
              <TeambridgeAIIcon size={10} />
            </span>
            <span>Nova</span>
            <span className="ob-chat-sub" aria-hidden="true">· Teambridge AI</span>
          </div>
        </header>

        <div className="prompt-scroll ob-chat-scroll" ref={scrollRef}>
          <div className="prompt-messages ob-chat-messages">
            {messages.map((m, i) => {
              if (m.kind === 'research') {
                return <ResearchBubble key={m.id || i} headline={m.headline} steps={m.steps} />
              }
              return (
                <Bubble key={m.id || i} from={m.from}>
                  {m.text}
                </Bubble>
              )
            })}
          </div>
        </div>

        {drawer && <div className="ob-drawer-slot">{drawer}</div>}

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
      </div>
    </section>
  )
}
