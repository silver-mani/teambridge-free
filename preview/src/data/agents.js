/* ─────────────────────────────────────────────────────────────────────────────
   Teambridge AI agent personas.
   Each activity/needs card is handled by one of these named agents, giving the
   operator a clear "who is responsible" signal instead of a generic AI badge.
   ───────────────────────────────────────────────────────────────────────────── */

const BASE = import.meta.env.BASE_URL

export const AGENTS = {
  nova: {
    id: 'nova',
    name: 'Nova',
    role: 'Schedule Coordinator',
    initial: 'N',
    color: 'purple',
    avatar: `${BASE}agents/nova.gif`,
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    role: 'Workforce Forecaster',
    initial: 'A',
    color: 'blue',
    avatar: `${BASE}agents/atlas.gif`,
  },
  iris: {
    id: 'iris',
    name: 'Iris',
    role: 'Credentialing Agent',
    initial: 'I',
    color: 'matcha',
    avatar: `${BASE}agents/iris.gif`,
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    role: 'Compliance Agent',
    initial: 'L',
    color: 'orange',
    avatar: `${BASE}agents/leo.gif`,
  },
  sofia: {
    id: 'sofia',
    name: 'Sofia',
    role: 'People Ops Agent',
    initial: 'S',
    color: 'pink',
    avatar: `${BASE}agents/sofia.gif`,
  },
}

export function getAgent(id) {
  return AGENTS[id] ?? AGENTS.nova
}
