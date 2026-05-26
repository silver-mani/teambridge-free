import { useMemo, useState } from 'react'
import { INDUSTRIES } from '../IndustrySelector.jsx'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { ChevronRightIcon } from '../../../../src/components/icons/ChevronRightIcon.tsx'
import {
  PAIN_OPTIONS, PAIN_TO_AGENT, PAIN_TO_PERSONA,
  POLICY_OPTIONS, POLICIES_BY_STATE,
} from './steps.js'
import { AGENTS } from '../../data/agents.js'
import AgentAvatar from './AgentAvatar.jsx'
import ConfigCard, { ALL_FIELDS } from './ConfigCard.jsx'

/* ConfirmCard — single confirmation screen that replaces the 4-step
 * outcomes/import/policies/agents drawer sequence. Everything Nova
 * derived is shown as default-on; the operator can expand any section
 * to edit, but the default path is one click to launch.
 *
 * Sections:
 *   - "Things I noticed" (3 specific insights from Claude)
 *   - Company (uses ConfigCard for editable fields)
 *   - Agents (default-on, expandable toggle grid)
 *   - Labor policies (default-on, expandable toggle grid, state-filtered)
 *   - Starting data (sample / CSV / HRIS)
 *
 * Single CTA: "Launch my account". */

const IMPORT_OPTIONS = [
  { id: 'sample', label: 'Sample data',       detail: 'Pre-loaded roster so you can explore immediately.' },
  { id: 'csv',    label: 'Upload a CSV',      detail: 'Use your existing roster file.' },
  { id: 'api',    label: 'Sync from HRIS',    detail: 'Connect Workday / BambooHR / Rippling.' },
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

function Section({ title, summary, expanded, onToggle, children }) {
  return (
    <div className={`cm-section ${expanded ? 'is-expanded' : ''}`}>
      <button type="button" className="cm-section-head" onClick={onToggle} aria-expanded={expanded}>
        <div className="cm-section-text">
          <span className="cm-section-title">{title}</span>
          {!expanded && <span className="cm-section-summary">{summary}</span>}
        </div>
        <span className={`cm-section-chev ${expanded ? 'is-open' : ''}`} aria-hidden="true">
          <ChevronRightIcon size={14} />
        </span>
      </button>
      {expanded && <div className="cm-section-body">{children}</div>}
    </div>
  )
}

export default function ConfirmCard({ config, onChange, onLaunch }) {
  const industry = INDUSTRIES.find(i => i.id === config?.industry)
  const insights = config?.insights || []

  // Policies derived from operator's states. Default: all on.
  const states = useMemo(() => statesFromLocations(config?.locations), [config])
  const availablePolicies = useMemo(() => policiesForStates(states), [states])
  const [policiesSet, setPoliciesSet] = useState(() => new Set(availablePolicies.map(p => p.id)))
  // Agents default to whatever Claude pre-selected.
  const agentsSet = new Set(config?.agents || [])
  const [importMethod, setImportMethod] = useState('sample')

  const [expanded, setExpanded] = useState(null)  // 'company' | 'agents' | 'policies' | 'data' | null
  const toggleSection = (id) => setExpanded(prev => prev === id ? null : id)

  const toggleAgent = (id) => {
    const next = new Set(agentsSet)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange?.({ ...config, agents: Array.from(next) })
  }
  const togglePolicy = (id) => {
    setPoliciesSet(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const agentNames = (config?.agents || [])
    .map(id => PAIN_TO_AGENT[id]?.name)
    .filter(Boolean)
  const policyNames = Array.from(policiesSet)
    .map(id => POLICY_OPTIONS.find(p => p.id === id)?.label)
    .filter(Boolean)

  const handleLaunch = () => {
    onLaunch?.({
      agents: config?.agents || [],
      policies: Array.from(policiesSet),
      importMethod,
    })
  }

  return (
    <div className="cc cc--confirm">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">
              Here's what I set up for {config?.companyName ?? 'your account'}
            </span>
            <span className="cc-head-sub">
              Change anything you want, or just hit Launch when ready.
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

      <div className="cm-sections">
        <Section
          title="Company"
          summary={
            `${config?.companyName ?? '—'} · ${industry?.name ?? '—'} · ` +
            `${(config?.headcount ?? 0).toLocaleString()} people · ${config?.locations?.length ?? 0} site${config?.locations?.length === 1 ? '' : 's'}`
          }
          expanded={expanded === 'company'}
          onToggle={() => toggleSection('company')}
        >
          <ConfigCard
            config={config}
            editable={true}
            onChange={onChange}
            visibleFields={ALL_FIELDS.filter(f => f !== 'agents')}
            showHeader={false}
          />
        </Section>

        <Section
          title={`${config?.agents?.length || 0} agent${(config?.agents?.length || 0) === 1 ? '' : 's'} activating`}
          summary={
            agentNames.length
              ? agentNames.slice(0, 3).join(' · ') + (agentNames.length > 3 ? ` and ${agentNames.length - 3} more` : '')
              : 'None — expand to pick'
          }
          expanded={expanded === 'agents'}
          onToggle={() => toggleSection('agents')}
        >
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
                  onClick={() => toggleAgent(p.id)}
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
        </Section>

        <Section
          title={`${policiesSet.size} labor polic${policiesSet.size === 1 ? 'y' : 'ies'} on`}
          summary={
            policyNames.length
              ? policyNames.slice(0, 3).join(' · ') + (policyNames.length > 3 ? ` and ${policyNames.length - 3} more` : '')
              : 'None — expand to enable'
          }
          expanded={expanded === 'policies'}
          onToggle={() => toggleSection('policies')}
        >
          <div className="cm-grid">
            {availablePolicies.map(p => {
              const on = policiesSet.has(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`cm-tile ${on ? 'is-on' : ''}`}
                  onClick={() => togglePolicy(p.id)}
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
        </Section>

        <Section
          title="Starting data"
          summary={IMPORT_OPTIONS.find(o => o.id === importMethod)?.label || 'Sample data'}
          expanded={expanded === 'data'}
          onToggle={() => toggleSection('data')}
        >
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
        </Section>
      </div>

      <footer className="cc-foot">
        <span className="cc-foot-sub">
          Default settings work for most teams in your shape.
        </span>
        <button
          type="button"
          className="cc-foot-cta cc-foot-cta--launch"
          onClick={handleLaunch}
        >
          Looks right — launch my account
          <ArrowNarrowRightIcon size={14} />
        </button>
      </footer>
    </div>
  )
}
