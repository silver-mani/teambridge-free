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
    goals: [
      'Cover event-day staffing gaps in under 2 hours when ushers no-show.',
      'Reduce overtime during sold-out and back-to-back-event weeks.',
      'Cross-train event staff across venues to flex during peaks.',
      'Streamline TABC and SafeServ credential renewals for F&B staff.',
      'Forecast peak headcount 2 weeks ahead of major events.',
    ],
  },
  healthcare: {
    summary: 'Acute care + clinical operations.',
    locations: [{ name: 'Main campus', city: '' }],
    roles: ['RN', 'LPN', 'CNA', 'Allied Health'],
    agents: ['coverage', 'overtime', 'compliance'],
    suggestedConnectors: ['workday', 'msteams'],
    goals: [
      'Reduce ICU and ED RN callouts by surfacing replacement candidates instantly.',
      'Streamline nursing license and BLS renewals across campuses.',
      'Cover float-pool gaps in under 4 hours during census spikes.',
      'Cut mandatory overtime by 30% on overnight shifts.',
      'Auto-route patient acuity changes to clinical scheduling.',
    ],
  },
  hospitality: {
    summary: 'Hotels + guest services operations.',
    locations: [{ name: 'Flagship property', city: '' }],
    roles: ['Front Desk', 'Housekeeping', 'F&B', 'Banquet'],
    agents: ['coverage', 'overtime'],
    suggestedConnectors: ['adp', 'quickbooks'],
    goals: [
      'Smooth peak/off-peak banquet headcount across properties.',
      'Reduce front-desk overtime during high-occupancy weeks.',
      'Pre-clear food-handler certifications 30 days before expiry.',
      'Cross-train staff between F&B and banquet for event surges.',
      'Cover housekeeping gaps within 4 hours of a callout.',
    ],
  },
  'long-term-care': {
    summary: 'Assisted living + skilled nursing communities.',
    locations: [{ name: 'Main community', city: '' }],
    roles: ['CNA', 'LPN', 'Med Tech', 'Caregiver'],
    agents: ['coverage', 'compliance', 'onboarding'],
    suggestedConnectors: ['workday', 'msteams'],
    goals: [
      'Reduce CNA callouts on weekend overnights.',
      'Pre-clear caregiver credential renewals 60 days out.',
      'Cover NOC shifts in under 3 hours when a caregiver drops.',
      'Onboard new med-techs through state requirements in 14 days.',
      'Auto-route resident acuity changes to the right care team.',
    ],
  },
  security: {
    summary: 'Contract guard + patrol services.',
    locations: [{ name: 'Main region', city: '' }],
    roles: ['Officer', 'Supervisor', 'Account Manager'],
    agents: ['coverage', 'compliance'],
    suggestedConnectors: ['adp', 'msteams'],
    goals: [
      'Pre-clear armed-post certifications 30 days before expiry.',
      'Cover post callouts within 2 hours across the region.',
      'Reduce overtime on overnight patrol shifts.',
      'Track post-specific training (CPR, de-escalation) per officer.',
      'Onboard contract officers to client sites in under a week.',
    ],
  },
  janitorial: {
    summary: 'Facility services and building maintenance.',
    locations: [{ name: 'Primary account', city: '' }],
    roles: ['Day Porter', 'Night Crew', 'Floor Tech', 'Account Lead'],
    agents: ['coverage', 'overtime'],
    suggestedConnectors: ['adp', 'quickbooks'],
    goals: [
      'Cover night-crew gaps without escalating to account managers.',
      'Reduce overtime on multi-shift accounts.',
      'Cross-train day porters and floor techs for surge coverage.',
      'Onboard new crew to account-specific protocols in 3 days.',
      'Auto-route schedule changes by account + shift type.',
    ],
  },
  staffing: {
    summary: 'Staffing agency + contract placements.',
    locations: [{ name: 'HQ branch', city: '' }],
    roles: ['Recruiter', 'Account Manager', 'Onboarding Coordinator'],
    agents: ['onboarding', 'compliance'],
    suggestedConnectors: ['workday', 'slack'],
    goals: [
      'Onboard placement candidates through compliance in 48 hours.',
      'Pre-clear credentials for repeat clients automatically.',
      'Route open requisitions to ready candidates in real time.',
      'Cover same-day cancellations across the active bench.',
      'Forecast bench needs against client demand patterns.',
    ],
  },
  construction: {
    summary: 'Project crews + trades operations.',
    locations: [{ name: 'Main project site', city: '' }],
    roles: ['Foreman', 'Carpenter', 'Electrician', 'Safety Lead'],
    agents: ['coverage', 'compliance', 'onboarding'],
    suggestedConnectors: ['sage-intacct', 'msteams'],
    goals: [
      'Pre-clear OSHA-10/30 and trade certs before site assignment.',
      'Move crews between project sites without scheduling conflicts.',
      'Onboard subcontractors to safety + site protocols in a day.',
      'Reduce overtime on accelerated-schedule projects.',
      'Auto-route weather-driven schedule changes to affected crews.',
    ],
  },
  'light-industrial': {
    summary: 'Warehousing + logistics + manufacturing crews.',
    locations: [{ name: 'Main facility', city: '' }],
    roles: ['Picker', 'Forklift Op', 'Shift Lead', 'Quality'],
    agents: ['coverage', 'overtime'],
    suggestedConnectors: ['adp', 'quickbooks'],
    goals: [
      'Forecast peak-season headcount 4 weeks ahead.',
      'Cover line-out callouts in under 90 minutes.',
      'Track forklift and OSHA certifications across the workforce.',
      'Reduce overtime on Q4 surge shifts.',
      'Cross-train pickers and forklift ops for flex coverage.',
    ],
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
        goals: [...(defaults.goals || [])],
        insights: [],
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
