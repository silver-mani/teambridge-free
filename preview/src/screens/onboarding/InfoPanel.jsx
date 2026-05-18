import { INDUSTRIES } from '../IndustrySelector.jsx'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckIcon } from '../../../../src/components/icons/CheckIcon.tsx'
import { TEAM_SIZE_OPTIONS, LOCATION_OPTIONS, PAIN_OPTIONS, CONNECTOR_OPTIONS, STEPS } from './steps.js'

/* ──────────────────────────────────────────────────────────────────────
 * InfoPanel — the narrow right rail used during the chat-centric phase
 * of the build flow. Three blocks: Progress (step dots), Workspace
 * (what Nova has built so far), Coming next (one-line preview of the
 * next question). Modeled on Claude SMB's setup panel — supports the
 * chat without competing with it.
 *
 * Once the build flow crosses its pivot point (post-connectors), this
 * panel hides and the right rail becomes the activity feed inside the
 * full DashboardShell.
 * ────────────────────────────────────────────────────────────────────── */

function chatCentricSteps() {
  return STEPS.filter(s => s.phase === 'chat-centric')
}

function ProgressDots({ stepIndex }) {
  const steps = chatCentricSteps()
  return (
    <div className="ip-progress" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
      {steps.map((s, i) => {
        const done = i < stepIndex
        const cur  = i === stepIndex
        return (
          <span
            key={s.id}
            className={`ip-dot ${done ? 'is-done' : ''} ${cur ? 'is-current' : ''}`}
            aria-hidden="true"
          >
            {done ? <CheckIcon size={9} /> : null}
          </span>
        )
      })}
    </div>
  )
}

function workspaceRows(answers) {
  const rows = []
  if (answers.company) {
    rows.push({ id: 'company', label: 'Company', value: answers.company })
  }
  const industry = INDUSTRIES.find(i => i.id === answers.industry)
  if (industry) {
    rows.push({ id: 'industry', label: 'Industry', value: industry.name })
  }
  const ts = TEAM_SIZE_OPTIONS.find(o => o.id === answers.teamSize)
  if (ts) {
    rows.push({ id: 'team', label: 'Headcount', value: `${ts.headcount.toLocaleString()} (${ts.label})` })
  }
  const loc = LOCATION_OPTIONS.find(o => o.id === answers.locationModel)
  if (loc) {
    rows.push({ id: 'locations', label: 'Locations', value: loc.label })
  }
  const pains = (answers.pains || [])
    .map(p => PAIN_OPTIONS.find(o => o.id === p)?.label)
    .filter(Boolean)
  if (pains.length) {
    rows.push({ id: 'pains', label: 'Top pains', value: `${pains.length} chosen` })
  }
  const conns = (answers.connectors || [])
    .map(id => CONNECTOR_OPTIONS.find(c => c.id === id)?.label)
    .filter(Boolean)
  if (conns.length) {
    rows.push({ id: 'connectors', label: 'Connected', value: `${conns.length} tool${conns.length === 1 ? '' : 's'}` })
  }
  return rows
}

function nextPreview(stepIndex) {
  const steps = chatCentricSteps()
  const next = steps[stepIndex + 1]
  if (!next) return 'Open your dashboard'
  switch (next.id) {
    case 'name':       return 'Your name'
    case 'company':    return 'Your company'
    case 'industry':   return 'Your industry'
    case 'team-shape': return 'Team shape (size · sites · pains)'
    case 'connectors': return 'Tools to connect'
    default:           return next.title || next.id
  }
}

export default function InfoPanel({ stepIndex, answers }) {
  const rows = workspaceRows(answers)

  return (
    <aside className="ip" aria-label="Setup progress">
      <section className="ip-section">
        <header className="ip-section-head">
          <h3 className="ip-section-title">Progress</h3>
        </header>
        <ProgressDots stepIndex={stepIndex} />
        <p className="ip-section-sub">
          Nova builds your workspace as you answer.
        </p>
      </section>

      <section className="ip-section">
        <header className="ip-section-head">
          <h3 className="ip-section-title">Workspace</h3>
        </header>
        {rows.length === 0 ? (
          <p className="ip-empty">Nothing set up yet — answer Nova's first question to start.</p>
        ) : (
          <ul className="ip-rows">
            {rows.map(r => (
              <li key={r.id} className="ip-row">
                <span className="ip-row-mark" aria-hidden="true">
                  <CheckIcon size={11} />
                </span>
                <div className="ip-row-text">
                  <span className="ip-row-label">{r.label}</span>
                  <span className="ip-row-value">{r.value}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="ip-section">
        <header className="ip-section-head">
          <h3 className="ip-section-title">Coming next</h3>
        </header>
        <div className="ip-next">
          <span className="ip-next-mark" aria-hidden="true">
            <TeambridgeAIIcon size={11} />
          </span>
          <span className="ip-next-text">{nextPreview(stepIndex)}</span>
        </div>
      </section>
    </aside>
  )
}
