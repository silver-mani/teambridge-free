import { useMemo, useState } from 'react'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { POLICY_OPTIONS, POLICIES_BY_STATE } from './steps.js'

/* PoliciesCard — surfaces labor policies that apply to the states
 * the company operates in. The operator multi-selects which to turn
 * on (or hits "Select all"); each policy shows the states it covers
 * as small chips. Federal baseline policies are always shown. */

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
  const stateMap = {}  // policyId → Set of states

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
  return Array.from(policySet).map(id => ({
    ...POLICY_OPTIONS.find(p => p.id === id),
    states: Array.from(stateMap[id] || []).sort(),
  })).filter(p => p.label)
}

export default function PoliciesCard({ config, onContinue }) {
  const states = useMemo(() => statesFromLocations(config?.locations), [config])
  const policies = useMemo(() => policiesForStates(states), [states])
  // Pre-select all by default — the operator can untoggle, but most
  // teams want compliance coverage on day one.
  const [selected, setSelected] = useState(() => new Set(policies.map(p => p.id)))

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const allOn  = selected.size === policies.length && policies.length > 0
  const allOff = selected.size === 0
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

      <ul className="pc-list">
        {policies.map(p => {
          const on = selected.has(p.id)
          return (
            <li key={p.id}>
              <button
                type="button"
                className={`pc-row ${on ? 'is-on' : ''}`}
                onClick={() => toggle(p.id)}
                aria-pressed={on}
              >
                <span className={`pc-toggle ${on ? 'is-on' : ''}`} aria-hidden="true">
                  {on && <CheckCircleIcon size={14} />}
                </span>
                <div className="pc-text">
                  <span className="pc-name">{p.label}</span>
                  <span className="pc-detail">{p.detail}</span>
                </div>
                <div className="pc-states" aria-hidden="true">
                  {p.states.map(s => (
                    <span key={s} className={`pc-state ${s === 'Federal' ? 'pc-state--fed' : ''}`}>{s}</span>
                  ))}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <footer className="cc-foot">
        <span className="cc-foot-sub">
          {allOff ? 'No policies on' : `${selected.size} policy ${selected.size === 1 ? '' : 'set'} on`}
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
