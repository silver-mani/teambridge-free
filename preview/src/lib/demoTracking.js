const SESSION_KEY = 'tb:demo-session-id'
const LANDING_KEY = 'tb:demo-landing'
const REFERRER_KEY = 'tb:demo-referrer'
const START_KEY = 'tb:demo-start-at'

function safeStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function makeSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `demo_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function getDemoSessionId() {
  if (typeof window === 'undefined') return ''
  const storage = safeStorage()
  if (!storage) return makeSessionId()
  let id = storage.getItem(SESSION_KEY)
  if (!id) {
    id = makeSessionId()
    storage.setItem(SESSION_KEY, id)
    storage.setItem(LANDING_KEY, window.location.href)
    storage.setItem(REFERRER_KEY, document.referrer || '')
    storage.setItem(START_KEY, String(Date.now()))
  }
  return id
}

export function getDemoSnapshot() {
  if (typeof window === 'undefined') {
    return {
      sessionId: '',
      landingPage: undefined,
      referrer: undefined,
      startedAt: undefined,
      timeInDemoMs: undefined,
      route: undefined,
      path: undefined,
      industry: undefined,
      view: undefined,
    }
  }

  const storage = safeStorage()
  const startedAtRaw = storage?.getItem(START_KEY)
  const startedAt = startedAtRaw ? Number(startedAtRaw) : undefined
  const hash = (window.location.hash || '').replace(/^#\/?/, '')
  const parts = hash ? hash.split('/') : []
  const isSage = parts[0] === 'sage'
  const industry = isSage ? 'events' : parts[0] || undefined
  const view = isSage ? (parts[1] || 'dashboard') : (parts[1] || (industry ? 'overview' : undefined))

  return {
    sessionId: getDemoSessionId(),
    landingPage: storage?.getItem(LANDING_KEY) || window.location.href,
    referrer: storage?.getItem(REFERRER_KEY) || document.referrer || undefined,
    startedAt,
    timeInDemoMs: startedAt ? Math.max(0, Date.now() - startedAt) : undefined,
    route: window.location.href,
    path: window.location.pathname + window.location.hash,
    industry,
    view,
  }
}

export function trackDemoEvent(eventName, data = {}) {
  if (typeof window === 'undefined') return
  const snapshot = getDemoSnapshot()
  const payload = {
    sessionId: snapshot.sessionId,
    eventName,
    eventTs: Date.now(),
    route: snapshot.route,
    path: snapshot.path,
    industry: snapshot.industry,
    view: snapshot.view,
    landingPage: snapshot.landingPage,
    referrer: snapshot.referrer,
    data,
  }

  try {
    fetch('/api/track-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Tracking should never affect the demo.
  }
}
