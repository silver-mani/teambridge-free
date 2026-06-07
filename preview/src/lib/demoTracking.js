const SESSION_KEY = 'tb:demo-session-id'
const LANDING_KEY = 'tb:demo-landing'
const REFERRER_KEY = 'tb:demo-referrer'
const START_KEY = 'tb:demo-start-at'
const DEMO_TRACKING_INIT_KEY = '__teambridgeDemoTracking'
const HEARTBEAT_MS = 30000

function safeSessionStorage() {
  try {
    return window.sessionStorage
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
  const storage = safeSessionStorage()
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

  const storage = safeSessionStorage()
  const startedAtRaw = storage?.getItem(START_KEY)
  const startedAt = startedAtRaw ? Number(startedAtRaw) : undefined
  const hash = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0].split('#')[0]
  const parts = hash ? hash.split('/') : []
  const isSage = parts[0] === 'sage'
  const industry = isSage ? 'events' : (parts[0] && parts[0] !== 'demos' ? parts[0] : undefined)
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

function textForElement(element) {
  const childLabel =
    element.querySelector?.('[data-track-label], [data-track-title], h1, h2, h3, h4, strong')
  const explicit =
    element.getAttribute('data-track-label') ||
    element.getAttribute('aria-label') ||
    element.getAttribute('title') ||
    element.getAttribute('name') ||
    element.getAttribute('id') ||
    ''
  const text = explicit || childLabel?.getAttribute?.('data-track-label') || childLabel?.textContent || element.textContent || ''
  return text.replace(/\s+/g, ' ').trim().slice(0, 140)
}

function sectionForElement(element) {
  const section = element.closest('[data-track-section], section, main, aside, nav, header')
  return (
    section?.getAttribute('data-track-section') ||
    section?.getAttribute('aria-label') ||
    section?.getAttribute('id') ||
    section?.tagName?.toLowerCase() ||
    undefined
  )
}

function interactiveTarget(start) {
  if (!start || !start.closest) return null
  return start.closest(
    '[data-track], button, a, input, select, textarea, [role="button"], [role="tab"], [role="menuitem"], [tabindex]'
  )
}

function elementData(element, event) {
  const rect = element.getBoundingClientRect?.()
  const viewportWidth = window.innerWidth || 1
  const viewportHeight = window.innerHeight || 1
  return {
    tag: element.tagName?.toLowerCase(),
    role: element.getAttribute('role') || undefined,
    type: element.getAttribute('type') || undefined,
    label: textForElement(element),
    section: sectionForElement(element),
    href: element instanceof HTMLAnchorElement ? element.href : undefined,
    path: element instanceof HTMLAnchorElement ? element.pathname + element.hash : undefined,
    xPct: event?.clientX ? Math.round((event.clientX / viewportWidth) * 100) : undefined,
    yPct: event?.clientY ? Math.round((event.clientY / viewportHeight) * 100) : undefined,
    elementTop: rect ? Math.round(rect.top) : undefined,
  }
}

function fieldData(element) {
  return {
    tag: element.tagName?.toLowerCase(),
    type: element.getAttribute('type') || element.tagName?.toLowerCase(),
    name: element.getAttribute('name') || element.getAttribute('id') || undefined,
    label: textForElement(element),
    section: sectionForElement(element),
    checked: element.type === 'checkbox' || element.type === 'radio' ? Boolean(element.checked) : undefined,
    hasValue:
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
        ? Boolean(element.value)
        : undefined,
  }
}

export function initDemoTracking() {
  if (typeof window === 'undefined' || window[DEMO_TRACKING_INIT_KEY]) return
  window[DEMO_TRACKING_INIT_KEY] = true

  const scrollThresholds = new Set([25, 50, 75, 90])
  const reachedByPath = new Map()

  document.addEventListener(
    'click',
    event => {
      const target = interactiveTarget(event.target)
      if (!target) return
      trackDemoEvent('ui_clicked', elementData(target, event))
    },
    true
  )

  document.addEventListener(
    'focusin',
    event => {
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        trackDemoEvent('field_focused', fieldData(target))
      }
    },
    true
  )

  document.addEventListener(
    'change',
    event => {
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        trackDemoEvent('field_changed', fieldData(target))
      }
    },
    true
  )

  let scrollTimer = 0
  window.addEventListener(
    'scroll',
    () => {
      if (scrollTimer) return
      scrollTimer = window.setTimeout(() => {
        scrollTimer = 0
        const doc = document.documentElement
        const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight)
        const depth = Math.min(100, Math.round((window.scrollY / maxScroll) * 100))
        const path = window.location.pathname + window.location.hash
        const reached = reachedByPath.get(path) || new Set()
        for (const threshold of scrollThresholds) {
          if (depth >= threshold && !reached.has(threshold)) {
            reached.add(threshold)
            trackDemoEvent('scroll_depth_reached', { threshold, depth, path })
          }
        }
        reachedByPath.set(path, reached)
      }, 500)
    },
    { passive: true }
  )

  document.addEventListener('visibilitychange', () => {
    trackDemoEvent('visibility_changed', { state: document.visibilityState })
  })

  window.addEventListener('error', event => {
    trackDemoEvent('client_error', {
      message: String(event.message || '').slice(0, 180),
      source: String(event.filename || '').slice(0, 180),
    })
  })

  window.addEventListener('unhandledrejection', event => {
    trackDemoEvent('client_error', {
      message: String(event.reason?.message || event.reason || 'Unhandled rejection').slice(0, 180),
      source: 'unhandledrejection',
    })
  })

  window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      trackDemoEvent('session_heartbeat')
    }
  }, HEARTBEAT_MS)

  window.addEventListener('pagehide', () => {
    trackDemoEvent('session_ended', { reason: 'pagehide' })
  })
}
