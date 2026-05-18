import { useState, useMemo, useEffect } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ChevronLeftIcon } from '../../../../src/components/icons/ChevronLeftIcon.tsx'
import { INDUSTRIES } from '../IndustrySelector.jsx'
import DashboardShell, { DEFAULT_NAV_GROUPS, DEFAULT_NAV_BOTTOM } from '../shell/DashboardShell.jsx'
import OnboardingChat from './OnboardingChat.jsx'
import BuildContent from './BuildContent.jsx'
import BuildActivityFeed from './BuildActivityFeed.jsx'
import { STEPS } from './steps.js'
import '../act1.css'
import './onboarding.css'

/* ──────────────────────────────────────────────────────────────────────
 * OnboardingFlow — `#/build` route.
 *
 * Layout: this composes the shared `DashboardShell` (LeftNav · Nova chat ·
 * content · activity feed) — the same chrome Act1 will use post-migration.
 * Build mode is just the shell in its initial state:
 *   • Pre-industry: 'chat-prominent' — chat centered, faint "workspace
 *     forming" canvas on the right, nav hidden.
 *   • Post-industry: 'full' — nav appears with items progressively
 *     unlocking, content surface for the current view, activity feed
 *     narrating what Nova just built.
 *
 * Each step's `focus` swings the active view (Home/People/Schedule/…)
 * to whichever surface is most relevant. The operator can click into
 * any unlocked nav item to override.
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

/* Step focuses to nav view ids. Step.focus uses descriptive keys
 * (overview / people / schedule / agents / integrations); the shell's
 * LeftNav uses the Act1 nav ids (overview / people / schedule /
 * workflows / settings). This bridges them. */
const FOCUS_TO_VIEW = {
  overview:     'overview',
  people:       'people',
  schedule:     'schedule',
  agents:       'workflows',
  integrations: 'settings',
}

/* Build the nav groups with `locked: true` for items the operator
 * can't meaningfully interact with yet. Locks progressively lift as
 * answers come in. */
function buildNavGroups(answers) {
  const hasIndustry = !!answers.industry
  const hasTeam     = !!answers.teamSize
  const hasPains    = (answers.pains || []).length > 0
  const hasConn     = (answers.connectors || []).length > 0

  // Locking logic — keep it simple and forgiving.
  const lockSet = new Set()
  if (!hasIndustry) {
    // Pre-industry, everything is locked.
    DEFAULT_NAV_GROUPS.forEach(g => g.items.forEach(it => it.id !== 'overview' && lockSet.add(it.id)))
    DEFAULT_NAV_BOTTOM.items.forEach(it => lockSet.add(it.id))
  } else {
    if (!hasTeam)  lockSet.add('people').add('schedule').add('shift-requests').add('time-tracking').add('timesheets').add('onboarding').add('engage')
    if (!hasPains) lockSet.add('workflows')
    if (!hasConn)  lockSet.add('pay').add('review')
    // Settings / policies stay unlocked once industry is known — they're
    // useful surfaces for configuring the workspace even mid-setup.
  }

  const apply = group => ({
    ...group,
    items: group.items.map(it => lockSet.has(it.id) ? { ...it, locked: true } : it),
  })
  return {
    navGroups: DEFAULT_NAV_GROUPS.map(apply),
    navBottom: apply(DEFAULT_NAV_BOTTOM),
  }
}

export default function OnboardingFlow({ onExit, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState(loadAnswers)
  const [draft, setDraft] = useState(() => defaultDraftFor(STEPS[0], loadAnswers()))
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)

  // Active view in the right-side content slot. Auto-follows step.focus
  // until the operator clicks a nav item themselves; from then on we
  // respect their choice.
  const [view, setView] = useState(FOCUS_TO_VIEW[STEPS[0].focus] || 'overview')
  const [viewPinned, setViewPinned] = useState(false)

  const step = STEPS[stepIndex]
  const isDone = step.id === 'done'
  const mode = answers.industry ? 'full' : 'chat-prominent'

  // Recompute draft default whenever step changes.
  useMemo(() => { setDraft(defaultDraftFor(step, answers)) }, [stepIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Swing the active view to whatever the current step wants to
  // highlight, unless the operator pinned a view themselves.
  useEffect(() => {
    if (viewPinned) return
    const target = FOCUS_TO_VIEW[step.focus] || 'overview'
    if (target !== view) setView(target)
  }, [stepIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectView = (v) => {
    setView(v)
    setViewPinned(true)
  }

  const advance = (override) => {
    const value = override !== undefined ? override : draft
    let writeValue = value

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

  const industry = INDUSTRIES.find(i => i.id === answers.industry)
  const { navGroups, navBottom } = buildNavGroups(answers)

  const topBar = (
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
      <button type="button" className="ob-back ob-back--right" onClick={onExit}>
        Skip to demo
      </button>
    </header>
  )

  return (
    <div className="ob-root">
      {topBar}
      <DashboardShell
        mode={mode}
        view={view}
        industryLabel={industry?.name ?? 'Workspace'}
        navGroups={navGroups}
        navBottom={navBottom}
        onBrand={onExit}
        onSelectView={handleSelectView}
        chat={
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
        }
        content={<BuildContent view={view} answers={answers} mode={mode} />}
        activityFeed={mode === 'full' ? <BuildActivityFeed answers={answers} /> : null}
        showLeftNav={mode === 'full'}
      />
    </div>
  )
}
