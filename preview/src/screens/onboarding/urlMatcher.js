/* URL → derived configuration matcher for the build flow.
 *
 * Primary path: POST /api/derive-config which calls Claude with the
 * web_search tool to actually research the company. The model returns
 * a structured JSON config (companyName / industry / headcount /
 * locations / roles / agents / suggestedConnectors) which we hand off
 * to the rest of the onboarding UI.
 *
 * Fallback path: if the API errors (no key, timeout, parse failure),
 * fall back to the lightweight keyword heuristic below so the demo
 * always lands somewhere sensible.
 *
 * Output shape matches what ConfigCard + the rest of OnboardingFlow
 * expect. */

import { TEAM_SIZE_OPTIONS, PAIN_OPTIONS, CONNECTOR_OPTIONS } from './steps.js'

const CONFIDENCE = { high: 'high', medium: 'medium', low: 'low' }

/* ── Keyword heuristics — last-resort fallback when the API can't
 *    produce a config. Same shape as a real derived config but with
 *    generic defaults from the matched industry. ── */
const KEYWORDS = [
  { match: /(hospital|clinic|health|medical|nurse|pediat|surger)/i, industry: 'healthcare',     headcount: 220, headcountRange: '101-500' },
  { match: /(stadium|arena|theater|theatre|venue|amphi|event|concert)/i, industry: 'events',     headcount: 180, headcountRange: '101-500' },
  { match: /(hotel|inn|resort|hospitality|lodging)/i,             industry: 'hospitality',      headcount: 140, headcountRange: '101-500' },
  { match: /(senior|nursing|assisted|memory.?care|skilled.?nursing|hospice)/i, industry: 'long-term-care', headcount: 160, headcountRange: '101-500' },
  { match: /(security|guard|patrol|protective)/i,                 industry: 'security',         headcount: 200, headcountRange: '101-500' },
  { match: /(janitor|cleaning|facility|facilities|building.?services|maintenance)/i, industry: 'janitorial', headcount: 180, headcountRange: '101-500' },
  { match: /(staff|recruit|agency|talent|temp|placement)/i,       industry: 'staffing',         headcount: 120, headcountRange: '101-500' },
  { match: /(construct|build|contractor|infrastruct|engineering)/i, industry: 'construction',   headcount: 240, headcountRange: '101-500' },
  { match: /(warehouse|logistic|manufactur|light.?industrial|fulfillment|distribution)/i, industry: 'light-industrial', headcount: 280, headcountRange: '101-500' },
]

const INDUSTRY_DEFAULTS = {
  events: {
    summary: 'Live entertainment + sports venues.',
    locations: [{ name: 'Main venue', city: '' }],
    roles: ['Event Staff', 'Security', 'F&B', 'Operations'],
    agents: ['coverage', 'overtime'],
    suggestedConnectors: ['adp', 'slack'],
  },
  healthcare: {
    summary: 'Acute care + clinical operations.',
    locations: [{ name: 'Main campus', city: '' }],
    roles: ['RN', 'LPN', 'CNA', 'Allied Health'],
    agents: ['coverage', 'overtime', 'compliance'],
    suggestedConnectors: ['workday', 'msteams'],
  },
  hospitality: {
    summary: 'Hotels + guest services operations.',
    locations: [{ name: 'Flagship property', city: '' }],
    roles: ['Front Desk', 'Housekeeping', 'F&B', 'Banquet'],
    agents: ['coverage', 'overtime'],
    suggestedConnectors: ['adp', 'quickbooks'],
  },
  'long-term-care': {
    summary: 'Assisted living + skilled nursing communities.',
    locations: [{ name: 'Main community', city: '' }],
    roles: ['CNA', 'LPN', 'Med Tech', 'Caregiver'],
    agents: ['coverage', 'compliance', 'onboarding'],
    suggestedConnectors: ['workday', 'msteams'],
  },
  security: {
    summary: 'Contract guard + patrol services.',
    locations: [{ name: 'Main region', city: '' }],
    roles: ['Officer', 'Supervisor', 'Account Manager'],
    agents: ['coverage', 'compliance'],
    suggestedConnectors: ['adp', 'msteams'],
  },
  janitorial: {
    summary: 'Facility services and building maintenance.',
    locations: [{ name: 'Primary account', city: '' }],
    roles: ['Day Porter', 'Night Crew', 'Floor Tech', 'Account Lead'],
    agents: ['coverage', 'overtime'],
    suggestedConnectors: ['adp', 'quickbooks'],
  },
  staffing: {
    summary: 'Staffing agency + contract placements.',
    locations: [{ name: 'HQ branch', city: '' }],
    roles: ['Recruiter', 'Account Manager', 'Onboarding Coordinator'],
    agents: ['onboarding', 'compliance'],
    suggestedConnectors: ['workday', 'slack'],
  },
  construction: {
    summary: 'Project crews + trades operations.',
    locations: [{ name: 'Main project site', city: '' }],
    roles: ['Foreman', 'Carpenter', 'Electrician', 'Safety Lead'],
    agents: ['coverage', 'compliance', 'onboarding'],
    suggestedConnectors: ['sage-intacct', 'msteams'],
  },
  'light-industrial': {
    summary: 'Warehousing + logistics + manufacturing crews.',
    locations: [{ name: 'Main facility', city: '' }],
    roles: ['Picker', 'Forklift Op', 'Shift Lead', 'Quality'],
    agents: ['coverage', 'overtime'],
    suggestedConnectors: ['adp', 'quickbooks'],
  },
}

function normalizeUrl(input) {
  if (!input) return ''
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
}

function nameFromUrl(url) {
  const stem = url.replace(/\.(com|org|net|io|co|us|biz|info)$/, '').replace(/-/g, ' ')
  return stem.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function heuristicConfig(rawInput, fromFreeText) {
  const url = fromFreeText ? '' : normalizeUrl(rawInput)
  const haystack = url || String(rawInput || '').toLowerCase()

  for (const k of KEYWORDS) {
    if (k.match.test(haystack)) {
      const defaults = INDUSTRY_DEFAULTS[k.industry]
      return {
        origin: 'fallback',
        url,
        companyName: url ? nameFromUrl(url) : 'Your company',
        industry: k.industry,
        headcount: k.headcount,
        headcountRange: k.headcountRange,
        summary: defaults.summary,
        locations: structuredClone(defaults.locations),
        roles: [...defaults.roles],
        agents: [...defaults.agents],
        suggestedConnectors: [...defaults.suggestedConnectors],
        confidence: {
          industry: CONFIDENCE.medium, headcount: CONFIDENCE.low,
          locations: CONFIDENCE.low, roles: CONFIDENCE.medium,
        },
      }
    }
  }
  // Truly unmatched — last resort, generic staffing config.
  const defaults = INDUSTRY_DEFAULTS.staffing
  return {
    origin: 'fallback',
    url,
    companyName: url ? nameFromUrl(url) : 'Your company',
    industry: 'staffing',
    headcount: 120,
    headcountRange: '101-500',
    summary: defaults.summary,
    locations: structuredClone(defaults.locations),
    roles: [...defaults.roles],
    agents: [...defaults.agents],
    suggestedConnectors: [...defaults.suggestedConnectors],
    confidence: {
      industry: CONFIDENCE.low, headcount: CONFIDENCE.low,
      locations: CONFIDENCE.low, roles: CONFIDENCE.low,
    },
  }
}

/* ── Primary entry. Async — calls /api/derive-config first; falls
 *    back to heuristics on any failure so the demo always lands. ── */
export async function deriveConfig(rawInput, opts = {}) {
  const { fromFreeText = false } = opts
  const input = String(rawInput || '').trim()
  if (!input) return null

  try {
    const r = await fetch('/api/derive-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, fromFreeText }),
    })
    if (!r.ok) {
      console.warn('[derive-config] api non-2xx, falling back to heuristic:', r.status)
      return heuristicConfig(input, fromFreeText)
    }
    const body = await r.json()
    if (!body?.config) {
      console.warn('[derive-config] api returned no config, falling back')
      return heuristicConfig(input, fromFreeText)
    }
    return body.config
  } catch (err) {
    console.warn('[derive-config] api threw, falling back to heuristic:', err)
    return heuristicConfig(input, fromFreeText)
  }
}

/* Map an arbitrary headcount to a TEAM_SIZE_OPTIONS id. Used by the
 * confirmed-config → answers shape adapter in OnboardingFlow. */
export function headcountRangeFor(headcount) {
  if (headcount <= 25)  return '1-25'
  if (headcount <= 100) return '26-100'
  if (headcount <= 500) return '101-500'
  return '500+'
}

export function agentLabel(id) {
  return PAIN_OPTIONS.find(p => p.id === id)?.label ?? id
}
export function connectorLabel(id) {
  return CONNECTOR_OPTIONS.find(c => c.id === id)?.label ?? id
}
export function teamSizeLabel(id) {
  return TEAM_SIZE_OPTIONS.find(o => o.id === id)?.label ?? id
}
