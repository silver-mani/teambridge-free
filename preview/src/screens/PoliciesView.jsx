import { useState } from 'react'
import { ChevronDownIcon }     from '../../../src/components/icons/ChevronDownIcon.tsx'
import { PlusIcon }            from '../../../src/components/icons/PlusIcon.tsx'
import { SearchSmIcon }        from '../../../src/components/icons/SearchSmIcon.tsx'
import { Home02Icon }          from '../../../src/components/icons/Home02Icon.tsx'
import { ClockIcon }           from '../../../src/components/icons/ClockIcon.tsx'
import { Trash03Icon }         from '../../../src/components/icons/Trash03Icon.tsx'
import { BookOpen01Icon }      from '../../../src/components/icons/BookOpen01Icon.tsx'
import { ClipboardCheckIcon }  from '../../../src/components/icons/ClipboardCheckIcon.tsx'
import { Target04Icon }        from '../../../src/components/icons/Target04Icon.tsx'
import { File05Icon }          from '../../../src/components/icons/File05Icon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * Policy Builder — mirrors policy.teambridge.dev "My policies" view.
 * Folders are mocked but events-industry weighted (Levi's-style venue
 * staffing context) so the feel matches the rest of the demo.
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

export default function PoliciesView({ onDemo }) {
  const [libOpen, setLibOpen] = useState(true)
  const buzz = () => onDemo?.()

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
              onClick={buzz}
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
        <header className="policies-head">
          <h1 className="policies-title">My policies</h1>
          <button type="button" className="policies-btn policies-btn-primary" onClick={buzz}>
            <PlusIcon size={14} /> New Folder
          </button>
        </header>

        <div className="policies-toolbar">
          <button type="button" className="policies-filter" onClick={buzz}>
            All types <ChevronDownIcon size={12} />
          </button>
          <button type="button" className="policies-filter" onClick={buzz}>
            Created date <ChevronDownIcon size={12} />
          </button>
          <div className="policies-toolbar-spacer" />
          <button type="button" className="policies-view-toggle is-active" onClick={buzz} aria-label="Grid view">
            <GridGlyph />
          </button>
          <button type="button" className="policies-view-toggle" onClick={buzz} aria-label="List view">
            <ListGlyph />
          </button>
        </div>

        <div className="policies-grid">
          {POLICY_FOLDERS.map(f => (
            <button
              key={f.id}
              type="button"
              className={`policy-card ${f.highlight ? 'policy-card--highlight' : ''}`}
              onClick={buzz}
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
      </div>
    </section>
  )
}

/* Inline glyphs — keep here rather than scattering one-off icons into
   the shared components/icons directory. */
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
