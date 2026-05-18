import { useMemo, Fragment } from 'react'
import { INDUSTRIES } from '../IndustrySelector.jsx'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { Users03Icon } from '../../../../src/components/icons/Users03Icon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { ClockIcon } from '../../../../src/components/icons/ClockIcon.tsx'
import { Map01Icon } from '../../../../src/components/icons/Map01Icon.tsx'
import { Grid01Icon } from '../../../../src/components/icons/Grid01Icon.tsx'
import { PuzzlePiece01Icon } from '../../../../src/components/icons/PuzzlePiece01Icon.tsx'
import { Target04Icon } from '../../../../src/components/icons/Target04Icon.tsx'
import { getIndustryData } from '../../data/industryData.js'
import {
  TEAM_SIZE_OPTIONS,
  LOCATION_OPTIONS,
  PAIN_OPTIONS,
  PAIN_TO_AGENT,
  CONNECTOR_OPTIONS,
} from './steps.js'

/* ──────────────────────────────────────────────────────────────────────
 * BuildPreview — right pane of the build flow. Renders the actual
 * Teambridge product surfaces as a five-tab preview (Overview, Schedule,
 * People, Agents, Integrations). Each surface populates from the running
 * `answers` object — the operator watches their account take shape in
 * the real product chrome, not a generic progress wizard.
 *
 * The parent owns which tab is active. Each setup step has a `focus`
 * hint that the orchestrator uses to swing the preview to whichever
 * surface is most relevant for the current question.
 * ────────────────────────────────────────────────────────────────────── */

const TABS = [
  { id: 'overview',     label: 'Overview',     Icon: Grid01Icon },
  { id: 'schedule',     label: 'Schedule',     Icon: ClockIcon },
  { id: 'people',       label: 'People',       Icon: Users03Icon },
  { id: 'agents',       label: 'Agents',       Icon: Target04Icon },
  { id: 'integrations', label: 'Integrations', Icon: PuzzlePiece01Icon },
]

const SITES_BY_MODEL = {
  'single':         ['Main facility'],
  'multi-local':    ['North campus', 'South campus', 'Westside annex'],
  'multi-regional': ['West region · 8 sites', 'Central region · 6 sites', 'East region · 11 sites'],
}

const SITE_COUNT_BY_MODEL = {
  'single': 1,
  'multi-local': 3,
  'multi-regional': 25,
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* ────────────────────────────────────────────────────────────────── */

function emptyState(headline, body, icon) {
  return (
    <div className="bp-empty">
      <span className="bp-empty-icon" aria-hidden="true">{icon}</span>
      <span className="bp-empty-headline">{headline}</span>
      <span className="bp-empty-body">{body}</span>
    </div>
  )
}

function StatTile({ label, value, sub, tone = 'neutral' }) {
  return (
    <div className={`bp-stat bp-stat--${tone}`}>
      <span className="bp-stat-label">{label}</span>
      <span className="bp-stat-value">{value}</span>
      {sub && <span className="bp-stat-sub">{sub}</span>}
    </div>
  )
}

/* ──────────────────────── Surfaces ──────────────────────────────── */

function OverviewSurface({ answers, industry, industryData, teamSize, agentCount, connectorCount, siteCount }) {
  if (!industry) {
    return emptyState(
      'Your dashboard will live here.',
      "Pick your industry on the left and I'll start wiring this up.",
      <Grid01Icon size={18} />,
    )
  }

  return (
    <div className="bp-overview">
      <div className="bp-overview-stats">
        <StatTile
          label="Headcount"
          value={teamSize ? teamSize.headcount.toLocaleString() : '—'}
          sub={teamSize ? teamSize.detail : 'Add team size'}
        />
        <StatTile
          label="Active sites"
          value={siteCount ?? '—'}
          sub={siteCount ? 'On the schedule' : 'Add locations'}
        />
        <StatTile
          label="Agents"
          value={agentCount}
          sub={agentCount > 0 ? 'Running for you' : 'Pick your top pains'}
          tone={agentCount > 0 ? 'matcha' : 'neutral'}
        />
        <StatTile
          label="Connected tools"
          value={connectorCount}
          sub={connectorCount > 0 ? 'Syncing now' : 'Connect your stack'}
          tone={connectorCount > 0 ? 'azure' : 'neutral'}
        />
      </div>

      <div className="bp-overview-feed">
        <div className="bp-overview-feed-head">
          <span className="bp-overview-feed-title">Activity</span>
          <span className="bp-overview-feed-sub">Nova is working</span>
        </div>
        <ul className="bp-feed-list">
          {industry && (
            <li className="bp-feed-item">
              <span className="bp-feed-mark" aria-hidden="true"><TeambridgeAIIcon size={10} /></span>
              <span>Loaded {industryData?.label ?? industry.name} schedule template — {industryData?.workerNounPlural ?? 'staff'} ready to roster.</span>
            </li>
          )}
          {teamSize && (
            <li className="bp-feed-item">
              <span className="bp-feed-mark" aria-hidden="true"><TeambridgeAIIcon size={10} /></span>
              <span>Sized your roster to {teamSize.headcount.toLocaleString()} ({teamSize.detail.toLowerCase()}).</span>
            </li>
          )}
          {answers.locationModel && (
            <li className="bp-feed-item">
              <span className="bp-feed-mark" aria-hidden="true"><TeambridgeAIIcon size={10} /></span>
              <span>Wired up {SITES_BY_MODEL[answers.locationModel].length} site{SITES_BY_MODEL[answers.locationModel].length === 1 ? '' : 's'} on the schedule.</span>
            </li>
          )}
          {(answers.pains || []).slice(0, 3).map(p => {
            const agent = PAIN_TO_AGENT[p]
            return agent ? (
              <li key={p} className="bp-feed-item">
                <span className="bp-feed-mark" aria-hidden="true"><TeambridgeAIIcon size={10} /></span>
                <span>Activated <strong>{agent.name}</strong> — {agent.detail.toLowerCase()}</span>
              </li>
            ) : null
          })}
          {(answers.connectors || []).slice(0, 3).map(id => {
            const c = CONNECTOR_OPTIONS.find(o => o.id === id)
            return c ? (
              <li key={id} className="bp-feed-item">
                <span className="bp-feed-mark" aria-hidden="true"><TeambridgeAIIcon size={10} /></span>
                <span>Connected to <strong>{c.label}</strong>.</span>
              </li>
            ) : null
          })}
        </ul>
      </div>
    </div>
  )
}

function ScheduleSurface({ answers, industry, industryData, teamSize, sites }) {
  if (!industry || !teamSize) {
    return emptyState(
      'Your schedule grid will appear here.',
      industry ? "Add your team size and I'll roster shifts across your sites." : 'Pick your industry first.',
      <ClockIcon size={18} />,
    )
  }

  // Pull realistic schedule rows from industry data when available.
  const realRows = industryData?.schedule?.rows?.slice(0, Math.min(5, Math.max(3, teamSize.headcount > 100 ? 5 : 4))) || []

  // Synthesize a tiny grid if industry data lacks a roster.
  const rows = realRows.length
    ? realRows.map(r => ({
        name: r.name,
        cells: DAYS.map((_, di) => {
          const dayKey = ['mon','tue','wed','thu','fri','sat','sun'][di]
          const shift = r.shifts?.[dayKey]
          if (!shift) return null
          return {
            label: shift.role || shift.venue || '',
            status: shift.status || 'upcoming',
            time: shift.start ? `${shift.start}–${shift.end}` : '',
          }
        }),
      }))
    : ['Alex M.', 'Jamie L.', 'Priya S.', 'David K.'].map((name, i) => ({
        name,
        cells: DAYS.map((_, di) => (di === 5 || di === 6 ? null : {
          label: `${industryData?.workerNoun ?? 'Staff'}`,
          status: i === 1 && di === 2 ? 'ot-risk' : 'upcoming',
          time: '9:00a–5:00p',
        })),
      }))

  const overtimeFlagged = (answers.pains || []).includes('overtime')
  const coverageFlagged = (answers.pains || []).includes('coverage')

  return (
    <div className="bp-schedule">
      <header className="bp-surface-head">
        <div className="bp-surface-head-left">
          <span className="bp-surface-title">Week of Apr 27</span>
          <span className="bp-surface-sub">{sites.length} site{sites.length === 1 ? '' : 's'} · {teamSize.headcount.toLocaleString()} on roster</span>
        </div>
        <div className="bp-surface-head-right">
          {coverageFlagged && (
            <span className="bp-chip bp-chip--matcha">
              <CheckCircleIcon size={10} /> Coverage agent on
            </span>
          )}
          {overtimeFlagged && (
            <span className="bp-chip bp-chip--orange">
              <ClockIcon size={10} /> 1 OT risk flagged
            </span>
          )}
        </div>
      </header>

      <div className="bp-grid-scroll">
        <div className="bp-grid" style={{ gridTemplateColumns: `120px repeat(${DAYS.length}, minmax(80px, 1fr))` }}>
          <div className="bp-grid-corner" />
          {DAYS.map(d => <div key={d} className="bp-grid-day">{d}</div>)}
          {rows.map((row, ri) => (
            <Fragment key={`row-${ri}`}>
              <div className="bp-grid-name">{row.name}</div>
              {row.cells.map((cell, ci) => (
                <div key={`${ri}-${ci}`} className="bp-grid-cell">
                  {cell ? (
                    <div className={`bp-shift bp-shift--${cell.status}${overtimeFlagged && ri === 1 && ci === 2 ? ' bp-shift--ot' : ''}`}>
                      <span className="bp-shift-label">{cell.label}</span>
                      {cell.time && <span className="bp-shift-time">{cell.time}</span>}
                    </div>
                  ) : (
                    <span className="bp-shift-off">Off</span>
                  )}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

function PeopleSurface({ industry, industryData, teamSize, rosterChoice }) {
  if (!industry) {
    return emptyState(
      'Your roster will populate here.',
      "Pick your industry and team size and I'll seed it.",
      <Users03Icon size={18} />,
    )
  }

  const rows = industryData?.people?.rows || []
  const visible = rows.slice(0, 6)
  const headcount = teamSize?.headcount

  return (
    <div className="bp-people">
      <header className="bp-surface-head">
        <div className="bp-surface-head-left">
          <span className="bp-surface-title">Roster</span>
          <span className="bp-surface-sub">
            {headcount ? `${headcount.toLocaleString()} total` : 'Add team size'}
            {rosterChoice === 'csv' && ' · imported from CSV'}
            {rosterChoice === 'hris' && ' · synced from HRIS'}
          </span>
        </div>
      </header>

      {visible.length === 0 ? (
        emptyState('Roster forming…', 'Connect your HRIS or upload a CSV to populate.', <Users03Icon size={18} />)
      ) : (
        <ul className="bp-people-list">
          {visible.map(r => (
            <li key={r.id} className="bp-people-row">
              <span className="bp-people-avatar" aria-hidden="true">
                {r.name.split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase()}
              </span>
              <div className="bp-people-text">
                <span className="bp-people-name">{r.name}</span>
                <span className="bp-people-meta">{r.role}{r.venue ? ` · ${r.venue}` : ''}</span>
              </div>
              <span className="bp-people-hours">{r.hours}</span>
              {r.status === 'cert-expiring' && (
                <span className="bp-chip bp-chip--orange">Cert expiring</span>
              )}
              {r.status === 'new-hire' && (
                <span className="bp-chip bp-chip--azure">New hire</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AgentsSurface({ pains }) {
  const recommended = pains.length
    ? pains.map(p => ({ id: p, ...PAIN_TO_AGENT[p] })).filter(a => a.name)
    : []
  const allOptions = PAIN_OPTIONS.map(p => ({ id: p.id, label: p.label, ...PAIN_TO_AGENT[p.id] }))

  if (recommended.length === 0) {
    return emptyState(
      'Your agents will land here.',
      "Tell me your top 3 pains and I'll activate the right agents.",
      <Target04Icon size={18} />,
    )
  }

  const recSet = new Set(recommended.map(r => r.id))

  return (
    <div className="bp-agents">
      <header className="bp-surface-head">
        <div className="bp-surface-head-left">
          <span className="bp-surface-title">Active agents</span>
          <span className="bp-surface-sub">{recommended.length} running · {allOptions.length - recommended.length} available</span>
        </div>
      </header>

      <ul className="bp-agents-list">
        {recommended.map(a => (
          <li key={a.id} className="bp-agent bp-agent--active">
            <span className="bp-agent-mark" aria-hidden="true">
              <TeambridgeAIIcon size={12} />
            </span>
            <div className="bp-agent-text">
              <span className="bp-agent-name">{a.name}</span>
              <span className="bp-agent-detail">{a.detail}</span>
            </div>
            <span className="bp-chip bp-chip--matcha">
              <span className="bp-status-pulse" aria-hidden="true" />
              Running
            </span>
          </li>
        ))}
        {allOptions.filter(a => !recSet.has(a.id)).map(a => (
          <li key={a.id} className="bp-agent bp-agent--available">
            <span className="bp-agent-mark bp-agent-mark--muted" aria-hidden="true">
              <TeambridgeAIIcon size={12} />
            </span>
            <div className="bp-agent-text">
              <span className="bp-agent-name">{a.name}</span>
              <span className="bp-agent-detail">{a.detail}</span>
            </div>
            <span className="bp-chip">Available</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function IntegrationsSurface({ connectors }) {
  const set = new Set(connectors)

  return (
    <div className="bp-integrations">
      <header className="bp-surface-head">
        <div className="bp-surface-head-left">
          <span className="bp-surface-title">Integrations</span>
          <span className="bp-surface-sub">
            {set.size === 0
              ? 'Pick the tools you use today'
              : `${set.size} connected · ${CONNECTOR_OPTIONS.length - set.size} available`}
          </span>
        </div>
      </header>

      <div className="bp-integration-grid">
        {CONNECTOR_OPTIONS.map(c => {
          const connected = set.has(c.id)
          return (
            <div key={c.id} className={`bp-integration ${connected ? 'is-connected' : ''}`}>
              <span
                className="bp-integration-mark"
                style={{
                  background: `var(--color-${c.accent}-bg-tertiary)`,
                  color:      `var(--color-${c.accent}-content-secondary)`,
                }}
                aria-hidden="true"
              >
                {c.label.charAt(0)}
              </span>
              <div className="bp-integration-text">
                <span className="bp-integration-name">{c.label}</span>
                <span className="bp-integration-cat">{c.category}</span>
              </div>
              <span className={`bp-chip ${connected ? 'bp-chip--matcha' : ''}`}>
                {connected ? (<><CheckCircleIcon size={10} /> Connected</>) : 'Not yet'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ──────────────────────── Shell ──────────────────────────────── */

export default function BuildPreview({ answers, activeTab, onTabChange, isDone }) {
  const industry     = INDUSTRIES.find(i => i.id === answers.industry) || null
  const industryData = useMemo(() => (answers.industry ? getIndustryData(answers.industry) : null), [answers.industry])
  const teamSize     = TEAM_SIZE_OPTIONS.find(o => o.id === answers.teamSize) || null
  const sites        = answers.locationModel ? SITES_BY_MODEL[answers.locationModel] : []
  const siteCount    = answers.locationModel ? SITE_COUNT_BY_MODEL[answers.locationModel] : null
  const pains        = answers.pains || []
  const connectors   = answers.connectors || []
  const agentCount   = pains.filter(p => PAIN_TO_AGENT[p]).length
  const connectorCount = connectors.length

  const surface = (() => {
    switch (activeTab) {
      case 'schedule':
        return <ScheduleSurface answers={answers} industry={industry} industryData={industryData} teamSize={teamSize} sites={sites} />
      case 'people':
        return <PeopleSurface industry={industry} industryData={industryData} teamSize={teamSize} rosterChoice={answers.rosterChoice} />
      case 'agents':
        return <AgentsSurface pains={pains} />
      case 'integrations':
        return <IntegrationsSurface connectors={connectors} />
      case 'overview':
      default:
        return (
          <OverviewSurface
            answers={answers}
            industry={industry}
            industryData={industryData}
            teamSize={teamSize}
            agentCount={agentCount}
            connectorCount={connectorCount}
            siteCount={siteCount}
          />
        )
    }
  })()

  return (
    <section className="bp-preview" aria-label="Your account preview">
      <div className="bp-chrome">
        <span className="bp-chrome-dot" />
        <span className="bp-chrome-dot" />
        <span className="bp-chrome-dot" />
        <span className="bp-chrome-url">
          teambridge.com/{(answers.company || 'your-company').toLowerCase().replace(/\s+/g, '-')}
        </span>
        {isDone && (
          <span className="bp-chrome-flag" aria-hidden="true">
            <CheckCircleIcon size={12} /> Live
          </span>
        )}
      </div>

      <div className="bp-canvas">
        {/* App-style header */}
        <header className="bp-app-head">
          <div className="bp-app-brand">
            <span
              className="bp-app-mark"
              style={industry ? {
                background: `var(--color-${industry.color}-bg-tertiary)`,
                color:      `var(--color-${industry.color}-content-secondary)`,
              } : undefined}
              aria-hidden="true"
            >
              {industry ? <industry.Icon /> : <TeambridgeAIIcon size={18} />}
            </span>
            <div className="bp-app-text">
              <span className="bp-app-company">{answers.company || 'Your company'}</span>
              <span className="bp-app-sub">
                {industry ? `${industry.name} · Teambridge` : 'Teambridge workspace'}
              </span>
            </div>
          </div>
          <span className={`bp-status ${isDone ? 'bp-status--live' : 'bp-status--setup'}`}>
            <span className="bp-status-pulse" aria-hidden="true" />
            {isDone ? 'Live' : 'Setting up'}
          </span>
        </header>

        {/* Tab nav */}
        <nav className="bp-tabs" aria-label="Account preview sections">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              className={`bp-tab ${activeTab === t.id ? 'is-active' : ''}`}
              onClick={() => onTabChange(t.id)}
            >
              <t.Icon size={14} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="bp-surface">{surface}</div>
      </div>
    </section>
  )
}
