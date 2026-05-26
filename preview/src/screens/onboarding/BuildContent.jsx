import { Fragment, useMemo } from 'react'
import { INDUSTRIES } from '../IndustrySelector.jsx'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { Users03Icon } from '../../../../src/components/icons/Users03Icon.tsx'
import { ClockIcon } from '../../../../src/components/icons/ClockIcon.tsx'
import { Grid01Icon } from '../../../../src/components/icons/Grid01Icon.tsx'
import { PuzzlePiece01Icon } from '../../../../src/components/icons/PuzzlePiece01Icon.tsx'
import { Target04Icon } from '../../../../src/components/icons/Target04Icon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { getIndustryData } from '../../data/industryData.js'
import {
  TEAM_SIZE_OPTIONS,
  PAIN_OPTIONS,
  PAIN_TO_AGENT,
  CONNECTOR_OPTIONS,
} from './steps.js'

/* ──────────────────────────────────────────────────────────────────────
 * BuildContent — renders the active content surface for the build flow.
 * Sits in the shell's content column; takes the active view + answers
 * and emits the right surface. Empty / locked states are intentional:
 * they show the operator the canvas they're filling.
 *
 * Surfaces map 1:1 to Act1's left-nav items (Home / People / Schedule /
 * etc.) so when we eventually migrate Act1 onto the shared shell, these
 * builders collapse into the same components.
 * ────────────────────────────────────────────────────────────────────── */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function PreludeCanvas() {
  // Pre-industry build state. Shown while Nova is still asking for
  // name / company / industry. The faint Teambridge silhouette signals
  // "your workspace will appear here" without committing visually.
  return (
    <main className="bc-canvas bc-canvas--prelude" aria-label="Workspace forming">
      <div className="bc-prelude">
        <span className="bc-prelude-mark" aria-hidden="true">
          <TeambridgeAIIcon size={28} />
        </span>
        <h2 className="bc-prelude-title">Your Teambridge is forming</h2>
        <p className="bc-prelude-sub">
          Nova is setting up your workspace. The dashboard will appear here as you answer.
        </p>
      </div>
    </main>
  )
}

function BuildBanner({ answers, industry, current }) {
  // A thin top strip on each populated view, narrating what just got
  // built and what's still pending. Keeps the operator oriented as
  // sections wake up.
  if (!industry) return null
  const teamSize = TEAM_SIZE_OPTIONS.find(o => o.id === answers.teamSize)
  const pains = (answers.pains || []).length
  const connectors = (answers.connectors || []).length

  const pieces = []
  pieces.push(`${industry.name} workspace`)
  if (teamSize) pieces.push(`${teamSize.headcount.toLocaleString()} on roster`)
  if (pains)    pieces.push(`${pains} agent${pains === 1 ? '' : 's'} running`)
  if (connectors) pieces.push(`${connectors} tool${connectors === 1 ? '' : 's'} connected`)

  return (
    <div className="bc-banner">
      <span className="bc-banner-mark" aria-hidden="true">
        <TeambridgeAIIcon size={11} />
      </span>
      <span className="bc-banner-text">
        <strong>Nova is building.</strong> {pieces.join(' · ')}.
      </span>
    </div>
  )
}

function EmptyState({ icon, title, body }) {
  return (
    <div className="bc-empty">
      <span className="bc-empty-icon" aria-hidden="true">{icon}</span>
      <div className="bc-empty-text">
        <span className="bc-empty-title">{title}</span>
        <span className="bc-empty-body">{body}</span>
      </div>
    </div>
  )
}

/* ─── Overview ─────────────────────────────────────────────────────── */
function OverviewSurface({ answers, industry, industryData }) {
  const teamSize = TEAM_SIZE_OPTIONS.find(o => o.id === answers.teamSize)
  const pains = answers.pains || []
  const connectors = answers.connectors || []
  const headcount = teamSize?.headcount

  return (
    <div className="bc-overview">
      <header className="bc-page-head">
        <h1 className="bc-page-title">
          {answers.firstName ? `Welcome, ${answers.firstName}` : 'Welcome'}
        </h1>
        <p className="bc-page-sub">
          {industry
            ? `Your ${industry.name.toLowerCase()} workspace is coming together. Watch the right side as Nova fills it in.`
            : "Pick your industry and Nova will start wiring this up."}
        </p>
      </header>

      <div className="bc-stat-row">
        <Stat label="Headcount"   value={headcount?.toLocaleString() ?? '—'} sub={teamSize?.detail ?? 'Add team size'} tone={teamSize ? 'matcha' : 'muted'} />
        <Stat label="Agents"      value={pains.length}      sub={pains.length ? 'Running for you' : 'Pick top pains'}        tone={pains.length ? 'purple' : 'muted'} />
        <Stat label="Connections" value={connectors.length} sub={connectors.length ? 'Syncing now' : 'Connect your stack'}   tone={connectors.length ? 'azure' : 'muted'} />
        <Stat label="Coverage"    value="100%"              sub="Schedule on track" tone="muted" />
      </div>

      {pains.length > 0 && (
        <section className="bc-section">
          <header className="bc-section-head">
            <h2 className="bc-section-title">
              <Target04Icon size={14} /> Agents Nova just activated
            </h2>
          </header>
          <ul className="bc-agent-list">
            {pains.slice(0, 3).map(p => {
              const a = PAIN_TO_AGENT[p]
              if (!a) return null
              return (
                <li key={p} className="bc-agent-row">
                  <span className="bc-agent-mark" aria-hidden="true">
                    <TeambridgeAIIcon size={12} />
                  </span>
                  <div className="bc-agent-text">
                    <span className="bc-agent-name">{a.name}</span>
                    <span className="bc-agent-detail">{a.detail}</span>
                  </div>
                  <span className="bc-chip bc-chip--matcha">
                    <span className="bc-pulse" aria-hidden="true" /> Running
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {!industry && (
        <EmptyState
          icon={<Grid01Icon size={16} />}
          title="Your dashboard is waiting."
          body="Once you pick an industry, this becomes your live home view."
        />
      )}
    </div>
  )
}

function Stat({ label, value, sub, tone = 'muted' }) {
  return (
    <div className={`bc-stat bc-stat--${tone}`}>
      <span className="bc-stat-label">{label}</span>
      <span className="bc-stat-value">{value}</span>
      <span className="bc-stat-sub">{sub}</span>
    </div>
  )
}

/* ─── Schedule ─────────────────────────────────────────────────────── */
function ScheduleSurface({ answers, industry, industryData }) {
  const teamSize = TEAM_SIZE_OPTIONS.find(o => o.id === answers.teamSize)
  if (!industry || !teamSize) {
    return (
      <div className="bc-page-pad">
        <header className="bc-page-head">
          <h1 className="bc-page-title">Schedule</h1>
          <p className="bc-page-sub">A live week grid for your sites. Populates when Nova has a team size to roster.</p>
        </header>
        <EmptyState
          icon={<ClockIcon size={16} />}
          title="Schedule grid pending"
          body={industry ? 'Tell Nova your team size and locations to populate this.' : 'Pick an industry first.'}
        />
      </div>
    )
  }

  const rosterRows = industryData?.schedule?.rows?.slice(0, 5) || []
  const overtimeFlag = (answers.pains || []).includes('overtime')
  const coverageFlag = (answers.pains || []).includes('coverage')

  return (
    <div className="bc-page-pad">
      <header className="bc-page-head">
        <div>
          <h1 className="bc-page-title">Schedule</h1>
          <p className="bc-page-sub">
            Week of {industryData?.schedule?.weekLabel || 'Apr 27'} · {teamSize.headcount.toLocaleString()} on roster
          </p>
        </div>
        <div className="bc-head-chips">
          {coverageFlag && <span className="bc-chip bc-chip--matcha"><CheckCircleIcon size={10} /> Coverage agent on</span>}
          {overtimeFlag && <span className="bc-chip bc-chip--orange"><ClockIcon size={10} /> OT cap agent on</span>}
        </div>
      </header>

      <div className="bc-grid-wrap">
        <div className="bc-grid" style={{ gridTemplateColumns: `140px repeat(${DAYS.length}, minmax(72px, 1fr))` }}>
          <div className="bc-grid-corner" />
          {DAYS.map(d => <div key={d} className="bc-grid-day">{d}</div>)}
          {rosterRows.map((row, ri) => (
            <Fragment key={`r-${ri}`}>
              <div className="bc-grid-name">{row.name}</div>
              {DAY_KEYS.map((dk, di) => {
                const shift = row.shifts?.[dk]
                return (
                  <div key={`${ri}-${di}`} className="bc-grid-cell">
                    {shift ? (
                      <div className={`bc-shift bc-shift--${shift.status || 'upcoming'}${overtimeFlag && ri === 1 && di === 2 ? ' bc-shift--ot' : ''}`}>
                        <span className="bc-shift-label">{shift.role || shift.venue}</span>
                        {shift.start && <span className="bc-shift-time">{shift.start}–{shift.end}</span>}
                      </div>
                    ) : (
                      <span className="bc-shift-off">Off</span>
                    )}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── People ───────────────────────────────────────────────────────── */
function PeopleSurface({ answers, industry, industryData }) {
  if (!industry) {
    return (
      <div className="bc-page-pad">
        <header className="bc-page-head">
          <h1 className="bc-page-title">People</h1>
        </header>
        <EmptyState
          icon={<Users03Icon size={16} />}
          title="Your roster will appear here."
          body="Pick an industry to seed Nova's view of your team."
        />
      </div>
    )
  }
  const rows = (industryData?.people?.rows || []).slice(0, 7)
  const teamSize = TEAM_SIZE_OPTIONS.find(o => o.id === answers.teamSize)
  const rosterChoice = answers.rosterChoice

  return (
    <div className="bc-page-pad">
      <header className="bc-page-head">
        <div>
          <h1 className="bc-page-title">People</h1>
          <p className="bc-page-sub">
            {teamSize ? `${teamSize.headcount.toLocaleString()} on roster` : 'Add team size'}
            {rosterChoice === 'csv'  && ' · imported from CSV'}
            {rosterChoice === 'hris' && ' · syncing from HRIS'}
          </p>
        </div>
      </header>

      {rows.length === 0 ? (
        <EmptyState icon={<Users03Icon size={16} />} title="Roster forming…" body="Sync or upload to populate." />
      ) : (
        <ul className="bc-people-list">
          {rows.map(r => (
            <li key={r.id} className="bc-people-row">
              <span className="bc-people-avatar" aria-hidden="true">
                {r.name.split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase()}
              </span>
              <div className="bc-people-main">
                <span className="bc-people-name">{r.name}</span>
                <span className="bc-people-meta">{r.role}{r.venue ? ` · ${r.venue}` : ''}</span>
              </div>
              <span className="bc-people-hours">{r.hours}</span>
              {r.status === 'cert-expiring' && <span className="bc-chip bc-chip--orange">Cert expiring</span>}
              {r.status === 'new-hire'      && <span className="bc-chip bc-chip--azure">New hire</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ─── Workflows / Agents ──────────────────────────────────────────── */
function WorkflowsSurface({ answers }) {
  const pains = answers.pains || []
  if (pains.length === 0) {
    return (
      <div className="bc-page-pad">
        <header className="bc-page-head">
          <h1 className="bc-page-title">Agent Workflows</h1>
        </header>
        <EmptyState
          icon={<Target04Icon size={16} />}
          title="Your agents will land here."
          body="Pick your top pains and Nova will spin up the right ones."
        />
      </div>
    )
  }
  const active = pains.map(p => ({ id: p, ...PAIN_TO_AGENT[p] })).filter(a => a.name)
  const recSet = new Set(active.map(r => r.id))
  const dormant = PAIN_OPTIONS
    .filter(p => !recSet.has(p.id))
    .map(p => ({ id: p.id, label: p.label, ...PAIN_TO_AGENT[p.id] }))
    .filter(a => a.name)

  return (
    <div className="bc-page-pad">
      <header className="bc-page-head">
        <div>
          <h1 className="bc-page-title">Agent Workflows</h1>
          <p className="bc-page-sub">{active.length} running · {dormant.length} available</p>
        </div>
      </header>

      <section className="bc-section">
        <ul className="bc-agent-list">
          {active.map(a => (
            <li key={a.id} className="bc-agent-row bc-agent-row--active">
              <span className="bc-agent-mark" aria-hidden="true"><TeambridgeAIIcon size={12} /></span>
              <div className="bc-agent-text">
                <span className="bc-agent-name">{a.name}</span>
                <span className="bc-agent-detail">{a.detail}</span>
              </div>
              <span className="bc-chip bc-chip--matcha"><span className="bc-pulse" aria-hidden="true" /> Running</span>
            </li>
          ))}
        </ul>
      </section>

      {dormant.length > 0 && (
        <section className="bc-section">
          <header className="bc-section-head">
            <h2 className="bc-section-title">Available agents</h2>
          </header>
          <ul className="bc-agent-list">
            {dormant.map(a => (
              <li key={a.id} className="bc-agent-row bc-agent-row--dormant">
                <span className="bc-agent-mark bc-agent-mark--muted" aria-hidden="true"><TeambridgeAIIcon size={12} /></span>
                <div className="bc-agent-text">
                  <span className="bc-agent-name">{a.name}</span>
                  <span className="bc-agent-detail">{a.detail}</span>
                </div>
                <span className="bc-chip">Available</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

/* ─── Settings (integrations) ───────────────────────────────────── */
function SettingsSurface({ answers }) {
  const set = new Set(answers.connectors || [])
  return (
    <div className="bc-page-pad">
      <header className="bc-page-head">
        <div>
          <h1 className="bc-page-title">Integrations</h1>
          <p className="bc-page-sub">
            {set.size === 0 ? 'Connect your stack so Nova has the data she needs.' : `${set.size} connected · ${CONNECTOR_OPTIONS.length - set.size} available`}
          </p>
        </div>
      </header>

      <div className="bc-integration-grid">
        {CONNECTOR_OPTIONS.map(c => {
          const connected = set.has(c.id)
          return (
            <div key={c.id} className={`bc-integration ${connected ? 'is-connected' : ''}`}>
              <span
                className="bc-integration-mark"
                style={{
                  background: `var(--color-${c.accent}-bg-tertiary)`,
                  color:      `var(--color-${c.accent}-content-secondary)`,
                }}
                aria-hidden="true"
              >{c.label.charAt(0)}</span>
              <div className="bc-integration-text">
                <span className="bc-integration-name">{c.label}</span>
                <span className="bc-integration-cat">{c.category}</span>
              </div>
              <span className={`bc-chip ${connected ? 'bc-chip--matcha' : ''}`}>
                {connected ? (<><CheckCircleIcon size={10} /> Connected</>) : 'Not yet'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Generic placeholder for views Nova hasn't reached yet ─────── */
function PendingSurface({ title }) {
  return (
    <div className="bc-page-pad">
      <header className="bc-page-head">
        <h1 className="bc-page-title">{title}</h1>
      </header>
      <EmptyState
        icon={<TeambridgeAIIcon size={14} />}
        title="Nova will set this up next."
        body="This page activates once your workspace is further along. You'll be able to come back here anytime."
      />
    </div>
  )
}

/* ─── Surface dispatcher ─────────────────────────────────────────── */
export default function BuildContent({ view, answers, mode }) {
  const industry = INDUSTRIES.find(i => i.id === answers.industry) || null
  const industryData = useMemo(
    () => (answers.industry ? getIndustryData(answers.industry) : null),
    [answers.industry],
  )

  if (mode === 'chat-prominent') {
    return <PreludeCanvas />
  }

  let surface
  switch (view) {
    case 'schedule':    surface = <ScheduleSurface  answers={answers} industry={industry} industryData={industryData} />; break
    case 'people':      surface = <PeopleSurface    answers={answers} industry={industry} industryData={industryData} />; break
    case 'workflows':   surface = <WorkflowsSurface answers={answers} />; break
    case 'settings':    surface = <SettingsSurface  answers={answers} />; break
    case 'onboarding':  surface = <PendingSurface title="Onboarding" />; break
    case 'engage':      surface = <PendingSurface title="Engage" />; break
    case 'shift-requests': surface = <PendingSurface title="Shift Requests" />; break
    case 'time-tracking':  surface = <PendingSurface title="Live Tracking" />; break
    case 'timesheets':  surface = <PendingSurface title="Timesheets" />; break
    case 'pay':         surface = <PendingSurface title="Payroll" />; break
    case 'review':      surface = <PendingSurface title="Review" />; break
    case 'policies':    surface = <PendingSurface title="Policy Builder" />; break
    default:            surface = <OverviewSurface answers={answers} industry={industry} industryData={industryData} />
  }

  return (
    <main className="bc-canvas">
      <BuildBanner answers={answers} industry={industry} current={view} />
      {surface}
    </main>
  )
}
