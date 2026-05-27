import { useMemo, useState } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { ChevronLeftIcon } from '../../../../src/components/icons/ChevronLeftIcon.tsx'
import {
  PAIN_OPTIONS, PAIN_TO_AGENT, PAIN_TO_PERSONA,
  POLICY_OPTIONS, POLICIES_BY_STATE,
} from './steps.js'
import { AGENTS } from '../../data/agents.js'
import AgentAvatar from './AgentAvatar.jsx'
import ConfigCard, { ALL_FIELDS } from './ConfigCard.jsx'

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
  const insights = config?.insights || []
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

      {insights.length > 0 && (
        <section className="cm-insights">
          <div className="cm-insights-head">
            <span className="cm-insights-mark" aria-hidden="true">
              <TeambridgeAIIcon size={12} />
            </span>
            <span className="cm-insights-title">
              {insights.length} thing{insights.length === 1 ? '' : 's'} I noticed about your team
            </span>
          </div>
          <ul className="cm-insights-list">
            {insights.map((text, i) => (
              <li key={i} className="cm-insights-item">
                <span className="cm-insights-bullet" aria-hidden="true">•</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

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
  const [selected, setSelected] = useState(() => new Set(goals.map((_, i) => i)))
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
 * Modules + Policies (count) + Locations + Roles. Read-only summary,
 * one card per section so the operator can scan it in two seconds. */
export function ReviewStep({ config, onBack, onContinue }) {
  const states = useMemo(() => statesFromLocations(config?.locations), [config])
  const policiesCount = useMemo(() => policiesForStates(states).length, [states])
  const roles = config?.roles ?? []
  const locations = config?.locations ?? []
  const modules = MODULES_FOR_INDUSTRY[config?.industry] ?? DEFAULT_MODULES
  return (
    <div className="cc cc--confirm">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">Here's what I'm setting up</span>
            <span className="cc-head-sub">
              For {config?.companyName ?? 'your company'}. You can change anything later.
            </span>
          </div>
        </div>
      </header>

      <div className="cm-step-body cm-review-body">
        <section className="cm-review-section">
          <h3 className="cm-review-section-title">Modules</h3>
          <div className="cm-review-chips">
            {modules.map(m => (
              <span key={m} className="cm-review-chip is-on">{m}</span>
            ))}
          </div>
        </section>

        <section className="cm-review-section">
          <h3 className="cm-review-section-title">Policies</h3>
          <div className="cm-review-chips">
            <span className="cm-review-chip is-on">
              {policiesCount} labor polic{policiesCount === 1 ? 'y' : 'ies'}
            </span>
            {states.map(s => <span key={s} className="cm-review-chip">{s}</span>)}
            <span className="cm-review-chip">Federal</span>
          </div>
        </section>

        <section className="cm-review-section">
          <h3 className="cm-review-section-title">Locations</h3>
          <div className="cm-review-chips">
            {locations.length === 0 && <span className="cm-review-empty">No locations yet.</span>}
            {locations.map((loc, i) => (
              <span key={i} className="cm-review-chip">
                {loc.name}{loc.city ? ` · ${loc.city}` : ''}
              </span>
            ))}
          </div>
        </section>

        <section className="cm-review-section">
          <h3 className="cm-review-section-title">Roles</h3>
          <div className="cm-review-chips">
            {roles.length === 0 && <span className="cm-review-empty">No roles yet.</span>}
            {roles.map((r, i) => <span key={i} className="cm-review-chip">{r}</span>)}
          </div>
        </section>
      </div>

      <StepFoot onBack={onBack} onForward={onContinue} forwardLabel="Looks good" />
    </div>
  )
}

const DEFAULT_MODULES = ['Scheduling', 'People', 'Time Tracking', 'Pay', 'Engage']
const MODULES_FOR_INDUSTRY = {
  events:           ['Scheduling', 'People', 'Time Tracking', 'Pay', 'Engage'],
  healthcare:       ['Scheduling', 'People', 'Time Tracking', 'Pay', 'Credentials', 'Engage'],
  hospitality:      ['Scheduling', 'People', 'Time Tracking', 'Pay', 'Engage'],
  'long-term-care': ['Scheduling', 'People', 'Time Tracking', 'Pay', 'Credentials', 'Engage'],
  security:         ['Scheduling', 'People', 'Time Tracking', 'Pay', 'Credentials', 'Engage'],
  janitorial:       ['Scheduling', 'People', 'Time Tracking', 'Pay', 'Engage'],
  staffing:         ['People', 'Onboarding', 'Credentials', 'Pay', 'Engage'],
  construction:     ['Scheduling', 'People', 'Time Tracking', 'Pay', 'Credentials', 'Engage'],
  'light-industrial': ['Scheduling', 'People', 'Time Tracking', 'Pay', 'Engage'],
}

/* ─── Step 4: Agents — hero-style automation picker ───────────────────
 * Each agent renders as a big hero card: large animated avatar, the
 * agent's specialist title, a one-line description, and 3 skill chips
 * showing exactly what it will take off the operator's plate. Toggle
 * On / Off is a single primary button at the bottom of each card. */
const AGENT_HERO = {
  coverage: {
    title: 'Shift Replacement Specialist',
    description: 'Reaches out to available workers, finds coverage, and fills shifts when someone calls out.',
    skills: ['Shift matching', 'Worker outreach', 'Schedule adjustment'],
  },
  overtime: {
    title: 'Overtime Guardian',
    description: 'Spots workers about to cross your OT cap and proposes compliant swaps before the period closes.',
    skills: ['Hours projection', 'Swap suggestions', 'Manager alerts'],
  },
  onboarding: {
    title: 'Onboarding Concierge',
    description: 'Moves new hires through paperwork, credentials, and day-1 setup without manager nudges.',
    skills: ['Doc chasing', 'Badge issuance', 'Training reminders'],
  },
  compliance: {
    title: 'Credential Watch',
    description: 'Tracks every license, cert, and training across your workforce and pre-clears renewals.',
    skills: ['Cert tracking', 'Renewal nudges', 'Compliance blocks'],
  },
  comms: {
    title: 'Comms Routing Agent',
    description: 'Sends each announcement only to the roles and sites that need it, and escalates stuck threads.',
    skills: ['Smart broadcasts', 'Role routing', 'Escalations'],
  },
  scheduling: {
    title: 'Schedule Builder',
    description: 'Drafts next week from forecasted demand, availability, and fairness rules in one pass.',
    skills: ['Auto-draft', 'Demand forecast', 'Hours fairness'],
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
  // Order by what's pre-recommended for this industry (those at the
  // top), then everything else after.
  const ordered = [
    ...PAIN_OPTIONS.filter(p => agentsSet.has(p.id)),
    ...PAIN_OPTIONS.filter(p => !agentsSet.has(p.id)),
  ]
  return (
    <div className="cc cc--confirm">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">Want to automate any of this?</span>
            <span className="cc-head-sub">
              I've pre-recommended {agentsSet.size} agent{agentsSet.size === 1 ? '' : 's'} for {config?.companyName ?? 'you'}. Turn any on or off.
            </span>
          </div>
        </div>
      </header>

      <div className="cm-step-body">
        <div className="cm-agent-grid">
          {ordered.map(p => {
            const hero = AGENT_HERO[p.id]
            if (!hero) return null
            const personaId = PAIN_TO_PERSONA[p.id]
            const persona = AGENTS[personaId]
            const on = agentsSet.has(p.id)
            return (
              <div key={p.id} className={`cm-agent-card ${on ? 'is-on' : ''}`}>
                <div className={`cm-agent-hero cm-agent-hero--${persona?.color ?? 'blue'}`}>
                  {persona && (
                    <img
                      className="cm-agent-hero-img"
                      src={persona.avatar}
                      alt={persona.name}
                    />
                  )}
                </div>
                <div className="cm-agent-body">
                  <div className="cm-agent-title">{hero.title}</div>
                  <p className="cm-agent-desc">{hero.description}</p>
                  <div className="cm-agent-skills-label">Skills</div>
                  <div className="cm-agent-skills">
                    {hero.skills.map(s => (
                      <span key={s} className="cm-agent-skill">{s}</span>
                    ))}
                  </div>
                  {persona && (
                    <div className="cm-agent-persona">
                      Powered by <strong>{persona.name}</strong> · {persona.role}
                    </div>
                  )}
                  <button
                    type="button"
                    className={`cm-agent-cta ${on ? 'is-on' : ''}`}
                    onClick={() => toggle(p.id)}
                    aria-pressed={on}
                  >
                    {on ? (
                      <>
                        <CheckCircleIcon size={14} /> Turned On
                      </>
                    ) : (
                      'Turn On'
                    )}
                  </button>
                </div>
              </div>
            )
          })}
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
