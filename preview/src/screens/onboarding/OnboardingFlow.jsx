import { useState, useMemo, useEffect } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ChevronLeftIcon } from '../../../../src/components/icons/ChevronLeftIcon.tsx'
import OnboardingChat from './OnboardingChat.jsx'
import BuildPreview from './BuildPreview.jsx'
import { STEPS } from './steps.js'
import './onboarding.css'

/* ──────────────────────────────────────────────────────────────────────
 * OnboardingFlow — `#/build` route. Two-pane layout:
 *   • Left:  Nova chat assistant walking through ~8 setup turns
 *   • Right: live product preview — actual Teambridge surfaces
 *           (Overview / Schedule / People / Agents / Integrations)
 *           that populate from each answer.
 *
 * Each step has a `focus` hint that swings the preview to the tab
 * most relevant to that question (e.g. team-size → People). Once the
 * operator clicks into a different tab, we respect that choice and
 * stop auto-switching for the rest of the session.
 * ────────────────────────────────────────────────────────────────────── */

const DEFAULT_ANSWERS = Object.freeze({
  firstName: '',
  company: '',
  industry: null,
  teamSize: null,
  locationModel: null,
  pains: [],
  connectors: [],
  rosterChoice: null,
})

function loadAnswers() {
  try {
    const raw = sessionStorage.getItem('tb:build-answers')
    if (!raw) return { ...DEFAULT_ANSWERS }
    return { ...DEFAULT_ANSWERS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_ANSWERS }
  }
}

function saveAnswers(answers) {
  try { sessionStorage.setItem('tb:build-answers', JSON.stringify(answers)) }
  catch { /* ignore */ }
}

function defaultDraftFor(step, answers) {
  if (step.input.kind === 'text') return answers[step.input.field] || ''
  if (step.input.kind === 'choice') return answers[step.input.field] || null
  if (step.input.kind === 'multichoice') return answers[step.input.field] || []
  if (step.input.kind === 'connectors') return answers[step.input.field] || []
  return null
}

export default function OnboardingFlow({ onExit, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState(loadAnswers)
  const [draft, setDraft] = useState(() => defaultDraftFor(STEPS[0], loadAnswers()))
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)
  // Preview tab. Auto-follows step.focus until the operator clicks a
  // tab themselves; from then on we respect their choice.
  const [activeTab, setActiveTab] = useState(STEPS[0].focus || 'overview')
  const [tabPinned, setTabPinned] = useState(false)

  const step = STEPS[stepIndex]
  const isDone = step.id === 'done'

  // Recompute draft default whenever step changes.
  useMemo(() => { setDraft(defaultDraftFor(step, answers)) }, [stepIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Swing the preview tab to whatever the current step wants to highlight,
  // unless the operator has manually picked a tab.
  useEffect(() => {
    if (tabPinned) return
    if (step.focus && step.focus !== activeTab) setActiveTab(step.focus)
  }, [stepIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setTabPinned(true)
  }

  const advance = (override) => {
    const value = override !== undefined ? override : draft
    let writeValue = value

    // Text inputs validate; trim before storing.
    if (step.input.kind === 'text') {
      const v = (value || '').trim()
      const err = step.validate ? step.validate(v) : null
      if (err) { setError(err); return }
      writeValue = v
    }
    setError(null)

    const nextAnswers = step.input.field
      ? { ...answers, [step.input.field]: writeValue }
      : answers

    // Push the just-completed turn into the transcript.
    const promptText = typeof step.prompt === 'function' ? step.prompt(answers) : step.prompt
    const transcriptText = step.transcript ? step.transcript(nextAnswers) : null
    setHistory(h => [...h, { prompt: promptText, answer: transcriptText }])

    setAnswers(nextAnswers)
    saveAnswers(nextAnswers)

    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1)
    }
  }

  const goBack = () => {
    if (stepIndex === 0) { onExit?.(); return }
    setStepIndex(stepIndex - 1)
    setHistory(h => h.slice(0, -1))
    setError(null)
  }

  const handleOpenDashboard = () => {
    saveAnswers(answers)
    onComplete?.(answers)
  }

  return (
    <div className="ob-root">
      <header className="ob-topbar">
        <button type="button" className="ob-back" onClick={goBack}>
          <ChevronLeftIcon size={14} />
          {stepIndex === 0 ? 'Back' : 'Previous'}
        </button>
        <div className="ob-topbar-brand">
          <span className="ob-brand-mark" aria-hidden="true">
            <TeambridgeAIIcon size={14} />
          </span>
          <span className="ob-brand-text">Teambridge setup</span>
        </div>
        <button
          type="button"
          className="ob-back ob-back--right"
          onClick={onExit}
        >
          Skip to demo
        </button>
      </header>

      <div className="ob-shell">
        <OnboardingChat
          step={step}
          stepIndex={stepIndex}
          totalSteps={STEPS.length}
          history={history}
          answers={answers}
          draft={draft}
          setDraft={setDraft}
          error={error}
          onSubmit={advance}
          onOpenDashboard={handleOpenDashboard}
        />
        <BuildPreview
          answers={answers}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isDone={isDone}
        />
      </div>
    </div>
  )
}
