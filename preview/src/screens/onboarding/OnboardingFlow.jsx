import { useState, useEffect, useRef, useCallback } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { ArrowNarrowUpIcon } from '../../../../src/components/icons/ArrowNarrowUpIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { INDUSTRIES } from '../IndustrySelector.jsx'
import DashboardShell, { DEFAULT_NAV_GROUPS, DEFAULT_NAV_BOTTOM } from '../shell/DashboardShell.jsx'
import OnboardingChat from './OnboardingChat.jsx'
import ConfigCard, { ALL_FIELDS } from './ConfigCard.jsx'
import { deriveConfig } from './urlMatcher.js'
import { PAIN_OPTIONS, PAIN_TO_AGENT } from './steps.js'
import AgentAvatar from './AgentAvatar.jsx'
import AgentsCard from './AgentsCard.jsx'
import BuildProgressCard from './BuildProgressCard.jsx'
import '../act1.css'
import './onboarding.css'

/* ──────────────────────────────────────────────────────────────────────
 * OnboardingFlow — `#/build` route.
 *
 * Three-state machine; consistent shell throughout (LeftNav · Nova chat ·
 * right-side UI · activity-drawer overlay).
 *
 *   intake    Nova greets in chat. The URL is captured via a Claude-
 *             style bottom drawer inside the chat (compose disabled).
 *             Right pane shows an animated wireframe loop indicating
 *             where the dashboard will appear.
 *   research  Nova posts a single research bubble that updates with a
 *             checklist over ~5s. Right pane's ConfigCard reveals one
 *             field at a time. Compose disabled.
 *   review    Nova asks for confirmation in chat. Right pane's
 *             ConfigCard is fully editable (no buttons there — passive
 *             preview). The bottom drawer asks for work email and
 *             surfaces the Build CTA.
 *
 * Once confirmed → onComplete(config) hands off to main.jsx which
 * routes to `#/<industry>` for the existing Act1 demo experience.
 * The full live dashboard lives there, not inside the build flow.
 * ────────────────────────────────────────────────────────────────────── */

const RESEARCH_STEPS = (config) => [
  { text: `Reading ${config.url || 'your description'}…`,
    done: `Read ${config.url || 'your description'}.`,
    field: null, delay: 600 },
  { text: 'Identifying your industry…',
    done: `Industry: ${(INDUSTRIES.find(i => i.id === config.industry)?.name) || config.industry}.`,
    field: 'industry', delay: 800 },
  { text: 'Estimating your team size…',
    done: `Team: ~${config.headcount?.toLocaleString()} people.`,
    field: 'headcount', delay: 700 },
  { text: 'Mapping your locations…',
    done: `Found ${config.locations?.length ?? 0} site${(config.locations?.length ?? 0) === 1 ? '' : 's'}.`,
    field: 'locations', delay: 900 },
  { text: 'Drafting your role list…',
    done: `${config.roles?.length ?? 0} role types identified.`,
    field: 'roles', delay: 700 },
  { text: 'Recommending your first agents…',
    done: `${config.agents?.length ?? 0} agents ready to activate.`,
    field: 'agents', delay: 800 },
]

/* Lock all nav items during onboarding — the operator can't navigate
 * into anything until the dashboard hand-off. */
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
  // State machine — drives chat drawer + right pane composition.
  //   intake       URL prompt (chat drawer)
  //   research     Nova narrates discoveries; right pane reveals card
  //   agent-pick   Drawer is the agent toggle list; right pane = ConfigCard
  //                (without agents row)
  //   import-pick  Drawer is CSV/API/Sample chooser; right pane adds
  //                an AgentsCard below the ConfigCard
  //   building     Drawer is hidden; right pane adds the animated
  //                BuildProgressCard; onComplete fires when done.
  const [state, setState] = useState('intake')
  const [intakeMode, setIntakeMode] = useState('url')
  const [intakeDraft, setIntakeDraft] = useState('')
  const [config, setConfig] = useState(null)
  const [revealedFields, setRevealedFields] = useState(new Set(['summary']))
  const [importMethod, setImportMethod] = useState(null)  // 'csv' | 'api' | 'sample'

  // Chat
  const [messages, setMessages] = useState(() => [
    { id: 'm0', from: 'nova', text:
      "Hi! Enter your company website below — we'll use it to set up your account in about a minute." },
  ])
  const researchTimersRef = useRef([])

  const pushMessage = useCallback((m) => {
    setMessages(prev => [...prev, { id: `m${prev.length}`, ...m }])
  }, [])

  /* ── Intake submit (from the chat-side IntakeDrawer) ──
   * Async: transitions to 'research' state immediately, posts a
   * placeholder research bubble with step 0 ("Reading…") active,
   * fires the Claude-backed /api/derive-config call in parallel, and
   * cascades the remaining reveal steps once the config returns.
   *
   * urlMatcher.deriveConfig falls back to a heuristic if the API
   * errors out, so this resolves with a usable config unless the
   * input was empty. */
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

    // Post the placeholder research bubble (step 0 active).
    const bubbleId = `r-${Date.now()}`
    setMessages(prev => [
      ...prev,
      { id: bubbleId, from: 'nova', kind: 'research',
        headline: `Looking up ${placeholderUrl}…`,
        steps: [
          { text: `Reading ${placeholderUrl}…`,           status: 'active' },
          { text: 'Identifying your industry…',           status: 'pending' },
          { text: 'Estimating your team size…',           status: 'pending' },
          { text: 'Mapping your locations…',              status: 'pending' },
          { text: 'Drafting your role list…',             status: 'pending' },
          { text: 'Recommending your first agents…',      status: 'pending' },
        ] },
    ])
    setState('research')

    // Hit /api/derive-config (or fall back to heuristic on error).
    let derived = null
    try {
      derived = await deriveConfig(text, { fromFreeText: isFreeText })
    } catch (err) {
      console.error('[onboarding] deriveConfig threw:', err)
    }

    if (!derived) {
      // Empty input or hard failure — bail back to free-text intake.
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

  /* Once the API has responded, fast-forward step 0 (Reading…) to done
   * and cascade through steps 1-5 with their delays. Right pane's
   * ConfigCard reveals each field as its matching step completes. */
  function cascadeResearchSteps(derived, bubbleId) {
    const fullSteps = RESEARCH_STEPS(derived)
    const finalHeadline = `Looking up ${derived.url || 'your description'}…`

    // Mark step 0 done + step 1 active immediately (no delay — the API
    // already took its time, no need to wait further).
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

    // Cascade steps 1..N with their delays.
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
            if (k < idx)  return { ...ps, status: 'done', text: fullSteps[k].done }
            if (k === idx) return { ...ps, status: 'done', text: fullSteps[idx].done }
            if (k === idx + 1) return { ...ps, status: 'active' }
            return ps
          })
          return { ...m, steps: next }
        }))
      }, cumulative)
      researchTimersRef.current.push(timer)
    }

    // After all reveals + a settling beat, transition to agent-pick.
    const finalTimer = setTimeout(() => {
      pushMessage({ from: 'nova', text:
        `Here's ${derived.companyName} on the right. Pick the agents to turn on below.` })
      setState('agent-pick')
    }, cumulative + 700)
    researchTimersRef.current.push(finalTimer)
  }

  useEffect(() => {
    return () => {
      researchTimersRef.current.forEach(clearTimeout)
      researchTimersRef.current = []
    }
  }, [])

  /* ── Agent-pick → Import-pick ── */
  const handleAgentsConfirmed = useCallback(() => {
    if (!config?.agents || config.agents.length === 0) return
    const labels = (config.agents || [])
      .map(id => PAIN_TO_AGENT[id]?.name)
      .filter(Boolean)
    pushMessage({ from: 'user', text:
      `${labels.length} agent${labels.length === 1 ? '' : 's'}: ${labels.join(', ')}` })
    pushMessage({ from: 'nova', text:
      "Got it. Last step — choose how to bring your team in." })
    setState('import-pick')
  }, [config, pushMessage])

  /* ── Import-pick → Building ── */
  const handleImportPicked = useCallback((method) => {
    setImportMethod(method)
    const label = method === 'csv'    ? 'Upload a CSV'
                : method === 'api'    ? 'Connect via API'
                :                       'Use sample demo data'
    pushMessage({ from: 'user', text: label })
    pushMessage({ from: 'nova', text:
      method === 'sample'
        ? "Setting up your account now. This takes about 15 seconds."
        : "For this demo we'll load sample employees. Setting up your account now." })
    setState('building')
    try { sessionStorage.setItem('tb:build-config', JSON.stringify(config)) } catch { /* ignore */ }
  }, [config, pushMessage])

  /* ── Building animation complete → hand off to industry demo ── */
  const handleBuildComplete = useCallback(() => {
    onComplete?.(config)
  }, [config, onComplete])

  const handleStartOver = useCallback(() => {
    researchTimersRef.current.forEach(clearTimeout)
    researchTimersRef.current = []
    setConfig(null)
    setRevealedFields(new Set(['summary']))
    setIntakeMode('url')
    setIntakeDraft('')
    setState('intake')
    setMessages([
      { id: 'm0', from: 'nova', text:
        "Let's try again — drop in a different website (or description) below." },
    ])
  }, [])

  /* ── Render ── */
  const industry = state === 'intake' ? null : (config ? INDUSTRIES.find(i => i.id === config.industry) : null)
  const { navGroups, navBottom } = buildLockedNav()

  const composerPlaceholder = (() => {
    if (state === 'intake')      return 'Use the form below'
    if (state === 'research')    return 'Setting up…'
    if (state === 'agent-pick')  return 'Pick agents below'
    if (state === 'import-pick') return 'Pick one below'
    if (state === 'building')    return 'Setting up…'
    return 'Type a message…'
  })()
  const composerDisabled = true   // input flows through the drawer at every step

  const drawer = (() => {
    if (state === 'intake') {
      return (
        <IntakeDrawer
          mode={intakeMode}
          value={intakeDraft}
          onChange={setIntakeDraft}
          onSubmit={handleIntakeSubmit}
        />
      )
    }
    if (state === 'agent-pick') {
      return (
        <AgentPickDrawer
          companyName={config?.companyName}
          agents={config?.agents || []}
          onAgentsChange={(next) => setConfig(c => ({ ...c, agents: next }))}
          onSubmit={handleAgentsConfirmed}
          onStartOver={handleStartOver}
        />
      )
    }
    if (state === 'import-pick') {
      return (
        <ImportPickDrawer
          companyName={config?.companyName}
          onPick={handleImportPicked}
        />
      )
    }
    return null
  })()

  const chat = (
    <OnboardingChat
      messages={messages}
      composerPlaceholder={composerPlaceholder}
      composerDisabled={composerDisabled}
      drawer={drawer}
      onSend={() => { /* compose disabled across the build flow */ }}
    />
  )

  /* Fields shown in the main ConfigCard — agents are intentionally
   * pulled out into their own AgentsCard once picked. */
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
    content = (
      <div className="ob-right">
        <header className="ob-right-head">
          <h1 className="ob-right-title">Your account</h1>
          <p className="ob-right-sub">Filling in based on what we find.</p>
        </header>
        <div className="ob-right-body">
          <ConfigCard
            config={config}
            editable={false}
            visibleFields={cardFields.filter(f => revealedFields.has(f))}
          />
        </div>
      </div>
    )
  } else if (state === 'building') {
    // Fresh screen — BuildProgressCard owns the entire right pane while
    // Nova provisions the workspace. No ConfigCard / AgentsCard
    // distractions; the animation is the whole moment.
    content = (
      <div className="ob-right ob-right--building">
        <header className="ob-right-head">
          <h1 className="ob-right-title">Setting up your account</h1>
          <p className="ob-right-sub">
            This takes about 15 seconds.
          </p>
        </header>
        <div className="ob-right-body ob-right-body--centered">
          <BuildProgressCard
            config={config}
            importMethod={importMethod}
            onComplete={handleBuildComplete}
          />
        </div>
      </div>
    )
  } else {
    // agent-pick, import-pick — same shell, AgentsCard stacks below
    // ConfigCard once agents are confirmed.
    const heading = 'Your account'
    const sub = state === 'agent-pick'
      ? (config?.url ? `Based on ${config.url}. Tap to edit anything.` : 'Tap to edit anything.')
      : 'One more step to finish setup.'
    content = (
      <div className="ob-right">
        <header className="ob-right-head">
          <h1 className="ob-right-title">{heading}</h1>
          <p className="ob-right-sub">{sub}</p>
        </header>
        <div className="ob-right-body">
          <ConfigCard
            config={config}
            editable={state === 'agent-pick'}
            onChange={setConfig}
            visibleFields={cardFields}
          />
          {state === 'import-pick' && (
            <AgentsCard agents={config?.agents || []} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="ob-root">
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

/* ─── Agent-pick drawer — first review step. Toggleable list of all 6
 *     Teambridge agents with avatars + descriptions. Continue advances
 *     to the import-pick step. */
function AgentPickDrawer({ companyName, agents, onAgentsChange, onSubmit, onStartOver }) {
  const set = new Set(agents || [])
  const toggle = (id) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onAgentsChange(Array.from(next))
  }
  const count = set.size

  return (
    <div className="ob-drawer" role="group" aria-label="Activate agents and build">
      <div className="ob-drawer-head">
        <span className="ob-drawer-mark" aria-hidden="true">
          <TeambridgeAIIcon size={14} />
        </span>
        <div className="ob-drawer-text">
          <div className="ob-drawer-title">
            Pick your agents
          </div>
          <div className="ob-drawer-sub">
            These run from day one. Change them anytime.
          </div>
        </div>
      </div>

      <ul className="ob-drawer-agents">
        {PAIN_OPTIONS.map(p => {
          const agent = PAIN_TO_AGENT[p.id]
          if (!agent) return null
          const on = set.has(p.id)
          return (
            <li key={p.id}>
              <button
                type="button"
                className={`ob-drawer-agent ${on ? 'is-on' : ''}`}
                onClick={() => toggle(p.id)}
                aria-pressed={on}
              >
                <AgentAvatar painId={p.id} size={24} />
                <span className="ob-drawer-agent-text">
                  <span className="ob-drawer-agent-name">{agent.name}</span>
                  <span className="ob-drawer-agent-detail">{agent.detail}</span>
                </span>
                <span className={`ob-drawer-agent-toggle ${on ? 'is-on' : ''}`} aria-hidden="true">
                  {on && <CheckCircleIcon size={14} />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="ob-drawer-foot">
        <button type="button" className="ob-drawer-back" onClick={onStartOver}>
          Start over
        </button>
        <button
          type="button"
          className="ob-drawer-cta"
          onClick={onSubmit}
          disabled={count === 0}
        >
          Continue
          <ArrowNarrowRightIcon size={14} />
        </button>
      </div>
    </div>
  )
}

/* ─── Import-pick drawer — second review step. Three big choices for
 *     how to bring team data over. Sample is the recommended demo
 *     path; CSV / API map to the same animation with adjusted
 *     narration for the demo. */
function ImportPickDrawer({ companyName, onPick }) {
  const options = [
    {
      id: 'csv',
      title: 'Upload a CSV',
      detail: 'Use your existing roster file.',
      tag: null,
    },
    {
      id: 'api',
      title: 'Sync from your HRIS',
      detail: 'Connect Workday, BambooHR, or Rippling.',
      tag: null,
    },
    {
      id: 'sample',
      title: 'Use sample data',
      detail: 'Explore with a pre-loaded roster.',
      tag: 'Fastest',
    },
  ]
  return (
    <div className="ob-drawer" role="group" aria-label="Choose import method">
      <div className="ob-drawer-head">
        <span className="ob-drawer-mark" aria-hidden="true">
          <TeambridgeAIIcon size={14} />
        </span>
        <div className="ob-drawer-text">
          <div className="ob-drawer-title">
            Bring in your team
          </div>
          <div className="ob-drawer-sub">
            Pick one to finish setup.
          </div>
        </div>
      </div>

      <ul className="ob-drawer-imports">
        {options.map(opt => (
          <li key={opt.id}>
            <button
              type="button"
              className={`ob-drawer-import ${opt.id === 'sample' ? 'is-recommended' : ''}`}
              onClick={() => onPick(opt.id)}
            >
              <div className="ob-drawer-import-text">
                <span className="ob-drawer-import-title">
                  {opt.title}
                  {opt.tag && <span className="ob-drawer-import-tag">{opt.tag}</span>}
                </span>
                <span className="ob-drawer-import-detail">{opt.detail}</span>
              </div>
              <ArrowNarrowRightIcon size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── Wireframe loop — animated placeholder for the right pane during
 *     intake. Pulses a faint mockup of the dashboard to indicate where
 *     the operator's account will appear. */
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

