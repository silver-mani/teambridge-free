import { useState } from 'react'
import { ListBulletIcon }    from '../../../src/components/icons/ListBulletIcon.tsx'
import { TeambridgeAIIcon }  from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { SearchSmIcon }      from '../../../src/components/icons/SearchSmIcon.tsx'
import { ClockIcon }         from '../../../src/components/icons/ClockIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * Time Tracking — live map + clocked-in roster.
 *   Center pane: stylized Bay-Area map with venue markers and worker
 *   avatar pins. Right pane: list of who's currently on-shift, with
 *   their clock-in elapsed time and current state (clocked-in,
 *   on-break, late, idle).
 * The mock data is sized to support the same OT-crisis narrative the
 * rest of /sage/workforce tells — Levi's Stadium concentrates the most
 * staff, Civic Arena a smaller crew, with one outlier "off-site" pin.
 * ────────────────────────────────────────────────────────────────────── */

/* Santa Clara, CA — venues cluster within a ~12-block radius of Levi's
   Stadium so worker pins read as on-site staff, not stranded across
   the Bay. Coordinates are SVG-space percentages (0–100). */
const VENUES = [
  { id: 'levis',  label: "Levi's Stadium",         x: 48, y: 46, count: 14, accent: '#2746B5' },
  { id: 'civic',  label: 'Convention Center',      x: 58, y: 42, count: 8,  accent: '#0D9488' },
  { id: 'harbor', label: 'Tasman Hospitality Hub', x: 42, y: 56, count: 4,  accent: '#92400E' },
  { id: 'mobile', label: 'Mobile Crew',            x: 36, y: 62, count: 1,  accent: '#9D174D' },
]

const STATUS_META = {
  'clocked-in': { label: 'Clocked in',  tone: 'ok'   },
  'on-break':   { label: 'On break',    tone: 'warn' },
  'late':       { label: 'Late',        tone: 'bad'  },
  'idle':       { label: 'Idle',        tone: 'mute' },
}

/* Worker x/y values match their venue's anchor — the per-id hashOffset()
   spreads pins around the anchor so they don't overlap. All four venues
   sit within a few blocks of Levi's Stadium, so the cluster stays tight. */
const ROSTER = [
  // Levi's Stadium — the OT-crisis venue
  { id: 'miguel',  name: 'Miguel R.',     role: 'Event Lead',  venue: "Levi's Stadium",         status: 'clocked-in', elapsed: '6h 12m', x: 48, y: 46, color: '#1d4ed8',  initials: 'MR' },
  { id: 'diane',   name: 'Diane Kim',     role: 'F&B',         venue: "Levi's Stadium",         status: 'on-break',   elapsed: '4h 02m', x: 48, y: 46, color: '#166534',  initials: 'DK' },
  { id: 'maria',   name: 'Maria Cruz',    role: 'Bev Service', venue: "Levi's Stadium",         status: 'clocked-in', elapsed: '5h 48m', x: 48, y: 46, color: '#9d174d',  initials: 'MC' },
  { id: 'carlos',  name: 'Carlos Mendez', role: 'Premium',     venue: "Levi's Stadium",         status: 'clocked-in', elapsed: '7h 03m', x: 48, y: 46, color: '#5b21b6',  initials: 'CM' },
  { id: 'ravi',    name: 'Ravi Banerjee', role: 'Security',    venue: "Levi's Stadium",         status: 'clocked-in', elapsed: '6h 28m', x: 48, y: 46, color: '#92400e',  initials: 'RB' },
  { id: 'sofia',   name: 'Sofia Garcia',  role: 'Box Office',  venue: "Levi's Stadium",         status: 'clocked-in', elapsed: '4h 19m', x: 48, y: 46, color: '#0e7490',  initials: 'SG' },
  { id: 'amir',    name: 'Amir Naidu',    role: 'Cleaning',    venue: "Levi's Stadium",         status: 'idle',       elapsed: '0h 04m', x: 48, y: 46, color: '#475569',  initials: 'AN' },
  { id: 'david-k', name: 'David Kim',     role: 'Security',    venue: "Levi's Stadium",         status: 'clocked-in', elapsed: '5h 11m', x: 48, y: 46, color: '#9a3412',  initials: 'DK' },

  // Convention Center — smaller crew, just across Tasman from Levi's
  { id: 'jordan',  name: 'Jordan K.',     role: 'Usher',       venue: 'Convention Center',      status: 'clocked-in', elapsed: '3h 55m', x: 58, y: 42, color: '#2746b5',  initials: 'JK' },
  { id: 'rachel',  name: 'Rachel W.',     role: 'Usher',       venue: 'Convention Center',      status: 'clocked-in', elapsed: '3h 22m', x: 58, y: 42, color: '#1d4ed8',  initials: 'RW' },
  { id: 'tasha',   name: 'Tasha K.',      role: 'Bev Service', venue: 'Convention Center',      status: 'on-break',   elapsed: '2h 47m', x: 58, y: 42, color: '#166534',  initials: 'TK' },
  { id: 'marcus',  name: 'Marcus J.',     role: 'Usher',       venue: 'Convention Center',      status: 'late',       elapsed: '0h 09m', x: 58, y: 42, color: '#991b1b',  initials: 'MJ' },

  // Tasman Hospitality Hub — premium suites + load-in
  { id: 'priya',   name: 'Priya S.',      role: 'Load-in',     venue: 'Tasman Hospitality Hub', status: 'clocked-in', elapsed: '2h 14m', x: 42, y: 56, color: '#9d174d',  initials: 'PS' },
  { id: 'jasmine', name: 'Jasmine Park',  role: 'Premium',     venue: 'Tasman Hospitality Hub', status: 'clocked-in', elapsed: '3h 02m', x: 42, y: 56, color: '#5b21b6',  initials: 'JP' },

  // Mobile crew — supply run on Great America Pkwy
  { id: 'trevor',  name: 'Trevor Booth',  role: 'Security',    venue: 'Mobile Crew',            status: 'clocked-in', elapsed: '1h 48m', x: 36, y: 62, color: '#92400e',  initials: 'TB' },
]

const FILTERS = [
  { id: 'all',         label: 'All' },
  { id: 'clocked-in',  label: 'Clocked in' },
  { id: 'on-break',    label: 'On break' },
  { id: 'late',        label: 'Late' },
]

export default function TimeTracking({ data, onDemo, onToggleActivityDrawer, activityDrawerOpen }) {
  const [filter, setFilter] = useState('all')
  const [hoverId, setHoverId] = useState(null)
  const buzz = () => onDemo?.()

  const visible = filter === 'all' ? ROSTER : ROSTER.filter(r => r.status === filter)

  return (
    <section className="time-tracking" aria-label="Time Tracking">
      <header className="time-tracking-head">
        <div className="time-tracking-titleblock">
          <h1 className="time-tracking-title">Time Tracking</h1>
          <span className="time-tracking-meta">
            <span className="time-tracking-dot" aria-hidden="true" />
            {ROSTER.length} on shift right now · across {VENUES.length} venues
          </span>
        </div>
        <div className="time-tracking-actions">
          <button
            type="button"
            className={`time-tracking-icon-btn ${activityDrawerOpen ? 'is-active' : ''}`}
            onClick={onToggleActivityDrawer ?? buzz}
            aria-label={activityDrawerOpen ? 'Close activity drawer' : 'Open activity drawer'}
            aria-pressed={activityDrawerOpen ?? false}
          >
            <ListBulletIcon size={16} />
          </button>
          <button type="button" className="time-tracking-icon-btn time-tracking-icon-btn-ai" onClick={buzz} aria-label="Ask Teambridge">
            <TeambridgeAIIcon size={16} />
          </button>
        </div>
      </header>

      <div className="time-tracking-body">
        {/* Center: stylized map */}
        <div className="time-tracking-map" role="img" aria-label="Live worker locations">
          <MapBackdrop />
          {VENUES.map(v => (
            <div
              key={v.id}
              className="time-tracking-venue"
              style={{ left: `${v.x}%`, top: `${v.y}%`, '--venue-accent': v.accent }}
              title={`${v.label} — ${v.count} on shift`}
            >
              <span className="time-tracking-venue-ring" aria-hidden="true" />
              <span className="time-tracking-venue-pin" aria-hidden="true" />
              <span className="time-tracking-venue-label">
                {v.label}
                <span className="time-tracking-venue-count">{v.count}</span>
              </span>
            </div>
          ))}
          {ROSTER.map(r => (
            <button
              key={r.id}
              type="button"
              className={`time-tracking-pin status-${r.status} ${hoverId === r.id ? 'is-hover' : ''}`}
              style={{
                left: `${r.x + (hashOffset(r.id, 'x'))}%`,
                top:  `${r.y + (hashOffset(r.id, 'y'))}%`,
                background: r.color,
              }}
              onMouseEnter={() => setHoverId(r.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={buzz}
              aria-label={`${r.name} — ${STATUS_META[r.status].label}`}
            >
              {r.initials}
              <span className="time-tracking-pin-dot" aria-hidden="true" />
            </button>
          ))}
          <div className="time-tracking-mapscale" aria-hidden="true">
            <span>5 mi</span>
            <span className="time-tracking-mapscale-bar" />
          </div>
        </div>

        {/* Right rail: clocked-in list */}
        <aside className="time-tracking-rail" aria-label="Clocked-in employees">
          <div className="time-tracking-rail-head">
            <h2 className="time-tracking-rail-title">On shift now</h2>
            <span className="time-tracking-rail-count">{visible.length}</span>
          </div>
          <div className="time-tracking-rail-search">
            <SearchSmIcon size={14} />
            <input type="text" placeholder="Search staff…" onFocus={buzz} readOnly />
          </div>
          <div className="time-tracking-filters" role="tablist">
            {FILTERS.map(f => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`time-tracking-filter ${filter === f.id ? 'is-active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <ul className="time-tracking-list">
            {visible.map(r => {
              const meta = STATUS_META[r.status]
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    className={`time-tracking-row ${hoverId === r.id ? 'is-hover' : ''}`}
                    onMouseEnter={() => setHoverId(r.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onClick={buzz}
                  >
                    <span className="time-tracking-row-avatar" style={{ background: r.color }}>
                      {r.initials}
                    </span>
                    <span className="time-tracking-row-text">
                      <span className="time-tracking-row-name">{r.name}</span>
                      <span className="time-tracking-row-meta">{r.role} · {r.venue}</span>
                    </span>
                    <span className="time-tracking-row-end">
                      <span className={`time-tracking-status time-tracking-status--${meta.tone}`}>
                        {meta.label}
                      </span>
                      <span className="time-tracking-elapsed">
                        <ClockIcon size={11} /> {r.elapsed}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
            {!visible.length && (
              <li className="time-tracking-empty">No one matches that filter right now.</li>
            )}
          </ul>
        </aside>
      </div>
    </section>
  )
}

/* Tiny stable-hash → small offset so multiple workers at the same venue
   pin spread out a bit instead of stacking exactly on top of each other.
   ±6% gives the 8 Levi's workers enough room without drifting off the
   stadium's footprint on the map. */
function hashOffset(id, salt) {
  const s = `${salt}:${id}`
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return ((h % 120) - 60) / 10 // ~ ±6%
}

/* Stylized Santa Clara, CA map — flat Silicon-Valley street grid plus
   the few landmarks near Levi's Stadium (Central Park, Great America
   Pkwy, Tasman Dr, Hwy 101). No large body of water — Santa Clara is
   inland, so worker pins should never end up "in the bay". */
function MapBackdrop() {
  return (
    <svg className="time-tracking-mapbg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        {/* Tighter street grid that reads as Silicon Valley blocks. */}
        <pattern id="streets" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M 0 0 L 5 0 M 0 0 L 0 5" stroke="rgba(15,17,20,0.05)" strokeWidth="0.35" />
        </pattern>
      </defs>

      {/* Base land tone — neutral inland tan/green. */}
      <rect width="100" height="100" fill="#eef3ee" />
      <rect width="100" height="100" fill="url(#streets)" />

      {/* Greenspace — Central Park (south of Levi's) and Ulistac
          Natural Area (east of the stadium). */}
      <ellipse cx="42" cy="74" rx="20" ry="10" fill="#d2e6c9" opacity="0.75" />
      <ellipse cx="74" cy="56" rx="10" ry="7"  fill="#d2e6c9" opacity="0.7" />
      <ellipse cx="20" cy="22" rx="11" ry="7"  fill="#d2e6c9" opacity="0.5" />

      {/* Guadalupe River — thin ribbon, well east of the venue cluster
          so it adds context without putting any pins in water. */}
      <path d="M 88 0 C 86 20 90 40 84 60 C 78 80 86 92 84 100"
            stroke="#bcdaee" strokeWidth="1.6" fill="none" opacity="0.85" />

      {/* Hwy 101 — diagonal across the north, with a gentle bend. */}
      <path d="M 0 28 Q 30 22 52 26 T 100 18"
            stroke="#f3d27b" strokeWidth="2.2" fill="none" opacity="0.85" />
      <path d="M 0 28 Q 30 22 52 26 T 100 18"
            stroke="#fff" strokeWidth="0.4" strokeDasharray="1.6 2" fill="none" opacity="0.9" />

      {/* Tasman Dr — east-west, runs right past the stadium cluster. */}
      <path d="M 0 50 Q 30 48 60 50 T 100 50"
            stroke="#f6e2a8" strokeWidth="1.4" fill="none" opacity="0.9" />

      {/* Great America Pkwy — north-south, threads between Levi's and
          the convention center. */}
      <path d="M 53 0 Q 51 30 53 60 T 53 100"
            stroke="#f6e2a8" strokeWidth="1.4" fill="none" opacity="0.9" />

      {/* San Tomas Expressway — west of the cluster. */}
      <path d="M 28 0 Q 30 50 26 100"
            stroke="#f6e2a8" strokeWidth="1.0" fill="none" opacity="0.85" />
    </svg>
  )
}
