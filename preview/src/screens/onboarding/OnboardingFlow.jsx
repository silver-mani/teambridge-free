import { useState, useMemo, useEffect } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ChevronLeftIcon } from '../../../../src/components/icons/ChevronLeftIcon.tsx'
import { INDUSTRIES } from '../IndustrySelector.jsx'
import DashboardShell, { DEFAULT_NAV_GROUPS, DEFAULT_NAV_BOTTOM } from '../shell/DashboardShell.jsx'
import OnboardingChat from './OnboardingChat.jsx'
import BuildContent from './BuildContent.jsx'
import BuildActivityFeed from './BuildActivityFeed.jsx'
import InfoPanel from './InfoPanel.jsx'
import { STEPS } from './steps.js'
import '../act1.css'
import './onboarding.css'

/* ──────────────────────────────────────────────────────────────────────
 * OnboardingFlow — `#/build` route.
 *
 * Two-phase build experience:
 *
 *   Phase 1 — chat-centric (steps 1–5: name, company, industry, batched
 *             team-shape card, connectors). Layout is chat in a centered
 *             column with a narrow InfoPanel on the right showing
 *             progress + workspace-so-far + coming-next. Modeled on
 *             Claude SMB's setup card pattern.
 *
 *   Phase 2 — full DashboardShell (steps 6–7: roster, done). Once we
 *             have enough data (industry + team + locations + pains +
 *             connectors), the layout pivots to the actual product
 *             chrome — LeftNav · chat · content · activity feed — and
 *             remaining steps populate inside the dashboard the operator
 *             will live in post-go-live.
 *
 * The transition point is intentional: it's the wow moment where the
 * operator sees Nova's work assemble into a real Teambridge in front
 * of them.
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
  if (step.input.kind === 'text')        return answers[step.input.field] || ''
  if (step.input.kind === 'choice')      return answers[step.input.field] || null
  if (step.input.kind === 'multichoice') return answers[step.input.field] || []
  if (step.input.kind === 'connectors')  return answers[step.input.field] || []
  if (step.input.kind === 'batched') {
    const obj = {}
    for (const g of step.input.groups) {
      obj[g.field] = answers[g.field] ?? (g.kind === 'multichoice' ? [] : null)
    }
    return obj
  }
  return null
}

/* Step focus key → LeftNav view id mapping. Step.focus uses descriptive
 * keys; the LeftNav uses the Act1 nav ids. */
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

  const lockSet = new Set()
  if (!hasIndustry) {
    DEFAULT_NAV_GROUPS.forEach(g => g.items.forEach(it => it.id !== 'overview' && lockSet.add(it.id)))
    DEFAULT_NAV_BOTTOM.items.forEach(it => lockSet.add(it.id))
  } else {
    if (!hasTeam)  ['people','schedule','shift-requests','time-tracking','timesheets','onboarding','engage'].forEach(id => lockSet.add(id))
    if (!hasPains) lockSet.add('workflows')
    if (!hasConn)  ['pay','review'].forEach(id => lockSet.add(id))
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

  // Active view in the Phase-2 content slot. Auto-follows step.focus
  // until the operator clicks a nav item themselves.
  const [view, setView] = useState(FOCUS_TO_VIEW[STEPS[0].focus] || 'overview')
  const [viewPinned, setViewPinned] = useState(false)

  const step = STEPS[stepIndex]
  const isDone = step.id === 'done'
  const phase = step.phase || 'chat-centric'
  const chatCentricStepCount = STEPS.filter(s => s.phase === 'chat-centric').length

  // Recompute draft default whenever step changes.
  useMemo(() => { setDraft(defaultDraftFor(step, answers)) }, [stepIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Swing view to the current step's focus on phase 2.
  useEffect(() => {
    if (viewPinned) return
    if (phase !== 'full') return
    const target = FOCUS_TO_VIEW[step.focus] || 'overview'
    if (target !== view) setView(target)
  }, [stepIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectView = (v) => {
    setView(v)
    setViewPinned(true)
  }

  const advance = (override) => {
    const value = override !== undefined ? override : draft
    setError(null)

    let nextAnswers
    if (step.input.kind === 'batched') {
      // value is an object (or {} when skipped). Write each field;
      // missing fields stay at current answers values.
      const payload = (value && typeof value === 'object') ? value : {}
      nextAnswers = { ...answers }
      for (const g of step.input.groups) {
        if (g.field in payload) nextAnswers[g.field] = payload[g.field]
      }
    } else if (step.input.kind === 'text') {
      const v = (value || '').trim()
      const err = step.validate ? step.validate(v) : null
      if (err) { setError(err); return }
      nextAnswers = step.input.field ? { ...answers, [step.input.field]: v } : answers
    } else if (step.input.field) {
      nextAnswers = { ...answers, [step.input.field]: value }
    } else {
      nextAnswers = answers
    }

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

  const industry = INDUSTRIES.find(i => i.id === answers.industry)
  const { navGroups, navBottom } = buildNavGroups(answers)

  const totalStepsForProgress = phase === 'chat-centric' ? chatCentricStepCount : STEPS.length

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

  const chat = (
    <OnboardingChat
      step={step}
      stepIndex={stepIndex}
      totalSteps={totalStepsForProgress}
      history={history}
      answers={answers}
      draft={draft}
      setDraft={setDraft}
      error={error}
      onSubmit={advance}
      onOpenDashboard={handleOpenDashboard}
    />
  )

  if (phase === 'chat-centric') {
    // Phase 1 — Claude-SMB style: chat centered, narrow info rail right.
    return (
      <div className="ob-root ob-root--phase1">
        {topBar}
        <div className="ob-phase1">
          <div className="ob-phase1-chat">{chat}</div>
          <InfoPanel stepIndex={stepIndex} answers={answers} />
        </div>
      </div>
    )
  }

  // Phase 2 — full DashboardShell.
  return (
    <div className="ob-root ob-root--phase2">
      {topBar}
      <DashboardShell
        mode="full"
        view={view}
        industryLabel={industry?.name ?? 'Workspace'}
        navGroups={navGroups}
        navBottom={navBottom}
        onBrand={onExit}
        onSelectView={handleSelectView}
        chat={chat}
        content={<BuildContent view={view} answers={answers} mode="full" />}
        activityFeed={<BuildActivityFeed answers={answers} />}
      />
    </div>
  )
}
