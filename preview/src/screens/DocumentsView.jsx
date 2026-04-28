import { useState } from 'react'
import { ListBulletIcon }    from '../../../src/components/icons/ListBulletIcon.tsx'
import { TeambridgeAIIcon }  from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { SearchSmIcon }      from '../../../src/components/icons/SearchSmIcon.tsx'
import { File05Icon }        from '../../../src/components/icons/File05Icon.tsx'
import { File04Icon }        from '../../../src/components/icons/File04Icon.tsx'
import { ClipboardCheckIcon } from '../../../src/components/icons/ClipboardCheckIcon.tsx'
import { BookOpen01Icon }    from '../../../src/components/icons/BookOpen01Icon.tsx'
import { CurrencyDollarIcon } from '../../../src/components/icons/CurrencyDollarIcon.tsx'
import { CloudUploadIcon }   from '../../../src/components/icons/CloudUploadIcon.tsx'
import { PlusIcon }          from '../../../src/components/icons/PlusIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * Documents — workforce document hub: contracts, handbooks, tax forms,
 * policy acknowledgments. Folder grid + recent activity list.
 * ────────────────────────────────────────────────────────────────────── */

const FOLDERS = [
  { id: 'contracts', label: 'Contracts',          count: 142, sub: '38 expiring this quarter', tint: { bg: '#E0EAFF', fg: '#2746B5' }, Icon: File05Icon         },
  { id: 'handbooks', label: 'Handbooks',          count: 6,   sub: '3 by venue · 3 corporate', tint: { bg: '#DCFCE7', fg: '#166534' }, Icon: BookOpen01Icon     },
  { id: 'onboard',   label: 'Onboarding',         count: 24,  sub: 'I-9, W-4, direct deposit', tint: { bg: '#FEF3C7', fg: '#92400E' }, Icon: ClipboardCheckIcon },
  { id: 'tax',       label: 'Tax Forms',          count: 312, sub: '2025 W-2s · 1099s',         tint: { bg: '#FCE7F3', fg: '#9D174D' }, Icon: CurrencyDollarIcon },
  { id: 'policies',  label: 'Policy Acks',        count: 58,  sub: '12 pending acknowledgment', tint: { bg: '#EDE9FE', fg: '#5B21B6' }, Icon: ClipboardCheckIcon },
  { id: 'shared',    label: 'Shared Resources',   count: 41,  sub: 'Manuals, training videos',  tint: { bg: '#CCFBF1', fg: '#0D9488' }, Icon: File04Icon         },
]

const RECENT = [
  { id: 'd1', name: '2026 Niners-Game Operating Plan v3.pdf',     who: 'Operations · Sera (AI assist)', when: '12m ago', kind: 'PDF', size: '2.1 MB' },
  { id: 'd2', name: 'Crowd Manager Cert — Diego P. (renewed).jpg', who: 'Credentialing · uploaded by Diego', when: '38m ago', kind: 'Image', size: '480 KB' },
  { id: 'd3', name: 'Sat Apr 26 — Premium Hospitality SOP.docx', who: 'Premium Suite Service · approved', when: '1h ago', kind: 'Doc', size: '142 KB' },
  { id: 'd4', name: 'Q2 Payroll Calendar — Levi\'s Stadium.xlsx', who: 'Payroll · finalized',   when: '2h ago', kind: 'Sheet', size: '88 KB'  },
  { id: 'd5', name: 'TIPS Refresh — Tasha K. completed.pdf',     who: 'Credentialing',          when: '4h ago', kind: 'PDF', size: '512 KB' },
  { id: 'd6', name: 'OT-Cap Policy — May 2026 update.pdf',       who: 'Policy · pending 12 acks', when: '5h ago', kind: 'PDF', size: '316 KB' },
]

export default function DocumentsView({ data, onDemo, onToggleActivityDrawer, activityDrawerOpen }) {
  const [query, setQuery] = useState('')
  const buzz = () => onDemo?.()

  return (
    <section className="documents" aria-label="Documents">
      <header className="documents-head">
        <div>
          <h1 className="documents-title">Documents</h1>
          <p className="documents-sub">{FOLDERS.reduce((n, f) => n + f.count, 0)} files across {FOLDERS.length} folders.</p>
        </div>
        <div className="documents-actions">
          <button type="button" className="documents-btn" onClick={buzz}>
            <CloudUploadIcon size={14} /> Upload
          </button>
          <button type="button" className="documents-btn documents-btn-dark" onClick={buzz}>
            <PlusIcon size={14} /> New folder
          </button>
          <button
            type="button"
            className={`documents-icon-btn ${activityDrawerOpen ? 'is-active' : ''}`}
            onClick={onToggleActivityDrawer ?? buzz}
            aria-label={activityDrawerOpen ? 'Close activity drawer' : 'Open activity drawer'}
            aria-pressed={activityDrawerOpen ?? false}
          >
            <ListBulletIcon size={16} />
          </button>
          <button type="button" className="documents-icon-btn documents-icon-btn-ai" onClick={buzz} aria-label="Ask Teambridge">
            <TeambridgeAIIcon size={16} />
          </button>
        </div>
      </header>

      <div className="documents-toolbar">
        <div className="documents-search" role="search">
          <SearchSmIcon size={14} />
          <input type="text" placeholder="Search documents…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="documents-folders">
        {FOLDERS.map(f => {
          const Icon = f.Icon
          return (
            <button key={f.id} type="button" className="documents-folder" onClick={buzz}>
              <span className="documents-folder-icon" style={{ background: f.tint.bg, color: f.tint.fg }} aria-hidden="true">
                <Icon size={18} />
              </span>
              <span className="documents-folder-text">
                <span className="documents-folder-label">{f.label}</span>
                <span className="documents-folder-meta">{f.count} files · {f.sub}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="documents-recent">
        <h2 className="documents-recent-title">Recent activity</h2>
        <ul className="documents-recent-list">
          {RECENT.map(r => (
            <li key={r.id}>
              <button type="button" className="documents-recent-row" onClick={buzz}>
                <span className="documents-recent-icon" aria-hidden="true">
                  <File05Icon size={14} />
                </span>
                <span className="documents-recent-text">
                  <span className="documents-recent-name">{r.name}</span>
                  <span className="documents-recent-meta">{r.who}</span>
                </span>
                <span className="documents-recent-end">
                  <span className="documents-recent-kind">{r.kind}</span>
                  <span className="documents-recent-size">{r.size}</span>
                  <span className="documents-recent-when">{r.when}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
