import { useState } from 'react'
import { ListBulletIcon }    from '../../../src/components/icons/ListBulletIcon.tsx'
import { TeambridgeAIIcon }  from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { PlusIcon }          from '../../../src/components/icons/PlusIcon.tsx'
import { PlusSquareIcon }    from '../../../src/components/icons/PlusSquareIcon.tsx'
import { ChevronDownIcon }   from '../../../src/components/icons/ChevronDownIcon.tsx'
import { Grid01Icon }        from '../../../src/components/icons/Grid01Icon.tsx'
import { Columns01Icon }     from '../../../src/components/icons/Columns01Icon.tsx'
import { ArrowNarrowDownIcon } from '../../../src/components/icons/ArrowNarrowDownIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * Onboarding — applicant-tracking kanban. Replaces the old Documents
 * placeholder. Stages map a candidate's path from Form intake through
 * Credentialing → Background Check → DocuSign → Hired (or Fired). The
 * page chrome mirrors the reference layout: tab bar with All Users
 * count, toolbar (Add Filter / Board View / Group by / Columns / Sort),
 * and a New User CTA.
 * ────────────────────────────────────────────────────────────────────── */

const STAGES = [
  { id: 'form',        label: 'Form',             accent: '#1d4ed8', bg: '#EFF4FF', text: '#1d4ed8' },
  { id: 'credential',  label: 'Credentialing',    accent: '#c47800', bg: '#FFF6E5', text: '#92400e' },
  { id: 'background',  label: 'Background Check', accent: '#5b21b6', bg: '#F1ECFF', text: '#5b21b6' },
  { id: 'docusign',    label: 'DocuSign',         accent: '#7c3aed', bg: '#F3EFFE', text: '#7c3aed' },
  { id: 'hired',       label: 'Hired',            accent: '#854d0e', bg: '#FAF1DD', text: '#854d0e' },
  { id: 'fired',       label: 'Fired',            accent: '#475569', bg: '#F1F5F9', text: '#475569' },
]

/* Role pill palette — color-coded by role family. Each role uses a faint
   tinted background plus a saturated text color. */
const ROLE_TINTS = {
  Lead:     { bg: '#EDE9FE', text: '#6d28d9' },
  Usher:    { bg: '#DBEAFE', text: '#1d4ed8' },
  Security: { bg: '#FEE2E2', text: '#b91c1c' },
  'F&B':    { bg: '#DCFCE7', text: '#166534' },
  Premium:  { bg: '#FCE7F3', text: '#9d174d' },
  Bev:      { bg: '#D1FAE5', text: '#047857' },
  Cleaning: { bg: '#CCFBF1', text: '#0d9488' },
  Box:      { bg: '#FFEDD5', text: '#9a3412' },
  Engineer: { bg: '#F1F5F9', text: '#475569' },
  Gate:     { bg: '#FEF3C7', text: '#92400e' },
  Loadin:   { bg: '#FEE4E6', text: '#9f1239' },
}

const CANDIDATES = [
  // ── Form (4) ────────────────────────────────────────────────────────
  { id: 'c01', stage: 'form',       name: 'James Karlsson',    phone: null,             roles: ['Lead', 'Usher'],            ago: '1 year ago',   owner: 'Operator – Levi\'s', shifts: ['Wednesday AM', 'Wednesday PM'] },
  { id: 'c02', stage: 'form',       name: 'Lee Wu',            phone: null,             roles: ['Usher'],                    ago: '4 months ago', owner: 'Operator – Civic',   shifts: ['Wednesday AM', 'Wednesday PM'] },
  { id: 'c03', stage: 'form',       name: 'Tomás Reyes',       phone: '+14152223344',   roles: ['Bev'],                      ago: '2 months ago', owner: 'Operator – Levi\'s' },
  { id: 'c04', stage: 'form',       name: 'Aisha Bello',       phone: null,             roles: ['Box', 'Usher'],             ago: '3 weeks ago',  owner: 'GM – Harbor' },

  // ── Credentialing (5) ───────────────────────────────────────────────
  { id: 'c05', stage: 'credential', name: 'Amy Jain',          phone: null,             roles: ['Lead','Usher','Security','F&B','Premium','Bev','Cleaning'], ago: '9 months ago', owner: 'Super Admin',         tier: 'Platinum' },
  { id: 'c06', stage: 'credential', name: 'Julian Kelly',      phone: null,             roles: ['Usher'],                    ago: '1 year ago',    owner: 'Super Admin',          tier: 'Platinum' },
  { id: 'c07', stage: 'credential', name: 'Mandy Wilson',      phone: '+14239876533',   roles: ['Usher'],                    ago: '3 weeks ago',   owner: 'Super Admin' },
  { id: 'c08', stage: 'credential', name: 'Miles Wilson',      phone: null,             roles: ['Bev', 'Usher'],             ago: '6 months ago',  owner: 'Operator – Civic' },
  { id: 'c09', stage: 'credential', name: 'Elena Petrov',      phone: '+15103330077',   roles: ['Premium', 'F&B'],           ago: '5 weeks ago',   owner: 'GM – Levi\'s' },

  // ── Background Check (6) ────────────────────────────────────────────
  { id: 'c10', stage: 'background', name: 'Belroy Williams',   phone: null,             roles: ['Usher'],                    ago: '5 months ago',  owner: 'Operator – Civic',     tier: 'Silver' },
  { id: 'c11', stage: 'background', name: 'Emily Holdens',     phone: null,             roles: ['Usher'],                    ago: '1 year ago',    owner: 'Operator – Civic',     tier: 'Silver' },
  { id: 'c12', stage: 'background', name: 'Francis Miller',    phone: null,             roles: ['Usher'],                    ago: '1 year ago',    owner: 'Operator – Civic',     note: 'Probation' },
  { id: 'c13', stage: 'background', name: 'James Ulrich',      phone: '+19735577332',   roles: ['Premium', 'Bev', 'Usher'],  ago: '6 months ago',  owner: 'Super Admin' },
  { id: 'c14', stage: 'background', name: 'Jerry Li',          phone: null,             roles: ['Usher'],                    ago: '2 weeks ago',   owner: 'Operator – Levi\'s' },
  { id: 'c15', stage: 'background', name: 'Hana Volk',         phone: null,             roles: ['Cleaning', 'Engineer'],     ago: '1 month ago',   owner: 'GM – Harbor' },

  // ── DocuSign (5) ────────────────────────────────────────────────────
  { id: 'c16', stage: 'docusign',   name: 'Jai Silva',         phone: '+17345553383',   roles: ['Usher'],                    ago: '6 days ago',    owner: 'Super Admin' },
  { id: 'c17', stage: 'docusign',   name: 'Jane Matthews',     phone: '+11234567890',   roles: ['Usher'],                    ago: '1 year ago',    owner: 'Operator – Civic' },
  { id: 'c18', stage: 'docusign',   name: 'Kyle Johnston',     phone: '+11672598765',   roles: ['Lead','Usher','Security','F&B','Premium','Bev','Cleaning','Box','Gate'], ago: '2 months ago', owner: 'Super Admin' },
  { id: 'c19', stage: 'docusign',   name: 'Milly Gold',        phone: null,             roles: ['Usher'],                    ago: '1 year ago',    owner: 'Super Admin' },
  { id: 'c20', stage: 'docusign',   name: 'Devon Marsh',       phone: '+12068884412',   roles: ['Gate', 'Security'],         ago: '3 days ago',    owner: 'Operator – Levi\'s' },

  // ── Hired (8) ───────────────────────────────────────────────────────
  { id: 'c21', stage: 'hired',      name: 'Amanda Smith',      phone: null,             roles: ['Premium', 'Lead', 'Usher'], ago: '3 months ago',  owner: 'Operator – Levi\'s',    tier: 'Gold' },
  { id: 'c22', stage: 'hired',      name: 'Austin Gaydos',     phone: null,             roles: ['Premium', 'Usher', 'Bev', 'Lead'], ago: '9 months ago',  owner: 'Super Admin',     tier: 'Gold', tierOwner: 'Sandra Donovay' },
  { id: 'c23', stage: 'hired',      name: 'Gordan Austin',     phone: null,             roles: ['Lead', 'Usher', 'Cleaning', 'Bev'], ago: '8 months ago',  owner: 'Operator – Civic',   shifts: ['Tuesday PM'] },
  { id: 'c24', stage: 'hired',      name: 'James Jones',       phone: null,             roles: ['Usher'],                    ago: 'No activity yet', owner: 'Operator – Civic',  metrics: '3 / 4 · 0 / 7 · 0' },
  { id: 'c25', stage: 'hired',      name: 'Javier Carrillo',   phone: null,             roles: [],                           ago: '1 month ago',   owner: '' },
  { id: 'c26', stage: 'hired',      name: 'Olivia Park',       phone: '+16504445566',   roles: ['Box'],                      ago: '2 months ago',  owner: 'Operator – Levi\'s' },
  { id: 'c27', stage: 'hired',      name: 'Diego Luna',        phone: '+18185556677',   roles: ['Security', 'Gate'],         ago: '4 weeks ago',   owner: 'Operator – Civic' },
  { id: 'c28', stage: 'hired',      name: 'Priya Anand',       phone: null,             roles: ['F&B', 'Bev'],               ago: '5 weeks ago',   owner: 'GM – Harbor' },

  // ── Fired (2) ───────────────────────────────────────────────────────
  { id: 'c29', stage: 'fired',      name: 'Marcus Hill',       phone: null,             roles: ['Usher'],                    ago: '6 weeks ago',   owner: 'Operator – Civic',     note: 'Attendance' },
  { id: 'c30', stage: 'fired',      name: 'Sandra Lewis',      phone: null,             roles: ['Bev'],                      ago: '4 months ago',  owner: 'Operator – Levi\'s' },
]

const SORTS = ['First Name', 'Last Name', 'Stage time', 'Last activity']

export default function OnboardingView({ data, onDemo }) {
  const [activeTab, setActiveTab] = useState('all')
  const [sortLabel] = useState('First Name')
  const buzz = () => onDemo?.()

  const grouped = STAGES.map(s => ({
    ...s,
    cards: CANDIDATES.filter(c => c.stage === s.id),
  }))
  const totalCount = CANDIDATES.length

  return (
    <section className="onboarding" aria-label="Onboarding">
      <header className="onboarding-head">
        <button type="button" className="onboarding-head-icon" onClick={buzz} aria-label="Toggle nav">
          <Columns01Icon size={18} />
        </button>
        <span className="onboarding-head-mark" aria-hidden="true">
          <Grid01Icon size={18} />
        </span>
        <h1 className="onboarding-title">Applicant Tracking</h1>
        <div className="onboarding-head-spacer" />
        <button type="button" className="onboarding-head-link" onClick={buzz}>
          <FeedbackGlyph /> Feedback
        </button>
        <button type="button" className="onboarding-head-link" onClick={buzz}>
          <HelpGlyph /> Help
        </button>
        <button type="button" className="onboarding-head-link" onClick={buzz}>
          <FeedGlyph /> Feed
        </button>
        <button type="button" className="onboarding-head-iconbtn onboarding-head-iconbtn--ai" onClick={buzz} aria-label="Ask Teambridge">
          <TeambridgeAIIcon size={16} />
        </button>
      </header>

      <div className="onboarding-tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'all'}
          className={`onboarding-tab ${activeTab === 'all' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Users
          <span className="onboarding-tab-count">{totalCount}</span>
        </button>
        <button type="button" className="onboarding-tab onboarding-tab-add" aria-label="Add tab" onClick={buzz}>
          <PlusIcon size={14} />
        </button>
        <div className="onboarding-tabs-spacer" />
        <button type="button" className="onboarding-newuser" onClick={buzz}>
          <PlusIcon size={14} /> New User
        </button>
      </div>

      <div className="onboarding-toolbar">
        <button type="button" className="onboarding-tool" onClick={buzz}>
          <PlusIcon size={12} /> Add Filter
        </button>
        <div className="onboarding-toolbar-spacer" />
        <button type="button" className="onboarding-tool" onClick={buzz}>
          Board View
        </button>
        <span className="onboarding-tool-divider" />
        <span className="onboarding-tool-label">Group by</span>
        <button type="button" className="onboarding-tool onboarding-tool--pill" onClick={buzz}>
          Onboarding Stage
        </button>
        <button type="button" className="onboarding-tool" onClick={buzz}>
          <ListBulletIcon size={14} /> Columns
        </button>
        <span className="onboarding-tool-label">Sort</span>
        <button type="button" className="onboarding-tool onboarding-tool--pill" onClick={buzz}>
          <ArrowNarrowDownIcon size={12} /> {sortLabel}
        </button>
        <button type="button" className="onboarding-tool onboarding-tool--icon" onClick={buzz} aria-label="More">
          <DotsGlyph />
        </button>
      </div>

      <div className="onboarding-board">
        {grouped.map(col => (
          <section key={col.id} className="onboarding-col" style={{ '--col-accent': col.accent }}>
            <div className="onboarding-col-head">
              <span className="onboarding-col-title" style={{ color: col.accent }}>
                {col.label}
              </span>
              <span className="onboarding-col-count">{col.cards.length}</span>
            </div>
            <div className="onboarding-col-rule" aria-hidden="true" />
            <div className="onboarding-col-list">
              {col.cards.map(c => (
                <CandidateCard key={c.id} card={c} stage={col} onClick={buzz} />
              ))}
              <button type="button" className="onboarding-add-card" onClick={buzz}>
                <PlusSquareIcon size={14} /> Add card
              </button>
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

function CandidateCard({ card, stage, onClick }) {
  const tagAbbrev = (r) => {
    if (r === 'F&B') return 'F&B'
    if (r === 'Premium') return 'Premium'
    if (r === 'Engineer') return 'Eng'
    if (r === 'Loadin') return 'Load-in'
    if (r === 'Bev') return 'Bev'
    if (r === 'Box') return 'Box'
    return r
  }
  return (
    <button
      type="button"
      className="onboarding-card"
      onClick={onClick}
      style={{ background: stage.bg }}
    >
      <div className="onboarding-card-row">
        <span className="onboarding-card-name">{card.name}</span>
        {card.phone && <span className="onboarding-card-phone">{card.phone}</span>}
        {card.note && <span className="onboarding-card-note">({card.note})</span>}
      </div>
      {card.roles.length > 0 && (
        <div className="onboarding-card-roles">
          {card.roles.map((r, i) => {
            const tint = ROLE_TINTS[r] ?? { bg: '#F1F5F9', text: '#475569' }
            return (
              <span key={i} className="onboarding-card-role" style={{ color: tint.text }}>
                {tagAbbrev(r)}
              </span>
            )
          })}
        </div>
      )}
      <div className="onboarding-card-row onboarding-card-foot">
        <span className="onboarding-card-ago">{card.ago}</span>
        {card.owner && <span className="onboarding-card-owner">{card.owner}</span>}
      </div>
      <div className="onboarding-card-row onboarding-card-foot">
        <span className="onboarding-card-stage" style={{ color: stage.text }}>
          {stage.label}
        </span>
        {card.tier && (
          <span className={`onboarding-card-tier onboarding-card-tier--${card.tier.toLowerCase()}`}>
            {card.tier}
          </span>
        )}
        {card.tierOwner && <span className="onboarding-card-tierowner">{card.tierOwner}</span>}
        {card.shifts && card.shifts.map((s, i) => (
          <span key={i} className="onboarding-card-shift" style={{ color: stage.text }}>{s}</span>
        ))}
        {card.metrics && <span className="onboarding-card-metrics">{card.metrics}</span>}
      </div>
    </button>
  )
}

/* ── Tiny inline glyphs (no icon import for these) ──────────────────── */
function FeedbackGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H6a2 2 0 0 0-2 2v14l4-3h10a2 2 0 0 0 2-2v-3" />
      <path d="M18 2l4 4-7 7h-4v-4z" />
    </svg>
  )
}
function HelpGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4 2.4c-.8.5-1.5 1-1.5 2" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </svg>
  )
}
function FeedGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6"  x2="20" y2="6"  />
      <line x1="4" y1="12" x2="14" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}
function DotsGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5"  cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  )
}
