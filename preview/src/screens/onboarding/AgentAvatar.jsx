import { AGENTS } from '../../data/agents.js'
import { PAIN_TO_PERSONA } from './steps.js'

/* AgentAvatar — round avatar tile that loads the animated GIF for the
 * persona assigned to a given pain id. Falls back to the Nova GIF when
 * the pain isn't mapped (defensive — every pain in PAIN_OPTIONS has a
 * persona mapping today). */
export default function AgentAvatar({ painId, size = 28 }) {
  const personaId = PAIN_TO_PERSONA[painId] || 'nova'
  const agent = AGENTS[personaId]
  if (!agent) return null
  return (
    <span
      className={`ob-agent-avatar ob-agent-avatar--${agent.color}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${agent.avatar})`,
      }}
      aria-label={agent.name}
      role="img"
      title={`${agent.name} · ${agent.role}`}
    />
  )
}
