import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { INDUSTRIES } from '../IndustrySelector.jsx'
import { TEAM_SIZE_OPTIONS, PAIN_TO_AGENT, CONNECTOR_OPTIONS, ROSTER_OPTIONS } from './steps.js'

/* ──────────────────────────────────────────────────────────────────────
 * BuildActivityFeed — slots into the shell's activity-feed dock.
 * Renders a chronological list of "Nova just did X" cards derived from
 * the running answers object. Each new answer prepends a card so the
 * operator literally watches Nova's work scroll up.
 *
 * Once we migrate Act1 onto the shared shell this becomes the same
 * activity feed Nova posts to in production — the only difference is
 * the cards in production come from real agent activity, not setup.
 * ────────────────────────────────────────────────────────────────────── */

function buildEntries(answers) {
  const entries = []
  const industry = INDUSTRIES.find(i => i.id === answers.industry)

  if (industry) {
    entries.push({
      id: 'industry',
      title: `Loaded ${industry.name.toLowerCase()} template`,
      detail: 'Seeded your roster shape, schedule layout, and recommended policies.',
      tone: 'matcha',
    })
  }
  const teamSize = TEAM_SIZE_OPTIONS.find(o => o.id === answers.teamSize)
  if (teamSize) {
    entries.push({
      id: 'teamSize',
      title: `Sized your roster to ${teamSize.headcount.toLocaleString()}`,
      detail: `${teamSize.label} — ${teamSize.detail.toLowerCase()}.`,
      tone: 'matcha',
    })
  }
  if (answers.locationModel) {
    const map = {
      'single':         'Wired up 1 site on the schedule.',
      'multi-local':    'Wired up 3 sites in the same region.',
      'multi-regional': 'Wired up multi-region site coverage.',
    }
    entries.push({
      id: 'locations',
      title: 'Schedule grid stood up',
      detail: map[answers.locationModel],
      tone: 'matcha',
    })
  }
  ;(answers.pains || []).forEach(p => {
    const agent = PAIN_TO_AGENT[p]
    if (!agent) return
    entries.push({
      id: `pain-${p}`,
      title: `${agent.name} agent activated`,
      detail: agent.detail,
      tone: 'purple',
    })
  })
  ;(answers.connectors || []).forEach(id => {
    const c = CONNECTOR_OPTIONS.find(o => o.id === id)
    if (!c) return
    entries.push({
      id: `conn-${id}`,
      title: `${c.label} connected`,
      detail: `Syncing ${c.category.toLowerCase()} data into your workspace.`,
      tone: 'azure',
    })
  })
  if (answers.rosterChoice) {
    const r = ROSTER_OPTIONS.find(o => o.id === answers.rosterChoice)
    if (r) {
      entries.push({
        id: 'roster',
        title: `Roster: ${r.label.toLowerCase()}`,
        detail: r.detail,
        tone: 'matcha',
      })
    }
  }
  return entries
}

export default function BuildActivityFeed({ answers }) {
  const entries = buildEntries(answers)
  // Newest on top — feels more like a live feed.
  const ordered = [...entries].reverse()

  return (
    <aside className="activity-feed bc-activity" aria-label="Nova activity">
      <div className="activity-feed-inner">
        <div className="activity-feed-header">
          <h2 className="activity-feed-title">Activity</h2>
          <span className="bc-activity-sub">
            <span className="bc-pulse" aria-hidden="true" />
            Nova is working
          </span>
        </div>

        {ordered.length === 0 ? (
          <div className="bc-activity-empty">
            <span className="bc-activity-empty-mark" aria-hidden="true">
              <TeambridgeAIIcon size={14} />
            </span>
            <span>
              I'll post here every time I build something. Answer the question
              on the left to see me get to work.
            </span>
          </div>
        ) : (
          <ul className="bc-activity-list">
            {ordered.map(e => (
              <li key={e.id} className={`bc-activity-card bc-activity-card--${e.tone}`}>
                <span className="bc-activity-card-mark" aria-hidden="true">
                  <CheckCircleIcon size={14} />
                </span>
                <div className="bc-activity-card-text">
                  <span className="bc-activity-card-title">{e.title}</span>
                  <span className="bc-activity-card-detail">{e.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
