import { useState } from 'react'
import { ChevronDownIcon }     from '../../../src/components/icons/ChevronDownIcon.tsx'
import { PlusIcon }            from '../../../src/components/icons/PlusIcon.tsx'
import { SearchSmIcon }        from '../../../src/components/icons/SearchSmIcon.tsx'
import { CheckIcon }           from '../../../src/components/icons/CheckIcon.tsx'
import { TeambridgeAIIcon }    from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ListBulletIcon }      from '../../../src/components/icons/ListBulletIcon.tsx'
import { ClockIcon }           from '../../../src/components/icons/ClockIcon.tsx'
import { CoinsHandIcon }       from '../../../src/components/icons/CoinsHandIcon.tsx'
import { Users03Icon }         from '../../../src/components/icons/Users03Icon.tsx'
import { SettingsGearIcon }    from '../../../src/components/icons/SettingsGearIcon.tsx'
import { ClipboardCheckIcon }  from '../../../src/components/icons/ClipboardCheckIcon.tsx'
import { CheckCircleIcon }     from '../../../src/components/icons/CheckCircleIcon.tsx'
import { Mail01Icon }          from '../../../src/components/icons/Mail01Icon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * Engage / Communications module — 3-pane chat for ops ↔ staff comms.
 * Mirrors the screenshot pattern (departments rail · thread list · open
 * conversation), populated with Levi's-Stadium-flavored conversations
 * about the very OT crisis the rest of the demo is solving.
 * ────────────────────────────────────────────────────────────────────── */

/* Each department gets a tinted avatar — color + symbol pair so the rail
   reads as a series of small icons instead of the same generic glyph
   over and over. Tints picked from the existing semantic-color palette
   so they sit comfortably alongside the rest of the UI. */
const DEPARTMENTS = [
  { id: 'sched',  label: 'Scheduling',      unread: 3, active: true,
    Icon: ClockIcon,           tint: { bg: '#E0EAFF', fg: '#2746B5' } },
  { id: 'pay',    label: 'Payroll',         unread: 0,
    Icon: CoinsHandIcon,       tint: { bg: '#DCFCE7', fg: '#166534' } },
  { id: 'hr',     label: 'Human Resources', unread: 0,
    Icon: Users03Icon,         tint: { bg: '#EDE9FE', fg: '#5B21B6' } },
  { id: 'admin',  label: 'Admin Team',      unread: 0,
    Icon: SettingsGearIcon,    tint: { bg: '#F1F5F9', fg: '#475569' } },
  { id: 'cred',   label: 'Credentialing',   unread: 1,
    Icon: ClipboardCheckIcon,  tint: { bg: '#FEF3C7', fg: '#92400E' } },
  { id: 'comp',   label: 'Compliance',      unread: 0,
    Icon: CheckCircleIcon,     tint: { bg: '#CCFBF1', fg: '#0D9488' } },
  { id: 'pers',   label: 'Personal',        unread: 0,
    Icon: Mail01Icon,          tint: { bg: '#FCE7F3', fg: '#9D174D' } },
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

/* Per-conversation threads. Each conversation in the list has its own
 * messages array so clicking through the list renders a unique chat
 * (Marcus J., Priya S., etc.), not Miguel's thread repeated. Sera is
 * the agent voice across all threads — same persona, different worker. */
const THREADS = {
  miguel: [
    { who: 'sera',   when: 'Yesterday 4:12 PM', text: "Heads up — you\'re projecting **46 hrs** this week between Civic Arena (32) and the Saturday Niners home game (14). That puts you 6 hrs over the OT cap." },
    { who: 'peer',   when: 'Yesterday 4:18 PM', text: "ya I saw. didn't realize the niners game was on me too" },
    { who: 'sera',   when: 'Yesterday 4:19 PM', text: "Got it. I have **two options** that keep you under the cap and don\'t cost you any money." },
    { who: 'sera',   when: 'Yesterday 4:19 PM',
      text: "**Option A** — Move the Saturday 4–9 PM gate 3 shift to Jordan K. (28 hrs this week, gate 3 qualified, 4.9 rating). You stay at 32 hrs, no pay change.\n\n**Option B** — Split it: keep your Saturday 4–6 PM brief, hand 6–9 PM to Jordan. You finish at 34 hrs, still 6 hrs of room.",
      quoteAttachment: { title: '2 swap proposals · Saturday Apr 25', meta: 'Auto-drafted by Nova · OT-cap protected · 0 pay delta' } },
    { who: 'peer',   when: 'Today 8:54 AM',     text: "go with option A. Jordan's solid" },
    { who: 'sera',   when: 'Today 8:55 AM',     text: "Done. Jordan accepted in **47 seconds**. You\'re back to 32 hrs and the OT cap is restored. Thanks Miguel.", confirmed: true },
  ],
  marcus: [
    { who: 'sera', when: 'Yesterday 6:02 PM', text: "Picking up Saturday\'s gate 3 (4–9 PM) would put you at **44 hrs** — that trips your OT cap. Want me to find a swap?" },
    { who: 'peer', when: 'Yesterday 6:08 PM', text: "I want the hours tbh. Anything else I can pick up later in the week?" },
    { who: 'sera', when: 'Yesterday 6:10 PM',
      text: "Yes — **two options** that keep you under the cap:\n\n• Trade Saturday 4–9 PM for Friday\'s 11 AM–4 PM premium suite shift (+$3/hr differential).\n• Hold Saturday and pick up Sun 12–4 PM concessions instead.",
      quoteAttachment: { title: 'Suggested swaps · this week', meta: 'Both keep you at 39 hrs · differential included' } },
    { who: 'peer', when: 'Today 8:31 AM', text: "let\'s do the Friday premium suite one" },
    { who: 'sera', when: 'Today 8:32 AM', text: "Swapped. You\'re on Friday 11 AM–4 PM, premium-suite section. Ratesheet shows **+$22.50** vs. the Saturday gate. See you then.", confirmed: true },
  ],
  priya: [
    { who: 'sera', when: 'Yesterday 7:14 PM', text: "Quick heads-up — Saturday\'s 5 AM load-in moved to **6 AM** to give the rigging crew an extra hour. Same gate, same role." },
    { who: 'peer', when: 'Yesterday 7:22 PM', text: "ok noted. is the wrap time the same?" },
    { who: 'sera', when: 'Yesterday 7:23 PM', text: "Same wrap — **10 AM** — so you\'re down from 5 hrs to 4 hrs. I\'ve adjusted your time sheet. Confirm when you can?" },
    { who: 'peer', when: 'Today 7:51 AM',     text: "Confirmed 👍" },
    { who: 'sera', when: 'Today 7:52 AM',     text: "Got it — see you Saturday at 6 AM. I\'ll send a reminder Friday night.", confirmed: true },
  ],
  diane: [
    { who: 'sera', when: 'Yesterday 5:46 PM', text: "Two **F&B shifts** opened up Sun afternoon if you want hours — 12–4 PM east concourse, and 1–5 PM premium-suite. You\'re at 26 hrs for the week so both fit." },
    { who: 'peer', when: 'Yesterday 5:51 PM', text: "I\'ll take the premium suite one, thanks!" },
    { who: 'sera', when: 'Yesterday 5:51 PM', text: "Locked in. Sunday 1–5 PM, premium-suite east. Pre-shift brief at 12:45 PM in section 213." },
    { who: 'sera', when: 'Today 8:38 AM',     text: "Reminder for tomorrow — Sunday 1 PM, section 213 brief. **+$2/hr** differential applies.", confirmed: true },
  ],
  carlos: [
    { who: 'sera', when: 'Yesterday 5:02 PM', text: "Premium-suite head count for Saturday was revised — we need **+6 attendants** on the 4 PM call." },
    { who: 'sera', when: 'Yesterday 5:02 PM', text: "You\'re the lead on that section. Should I open the gap to your standing team first, or broadcast to all premium-trained staff?" },
    { who: 'peer', when: 'Yesterday 5:18 PM', text: "open to my team first. 1hr to respond then broadcast." },
    { who: 'sera', when: 'Yesterday 5:19 PM', text: "On it. Targeting your 14-person section. I\'ll roll to a broadcast at 6:20 PM if we still have gaps." },
    { who: 'sera', when: 'Today 7:02 AM',     text: "Filled — **5 from your team**, 1 from the broadcast. Sat 4 PM call is fully staffed.", confirmed: true },
  ],
  jordan: [
    { who: 'sera', when: 'Yesterday 3:48 PM', text: "Confirming you\'re OK to swap into **Marcus J.\'s Friday gate 3 shift** (4–9 PM). You\'re at 28 hrs so it puts you at 33." },
    { who: 'peer', when: 'Yesterday 3:54 PM', text: "yes I\'m good with that" },
    { who: 'sera', when: 'Yesterday 3:54 PM', text: "Done — added to your schedule, paystub will reflect the swap automatically. Marcus credited with the swap-out." },
    { who: 'sera', when: 'Today 9:10 AM',     text: "Reminder: Friday 4 PM, gate 3. Pre-shift huddle 3:45 in the east tunnel.", confirmed: true },
  ],
  rachel: [
    { who: 'sera', when: 'Yesterday 8:04 PM', text: "Sandra called out for **Saturday 7 PM at Civic** — can you take it? Same role, same pay. You\'re at 24 hrs so plenty of room." },
    { who: 'peer', when: 'Yesterday 8:09 PM', text: "yes! I can take it" },
    { who: 'sera', when: 'Yesterday 8:09 PM', text: "Locked in. Saturday 7 PM, Civic — section 4 supervisor. Pre-shift 6:30." },
    { who: 'sera', when: 'Today 6:32 AM',     text: "Reminder — tonight 7 PM, Civic section 4. **+$1.50/hr** weekend differential applies.", confirmed: true },
  ],
  david: [
    { who: 'sera', when: 'Yesterday 11:14 AM', text: "Fairness check — you\'ve been **on for 5 shifts in a row**. Want me to swap Sunday out so you get a real break?" },
    { who: 'peer', when: 'Yesterday 11:30 AM', text: "actually yeah. Sunday off would be great" },
    { who: 'sera', when: 'Yesterday 11:31 AM', text: "Done. Sunday\'s shift opened up to the standby pool, and you\'re off. **6 days on, 1 off** — let\'s not let it stretch past 5 again." },
    { who: 'peer', when: 'Today 8:02 AM',      text: "appreciate it. thanks Sera." },
    { who: 'sera', when: 'Today 8:02 AM',      text: "Enjoy Sunday. I\'ll watch your rotations going forward.", confirmed: true },
  ],
  broadcast: [
    { who: 'sera', when: 'Yesterday 9:00 AM',
      text: "**Niners Game-Day Brief — Saturday**\n\nGates open at **4:30 PM**. Pre-shift huddle by section at **3:45 PM**. Wear the red event polo, badge visible. Water + ice stations at sections 105, 210, 315.",
      quoteAttachment: { title: 'Game-Day Brief · Levi\'s Stadium', meta: 'Sent to 142 Event Staff · Read by 138' } },
    { who: 'sera', when: 'Yesterday 9:00 AM', text: "Reply here with questions — I\'ll route role-specific ones to your section lead." },
    { who: 'peer', when: 'Yesterday 10:14 AM', text: "(Marisol G.) Where do new hires pick up their polo?" },
    { who: 'sera', when: 'Yesterday 10:14 AM', text: "Section 1 wardrobe, west tunnel entrance. Bring your ID — they\'ll sign one out and back in at wrap." },
    { who: 'sera', when: 'Today 7:00 AM',      text: "Final reminder — gates 4:30 PM. **138 of 142** confirmed. 4 outstanding (Marcus J., Priya S., Diane K., Rachel W.) — I\'ve pinged each separately.", confirmed: true },
  ],
}

export default function EngageView({ onDemo, onToggleActivityDrawer, activityDrawerOpen }) {
  const [activeDept, setActiveDept] = useState('sched')
  const [activeConv, setActiveConv] = useState('miguel')
  const buzz = () => onDemo?.()

  const conv = CONVERSATIONS.find(c => c.id === activeConv) ?? CONVERSATIONS[0]
  const thread = THREADS[conv.id] ?? THREADS.miguel

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
            {DEPARTMENTS.map(d => {
              const Icon = d.Icon
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`engage-rail-item ${activeDept === d.id ? 'is-active' : ''}`}
                  onClick={() => setActiveDept(d.id)}
                >
                  <span
                    className="engage-rail-avatar"
                    aria-hidden="true"
                    style={{ background: d.tint.bg, color: d.tint.fg }}
                  >
                    <Icon size={14} />
                  </span>
                  <span className="engage-rail-label">{d.label}</span>
                  {d.unread > 0 && (
                    <span className="engage-rail-badge">{d.unread}</span>
                  )}
                </button>
              )
            })}
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
            <div className="engage-thread-sub">Last message {thread.at(-1).when}</div>
          </div>
          <div className="engage-thread-actions">
            <button type="button" className="engage-thread-confirm" onClick={buzz} aria-label="Mark resolved">
              <CheckIcon size={14} />
              <ChevronDownIcon size={12} />
            </button>
            {onToggleActivityDrawer && (
              <button
                type="button"
                className={`engage-thread-icon-btn ${activityDrawerOpen ? 'is-active' : ''}`}
                onClick={onToggleActivityDrawer}
                aria-label={activityDrawerOpen ? 'Close activity drawer' : 'Open activity drawer'}
                aria-pressed={activityDrawerOpen}
              >
                <ListBulletIcon size={16} />
              </button>
            )}
            <button type="button" className="engage-thread-profile" onClick={buzz}>
              View Profile
            </button>
          </div>
        </header>

        <div className="engage-thread-body">
          <div className="engage-thread-day">Today, Apr 24 2026</div>

          {thread.map((m, i) => (
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
              <div className="engage-msg-attachment-title">{message.quoteAttachment.title}</div>
              <div className="engage-msg-attachment-meta">{message.quoteAttachment.meta}</div>
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
