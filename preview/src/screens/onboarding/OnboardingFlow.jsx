import { useState, useEffect, useRef, useCallback } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ArrowNarrowUpIcon } from '../../../../src/components/icons/ArrowNarrowUpIcon.tsx'
import { INDUSTRIES } from '../IndustrySelector.jsx'
import DashboardShell, { DEFAULT_NAV_GROUPS, DEFAULT_NAV_BOTTOM } from '../shell/DashboardShell.jsx'
import OnboardingChat from './OnboardingChat.jsx'
import ConfigCard, { ALL_FIELDS } from './ConfigCard.jsx'
import { InsightsStep, AgentsStep, PoliciesStep, DataStep } from './ReviewSteps.jsx'
import BuildProgressCard from './BuildProgressCard.jsx'
import { deriveConfig } from './urlMatcher.js'
import '../act1.css'
import './onboarding.css'

/* ──────────────────────────────────────────────────────────────────────
 * OnboardingFlow — `#/build` route.
 *
 * Collapsed 4-state machine (was 9):
 *
 *   intake     URL prompt (chat drawer)
 *   research   Right pane reveals ConfigCard field-by-field while
 *              Claude looks up the company; ~5s animation paced to
 *              cover the API call.
 *   confirm    Right pane: ConfirmCard — ONE screen with everything
 *              Nova derived (insights, agents, policies, import
 *              method). Defaults are all set so the operator just
 *              clicks "Launch my account"; sections expand to edit.
 *              No chat drawer; chat is quiet.
 *   launching  Right pane: BuildProgressCard, 5 substantive steps
 *              over ~8s. Hand-off to industry demo when done.
 *
 * On launch we set sessionStorage tb:fresh-launch=1 — Act1Dashboard
 * reads this on first mount and skips the scripted cancellation scene
 * so the operator lands on a calm "this is mine" view instead of
 * "watch Sandra Lee cancel".
 * ────────────────────────────────────────────────────────────────────── */

const RESEARCH_STEPS = (config) => [
  { text: `Fetching ${config.url || 'your description'}…`,
    done: `Fetched ${config.url || 'your description'} — parsed 14 pages.`,
    field: null, delay: 1400 },
  { text: 'Crawling your careers page…',
    done: `Reviewed ${config.roles?.length ?? 6} active job postings to confirm role types.`,
    field: null, delay: 1700 },
  { text: 'Cross-referencing LinkedIn…',
    done: `Verified team size and location footprint against public LinkedIn data.`,
    field: null, delay: 1600 },
  { text: 'Identifying your industry…',
    done: `Industry: ${(INDUSTRIES.find(i => i.id === config.industry)?.name) || config.industry}.`,
    field: 'industry', delay: 1400 },
  { text: 'Checking public filings + OSHA records…',
    done: 'Reviewed DOL filings and OSHA inspections for the last 24 months.',
    field: null, delay: 1900 },
  { text: 'Estimating your team size…',
    done: `Team: ~${config.headcount?.toLocaleString()} hourly + shift workers.`,
    field: 'headcount', delay: 1400 },
  { text: 'Mapping your locations…',
    done: `Found ${config.locations?.length ?? 0} primary site${(config.locations?.length ?? 0) === 1 ? '' : 's'} across your footprint.`,
    field: 'locations', delay: 1600 },
  { text: 'Identifying state-level regulations…',
    done: 'Indexed labor policies that apply to each location.',
    field: null, delay: 1500 },
  { text: 'Drafting your role list…',
    done: `${config.roles?.length ?? 0} role types identified with shift-pattern variants.`,
    field: 'roles', delay: 1400 },
  { text: 'Reading 6 months of news mentions…',
    done: 'Picked up signal on growth, hiring waves, and operational changes.',
    field: null, delay: 1600 },
  { text: 'Benchmarking against your peers…',
    done: 'Compared your shape to 12 similar operators in the space.',
    field: null, delay: 1700 },
  { text: 'Surfacing what stands out…',
    done: 'Got a clear read.',
    field: 'agents', delay: 1500 },
]

function configToAnswers(config, importMethod = 'sample') {
  return {
    firstName:     '',
    company:       config?.companyName,
    industry:      config?.industry,
    teamSize:      headcountRangeFor(config?.headcount || 0),
    locationModel: locationModelFor(config?.locations),
    pains:         config?.agents || [],
    connectors:    config?.suggestedConnectors || [],
    rosterChoice:  importMethod === 'csv' ? 'csv' : importMethod === 'api' ? 'hris' : 'sample',
    roles:         config?.roles || [],
  }
}
function headcountRangeFor(h) {
  if (h <= 25)  return '1-25'
  if (h <= 100) return '26-100'
  if (h <= 500) return '101-500'
  return '500+'
}
function locationModelFor(locations = []) {
  if (locations.length <= 1) return 'single'
  if (locations.length <= 3) return 'multi-local'
  return 'multi-regional'
}

function buildLockedNav() {
  const apply = group => ({
    ...group,
    items: group.items.map(it => ({ ...it, locked: true })),
  })
  return {
    navGroups: DEFAULT_NAV_GROUPS.map(apply),
    navBottom: apply(DEFAULT_NAV_BOTTOM),
  }
}

export default function OnboardingFlow({ onExit, onComplete }) {
  const [state, setState] = useState('intake')              // 'intake' | 'research' | 'insights' | 'agents' | 'policies' | 'data' | 'launching'
  const [intakeMode, setIntakeMode] = useState('url')       // 'url' | 'free-text'
  const [intakeDraft, setIntakeDraft] = useState('')
  const [config, setConfig] = useState(null)
  const [revealedFields, setRevealedFields] = useState(new Set(['summary']))
  const [importMethod, setImportMethod] = useState('sample')
  const [policies, setPolicies] = useState([])

  const [messages, setMessages] = useState(() => [
    { id: 'm0', from: 'nova', text:
      "Welcome to Teambridge. Drop your company website below — I'll set up your account from what I learn." },
  ])
  const researchTimersRef = useRef([])
  const typingTimersRef = useRef([])

  /* Push a chat message. Nova messages get a typing-indicator pause
   * before they reveal. Action-triggered transactional acks (user
   * just clicked something) can bypass the typing by passing
   * { instant: true } — that keeps the chat snappy when the user
   * is in control. */
  const pushMessage = useCallback((m) => {
    if (m.from !== 'nova' || m.kind === 'research' || m.kind === 'thinking' || m.instant) {
      setMessages(prev => [...prev, { id: `m${prev.length}`, ...m }])
      return
    }
    const typingId = `typing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setMessages(prev => [...prev, { id: typingId, from: 'nova', kind: 'typing' }])
    const timer = setTimeout(() => {
      setMessages(prev => {
        const without = prev.filter(x => x.id !== typingId)
        return [...without, { id: `m${without.length}`, ...m }]
      })
    }, 1100)
    typingTimersRef.current.push(timer)
  }, [])

  useEffect(() => () => {
    typingTimersRef.current.forEach(clearTimeout)
    typingTimersRef.current = []
  }, [])

  /* ── Intake submit ── */
  const handleIntakeSubmit = useCallback(async (rawInput) => {
    const text = rawInput.trim()
    if (!text) return

    const isFreeText = intakeMode === 'free-text'
    const placeholderUrl = isFreeText
      ? 'your description'
      : text.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')

    pushMessage({ from: 'user', text })
    setIntakeDraft('')
    setRevealedFields(new Set(['summary']))

    const bubbleId = `r-${Date.now()}`
    setMessages(prev => [
      ...prev,
      { id: bubbleId, from: 'nova', kind: 'research',
        headline: `Looking up ${placeholderUrl}…`,
        steps: [
          { text: `Fetching ${placeholderUrl}…`,                status: 'active' },
          { text: 'Crawling your careers page…',                status: 'pending' },
          { text: 'Cross-referencing LinkedIn…',                status: 'pending' },
          { text: 'Identifying your industry…',                 status: 'pending' },
          { text: 'Checking public filings + OSHA records…',    status: 'pending' },
          { text: 'Estimating your team size…',                 status: 'pending' },
          { text: 'Mapping your locations…',                    status: 'pending' },
          { text: 'Identifying state-level regulations…',       status: 'pending' },
          { text: 'Drafting your role list…',                   status: 'pending' },
          { text: 'Reading 6 months of news mentions…',         status: 'pending' },
          { text: 'Benchmarking against your peers…',           status: 'pending' },
          { text: 'Surfacing what stands out…',                 status: 'pending' },
        ] },
    ])
    setState('research')

    let derived = null
    try {
      derived = await deriveConfig(text, { fromFreeText: isFreeText })
    } catch (err) {
      console.error('[onboarding] deriveConfig threw:', err)
    }

    if (!derived) {
      setMessages(msgs => msgs.filter(m => m.id !== bubbleId))
      setIntakeMode('free-text')
      pushMessage({ from: 'nova', text:
        "We couldn't read that. Tell us what your team does in a sentence or two." })
      setState('intake')
      return
    }

    setConfig(derived)
    cascadeResearchSteps(derived, bubbleId)
  }, [intakeMode, pushMessage]) // eslint-disable-line react-hooks/exhaustive-deps

  function cascadeResearchSteps(derived, bubbleId) {
    const fullSteps = RESEARCH_STEPS(derived)
    const finalHeadline = `Read ${derived.url || 'your description'}.`

    setMessages(msgs => msgs.map(m => {
      if (m.id !== bubbleId) return m
      const nextSteps = fullSteps.map((s, idx) => ({
        text: idx === 0 ? s.done : s.text,
        status: idx === 0 ? 'done' : idx === 1 ? 'active' : 'pending',
      }))
      return { ...m, headline: finalHeadline, steps: nextSteps }
    }))
    if (fullSteps[0].field) {
      setRevealedFields(prev => new Set([...prev, fullSteps[0].field]))
    }

    let cumulative = 0
    researchTimersRef.current = []
    for (let i = 1; i < fullSteps.length; i++) {
      cumulative += fullSteps[i].delay
      const idx = i
      const timer = setTimeout(() => {
        const field = fullSteps[idx].field
        if (field) setRevealedFields(prev => new Set([...prev, field]))
        setMessages(msgs => msgs.map(m => {
          if (m.id !== bubbleId) return m
          const next = m.steps.map((ps, k) => {
            if (k < idx)     return { ...ps, status: 'done', text: fullSteps[k].done }
            if (k === idx)   return { ...ps, status: 'done', text: fullSteps[idx].done }
            if (k === idx+1) return { ...ps, status: 'active' }
            return ps
          })
          return { ...m, steps: next }
        }))
      }, cumulative)
      researchTimersRef.current.push(timer)
    }

    // After all reveals + a settling beat, push the insights message
    // and transition to the first review step.
    const finalTimer = setTimeout(() => {
      pushMessage({ from: 'nova', text:
        `Got a clear read on ${derived.companyName}. I'll walk you through what I set up on the right.` })
      setState('insights')
    }, cumulative + 700)
    researchTimersRef.current.push(finalTimer)
  }

  useEffect(() => () => {
    researchTimersRef.current.forEach(clearTimeout)
    researchTimersRef.current = []
  }, [])

  /* ── Review step transitions ──
   * Each Continue advances state. Back goes one step earlier.
   * Final step (DataStep) calls onLaunch which transitions to
   * 'launching' (the BuildProgressCard animation). */
  const handleInsightsContinue = useCallback(() => {
    pushMessage({ from: 'nova', text: "Here are the agents I'm activating — toggle any on or off.", instant: true })
    setState('agents')
  }, [pushMessage])
  const handleAgentsContinue = useCallback(() => {
    pushMessage({ from: 'nova', text: "And here are the labor policies I'd apply — based on your states.", instant: true })
    setState('policies')
  }, [pushMessage])
  const handlePoliciesContinue = useCallback((picked) => {
    setPolicies(picked || [])
    pushMessage({ from: 'nova', text: "Last step — how should I bring your team's data in?", instant: true })
    setState('data')
  }, [pushMessage])
  const handleLaunch = useCallback((picks) => {
    setImportMethod(picks?.importMethod || 'sample')
    pushMessage({ from: 'nova', text:
      `Launching your account. About 30 seconds — there's real configuration work happening behind the scenes.`, instant: true })
    setState('launching')
    try {
      sessionStorage.setItem('tb:build-config', JSON.stringify(config))
      sessionStorage.setItem('tb:fresh-launch', '1')
    } catch { /* ignore */ }
  }, [config, pushMessage])

  const handleLaunchComplete = useCallback(() => {
    onComplete?.(config)
  }, [config, onComplete])

  /* ── Render ── */
  const industry = state === 'intake' ? null : (config ? INDUSTRIES.find(i => i.id === config.industry) : null)
  const { navGroups, navBottom } = buildLockedNav()

  const composerPlaceholder = (() => {
    if (state === 'intake')    return 'Use the form below'
    if (state === 'research')  return 'Setting up…'
    if (state === 'insights' || state === 'agents' || state === 'policies' || state === 'data')
                                return 'Continue on the right →'
    if (state === 'launching') return 'Launching…'
    return 'Type a message…'
  })()
  const composerDisabled = true

  const drawer = state === 'intake' ? (
    <IntakeDrawer
      mode={intakeMode}
      value={intakeDraft}
      onChange={setIntakeDraft}
      onSubmit={handleIntakeSubmit}
    />
  ) : null

  const chat = (
    <OnboardingChat
      messages={messages}
      composerPlaceholder={composerPlaceholder}
      composerDisabled={composerDisabled}
      drawer={drawer}
      onSend={() => { /* disabled */ }}
    />
  )

  const cardFields = ALL_FIELDS.filter(f => f !== 'agents')

  let content
  if (state === 'intake') {
    content = (
      <div className="ob-right ob-right--intake">
        <header className="ob-right-head">
          <h1 className="ob-right-title">Your account</h1>
          <p className="ob-right-sub">
            Your dashboard will appear here as you go.
          </p>
        </header>
        <div className="ob-right-body">
          <WireframeLoop />
        </div>
      </div>
    )
  } else if (state === 'research') {
    // While Claude is still researching, config is null — keep the
    // animated wireframe visible so the right pane doesn't look empty.
    // As soon as the API returns, swap to the ConfigCard which then
    // reveals fields one by one.
    content = (
      <div className="ob-right">
        <header className="ob-right-head">
          <h1 className="ob-right-title">Your account</h1>
          <p className="ob-right-sub">Filling in based on what we find.</p>
        </header>
        <div className="ob-right-body">
          {config ? (
            <ConfigCard
              config={config}
              editable={false}
              visibleFields={cardFields.filter(f => revealedFields.has(f))}
            />
          ) : (
            <WireframeLoop />
          )}
        </div>
      </div>
    )
  } else if (state === 'launching') {
    content = (
      <div className="ob-right ob-right--building">
        <header className="ob-right-head">
          <h1 className="ob-right-title">Launching your account</h1>
          <p className="ob-right-sub">
            About 30 seconds. Real configuration — building templates, wiring pay rules, training agents, running compliance checks.
          </p>
        </header>
        <div className="ob-right-body ob-right-body--centered">
          <BuildProgressCard
            config={config}
            importMethod={importMethod}
            policies={policies}
            agents={config?.agents}
            onComplete={handleLaunchComplete}
          />
        </div>
      </div>
    )
  } else {
    // insights / agents / policies / data — each is its own focused card
    let stepCard = null
    if (state === 'insights') {
      stepCard = <InsightsStep config={config} onChange={setConfig} onContinue={handleInsightsContinue} />
    } else if (state === 'agents') {
      stepCard = (
        <AgentsStep
          config={config}
          onChange={setConfig}
          onBack={() => setState('insights')}
          onContinue={handleAgentsContinue}
        />
      )
    } else if (state === 'policies') {
      stepCard = (
        <PoliciesStep
          config={config}
          onBack={() => setState('agents')}
          onContinue={handlePoliciesContinue}
        />
      )
    } else {
      stepCard = (
        <DataStep
          config={config}
          onBack={() => setState('policies')}
          onLaunch={handleLaunch}
        />
      )
    }
    const headTitle = state === 'insights' ? 'Review your account'
                    : state === 'agents'   ? 'Agents'
                    : state === 'policies' ? 'Labor policies'
                    :                        'Starting data'
    const stepNum = state === 'insights' ? 1 : state === 'agents' ? 2 : state === 'policies' ? 3 : 4
    content = (
      <div className="ob-right">
        <header className="ob-right-head">
          <h1 className="ob-right-title">{headTitle}</h1>
          <p className="ob-right-sub">Step {stepNum} of 4 · Continue when ready.</p>
        </header>
        <div className="ob-right-body">{stepCard}</div>
      </div>
    )
  }

  return (
    <div className="ob-root ob-root--no-nav">
      <div className="ob-shell-frame">
        <DashboardShell
          mode="full"
          view="overview"
          industryLabel={industry?.name ?? 'Workspace'}
          navGroups={navGroups}
          navBottom={navBottom}
          onBrand={onExit}
          onSelectView={() => { /* locked */ }}
          chat={chat}
          content={content}
          showLeftNav={false}
          showActivityFeed={false}
        />
      </div>
    </div>
  )
}

/* ─── Intake drawer — Claude-style bottom drawer for the URL prompt ─ */
function IntakeDrawer({ mode, value, onChange, onSubmit }) {
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [mode])

  const submit = (e) => {
    e?.preventDefault?.()
    if (!value.trim()) return
    onSubmit(value)
  }

  const isUrl = mode === 'url'

  return (
    <div className="ob-drawer" role="group" aria-label={isUrl ? 'Company URL' : 'Describe your team'}>
      <div className="ob-drawer-head">
        <span className="ob-drawer-mark" aria-hidden="true">
          <TeambridgeAIIcon size={14} />
        </span>
        <div className="ob-drawer-text">
          <div className="ob-drawer-title">
            {isUrl ? 'Enter your company website' : 'Describe your team'}
          </div>
          <div className="ob-drawer-sub">
            {isUrl
              ? "We'll use it to set up your account."
              : 'A sentence or two is enough.'}
          </div>
        </div>
      </div>

      <form className="ob-drawer-url-form" onSubmit={submit}>
        <div className="ob-drawer-url-field">
          {isUrl && <span className="ob-drawer-url-prefix">https://</span>}
          <input
            ref={ref}
            type="text"
            className="ob-drawer-url-input"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={isUrl ? 'yourcompany.com' : 'e.g. We run 3 senior-living communities across LA.'}
            autoComplete="off"
            spellCheck={!isUrl}
          />
          <button
            type="submit"
            className="ob-drawer-url-submit"
            disabled={!value.trim()}
            aria-label="Continue"
          >
            <ArrowNarrowUpIcon size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

/* ─── Wireframe loop — animated placeholder for the right pane during
 *     intake. Pulses a faint mockup of the dashboard. */
function WireframeLoop() {
  const cells = Array.from({ length: 35 }, (_, i) => i)
  return (
    <div className="ob-wf" aria-hidden="true">
      <div className="ob-wf-app">
        <div className="ob-wf-app-head">
          <div className="ob-wf-pill ob-wf-pill--lg" />
          <div className="ob-wf-pill ob-wf-pill--sm" />
        </div>
        <div className="ob-wf-stats">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="ob-wf-tile" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="ob-wf-tile-label" />
              <div className="ob-wf-tile-value" />
              <div className="ob-wf-tile-sub" />
            </div>
          ))}
        </div>
        <div className="ob-wf-section">
          <div className="ob-wf-section-head">
            <div className="ob-wf-pill ob-wf-pill--sm" />
          </div>
          <div className="ob-wf-grid">
            {cells.map(i => (
              <div
                key={i}
                className="ob-wf-cell"
                style={{ animationDelay: `${(i % 7) * 80 + Math.floor(i / 7) * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="ob-wf-caption">Your dashboard will appear here.</p>
    </div>
  )
}
