import { useState, useCallback } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ChevronLeftIcon } from '../../../../src/components/icons/ChevronLeftIcon.tsx'
import { INDUSTRIES } from '../IndustrySelector.jsx'
import DashboardShell, { DEFAULT_NAV_GROUPS, DEFAULT_NAV_BOTTOM } from '../shell/DashboardShell.jsx'
import UrlIntake from './UrlIntake.jsx'
import ResearchNarrative from './ResearchNarrative.jsx'
import ConfigReview from './ConfigReview.jsx'
import BuildContent from './BuildContent.jsx'
import BuildActivityFeed from './BuildActivityFeed.jsx'
import { deriveConfig, headcountRangeFor } from './urlMatcher.js'
import '../act1.css'
import './onboarding.css'

/* ──────────────────────────────────────────────────────────────────────
 * OnboardingFlow — `#/build` route.
 *
 * Four-state machine, Context → Configuration → Confirm:
 *
 *   intake    URL input (single field). Free-text fallback on unmatched.
 *   research  Nova narrates discoveries while ConfigCard fills in on
 *             the right (~5s, time-paced).
 *   review    Fully editable ConfigCard. Confirm or start over.
 *   live      Full DashboardShell, populated from the confirmed config.
 *
 * The flow does the work; the operator confirms. One real input, one
 * review, one click to land in the dashboard.
 * ────────────────────────────────────────────────────────────────────── */

/* Convert a confirmed config into the `answers` shape the existing
 * BuildContent + BuildActivityFeed expect. Keeps those components
 * unchanged across the rewrite. */
function configToAnswers(config) {
  return {
    firstName:     '',
    company:       config.companyName,
    industry:      config.industry,
    teamSize:      config.headcountRange || headcountRangeFor(config.headcount || 0),
    locationModel: locationModelFor(config.locations),
    pains:         config.agents || [],
    connectors:    config.suggestedConnectors || [],
    rosterChoice:  'hris',
    roles:         config.roles || [],
  }
}

function locationModelFor(locations = []) {
  if (locations.length <= 1) return 'single'
  if (locations.length <= 3) return 'multi-local'
  return 'multi-regional'
}

const FOCUS_TO_VIEW = {
  overview: 'overview', people: 'people', schedule: 'schedule',
  agents: 'workflows', integrations: 'settings',
}

function buildNavGroups(answers) {
  // Once we're live, all the nav is unlocked — the config has populated
  // everything. (Pre-confirm we don't even render the nav.) But we keep
  // the helper around so this is symmetric with the run-mode case
  // when we migrate Act1 onto the shared shell.
  const apply = group => ({ ...group, items: group.items.map(it => ({ ...it })) })
  return {
    navGroups: DEFAULT_NAV_GROUPS.map(apply),
    navBottom: apply(DEFAULT_NAV_BOTTOM),
  }
}

export default function OnboardingFlow({ onExit, onComplete }) {
  const [state, setState]   = useState('intake')        // 'intake' | 'research' | 'review' | 'live'
  const [intakeMode, setIntakeMode] = useState('url')   // 'url' | 'free-text'
  const [intakeError, setIntakeError] = useState(null)
  const [config, setConfig] = useState(null)
  const [view, setView]     = useState('overview')
  const [viewPinned, setViewPinned] = useState(false)

  const handleIntakeSubmit = useCallback((input) => {
    const derived = deriveConfig(input, { fromFreeText: intakeMode === 'free-text' })
    if (!derived) {
      // No curated or heuristic match — fall back to free-text input.
      setIntakeMode('free-text')
      setIntakeError(null)
      return
    }
    setIntakeError(null)
    setConfig(derived)
    setState('research')
  }, [intakeMode])

  const handleResearchComplete = useCallback(() => {
    setState('review')
  }, [])

  const handleConfirm = useCallback(() => {
    setState('live')
    try { sessionStorage.setItem('tb:build-config', JSON.stringify(config)) } catch { /* ignore */ }
  }, [config])

  const handleStartOver = useCallback(() => {
    setConfig(null)
    setIntakeMode('url')
    setIntakeError(null)
    setState('intake')
  }, [])

  const handleSelectView = useCallback((v) => {
    setView(v)
    setViewPinned(true)
  }, [])

  const handleOpenDashboard = useCallback(() => {
    onComplete?.(config)
  }, [config, onComplete])

  const topBar = (
    <header className="ob-topbar">
      <button type="button" className="ob-back" onClick={() => {
        if (state === 'intake') onExit?.()
        else if (state === 'review') handleStartOver()
        else onExit?.()
      }}>
        <ChevronLeftIcon size={14} />
        {state === 'intake' ? 'Back' : state === 'review' ? 'Start over' : 'Exit'}
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

  if (state === 'intake') {
    return (
      <div className="ob-root ob-root--intake">
        {topBar}
        <UrlIntake mode={intakeMode} onSubmit={handleIntakeSubmit} error={intakeError} />
      </div>
    )
  }

  if (state === 'research') {
    return (
      <div className="ob-root ob-root--research">
        {topBar}
        <ResearchNarrative config={config} onComplete={handleResearchComplete} />
      </div>
    )
  }

  if (state === 'review') {
    return (
      <div className="ob-root ob-root--review">
        {topBar}
        <ConfigReview
          config={config}
          onChange={setConfig}
          onConfirm={handleConfirm}
          onStartOver={handleStartOver}
        />
      </div>
    )
  }

  // state === 'live'
  const answers = configToAnswers(config)
  const industry = INDUSTRIES.find(i => i.id === answers.industry)
  const { navGroups, navBottom } = buildNavGroups(answers)
  const liveView = viewPinned ? view : (FOCUS_TO_VIEW[view] || view || 'overview')

  return (
    <div className="ob-root ob-root--live">
      {topBar}
      <DashboardShell
        mode="full"
        view={liveView}
        industryLabel={industry?.name ?? 'Workspace'}
        navGroups={navGroups}
        navBottom={navBottom}
        onBrand={onExit}
        onSelectView={handleSelectView}
        chat={
          <LiveChatStub
            config={config}
            onOpenDashboard={handleOpenDashboard}
          />
        }
        content={<BuildContent view={liveView} answers={answers} mode="full" />}
        activityFeed={<BuildActivityFeed answers={answers} />}
      />
    </div>
  )
}

/* In the 'live' state the chat is no longer asking onboarding questions
 * — Nova has done her work. This small stub renders Nova's closing
 * message and a primary CTA to "open" the dashboard (which routes the
 * operator into the real industry demo with their config). */
function LiveChatStub({ config, onOpenDashboard }) {
  return (
    <section className="prompt-panel" aria-label="Teambridge AI">
      <div className="prompt-panel-inner">
        <div className="prompt-panel-head">
          <div className="prompt-panel-title">
            <span className="prompt-panel-mark" aria-hidden="true">
              <TeambridgeAIIcon size={10} />
            </span>
            <span>Nova</span>
          </div>
        </div>

        <div className="prompt-scroll">
          <div className="prompt-messages">
            <div className="ob-turn">
              <div className="ob-bubble-row ob-bubble-row--nova">
                <span className="ob-avatar ob-avatar--nova" aria-hidden="true">
                  <TeambridgeAIIcon size={14} />
                </span>
                <div className="ob-bubble ob-bubble--nova">
                  Your Teambridge is live, {config.companyName}. Take a look around —
                  I've set up your roster, locations, and the agents most teams in
                  your space run from day one. I'll be here whenever you need me.
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="ob-chat-input">
          <button type="button" className="ob-cta ob-cta--primary" onClick={onOpenDashboard}>
            Open the full demo
          </button>
          <p className="ob-done-foot">
            Or poke around right here — every section on the right is real.
          </p>
        </footer>
      </div>
    </section>
  )
}
