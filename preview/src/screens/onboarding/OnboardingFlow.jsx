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
import { PAIN_OPTIONS, PAIN_TO_AGENT, OUTCOME_OPTIONS, OUTCOME_TO_AGENTS } from './steps.js'
import AgentAvatar from './AgentAvatar.jsx'
import AgentsCard from './AgentsCard.jsx'
import BuildProgressCard from './BuildProgressCard.jsx'
import DataMappingCard from './DataMappingCard.jsx'
import PoliciesCard from './PoliciesCard.jsx'
import AgentsLaunchCard from './AgentsLaunchCard.jsx'
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
    field: null, delay: 1100 },
  { text: 'Cross-referencing public data…',
    done: 'Verified company details against LinkedIn and public filings.',
    field: null, delay: 1300 },
  { text: 'Identifying your industry…',
    done: `Industry: ${(INDUSTRIES.find(i => i.id === config.industry)?.name) || config.industry}.`,
    field: 'industry', delay: 1200 },
  { text: 'Estimating your team size…',
    done: `Team: ~${config.headcount?.toLocaleString()} people.`,
    field: 'headcount', delay: 1100 },
  { text: 'Mapping your locations…',
    done: `Found ${config.locations?.length ?? 0} site${(config.locations?.length ?? 0) === 1 ? '' : 's'}.`,
    field: 'locations', delay: 1300 },
  { text: 'Drafting your role list…',
    done: `${config.roles?.length ?? 0} role types identified.`,
    field: 'roles', delay: 1100 },
  { text: 'Matching workflows to your shape…',
    done: 'Surfaced the agents typical for your industry and size.',
    field: 'agents', delay: 1200 },
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
  //   intake       URL prompt (chat drawer); right = WireframeLoop
  //   research     Right pane reveals ConfigCard field-by-field
  //   outcomes     Chat drawer: "what are you looking to do?"
  //                multi-select; right = ConfigCard (no agents row)
  //   import       Chat drawer: CSV/API/Sample picker;
  //                right = ConfigCard + outcomes summary
  //   mapping      Clean slate on right; animated data-mapping list
  //                "Security → Role", "SoFi Stadium → Site", etc.
  //                Chat is quiet (no drawer, no compose).
  //   policies     Right: PoliciesCard, state-based labor policies
  //   agents       Right: AgentsLaunchCard with launch CTA
  //   (no 'done' state — onComplete fires from AgentsLaunchCard)
  const [state, setState] = useState('intake')
  const [intakeMode, setIntakeMode] = useState('url')
  const [intakeDraft, setIntakeDraft] = useState('')
  const [config, setConfig] = useState(null)
  const [revealedFields, setRevealedFields] = useState(new Set(['summary']))
  const [outcomes, setOutcomes] = useState([])      // outcome ids picked in 'outcomes' state
  const [importMethod, setImportMethod] = useState(null)  // 'csv' | 'api' | 'sample'
  const [policies, setPolicies] = useState([])      // policy ids picked in 'policies' state

  // Chat
  const [messages, setMessages] = useState(() => [
    { id: 'm0', from: 'nova', text:
      "Hi! Enter your company website below — we'll use it to set up your account in about a minute." },
  ])
  const researchTimersRef = useRef([])

  const typingTimersRef = useRef([])
  /* Push a message into the chat. Nova messages get a brief typing
   * indicator (3 animated dots) before the real text appears, so the
   * conversation reads as the AI actually composing a reply. */
  const pushMessage = useCallback((m) => {
    if (m.from !== 'nova' || m.kind === 'research') {
      // Non-nova or research bubbles render instantly.
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
    }, 1300)   // ~1.3s feels like the AI is actually composing
    typingTimersRef.current.push(timer)
  }, [])

  useEffect(() => () => {
    typingTimersRef.current.forEach(clearTimeout)
    typingTimersRef.current = []
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

    // After all reveals + a settling beat, ask the outcomes question.
    const finalTimer = setTimeout(() => {
      pushMessage({ from: 'nova', text:
        `Got a good read on ${derived.companyName}. What are you looking to do with Teambridge?` })
      setState('outcomes')
    }, cumulative + 700)
    researchTimersRef.current.push(finalTimer)
  }

  useEffect(() => {
    return () => {
      researchTimersRef.current.forEach(clearTimeout)
      researchTimersRef.current = []
    }
  }, [])

  /* ── Outcomes → Import ── */
  const handleOutcomesConfirmed = useCallback(() => {
    if (outcomes.length === 0) return
    const labels = outcomes
      .map(id => OUTCOME_OPTIONS.find(o => o.id === id)?.label)
      .filter(Boolean)
    pushMessage({ from: 'user', text:
      labels.length === 1 ? labels[0] : `${labels.length} goals` })
    pushMessage({ from: 'nova', text:
      "Got it. Next — how should I bring your team's data in?" })
    setState('import')
  }, [outcomes, pushMessage])

  /* ── Import → Mapping ── */
  const handleImportPicked = useCallback((method) => {
    setImportMethod(method)
    const label = method === 'csv' ? 'Upload a CSV'
                : method === 'api' ? 'Sync from HRIS'
                :                    'Use sample data'
    pushMessage({ from: 'user', text: label })
    pushMessage({ from: 'nova', text: "Mapping things up on the right. Hang tight." })
    setState('mapping')
    try { sessionStorage.setItem('tb:build-config', JSON.stringify(config)) } catch { /* ignore */ }
  }, [config, pushMessage])

  /* ── Mapping animation complete → Policies ── */
  const handleMappingComplete = useCallback(() => {
    pushMessage({ from: 'nova', text:
      "Now — labor policies for your states. Toggle off anything you don't need." })
    setState('policies')
  }, [pushMessage])

  /* ── Policies → Agents ── */
  const handlePoliciesContinue = useCallback((picked) => {
    setPolicies(picked)
    pushMessage({ from: 'user', text:
      picked.length === 0 ? 'No policies' : `${picked.length} polic${picked.length === 1 ? 'y' : 'ies'} on` })
    pushMessage({ from: 'nova', text:
      "Last step — pick which agents I should run from day one." })
    // Pre-select agents implied by the outcomes the operator picked.
    const initialAgents = new Set()
    for (const o of outcomes) {
      for (const a of (OUTCOME_TO_AGENTS[o] || [])) initialAgents.add(a)
    }
    setConfig(c => ({ ...c, agents: c?.agents?.length ? c.agents : Array.from(initialAgents) }))
    setState('agents')
  }, [outcomes, pushMessage])

  /* ── Agents → Launching (rich provisioning animation) ── */
  const handleAgentsLaunch = useCallback(() => {
    if (!config?.agents?.length) return
    try { sessionStorage.setItem('tb:build-config', JSON.stringify(config)) } catch { /* ignore */ }
    pushMessage({ from: 'nova', text:
      `Launching ${config?.companyName ?? 'your account'}. Walk-through on the right.` })
    setState('launching')
  }, [config, pushMessage])

  /* ── Launching animation complete → hand off to industry demo ── */
  const handleLaunchComplete = useCallback(() => {
    onComplete?.(config)
  }, [config, onComplete])

  const handleStartOver = useCallback(() => {
    researchTimersRef.current.forEach(clearTimeout)
    researchTimersRef.current = []
    setConfig(null)
    setRevealedFields(new Set(['summary']))
    setOutcomes([])
    setImportMethod(null)
    setPolicies([])
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
    if (state === 'intake')    return 'Use the form below'
    if (state === 'research')  return 'Setting up…'
    if (state === 'outcomes')  return 'Pick goals below'
    if (state === 'import')    return 'Pick one below'
    if (state === 'mapping')   return 'Setting up…'
    if (state === 'launching') return 'Launching…'
    if (state === 'policies' || state === 'agents') return 'Continue on the right →'
    return 'Type a message…'
  })()
  const composerDisabled = true   // input flows through the drawer / right pane at every step

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
    if (state === 'outcomes') {
      return (
        <OutcomesDrawer
          companyName={config?.companyName}
          selected={outcomes}
          onChange={setOutcomes}
          onSubmit={handleOutcomesConfirmed}
        />
      )
    }
    if (state === 'import') {
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
  } else if (state === 'mapping') {
    // Clean slate — DataMappingCard owns the right pane and animates
    // through ~14 source → target mappings before handing off to the
    // policies step.
    content = (
      <div className="ob-right ob-right--building">
        <header className="ob-right-head">
          <h1 className="ob-right-title">Mapping your account</h1>
          <p className="ob-right-sub">
            Wiring data into the right fields.
          </p>
        </header>
        <div className="ob-right-body ob-right-body--centered">
          <DataMappingCard
            config={config}
            importMethod={importMethod}
            onComplete={handleMappingComplete}
          />
        </div>
      </div>
    )
  } else if (state === 'policies') {
    content = (
      <div className="ob-right">
        <header className="ob-right-head">
          <h1 className="ob-right-title">Labor policies</h1>
          <p className="ob-right-sub">
            Based on the states you operate in. Toggle off anything you don't need.
          </p>
        </header>
        <div className="ob-right-body">
          <PoliciesCard
            config={config}
            onContinue={handlePoliciesContinue}
          />
        </div>
      </div>
    )
  } else if (state === 'agents') {
    content = (
      <div className="ob-right">
        <header className="ob-right-head">
          <h1 className="ob-right-title">Your agents</h1>
          <p className="ob-right-sub">
            Pick which agents I should run from day one. Launch when ready.
          </p>
        </header>
        <div className="ob-right-body">
          <AgentsLaunchCard
            companyName={config?.companyName}
            agents={config?.agents || []}
            onAgentsChange={(next) => setConfig(c => ({ ...c, agents: next }))}
            onLaunch={handleAgentsLaunch}
          />
        </div>
      </div>
    )
  } else if (state === 'launching') {
    // Final step — BuildProgressCard takes over the right pane and
    // walks through provisioning each piece of the workspace before
    // handing off to the industry demo.
    content = (
      <div className="ob-right ob-right--building">
        <header className="ob-right-head">
          <h1 className="ob-right-title">Launching your account</h1>
          <p className="ob-right-sub">
            Provisioning {config?.companyName ?? 'your workspace'} — about 15 seconds.
          </p>
        </header>
        <div className="ob-right-body ob-right-body--centered">
          <BuildProgressCard
            config={config}
            importMethod={importMethod}
            policies={policies}
            agents={config?.agents}
            outcomes={outcomes}
            onComplete={handleLaunchComplete}
          />
        </div>
      </div>
    )
  } else {
    // outcomes, import — same shell, ConfigCard on the right.
    const sub = state === 'outcomes'
      ? (config?.url ? `Based on ${config.url}. Tap to edit anything.` : 'Tap to edit anything.')
      : 'One more step to finish setup.'
    content = (
      <div className="ob-right">
        <header className="ob-right-head">
          <h1 className="ob-right-title">Your account</h1>
          <p className="ob-right-sub">{sub}</p>
        </header>
        <div className="ob-right-body">
          <ConfigCard
            config={config}
            editable={state === 'outcomes'}
            onChange={setConfig}
            visibleFields={cardFields}
          />
        </div>
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

/* ─── Outcomes drawer — first chat question after research. Multi-
 *     select list of outcome statements ("what are you looking to do?")
 *     framed around the freshly-researched company. The chosen
 *     outcomes drive agent pre-selection later. */
function OutcomesDrawer({ companyName, selected, onChange, onSubmit }) {
  const set = new Set(selected || [])
  const toggle = (id) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(Array.from(next))
  }
  const count = set.size

  return (
    <div className="ob-drawer" role="group" aria-label="What are you looking to do">
      <div className="ob-drawer-head">
        <span className="ob-drawer-mark" aria-hidden="true">
          <TeambridgeAIIcon size={14} />
        </span>
        <div className="ob-drawer-text">
          <div className="ob-drawer-title">
            I've got a good read on {companyName || 'your company'}.
          </div>
          <div className="ob-drawer-sub">
            What are you looking to do? Pick anything that fits.
          </div>
        </div>
      </div>

      <ul className="ob-drawer-outcomes">
        {OUTCOME_OPTIONS.map(o => {
          const on = set.has(o.id)
          return (
            <li key={o.id}>
              <button
                type="button"
                className={`ob-drawer-outcome ${on ? 'is-on' : ''}`}
                onClick={() => toggle(o.id)}
                aria-pressed={on}
              >
                <span className={`ob-drawer-outcome-toggle ${on ? 'is-on' : ''}`} aria-hidden="true">
                  {on && <CheckCircleIcon size={12} />}
                </span>
                <span>{o.label}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="ob-drawer-foot">
        <span className="ob-drawer-foot-sub">
          {count === 0 ? 'Pick at least one' : `${count} selected`}
        </span>
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

