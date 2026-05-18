import { useState, useEffect, useRef } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { CheckIcon } from '../../../../src/components/icons/CheckIcon.tsx'
import { ArrowNarrowUpIcon } from '../../../../src/components/icons/ArrowNarrowUpIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * OnboardingChat — left rail of the build flow. Renders the transcript
 * of completed turns, then the current question, then the answer
 * affordance for whatever input kind the step expects. The flow shell
 * owns the answers + step index — this component is purely presentational
 * plus an onSubmit hook back to the parent.
 *
 * Note: this is the same chat shell Nova lives in post-go-live. Setup
 * is just its initial state — copy + affordances change, the surface
 * doesn't go anywhere.
 * ────────────────────────────────────────────────────────────────────── */

function AvatarNova() {
  return (
    <span className="ob-avatar ob-avatar--nova" aria-hidden="true">
      <TeambridgeAIIcon size={14} />
    </span>
  )
}

function ChatBubble({ from, children }) {
  return (
    <div className={`ob-bubble-row ob-bubble-row--${from}`}>
      {from === 'nova' && <AvatarNova />}
      <div className={`ob-bubble ob-bubble--${from}`}>{children}</div>
    </div>
  )
}

function TextInput({ step, value, onChange, onSubmit, error }) {
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [step.id])

  return (
    <form
      className="ob-input-row"
      onSubmit={e => { e.preventDefault(); onSubmit() }}
    >
      <input
        ref={ref}
        type="text"
        className={`ob-text-input ${error ? 'is-invalid' : ''}`}
        placeholder={step.input.placeholder}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
      />
      <button
        type="submit"
        className="ob-send-button"
        disabled={!value || !value.trim()}
        aria-label="Send"
      >
        <ArrowNarrowUpIcon size={16} />
      </button>
      {error && <span className="ob-input-error">{error}</span>}
    </form>
  )
}

function ChoiceGrid({ step, value, onSelect }) {
  const cols = step.input.columns || 1
  return (
    <div className="ob-choice-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {step.input.options.map(opt => {
        const selected = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            className={`ob-choice ${selected ? 'is-selected' : ''}`}
            onClick={() => onSelect(opt.id)}
          >
            <span className="ob-choice-main">{opt.label}</span>
            {opt.detail && <span className="ob-choice-detail">{opt.detail}</span>}
            {selected && (
              <span className="ob-choice-check" aria-hidden="true">
                <CheckIcon size={14} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function MultiChoice({ step, value, onChange, onSubmit }) {
  const set = new Set(value || [])
  const max = step.input.max ?? Infinity

  const toggle = id => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else if (next.size < max) next.add(id)
    onChange(Array.from(next))
  }

  return (
    <div className="ob-multichoice">
      <div className="ob-multichoice-grid">
        {step.input.options.map(opt => {
          const selected = set.has(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              className={`ob-pill ${selected ? 'is-selected' : ''}`}
              onClick={() => toggle(opt.id)}
            >
              <span className="ob-pill-dot" aria-hidden="true">
                {selected && <CheckIcon size={12} />}
              </span>
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>
      <div className="ob-multichoice-foot">
        <span className="ob-multichoice-count">
          {set.size > 0 ? `${set.size} selected` : 'Pick what feels right'}
        </span>
        <button
          type="button"
          className="ob-cta"
          onClick={onSubmit}
        >
          {set.size > 0 ? 'Continue' : 'Skip'}
          <ArrowNarrowRightIcon size={14} />
        </button>
      </div>
    </div>
  )
}

function Connectors({ step, value, onChange, onSubmit }) {
  const set = new Set(value || [])
  const toggle = id => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(Array.from(next))
  }

  return (
    <div className="ob-connectors">
      <div className="ob-connectors-grid">
        {step.input.options.map(opt => {
          const selected = set.has(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              className={`ob-connector ${selected ? 'is-selected' : ''}`}
              onClick={() => toggle(opt.id)}
            >
              <span
                className="ob-connector-mark"
                style={{
                  background: `var(--color-${opt.accent}-bg-tertiary)`,
                  color:      `var(--color-${opt.accent}-content-secondary)`,
                }}
                aria-hidden="true"
              >
                {opt.label.charAt(0)}
              </span>
              <span className="ob-connector-body">
                <span className="ob-connector-name">{opt.label}</span>
                <span className="ob-connector-cat">{opt.category}</span>
              </span>
              <span className={`ob-connector-toggle ${selected ? 'is-on' : ''}`} aria-hidden="true">
                {selected ? <CheckIcon size={12} /> : null}
              </span>
            </button>
          )
        })}
      </div>
      <div className="ob-multichoice-foot">
        <span className="ob-multichoice-count">
          {set.size > 0 ? `${set.size} connected` : 'Optional — connect anytime'}
        </span>
        <button type="button" className="ob-cta" onClick={onSubmit}>
          {set.size > 0 ? 'Continue' : 'Skip'}
          <ArrowNarrowRightIcon size={14} />
        </button>
      </div>
    </div>
  )
}

function DoneAffordance({ onOpen }) {
  return (
    <div className="ob-done">
      <button type="button" className="ob-cta ob-cta--primary" onClick={onOpen}>
        Open your Teambridge
        <ArrowNarrowRightIcon size={14} />
      </button>
      <p className="ob-done-foot">
        We'll keep your setup saved — switch to a demo account anytime from the top-left.
      </p>
    </div>
  )
}

export default function OnboardingChat({
  step,
  stepIndex,
  totalSteps,
  history,
  answers,
  draft,
  setDraft,
  error,
  onSubmit,
  onOpenDashboard,
}) {
  const scrollRef = useRef(null)

  // Auto-scroll to bottom on new step.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
  }, [stepIndex])

  const promptText = typeof step.prompt === 'function' ? step.prompt(answers) : step.prompt

  return (
    <section className="prompt-panel ob-chat" aria-label="Teambridge AI">
      <div className="prompt-panel-inner">
        <header className="prompt-panel-head ob-chat-head">
          <div className="prompt-panel-title">
            <span className="prompt-panel-mark" aria-hidden="true">
              <TeambridgeAIIcon size={10} />
            </span>
            <span>Nova</span>
            <span className="ob-chat-sub" aria-hidden="true">· Teambridge AI</span>
          </div>
          <div className="ob-chat-progress" aria-label={`Step ${stepIndex + 1} of ${totalSteps}`}>
            <span className="ob-chat-progress-fill" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }} />
          </div>
        </header>

        <div className="prompt-scroll ob-chat-scroll" ref={scrollRef}>
          <div className="prompt-messages ob-chat-feed">
            {history.map((turn, i) => (
              <div key={`turn-${i}`} className="ob-turn">
                <ChatBubble from="nova">{turn.prompt}</ChatBubble>
                {turn.answer && <ChatBubble from="user">{turn.answer}</ChatBubble>}
              </div>
            ))}
            <div className="ob-turn ob-turn--current">
              <ChatBubble from="nova">{promptText}</ChatBubble>
            </div>
          </div>
        </div>

        <footer className="ob-chat-input">
          {step.input.kind === 'text' && (
            <TextInput
              step={step}
              value={draft}
              onChange={setDraft}
              onSubmit={onSubmit}
              error={error}
            />
          )}
          {step.input.kind === 'choice' && (
            <ChoiceGrid step={step} value={draft} onSelect={(v) => { setDraft(v); onSubmit(v) }} />
          )}
          {step.input.kind === 'multichoice' && (
            <MultiChoice step={step} value={draft} onChange={setDraft} onSubmit={() => onSubmit()} />
          )}
          {step.input.kind === 'connectors' && (
            <Connectors step={step} value={draft} onChange={setDraft} onSubmit={() => onSubmit()} />
          )}
          {step.input.kind === 'done' && (
            <DoneAffordance onOpen={onOpenDashboard} />
          )}
        </footer>
      </div>
    </section>
  )
}
