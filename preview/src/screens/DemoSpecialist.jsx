import { useEffect, useMemo, useRef, useState } from 'react'
import { trackDemoEvent, getDemoSnapshot } from '../lib/demoTracking.js'

const BASE = import.meta.env.BASE_URL
const NOVA_AVATAR = `${BASE}agents/nova.gif`
const WIDGET_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
const ACTION_SETTLE_MS = 750
const TRANSCRIPT_EVENTS = [
  'elevenlabs-convai:message',
  'elevenlabs-convai:transcript',
  'elevenlabs-convai:user-transcript',
  'elevenlabs-convai:user_transcript',
  'elevenlabs-convai:agent-response',
  'elevenlabs-convai:agent_response',
  'elevenlabs-convai:audio',
  'elevenlabs-convai:event',
]
const VALID_INDUSTRIES = new Set([
  'healthcare', 'staffing', 'events', 'security', 'light-industrial', 'construction',
  'hospitality', 'long-term-care', 'janitorial',
])
const INDUSTRY_ALIASES = {
  healthcare: 'healthcare',
  health: 'healthcare',
  staffing: 'staffing',
  agency: 'staffing',
  events: 'events',
  event: 'events',
  venues: 'events',
  venue: 'events',
  hospitality: 'hospitality',
  hotel: 'hospitality',
  hotels: 'hospitality',
  restaurant: 'hospitality',
  restaurants: 'hospitality',
  'long-term-care': 'long-term-care',
  longtermcare: 'long-term-care',
  ltc: 'long-term-care',
  care: 'long-term-care',
  security: 'security',
  janitorial: 'janitorial',
  facilities: 'janitorial',
  facility: 'janitorial',
  cleaning: 'janitorial',
  industrial: 'light-industrial',
  warehouse: 'light-industrial',
  logistics: 'light-industrial',
  manufacturing: 'light-industrial',
  construction: 'construction',
}

const DEMO_ACTIONS = {
  intro: {
    selector: ['.entry-build-panel', '.entry-product-preview--build'],
    label: 'Build a workspace from company context',
  },
  ready_workspaces: {
    selector: ['.entry-workspace-section'],
    label: 'Ready-made workspace selector',
  },
  overview: {
    view: 'overview',
    selector: ['.activity-feed-inner', '.activity-feed', '.prompt-panel'],
    label: 'Live agent activity and daily briefing',
  },
  schedule_gap: {
    view: 'schedule',
    selector: ['.schedule-canvas', '.schedule-grid', '.schedule'],
    label: 'Coverage gaps and schedule changes',
  },
  shift_requests: {
    view: 'shift-requests',
    selector: ['.shift-requests-list', '.shift-request-card', '.shift-requests'],
    label: 'Requests Nova can approve or route',
  },
  time_tracking: {
    view: 'time-tracking',
    selector: ['.time-tracking-map', '.time-tracking-rail', '.time-tracking'],
    label: 'Live worker locations and attendance risk',
  },
  payroll: {
    view: 'pay',
    selector: ['.pay-stats', '.pay-table', '.pay'],
    label: 'Payroll periods, approvals, and instant pay',
  },
  pay_review: {
    view: 'review',
    selector: ['.review-stats', '.review-card', '.review'],
    label: 'Payroll exceptions Nova can clear',
  },
  people: {
    view: 'people',
    selector: ['.people-stats', '.people-table', '.people'],
    label: 'Roster, credentials, and workforce records',
  },
  onboarding: {
    view: 'onboarding',
    selector: ['.onboarding-board', '.onboarding-tabs', '.onboarding'],
    label: 'Onboarding pipeline and missing steps',
  },
  compliance: {
    view: 'policies',
    selector: ['.policies-grid', '.policies-main', '.policies'],
    label: 'Compliance policies and guardrails',
  },
  agents: {
    view: 'workflows',
    selector: ['.wf-detail', '.wf-grid', '.wf'],
    label: 'Teambridge AI agent workflows',
  },
  sage_overtime: {
    selector: ['.sage-dashboard', '.sage-workforce', '.schedule', '.act1-root'],
    label: 'Sage overtime handoff into Teambridge',
  },
  engage: {
    view: 'engage',
    selector: ['.engage-thread', '.engage-list', '.engage'],
    label: 'Worker communication and follow-up',
  },
}

function loadWidgetScript() {
  if (typeof document === 'undefined') return Promise.resolve()
  if (customElements.get('elevenlabs-convai')) return Promise.resolve()

  const ready = customElements
    .whenDefined('elevenlabs-convai')
    .then(() => undefined)

  if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return ready

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = WIDGET_SRC
    script.async = true
    script.type = 'text/javascript'
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
    ready.then(resolve).catch(() => {})
  })
}

function readJsonStorage(key) {
  try {
    const raw = sessionStorage.getItem(key) || localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setHashPath(path) {
  if (!path || typeof path !== 'string') return
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (window.location.hash !== `#${normalized}`) {
    window.location.hash = normalized
  }
}

function normalizeIndustry(value) {
  const raw = String(value || '').toLowerCase().trim()
  const dashed = raw.replace(/[\s_]+/g, '-')
  if (VALID_INDUSTRIES.has(dashed)) return dashed
  return INDUSTRY_ALIASES[dashed] || INDUSTRY_ALIASES[dashed.replace(/-/g, '')] || null
}

function sleep(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

function selectorsFor(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return value ? [value] : []
}

function findFirst(selectors) {
  for (const selector of selectorsFor(selectors)) {
    const el = document.querySelector(selector)
    if (el) return { el, selector }
  }
  return { el: null, selector: '' }
}

function waitForElement(selectors, timeoutMs = 3600) {
  const started = Date.now()

  return new Promise(resolve => {
    const tick = () => {
      const found = findFirst(selectors)
      if (found.el || Date.now() - started >= timeoutMs) {
        resolve(found)
        return
      }
      window.setTimeout(tick, 120)
    }

    tick()
  })
}

function normalizeActionName(action) {
  const key = String(action || '').toLowerCase().trim().replace(/[\s-]+/g, '_')
  if (DEMO_ACTIONS[key]) return key
  if (normalizeIndustry(action)) return 'open_workspace'
  if (key.includes('schedule') || key.includes('gap') || key.includes('shift')) return 'schedule_gap'
  if (key.includes('request') || key.includes('swap')) return 'shift_requests'
  if (key.includes('time') || key.includes('attendance') || key.includes('tracking')) return 'time_tracking'
  if (key.includes('payroll') || key === 'pay') return 'payroll'
  if (key.includes('exception') || key.includes('review')) return 'pay_review'
  if (key.includes('people') || key.includes('roster') || key.includes('credential')) return 'people'
  if (key.includes('onboard') || key.includes('hire')) return 'onboarding'
  if (key.includes('compliance') || key.includes('policy')) return 'compliance'
  if (key.includes('agent') || key.includes('workflow')) return 'agents'
  if (key.includes('message') || key.includes('engage') || key.includes('communication')) return 'engage'
  if (key.includes('workspace') || key.includes('vertical') || key.includes('industry')) return 'ready_workspaces'
  return key || 'overview'
}

function actionFromDemoText(text) {
  const raw = String(text || '').trim()
  if (!raw) return null
  const lower = raw.toLowerCase()

  for (const [alias, industry] of Object.entries(INDUSTRY_ALIASES)) {
    const readable = alias.replace(/-/g, ' ')
    if (lower.includes(alias) || lower.includes(readable)) {
      return {
        kind: 'workspace',
        value: industry,
        label: `${industry.replace(/-/g, ' ')} workspace`,
      }
    }
  }

  const actionHints = [
    ['schedule_gap', ['schedule', 'scheduling', 'coverage', 'gap', 'open shift', 'fill shift', 'call out', 'call-out']],
    ['shift_requests', ['request', 'swap', 'shift request', 'approve request']],
    ['time_tracking', ['time tracking', 'attendance', 'clock', 'punch', 'location']],
    ['payroll', ['payroll', 'pay approval', 'instant pay', 'pay period', 'wage']],
    ['pay_review', ['pay review', 'exception', 'payroll exception']],
    ['people', ['people', 'roster', 'staff', 'worker', 'employee', 'credential']],
    ['onboarding', ['onboard', 'onboarding', 'new hire', 'paperwork']],
    ['compliance', ['compliance', 'policy', 'certification', 'certificate', 'license']],
    ['agents', ['agent', 'automation', 'workflow', 'ai action']],
    ['engage', ['message', 'communication', 'notify', 'sms', 'texting']],
    ['ready_workspaces', ['workspace', 'vertical', 'industry', 'demo account', 'preloaded']],
  ]

  for (const [action, hints] of actionHints) {
    if (hints.some(hint => lower.includes(hint))) {
      return {
        kind: 'action',
        value: action,
        label: DEMO_ACTIONS[action]?.label || action.replace(/_/g, ' '),
      }
    }
  }

  return null
}

function spokenToolAction(text) {
  const raw = String(text || '').trim()
  if (!raw) return null

  const lower = raw.toLowerCase()
  const looksLikeTool =
    /(?:openworkspace|opendemoworkspace|showworkspace|show[a-z]+workspace|performdemoaction|rundemoscenario|navigatetodemoview|highlightdemoarea)/i.test(raw) ||
    /(?:tool|function|command|call|run)\s*[:(]/i.test(raw) ||
    /(?:\{|\()\s*["']?(?:industry|workspace|vertical|action|capability|view|scenario)["']?\s*[:=]/i.test(raw)

  if (!looksLikeTool) return null

  const directAction = actionFromDemoText(raw)
  if (directAction) return directAction

  for (const [key, config] of Object.entries(DEMO_ACTIONS)) {
    const readable = key.replace(/_/g, ' ')
    if (lower.includes(key) || lower.includes(readable)) {
      return {
        kind: 'action',
        value: key,
        label: config.label,
      }
    }
  }

  if (lower.includes('schedule')) {
    return { kind: 'action', value: 'schedule_gap', label: DEMO_ACTIONS.schedule_gap.label }
  }
  if (lower.includes('payroll') || lower.includes('pay ')) {
    return { kind: 'action', value: 'payroll', label: DEMO_ACTIONS.payroll.label }
  }
  if (lower.includes('people') || lower.includes('worker') || lower.includes('staff')) {
    return { kind: 'action', value: 'people', label: DEMO_ACTIONS.people.label }
  }
  if (lower.includes('onboarding')) {
    return { kind: 'action', value: 'onboarding', label: DEMO_ACTIONS.onboarding.label }
  }
  if (lower.includes('compliance')) {
    return { kind: 'action', value: 'compliance', label: DEMO_ACTIONS.compliance.label }
  }
  if (lower.includes('agent')) {
    return { kind: 'action', value: 'agents', label: DEMO_ACTIONS.agents.label }
  }

  return null
}

function compactDetail(value, depth = 0) {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'string') return value.slice(0, 1000)
  if (typeof value === 'number' || typeof value === 'boolean') return value
  if (depth > 2) return undefined
  if (Array.isArray(value)) {
    return value.slice(0, 6).map(item => compactDetail(item, depth + 1)).filter(item => item !== undefined)
  }
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 18)
        .map(([key, item]) => [key, compactDetail(item, depth + 1)])
        .filter(([, item]) => item !== undefined)
    )
  }
  return undefined
}

function transcriptFromDetail(detail) {
  const candidates = [
    detail?.text,
    detail?.transcript,
    detail?.message,
    detail?.content,
    detail?.response,
    detail?.delta,
    detail?.user_transcript,
    detail?.agent_response,
    detail?.user_transcription_event?.user_transcript,
    detail?.agent_response_event?.agent_response,
    detail?.conversation_transcript,
    detail?.data?.text,
    detail?.data?.transcript,
    detail?.data?.message,
    detail?.data?.user_transcript,
    detail?.data?.agent_response,
    detail?.data?.user_transcription_event?.user_transcript,
    detail?.data?.agent_response_event?.agent_response,
  ]
  const text = candidates.find(value => typeof value === 'string' && value.trim())
  if (!text) return null
  const inferredSpeaker =
    detail?.type === 'user_transcript' || detail?.user_transcription_event || detail?.data?.user_transcription_event
      ? 'user'
      : detail?.type === 'agent_response' || detail?.agent_response_event || detail?.data?.agent_response_event
        ? 'Nova'
        : undefined
  const speaker =
    detail?.speaker ||
    detail?.role ||
    inferredSpeaker ||
    detail?.source ||
    detail?.data?.speaker ||
    detail?.data?.role ||
    'Nova'
  return {
    text: String(text).trim().slice(0, 1800),
    speaker: String(speaker || 'Nova').slice(0, 80),
  }
}

function queryDeep(rootLike, selector) {
  const roots = []
  const firstRoot = rootLike?.shadowRoot || rootLike
  if (!firstRoot) return []

  const visit = root => {
    if (!root || roots.includes(root)) return
    roots.push(root)
    const nodes = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : []
    for (const node of nodes) {
      if (node.shadowRoot) visit(node.shadowRoot)
    }
  }

  visit(firstRoot)

  const found = []
  const seen = new Set()
  for (const root of roots) {
    const nodes = root.querySelectorAll ? Array.from(root.querySelectorAll(selector)) : []
    for (const node of nodes) {
      if (seen.has(node)) continue
      seen.add(node)
      found.push(node)
    }
  }
  return found
}

function queryWidgetDeep(widget, selector) {
  return queryDeep(widget, selector)
}

function hideElevenLabsBranding(widget) {
  const root = widget?.shadowRoot
  if (!root) return false

  if (!root.querySelector('style[data-teambridge-branding-cleanup]')) {
    const style = document.createElement('style')
    style.setAttribute('data-teambridge-branding-cleanup', 'true')
    style.textContent = `
      a[href*="elevenlabs.io/agents"],
      p:has(a[href*="elevenlabs.io/agents"]),
      [href*="elevenlabs.io/agents"] {
        display: none !important;
      }
    `
    root.appendChild(style)
  }

  const brandedNodes = queryWidgetDeep(widget, 'p, a, span, div, small').filter(node => {
    const text = (node.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase()
    const href = node.getAttribute?.('href') || ''
    return (
      text === 'powered by elevenagents' ||
      text === 'powered by eleven agents' ||
      text.includes('powered by eleven') ||
      text.includes('elevenagents') ||
      href.includes('elevenlabs.io/agents')
    )
  })

  for (const node of brandedNodes) {
    const container = node.closest('p') || node
    node.style.setProperty('display', 'none', 'important')
    node.setAttribute('aria-hidden', 'true')
    container.style.setProperty('display', 'none', 'important')
    container.setAttribute('aria-hidden', 'true')
  }

  return brandedNodes.length > 0
}

function cleanupElevenLabsTerms(widget) {
  const root = widget?.shadowRoot
  if (!root) return false

  let changed = false
  const nodes = queryWidgetDeep(widget, 'h1, h2, h3, h4, p, small')

  for (const node of nodes) {
    const text = (node.textContent || '').replace(/\s+/g, ' ').trim()
    const lower = text.toLowerCase()
    const isLongLegalCopy = text.length > 80
    const isLeafCopy = node.children.length === 0 || node.querySelectorAll('a, button, [role="button"]').length === 0

    if (lower === 'terms and conditions') {
      node.style.setProperty('display', 'none', 'important')
      node.setAttribute('aria-hidden', 'true')
      changed = true
      continue
    }

    if (
      lower.includes('by clicking "agree,"') ||
      lower.includes('by clicking “agree,”') ||
      lower.includes('each time i interact with this ai agent') ||
      lower.includes('consent to the recording') ||
      lower.includes('if you do not wish to have your conversations recorded') ||
      lower.includes('third-party service providers') ||
      lower.includes('privacy policy')
    ) {
      if (isLongLegalCopy && isLeafCopy) {
        node.style.setProperty('display', 'none', 'important')
        node.setAttribute('aria-hidden', 'true')
        changed = true
      }
    }
  }

  return changed
}

function labelForControl(control) {
  return [
    control.getAttribute('aria-label'),
    control.getAttribute('title'),
    control.getAttribute('data-testid'),
    control.textContent,
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim().toLowerCase()
}

function clickWidgetControl(widget, predicate) {
  const controls = queryWidgetDeep(widget, 'button, [role="button"]')
    .filter(control => {
      const style = window.getComputedStyle(control)
      return style.display !== 'none' && style.visibility !== 'hidden' && !control.disabled
    })

  const control = controls.find(item => predicate(labelForControl(item), item))
  if (!control) return null

  control.click()
  return labelForControl(control) || 'unlabeled'
}

function clickGlobalConsentControl(predicate) {
  const controls = queryDeep(document, 'button, [role="button"]')
    .filter(control => {
      const style = window.getComputedStyle(control)
      return style.display !== 'none' && style.visibility !== 'hidden' && !control.disabled
    })

  const control = controls.find(item => predicate(labelForControl(item), item))
  if (!control) return null

  control.click()
  return labelForControl(control) || 'unlabeled'
}

function clickVisibleAcceptFallback() {
  const points = [
    [window.innerWidth - 58, window.innerHeight - 58],
    [window.innerWidth - 72, window.innerHeight - 62],
    [window.innerWidth - 92, window.innerHeight - 58],
    [window.innerWidth - 122, window.innerHeight - 58],
    [Math.min(window.innerWidth - 58, 332), window.innerHeight - 58],
  ]

  for (const [x, y] of points) {
    if (x < 0 || y < 0) continue
    const target = document.elementFromPoint(x, y)
    if (!target) continue

    const label = labelForControl(target)
    const text = [
      label,
      target.textContent,
      target.parentElement?.textContent,
      target.closest?.('button, [role="button"]')?.textContent,
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim().toLowerCase()

    if (text.includes('accept') || text.includes('agree') || target.tagName === 'ELEVENLABS-CONVAI') {
      const clickable = target.closest?.('button, [role="button"]') || target
      if (typeof PointerEvent === 'function') {
        clickable.dispatchEvent(new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          pointerId: 1,
          pointerType: 'mouse',
        }))
      }
      clickable.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      }))
      clickable.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      }))
      clickable.click?.()
      if (typeof PointerEvent === 'function') {
        clickable.dispatchEvent(new PointerEvent('pointerup', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          pointerId: 1,
          pointerType: 'mouse',
        }))
      }
      return text || `viewport:${Math.round(x)},${Math.round(y)}`
    }
  }

  return null
}

function dispatchSyntheticClick(target, x, y) {
  if (!target) return false
  if (typeof PointerEvent === 'function') {
    target.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
      pointerType: 'mouse',
    }))
  }
  target.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  }))
  target.dispatchEvent(new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  }))
  target.click?.()
  if (typeof PointerEvent === 'function') {
    target.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
      pointerType: 'mouse',
    }))
  }
  return true
}

function clickVisibleStartFallback(widget) {
  const rect = widget?.getBoundingClientRect?.()
  if (!rect || rect.width <= 0 || rect.height <= 0) return null

  const points = [
    [rect.left + rect.width / 2, rect.top + rect.height * 0.5],
    [rect.left + rect.width / 2, rect.top + rect.height * 0.46],
    [rect.left + rect.width / 2, rect.top + rect.height * 0.56],
    [rect.right - 56, rect.bottom - 56],
  ]

  for (const [x, y] of points) {
    const target = document.elementFromPoint(x, y)
    if (!target) continue

    const text = [
      labelForControl(target),
      target.textContent,
      target.parentElement?.textContent,
      target.closest?.('button, [role="button"]')?.textContent,
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim().toLowerCase()
    const clickable = target.closest?.('button, [role="button"]') || target

    if (
      text.includes('start') ||
      text.includes('call') ||
      text.includes('talk') ||
      text.includes('voice') ||
      target.tagName === 'ELEVENLABS-CONVAI'
    ) {
      dispatchSyntheticClick(clickable, x, y)
      return text || `viewport:${Math.round(x)},${Math.round(y)}`
    }
  }

  return null
}

function latestWidgetInputText(widget) {
  const fields = queryWidgetDeep(widget, 'textarea, input[type="text"], [contenteditable="true"]')
    .filter(field => {
      const style = window.getComputedStyle(field)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })

  const field = fields[fields.length - 1]
  if (!field) return ''
  if ('value' in field) return String(field.value || '').trim()
  return String(field.textContent || '').trim()
}

function shouldAskNovaAgent(eventName, line) {
  const text = String(line?.text || '').toLowerCase()
  const speaker = String(line?.speaker || '').toLowerCase()
  if (!text || text.length < 4) return false

  const isUser =
    eventName.includes('user') ||
    eventName.includes('user_transcript') ||
    speaker.includes('user') ||
    speaker.includes('visitor') ||
    speaker.includes('human')
  const isAgentToolLeak =
    eventName.includes('agent') &&
    /(?:openworkspace|opendemoworkspace|showworkspace|performdemoaction|rundemoscenario|navigatetodemoview|highlightdemoarea)/i.test(text)

  if (isAgentToolLeak) return true
  if (!isUser) return false

  return /(?:show|open|go to|take me|walk|explain|demo|workspace|health|staffing|event|hospitality|care|security|facilit|industrial|construction|schedule|shift|coverage|payroll|pay|people|roster|credential|onboard|compliance|policy|agent|workflow|message|communication)/i.test(text)
}

function shouldTryLocalDemoAction(eventName, line) {
  const speaker = String(line?.speaker || '').toLowerCase()
  return (
    eventName.includes('user') ||
    eventName.includes('user_transcript') ||
    speaker.includes('user') ||
    speaker.includes('visitor') ||
    speaker.includes('human')
  )
}

async function requestNovaAgentActions({ line, eventName, conversationId }) {
  const response = await fetch('/api/nova-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: line.text,
      speaker: line.speaker,
      eventName,
      conversationId,
      snapshot: getDemoSnapshot(),
    }),
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body?.message || body?.error || 'Nova agent request failed')
  }
  return body
}

export function openDemoSpecialist(source = 'unknown') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('tb:open-demo-specialist', { detail: { source } }))
}

function routeForView(view) {
  const requestedIndustry = normalizeIndustry(view)
  if (requestedIndustry) return `/${requestedIndustry}`

  const snapshot = getDemoSnapshot()
  const currentIndustry = snapshot.industry && snapshot.industry !== 'demos'
    ? snapshot.industry
    : 'healthcare'
  const safeView = String(view || 'overview').replace(/^\/+/, '')

  if (safeView === 'sage' || safeView === 'sage-dashboard') return '/sage'
  if (safeView === 'sage-workforce') return '/sage/workforce'
  if (safeView.includes('/')) return `/${safeView}`
  return safeView === 'overview'
    ? `/${currentIndustry}`
    : `/${currentIndustry}/${safeView}`
}

function highlightSelector(selector, label) {
  const el = selector ? document.querySelector(selector) : null
  if (!el) return { ok: false, reason: 'target_not_found' }

  el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  el.classList.add('demo-specialist-highlight')
  el.setAttribute('data-specialist-highlight', label || 'Teambridge specialist')
  window.setTimeout(() => {
    el.classList.remove('demo-specialist-highlight')
    el.removeAttribute('data-specialist-highlight')
  }, 5200)
  return { ok: true }
}

async function performDemoAction(action, options = {}) {
  const requestedIndustry = normalizeIndustry(options.industry || action)
  if (requestedIndustry) {
    setHashPath(`/${requestedIndustry}`)
    await sleep(options.settleMs || ACTION_SETTLE_MS)
    const target = await waitForElement(['.activity-feed-inner', '.prompt-panel', '.act1-root'])
    if (!target.el) {
      return {
        ok: false,
        reason: 'target_not_found',
        action: 'open_workspace',
        industry: requestedIndustry,
        view: 'overview',
      }
    }

    const label = options.label || `${requestedIndustry.replace(/-/g, ' ')} workspace`
    const result = highlightSelector(target.selector, label)
    return {
      ...result,
      action: 'open_workspace',
      industry: requestedIndustry,
      view: 'overview',
      selector: target.selector,
      label,
    }
  }

  const key = normalizeActionName(action)
  const config = DEMO_ACTIONS[key]
  if (!config) return { ok: false, reason: 'unknown_action', action: key }

  if (config.view) {
    setHashPath(routeForView(config.view))
    await sleep(options.settleMs || ACTION_SETTLE_MS)
  }

  const target = await waitForElement(config.selector)
  if (!target.el) {
    return {
      ok: false,
      reason: 'target_not_found',
      action: key,
      view: config.view || null,
    }
  }

  if (config.clickSelector) {
    const clickTarget = findFirst(config.clickSelector)
    clickTarget.el?.click()
    await sleep(220)
  }

  const result = highlightSelector(target.selector, options.label || config.label)
  return {
    ...result,
    action: key,
    view: config.view || null,
    selector: target.selector,
    label: options.label || config.label,
  }
}

export default function DemoSpecialist({ enabled, route, autoOpen = false }) {
  const [open, setOpen] = useState(false)
  const [signedUrl, setSignedUrl] = useState('')
  const [conversationId, setConversationId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const widgetRef = useRef(null)
  const autoStartRef = useRef(false)
  const transcriptSeenRef = useRef(new Set())
  const spokenToolFallbackRef = useRef(new Set())
  const novaAgentSeenRef = useRef(new Set())

  const lead = useMemo(() => readJsonStorage('tb:lead-data') || {}, [enabled, route])
  const dynamicVariables = useMemo(() => {
    const snapshot = getDemoSnapshot()
    return JSON.stringify({
      user_name: lead.name || lead.firstName || 'there',
      company: lead.company || 'your team',
      work_email: lead.email || '',
      industry: snapshot.industry || 'unknown',
      demo_view: snapshot.view || 'overview',
      demo_session_id: snapshot.sessionId,
      available_workspaces: 'healthcare, staffing, events, hospitality, long-term-care, security, janitorial, light-industrial, construction',
      available_demo_actions: 'schedule_gap, shift_requests, time_tracking, payroll, pay_review, people, onboarding, compliance, agents, engage, ready_workspaces',
    })
  }, [lead, route])

  useEffect(() => {
    if (!enabled) return undefined

    const handleOpen = event => {
      setOpen(true)
      trackDemoEvent('demo_specialist_open_requested', {
        source: event?.detail?.source || 'unknown',
      })
    }

    window.addEventListener('tb:open-demo-specialist', handleOpen)
    return () => window.removeEventListener('tb:open-demo-specialist', handleOpen)
  }, [enabled])

  useEffect(() => {
    if (!enabled || !autoOpen) return undefined

    const timer = window.setTimeout(() => {
      setOpen(true)
      trackDemoEvent('demo_specialist_auto_opened', { source: 'entry_page' })
    }, 900)

    return () => window.clearTimeout(timer)
  }, [enabled, autoOpen])

  useEffect(() => {
    if (!enabled || !open || signedUrl || loading) return
    let cancelled = false
    setLoading(true)
    setError('')

    loadWidgetScript().catch(err => {
      if (cancelled) return
      trackDemoEvent('demo_specialist_widget_load_failed', {
        error: String(err?.message || err),
      })
    })

    fetch('/api/elevenlabs-signed-url', { headers: { accept: 'application/json' } })
      .then(async response => {
        const body = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(body?.error || 'Unable to start specialist')
        return body
      })
      .then(body => {
        if (cancelled) return
        setSignedUrl(body.signedUrl || '')
        setConversationId(body.conversationId || '')
        trackDemoEvent('demo_specialist_ready', {
          conversationId: body.conversationId,
          agentId: body.agentId,
        })
      })
      .catch(err => {
        if (cancelled) return
        setError(String(err?.message || err))
        trackDemoEvent('demo_specialist_setup_failed', {
          error: String(err?.message || err),
        })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [enabled, open, signedUrl])

  useEffect(() => {
    const widget = widgetRef.current
    if (!widget) return

    const handleCall = event => {
      const detail = event.detail
      if (!detail) return
      detail.config = detail.config || {}
      const openWorkspaceTool = async ({ industry, workspace, vertical, label } = {}) => {
        const requested = industry || workspace || vertical
        const result = await performDemoAction(requested || 'healthcare', { label })
        const path = result.industry ? `/${result.industry}` : window.location.hash.replace(/^#/, '') || '/'
        trackDemoEvent('demo_specialist_tool_open_workspace', {
          industry: requested,
          workspace,
          vertical,
          path,
          ...result,
          conversationId,
        })
        return { ok: result.ok, path, ...result }
      }
      const showCapabilityTool = async ({ capability, action, label } = {}) => {
        const requested = capability || action
        const result = await performDemoAction(requested || 'overview', { label })
        trackDemoEvent('demo_specialist_tool_show_capability', {
          capability,
          action,
          ...result,
          conversationId,
        })
        return result
      }
      detail.config.clientTools = {
        openWorkspace: openWorkspaceTool,
        openDemoWorkspace: openWorkspaceTool,
        showWorkspace: openWorkspaceTool,
        showHealthcareWorkspace: () => openWorkspaceTool({ industry: 'healthcare', label: 'Healthcare workspace' }),
        showStaffingWorkspace: () => openWorkspaceTool({ industry: 'staffing', label: 'Staffing workspace' }),
        showEventsWorkspace: () => openWorkspaceTool({ industry: 'events', label: 'Events workspace' }),
        showHospitalityWorkspace: () => openWorkspaceTool({ industry: 'hospitality', label: 'Hospitality workspace' }),
        showSecurityWorkspace: () => openWorkspaceTool({ industry: 'security', label: 'Security workspace' }),
        showConstructionWorkspace: () => openWorkspaceTool({ industry: 'construction', label: 'Construction workspace' }),
        showCapability: showCapabilityTool,
        navigateToDemoView: ({ view }) => {
          const path = routeForView(view)
          setHashPath(path)
          trackDemoEvent('demo_specialist_tool_navigate', { view, path, conversationId })
          const industry = normalizeIndustry(view)
          return { ok: true, path, industry: industry || undefined }
        },
        runDemoScenario: async ({ scenario }) => {
          const key = String(scenario || '').toLowerCase()
          if (key.includes('overtime') || key.includes('sage')) {
            setHashPath('/sage')
            await sleep(ACTION_SETTLE_MS)
            const result = await performDemoAction('sage_overtime')
            trackDemoEvent('demo_specialist_tool_scenario', { scenario, path: '/sage', ...result, conversationId })
            return { ok: true, path: '/sage', ...result }
          }

          const action = normalizeActionName(scenario)
          const result = await performDemoAction(action)
          const path = DEMO_ACTIONS[result.action]?.view
            ? routeForView(DEMO_ACTIONS[result.action].view)
            : window.location.hash.replace(/^#/, '') || '/'
          trackDemoEvent('demo_specialist_tool_scenario', { scenario, path, ...result, conversationId })
          return { ok: result.ok, path, ...result }
        },
        performDemoAction: async ({ action, label }) => {
          const result = await performDemoAction(action, { label })
          trackDemoEvent('demo_specialist_tool_action', { action, label, ...result, conversationId })
          return result
        },
        highlightDemoAreaByName: async ({ area, label }) => {
          const result = await performDemoAction(area, { label })
          trackDemoEvent('demo_specialist_tool_named_highlight', { area, label, ...result, conversationId })
          return result
        },
        highlightDemoArea: ({ selector, label }) => {
          const result = highlightSelector(selector, label)
          trackDemoEvent('demo_specialist_tool_highlight', { selector, label, ...result, conversationId })
          return result
        },
        saveDemoNote: ({ note, intent, nextStep }) => {
          const payload = { note, intent, nextStep, conversationId }
          try {
            const notes = JSON.parse(localStorage.getItem('tb:demo-specialist-notes') || '[]')
            notes.push({ ...payload, at: Date.now(), route: window.location.href })
            localStorage.setItem('tb:demo-specialist-notes', JSON.stringify(notes.slice(-30)))
          } catch { /* ignore */ }
          trackDemoEvent('demo_specialist_note_saved', payload)
          return { ok: true }
        },
        requestMeeting: ({ reason }) => {
          trackDemoEvent('demo_specialist_meeting_requested', { reason, conversationId })
          window.open('https://www.teambridge.com/book-demo/schedule', '_blank', 'noopener,noreferrer')
          return { ok: true }
        },
      }
    }

    const runLocalActionFromText = (text, source) => {
      const action = actionFromDemoText(text)
      if (!action) return false

      const actionKey = `${source}:${action.kind}:${action.value}:${String(text).slice(0, 160)}`
      if (novaAgentSeenRef.current.has(actionKey)) return true
      novaAgentSeenRef.current.add(actionKey)

      performDemoAction(action.value, { label: action.label })
        .then(result => {
          trackDemoEvent('nova_agent_local_action_executed', {
            source,
            kind: action.kind,
            value: action.value,
            label: action.label,
            text,
            ok: result.ok,
            reason: result.reason,
            action: result.action,
            industry: result.industry,
            view: result.view,
            conversationId,
          })
        })
        .catch(err => {
          trackDemoEvent('nova_agent_local_action_failed', {
            source,
            kind: action.kind,
            value: action.value,
            text,
            error: String(err?.message || err),
            conversationId,
          })
        })

      return true
    }

    widget.addEventListener('elevenlabs-convai:call', handleCall)
    const handleTranscript = event => {
      const line = transcriptFromDetail(event.detail)
      const compact = compactDetail(event.detail)
      if (!line) {
        trackDemoEvent('demo_specialist_widget_event', {
          eventName: event.type,
          detail: compact,
          conversationId,
        })
        return
      }

      const key = `${event.type}:${line.speaker}:${line.text}`
      if (transcriptSeenRef.current.has(key)) return
      transcriptSeenRef.current.add(key)
      trackDemoEvent('demo_specialist_transcript', {
        eventName: event.type,
        speaker: line.speaker,
        text: line.text,
        conversationId,
      })

      const speaker = String(line.speaker || '').toLowerCase()
      const shouldInspect =
        speaker.includes('nova') ||
        speaker.includes('agent') ||
        speaker.includes('assistant') ||
        event.type.includes('agent')
      const fallback = shouldInspect ? spokenToolAction(line.text) : null

      if (fallback) {
        const fallbackKey = `${fallback.kind}:${fallback.value}:${line.text.slice(0, 120)}`
        if (!spokenToolFallbackRef.current.has(fallbackKey)) {
          spokenToolFallbackRef.current.add(fallbackKey)

          performDemoAction(fallback.value, { label: fallback.label })
            .then(result => {
              trackDemoEvent('demo_specialist_spoken_tool_fallback', {
                kind: fallback.kind,
                value: fallback.value,
                label: fallback.label,
                ok: result.ok,
                reason: result.reason,
                action: result.action,
                industry: result.industry,
                view: result.view,
                conversationId,
              })
            })
            .catch(err => {
              trackDemoEvent('demo_specialist_spoken_tool_fallback_failed', {
                kind: fallback.kind,
                value: fallback.value,
                error: String(err?.message || err),
                conversationId,
              })
            })
        }
      }

      if (!shouldAskNovaAgent(event.type, line)) return

      if (fallback) {
        trackDemoEvent('nova_agent_orchestration_skipped', {
          reason: 'spoken_tool_fallback_already_handled',
          eventName: event.type,
          speaker: line.speaker,
          text: line.text,
          conversationId,
        })
        return
      }

      const localAction = shouldTryLocalDemoAction(event.type, line)
        ? actionFromDemoText(line.text)
        : null

      if (localAction) {
        const localKey = `${localAction.kind}:${localAction.value}:${line.text.slice(0, 160)}`
        if (!novaAgentSeenRef.current.has(localKey)) {
          novaAgentSeenRef.current.add(localKey)
          performDemoAction(localAction.value, { label: localAction.label })
            .then(result => {
              trackDemoEvent('nova_agent_local_action_executed', {
                kind: localAction.kind,
                value: localAction.value,
                label: localAction.label,
                text: line.text,
                ok: result.ok,
                reason: result.reason,
                action: result.action,
                industry: result.industry,
                view: result.view,
                conversationId,
              })
            })
            .catch(err => {
              trackDemoEvent('nova_agent_local_action_failed', {
                kind: localAction.kind,
                value: localAction.value,
                text: line.text,
                error: String(err?.message || err),
                conversationId,
              })
            })
        }
        return
      }

      const agentKey = `${event.type}:${line.speaker}:${line.text.slice(0, 220)}`
      if (novaAgentSeenRef.current.has(agentKey)) return
      novaAgentSeenRef.current.add(agentKey)

      requestNovaAgentActions({ line, eventName: event.type, conversationId })
        .then(async body => {
          const actions = Array.isArray(body.actions) ? body.actions.slice(0, 3) : []
          trackDemoEvent('nova_agent_orchestration_result', {
            eventName: event.type,
            speaker: line.speaker,
            text: line.text,
            intent: body.intent,
            confidence: body.confidence,
            actionCount: actions.length,
            rationale: body.rationale,
            conversationId,
          })

          for (const action of actions) {
            const result = await performDemoAction(action.value, { label: action.label })
            trackDemoEvent('nova_agent_action_executed', {
              kind: action.kind,
              value: action.value,
              label: action.label,
              ok: result.ok,
              reason: result.reason,
              action: result.action,
              industry: result.industry,
              view: result.view,
              conversationId,
            })
          }
        })
        .catch(err => {
          trackDemoEvent('nova_agent_orchestration_failed', {
            eventName: event.type,
            speaker: line.speaker,
            text: line.text,
            error: String(err?.message || err),
            conversationId,
          })
        })
    }

    const handleWidgetKeydown = event => {
      if (event.key !== 'Enter' || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return
      const text = latestWidgetInputText(widget)
      if (text) runLocalActionFromText(text, 'widget_text_enter')
    }

    const handleWidgetClick = event => {
      const label = labelForControl(event.target || {})
      if (!label.includes('send') && !label.includes('submit')) return
      const text = latestWidgetInputText(widget)
      if (text) runLocalActionFromText(text, 'widget_text_submit')
    }

    const transcriptTargets = [widget, window, document]
    TRANSCRIPT_EVENTS.forEach(eventName => {
      transcriptTargets.forEach(target => target.addEventListener(eventName, handleTranscript))
    })
    widget.addEventListener('keydown', handleWidgetKeydown, true)
    widget.addEventListener('click', handleWidgetClick, true)

    return () => {
      widget.removeEventListener('elevenlabs-convai:call', handleCall)
      TRANSCRIPT_EVENTS.forEach(eventName => {
        transcriptTargets.forEach(target => target.removeEventListener(eventName, handleTranscript))
      })
      widget.removeEventListener('keydown', handleWidgetKeydown, true)
      widget.removeEventListener('click', handleWidgetClick, true)
    }
  }, [conversationId, signedUrl])

  useEffect(() => {
    if (!open || !signedUrl || autoStartRef.current) return undefined
    autoStartRef.current = true

    let attempts = 0
    const timer = window.setInterval(() => {
      attempts += 1
      const widget = widgetRef.current
      hideElevenLabsBranding(widget)
      cleanupElevenLabsTerms(widget)

      const agreed = clickGlobalConsentControl(label => (
        label === 'agree' ||
        label === 'accept' ||
        label === 'i agree' ||
        label === 'continue'
      )) || clickVisibleAcceptFallback()

      if (agreed) {
        trackDemoEvent('demo_specialist_terms_auto_accepted', { attempts, label: agreed })
        return
      }

      const started = clickWidgetControl(widget, label => (
        label.includes('start') ||
        label.includes('call') ||
        label.includes('talk') ||
        label.includes('voice demo')
      )) || clickVisibleStartFallback(widget)

      if (started) {
        trackDemoEvent('demo_specialist_auto_start_attempted', { attempts, label: started })
        window.clearInterval(timer)
      } else if (attempts >= 24) {
        trackDemoEvent('demo_specialist_auto_start_unavailable', { attempts })
        window.clearInterval(timer)
      }
    }, 500)

    return () => window.clearInterval(timer)
  }, [open, signedUrl])

  useEffect(() => {
    if (!open || !signedUrl) return undefined

    let attempts = 0
    const timer = window.setInterval(() => {
      attempts += 1
      hideElevenLabsBranding(widgetRef.current)
      cleanupElevenLabsTerms(widgetRef.current)
      if (attempts >= 120) {
        window.clearInterval(timer)
      }
    }, 500)

    return () => window.clearInterval(timer)
  }, [open, signedUrl])

  if (!enabled) return null

  return (
    <div className={`demo-specialist ${open ? 'is-open' : ''}`}>
      {open && (
        <section className="demo-specialist-widget" aria-label="Teambridge AI demo specialist">
          {loading && <div className="demo-specialist-state">Connecting Nova...</div>}
          {error && (
            <div className="demo-specialist-state demo-specialist-state--error">
              {error}
            </div>
          )}
          {signedUrl && (
            <elevenlabs-convai
              ref={widgetRef}
              signed-url={signedUrl}
              server-location="us"
              variant="expanded"
              dismissible="true"
              disable-banner="true"
              default-expanded="true"
              transcript-enabled="true"
              text-input-enabled="true"
              avatar-image-url={NOVA_AVATAR}
              action-text="Talk to Teambridge"
              start-call-text="Start voice demo"
              end-call-text="End demo"
              listening-text="Listening..."
              speaking-text="Nova is speaking"
              dynamic-variables={dynamicVariables}
            />
          )}
        </section>
      )}
    </div>
  )
}
