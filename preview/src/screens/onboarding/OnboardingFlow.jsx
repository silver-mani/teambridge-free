import { useState, useEffect, useRef, useCallback } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
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
  const [state, setState] = useState('intake')            // 'intake' | 'research' | 'review'
  const [intakeMode, setIntakeMode] = useState('url')     // 'url' | 'free-text'
  const [intakeDraft, setIntakeDraft] = useState('')
  const [config, setConfig] = useState(null)
  const [revealedFields, setRevealedFields] = useState(new Set(['summary']))

  // Review drawer — agents picker is bound directly to config.agents

  // Activity drawer
  const [activityOpen, setActivityOpen] = useState(false)

  // Chat
  const [messages, setMessages] = useState(() => [
    { id: 'm0', from: 'nova', text:
      "Hi! I'm Nova, your Teambridge AI. Drop in your company's website below and I'll set up your account from what I learn about you — industry, headcount, locations, and the agents you'll need from day one." },
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
        `Here's what I set up for ${derived.companyName}. Take a look on the right — tap any field to edit, then drop your work email below and I'll build it out.` })
      setState('review')
    }, cumulative + 700)
    researchTimersRef.current.push(finalTimer)
  }

  useEffect(() => {
    return () => {
      researchTimersRef.current.forEach(clearTimeout)
      researchTimersRef.current = []
    }
  }, [])

  /* ── Review actions ── */
  const handleConfirm = useCallback(() => {
    if (!config?.agents || config.agents.length === 0) return
    try { sessionStorage.setItem('tb:build-config', JSON.stringify(config)) } catch { /* ignore */ }

    // Hand off to main.jsx which routes to `#/<industry>` for the
    // existing demo experience. The LeadCaptureGate on the industry
    // route will collect name/company/email there — we kept the
    // build flow focused on the product (agents/config) by design.
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
    if (state === 'intake')   return "Tap below to share your company's URL…"
    if (state === 'research') return 'Nova is working…'
    if (state === 'review')   return 'Add a note, or tap fields on the right to edit'
    return 'Type a message…'
  })()
  const composerDisabled = state === 'intake' || state === 'research'

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
    if (state === 'review') {
      return (
        <ConfirmDrawer
          companyName={config?.companyName}
          agents={config?.agents || []}
          onAgentsChange={(next) => setConfig(c => ({ ...c, agents: next }))}
          onSubmit={handleConfirm}
          onStartOver={handleStartOver}
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

  let content
  if (state === 'intake') {
    content = (
      <div className="ob-right ob-right--intake">
        <header className="ob-right-head">
          <h1 className="ob-right-title">Your Teambridge</h1>
          <p className="ob-right-sub">
            Your dashboard will appear here as Nova learns about you.
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
          <p className="ob-right-sub">Watch your account come together as Nova works.</p>
        </header>
        <div className="ob-right-body">
          <ConfigCard
            config={config}
            editable={false}
            visibleFields={ALL_FIELDS.filter(f => revealedFields.has(f))}
          />
        </div>
      </div>
    )
  } else {
    // review
    content = (
      <div className="ob-right">
        <header className="ob-right-head">
          <h1 className="ob-right-title">Your account</h1>
          <p className="ob-right-sub">
            {config?.url ? `Derived from ${config.url}. Tap any field to edit.` : 'Tap any field to edit.'}
          </p>
        </header>
        <div className="ob-right-body">
          <ConfigCard
            config={config}
            editable={true}
            onChange={setConfig}
            visibleFields={ALL_FIELDS}
          />
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
            <TeambridgeAIIcon size={14} />
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

/* ─── Confirm drawer — review-state bottom drawer for agent activation
 *     + build CTA. No more email collection here; the LeadCaptureGate on
 *     the industry demo handles that after handoff. */
function ConfirmDrawer({ companyName, agents, onAgentsChange, onSubmit, onStartOver }) {
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
                <span className="ob-drawer-agent-mark" aria-hidden="true">
                  <TeambridgeAIIcon size={11} />
                </span>
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
          Build my Teambridge{count > 0 ? ` (${count} agent${count === 1 ? '' : 's'})` : ''}
          <ArrowNarrowRightIcon size={14} />
        </button>
      </div>
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
            Once your workspace is live, Nova posts every action she takes here —
            shift coverage, OT swaps, agent runs, the lot.
          </span>
        </div>
      </div>
    </aside>
  )
}
