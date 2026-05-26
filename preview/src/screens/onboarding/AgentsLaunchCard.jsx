import { ArrowNarrowRightIcon } from '../../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { PAIN_OPTIONS, PAIN_TO_AGENT } from './steps.js'
import AgentAvatar from './AgentAvatar.jsx'

/* AgentsLaunchCard — final right-pane step. Lists all 6 Teambridge
 * agents with toggles. Pre-toggles those implied by the outcomes the
 * operator picked earlier. "Launch" CTA hands off to the industry
 * demo via onLaunch. */

export default function AgentsLaunchCard({ agents = [], onAgentsChange, onLaunch, companyName }) {
  const set = new Set(agents)
  const toggle = (id) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onAgentsChange?.(Array.from(next))
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
      </header>

      <ul className="alc-list">
        {PAIN_OPTIONS.map(p => {
          const agent = PAIN_TO_AGENT[p.id]
          if (!agent) return null
          const on = set.has(p.id)
          return (
            <li key={p.id}>
              <button
                type="button"
                className={`alc-row ${on ? 'is-on' : ''}`}
                onClick={() => toggle(p.id)}
                aria-pressed={on}
              >
                <AgentAvatar painId={p.id} size={36} />
                <div className="alc-text">
                  <span className="alc-name">{agent.name}</span>
                  <span className="alc-detail">{agent.detail}</span>
                </div>
                <span className={`alc-toggle ${on ? 'is-on' : ''}`} aria-hidden="true">
                  {on && <CheckCircleIcon size={16} />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

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
