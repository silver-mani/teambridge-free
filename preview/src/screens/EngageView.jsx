import { useState } from 'react'
import { ChevronDownIcon }     from '../../../src/components/icons/ChevronDownIcon.tsx'
import { PlusIcon }            from '../../../src/components/icons/PlusIcon.tsx'
import { SearchSmIcon }        from '../../../src/components/icons/SearchSmIcon.tsx'
import { CheckIcon }           from '../../../src/components/icons/CheckIcon.tsx'
import { TeambridgeAIIcon }    from '../../../src/components/icons/TeambridgeAIIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * Engage / Communications module — 3-pane chat for ops ↔ staff comms.
 * Mirrors the screenshot pattern (departments rail · thread list · open
 * conversation), populated with Levi's-Stadium-flavored conversations
 * about the very OT crisis the rest of the demo is solving.
 * ────────────────────────────────────────────────────────────────────── */

const DEPARTMENTS = [
  { id: 'sched',  label: 'Scheduling',     unread: 3, active: true },
  { id: 'pay',    label: 'Payroll',        unread: 0 },
  { id: 'hr',     label: 'Human Resources', unread: 0 },
  { id: 'admin',  label: 'Admin Team',     unread: 0 },
  { id: 'cred',   label: 'Credentialing',  unread: 1 },
  { id: 'comp',   label: 'Compliance',     unread: 0 },
  { id: 'pers',   label: 'Personal',       unread: 0 },
]

const CONVERSATIONS = [
  {
    id: 'miguel',
    name: 'Miguel Rivera',
    initials: 'MR',
    avatarColor: '#dbeafe',
    avatarTone: '#1d4ed8',
    when: 'now',
    preview: 'Sera (Schedule Coordinator): Heads up — you\'re projecting 46 hrs this week…',
    active: true,
  },
  {
    id: 'marcus',
    name: 'Marcus Johnson',
    initials: 'MJ',
    avatarColor: '#fef3c7',
    avatarTone: '#92400e',
    when: '4m',
    preview: 'Sera: Picking up Saturday\'s gate 3 will trip your OT cap. Want me to find a swap?',
  },
  {
    id: 'priya',
    name: 'Priya Shah',
    initials: 'PS',
    avatarColor: '#fce7f3',
    avatarTone: '#9d174d',
    when: '12m',
    preview: 'Sera: 5 AM load-in moved to 6 AM. Confirm receipt?',
  },
  {
    id: 'diane',
    name: 'Diane Kim',
    initials: 'DK',
    avatarColor: '#dcfce7',
    avatarTone: '#166534',
    when: '38m',
    preview: 'Sera: Two F&B shifts opened up Sun afternoon if you want hours.',
  },
  {
    id: 'carlos',
    name: 'Carlos Mendez',
    initials: 'CM',
    avatarColor: '#ede9fe',
    avatarTone: '#5b21b6',
    when: '1h',
    preview: 'Sera: Premium suite head count revised — extra 6 attendants needed Sat 4 PM.',
  },
  {
    id: 'jordan',
    name: 'Jordan Kowalski',
    initials: 'JK',
    avatarColor: '#fee2e2',
    avatarTone: '#991b1b',
    when: '2h',
    preview: 'Sera: Confirming you\'re OK to swap into Marcus\'s Friday gate 3 shift?',
  },
  {
    id: 'rachel',
    name: 'Rachel Williams',
    initials: 'RW',
    avatarColor: '#cffafe',
    avatarTone: '#0e7490',
    when: '3h',
    preview: 'Sera: Sandra cancelled — can you take Saturday 7p at Civic? Same role, same pay.',
  },
  {
    id: 'david',
    name: 'David Kim',
    initials: 'DK',
    avatarColor: '#fff7ed',
    avatarTone: '#9a3412',
    when: '6h',
    preview: 'Sera: Hours fairness check — you\'ve been on 5 in a row. Take Sun off?',
  },
  {
    id: 'broadcast',
    name: 'Niners Game-Day Brief',
    initials: 'NF',
    avatarColor: '#0a0a0a',
    avatarTone: '#fff',
    when: '8h',
    preview: 'Broadcast to 142 Event Staff · Levi\'s Stadium gates open at 4:30 PM.',
    isBroadcast: true,
  },
]

// The thread shown in the right pane — Miguel R., the lead OT-risk
// employee from the Sage CFO dashboard handoff.
const MIGUEL_THREAD = [
  { who: 'sera',   when: 'Yesterday 4:12 PM', text: "Heads up — you\'re projecting **46 hrs** this week between Civic Arena (32) and the Saturday Niners home game (14). That puts you 6 hrs over the OT cap." },
  { who: 'miguel', when: 'Yesterday 4:18 PM', text: "ya I saw. didn't realize the niners game was on me too" },
  { who: 'sera',   when: 'Yesterday 4:19 PM', text: "Got it. I have **two options** that keep you under the cap and don\'t cost you any money." },
  { who: 'sera',   when: 'Yesterday 4:19 PM',
    text: "**Option A** — Move the Saturday 4–9 PM gate 3 shift to Jordan K. (28 hrs this week, gate 3 qualified, 4.9 rating). You stay at 32 hrs, no pay change.\n\n**Option B** — Split it: keep your Saturday 4–6 PM brief, hand 6–9 PM to Jordan. You finish at 34 hrs, still 6 hrs of room.",
    quoteAttachment: true },
  { who: 'miguel', when: 'Today 8:54 AM',     text: "go with option A. Jordan's solid" },
  { who: 'sera',   when: 'Today 8:55 AM',     text: "Done. Jordan accepted in **47 seconds**. You\'re back to 32 hrs and the OT cap is restored. Thanks Miguel.", confirmed: true },
]

export default function EngageView({ onDemo }) {
  const [activeDept, setActiveDept] = useState('sched')
  const [activeConv, setActiveConv] = useState('miguel')
  const buzz = () => onDemo?.()

  const conv = CONVERSATIONS.find(c => c.id === activeConv) ?? CONVERSATIONS[0]

  return (
    <section className="engage" aria-label="Engage">
      {/* ───── Departments rail ───── */}
      <aside className="engage-rail" aria-label="Departments">
        <div className="engage-rail-head">
          <h2 className="engage-rail-title">Communications</h2>
        </div>
        <div className="engage-rail-section">
          <button type="button" className="engage-rail-section-toggle">
            <span>Departments</span>
            <ChevronDownIcon size={12} />
          </button>
          <div className="engage-rail-list">
            {DEPARTMENTS.map(d => (
              <button
                key={d.id}
                type="button"
                className={`engage-rail-item ${activeDept === d.id ? 'is-active' : ''}`}
                onClick={() => setActiveDept(d.id)}
              >
                <span className="engage-rail-icon" aria-hidden="true">
                  <DeptGlyph />
                </span>
                <span className="engage-rail-label">{d.label}</span>
                {d.unread > 0 && (
                  <span className="engage-rail-badge">{d.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="engage-rail-section">
          <button type="button" className="engage-rail-section-toggle">
            <span>Broadcast</span>
            <ChevronDownIcon size={12} />
          </button>
          <div className="engage-rail-list">
            <button type="button" className="engage-rail-item" onClick={buzz}>
              <span className="engage-rail-icon" aria-hidden="true">
                <SendGlyph />
              </span>
              <span className="engage-rail-label">Sent</span>
            </button>
          </div>
        </div>

        <div className="engage-rail-foot">
          <button type="button" className="engage-rail-foot-btn" onClick={buzz}>
            <SettingsGlyph /> Department Settings
          </button>
        </div>
      </aside>

      {/* ───── Conversation list ───── */}
      <div className="engage-list" aria-label="Conversations">
        <div className="engage-list-head">
          <button type="button" className="engage-list-sort" onClick={buzz}>
            Sort: <b>All</b> <ChevronDownIcon size={12} />
          </button>
          <button type="button" className="engage-list-sort" onClick={buzz}>
            Filter: <b>All</b> <ChevronDownIcon size={12} />
          </button>
          <button type="button" className="engage-list-icon" onClick={buzz} aria-label="New conversation">
            <PlusIcon size={14} />
          </button>
        </div>
        <div className="engage-list-search">
          <SearchSmIcon size={14} />
          <input type="text" placeholder="Search…" onFocus={buzz} readOnly />
        </div>

        <div className="engage-list-items">
          {CONVERSATIONS.map(c => (
            <button
              key={c.id}
              type="button"
              className={`engage-conv ${activeConv === c.id ? 'is-active' : ''}`}
              onClick={() => setActiveConv(c.id)}
            >
              <span
                className="engage-conv-avatar"
                style={{ background: c.avatarColor, color: c.avatarTone }}
              >
                {c.initials}
              </span>
              <div className="engage-conv-body">
                <div className="engage-conv-head">
                  <div className="engage-conv-name">{c.name}</div>
                  <div className="engage-conv-when">{c.when}</div>
                </div>
                <div className="engage-conv-preview">{c.preview}</div>
              </div>
            </button>
          ))}
        </div>

        <button type="button" className="engage-list-cta" onClick={buzz}>
          New Broadcast
        </button>
      </div>

      {/* ───── Active thread ───── */}
      <div className="engage-thread" aria-label="Conversation">
        <header className="engage-thread-head">
          <span
            className="engage-conv-avatar"
            style={{ background: conv.avatarColor, color: conv.avatarTone }}
          >
            {conv.initials}
          </span>
          <div className="engage-thread-titleblock">
            <div className="engage-thread-name">{conv.name}</div>
            <div className="engage-thread-sub">Last message {MIGUEL_THREAD.at(-1).when}</div>
          </div>
          <div className="engage-thread-actions">
            <button type="button" className="engage-thread-confirm" onClick={buzz} aria-label="Mark resolved">
              <CheckIcon size={14} />
              <ChevronDownIcon size={12} />
            </button>
            <button type="button" className="engage-thread-profile" onClick={buzz}>
              View Profile
            </button>
          </div>
        </header>

        <div className="engage-thread-body">
          <div className="engage-thread-day">Today, Apr 24 2026</div>

          {MIGUEL_THREAD.map((m, i) => (
            <ThreadMessage key={i} message={m} sender={conv} />
          ))}
        </div>

        <div className="engage-thread-input">
          <button type="button" className="engage-thread-input-add" onClick={buzz} aria-label="Attach">
            <PlusIcon size={14} />
          </button>
          <div className="engage-thread-input-text">
            <div className="engage-thread-input-placeholder">Send Message</div>
            <div className="engage-thread-input-meta">0 words</div>
          </div>
          <button type="button" className="engage-thread-input-send" onClick={buzz} aria-label="Send">
            <SendGlyph2 />
          </button>
        </div>
      </div>
    </section>
  )
}

function ThreadMessage({ message, sender }) {
  const isAgent = message.who === 'sera'
  return (
    <div className={`engage-msg ${isAgent ? 'engage-msg--agent' : 'engage-msg--peer'}`}>
      {!isAgent && (
        <span
          className="engage-conv-avatar engage-msg-avatar"
          style={{ background: sender.avatarColor, color: sender.avatarTone }}
        >
          {sender.initials}
        </span>
      )}
      <div className="engage-msg-stack">
        <div className={`engage-msg-bubble ${isAgent ? 'engage-msg-bubble--agent' : ''}`}>
          {message.text.split('\n').map((line, idx) => (
            <p key={idx} dangerouslySetInnerHTML={{ __html: renderInline(line) }} />
          ))}
          {message.quoteAttachment && (
            <div className="engage-msg-attachment">
              <div className="engage-msg-attachment-title">2 swap proposals · Saturday Apr 25</div>
              <div className="engage-msg-attachment-meta">Auto-drafted by Nova · OT-cap protected · 0 pay delta</div>
            </div>
          )}
        </div>
        <div className={`engage-msg-foot ${isAgent ? 'is-agent' : ''}`}>
          <span>{isAgent ? 'Delivered' : 'Sent'} {message.when}</span>
          {isAgent && <span>· Sera (Schedule Coordinator) · In-App</span>}
          {message.confirmed && <span className="engage-msg-confirmed"><CheckIcon size={11} /></span>}
        </div>
      </div>
      {isAgent && (
        <span className="engage-conv-avatar engage-msg-avatar engage-msg-avatar--agent" aria-hidden="true">
          <TeambridgeAIIcon size={14} />
        </span>
      )}
    </div>
  )
}

// Tiny markdown-ish: **bold** only.
function renderInline(s) {
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

/* Inline glyphs */
function DeptGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function SendGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}
function SendGlyph2() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
    </svg>
  )
}
function SettingsGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
