import { useState } from 'react'
import { ChevronDownIcon }     from '../../../src/components/icons/ChevronDownIcon.tsx'
import { ChevronLeftIcon }     from '../../../src/components/icons/ChevronLeftIcon.tsx'
import { PlusIcon }            from '../../../src/components/icons/PlusIcon.tsx'
import { SearchSmIcon }        from '../../../src/components/icons/SearchSmIcon.tsx'
import { Home02Icon }          from '../../../src/components/icons/Home02Icon.tsx'
import { ClockIcon }           from '../../../src/components/icons/ClockIcon.tsx'
import { Trash03Icon }         from '../../../src/components/icons/Trash03Icon.tsx'
import { BookOpen01Icon }      from '../../../src/components/icons/BookOpen01Icon.tsx'
import { ClipboardCheckIcon }  from '../../../src/components/icons/ClipboardCheckIcon.tsx'
import { Target04Icon }        from '../../../src/components/icons/Target04Icon.tsx'
import { File05Icon }          from '../../../src/components/icons/File05Icon.tsx'
import { ListBulletIcon }      from '../../../src/components/icons/ListBulletIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * Policy Builder — mirrors policy.teambridge.dev "My policies" view
 * plus a click-into-folder detail screen with policy cards (status pill,
 * title, description, entity tag at the bottom). Mock data is
 * events-industry-weighted (Levi's Stadium / OT crisis context).
 * ────────────────────────────────────────────────────────────────────── */

const SIDEBAR_TOP = [
  { id: 'dashboard',  label: 'Dashboard',   Icon: Home02Icon },
  { id: 'mine',       label: 'My policies', Icon: FolderGlyph, active: true },
  { id: 'recent',     label: 'Recent',      Icon: ClockIcon },
  { id: 'deleted',    label: 'Deleted',     Icon: Trash03Icon },
]

const LIBRARY = [
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'holidays',   label: 'Holidays' },
  { id: 'break',      label: 'Break' },
  { id: 'job-qual',   label: 'Job Qualification' },
  { id: 'custom',     label: 'Custom' },
]

const POLICY_FOLDERS = [
  { id: 'union',     label: 'Union Laws',          Icon: BookOpen01Icon,      count: '6 policies',  sub: '5 sub-policies'  },
  { id: 'cred',      label: 'Credentialing',       Icon: ClipboardCheckIcon,  count: '17 policies', sub: '25 sub-policies' },
  { id: 'avail',     label: 'Availability',        Icon: CalendarGlyph,       count: '2 policies',  sub: '1 sub-policy'    },
  { id: 'sched',     label: 'Scheduling',          Icon: CalendarGlyph,       count: '10 policies', sub: '11 sub-policies' },
  { id: 'time',      label: 'Time Tracking',       Icon: ClockIcon,           count: '8 policies',  sub: '8 sub-policies'  },
  { id: 'pay-rules', label: 'Instant Pay Rules',   Icon: BoltGlyph,           count: '3 policies',  sub: '2 sub-policies'  },
  { id: 'radius',    label: 'Radius',              Icon: Target04Icon,        count: '1 policy',    sub: '0 sub-policies'  },
  { id: 'margin',    label: 'Margin Check',        Icon: FolderGlyph,         count: '2 policies',  sub: '1 sub-policy'    },
  { id: 'safety',    label: 'Safety & Compliance', Icon: ShieldGlyph,         count: '1 policy',    sub: '1 sub-policy'    },
  { id: 'sub',       label: 'Subcontractor',       Icon: FolderGlyph,         count: '3 policies',  sub: '2 sub-policies'  },
  { id: 'client',    label: 'Client Engagement',   Icon: FolderGlyph,         count: '2 policies',  sub: '4 sub-policies'  },
  { id: 'jobdist',   label: 'Job Distribution',    Icon: FolderGlyph,         count: '1 policy',    sub: '0 sub-policies'  },
  { id: 'shift-opt', label: 'Shift Optimization',  Icon: StarGlyph,           count: '4 policies',  sub: '4 sub-policies'  },
  { id: 'corp',      label: 'Corporate Contracts', Icon: File05Icon,          count: '1 policy',    sub: '0 sub-policies'  },
  { id: 'billing',   label: 'Billing Policy',      Icon: File05Icon,          count: '2 policies',  sub: '1 sub-policy'    },
  { id: 'admin',     label: 'Admin Rules',         Icon: Target04Icon,        count: '2 policies',  sub: '2 sub-policies'  },
  { id: 'overtime',  label: 'Overtime & Cap Enforcement', Icon: ClockIcon,    count: '5 policies',  sub: '3 sub-policies', highlight: true },
  { id: 'event-day', label: 'Event-Day Coverage',  Icon: CalendarGlyph,       count: '8 policies',  sub: '6 sub-policies'  },
]

/* ───── Entity-tag swatch palette (color + shape) ───── */
const SWATCH = {
  blue:   { color: '#1170ff', bg: '#dbeafe' },
  red:    { color: '#dc2626', bg: '#fee2e2' },
  green:  { color: '#16a34a', bg: '#dcfce7' },
  amber:  { color: '#d97706', bg: '#fef3c7' },
  purple: { color: '#7c3aed', bg: '#ede9fe' },
  teal:   { color: '#0d9488', bg: '#ccfbf1' },
}

/* ───── Mock policies inside each folder ───── */
const POLICIES_BY_FOLDER = {
  union: [
    { id: 'u1', status: 'Draft',  title: 'Hobby-Based Job Location Matching',
      desc: 'This policy aims to suggest or prioritize job locations based on declared worker interests and travel preferences.',
      entity: { name: 'Prioritize Locations',     swatch: 'blue', shape: 'square' } },
    { id: 'u2', status: 'Draft',  title: 'Overtime Distribution Fairness Policy',
      desc: 'This policy ensures equitable distribution of available overtime opportunities across the venue\'s union roster.',
      entity: { name: 'Equitable Overtime Allocator', swatch: 'red',  shape: 'hex' } },
    { id: 'u3', status: 'Active', title: 'Seniority-First Shift Bidding',
      desc: 'When a shift opens, offer it to qualified workers in seniority order before broadcasting to the wider pool.',
      entity: { name: 'Seniority Bidder',          swatch: 'purple', shape: 'square' } },
    { id: 'u4', status: 'Active', title: 'Mandatory Rest Window',
      desc: '11-hour minimum rest between consecutive shifts. Schedules that violate are auto-blocked at publish time.',
      entity: { name: 'Rest Window Enforcer',      swatch: 'green',  shape: 'circle' } },
    { id: 'u5', status: 'Active', title: 'Grievance Channel Routing',
      desc: 'Auto-route worker complaints to the right shop steward based on department + venue.',
      entity: { name: 'Steward Router',            swatch: 'amber',  shape: 'circle' } },
    { id: 'u6', status: 'Archived', title: '2024 CBA Wage Schedule',
      desc: 'Wage tier table from the prior collective bargaining agreement. Superseded by the 2026 CBA.',
      entity: { name: 'Wage Tier Lookup',          swatch: 'teal',   shape: 'square' } },
  ],
  overtime: [
    { id: 'ot1', status: 'Active', title: '40-Hour OT Cap',
      desc: 'Replace shifts that would push a worker over 40 hours/week by routing them through Nova\'s replacement workflow.',
      entity: { name: 'OT Replacement Flow',       swatch: 'red',   shape: 'hex' }, runs: '1.2k' },
    { id: 'ot2', status: 'Active', title: 'Daily 12-Hour Cap',
      desc: 'Hard stop on single shifts longer than 12 hours. Applies across all departments and venues.',
      entity: { name: 'Daily Cap Block',           swatch: 'amber', shape: 'circle' }, runs: '320' },
    { id: 'ot3', status: 'Active', title: 'Consecutive Days Limit',
      desc: 'Block scheduling on the 7th consecutive day for any worker. Override requires VP approval.',
      entity: { name: '7-Day Block',               swatch: 'amber', shape: 'circle' }, runs: '94' },
    { id: 'ot4', status: 'Active', title: 'OT Cost Threshold per Department',
      desc: 'When a department exceeds its weekly OT budget by 25%, escalate to ops lead and notify the GM.',
      entity: { name: 'OT Cost Escalator',         swatch: 'red',   shape: 'hex' }, runs: '47' },
    { id: 'ot5', status: 'Active', title: 'Holiday OT Multiplier',
      desc: '2× OT rate auto-applied to shifts on federal holidays and Niners home games. Surfaced in pay run.',
      entity: { name: 'Holiday Rate Applier',      swatch: 'purple', shape: 'square' }, runs: '12' },
    { id: 'ot6', status: 'Draft',  title: 'Voluntary OT Opt-In',
      desc: 'Workers must explicitly opt in each season to be considered for overtime. Auto-archives consent record.',
      entity: { name: 'OT Consent Tracker',        swatch: 'blue',  shape: 'square' }, runs: '0' },
  ],
  cred: [
    { id: 'c1', status: 'Active', title: 'Crowd-Manager Cert (≥40 hrs/event)',
      desc: 'Workers staffing 40+ hour event weeks must hold a current crowd-manager certification on file.',
      entity: { name: 'Cert Gate',                 swatch: 'green',  shape: 'circle' } },
    { id: 'c2', status: 'Active', title: 'TIPS Alcohol Service',
      desc: 'F&B staff serving alcohol require TIPS within the last 36 months. Auto-block ineligible scheduling.',
      entity: { name: 'TIPS Validator',            swatch: 'green',  shape: 'circle' } },
    { id: 'c3', status: 'Active', title: 'Bag-Check / Wand Operator',
      desc: 'Security staff at gates must hold the venue\'s wand-operator credential.',
      entity: { name: 'Gate Cert Check',           swatch: 'red',    shape: 'hex' } },
    { id: 'c4', status: 'Active', title: 'Premium Suite Service',
      desc: 'Hospitality staff in premium suites require the premium-service training within the last 12 months.',
      entity: { name: 'Premium Cert',              swatch: 'purple', shape: 'square' } },
    { id: 'c5', status: 'Draft',  title: 'First Aid / CPR Refresh',
      desc: 'Push CPR refresh reminders 30 days before expiration. Auto-block ineligible after 7-day grace.',
      entity: { name: 'CPR Reminder',              swatch: 'amber',  shape: 'circle' } },
  ],
  sched: [
    { id: 's1', status: 'Active', title: 'Niners Home-Game Surge',
      desc: 'Auto-stage 1.4× baseline staffing on home-game weekends, allocated by historical attendance.',
      entity: { name: 'Surge Allocator',           swatch: 'red',    shape: 'hex' } },
    { id: 's2', status: 'Active', title: 'Predictive Scheduling Notice',
      desc: '14-day advance notice required for all hourly schedules. Last-minute changes trigger predictive-pay calc.',
      entity: { name: 'Notice Tracker',            swatch: 'green',  shape: 'circle' } },
    { id: 's3', status: 'Active', title: 'Rotation Fairness',
      desc: 'Distribute weekend/late-night shifts evenly across the eligible roster on a rolling 8-week window.',
      entity: { name: 'Fairness Rotator',          swatch: 'purple', shape: 'square' } },
    { id: 's4', status: 'Active', title: 'Travel Buffer for Multi-Venue',
      desc: 'Workers scheduled across two venues in one day must have a 90-minute travel buffer between them.',
      entity: { name: 'Travel Buffer',             swatch: 'amber',  shape: 'circle' } },
  ],
}

const FALLBACK_POLICIES = [
  { id: 'p1', status: 'Active', title: 'Default rule',          desc: 'Baseline policy applied to this folder.', entity: { name: 'Rule Engine',   swatch: 'blue',  shape: 'square' } },
  { id: 'p2', status: 'Draft',  title: 'In-progress draft',     desc: 'Policy under review by the ops team.',     entity: { name: 'Review Queue', swatch: 'amber', shape: 'circle' } },
]

const STATUS_TONE = {
  Active:   'ok',
  Draft:    'warn',
  Archived: 'mute',
}

export default function PoliciesView({ onDemo }) {
  const [libOpen, setLibOpen]               = useState(true)
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const buzz = () => onDemo?.()

  const selectedFolder = POLICY_FOLDERS.find(f => f.id === selectedFolderId)

  return (
    <section className="policies" aria-label="Policy Builder">
      <aside className="policies-rail" aria-label="Policy navigation">
        <div className="policies-rail-head">
          <h2 className="policies-rail-title">Policies</h2>
          <div className="policies-rail-search">
            <SearchSmIcon size={14} />
            <input type="text" placeholder="Search…" onFocus={buzz} readOnly />
          </div>
        </div>

        <nav className="policies-rail-list">
          {SIDEBAR_TOP.map(item => (
            <button
              key={item.id}
              type="button"
              className={`policies-rail-item ${item.active ? 'is-active' : ''}`}
              onClick={() => { setSelectedFolderId(null); buzz() }}
            >
              <item.Icon size={16} /> {item.label}
            </button>
          ))}

          <button
            type="button"
            className="policies-rail-section"
            onClick={() => setLibOpen(o => !o)}
          >
            <BookOpen01Icon size={16} />
            <span>Library</span>
            <span className="policies-rail-section-chevron" data-open={libOpen}>
              <ChevronDownIcon size={14} />
            </span>
          </button>
          {libOpen && LIBRARY.map(it => (
            <button
              key={it.id}
              type="button"
              className="policies-rail-subitem"
              onClick={buzz}
            >
              {it.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="policies-main">
        {selectedFolder
          ? <FolderDetail folder={selectedFolder} onBack={() => setSelectedFolderId(null)} onDemo={buzz} />
          : <MyPoliciesGrid onSelect={setSelectedFolderId} onDemo={buzz} />
        }
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
 * My policies — grid of folder cards (default landing state)
 * ────────────────────────────────────────────────────────────────────── */
function MyPoliciesGrid({ onSelect, onDemo }) {
  return (
    <>
      <header className="policies-head">
        <h1 className="policies-title">My policies</h1>
        <button type="button" className="policies-btn policies-btn-primary" onClick={onDemo}>
          <PlusIcon size={14} /> New Folder
        </button>
      </header>

      <div className="policies-toolbar">
        <button type="button" className="policies-filter" onClick={onDemo}>
          All types <ChevronDownIcon size={12} />
        </button>
        <button type="button" className="policies-filter" onClick={onDemo}>
          Created date <ChevronDownIcon size={12} />
        </button>
        <div className="policies-toolbar-spacer" />
        <button type="button" className="policies-view-toggle is-active" onClick={onDemo} aria-label="Grid view">
          <GridGlyph />
        </button>
        <button type="button" className="policies-view-toggle" onClick={onDemo} aria-label="List view">
          <ListGlyph />
        </button>
      </div>

      <div className="policies-grid">
        {POLICY_FOLDERS.map(f => (
          <button
            key={f.id}
            type="button"
            className={`policy-card ${f.highlight ? 'policy-card--highlight' : ''}`}
            onClick={() => onSelect(f.id)}
          >
            <div className="policy-card-icon"><f.Icon size={20} /></div>
            <div className="policy-card-title">{f.label}</div>
            <div className="policy-card-meta">
              <span>{f.count}</span>
              <span className="policy-card-sub">({f.sub})</span>
            </div>
            {f.highlight && <span className="policy-card-tag">Active · Nova</span>}
          </button>
        ))}
      </div>
    </>
  )
}

/* ──────────────────────────────────────────────────────────────────────
 * Folder detail — clicked-into state with policy cards
 * ────────────────────────────────────────────────────────────────────── */
function FolderDetail({ folder, onBack, onDemo }) {
  const policies = POLICIES_BY_FOLDER[folder.id] ?? FALLBACK_POLICIES

  return (
    <>
      <header className="policies-detail-head">
        <button type="button" className="policies-detail-back" onClick={onBack} aria-label="Back to My policies">
          <ChevronLeftIcon size={18} />
        </button>
        <nav className="policies-detail-crumb" aria-label="Breadcrumb">
          <button type="button" className="policies-detail-crumb-link" onClick={onBack}>My policies</button>
          <span className="policies-detail-crumb-sep">/</span>
          <span className="policies-detail-crumb-current">{folder.label}</span>
        </nav>
        <div className="policies-detail-actions">
          <button type="button" className="policies-detail-new" onClick={onDemo}>
            <PlusIcon size={14} /> New
          </button>
          <button type="button" className="policies-detail-icon" onClick={onDemo} aria-label="Folder menu">
            <ListBulletIcon size={16} />
          </button>
        </div>
      </header>

      <div className="policies-toolbar">
        <button type="button" className="policies-filter" onClick={onDemo}>
          Last updated <ChevronDownIcon size={12} />
        </button>
        <div className="policies-detail-search">
          <SearchSmIcon size={14} />
          <input type="text" placeholder="Search…" onFocus={onDemo} readOnly />
        </div>
        <div className="policies-toolbar-spacer" />
        <button type="button" className="policies-view-toggle" onClick={onDemo} aria-label="List view">
          <ListGlyph />
        </button>
        <button type="button" className="policies-view-toggle is-active" onClick={onDemo} aria-label="Grid view">
          <GridGlyph />
        </button>
      </div>

      <div className="policy-detail-grid">
        {policies.map(p => (
          <button
            key={p.id}
            type="button"
            className="policy-detail-card"
            onClick={onDemo}
          >
            <div className="policy-detail-top">
              <span className={`policy-status policy-status--${STATUS_TONE[p.status] ?? 'mute'}`}>
                {p.status}
              </span>
              <span className="policy-detail-more" aria-hidden="true">
                <DotsGlyph />
              </span>
            </div>
            <div className="policy-detail-title">{p.title}</div>
            <div className="policy-detail-desc">{p.desc}</div>
            <div className="policy-detail-foot">
              <span
                className={`policy-detail-swatch policy-detail-swatch--${p.entity.shape}`}
                style={{ background: SWATCH[p.entity.swatch].bg, color: SWATCH[p.entity.swatch].color }}
                aria-hidden="true"
              />
              <span className="policy-detail-entity">{p.entity.name}</span>
              {p.runs && <span className="policy-detail-runs">{p.runs} runs</span>}
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

/* ──────────────────────────────────────────────────────────────────────
 * Inline glyphs
 * ────────────────────────────────────────────────────────────────────── */
function FolderGlyph({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  )
}
function CalendarGlyph({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  )
}
function ShieldGlyph({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
function BoltGlyph({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  )
}
function StarGlyph({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function GridGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3"  width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}
function ListGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8"  y1="6"  x2="21" y2="6"  />
      <line x1="8"  y1="12" x2="21" y2="12" />
      <line x1="8"  y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6"  r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </svg>
  )
}
function DotsGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5"  cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  )
}
