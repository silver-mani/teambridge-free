import { INDUSTRIES } from '../IndustrySelector.jsx'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { Users03Icon } from '../../../../src/components/icons/Users03Icon.tsx'
import { Map01Icon } from '../../../../src/components/icons/Map01Icon.tsx'
import { PuzzlePiece01Icon } from '../../../../src/components/icons/PuzzlePiece01Icon.tsx'
import { Target04Icon } from '../../../../src/components/icons/Target04Icon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { CloudUploadIcon } from '../../../../src/components/icons/CloudUploadIcon.tsx'
import {
  TEAM_SIZE_OPTIONS,
  LOCATION_OPTIONS,
  PAIN_OPTIONS,
  PAIN_TO_AGENT,
  CONNECTOR_OPTIONS,
  ROSTER_OPTIONS,
} from './steps.js'

/* ──────────────────────────────────────────────────────────────────────
 * OnboardingPreview — right pane. Watches the running `answers` object
 * and renders a live "your account is being built" preview. Tiles
 * progressively fill in as the user answers; unfilled ones show a quiet
 * skeleton so the canvas never feels empty. The intent is the operator
 * sees their data shape into a real Teambridge surface in real time.
 * ────────────────────────────────────────────────────────────────────── */

function Tile({ filled, title, kind, icon, children }) {
  return (
    <div className={`ob-tile ob-tile--${kind} ${filled ? 'is-filled' : 'is-skeleton'}`}>
      <header className="ob-tile-head">
        <span className="ob-tile-icon" aria-hidden="true">{icon}</span>
        <span className="ob-tile-title">{title}</span>
        {filled && (
          <span className="ob-tile-flag" aria-hidden="true">
            <CheckCircleIcon size={14} />
          </span>
        )}
      </header>
      <div className="ob-tile-body">{children}</div>
    </div>
  )
}

function AvatarStack({ count }) {
  const seeds = [
    ['JR', 'matcha'], ['DK', 'azure'], ['PS', 'orange'],
    ['MG', 'purple'], ['AL', 'pink'], ['TN', 'blue'],
  ]
  const shown = seeds.slice(0, Math.min(count, seeds.length))
  return (
    <div className="ob-avatar-stack">
      {shown.map(([initials, color], i) => (
        <span
          key={i}
          className="ob-avatar-stack-dot"
          style={{
            background: `var(--color-${color}-bg-tertiary)`,
            color:      `var(--color-${color}-content-secondary)`,
            zIndex: 10 - i,
          }}
        >
          {initials}
        </span>
      ))}
    </div>
  )
}

function CompanyHeader({ answers, industry }) {
  const hasCompany = !!answers.company
  return (
    <div className={`ob-preview-headline ${hasCompany ? 'is-filled' : 'is-skeleton'}`}>
      <div className="ob-preview-headline-left">
        <span
          className="ob-preview-mark"
          style={industry ? {
            background: `var(--color-${industry.color}-bg-tertiary)`,
            color:      `var(--color-${industry.color}-content-secondary)`,
          } : undefined}
          aria-hidden="true"
        >
          {industry ? <industry.Icon /> : <TeambridgeAIIcon size={20} />}
        </span>
        <div className="ob-preview-headline-text">
          <span className="ob-preview-company">
            {answers.company || 'Your company'}
          </span>
          <span className="ob-preview-eyebrow">
            {industry ? `${industry.name} on Teambridge` : 'Teambridge workspace'}
          </span>
        </div>
      </div>
      <span className="ob-preview-status">
        <span className="ob-status-pulse" aria-hidden="true" />
        Setting up
      </span>
    </div>
  )
}

function HeadcountTile({ answers }) {
  const teamSize = TEAM_SIZE_OPTIONS.find(o => o.id === answers.teamSize)
  const filled = !!teamSize
  return (
    <Tile filled={filled} kind="headcount" title="Headcount" icon={<Users03Icon size={14} />}>
      {filled ? (
        <>
          <div className="ob-tile-figure">{teamSize.headcount.toLocaleString()}</div>
          <div className="ob-tile-sub">{teamSize.label} • {teamSize.detail}</div>
          <AvatarStack count={Math.min(6, Math.max(3, Math.round(teamSize.headcount / 50)))} />
        </>
      ) : (
        <div className="ob-tile-placeholder">We'll mirror your team here.</div>
      )}
    </Tile>
  )
}

function LocationsTile({ answers }) {
  const loc = LOCATION_OPTIONS.find(o => o.id === answers.locationModel)
  const filled = !!loc
  const sitesByModel = {
    'single':         ['Main facility'],
    'multi-local':    ['North campus', 'South campus', 'Westside annex'],
    'multi-regional': ['West region · 8 sites', 'Central region · 6 sites', 'East region · 11 sites'],
  }
  const sites = filled ? sitesByModel[loc.id] : []
  return (
    <Tile filled={filled} kind="locations" title="Locations" icon={<Map01Icon size={14} />}>
      {filled ? (
        <ul className="ob-tile-list">
          {sites.map(s => (
            <li key={s} className="ob-tile-list-item">
              <span className="ob-loc-dot" aria-hidden="true" />
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <div className="ob-tile-placeholder">Your sites and regions will appear here.</div>
      )}
    </Tile>
  )
}

function AgentsTile({ answers }) {
  const pains = answers.pains || []
  const filled = pains.length > 0
  return (
    <Tile filled={filled} kind="agents" title="Recommended agents" icon={<Target04Icon size={14} />}>
      {filled ? (
        <ul className="ob-tile-list">
          {pains.slice(0, 3).map(p => {
            const a = PAIN_TO_AGENT[p]
            if (!a) return null
            return (
              <li key={p} className="ob-tile-list-item ob-tile-list-item--rich">
                <span className="ob-agent-mark" aria-hidden="true">
                  <TeambridgeAIIcon size={12} />
                </span>
                <div className="ob-agent-text">
                  <span className="ob-agent-name">{a.name}</span>
                  <span className="ob-agent-detail">{a.detail}</span>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="ob-tile-placeholder">
          Pick your top pains and we'll line up the right agents.
        </div>
      )}
    </Tile>
  )
}

function ConnectorsTile({ answers }) {
  const ids = answers.connectors || []
  const filled = ids.length > 0
  return (
    <Tile filled={filled} kind="connectors" title="Connected tools" icon={<PuzzlePiece01Icon size={14} />}>
      {filled ? (
        <div className="ob-connector-chips">
          {ids.map(id => {
            const c = CONNECTOR_OPTIONS.find(o => o.id === id)
            if (!c) return null
            return (
              <span key={id} className="ob-connector-chip">
                <span
                  className="ob-connector-chip-mark"
                  style={{
                    background: `var(--color-${c.accent}-bg-tertiary)`,
                    color:      `var(--color-${c.accent}-content-secondary)`,
                  }}
                  aria-hidden="true"
                >
                  {c.label.charAt(0)}
                </span>
                {c.label}
              </span>
            )
          })}
        </div>
      ) : (
        <div className="ob-tile-placeholder">
          Payroll, HRIS, comms, accounting — wire it all up in a click.
        </div>
      )}
    </Tile>
  )
}

function RosterTile({ answers }) {
  const choice = ROSTER_OPTIONS.find(o => o.id === answers.rosterChoice)
  const filled = !!choice
  const copyByChoice = {
    csv:  '14 rows mapped from your CSV.',
    hris: 'Live sync from your HRIS active.',
    skip: 'You can import your roster anytime from People.',
  }
  return (
    <Tile filled={filled} kind="roster" title="Roster" icon={<CloudUploadIcon size={14} />}>
      {filled ? (
        <div className="ob-tile-text">{copyByChoice[choice.id]}</div>
      ) : (
        <div className="ob-tile-placeholder">Import your team via CSV or HRIS.</div>
      )}
    </Tile>
  )
}

export default function OnboardingPreview({ answers, isDone }) {
  const industry = INDUSTRIES.find(i => i.id === answers.industry) || null

  return (
    <section className="ob-preview" aria-label="Your account preview">
      <div className="ob-preview-chrome">
        <span className="ob-chrome-dot" />
        <span className="ob-chrome-dot" />
        <span className="ob-chrome-dot" />
        <span className="ob-chrome-url">teambridge.com/{(answers.company || 'your-company').toLowerCase().replace(/\s+/g, '-')}</span>
      </div>

      <div className="ob-preview-canvas">
        <CompanyHeader answers={answers} industry={industry} />

        <div className="ob-preview-grid">
          <HeadcountTile answers={answers} />
          <LocationsTile answers={answers} />
          <AgentsTile answers={answers} />
          <ConnectorsTile answers={answers} />
          <RosterTile answers={answers} />
        </div>

        {isDone && (
          <div className="ob-preview-done">
            <span className="ob-preview-done-mark" aria-hidden="true">
              <CheckCircleIcon size={20} />
            </span>
            <div>
              <div className="ob-preview-done-title">Setup complete</div>
              <div className="ob-preview-done-sub">
                Your Teambridge is provisioned and ready. Open the dashboard to start.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
