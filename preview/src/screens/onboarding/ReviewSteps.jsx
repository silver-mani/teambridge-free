import { useMemo, useState, useRef } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { ChevronLeftIcon } from '../../../../src/components/icons/ChevronLeftIcon.tsx'
import { ChevronRightIcon } from '../../../../src/components/icons/ChevronRightIcon.tsx'
import { ChevronDownIcon } from '../../../../src/components/icons/ChevronDownIcon.tsx'
import { Grid01Icon } from '../../../../src/components/icons/Grid01Icon.tsx'
import { Users03Icon } from '../../../../src/components/icons/Users03Icon.tsx'
import { ClockIcon } from '../../../../src/components/icons/ClockIcon.tsx'
import { CurrencyDollarCircleIcon } from '../../../../src/components/icons/CurrencyDollarCircleIcon.tsx'
import { ClipboardCheckIcon } from '../../../../src/components/icons/ClipboardCheckIcon.tsx'
import { MessageDotsSquareIcon } from '../../../../src/components/icons/MessageDotsSquareIcon.tsx'
import { PuzzlePiece01Icon } from '../../../../src/components/icons/PuzzlePiece01Icon.tsx'
import { Map01Icon } from '../../../../src/components/icons/Map01Icon.tsx'
import { BookOpen01Icon } from '../../../../src/components/icons/BookOpen01Icon.tsx'
import {
  PAIN_OPTIONS, PAIN_TO_AGENT, PAIN_TO_PERSONA,
  POLICY_OPTIONS, POLICIES_BY_STATE,
} from './steps.js'
import { AGENTS } from '../../data/agents.js'
import AgentAvatar from './AgentAvatar.jsx'
import ConfigCard, { ALL_FIELDS } from './ConfigCard.jsx'
import { INDUSTRIES } from '../IndustrySelector.jsx'

/* ReviewSteps — four right-pane cards that replaced the single
 * ConfirmCard, broken into focused steps:
 *
 *   InsightsStep  Company summary + 3 Claude-generated insights
 *   AgentsStep    Toggle which agents to activate
 *   PoliciesStep  Toggle which state-filtered labor policies
 *   DataStep      Pick import method + Launch
 *
 * Each step has the same shape: header + body + footer with a
 * Continue button (or Launch on the final step). State is managed
 * by the parent (OnboardingFlow) — each component receives the
 * relevant slice of config and calls onContinue / onLaunch when
 * the operator advances. */

const IMPORT_OPTIONS = [
  { id: 'sample', label: 'Sample data',     detail: 'Pre-loaded roster so you can explore immediately.' },
  { id: 'csv',    label: 'Upload a CSV',    detail: 'Use your existing roster file.' },
  { id: 'api',    label: 'Sync from HRIS',  detail: 'Connect Workday / BambooHR / Rippling.' },
]

function statesFromLocations(locations = []) {
  const set = new Set()
  for (const loc of locations) {
    const m = String(loc.city || '').match(/\b([A-Z]{2})\b\s*$/)
    if (m) set.add(m[1])
  }
  return Array.from(set)
}

function policiesForStates(states) {
  const policySet = new Set(POLICIES_BY_STATE['*'] || [])
  const stateMap = {}
  for (const policyId of POLICIES_BY_STATE['*'] || []) {
    stateMap[policyId] = new Set(['Federal'])
  }
  for (const st of states) {
    const ids = POLICIES_BY_STATE[st] || []
    for (const id of ids) {
      policySet.add(id)
      if (!stateMap[id]) stateMap[id] = new Set()
      stateMap[id].add(st)
    }
  }
  return Array.from(policySet).map(id => {
    const base = POLICY_OPTIONS.find(p => p.id === id)
    if (!base) return null
    return { ...base, states: Array.from(stateMap[id] || []).sort() }
  }).filter(Boolean)
}

function StepFoot({ onBack, onForward, forwardLabel = 'Continue', forwardDisabled = false, sub }) {
  return (
    <footer className="cc-foot">
      {onBack
        ? <button type="button" className="cm-back" onClick={onBack}><ChevronLeftIcon size={14} /> Back</button>
        : <span className="cc-foot-sub">{sub}</span>}
      <button
        type="button"
        className={`cc-foot-cta ${forwardLabel.startsWith('Launch') ? 'cc-foot-cta--launch' : ''}`}
        onClick={onForward}
        disabled={forwardDisabled}
      >
        {forwardLabel}
        <ArrowNarrowRightIcon size={14} />
      </button>
    </footer>
  )
}

/* ─── Step 1: Insights + Company ─────────────────────────────────── */
export function InsightsStep({ config, onChange, onContinue }) {
  // The "things I noticed" insights are posted into the chat panel
  // (left pane) so this card stays focused on the company-shape
  // review the operator can edit. See OnboardingFlow.runResearch.
  const cardFields = ALL_FIELDS.filter(f => f !== 'agents')
  return (
    <div className="cc cc--confirm">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">Here's what I learned</span>
            <span className="cc-head-sub">
              Quick read on {config?.companyName ?? 'your company'} before I commit anything.
            </span>
          </div>
        </div>
      </header>

      <div className="cm-step-body">
        <ConfigCard
          config={config}
          editable={true}
          onChange={onChange}
          visibleFields={cardFields}
        />
      </div>

      <StepFoot onForward={onContinue} forwardLabel="Looks right" sub="Tap any field above to edit." />
    </div>
  )
}

/* ─── Step 2: Goals — Claude-generated WFM goals for THIS company ─ */
export function GoalsStep({ config, onBack, onContinue }) {
  // Each goal is { label, detail }. Label is a short 2-4 word chip;
  // detail is a one-line specific-to-this-company context shown small
  // under the label. All pre-toggled so the operator just untoggles
  // what doesn't fit.
  const goals = (config?.goals || []).map(normalizeGoal)
  // Pre-select the first four — the rest start off so the operator
  // makes a deliberate yes/no choice on the longer tail.
  const [selected, setSelected] = useState(() => new Set(goals.slice(0, 4).map((_, i) => i)))
  const toggle = (i) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }
  const count = selected.size
  return (
    <div className="cc cc--confirm">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">
              What are you looking to do?
            </span>
            <span className="cc-head-sub">
              Tap to toggle. Tailored to {config?.companyName ?? 'your company'}.
            </span>
          </div>
        </div>
      </header>

      <div className="cm-step-body">
        <ul className="cm-goal-list">
          {goals.map((g, i) => {
            const on = selected.has(i)
            return (
              <li key={i}>
                <button
                  type="button"
                  className={`cm-goal-chip ${on ? 'is-on' : ''}`}
                  onClick={() => toggle(i)}
                  aria-pressed={on}
                >
                  <span className="cm-goal-chip-label">{g.label}</span>
                  {g.detail && <span className="cm-goal-chip-detail">{g.detail}</span>}
                </button>
              </li>
            )
          })}
        </ul>
        {goals.length === 0 && (
          <div className="cm-goal-empty">
            We'll set things up based on your industry defaults.
          </div>
        )}
      </div>

      <StepFoot
        onBack={onBack}
        onForward={() => onContinue(Array.from(selected).map(i => goals[i]))}
        forwardDisabled={goals.length > 0 && count === 0}
      />
    </div>
  )
}

/* Normalize a goal coming either as a string (older shape) or as an
 * object { label, detail }. */
function normalizeGoal(g) {
  if (g && typeof g === 'object' && typeof g.label === 'string') {
    return { label: g.label, detail: g.detail || '' }
  }
  if (typeof g === 'string') {
    return { label: g.split(/\s+/).slice(0, 4).join(' '), detail: g }
  }
  return { label: '', detail: '' }
}

/* ─── Step 3: Review — what we're configuring in the account ─────────
 * Three collapsible sections — Modules, Data, Policies. Each lives in
 * a card with a bigger title, a one-line description of the section,
 * and a small active-count badge on the right. Expanding any one lets
 * the operator toggle items on/off (Modules + Policies) or edit
 * chips (Data: locations + roles). */
export function ReviewStep({ config, importMethod, onImportMethodChange, onBack, onContinue }) {
  const states = useMemo(() => statesFromLocations(config?.locations), [config])
  const allPolicies = useMemo(() => policiesForStates(states), [states])
  const moduleIds = MODULES_FOR_INDUSTRY[config?.industry] ?? DEFAULT_MODULE_IDS
  const catalogModules = moduleIds.map(id => MODULE_CATALOG[id]).filter(Boolean)

  // Each section keeps its own local state for what's enabled / edited.
  // Modules + Policies start fully on (all the recommended items are
  // active out of the gate); Data sections are user-editable lists.
  const [activeModules, setActiveModules] = useState(() => new Set(catalogModules.map(m => m.id)))
  const [activePolicies, setActivePolicies] = useState(() => new Set(allPolicies.map(p => p.id)))
  const [locations, setLocations] = useState(config?.locations ?? [])
  const [roles, setRoles] = useState(config?.roles ?? [])
  const [openSection, setOpenSection] = useState(null)
  const importChoice = importMethod || 'sample'
  const toggleSection = (id) => setOpenSection(prev => prev === id ? null : id)
  const toggleInSet = (setter) => (id) => setter(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })
  const removeAt = (setter) => (i) => setter(prev => prev.filter((_, j) => j !== i))

  const companyName = config?.companyName ?? 'your company'
  const industryLabel = INDUSTRIES.find(i => i.id === config?.industry)?.name ?? 'your industry'
  const stateLabel = states.length === 0
    ? 'federal baseline'
    : states.length === 1 ? `${states[0]} + federal`
    : `${states.slice(0, -1).join(', ')} and ${states[states.length - 1]} + federal`

  const modulesContext  = `For a ${industryLabel.toLowerCase()} workforce, these are the surfaces that pull their weight from day one. Untoggle anything you won't use.`
  const dataContext     = `Pulled from researching ${companyName} — ${locations.length} location${locations.length === 1 ? '' : 's'} and ${roles.length} role${roles.length === 1 ? '' : 's'}. Edit any of it, or swap how I bring in your starting roster.`
  const policiesContext = `Filtered to the labor rules that apply across ${stateLabel}. All from the Teambridge compliance library — each runs automatically once active.`

  return (
    <div className="cc cc--confirm">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">Here's what I'm setting up</span>
            <span className="cc-head-sub">
              For {companyName}. Tap a section to inspect or edit.
            </span>
          </div>
        </div>
      </header>

      <div className="cm-review-intro">
        Based on what I learned about <strong>{companyName}</strong>, I'm setting these defaults.
        Don't worry — you can always tweak any of it later. Review the sections below and hit
        <em> Looks good</em> when you're ready and I'll get it done.
      </div>

      <div className="cm-step-body cm-review-body">
        <ReviewAccordion
          title="Modules"
          description="The product surfaces I'll turn on for your account."
          context={modulesContext}
          activeCount={activeModules.size}
          open={openSection === 'modules'}
          onToggle={() => toggleSection('modules')}
        >
          <ul className="cm-review-detail-list">
            {catalogModules.map(m => {
              const Icon = m.Icon
              const on = activeModules.has(m.id)
              return (
                <li key={m.id} className="cm-review-detail-row">
                  <span className={`cm-review-detail-icon cm-review-detail-icon--${m.tone}`} aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <div className="cm-review-detail-text">
                    <span className="cm-review-detail-name">{m.name}</span>
                    <span className="cm-review-detail-desc">{m.detail}</span>
                  </div>
                  <ToggleSwitch on={on} onChange={() => toggleInSet(setActiveModules)(m.id)} label={m.name} />
                </li>
              )
            })}
          </ul>
        </ReviewAccordion>

        <ReviewAccordion
          title="Data"
          description="Locations, roles, and how I'll bring in your starting roster."
          context={dataContext}
          activeCount={locations.length + roles.length}
          open={openSection === 'data'}
          onToggle={() => toggleSection('data')}
        >
          <div className="cm-review-detail-group">
            <div className="cm-review-detail-grouptitle">Locations ({locations.length})</div>
            <ul className="cm-review-detail-list">
              {locations.length === 0 && <li className="cm-review-empty">No locations yet.</li>}
              {locations.map((loc, i) => (
                <li key={i} className="cm-review-detail-row">
                  <span className="cm-review-detail-icon cm-review-detail-icon--blue" aria-hidden="true">
                    <Map01Icon size={16} />
                  </span>
                  <div className="cm-review-detail-text">
                    <span className="cm-review-detail-name">{loc.name}</span>
                    {loc.city && <span className="cm-review-detail-desc">{loc.city}</span>}
                  </div>
                  <button
                    type="button"
                    className="cm-review-detail-remove"
                    onClick={() => removeAt(setLocations)(i)}
                    aria-label={`Remove ${loc.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="cm-review-detail-group">
            <div className="cm-review-detail-grouptitle">Roles ({roles.length})</div>
            <div className="cm-review-chips cm-review-chips--editable">
              {roles.length === 0 && <span className="cm-review-empty">No roles yet.</span>}
              {roles.map((r, i) => (
                <span key={i} className="cm-review-chip is-editable">
                  {r}
                  <button
                    type="button"
                    className="cm-review-chip-x"
                    onClick={() => removeAt(setRoles)(i)}
                    aria-label={`Remove ${r}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="cm-review-detail-group">
            <div className="cm-review-detail-grouptitle">Starting roster</div>
            <ul className="cm-review-detail-list">
              {IMPORT_OPTIONS.map(opt => {
                const on = opt.id === importChoice
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      className={`cm-import-row ${on ? 'is-on' : ''}`}
                      onClick={() => onImportMethodChange?.(opt.id)}
                      aria-pressed={on}
                    >
                      <span className={`cm-tile-toggle ${on ? 'is-on' : ''}`} aria-hidden="true">
                        {on && <CheckCircleIcon size={12} />}
                      </span>
                      <span className="cm-import-text">
                        <span className="cm-import-title">{opt.label}</span>
                        <span className="cm-import-detail">{opt.detail}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </ReviewAccordion>

        <ReviewAccordion
          title="Policies"
          description="Labor rules I'll enforce based on your states."
          context={policiesContext}
          activeCount={activePolicies.size}
          open={openSection === 'policies'}
          onToggle={() => toggleSection('policies')}
        >
          <ul className="cm-review-detail-list">
            {allPolicies.map(p => {
              const on = activePolicies.has(p.id)
              return (
                <li key={p.id} className="cm-review-detail-row">
                  <span className={`cm-review-detail-icon cm-review-detail-icon--${POLICY_TONE[p.category] || 'slate'}`} aria-hidden="true">
                    <BookOpen01Icon size={16} />
                  </span>
                  <div className="cm-review-detail-text">
                    <span className="cm-review-detail-name">{p.label}</span>
                    <span className="cm-review-detail-desc">{p.detail}</span>
                    <div className="cm-review-detail-tags">
                      {p.states.map(s => (
                        <span key={s} className={`cm-review-detail-tag ${s === 'Federal' ? 'is-fed' : ''}`}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <ToggleSwitch on={on} onChange={() => toggleInSet(setActivePolicies)(p.id)} label={p.label} />
                </li>
              )
            })}
          </ul>
        </ReviewAccordion>
      </div>

      <StepFoot onBack={onBack} onForward={onContinue} forwardLabel="Looks good" />
    </div>
  )
}

function ReviewAccordion({ title, description, context, activeCount, open, onToggle, children }) {
  return (
    <section className={`cm-review-accordion ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="cm-review-accordion-head"
        onClick={onToggle}
        aria-expanded={open}
      >
        <div className="cm-review-accordion-headtext">
          <span className="cm-review-accordion-title">{title}</span>
          <span className="cm-review-accordion-description">{description}</span>
        </div>
        <span className="cm-review-accordion-badge">
          {activeCount} active
        </span>
        <span className={`cm-review-accordion-chev ${open ? 'is-open' : ''}`} aria-hidden="true">
          <ChevronDownIcon size={14} />
        </span>
      </button>
      {open && (
        <div className="cm-review-accordion-body">
          {context && <p className="cm-review-accordion-context">{context}</p>}
          {children}
        </div>
      )}
    </section>
  )
}

function ToggleSwitch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`cm-toggle-switch ${on ? 'is-on' : ''}`}
      onClick={onChange}
    >
      <span className="cm-toggle-switch-knob" aria-hidden="true" />
    </button>
  )
}

/* Module catalog — icon + name + one-line detail per module. The
 * per-industry list below picks which modules show up for any given
 * account; everything else is filtered out of the review. */
const MODULE_CATALOG = {
  scheduling:  { id: 'scheduling',  name: 'Scheduling',     tone: 'blue',   Icon: Grid01Icon,                  detail: 'Build, publish, and balance schedules across every site.' },
  people:      { id: 'people',      name: 'People',         tone: 'purple', Icon: Users03Icon,                 detail: 'Roster, profiles, history, and hours-fairness in one view.' },
  time:        { id: 'time',        name: 'Time Tracking',  tone: 'matcha', Icon: ClockIcon,                   detail: 'Live clock-in, geo-fenced punches, and missed-punch recovery.' },
  pay:         { id: 'pay',         name: 'Pay',            tone: 'orange', Icon: CurrencyDollarCircleIcon,    detail: 'Pay runs with OT cap, premium pay, retro, and audit trail.' },
  credentials: { id: 'credentials', name: 'Credentials',    tone: 'matcha', Icon: ClipboardCheckIcon,          detail: 'Track licenses, certs, and training with renewal nudges.' },
  engage:      { id: 'engage',      name: 'Engage',         tone: 'blue',   Icon: MessageDotsSquareIcon,       detail: 'Worker chat, smart broadcasts, and manager escalations.' },
  onboarding:  { id: 'onboarding',  name: 'Onboarding',     tone: 'pink',   Icon: PuzzlePiece01Icon,           detail: 'Doc collection, badge issuance, and day-1 training flow.' },
}
const DEFAULT_MODULE_IDS = ['scheduling', 'people', 'time', 'pay', 'engage']
const MODULES_FOR_INDUSTRY = {
  events:             ['scheduling', 'people', 'time', 'pay', 'engage'],
  healthcare:         ['scheduling', 'people', 'time', 'pay', 'credentials', 'engage'],
  hospitality:        ['scheduling', 'people', 'time', 'pay', 'engage'],
  'long-term-care':   ['scheduling', 'people', 'time', 'pay', 'credentials', 'engage'],
  security:           ['scheduling', 'people', 'time', 'pay', 'credentials', 'engage'],
  janitorial:         ['scheduling', 'people', 'time', 'pay', 'engage'],
  staffing:           ['people', 'onboarding', 'credentials', 'pay', 'engage'],
  construction:       ['scheduling', 'people', 'time', 'pay', 'credentials', 'engage'],
  'light-industrial': ['scheduling', 'people', 'time', 'pay', 'engage'],
}
const POLICY_TONE = {
  overtime:   'orange',
  breaks:     'matcha',
  pay:        'blue',
  scheduling: 'purple',
  workforce:  'pink',
}

/* ─── Step 4: Agents — horizontal carousel of specialist agents ─────
 * Each agent renders as a tall tile: large square image on a saturated
 * solid background, then bold specialist title and a short
 * description below. Cards stack horizontally and the operator pages
 * through with the left/right chevron buttons. Click anywhere on a
 * tile to toggle that agent on/off. */
const AGENT_HERO = {
  scheduling: {
    title: 'Shift Filling Specialist',
    description: 'Proactively fills open shifts by matching qualified, available workers and confirming coverage automatically.',
  },
  coverage: {
    title: 'Shift Replacement Specialist',
    description: 'Reaches out to available workers, finds coverage, and fills shifts when someone calls out.',
  },
  overtime: {
    title: 'Timecard Exception Specialist',
    description: 'Flags missing or incorrect punches and follows up with the worker to get it fixed.',
  },
  compliance: {
    title: 'Compliance Specialist',
    description: 'Monitors breaks, hours, and credentials — pings the team the moment something goes out of bounds.',
  },
  onboarding: {
    title: 'Onboarding Specialist',
    description: 'Moves new hires through paperwork, credentials, and day-1 setup without manager nudges.',
  },
  comms: {
    title: 'Communications Specialist',
    description: 'Sends each announcement only to the roles and sites that need it, and escalates stuck threads.',
  },
}

export function AgentsStep({ config, onChange, onBack, onContinue }) {
  const agentsSet = new Set(config?.agents || [])
  const toggle = (id) => {
    const next = new Set(agentsSet)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange({ ...config, agents: Array.from(next) })
  }
  // Fixed declared order — never reorder on toggle, otherwise tiles
  // jump around as the operator turns agents on/off.
  const ordered = PAIN_OPTIONS.filter(p => AGENT_HERO[p.id])

  // Carousel paging — scroll the strip left/right by one card width.
  const scrollRef = useRef(null)
  const scrollByCard = (dir) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector('.cm-agent-card')
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.7
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="cc cc--confirm">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">Want to automate any of this?</span>
            <span className="cc-head-sub">
              I've pre-recommended {agentsSet.size} agent{agentsSet.size === 1 ? '' : 's'} for {config?.companyName ?? 'you'}. Tap to turn any on or off.
            </span>
          </div>
        </div>
      </header>

      <div className="cm-step-body cm-agents-body">
        <div className="cm-agents-carousel">
          <button
            type="button"
            className="cm-agents-nav cm-agents-nav--prev"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous agents"
          >
            <ChevronLeftIcon size={16} />
          </button>
          <div ref={scrollRef} className="cm-agent-strip">
            {ordered.map(p => {
              const hero = AGENT_HERO[p.id]
              const personaId = PAIN_TO_PERSONA[p.id]
              const persona = AGENTS[personaId]
              const on = agentsSet.has(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`cm-agent-card ${on ? 'is-on' : ''}`}
                  onClick={() => toggle(p.id)}
                  aria-pressed={on}
                >
                  <div className="cm-agent-hero">
                    {persona && (
                      <img
                        className="cm-agent-hero-img"
                        src={persona.avatar}
                        alt={persona.name}
                      />
                    )}
                    {on && (
                      <span className="cm-agent-on-dot" aria-hidden="true">
                        <CheckCircleIcon size={14} />
                      </span>
                    )}
                  </div>
                  <div className="cm-agent-body">
                    <div className="cm-agent-title">{hero.title}</div>
                    <p className="cm-agent-desc">{hero.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className="cm-agents-nav cm-agents-nav--next"
            onClick={() => scrollByCard(1)}
            aria-label="Next agents"
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>

      <StepFoot onBack={onBack} onForward={onContinue} />
    </div>
  )
}

/* ─── Step 3: Policies ───────────────────────────────────────────── */
export function PoliciesStep({ config, onBack, onContinue }) {
  const states = useMemo(() => statesFromLocations(config?.locations), [config])
  const available = useMemo(() => policiesForStates(states), [states])
  const [selected, setSelected] = useState(() => new Set(available.map(p => p.id)))
  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const statesLabel = states.length
    ? states.length === 1 ? states[0] : `${states.slice(0, -1).join(', ')} and ${states[states.length - 1]}`
    : 'your states'

  return (
    <div className="cc cc--confirm">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">
              {selected.size} labor polic{selected.size === 1 ? 'y' : 'ies'} for {statesLabel}
            </span>
            <span className="cc-head-sub">
              State-filtered from teambridge.com/compliance. Toggle off what doesn't apply.
            </span>
          </div>
        </div>
      </header>

      <div className="cm-step-body">
        <div className="cm-grid">
          {available.map(p => {
            const on = selected.has(p.id)
            return (
              <button
                key={p.id}
                type="button"
                className={`cm-tile ${on ? 'is-on' : ''}`}
                onClick={() => toggle(p.id)}
                aria-pressed={on}
              >
                <div className="cm-tile-top">
                  <span className={`cm-tile-pill ${on ? 'is-on' : ''}`}>{on ? 'On' : 'Off'}</span>
                  <span className={`cm-tile-toggle ${on ? 'is-on' : ''}`} aria-hidden="true">
                    {on && <CheckCircleIcon size={12} />}
                  </span>
                </div>
                <span className="cm-tile-title cm-tile-title--no-avatar">{p.label}</span>
                <span className="cm-tile-detail">{p.detail}</span>
                <div className="cm-tile-states">
                  {p.states.map(s => (
                    <span key={s} className={`cm-tile-state ${s === 'Federal' ? 'is-fed' : ''}`}>{s}</span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <StepFoot onBack={onBack} onForward={() => onContinue(Array.from(selected))} />
    </div>
  )
}

/* ─── Step 4: Data + Launch ──────────────────────────────────────── */
export function DataStep({ config, onBack, onLaunch }) {
  const [importMethod, setImportMethod] = useState('sample')
  return (
    <div className="cc cc--confirm">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">How should I bring your team in?</span>
            <span className="cc-head-sub">
              Pick one. Sample data is fastest for exploring the demo.
            </span>
          </div>
        </div>
      </header>

      <div className="cm-step-body">
        <div className="cm-import-list">
          {IMPORT_OPTIONS.map(o => (
            <button
              key={o.id}
              type="button"
              className={`cm-import-row ${importMethod === o.id ? 'is-on' : ''}`}
              onClick={() => setImportMethod(o.id)}
            >
              <span className={`cm-tile-toggle ${importMethod === o.id ? 'is-on' : ''}`} aria-hidden="true">
                {importMethod === o.id && <CheckCircleIcon size={12} />}
              </span>
              <div className="cm-import-text">
                <span className="cm-import-title">{o.label}</span>
                <span className="cm-import-detail">{o.detail}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <StepFoot
        onBack={onBack}
        onForward={() => onLaunch({ importMethod })}
        forwardLabel="Launch my account"
      />
    </div>
  )
}
