import { ChevronDownIcon } from '../../../src/components/icons/ChevronDownIcon.tsx'
import { ListBulletIcon }  from '../../../src/components/icons/ListBulletIcon.tsx'
import { Grid01Icon }      from '../../../src/components/icons/Grid01Icon.tsx'

const STATUS_META = {
  'active':         { label: 'Active',          tone: 'success' },
  'on-leave':       { label: 'On leave',        tone: 'warning' },
  'new-hire':       { label: 'New hire',        tone: 'info'    },
  'cert-expiring':  { label: 'Cert expiring',   tone: 'warning' },
  'ot-risk':        { label: 'Overtime risk',   tone: 'warning' },
  'pending':        { label: 'Pending review',  tone: 'info'    },
}

const COLUMNS = [
  { id: 'name',   label: 'Person' },
  { id: 'role',   label: 'Role' },
  { id: 'venue',  label: 'Home venue' },
  { id: 'hours',  label: 'Weekly hours' },
  { id: 'certs',  label: 'Certifications' },
  { id: 'status', label: 'Status' },
]

export default function PeopleList({ data, onDemo }) {
  const people = data.people
  if (!people) return null
  const buzz = () => onDemo?.()

  return (
    <section className="people" aria-label="People">
      <header className="people-head">
        <h1 className="people-title">People</h1>
        <div className="people-head-actions">
          <button type="button" className="people-head-icon-btn" onClick={buzz} aria-label="Open menu">
            <ListBulletIcon size={16} />
          </button>
        </div>
      </header>

      <div className="people-stats">
        {people.stats.map(s => (
          <div key={s.id} className={`people-stat people-stat-${s.tone}`}>
            <span className="people-stat-icon" aria-hidden="true">
              <StatGlyph tone={s.tone} />
            </span>
            <div className="people-stat-text">
              <div className="people-stat-label">{s.label}</div>
              <div className="people-stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="people-subhead">
        <h2 className="people-subtitle">All people</h2>
      </div>

      <div className="people-toolbar">
        <div className="people-search" role="search">
          <SearchGlyph />
          <input type="text" placeholder="Search…" onClick={buzz} onChange={() => {}} />
        </div>
        <button type="button" className="people-filter" onClick={buzz} aria-label="Filter">
          <FilterGlyph />
        </button>
        <div className="people-viewtoggle">
          <button type="button" className="people-viewtoggle-btn is-active" onClick={buzz} aria-label="List view">
            <ListBulletIcon size={14} />
          </button>
          <button type="button" className="people-viewtoggle-btn" onClick={buzz} aria-label="Grid view">
            <Grid01Icon size={14} />
          </button>
        </div>
      </div>

      <div className="people-table" role="table">
        <div className="people-table-head" role="row">
          {COLUMNS.map(c => (
            <button key={c.id} type="button" className="people-th" onClick={buzz}>
              {c.label} <ChevronDownIcon size={12} />
            </button>
          ))}
        </div>
        {people.rows.map(row => {
          const meta = STATUS_META[row.status] ?? STATUS_META.active
          return (
            <button key={row.id} type="button" className="people-row" onClick={buzz} role="row">
              <div className="people-cell people-cell-person">
                <span className="people-avatar" style={{ backgroundImage: `url(${row.avatar})` }} aria-hidden="true" />
                <span className="people-name">{row.name}</span>
              </div>
              <div className="people-cell">{row.role}</div>
              <div className="people-cell">{row.venue}</div>
              <div className="people-cell people-cell-hours">{row.hours}</div>
              <div className="people-cell">{row.certs}</div>
              <div className="people-cell">
                <span className={`people-status people-status-${meta.tone}`}>
                  <span className="people-status-dot" aria-hidden="true" />
                  {meta.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function StatGlyph({ tone }) {
  if (tone === 'warning') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8v4M12 16h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (tone === 'success') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12h4l3-8 4 16 3-8h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SearchGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function FilterGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
