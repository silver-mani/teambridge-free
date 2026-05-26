import { useState, useEffect, useRef, useCallback } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import TeambridgeLogo from './TeambridgeLogo.jsx'
import { ChevronLeftIcon } from '../../../../src/components/icons/ChevronLeftIcon.tsx'
import { Bell01Icon } from '../../../../src/components/icons/Bell01Icon.tsx'
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

  // Activity drawer
  const [activityOpen, setActivityOpen] = useState(false)

  // Chat
  const [messages, setMessages] = useState(() => [
    { id: 'm0', from: 'nova', text:
      "Welcome to Teambridge. Drop in your company's website below and I'll configure your account from what I learn — industry, headcount, locations, and the agents you'll need from day one." },
  ])
  const researchTimersRef = useRef([])

  const pushMessage = useCallback((m) => {
    setMessages(prev => [...prev, { id: `m${prev.length}`, ...m }])
  }, [])

  /* ── Intake submit (from the chat-side IntakeDrawer) ── */
  const handleIntakeSubmit = useCallback((rawInput) => {
    const text = rawInput.trim()
    if (!text) return

    pushMessage({ from: 'user', text })

    const derived = deriveConfig(text, { fromFreeText: intakeMode === 'free-text' })
    if (!derived) {
      setIntakeMode('free-text')
      setIntakeDraft('')
      pushMessage({ from: 'nova', text:
        "I couldn't quite place that site. Mind giving me a two-line description of what your team does? I'll take it from there." })
      return
    }

    setConfig(derived)
    setIntakeDraft('')
    kickoffResearch(derived)
    setState('research')
  }, [intakeMode, pushMessage]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Kick off the research animation. Posts a single Nova "research"
   * bubble whose `steps` array updates in place as each delay fires.
   * Right pane's ConfigCard reveals matching fields. */
  function kickoffResearch(derived) {
    const steps = RESEARCH_STEPS(derived)
    const initialSteps = steps.map((s, i) => ({
      text: s.text,
      status: i === 0 ? 'active' : 'pending',
    }))
    setRevealedFields(new Set(['summary']))

    const researchId = `r-${Date.now()}`
    setMessages(prev => [
      ...prev,
      { id: researchId, from: 'nova', kind: 'research',
        headline: `Looking up ${derived.url || 'your description'}…`,
        steps: initialSteps },
    ])

    let cumulative = 0
    researchTimersRef.current = steps.map((step, i) => {
      cumulative += step.delay
      return setTimeout(() => {
        setRevealedFields(prev => {
          const next = new Set(prev)
          if (step.field) next.add(step.field)
          return next
        })
        setMessages(msgs => msgs.map(m => {
          if (m.id !== researchId) return m
          const nextSteps = m.steps.map((ps, idx) => {
            if (idx < i)  return { ...ps, status: 'done' }
            if (idx === i) return { ...ps, status: 'done', text: step.done }
            if (idx === i + 1) return { ...ps, status: 'active' }
            return ps
          })
          return { ...m, steps: nextSteps }
        }))
      }, cumulative)
    })

    const finalTimer = setTimeout(() => {
      pushMessage({ from: 'nova', text:
        `Here's what I found for ${derived.companyName}. Take a look on the right. Now — which agents should I activate?` })
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
      "Great. Last thing — how do you want to bring your team data over? I'll set it up either way." })
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
        ? "Perfect — sample data is fastest. Configuring your account now…"
        : "For this demo I'll preload sample employees. Configuring your account now…" })
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
    if (state === 'intake')      return "Tap below to share your company's URL…"
    if (state === 'research')    return 'Working…'
    if (state === 'agent-pick')  return 'Pick agents below, or send a message'
    if (state === 'import-pick') return 'Choose an import method below'
    if (state === 'building')    return 'Configuring your account…'
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
          <h1 className="ob-right-title">Your Teambridge</h1>
          <p className="ob-right-sub">
            Your dashboard will appear here as we learn about you.
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
          <h1 className="ob-right-title">Workspace forming</h1>
          <p className="ob-right-sub">Watch your account come together in real time.</p>
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
          <h1 className="ob-right-title">Configuring your account</h1>
          <p className="ob-right-sub">
            Wiring up {config?.companyName ?? 'your account'} end-to-end. This usually takes 10-15 seconds.
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
    const heading = state === 'agent-pick' ? 'Your account' : 'Almost there'
    const sub = state === 'agent-pick'
      ? (config?.url ? `Derived from ${config.url}. Tap any field to edit.` : 'Tap any field to edit.')
      : "Pick how you want to bring your team data over and I'll configure the rest."
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
      <header className="ob-topbar">
        <button type="button" className="ob-back" onClick={onExit}>
          <ChevronLeftIcon size={14} /> Back
        </button>
        <div className="ob-topbar-brand">
          <span className="ob-brand-mark" aria-hidden="true">
            <TeambridgeLogo size={24} />
          </span>
          <span className="ob-brand-text">Teambridge</span>
        </div>
        <button
          type="button"
          className={`ob-activity-toggle ${activityOpen ? 'is-open' : ''}`}
          onClick={() => setActivityOpen(o => !o)}
          aria-label="Toggle activity feed"
        >
          <Bell01Icon size={14} />
          <span>Activity</span>
        </button>
      </header>

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

        {/* Activity drawer — overlays the shell. Hidden until toggled. */}
        <div
          className={`activity-drawer-scrim ${activityOpen ? 'is-open' : ''}`}
          aria-hidden="true"
          onClick={() => setActivityOpen(false)}
        />
        <aside
          className={`activity-drawer-overlay ${activityOpen ? 'is-open' : ''}`}
          aria-hidden={!activityOpen}
        >
          <OnboardingActivityPlaceholder />
        </aside>
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
            {isUrl ? "Where should I start?" : "Tell me about your team."}
          </div>
          <div className="ob-drawer-sub">
            {isUrl
              ? "Drop in your company website — I'll figure out the rest."
              : "A two-line description is plenty for me to set things up."}
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

      {isUrl && (
        <div className="ob-drawer-examples">
          <span className="ob-drawer-examples-label">Try one:</span>
          {['hollywoodparkca.com', 'dignityhealth.org', 'marriott.com'].map(url => (
            <button
              key={url}
              type="button"
              className="ob-drawer-example"
              onClick={() => onSubmit(url)}
            >
              {url}
            </button>
          ))}
        </div>
      )}
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
            Which agents should I activate for {companyName || 'your Teambridge'}?
          </div>
          <div className="ob-drawer-sub">
            I'll run these from day one. You can switch any of them on or off later.
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
      detail: "Drop your existing roster file — I'll auto-map the columns.",
      tag: null,
    },
    {
      id: 'api',
      title: 'Sync from your HRIS',
      detail: 'Connect Workday, BambooHR, Rippling, or another HRIS via API.',
      tag: null,
    },
    {
      id: 'sample',
      title: 'Use sample demo data',
      detail: "Start with a seeded roster so you can explore right away.",
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
            How should I bring your team into {companyName || 'your Teambridge'}?
          </div>
          <div className="ob-drawer-sub">
            Pick one — I'll wire it up and finish provisioning your workspace.
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
      <p className="ob-wf-caption">Your Teambridge will materialize here.</p>
    </div>
  )
}

function OnboardingActivityPlaceholder() {
  return (
    <aside className="activity-feed bc-activity" aria-label="Activity feed (empty)">
      <div className="activity-feed-inner">
        <div className="activity-feed-header">
          <h2 className="activity-feed-title">Activity</h2>
        </div>
        <div className="bc-activity-empty">
          <span className="bc-activity-empty-mark" aria-hidden="true">
            <CheckCircleIcon size={14} />
          </span>
          <span>
            Once your workspace is live, every agent action lands here —
            shift coverage, OT swaps, agent runs, the lot.
          </span>
        </div>
      </div>
    </aside>
  )
}
