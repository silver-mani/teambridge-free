import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { trackDemoEvent, getDemoSnapshot } from '../lib/demoTracking.js'

const BASE = import.meta.env.BASE_URL
const NOVA_AVATAR = `${BASE}agents/nova.gif`
const BOOK_DEMO_URL = 'https://www.teambridge.com/book-demo/schedule'
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
  build_workspace: {
    selector: ['.ob-root', '.ob-right-title', '.entry-build-panel'],
    label: 'Build my workspace from company context',
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
  if (key.includes('build') || key.includes('create') || key.includes('company') || key.includes('website') || key.includes('domain')) return 'build_workspace'
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

  if (
    lower.includes('build my workspace') ||
    lower.includes('create my workspace') ||
    lower.includes('start with my company') ||
    lower.includes('my company') ||
    lower.includes('company website') ||
    lower.includes('use my website') ||
    lower.includes('my domain')
  ) {
    return {
      kind: 'action',
      value: 'build_workspace',
      label: DEMO_ACTIONS.build_workspace.label,
    }
  }

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
    ['ready_workspaces', ['ready-made workspace', 'preloaded workspace', 'vertical', 'industry', 'demo account', 'preloaded']],
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

function formatLeadContext(leadContext = {}) {
  const research = leadContext.domainResearch || {}
  const parts = []
  if (leadContext.company) parts.push(`company: ${leadContext.company}`)
  if (leadContext.submittedDomain) parts.push(`domain: ${leadContext.submittedDomain}`)
  if (research.industry) parts.push(`researched industry: ${String(research.industry).replace(/-/g, ' ')}`)
  if (research.summary) parts.push(`research summary: ${research.summary}`)
  if (Array.isArray(research.roles) && research.roles.length) parts.push(`likely roles: ${research.roles.slice(0, 4).join(', ')}`)
  if (Array.isArray(research.locations) && research.locations.length) {
    parts.push(`likely locations: ${research.locations.slice(0, 3).map(location => location.name || location.city).filter(Boolean).join(', ')}`)
  }
  if (Array.isArray(research.goals) && research.goals.length) {
    parts.push(`likely priorities: ${research.goals.slice(0, 3).map(goal => goal.label || goal).filter(Boolean).join(', ')}`)
  }
  return parts.join('; ')
}

export function bookingUrlForLead(leadContext = {}) {
  const url = new URL(BOOK_DEMO_URL)
  if (leadContext.email) url.searchParams.set('email', leadContext.email)
  const name = leadContext.company || leadContext.name || leadContext.firstName
  if (name) url.searchParams.set('name', name)
  return url.toString()
}

// Ordered itinerary for the guided tour. Each stop opens a real screen
// (reusing performDemoAction keys) and gives Nova concrete talking points so
// the narration is specific, not vague. The driver below walks these in order,
// auto-advancing between them.
const TOUR_STOPS = [
  { action: 'overview', label: 'Command center',
    script: "This is the command center — the feed shows what Teambridge is already handling, with the important items kept at the top." },
  { action: 'schedule_gap', label: 'Schedule & coverage',
    script: "Scheduling and coverage. When a shift opens, Teambridge finds qualified replacements and ranks them by fit." },
  { action: 'shift_requests', label: 'Shift requests',
    script: "Swap and time-off requests land here. Clean ones clear automatically; anything risky gets routed with the reason attached." },
  { action: 'people', label: 'People & credentials',
    script: "The roster — credentials, certs, and work status stay live, so expiring items get caught before they cause gaps." },
  { action: 'onboarding', label: 'Onboarding',
    script: "Onboarding moves a new hire to ready-to-work. Forms, checks, and reminders advance without a manager chasing each step." },
  { action: 'payroll', label: 'Pay',
    script: "Pay pulls time, premiums, overtime, and approvals together before payroll closes. Managers see only the exceptions." },
  { action: 'compliance', label: 'Compliance',
    script: "Compliance keeps the rules visible — policies and labor checks are enforced as work happens, with an audit trail behind each decision." },
  { action: 'agents', label: 'AI agents',
    script: "The AI agents behind the scenes. They handle coverage, reminders, and escalations while you keep control over approvals." },
]

const TOUR_QUESTION_TEXT = 'Any questions on this before I keep going?'
const TRANSCRIPT_REVEAL_MS_PER_CHAR = 45
const TOUR_AFTER_NARRATION_PAUSE_MS = 900
const TOUR_QUESTION_PAUSE_MS = 9000

function OpenAIRealtimeNova({
  clientSecret,
  model,
  conversationId,
  leadContext,
  autoStart = false,
}) {
  const [status, setStatus] = useState('Tap Call or type below')
  const [error, setError] = useState('')
  const [text, setText] = useState('')
  const [transcript, setTranscript] = useState([])
  const [bookingOpen, setBookingOpen] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)
  const [micActivity, setMicActivity] = useState('idle')
  const [tour, setTour] = useState({ active: false, index: 0, paused: false })
  const transcriptRef = useRef(null)
  // Mirror tour state in a ref so the realtime event handler (a stable
  // closure) always reads the current step without going stale.
  const tourRef = useRef({ active: false, index: 0, paused: false })
  const tourAdvanceTimerRef = useRef(null)
  const tourPhaseRef = useRef('idle')
  const pendingTourStartRef = useRef(false)
  const transcriptRevealTimerRef = useRef(null)
  const audioCtxRef = useRef(null)
  const peerRef = useRef(null)
  const channelRef = useRef(null)
  const audioRef = useRef(null)
  const micSenderRef = useRef(null)
  const micStreamRef = useRef(null)
  const micAudioContextRef = useRef(null)
  const micMeterTimerRef = useRef(null)
  const functionCallsRef = useRef(new Map())
  const executedToolCallsRef = useRef(new Set())
  const responseActiveRef = useRef(false)
  const pendingResponseRef = useRef(null)
  const pendingTypedPromptRef = useRef(null)
  const pendingMicStartRef = useRef(false)
  const pendingMicStreamRef = useRef(null)
  // Tracks the in-progress Nova transcript line so we can stream her words
  // into the sidebar live as she speaks, then finalize when she's done.
  const novaStreamRef = useRef({ id: null, text: '' })
  const companyContext = formatLeadContext(leadContext)
  const bookingUrl = bookingUrlForLead(leadContext || {})

  useEffect(() => {
    if (!transcriptRef.current) return
    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
  }, [transcript])

  const addTranscript = (speaker, value, meta = {}) => {
    const content = String(value || '').trim()
    if (!content) return
    setTranscript(prev => {
      const last = prev[prev.length - 1]
      if (last && last.speaker === speaker && last.text === content) return prev
      return [
        ...prev,
        {
          id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
          speaker,
          text: content,
          at: Date.now(),
          ...meta,
        },
      ].slice(-80)
    })
  }

  const clearNovaRevealTimer = () => {
    if (transcriptRevealTimerRef.current) {
      window.clearInterval(transcriptRevealTimerRef.current)
      transcriptRevealTimerRef.current = null
    }
  }

  const ensureNovaStreamLine = () => {
    if (novaStreamRef.current.id) return novaStreamRef.current.id
    const newId = `${Date.now()}_${Math.random().toString(36).slice(2)}`
    novaStreamRef.current.id = newId
    setTranscript(prev => [
      ...prev,
      { id: newId, speaker: 'Nova', text: '', at: Date.now(), streaming: true },
    ].slice(-80))
    return newId
  }

  const estimateRemainingTranscriptMs = () => {
    const stream = novaStreamRef.current
    const remaining = Math.max(0, String(stream.target || '').length - String(stream.text || '').length)
    return remaining * TRANSCRIPT_REVEAL_MS_PER_CHAR
  }

  const scheduleNovaReveal = () => {
    if (transcriptRevealTimerRef.current) return
    transcriptRevealTimerRef.current = window.setInterval(() => {
      const stream = novaStreamRef.current
      const target = String(stream.target || '')
      const displayed = String(stream.text || '')
      const id = stream.id

      if (!id || (!target && !stream.done)) {
        clearNovaRevealTimer()
        return
      }

      if (displayed.length < target.length) {
        const next = target.slice(0, displayed.length + 1)
        novaStreamRef.current = { ...stream, text: next }
        setTranscript(prev => prev.map(line => (line.id === id ? { ...line, text: next, streaming: true } : line)))
        return
      }

      if (stream.done) {
        clearNovaRevealTimer()
        setTranscript(prev => prev.map(line => (line.id === id ? { ...line, text: target, streaming: false } : line)))
        novaStreamRef.current = { id: null, text: '', target: '', done: false }
      }
    }, TRANSCRIPT_REVEAL_MS_PER_CHAR)
  }

  // Buffer Nova's transcript and reveal it at a speaking pace. Realtime
  // transcript deltas can arrive ahead of audio playback; showing them
  // immediately makes the sidebar feel disconnected from the voice.
  const appendNovaStream = delta => {
    const chunk = String(delta || '')
    if (!chunk) return
    ensureNovaStreamLine()
    novaStreamRef.current.target = `${novaStreamRef.current.target || ''}${chunk}`
    scheduleNovaReveal()
  }

  // Finalize the streaming line with the authoritative transcript, but keep the
  // reveal paced instead of dumping the full sentence ahead of the voice.
  const finalizeNovaStream = finalText => {
    const text = String(finalText || novaStreamRef.current.target || novaStreamRef.current.text || '').trim()
    if (!text) return
    ensureNovaStreamLine()
    novaStreamRef.current.target = text
    novaStreamRef.current.done = true
    scheduleNovaReveal()
  }

  const finishNovaStreamNow = () => {
    const stream = novaStreamRef.current
    const text = String(stream.target || stream.text || '').trim()
    const id = stream.id
    clearNovaRevealTimer()
    novaStreamRef.current = { id: null, text: '', target: '', done: false }
    if (!text) return
    if (id) {
      setTranscript(prev => prev.map(line => (line.id === id ? { ...line, text, streaming: false } : line)))
      return
    }
    addTranscript('Nova', text)
  }

  const introInstructions = [
    'Start speaking now.',
    'Say: "Hi, I am Nova, your Teambridge demo guide."',
    companyContext
      ? `Use this visitor context without overclaiming: ${companyContext}.`
      : 'No visitor context is available yet.',
    companyContext
      ? 'Explain in two short sentences how Teambridge would help this specific operation based on that context.'
      : 'Explain in two short sentences that Teambridge helps teams fill shifts, monitor compliance, manage onboarding, payroll, and workforce issues from one live workspace.',
    'Offer two clear paths: build a workspace from their company website or short description, or open a ready-made workspace by vertical.',
    'Tell the visitor they can say "build my workspace" or ask you to open healthcare, staffing, hospitality, security, construction, facilities, events, long-term care, or industrial.',
    'End with one clear question: "Should I build your workspace or open a ready-made one?"',
  ].join(' ')

  const sendEvent = event => {
    const channel = channelRef.current
    if (!channel || channel.readyState !== 'open') return false
    channel.send(JSON.stringify(event))
    return true
  }

  const createRealtimeResponse = response => {
    const event = { type: 'response.create', response }
    if (responseActiveRef.current) {
      pendingResponseRef.current = event
      return false
    }

    responseActiveRef.current = true
    const sent = sendEvent(event)
    if (!sent) {
      responseActiveRef.current = false
      pendingResponseRef.current = event
    }
    return sent
  }

  const flushPendingResponse = () => {
    if (responseActiveRef.current || !pendingResponseRef.current) return
    const event = pendingResponseRef.current
    pendingResponseRef.current = null
    responseActiveRef.current = true
    const sent = sendEvent(event)
    if (!sent) {
      responseActiveRef.current = false
      pendingResponseRef.current = event
    }
  }

  const sendTypedPromptToRealtime = prompt => {
    const value = String(prompt?.text || '').trim()
    if (!value) return false

    const sent = sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: value }],
      },
    })
    if (!sent) return false

    const localLabel = prompt?.localLabel
    const customInstructions = prompt?.instructions
    createRealtimeResponse({
      output_modalities: ['audio'],
      instructions: localLabel
        ? `The browser already opened ${localLabel}. Respond out loud with one short sentence saying what changed, then offer one useful next area.`
        : customInstructions || 'Respond out loud to the visitor typed prompt. If they asked to show or open a workspace or capability, call the matching tool immediately before explaining.',
    })
    return true
  }

  const flushPendingTypedPrompt = () => {
    const pending = pendingTypedPromptRef.current
    if (!pending) return
    if (sendTypedPromptToRealtime(pending)) {
      pendingTypedPromptRef.current = null
    }
  }

  const executeToolCall = async ({ name, arguments: rawArguments, call_id: callId }) => {
    if (tourRef.current.active && !tourRef.current.paused) {
      return
    }

    if (callId) {
      if (executedToolCallsRef.current.has(callId)) return
      executedToolCallsRef.current.add(callId)
    }

    let args = {}
    try {
      args = typeof rawArguments === 'string' ? JSON.parse(rawArguments || '{}') : (rawArguments || {})
    } catch {
      args = {}
    }

    let output = { ok: false, reason: 'unknown_tool' }
    try {
      if (name === 'openWorkspace') {
        const result = await performDemoAction(args.industry || 'healthcare', {
          label: `${String(args.industry || 'healthcare').replace(/-/g, ' ')} workspace`,
        })
        output = { ...result, ok: result.ok }
      } else if (name === 'buildWorkspace') {
        const result = await performDemoAction('build_workspace', {
          label: 'Build my workspace',
        })
        output = { ...result, ok: result.ok }
      } else if (name === 'showCapability') {
        const result = await performDemoAction(args.capability || 'overview')
        output = { ...result, ok: result.ok }
      } else if (name === 'requestMeeting') {
        setBookingOpen(true)
        output = { ok: true, reason: args.reason || 'meeting_requested' }
      }

      trackDemoEvent('nova_realtime_tool_executed', {
        name,
        args,
        output,
        conversationId,
      })
    } catch (err) {
      output = { ok: false, error: String(err?.message || err) }
      trackDemoEvent('nova_realtime_tool_failed', {
        name,
        args,
        error: output.error,
        conversationId,
      })
    }

    if (callId) {
      sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify(output),
        },
      })
      createRealtimeResponse({
        output_modalities: ['audio'],
        instructions: output.ok
          ? 'Briefly tell the visitor what changed and offer one useful next area to inspect.'
          : 'Briefly say you could not complete that action and ask what they want to see next.',
      })
    }
  }

  const handleRealtimeEvent = event => {
    let payload
    try {
      payload = JSON.parse(event.data)
    } catch {
      return
    }

    if (payload.type === 'conversation.item.input_audio_transcription.completed') {
      addTranscript('You', payload.transcript || '')
      trackDemoEvent('nova_realtime_user_transcript', {
        text: payload.transcript || '',
        conversationId,
      })
    }

    // gpt-realtime emits `output_audio_transcript`; older models use
    // `audio_transcript`. Handle both so the sidebar transcript always fills.
    if (
      payload.type === 'response.output_audio_transcript.done' ||
      payload.type === 'response.audio_transcript.done' ||
      payload.type === 'response.output_text.done'
    ) {
      const finalText = payload.transcript || payload.text || ''
      finalizeNovaStream(finalText)
      trackDemoEvent('nova_realtime_transcript', {
        text: finalText,
        conversationId,
      })
    }

    if (payload.type === 'error') {
      const message = payload.error?.message || payload.message || 'Nova realtime error'
      if (/active response in progress/i.test(message)) {
        responseActiveRef.current = true
        window.setTimeout(() => {
          responseActiveRef.current = false
          flushPendingResponse()
        }, 1200)
      }
      setError(message)
      setStatus('Nova is ready')
      trackDemoEvent('nova_realtime_event_error', {
        error: message,
        code: payload.error?.code,
        conversationId,
      })
      return
    }

    if (payload.type === 'response.created') {
      responseActiveRef.current = true
      // Fresh response — start a new streaming transcript line.
      clearNovaRevealTimer()
      novaStreamRef.current = { id: null, text: '', target: '', done: false }
      setStatus('Nova is thinking...')
    }

    // Spoken words stream in as transcript deltas — append them live so the
    // sidebar transcribes in step with Nova's voice. gpt-realtime sends
    // `output_audio_transcript.delta`; older models `audio_transcript.delta`.
    // (Raw audio byte deltas carry no text, so they only update status below.)
    if (
      payload.type === 'response.output_audio_transcript.delta' ||
      payload.type === 'response.audio_transcript.delta' ||
      payload.type === 'response.output_text.delta'
    ) {
      setStatus('Nova is speaking')
      appendNovaStream(payload.delta)
    }

    if (payload.type === 'response.output_audio.delta' || payload.type === 'response.audio.delta') {
      setStatus('Nova is speaking')
    }

    if (payload.type === 'response.done') {
      responseActiveRef.current = false
      window.setTimeout(flushPendingResponse, 60)
      // Guided tour: Nova narrates a section, asks a quick check-in, then
      // continues automatically after a short pause unless the visitor speaks
      // or types.
      const t = tourRef.current
      if (t.active && !t.paused) {
        setStatus(`Guided tour · ${Math.min(t.index + 1, TOUR_STOPS.length)} / ${TOUR_STOPS.length}`)
        clearTourAdvance()
        if (tourPhaseRef.current === 'narrating') {
          tourAdvanceTimerRef.current = window.setTimeout(() => {
            tourAdvanceTimerRef.current = null
            if (!tourRef.current.active || tourRef.current.paused || tourPhaseRef.current !== 'narrating') return
            if (tourRef.current.index + 1 >= TOUR_STOPS.length) {
              finishTour()
            } else {
              askTourQuestion()
            }
          }, estimateRemainingTranscriptMs() + TOUR_AFTER_NARRATION_PAUSE_MS)
        } else if (tourPhaseRef.current === 'question') {
          tourPhaseRef.current = 'waiting'
          setStatus('Nova is waiting for your question')
          tourAdvanceTimerRef.current = window.setTimeout(() => {
            tourAdvanceTimerRef.current = null
            if (!tourRef.current.active || tourRef.current.paused || tourPhaseRef.current !== 'waiting') return
            runTourStep(tourRef.current.index + 1)
          }, estimateRemainingTranscriptMs() + TOUR_QUESTION_PAUSE_MS)
        }
      } else {
        setStatus(micEnabled ? 'Nova is listening' : 'Tap Talk to respond')
      }
    }

    if (payload.type === 'input_audio_buffer.speech_started') {
      setMicActivity('hearing')
      setStatus('Nova hears you')
      // Talking over the tour takes the wheel — pause auto-advance.
      pauseTour('speech')
    }

    if (payload.type === 'input_audio_buffer.speech_stopped') {
      setMicActivity('listening')
      setStatus('Nova is thinking...')
    }

    if (payload.type === 'response.function_call_arguments.delta') {
      const id = payload.call_id || payload.item_id
      if (!id) return
      const current = functionCallsRef.current.get(id) || {
        name: payload.name,
        arguments: '',
        call_id: payload.call_id,
      }
      current.arguments += payload.delta || ''
      current.name = payload.name || current.name
      current.call_id = payload.call_id || current.call_id
      functionCallsRef.current.set(id, current)
      return
    }

    if (payload.type === 'response.function_call_arguments.done') {
      const id = payload.call_id || payload.item_id
      const current = functionCallsRef.current.get(id) || {}
      functionCallsRef.current.delete(id)
      executeToolCall({
        name: payload.name || current.name,
        arguments: payload.arguments || current.arguments,
        call_id: payload.call_id || current.call_id || id,
      })
      return
    }

    const item = payload.item
    if (payload.type === 'response.output_item.done' && item?.type === 'function_call') {
      executeToolCall({
        name: item.name,
        arguments: item.arguments,
        call_id: item.call_id,
      })
    }
  }

  const startSession = async () => {
    if (!clientSecret || peerRef.current) return
    setError('')
    setStatus('Nova is saying hello...')

    try {
      const peer = new RTCPeerConnection()
      peerRef.current = peer

      const audio = document.createElement('audio')
      audio.autoplay = true
      audioRef.current = audio
      peer.ontrack = event => {
        audio.srcObject = event.streams[0]
        audio.play?.().catch(() => {})
      }

      const audioTransceiver = peer.addTransceiver('audio', { direction: 'sendrecv' })
      micSenderRef.current = audioTransceiver.sender
      if (pendingMicStreamRef.current) {
        const [track] = pendingMicStreamRef.current.getAudioTracks()
        if (track) {
          await audioTransceiver.sender.replaceTrack(track)
        }
      }

      const channel = peer.createDataChannel('oai-events')
      channelRef.current = channel
      channel.onmessage = handleRealtimeEvent
      channel.onopen = () => {
        pendingMicStartRef.current = false
        setStatus('Nova is speaking')
        if (pendingTourStartRef.current) {
          pendingTourStartRef.current = false
          runTourStep(0)
        } else if (pendingTypedPromptRef.current) {
          flushPendingTypedPrompt()
        } else {
          createRealtimeResponse({
            output_modalities: ['audio'],
            instructions: introInstructions,
          })
        }
        trackDemoEvent('nova_realtime_connected', { model, conversationId })
      }

      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)

      const response = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      })

      if (!response.ok) {
        const detail = await response.text().catch(() => '')
        throw new Error(detail || `Realtime connection failed (${response.status})`)
      }

      await peer.setRemoteDescription({
        type: 'answer',
        sdp: await response.text(),
      })
    } catch (err) {
      if (pendingMicStartRef.current) {
        pendingMicStreamRef.current?.getTracks?.().forEach(track => track.stop())
        pendingMicStreamRef.current = null
        pendingMicStartRef.current = false
        micStreamRef.current = null
        setMicEnabled(false)
        setMicActivity('idle')
      }
      setStatus('Nova is ready')
      const message = String(err?.message || err)
      const friendly = /not supported|permission|denied|mediaDevices|getUserMedia/i.test(message)
        ? 'Voice needs microphone access. You can still type a command below.'
        : message
      setError(friendly)
      trackDemoEvent('nova_realtime_failed', {
        error: message,
        conversationId,
      })
    }
  }

  const stopSession = () => {
    channelRef.current?.close()
    micStreamRef.current?.getTracks?.().forEach(track => track.stop())
    if (pendingMicStreamRef.current && pendingMicStreamRef.current !== micStreamRef.current) {
      pendingMicStreamRef.current.getTracks?.().forEach(track => track.stop())
    }
    stopMicMeter()
    peerRef.current?.getSenders?.().forEach(sender => sender.track?.stop())
    peerRef.current?.close()
    peerRef.current = null
    channelRef.current = null
    micSenderRef.current = null
    micStreamRef.current = null
    pendingMicStartRef.current = false
    pendingMicStreamRef.current = null
    responseActiveRef.current = false
    pendingResponseRef.current = null
    pendingTypedPromptRef.current = null
    pendingTourStartRef.current = false
    tourPhaseRef.current = 'idle'
    clearTourAdvance()
    clearNovaRevealTimer()
    novaStreamRef.current = { id: null, text: '', target: '', done: false }
    setTourState({ active: false, paused: false, index: 0 })
    executedToolCallsRef.current.clear()
    setMicEnabled(false)
    setMicActivity('idle')
    setStatus('Nova is ready')
  }

  const stopMicMeter = () => {
    if (micMeterTimerRef.current) {
      window.clearInterval(micMeterTimerRef.current)
      micMeterTimerRef.current = null
    }
    micAudioContextRef.current?.close?.().catch?.(() => {})
    micAudioContextRef.current = null
  }

  const startMicMeter = stream => {
    stopMicMeter()
    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext
      if (!AudioContextCtor) return
      const audioContext = new AudioContextCtor()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      const data = new Uint8Array(analyser.fftSize)
      micAudioContextRef.current = audioContext
      micMeterTimerRef.current = window.setInterval(() => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i += 1) {
          const centered = (data[i] - 128) / 128
          sum += centered * centered
        }
        const rms = Math.sqrt(sum / data.length)
        setMicActivity(rms > 0.035 ? 'hearing' : 'listening')
      }, 120)
    } catch {
      setMicActivity('listening')
    }
  }

  const enableMic = async () => {
    if (micEnabled) return
    setError('')
    setStatus('Requesting microphone...')
    try {
      const hadPeer = Boolean(peerRef.current)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream
      pendingMicStreamRef.current = stream
      const [track] = stream.getAudioTracks()
      if (hadPeer) {
        await micSenderRef.current?.replaceTrack(track)
      } else {
        pendingMicStartRef.current = true
        setStatus('Connecting voice...')
        startSession()
      }
      startMicMeter(stream)
      setMicEnabled(true)
      setMicActivity('listening')
      if (hadPeer) setStatus('Nova is listening')
      trackDemoEvent('nova_realtime_microphone_enabled', { conversationId })
    } catch (err) {
      const message = String(err?.message || err)
      setStatus('Nova is speaking')
      setError('Microphone access was not enabled. You can still type below.')
      setMicActivity('idle')
      trackDemoEvent('nova_realtime_microphone_failed', {
        error: message,
        conversationId,
      })
    }
  }

  const toggleVoice = () => {
    if (micEnabled) {
      stopSession()
      return
    }
    enableMic()
  }

  const submitText = event => {
    event.preventDefault()
    const value = text.trim()
    if (!value) return
    setText('')
    setError('')
    // Typing mid-tour takes control — pause auto-advance and answer them.
    pauseTour('typed')
    addTranscript('You', value, { source: 'typed' })

    const local = actionFromDemoText(value)
    if (local) {
      performDemoAction(local.value, { label: local.label })
        .then(result => {
          addTranscript('Nova', result.ok
            ? `Opened ${local.label || 'that part of the demo'}.`
            : `I could not find that area yet. Try asking for scheduling, payroll, people, onboarding, compliance, agents, or messages.`
          )
        })
        .catch(() => {
          addTranscript('Nova', 'I could not move the demo there yet. Try another product area.')
        })
      trackDemoEvent('nova_realtime_text_local_action', {
        value: local.value,
        kind: local.kind,
        conversationId,
      })
    }

    if (sendTypedPromptToRealtime({
      text: value,
      localLabel: local ? local.label : '',
    })) {
      return
    }

    if (clientSecret) {
      pendingTypedPromptRef.current = {
        text: value,
        localLabel: local ? local.label : '',
      }
      setStatus('Nova is connecting to answer...')
      startSession()
      trackDemoEvent('nova_realtime_text_queued_for_voice', {
        value,
        hasLocalAction: Boolean(local),
        conversationId,
      })
      return
    }

    if (local) return

    setStatus('Nova is reading...')
    requestNovaAgentActions({
      line: { text: value, speaker: 'user' },
      eventName: 'typed_prompt',
      conversationId,
    })
      .then(async body => {
        const actions = Array.isArray(body.actions) ? body.actions.slice(0, 3) : []
        if (!actions.length) {
          addTranscript('Nova', body.spokenResponse || 'Ask me to open a workspace or show scheduling, payroll, people, onboarding, compliance, agents, or messages.')
          return
        }

        for (const action of actions) {
          const result = await performDemoAction(action.value, { label: action.label })
          addTranscript('Nova', result.ok
            ? `Opened ${action.label || 'that part of the demo'}.`
            : `I could not find ${action.label || 'that area'} yet.`
          )
        }
      })
      .catch(err => {
        addTranscript('Nova', 'I could not process that text command. Try asking for a specific workspace or product area.')
        trackDemoEvent('nova_realtime_text_agent_failed', {
          error: String(err?.message || err),
          conversationId,
        })
      })
      .finally(() => {
        setStatus(micEnabled ? 'Nova is listening' : 'Tap Talk or type below')
      })
  }

  const openBooking = () => {
    setBookingOpen(true)
    trackDemoEvent('demo_talk_to_team_clicked', {
      source: 'nova_sidebar',
      hasEmail: Boolean(leadContext?.email),
      conversationId,
    })
  }

  // Keep the tour ref and the render state in lockstep.
  const setTourState = partial => {
    tourRef.current = { ...tourRef.current, ...partial }
    setTour(tourRef.current)
  }

  const clearTourAdvance = () => {
    if (tourAdvanceTimerRef.current) {
      window.clearTimeout(tourAdvanceTimerRef.current)
      tourAdvanceTimerRef.current = null
    }
  }

  // Cut Nova off mid-sentence — sends response.cancel so Pause / End / barge-in
  // feel instant instead of letting the current turn play out.
  const cancelActiveResponse = () => {
    if (responseActiveRef.current) {
      sendEvent({ type: 'response.cancel' })
    }
    responseActiveRef.current = false
    pendingResponseRef.current = null
    finishNovaStreamNow()
  }

  // Soft two-note cue (Web Audio) so the tour start feels like something
  // begins. Synthesized — no asset to ship. The click that starts the tour is
  // a user gesture, so the AudioContext is allowed to make sound.
  const playTourChime = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return
      let ctx = audioCtxRef.current
      if (!ctx) { ctx = new Ctx(); audioCtxRef.current = ctx }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})
      const now = ctx.currentTime
      ;[{ f: 587.33, t: 0 }, { f: 880, t: 0.16 }].forEach(({ f, t }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = f
        const start = now + t
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.linearRampToValueAtTime(0.16, start + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32)
        osc.connect(gain).connect(ctx.destination)
        osc.start(start)
        osc.stop(start + 0.34)
      })
    } catch { /* sound is non-essential */ }
  }

  // Build the spoken directive for a given stop. The tour should sound like a
  // product specialist walking beside the visitor, not a screen reader listing
  // numbered steps.
  const tourInstructionsFor = index => {
    const stop = TOUR_STOPS[index]
    const isFirst = index === 0
    const script = isFirst
      ? `Alright, I am Nova. I will give you a quick feel for how Teambridge runs workforce operations from one live workspace. ${stop.script}`
      : stop.script
    return [
      isFirst
        ? 'You are Nova, starting a guided product tour. Speak warmly and confidently, like a concise product specialist.'
        : 'You are Nova, continuing a guided product tour. Do not greet again.',
      'Do not say "stop", "step", "screen", "moving to", or any count like "2 of 8".',
      'Do not ask a question in this turn; the app will ask the check-in separately.',
      `Say this naturally, preserving the meaning and keeping it under 35 words: "${script}"`,
    ].filter(Boolean).join(' ')
  }

  const askTourQuestion = () => {
    tourPhaseRef.current = 'question'
    setStatus('Nova is checking in')
    createRealtimeResponse({
      output_modalities: ['audio'],
      tool_choice: 'none',
      instructions: `Say exactly: "${TOUR_QUESTION_TEXT}"`,
    })
  }

  // Open the screen for a stop, then have Nova narrate it. Called to start the
  // tour and on each auto-advance.
  const runTourStep = async index => {
    if (index >= TOUR_STOPS.length) {
      finishTour()
      return
    }
    const stop = TOUR_STOPS[index]
    setTourState({ active: true, index, paused: false })
    tourPhaseRef.current = 'narrating'
    setStatus('Nova is speaking')
    try {
      await performDemoAction(stop.action, { label: stop.label })
    } catch { /* navigation best-effort; still narrate */ }
    createRealtimeResponse({
      output_modalities: ['audio'],
      tool_choice: 'none',
      instructions: tourInstructionsFor(index),
    })
  }

  const finishTour = () => {
    clearTourAdvance()
    tourPhaseRef.current = 'finishing'
    setTourState({ active: false, paused: false, index: 0 })
    trackDemoEvent('nova_guided_tour_finished', { conversationId })
    createRealtimeResponse({
      output_modalities: ['audio'],
      tool_choice: 'none',
      instructions: 'You just finished the guided tour. In one short, warm sentence, say you can answer questions, go deeper on any workflow, or help book a meeting with the Teambridge team. Do not summarize the tour.',
    })
  }

  // User spoke or typed mid-tour, or hit Pause — stop auto-advancing, cut
  // Nova's current sentence, and hand them control.
  const pauseTour = reason => {
    if (!tourRef.current.active || tourRef.current.paused) return
    clearTourAdvance()
    cancelActiveResponse()
    tourPhaseRef.current = 'paused'
    setTourState({ paused: true })
    setStatus('Tour paused')
    trackDemoEvent('nova_guided_tour_paused', { reason, index: tourRef.current.index })
  }

  const resumeTour = () => {
    if (!tourRef.current.active) return
    clearTourAdvance()
    setTourState({ paused: false })
    trackDemoEvent('nova_guided_tour_resumed', { index: tourRef.current.index })
    runTourStep(tourRef.current.index + 1)
  }

  const endTour = () => {
    clearTourAdvance()
    cancelActiveResponse()
    tourPhaseRef.current = 'idle'
    setTourState({ active: false, paused: false, index: 0 })
    setStatus(micEnabled ? 'Nova is listening' : 'Tap Talk or type below')
    trackDemoEvent('nova_guided_tour_ended', { conversationId })
  }

  // Jump straight to a chosen stop — wired to the step list and the
  // Previous / Next controls so the visitor drives the tour instead of
  // only watching it auto-walk. Cancels any in-flight narration and the
  // pending auto-advance, then narrates the target stop. Works whether the
  // tour is mid-narration or paused; landing on a stop clears the paused
  // state so auto-advance picks up again from there.
  const goToTourStep = index => {
    if (!tourRef.current.active) return
    const clamped = Math.max(0, Math.min(index, TOUR_STOPS.length - 1))
    if (clamped === tourRef.current.index && tourPhaseRef.current === 'narrating') return
    clearTourAdvance()
    cancelActiveResponse()
    trackDemoEvent('nova_guided_tour_jumped', { from: tourRef.current.index, to: clamped })
    runTourStep(clamped)
  }

  const startGuidedTour = () => {
    if (tourRef.current.active || pendingTourStartRef.current) return
    setError('')
    playTourChime()
    addTranscript('You', 'Start guided tour', { source: 'guided_tour' })
    trackDemoEvent('nova_guided_tour_started', {
      conversationId,
      hasLeadContext: Boolean(companyContext),
    })
    setTourState({ active: true, index: 0, paused: false })
    setStatus('Starting your tour…')

    if (channelRef.current && channelRef.current.readyState === 'open') {
      runTourStep(0)
      return
    }
    // Session not connected yet — queue the start and open the session. The
    // channel.onopen handler runs step 0 the instant we're connected, so there
    // is no dead air beyond the brief "Starting your tour…" + chime.
    pendingTourStartRef.current = true
    if (clientSecret) {
      startSession()
    }
  }

  useEffect(() => () => stopSession(), [])

  useEffect(() => {
    if (!autoStart) return
    startSession()
    return () => stopSession()
  }, [autoStart, clientSecret])

  return (
    <div className="nova-realtime-panel">
      <div className="nova-realtime-head">
        <div className="nova-realtime-avatar">
          <img src={NOVA_AVATAR} alt="" />
          <button
            type="button"
            onClick={toggleVoice}
            aria-label={micEnabled ? 'End voice with Nova' : 'Talk to Nova'}
          >
            {micEnabled ? 'End' : 'Talk'}
          </button>
        </div>
        <div className="nova-realtime-status">
          <strong>Nova</strong>
          <span>{status}</span>
        </div>
      </div>
      <div className={`nova-realtime-mic ${micActivity === 'hearing' ? 'is-hearing' : ''}`}>
        <span className="nova-realtime-mic-dot" />
        <span>{micEnabled ? (micActivity === 'hearing' ? 'Hearing you' : 'Mic on') : 'Text works without mic'}</span>
      </div>
      <div className="nova-realtime-transcript" ref={transcriptRef} aria-live="polite">
        {transcript.length === 0 ? (
          <p className="nova-realtime-transcript-empty">Ask Nova to show a workspace or product area.</p>
        ) : (
          transcript.map(line => (
            <div key={line.id} className={`nova-realtime-line ${line.speaker === 'You' ? 'is-user' : 'is-nova'} ${line.streaming ? 'is-streaming' : ''}`}>
              <span>{line.speaker}</span>
              <p>{line.text}<span className="nova-realtime-caret" aria-hidden="true" /></p>
            </div>
          ))
        )}
      </div>
      {error && <div className="nova-realtime-error">{error}</div>}
      {tour.active && (
        <div className="nova-tour-bar" role="group" aria-label="Guided tour controls">
          <div className="nova-tour-bar-top">
            <div className="nova-tour-bar-info">
              <span className="nova-tour-bar-progress">
                Guided tour · {Math.min(tour.index + 1, TOUR_STOPS.length)} / {TOUR_STOPS.length}
              </span>
              <span className="nova-tour-bar-label">
                {tour.paused ? 'Paused' : TOUR_STOPS[Math.min(tour.index, TOUR_STOPS.length - 1)].label}
              </span>
            </div>
            <div className="nova-tour-bar-controls">
              <button
                type="button"
                onClick={() => goToTourStep(tour.index - 1)}
                disabled={tour.index <= 0}
                aria-label="Previous section"
              >
                ‹ Prev
              </button>
              <button
                type="button"
                onClick={tour.paused ? resumeTour : () => pauseTour('manual')}
              >
                {tour.paused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={() => goToTourStep(tour.index + 1)}
                disabled={tour.index >= TOUR_STOPS.length - 1}
                aria-label="Next section"
              >
                Next ›
              </button>
              <button type="button" onClick={endTour}>End</button>
            </div>
          </div>
          <div className="nova-tour-steps" role="tablist" aria-label="Tour sections">
            {TOUR_STOPS.map((stop, i) => {
              const state = i === tour.index ? 'current' : i < tour.index ? 'done' : 'upcoming'
              return (
                <button
                  key={stop.action}
                  type="button"
                  role="tab"
                  aria-selected={i === tour.index}
                  className={`nova-tour-step is-${state}`}
                  onClick={() => goToTourStep(i)}
                >
                  <span className="nova-tour-step-index">{i + 1}</span>
                  <span className="nova-tour-step-label">{stop.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
      <div className="nova-realtime-actions nova-realtime-actions--split">
        {!tour.active && (
          <button type="button" className="nova-tour-guide-button" onClick={startGuidedTour}>
            Tour guide
          </button>
        )}
        <button type="button" className="nova-talk-team-button" onClick={openBooking}>
          Meet with sales
        </button>
      </div>
      <form className="nova-realtime-form" onSubmit={submitText}>
        <div className="nova-realtime-input-wrap">
          <span className="nova-realtime-input-mark" aria-hidden="true">✦</span>
          <input
            type="text"
            value={text}
            onChange={event => setText(event.target.value)}
            placeholder="Ask Nova to show scheduling..."
            aria-label="Type a prompt for Nova"
          />
        </div>
        <button type="submit" aria-label="Send prompt" disabled={!text.trim()}>
          Send
        </button>
      </form>
      {bookingOpen && typeof document !== 'undefined' && createPortal((
        <div className="demo-booking-modal" role="dialog" aria-modal="true" aria-label="Schedule a Teambridge meeting">
          <div className="demo-booking-panel">
            <div className="demo-booking-head">
              <div>
                <span>Teambridge team</span>
                <strong>Pick a time to talk</strong>
              </div>
              <button type="button" onClick={() => setBookingOpen(false)} aria-label="Close booking">
                ×
              </button>
            </div>
            <iframe
              title="Schedule a Teambridge meeting"
              src={bookingUrl}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <a className="demo-booking-fallback" href={bookingUrl} target="_blank" rel="noreferrer">
              Open scheduler in a new tab
            </a>
          </div>
        </div>
      ), document.body)}
    </div>
  )
}

function NovaSidebarSetupState({ error, onRetry }) {
  return (
    <div className={`nova-realtime-panel nova-realtime-panel--setup ${error ? 'is-error' : ''}`}>
      <div className="nova-realtime-head">
        <div className="nova-realtime-avatar nova-realtime-avatar--setup">
          <img src={NOVA_AVATAR} alt="" />
        </div>
        <div className="nova-realtime-status">
          <strong>Nova</strong>
          <span>{error ? 'Connection needs attention' : 'Preparing your demo guide...'}</span>
        </div>
      </div>
      <div className={`nova-realtime-mic ${error ? 'nova-realtime-mic--error' : ''}`}>
        <span className="nova-realtime-mic-dot" />
        <span>{error ? 'Setup paused' : 'Text and voice are loading'}</span>
      </div>
      <div className="nova-realtime-transcript nova-realtime-transcript--setup" aria-live="polite">
        {error ? (
          <div className="nova-setup-message">
            <strong>Nova could not start</strong>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="nova-setup-line nova-setup-line--wide" />
            <div className="nova-setup-line nova-setup-line--mid" />
            <div className="nova-setup-line nova-setup-line--short" />
          </>
        )}
      </div>
      <div className="nova-realtime-actions">
        <button
          type="button"
          className="nova-talk-team-button"
          disabled={!error}
          onClick={error ? onRetry : undefined}
        >
          {error ? 'Retry Nova' : 'Meet with sales'}
        </button>
      </div>
      <div className="nova-realtime-form nova-realtime-form--setup" aria-hidden="true">
        <div className="nova-realtime-input-wrap">
          <span className="nova-realtime-input-mark">✦</span>
          <span className="nova-setup-input-line" />
        </div>
        <button type="button" disabled>Send</button>
      </div>
    </div>
  )
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

  if (key === 'build_workspace') {
    setHashPath('/build')
    await sleep(options.settleMs || ACTION_SETTLE_MS)
    const target = await waitForElement(config.selector)
    if (!target.el) {
      return {
        ok: false,
        reason: 'target_not_found',
        action: key,
        view: 'build',
      }
    }

    const result = highlightSelector(target.selector, options.label || config.label)
    return {
      ...result,
      action: key,
      view: 'build',
      selector: target.selector,
      label: options.label || config.label,
    }
  }

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

export default function DemoSpecialist({
  enabled,
  route,
  autoOpen = false,
  leadData = null,
}) {
  const [open, setOpen] = useState(false)
  const [voiceUnlocked, setVoiceUnlocked] = useState(false)
  const [signedUrl, setSignedUrl] = useState('')
  const [openAISecret, setOpenAISecret] = useState('')
  const [openAIModel, setOpenAIModel] = useState('')
  const [provider, setProvider] = useState('')
  const [conversationId, setConversationId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [setupNonce, setSetupNonce] = useState(0)
  const widgetRef = useRef(null)
  const autoStartRef = useRef(false)
  const voiceUnlockedRef = useRef(false)
  const transcriptSeenRef = useRef(new Set())
  const spokenToolFallbackRef = useRef(new Set())
  const novaAgentSeenRef = useRef(new Set())

  const lead = useMemo(() => leadData || readJsonStorage('tb:lead-data') || {}, [leadData, enabled, route])
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
      available_demo_actions: 'build_workspace, schedule_gap, shift_requests, time_tracking, payroll, pay_review, people, onboarding, compliance, agents, engage, ready_workspaces',
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
    if (!enabled || voiceUnlocked) return undefined

    const unlockVoice = event => {
      if (voiceUnlockedRef.current) return
      voiceUnlockedRef.current = true
      setVoiceUnlocked(true)
      setOpen(true)
      trackDemoEvent('demo_specialist_audio_unlocked', {
        source: event?.type || 'unknown',
        target: event?.target?.tagName?.toLowerCase?.() || 'unknown',
      })
    }

    window.addEventListener('pointerdown', unlockVoice, { capture: true, once: true })
    window.addEventListener('keydown', unlockVoice, { capture: true, once: true })
    window.addEventListener('touchstart', unlockVoice, { capture: true, once: true, passive: true })

    return () => {
      window.removeEventListener('pointerdown', unlockVoice, { capture: true })
      window.removeEventListener('keydown', unlockVoice, { capture: true })
      window.removeEventListener('touchstart', unlockVoice, { capture: true })
    }
  }, [enabled, voiceUnlocked])

  useEffect(() => {
    if (!enabled || !autoOpen) return undefined

    const timer = window.setTimeout(() => {
      setOpen(true)
      trackDemoEvent('demo_specialist_auto_opened', { source: 'entry_page' })
    }, 900)

    return () => window.clearTimeout(timer)
  }, [enabled, autoOpen])

  useEffect(() => {
    document.body.classList.toggle('has-demo-specialist', Boolean(enabled && open))
    return () => {
      document.body.classList.remove('has-demo-specialist')
    }
  }, [enabled, open])

  useEffect(() => {
    if (!enabled || !open || signedUrl || openAISecret || loading) return
    let cancelled = false
    setLoading(true)
    setError('')

    const start = async () => {
      const realtimeResponse = await fetch('/api/openai-realtime-token', {
        method: 'POST',
        headers: { accept: 'application/json' },
      }).catch(err => ({ ok: false, status: 0, json: async () => ({ error: String(err?.message || err) }) }))

      const realtimeBody = await realtimeResponse.json().catch(() => ({}))
      if (cancelled) return
      if (realtimeResponse.ok && realtimeBody.clientSecret) {
        const id = `openai_${Date.now()}_${Math.random().toString(36).slice(2)}`
        setConversationId(id)
        setOpenAISecret(realtimeBody.clientSecret)
        setOpenAIModel(realtimeBody.model || 'gpt-realtime-2')
        setProvider('openai')
        trackDemoEvent('demo_specialist_ready', {
          provider: 'openai_realtime',
          conversationId: id,
          model: realtimeBody.model,
        })
        return
      }

      // Nova runs on OpenAI Realtime. If the token request fails, surface a
      // clean retry message — never leak the raw server error or a key name.
      trackDemoEvent('demo_specialist_openai_unavailable', {
        status: realtimeResponse.status,
        error: realtimeBody?.error || realtimeBody?.detail || realtimeBody?.message,
      })
      throw new Error('Nova is taking a moment to connect. Please retry in a few seconds.')
    }

    start()
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
  }, [enabled, open, signedUrl, openAISecret, setupNonce])

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
      const buildWorkspaceTool = async ({ label } = {}) => {
        const result = await performDemoAction('build_workspace', { label: label || 'Build my workspace' })
        trackDemoEvent('demo_specialist_tool_build_workspace', {
          ...result,
          conversationId,
        })
        return result
      }
      detail.config.clientTools = {
        buildWorkspace: buildWorkspaceTool,
        buildMyWorkspace: buildWorkspaceTool,
        startWithMyCompany: buildWorkspaceTool,
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
          window.open(bookingUrlForLead(lead), '_blank', 'noopener,noreferrer')
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

  const retrySetup = () => {
    setError('')
    setSignedUrl('')
    setOpenAISecret('')
    setOpenAIModel('')
    setProvider('')
    setConversationId('')
    setSetupNonce(value => value + 1)
  }

  return (
    <div className={`demo-specialist ${open ? 'is-open' : 'is-collapsed'}`}>
      {open ? (
        <section className="demo-specialist-widget" aria-label="Teambridge AI demo specialist">
          <button
            type="button"
            className="demo-specialist-collapse"
            onClick={() => {
              setOpen(false)
              trackDemoEvent('demo_specialist_collapsed', { source: 'collapse_button' })
            }}
            aria-label="Minimize Teambridge AI specialist"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {(loading || (!provider && !error)) && (
            <NovaSidebarSetupState />
          )}
          {error && !loading && (
            <NovaSidebarSetupState error={error} onRetry={retrySetup} />
          )}
          {provider === 'openai' && openAISecret && (
            <OpenAIRealtimeNova
              clientSecret={openAISecret}
              model={openAIModel}
              conversationId={conversationId}
              leadContext={lead}
              autoStart={voiceUnlocked}
            />
          )}
          {provider !== 'openai' && signedUrl && (
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
      ) : (
        <button
          type="button"
          className="demo-specialist-launcher"
          onClick={() => {
            setOpen(true)
            trackDemoEvent('demo_specialist_reopened', { source: 'launcher_button' })
          }}
          aria-label="Open Teambridge AI specialist"
        >
          <img src={NOVA_AVATAR} alt="" aria-hidden="true" />
          <span>Ask Nova</span>
        </button>
      )}
    </div>
  )
}
