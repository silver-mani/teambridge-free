---
name: view-aware-chat
description: Add a new "view" (e.g. Schedule) to the Teambridge Free dashboard with a deep-linkable URL, a smooth column-layout transition, and an AI-style briefing that posts itself into the chat when the user arrives. Captures the pattern we built for #/events/schedule so future pages (Time & Attendance, People, etc.) can drop in the same behavior.
---

# View-Aware Chat Pattern

When the user asks to add a new "view" (page) to the Teambridge Free dashboard that:
1. Needs a real URL (bookmarkable / back-button safe)
2. Reshapes the 3-column layout (chat narrows, main content grows, activity feed may collapse)
3. Greets the operator with view-specific AI insights when they land on it

...follow this playbook. It's the exact pattern used for `#/events/schedule`.

## 1. Routing — extend the hash format

Hash shape: `#/<industry>/<view>`. If no view is present, default to `'overview'`.

**File:** `preview/src/main.jsx`

```js
function parseHash() {
  const raw = (window.location.hash || '').replace(/^#/, '').replace(/^\//, '').trim()
  if (!raw) return null
  const [industry, view = 'overview'] = raw.split('/')
  if (!VALID_INDUSTRIES.has(industry)) return null
  return { industry, view: VALID_VIEWS.has(view) ? view : 'overview' }
}
```

Pass `{ view, onSelectView }` into `Act1Dashboard`:

```jsx
<Act1Dashboard
  industryId={route.industry}
  view={route.view}
  onSelectView={(v) =>
    setHash(v === 'overview' ? `/${route.industry}` : `/${route.industry}/${v}`)}
  onBack={() => setHash('/')}
/>
```

**Act1Dashboard** accepts `view` as a prop — do NOT hold view state locally. The URL is the single source of truth so back/forward behave.

## 2. Wire the left-nav item

`NAV_ITEMS` already has entries like `{ id: 'schedule', Icon: Grid01Icon }`. In `LeftNav`, route the click:

```js
const onClick =
    item.id === 'ask'      ? onAsk
  : item.id === 'overview' ? () => onSelectView?.('overview')
  : item.id === 'schedule' ? () => onSelectView?.('schedule')
  // add future views here
  : () => showDemoToast()  // demo-mode safety valve
```

Active state: `const active = item.id === view || (item.id === 'overview' && view === 'overview')`.

## 3. Layout flip + smooth transition

Keep a single root grid and modify it via a class.

**File:** `preview/src/screens/act1.css`

```css
.act1-root {
  grid-template-columns: 240px 1fr 460px;  /* default: nav / chat / feed */
  transition: grid-template-columns 360ms cubic-bezier(0.2, 0, 0, 1);
}

/* Per-view override — keep the tracks same-count so the transition lerps. */
.act1-root--schedule {
  grid-template-columns: 240px 360px 1fr;  /* nav / narrow chat / wide main */
}

/* Fade out the feed instead of display:none so the column tween can play. */
.activity-feed { transition: opacity 220ms ease 80ms; }
.act1-root--schedule .activity-feed { opacity: 0; pointer-events: none; }

/* Chat column's inner max-width animates so the content reflows smoothly. */
.prompt-panel-inner {
  max-width: 720px;
  transition: max-width 360ms cubic-bezier(0.2, 0, 0, 1),
              padding   360ms cubic-bezier(0.2, 0, 0, 1);
}
.act1-root--schedule .prompt-panel-inner { max-width: none; }

/* Main-area enter animation (opacity + small translate so it doesn't snap in). */
.schedule { animation: view-enter 460ms cubic-bezier(0.2, 0, 0, 1); }
@keyframes view-enter {
  from { opacity: 0; transform: translateX(12px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

In `Act1Dashboard`: `<div className={'act1-root' + (view === 'schedule' ? ' act1-root--schedule' : '')}>`.

Conditional render for the main column:
```jsx
{view === 'schedule'
  ? <ScheduleCalendar data={data} onDemo={() => showDemoToast()} />
  : <ActivityFeed data={data} />}
```

## 4. View-specific briefing (empty state + mid-convo injection)

### 4a. Empty-state briefing switches on view

**File:** `preview/src/screens/Act1Dashboard.jsx`

Define a parallel briefing constant alongside `BRIEFING`:

```js
const SCHEDULE_BRIEFING = {
  events: {
    time: '9:04 AM',
    greeting: "Looking at this week's schedule — here's what to act on.",
    situations: [
      { id: 'no-shows', tone: 'warning',
        title: '2 no-shows logged this week',
        desc:  'Sandra (Wed) and Ashley (Tue) missed their call times.',
        action: { label: 'Review no-shows', prompt: "Summarise this week's no-shows" } },
      /* ... 3–4 total ... */
    ],
  },
}
```

`DailyBriefing` picks the right set:

```js
const set = view === 'schedule' ? SCHEDULE_BRIEFING : BRIEFING
const brief = set[industryId] ?? set.events ?? BRIEFING.events
```

### 4b. Animate the greeting word-by-word, cascade the cards

```jsx
<p className="briefing-compact-greeting">
  {brief.greeting.split(/(\s+)/).map((tok, i) =>
    /\S/.test(tok)
      ? <span key={i} className="briefing-word" style={{ animationDelay: `${i * 90}ms` }}>{tok}</span>
      : <span key={i}>{tok}</span>
  )}
</p>
<ul className="briefing-situations">
  {brief.situations.map((s, i) => (
    <li key={s.id}
        className={`briefing-situation briefing-situation-${s.tone}`}
        style={{ animationDelay: `${2200 + i * 420}ms` }}>
      …
    </li>
  ))}
</ul>
```

CSS:
```css
.briefing-word       { opacity: 0; animation: briefing-word-in 280ms ease forwards; }
.briefing-situation  { opacity: 0; animation: briefing-enter 420ms cubic-bezier(0.2,0,0,1) forwards; }
@keyframes briefing-word-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes briefing-enter   { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
```

### 4c. Inject briefing as a chat bubble mid-conversation

When the user switches views with a non-empty chat, the empty-state briefing won't render. Post the briefing as an inline message instead.

```js
// Inside PromptPanel
const lastViewRef = useRef(view)
useEffect(() => {
  const prev = lastViewRef.current
  lastViewRef.current = view
  if (view === prev) return
  if (messages.length === 0) return
  const set = view === 'schedule' ? SCHEDULE_BRIEFING : BRIEFING
  const brief = set[industryId] ?? set.events
  if (!brief?.situations?.length) return
  setMessages(prev => [
    ...prev,
    { id: ++idRef.current, role: 'briefing', brief,
      onAction: (prompt) => submitRef.current?.(prompt) },
  ])
}, [view, industryId])
```

Add a branch in `Message`:
```jsx
if (message.role === 'briefing') {
  return <InlineBriefing brief={message.brief} onAction={message.onAction} />
}
```

`InlineBriefing` mirrors the empty-state markup (greeting words + situation list) inside a `.prompt-msg-assistant` shell.

## 5. Follow-up chips switch too

The pills above the compose should reflect the view:

```js
const chipPool = view === 'schedule'
  ? ((SCHEDULE_BRIEFING[industryId] ?? SCHEDULE_BRIEFING.events)?.situations ?? [])
      .map(s => s.action)
      .filter(Boolean)
      .map(a => ({ label: a.prompt }))
  : (suggestions ?? [])
```

## 6. Seed data lives on the industry record

Put view-specific data under the industry:
```js
INDUSTRY_DATA.events.schedule = { weekLabel, todayId, rows: [...] }
```
The view component reads `data.schedule` — the data file is the single source of truth, not the view.

## 7. Demo-mode side effects

Every button added by the view (calendar filters, shift cells, toolbar actions) should fire `showDemoToast()` rather than navigating or doing side effects. The toast says _"This action is available in the full Teambridge product."_ — pattern already set in `Act1Dashboard.jsx`.

---

## Quick-start checklist for a new view

- [ ] Add `view === 'myview'` branch to `parseHash` in `main.jsx`.
- [ ] Wire `NAV_ITEMS` click in `LeftNav` → `onSelectView('myview')`.
- [ ] Create `preview/src/screens/MyView.jsx` with entry animation.
- [ ] Add `.act1-root--myview` CSS override with new grid tracks.
- [ ] Add `MYVIEW_BRIEFING` with greeting + 3–4 situations.
- [ ] `DailyBriefing` + inline-briefing useEffect pick the right set by `view`.
- [ ] Follow-up chips derive from `MYVIEW_BRIEFING` when `view === 'myview'`.
- [ ] Place seed data at `INDUSTRY_DATA.<industry>.myview`.
- [ ] Every inert control → `showDemoToast()`.
