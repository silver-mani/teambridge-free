import AgentAvatar from './AgentAvatar.jsx'
import { PAIN_TO_AGENT } from './steps.js'

/* AgentsCard — separate card shown in the right pane once the operator
 * has committed their agent picks via the chat drawer. Read-only: the
 * picker in the chat drawer is the source of truth. */
export default function AgentsCard({ agents = [] }) {
  if (agents.length === 0) return null
  return (
    <div className="cc cc--agents">
      <header className="cc-head">
        <div className="cc-head-left">
          <div className="cc-head-text">
            <span className="cc-head-name">
              {agents.length} agent{agents.length === 1 ? '' : 's'} activating
            </span>
            <span className="cc-head-sub">
              These run from day one. You can switch them on or off later.
            </span>
          </div>
        </div>
      </header>
      <ul className="cc-agent-list cc-agent-list--readonly cc-agent-list--padded">
        {agents.map(id => {
          const agent = PAIN_TO_AGENT[id]
          if (!agent) return null
          return (
            <li key={id} className="cc-agent-row cc-agent-row--readonly">
              <AgentAvatar painId={id} size={28} />
              <span className="cc-agent-text">
                <span className="cc-agent-name">{agent.name}</span>
                <span className="cc-agent-detail">{agent.detail}</span>
              </span>
              <span className="cc-agent-status">
                <span className="cc-agent-pulse" aria-hidden="true" />
                Ready
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
