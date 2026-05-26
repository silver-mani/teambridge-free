import { useState, useEffect, useRef, useCallback } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ChevronLeftIcon } from '../../../../src/components/icons/ChevronLeftIcon.tsx'
import { Bell01Icon } from '../../../../src/components/icons/Bell01Icon.tsx'
import { ArrowNarrowRightIcon } from '../../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { INDUSTRIES } from '../IndustrySelector.jsx'
import DashboardShell, { DEFAULT_NAV_GROUPS, DEFAULT_NAV_BOTTOM } from '../shell/DashboardShell.jsx'
import OnboardingChat from './OnboardingChat.jsx'
import ConfigCard, { ALL_FIELDS } from './ConfigCard.jsx'
import BuildContent from './BuildContent.jsx'
import BuildActivityFeed from './BuildActivityFeed.jsx'
import { deriveConfig, headcountRangeFor } from './urlMatcher.js'
import '../act1.css'
import './onboarding.css'

/* ──────────────────────────────────────────────────────────────────────
 * OnboardingFlow — `#/build` route.
 *
 * One consistent layout throughout: DashboardShell with LeftNav (left)
 * · Nova chat (middle) · Right pane content · Activity feed dock
 * (right, collapsed during onboarding).
 *
 * State machine — only changes WHAT renders in the chat history and
 * right pane, not where things live:
 *
 *   intake    Nova asks for the URL via the chat compose bar; right
 *             pane shows an Intake hero.
 *   research  Nova posts a self-updating research bubble (checklist
 *             that fills in over ~5s); right pane's ConfigCard reveals
 *             one field at a time as Nova "discovers" it.
 *   review    Nova asks the operator to confirm; right pane's
 *             ConfigCard becomes fully editable with a Confirm CTA.
 *   live      Nova's chat is open-ended; right pane shows BuildContent
 *             surfaces (Overview/Schedule/People/...); LeftNav unlocks;
 *             activity feed populates.
 * ────────────────────────────────────────────────────────────────────── */

const RESEARCH_STEPS = (config) => [
  { id: 's1', text: `Reading ${config.url || 'your description'}…`,
    done: `Read ${config.url || 'your description'}.`,
    field: null, delay: 600 },
  { id: 's2', text: 'Identifying your industry…',
    done: `Industry: ${(INDUSTRIES.find(i => i.id === config.industry)?.name) || config.industry}.`,
    field: 'industry', delay: 800 },
  { id: 's3', text: 'Estimating your team size…',
    done: `Team: ~${config.headcount?.toLocaleString()} people.`,
    field: 'headcount', delay: 700 },
  { id: 's4', text: 'Mapping your locations…',
    done: `Found ${config.locations?.length ?? 0} site${(config.locations?.length ?? 0) === 1 ? '' : 's'}.`,
    field: 'locations', delay: 900 },
  { id: 's5', text: 'Drafting your role list…',
    done: `${config.roles?.length ?? 0} role types identified.`,
    field: 'roles', delay: 700 },
  { id: 's6', text: 'Recommending your first agents…',
    done: `${config.agents?.length ?? 0} agents ready to activate.`,
    field: 'agents', delay: 800 },
]

/* Convert a confirmed config into the answers shape that BuildContent
 * + BuildActivityFeed already understand. */
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

/* Lock every nav item during onboarding — the operator can't
 * meaningfully click into them until the dashboard is live. */
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

function buildLiveNav() {
  const clone = group => ({ ...group, items: group.items.map(it => ({ ...it })) })
  return {
    navGroups: DEFAULT_NAV_GROUPS.map(clone),
    navBottom: clone(DEFAULT_NAV_BOTTOM),
  }
}

const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'aol.com', 'msn.com', 'live.com', 'me.com', 'mac.com', 'proton.me', 'protonmail.com',
])
function isWorkEmail(email) {
  const trimmed = String(email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return false
  const domain = trimmed.split('@')[1]
  return !PERSONAL_EMAIL_DOMAINS.has(domain)
}

export default function OnboardingFlow({ onExit, onComplete }) {
  // State machine
  const [state, setState] = useState('intake')            // 'intake' | 'research' | 'review' | 'live'
  const [intakeMode, setIntakeMode] = useState('url')     // 'url' | 'free-text'
  const [config, setConfig] = useState(null)
  const [revealedFields, setRevealedFields] = useState(new Set(['summary']))
  const [researchSteps, setResearchSteps] = useState([])  // for the live-updating Nova bubble
  const [composerDisabled, setComposerDisabled] = useState(false)

  // Review-state confirm drawer
  const [confirmEmail, setConfirmEmail] = useState('')
  const [confirmTouched, setConfirmTouched] = useState(false)

  // Chat message history. Nova's research bubble is identified by id
  // so we can update it in place as the checklist progresses.
  const [messages, setMessages] = useState(() => [
    { id: 'm0', from: 'nova', text:
      "Hi! I'm Nova, your Teambridge AI. Drop in your company website below and I'll set up your account from what I learn about you — industry, headcount, locations, agents." },
  ])

  const researchTimersRef = useRef([])

  // Dashboard view + activity drawer
  const [view, setView] = useState('overview')
  const [viewPinned, setViewPinned] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)

  const pushMessage = useCallback((m) => {
    setMessages(prev => [...prev, { id: `m${prev.length}`, ...m }])
  }, [])

  /* ── Intake ── */
  const handleUserMessage = useCallback((text) => {
    // Push the user's message immediately.
    pushMessage({ from: 'user', text })

    if (state === 'intake') {
      const derived = deriveConfig(text, { fromFreeText: intakeMode === 'free-text' })
      if (!derived) {
        // No match — switch to free-text and ask for a description.
        setIntakeMode('free-text')
        pushMessage({ from: 'nova', text:
          "I couldn't quite place that site. Mind giving me a two-line description of what your team does? I'll take it from there." })
        return
      }

      setConfig(derived)
      // Disable composer during the research animation.
      setComposerDisabled(true)
      kickoffResearch(derived)
      setState('research')
      return
    }

    if (state === 'review' || state === 'live') {
      // For now we just acknowledge — production wires this into a real
      // Nova model. Free-form chat doesn't change the config.
      pushMessage({ from: 'nova', text:
        state === 'review'
          ? "Thanks for the note — for this demo, tap the field on the right to edit, or hit Confirm when you're happy."
          : "Got it. (Free-form Nova chat is wired up in the real product — for the demo, take a look around the dashboard!)" })
      return
    }
  }, [state, intakeMode, pushMessage]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Kick off the time-paced research animation. Posts a single Nova
   * "research" bubble whose `steps` array updates in place as each
   * delay fires. Right pane's ConfigCard reveals matching fields. */
  function kickoffResearch(derived) {
    const steps = RESEARCH_STEPS(derived)

    // Initial bubble — first step active, rest pending.
    const initialSteps = steps.map((s, i) => ({
      text: s.text,
      status: i === 0 ? 'active' : 'pending',
    }))
    setResearchSteps(initialSteps)
    setRevealedFields(new Set(['summary']))

    // Insert a placeholder research bubble.
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
        setResearchSteps(prevSteps => {
          const next = prevSteps.map((ps, idx) => {
            if (idx < i)  return { ...ps, status: 'done' }
            if (idx === i) return { ...ps, status: 'done', text: step.done }
            if (idx === i + 1) return { ...ps, status: 'active' }
            return ps
          })
          // Sync the research bubble in messages with the new steps.
          setMessages(msgs => msgs.map(m => m.id === researchId ? { ...m, steps: next } : m))
          return next
        })
      }, cumulative)
    })

    // After all steps + a beat, post the "review" message and enable
    // the composer with a review-mode placeholder.
    const finalTimer = setTimeout(() => {
      pushMessage({ from: 'nova', text:
        `Here's what I set up for ${derived.companyName}. Take a look on the right — tap any field to edit, then hit Confirm when it looks right.` })
      setComposerDisabled(false)
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
    if (!isWorkEmail(confirmEmail)) {
      setConfirmTouched(true)
      return
    }
    // Mirror to the existing capture-lead API (Convex + HubSpot) so this
    // signup lands in the CRM same as the old lead gate.
    try {
      fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '',
          company: config?.companyName,
          email: confirmEmail.trim().toLowerCase(),
          pageUrl: window.location.href,
          referrer: document.referrer || undefined,
        }),
        keepalive: true,
      })
        .then(async (r) => {
          let body = null
          try { body = await r.json() } catch { /* tolerated */ }
          if (!r.ok) { console.error('[capture-lead] non-2xx', r.status, body); return }
          if (body && Array.isArray(body.errors) && body.errors.length) {
            console.error('[capture-lead] upstream errors', body.errors); return
          }
          console.info('[capture-lead] ok', body ?? {})
        })
        .catch((err) => { console.error('[capture-lead] request failed', err) })
    } catch (err) { console.error('[capture-lead] threw before fetch', err) }

    try {
      sessionStorage.setItem('tb:lead', '1')
      sessionStorage.setItem('tb:lead-data', JSON.stringify({
        company: config?.companyName, email: confirmEmail.trim().toLowerCase(),
      }))
      sessionStorage.setItem('tb:build-config', JSON.stringify(config))
    } catch { /* ignore */ }

    setState('live')
    pushMessage({ from: 'nova', text:
      `All set. Your Teambridge for ${config?.companyName} is live — take a look around. I'll keep working in the background, and I'm here whenever you need me.` })
  }, [config, confirmEmail, pushMessage])

  const handleStartOver = useCallback(() => {
    researchTimersRef.current.forEach(clearTimeout)
    researchTimersRef.current = []
    setConfig(null)
    setRevealedFields(new Set(['summary']))
    setResearchSteps([])
    setIntakeMode('url')
    setComposerDisabled(false)
    setState('intake')
    setMessages([
      { id: 'm0', from: 'nova', text:
        "Let's try again — drop in a different website (or description) below." },
    ])
  }, [])

  /* ── Live actions ── */
  const handleSelectView = (v) => {
    setView(v); setViewPinned(true)
  }
  const handleOpenDashboard = useCallback(() => {
    onComplete?.(config)
  }, [config, onComplete])

  /* ── Render pieces ── */
  const industry = state === 'intake' ? null : (config ? INDUSTRIES.find(i => i.id === config.industry) : null)
  const { navGroups, navBottom } = state === 'live' ? buildLiveNav() : buildLockedNav()
  const liveView = viewPinned ? view : (FOCUS_TO_VIEW[view] || view || 'overview')

  const composerPlaceholder = (() => {
    if (state === 'intake' && intakeMode === 'url')       return 'yourcompany.com'
    if (state === 'intake' && intakeMode === 'free-text') return 'e.g. We run 3 senior-living communities across LA.'
    if (state === 'research') return 'Nova is working…'
    if (state === 'review')   return 'Add a note, or tap fields on the right to edit'
    return 'Ask Nova anything…'
  })()

  const drawer = state === 'review' ? (
    <ConfirmDrawer
      companyName={config?.companyName}
      email={confirmEmail}
      onEmailChange={setConfirmEmail}
      touched={confirmTouched}
      onSubmit={handleConfirm}
      onStartOver={handleStartOver}
    />
  ) : null

  const chat = (
    <OnboardingChat
      messages={messages}
      composerPlaceholder={composerPlaceholder}
      composerDisabled={composerDisabled}
      drawer={drawer}
      onSend={handleUserMessage}
    />
  )

  let content
  if (state === 'intake') {
    content = <IntakeHero />
  } else if (state === 'research') {
    content = (
      <RightPaneFrame title="Workspace forming" subtitle="Watch your account come together as Nova works.">
        <ConfigCard
          config={config}
          editable={false}
          visibleFields={ALL_FIELDS.filter(f => revealedFields.has(f))}
        />
      </RightPaneFrame>
    )
  } else if (state === 'review') {
    content = (
      <RightPaneFrame
        title="Your account"
        subtitle={config?.url ? `Derived from ${config.url}. Tap any field to edit.` : 'Tap any field to edit.'}
      >
        <ConfigCard
          config={config}
          editable={true}
          onChange={setConfig}
          visibleFields={ALL_FIELDS}
        />
      </RightPaneFrame>
    )
  } else {
    // live
    const answers = configToAnswers(config)
    content = (
      <div className="ob-live-content">
        <BuildContent view={liveView} answers={answers} mode="full" />
      </div>
    )
  }

  // Live activity feed gets the BuildActivityFeed contents; onboarding
  // states get an empty placeholder so the dock has something to slide
  // into when the operator clicks the bell.
  const activityFeed = state === 'live'
    ? <BuildActivityFeed answers={configToAnswers(config)} />
    : <OnboardingActivityPlaceholder />

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

      <DashboardShell
        mode="full"
        view={state === 'live' ? liveView : 'overview'}
        industryLabel={industry?.name ?? 'Workspace'}
        navGroups={navGroups}
        navBottom={navBottom}
        onBrand={onExit}
        onSelectView={handleSelectView}
        chat={chat}
        content={content}
        showActivityFeed={false}  /* feed lives in the drawer overlay only */
      />

      {/* Activity feed drawer — slides in from the right when opened. */}
      <div
        className={`activity-drawer-scrim ${activityOpen ? 'is-open' : ''}`}
        aria-hidden="true"
        onClick={() => setActivityOpen(false)}
      />
      <aside
        className={`activity-drawer-overlay ${activityOpen ? 'is-open' : ''}`}
        aria-hidden={!activityOpen}
      >
        {activityFeed}
      </aside>
    </div>
  )
}

/* ─── Right-pane chrome shared across phases ─────────────────────── */

function RightPaneFrame({ title, subtitle, children }) {
  return (
    <div className="ob-right">
      <header className="ob-right-head">
        <h1 className="ob-right-title">{title}</h1>
        {subtitle && <p className="ob-right-sub">{subtitle}</p>}
      </header>
      <div className="ob-right-body">{children}</div>
    </div>
  )
}

function IntakeHero() {
  return (
    <div className="ob-right ob-right--intake">
      <div className="ob-intake-hero">
        <span className="ob-intake-hero-mark" aria-hidden="true">
          <TeambridgeAIIcon size={32} />
        </span>
        <h1 className="ob-intake-hero-title">
          Your Teambridge will appear here.
        </h1>
        <p className="ob-intake-hero-sub">
          Drop your company website into the chat on the left. Nova will derive your industry,
          headcount, locations, and agents — and have your dashboard built before you finish your coffee.
        </p>
        <div className="ob-intake-examples">
          <span className="ob-intake-examples-label">Try one:</span>
          {['hollywoodparkca.com', 'dignityhealth.org', 'marriott.com'].map(url => (
            <code key={url} className="ob-intake-example-chip">{url}</code>
          ))}
        </div>
      </div>
    </div>
  )
}

/* Bottom drawer in the chat — surfaced during the review state.
 * Nova asks one last thing (work email) before building, with a
 * primary "Build my Teambridge" action. No buttons live in the right
 * pane — all progression happens here. */
function ConfirmDrawer({ companyName, email, onEmailChange, touched, onSubmit, onStartOver }) {
  const valid = isWorkEmail(email)
  const showError = touched && !valid && email.trim().length > 0
  return (
    <div className="ob-drawer" role="group" aria-label="Confirm and build">
      <div className="ob-drawer-head">
        <span className="ob-drawer-mark" aria-hidden="true">
          <CheckCircleIcon size={14} />
        </span>
        <div className="ob-drawer-text">
          <div className="ob-drawer-title">
            One last thing before I build {companyName || 'your Teambridge'}.
          </div>
          <div className="ob-drawer-sub">
            What's your work email? I'll send your setup details there.
          </div>
        </div>
      </div>

      <label className="ob-drawer-field">
        <input
          type="email"
          className={`ob-drawer-input ${showError ? 'is-invalid' : ''}`}
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          placeholder="alex@yourcompany.com"
          autoComplete="email"
        />
      </label>
      {showError && (
        <span className="ob-drawer-error">
          Use your work email — I can't verify personal addresses.
        </span>
      )}

      <div className="ob-drawer-foot">
        <button type="button" className="ob-drawer-back" onClick={onStartOver}>
          Start over
        </button>
        <button
          type="button"
          className="ob-drawer-cta"
          onClick={onSubmit}
          disabled={!valid}
        >
          Build my Teambridge
          <ArrowNarrowRightIcon size={14} />
        </button>
      </div>
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
