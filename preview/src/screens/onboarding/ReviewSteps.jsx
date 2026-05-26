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

/* ─── Step 2: Agents ─────────────────────────────────────────────── */
export function AgentsStep({ config, onChange, onBack, onContinue }) {
  const agentsSet = new Set(config?.agents || [])
  const toggle = (id) => {
    const next = new Set(agentsSet)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange({ ...config, agents: Array.from(next) })
  }
  return (
    <div className="cc cc--confirm">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">
              {agentsSet.size} agent{agentsSet.size === 1 ? '' : 's'} I'm activating
            </span>
            <span className="cc-head-sub">
              Pre-selected based on your industry and goals. Toggle any on or off.
            </span>
          </div>
        </div>
      </header>

      <div className="cm-step-body">
        <div className="cm-grid">
          {PAIN_OPTIONS.map(p => {
            const agent = PAIN_TO_AGENT[p.id]
            if (!agent) return null
            const personaId = PAIN_TO_PERSONA[p.id]
            const persona = AGENTS[personaId]
            const on = agentsSet.has(p.id)
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
                <div className="cm-tile-avatar"><AgentAvatar painId={p.id} size={40} /></div>
                <span className="cm-tile-title">{agent.name}</span>
                <span className="cm-tile-detail">{agent.detail}</span>
                {persona && (
                  <span className="cm-tile-foot">Powered by <strong>{persona.name}</strong></span>
                )}
              </button>
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
