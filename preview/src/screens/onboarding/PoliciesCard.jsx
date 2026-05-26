import { useMemo, useState } from 'react'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { POLICY_OPTIONS, POLICIES_BY_STATE } from './steps.js'

/* PoliciesCard — surfaces labor policies that apply to the operator's
 * states. Renders as a 2-column grid of substantive cards (similar to
 * teambridge.com/compliance/california): each card has a colored
 * category icon, title, description, state badges, and a prominent
 * toggle. Pre-selected by default — operator untoggles what they
 * don't need. */

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

export default function PoliciesCard({ config, onContinue }) {
  const states = useMemo(() => statesFromLocations(config?.locations), [config])
  const policies = useMemo(() => policiesForStates(states), [states])
  const [selected, setSelected] = useState(() => new Set(policies.map(p => p.id)))

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const allOn = selected.size === policies.length && policies.length > 0
  const toggleAll = () => {
    setSelected(allOn ? new Set() : new Set(policies.map(p => p.id)))
  }

  const statesLabel = states.length
    ? states.length === 1 ? states[0] : `${states.slice(0, -1).join(', ')} and ${states[states.length - 1]}`
    : 'your states'

  return (
    <div className="cc cc--policies">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">Labor policies</span>
            <span className="cc-head-sub">
              These apply to teams in <strong>{statesLabel}</strong>. Toggle off anything you don't need.
            </span>
          </div>
        </div>
        <button type="button" className="pc-all" onClick={toggleAll}>
          {allOn ? 'Clear all' : 'Select all'}
        </button>
      </header>

      <div className="pc-grid">
        {policies.map(p => {
          const on = selected.has(p.id)
          return (
            <button
              key={p.id}
              type="button"
              className={`pc-card ${on ? 'is-on' : ''}`}
              onClick={() => toggle(p.id)}
              aria-pressed={on}
            >
              <div className="pc-card-top">
                <span className={`pc-card-pill ${on ? 'is-on' : ''}`}>
                  {on ? 'Active' : 'Off'}
                </span>
                <span className={`pc-card-toggle ${on ? 'is-on' : ''}`} aria-hidden="true">
                  {on && <CheckCircleIcon size={14} />}
                </span>
              </div>
              <span className="pc-card-title">{p.label}</span>
              <span className="pc-card-detail">{p.detail}</span>
              <div className="pc-card-states" aria-hidden="true">
                {p.states.map(s => (
                  <span key={s} className={`pc-card-state ${s === 'Federal' ? 'pc-card-state--fed' : ''}`}>{s}</span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <footer className="cc-foot">
        <span className="cc-foot-sub">
          {selected.size === 0 ? 'No policies on' : `${selected.size} polic${selected.size === 1 ? 'y' : 'ies'} on`}
        </span>
        <button
          type="button"
          className="cc-foot-cta"
          onClick={() => onContinue?.(Array.from(selected))}
        >
          Continue
          <ArrowNarrowRightIcon size={14} />
        </button>
      </footer>
    </div>
  )
}
