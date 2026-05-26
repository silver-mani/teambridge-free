import { ArrowNarrowRightIcon } from '../../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { PAIN_OPTIONS, PAIN_TO_AGENT, PAIN_TO_PERSONA } from './steps.js'
import { AGENTS } from '../../data/agents.js'
import AgentAvatar from './AgentAvatar.jsx'

/* AgentsLaunchCard — final right-pane step. 2-column grid of agent
 * cards (similar visual weight to policy cards). Each card has the
 * persona's animated GIF avatar, agent name, description, and a
 * "Powered by [persona]" attribution. Big toggle in the corner.
 * Pre-toggled based on the operator's outcomes. */

export default function AgentsLaunchCard({ agents = [], onAgentsChange, onLaunch, companyName }) {
  const set = new Set(agents)
  const toggle = (id) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onAgentsChange?.(Array.from(next))
  }
  const allOn  = set.size === PAIN_OPTIONS.length
  const toggleAll = () => {
    onAgentsChange?.(allOn ? [] : PAIN_OPTIONS.map(p => p.id))
  }
  const count = set.size

  return (
    <div className="cc cc--agents-launch">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">Pick your agents</span>
            <span className="cc-head-sub">
              These run from day one. Toggle any on or off — change them later anytime.
            </span>
          </div>
        </div>
        <button type="button" className="pc-all" onClick={toggleAll}>
          {allOn ? 'Clear all' : 'Select all'}
        </button>
      </header>

      <div className="alc-grid">
        {PAIN_OPTIONS.map(p => {
          const agent = PAIN_TO_AGENT[p.id]
          if (!agent) return null
          const personaId = PAIN_TO_PERSONA[p.id]
          const persona = AGENTS[personaId]
          const on = set.has(p.id)
          return (
            <button
              key={p.id}
              type="button"
              className={`alc-card ${on ? 'is-on' : ''}`}
              onClick={() => toggle(p.id)}
              aria-pressed={on}
            >
              <div className="alc-card-top">
                <AgentAvatar painId={p.id} size={48} />
                <span className={`alc-card-toggle ${on ? 'is-on' : ''}`} aria-hidden="true">
                  {on && <CheckCircleIcon size={16} />}
                </span>
              </div>
              <div className="alc-card-text">
                <span className="alc-card-title">{agent.name}</span>
                <span className="alc-card-detail">{agent.detail}</span>
              </div>
              {persona && (
                <div className="alc-card-foot">
                  Powered by <strong>{persona.name}</strong> · {persona.role}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <footer className="cc-foot">
        <span className="cc-foot-sub">
          {count === 0 ? 'No agents on' : `${count} agent${count === 1 ? '' : 's'} on`}
        </span>
        <button
          type="button"
          className="cc-foot-cta cc-foot-cta--launch"
          onClick={onLaunch}
          disabled={count === 0}
        >
          Launch {companyName || 'your account'}
          <ArrowNarrowRightIcon size={14} />
        </button>
      </footer>
    </div>
  )
}
