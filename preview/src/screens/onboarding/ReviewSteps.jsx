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
    <>
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
      </div>

      <StepFoot onForward={onContinue} forwardLabel="Looks right" sub="Tap any field above to edit." />
    </>
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
    <>
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
      </div>

      <StepFoot
        onBack={onBack}
        onForward={() => onContinue(Array.from(selected).map(i => goals[i]))}
        forwardDisabled={goals.length > 0 && count === 0}
      />
    </>
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
  const recommendedModuleIds = MODULES_FOR_INDUSTRY[config?.industry] ?? DEFAULT_MODULE_IDS
  // Render the entire module catalog — modules not recommended for
  // this industry show up with their toggle off, so the operator can
  // see everything available and turn anything on without leaving
  // the screen.
  const catalogModules = MODULE_DISPLAY_ORDER.map(id => MODULE_CATALOG[id]).filter(Boolean)

  // Each section keeps its own local state for what's enabled / edited.
  // Modules: only the recommended set starts active.
  // Policies: all derived rules start active.
  // Data sections are user-editable lists.
  const [activeModules, setActiveModules] = useState(() => new Set(recommendedModuleIds))
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

  // Smart per-section reasoning — visible in the collapsed accordion
  // so the operator sees Nova's thinking without expanding anything.
  // Each is structured as { headline, body } and rendered as a
  // dedicated "Why this" rationale block, consistent with the step's
  // top intro and the Agents-step rationale below.
  const recommendedNames = recommendedModuleIds.map(id => MODULE_CATALOG[id]?.name).filter(Boolean)
  const modulesReasoning = (() => {
    const hasCreds = recommendedNames.includes('Credentials')
    const hasOnb   = recommendedNames.includes('Onboarding')
    if (hasCreds && hasOnb) {
      return {
        headline: `${industryLabel} runs on credentialed, high-throughput hiring.`,
        body: `That's why I added Credentialing + Onboarding on top of the core surfaces (Scheduling, People, Time Tracking, Pay, Engage). Your roles need license and cert tracking from day one, and Onboarding helps you absorb the candidate volume your job postings imply.`,
      }
    }
    if (hasCreds) {
      return {
        headline: `${industryLabel} roles need license + cert tracking.`,
        body: `Credentialing is on by default alongside the core surfaces (Scheduling, People, Time Tracking, Pay, Engage) so cert expiries don't slip past anyone on your roster.`,
      }
    }
    if (hasOnb) {
      return {
        headline: `${industryLabel} throughput is candidate placements.`,
        body: `Onboarding leads the surfaces I turned on, with People, Credentials, Pay, and Engage filling out the rest — same shape staffing agencies use to get placements to first-shift in under a week.`,
      }
    }
    return {
      headline: `${industryLabel} operations live in the daily-driver surfaces.`,
      body: `Scheduling, People, Time Tracking, Pay, and Engage cover the everyday workflow. I held off on Credentialing and Onboarding because your roles don't typically need either — you can flip them on anytime.`,
    }
  })()

  const dataReasoning = (() => {
    const sitesNoun = locations.length === 1 ? 'site' : 'sites'
    const rolesNoun = roles.length === 1 ? 'role' : 'roles'
    const someRoles = roles.slice(0, 3).join(', ')
    const roleTail = roles.length > 3 ? ` and ${roles.length - 3} more` : ''
    if (states.length >= 2) {
      const shown = states.slice(0, 3).join(', ')
      const extra = states.length > 3 ? ` +${states.length - 3} more` : ''
      return {
        headline: `${locations.length} ${sitesNoun} across ${shown}${extra} and ${roles.length} hourly ${rolesNoun}.`,
        body: `Pulled from ${companyName}'s site, careers page, and active job postings. Roles like ${someRoles}${roleTail} surfaced repeatedly. Sample roster will mirror this footprint so you can explore before committing your real data.`,
      }
    }
    if (states.length === 1) {
      return {
        headline: `${locations.length} ${sitesNoun} in ${states[0]} and ${roles.length} hourly ${rolesNoun}.`,
        body: `Pulled from ${companyName}'s site and active job postings. Roles like ${someRoles}${roleTail} kept showing up. Sample roster will mirror this so you can drive the demo with realistic numbers.`,
      }
    }
    return {
      headline: `${locations.length} ${sitesNoun} and ${roles.length} hourly ${rolesNoun}.`,
      body: `Inferred from ${companyName}'s public footprint. Tweak anything that's off, or swap how I bring in your starting roster (sample data, CSV upload, or HRIS sync).`,
    }
  })()

  const policiesReasoning = (() => {
    const headlines = states.map(s => POLICY_STATE_HEADLINE[s]).filter(Boolean)
    if (states.length === 0) {
      return {
        headline: `Federal baseline only — FLSA weekly overtime + minor-work limits.`,
        body: `${allPolicies.length} rule${allPolicies.length === 1 ? '' : 's'} active. Add a state-located site under Data and I'll layer the matching state rules on automatically.`,
      }
    }
    if (headlines.length === 0) {
      return {
        headline: `${allPolicies.length} rules across ${stateLabel}.`,
        body: `Filtered from the Teambridge compliance library by the states your sites operate in. Each rule runs automatically once active.`,
      }
    }
    const tail = headlines.length > 2 ? ` +${headlines.length - 2} more state-level rules` : ''
    return {
      headline: `${allPolicies.length} rules across ${stateLabel}.`,
      body: `${headlines.slice(0, 2).join('. ')}${tail}. All from the Teambridge compliance library — each runs automatically once active so you stay clean on every audit.`,
    }
  })()

  return (
    <>
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

      <div className="cm-step-body cm-review-body">
        <ReviewAccordion
          title="Modules"
          reasoning={modulesReasoning}
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
          reasoning={dataReasoning}
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
          reasoning={policiesReasoning}
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

    </div>

      <StepFoot onBack={onBack} onForward={onContinue} forwardLabel="Looks good" />
    </>
  )
}

function ReviewAccordion({ title, reasoning, activeCount, open, onToggle, children }) {
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
        </div>
        <span className="cm-review-accordion-badge">
          {activeCount} active
        </span>
        <span className={`cm-review-accordion-chev ${open ? 'is-open' : ''}`} aria-hidden="true">
          <ChevronDownIcon size={14} />
        </span>
      </button>
      {reasoning && <RationaleBlock headline={reasoning.headline} body={reasoning.body} />}
      {open && <div className="cm-review-accordion-body">{children}</div>}
    </section>
  )
}

/* Shared rationale block — used both inside each Account Setup
 * accordion and on the Agents step. Same visual everywhere so
 * "Nova's thinking" reads consistently. */
function RationaleBlock({ headline, body }) {
  return (
    <div className="cm-rationale">
      <span className="cm-rationale-label">
        <TeambridgeAIIcon size={12} /> Why this
      </span>
      <div className="cm-rationale-text">
        {headline && <span className="cm-rationale-headline">{headline}</span>}
        {body && <span className="cm-rationale-body">{body}</span>}
      </div>
    </div>
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
  'instant-pay': { id: 'instant-pay', name: 'Instant Pay',  tone: 'orange', Icon: CurrencyDollarCircleIcon,    detail: 'Earned-wage access — workers tap to draw the hours they\'ve already worked.' },
  credentials: { id: 'credentials', name: 'Credentials',    tone: 'matcha', Icon: ClipboardCheckIcon,          detail: 'Track licenses, certs, and training with renewal nudges.' },
  onboarding:  { id: 'onboarding',  name: 'Onboarding',     tone: 'pink',   Icon: PuzzlePiece01Icon,           detail: 'Doc collection, badge issuance, and day-1 training flow.' },
  engage:      { id: 'engage',      name: 'Engage',         tone: 'blue',   Icon: MessageDotsSquareIcon,       detail: 'Worker chat, smart broadcasts, and manager escalations.' },
}
/* Display order shown in the Modules section. We render the full
 * catalog so the operator sees everything available — modules not
 * recommended for their industry just start in the off state. */
const MODULE_DISPLAY_ORDER = ['scheduling', 'people', 'time', 'pay', 'instant-pay', 'credentials', 'onboarding', 'engage']
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

/* Per-state headline that gets surfaced in the collapsed Policies
 * section so the operator immediately sees which signature rules
 * we're activating — not just a count. */
const POLICY_STATE_HEADLINE = {
  CA: "California's predictive-scheduling rule + daily OT after 8h",
  NY: 'New York spread-of-hours premium + day-of-rest',
  OR: 'Oregon predictive scheduling + meal/rest enforcement',
  WA: 'Washington predictive scheduling + paid sick leave',
  IL: 'Illinois one-day-of-rest-in-seven + predictive scheduling',
  MA: 'Massachusetts day-of-rest + sick leave',
  NJ: 'New Jersey predictive scheduling + sick leave',
  CO: 'Colorado daily OT + meal/rest',
  NV: 'Nevada daily OT after 8h',
  CT: 'Connecticut predictive scheduling + sick leave',
  AZ: 'Arizona paid sick leave',
  MD: 'Maryland paid sick leave',
  PA: 'Pennsylvania paid sick leave',
  VA: 'Virginia paid sick leave',
  TX: 'Texas weekly OT (FLSA baseline)',
  GA: 'Georgia weekly OT (FLSA baseline)',
  FL: 'Florida weekly OT (FLSA baseline)',
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

  // Smart reasoning for the agent picks — names the top 2 turned-on
  // agents and ties them to a fact about this specific company
  // (industry shape, multi-state, headcount). The operator should
  // read this and feel that Nova actually thought about it.
  const companyName = config?.companyName ?? 'your team'
  const industryLabel = INDUSTRIES.find(i => i.id === config?.industry)?.name ?? 'your operation'
  const stateCount = (() => {
    const set = new Set()
    for (const loc of config?.locations ?? []) {
      const m = String(loc.city || '').match(/\b([A-Z]{2})\b\s*$/)
      if (m) set.add(m[1])
    }
    return set.size
  })()
  const headcountStr = (config?.headcount ?? 0).toLocaleString()
  const turnedOn = PAIN_OPTIONS.filter(p => agentsSet.has(p.id)).map(p => AGENT_HERO[p.id]?.title).filter(Boolean)
  const agentsReasoning = (() => {
    if (turnedOn.length === 0) {
      return {
        headline: `Nothing pre-recommended yet.`,
        body: `Pick the agents that match your day-to-day — each one's preview shows what it'll automate before you turn it on.`,
      }
    }
    const lead = turnedOn.slice(0, 2).join(' + ')
    const tailCount = turnedOn.length - 2
    const tail = tailCount > 0 ? ` and ${tailCount} more` : ''
    if (stateCount >= 2 && config?.headcount) {
      return {
        headline: `${lead}${tail} are the highest-leverage starts for ${headcountStr} hourly workers across ${stateCount} states.`,
        body: `Multi-state ${industryLabel.toLowerCase()} ops bleed time on coverage and compliance gaps — these two agents close both. Layer in the others as your team gets comfortable.`,
      }
    }
    if (stateCount >= 2) {
      return {
        headline: `Multi-state ${industryLabel.toLowerCase()} ops live and die by ${lead.toLowerCase()}${tail}.`,
        body: `Operating across ${stateCount} states means coverage gaps and compliance drift compound fast — these agents catch both before they become escalations.`,
      }
    }
    if (config?.headcount) {
      return {
        headline: `At ~${headcountStr} hourly workers, ${lead}${tail} pay back the fastest.`,
        body: `At your scale, the daily-driver agents save the most operator time. Start with these and add the others once your team's used to working with the AI in the loop.`,
      }
    }
    return {
      headline: `For ${industryLabel.toLowerCase()}, ${lead}${tail} are the highest-leverage starts.`,
      body: `These are the agents that show up first in real ${industryLabel.toLowerCase()} accounts. Turn the rest on as your team gets comfortable.`,
    }
  })()

  return (
    <>
    <div className="cc cc--confirm">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">Want to automate any of this?</span>
            <span className="cc-head-sub">
              I've pre-recommended {agentsSet.size} agent{agentsSet.size === 1 ? '' : 's'} for {companyName}. Tap to turn any on or off.
            </span>
          </div>
        </div>
      </header>

      {/* Header stays as-is above. Everything else is grouped under
        * a single wrapper (.ag-content) which contains two sibling
        * blocks: the rationale ("why this") and the agents grid. */}
      <div className="ag-content">
        <div className="ag-why">
          <RationaleBlock headline={agentsReasoning.headline} body={agentsReasoning.body} />
        </div>

        <div className="ag-agents">
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
      </div>

    </div>

      <StepFoot onBack={onBack} onForward={onContinue} />
    </>
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
    <>
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

    </div>

      <StepFoot onBack={onBack} onForward={() => onContinue(Array.from(selected))} />
    </>
  )
}

/* ─── Step 4: Data + Launch ──────────────────────────────────────── */
export function DataStep({ config, onBack, onLaunch }) {
  const [importMethod, setImportMethod] = useState('sample')
  return (
    <>
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

    </div>

      <StepFoot
        onBack={onBack}
        onForward={() => onLaunch({ importMethod })}
        forwardLabel="Launch my account"
      />
    </>
  )
}
