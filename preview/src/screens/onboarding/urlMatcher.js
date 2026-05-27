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
      { label: 'Fill shifts faster',   detail: 'Cover event-day gaps in under 2 hours.' },
      { label: 'Reduce overtime',      detail: 'Smooth hours during sold-out weeks.' },
      { label: 'Cross-train staff',    detail: 'Flex event staff between venues during peaks.' },
      { label: 'Track credentials',    detail: 'Streamline TABC and SafeServ renewals.' },
      { label: 'Forecast peaks',       detail: 'Project headcount 2 weeks ahead of events.' },
    ],
  },
  healthcare: {
    summary: 'Acute care + clinical operations.',
    locations: [{ name: 'Main campus', city: '' }],
    roles: ['RN', 'LPN', 'CNA', 'Allied Health'],
    agents: ['coverage', 'overtime', 'compliance'],
    suggestedConnectors: ['workday', 'msteams'],
    goals: [
      { label: 'Cover callouts',       detail: 'Reduce ICU and ED RN callouts with instant replacements.' },
      { label: 'Renew licenses',       detail: 'Track nursing license and BLS renewals across campuses.' },
      { label: 'Fill float gaps',      detail: 'Cover float-pool gaps in under 4 hours.' },
      { label: 'Cut mandatory OT',     detail: 'Reduce mandatory overtime on overnight shifts.' },
      { label: 'Route acuity',         detail: 'Auto-route acuity changes to clinical scheduling.' },
    ],
  },
  hospitality: {
    summary: 'Hotels + guest services operations.',
    locations: [{ name: 'Flagship property', city: '' }],
    roles: ['Front Desk', 'Housekeeping', 'F&B', 'Banquet'],
    agents: ['coverage', 'overtime'],
    suggestedConnectors: ['adp', 'quickbooks'],
    goals: [
      { label: 'Smooth peak hours',    detail: 'Balance banquet headcount across properties.' },
      { label: 'Reduce overtime',      detail: 'Cut front-desk overtime during high-occupancy weeks.' },
      { label: 'Pre-clear food handlers', detail: 'Renew certs 30 days before expiry.' },
      { label: 'Cross-train staff',    detail: 'Flex between F&B and banquet for event surges.' },
      { label: 'Fill housekeeping gaps', detail: 'Cover callouts within 4 hours.' },
    ],
  },
  'long-term-care': {
    summary: 'Assisted living + skilled nursing communities.',
    locations: [{ name: 'Main community', city: '' }],
    roles: ['CNA', 'LPN', 'Med Tech', 'Caregiver'],
    agents: ['coverage', 'compliance', 'onboarding'],
    suggestedConnectors: ['workday', 'msteams'],
    goals: [
      { label: 'Cover NOC callouts',   detail: 'Reduce CNA callouts on weekend overnights.' },
      { label: 'Renew caregiver certs', detail: 'Pre-clear renewals 60 days out.' },
      { label: 'Fill NOC gaps fast',   detail: 'Cover overnight shifts in under 3 hours.' },
      { label: 'Onboard med-techs',    detail: 'Run state requirements in 14 days.' },
      { label: 'Route acuity',         detail: 'Auto-route resident acuity to the right team.' },
    ],
  },
  security: {
    summary: 'Contract guard + patrol services.',
    locations: [{ name: 'Main region', city: '' }],
    roles: ['Officer', 'Supervisor', 'Account Manager'],
    agents: ['coverage', 'compliance'],
    suggestedConnectors: ['adp', 'msteams'],
    goals: [
      { label: 'Pre-clear armed certs', detail: 'Catch expiries 30 days before they lapse.' },
      { label: 'Cover post callouts',  detail: 'Fill posts within 2 hours across the region.' },
      { label: 'Reduce overtime',      detail: 'Cut OT on overnight patrol shifts.' },
      { label: 'Track training',       detail: 'Keep CPR + de-escalation current per officer.' },
      { label: 'Onboard officers',     detail: 'Get contract guards site-ready in a week.' },
    ],
  },
  janitorial: {
    summary: 'Facility services and building maintenance.',
    locations: [{ name: 'Primary account', city: '' }],
    roles: ['Day Porter', 'Night Crew', 'Floor Tech', 'Account Lead'],
    agents: ['coverage', 'overtime'],
    suggestedConnectors: ['adp', 'quickbooks'],
    goals: [
      { label: 'Cover night gaps',     detail: 'Fill night-crew shifts without account-manager escalation.' },
      { label: 'Reduce overtime',      detail: 'Cut OT on multi-shift accounts.' },
      { label: 'Cross-train crew',     detail: 'Flex day porters and floor techs for surge coverage.' },
      { label: 'Onboard crew fast',    detail: 'Run account-specific protocols in 3 days.' },
      { label: 'Route schedule changes', detail: 'Auto-route by account + shift type.' },
    ],
  },
  staffing: {
    summary: 'Staffing agency + contract placements.',
    locations: [{ name: 'HQ branch', city: '' }],
    roles: ['Recruiter', 'Account Manager', 'Onboarding Coordinator'],
    agents: ['onboarding', 'compliance'],
    suggestedConnectors: ['workday', 'slack'],
    goals: [
      { label: 'Onboard in 48h',       detail: 'Move placements through compliance in two days.' },
      { label: 'Pre-clear credentials', detail: 'Re-use cleared workers for repeat clients.' },
      { label: 'Route requisitions',   detail: 'Match open reqs to ready candidates in real time.' },
      { label: 'Cover cancellations',  detail: 'Fill same-day drops from the active bench.' },
      { label: 'Forecast bench needs', detail: 'Project bench depth against client demand.' },
    ],
  },
  construction: {
    summary: 'Project crews + trades operations.',
    locations: [{ name: 'Main project site', city: '' }],
    roles: ['Foreman', 'Carpenter', 'Electrician', 'Safety Lead'],
    agents: ['coverage', 'compliance', 'onboarding'],
    suggestedConnectors: ['sage-intacct', 'msteams'],
    goals: [
      { label: 'Pre-clear OSHA certs', detail: 'Catch OSHA-10/30 and trade cert expiries early.' },
      { label: 'Move crews cleanly',   detail: 'Shift crews between sites without conflicts.' },
      { label: 'Onboard subs fast',    detail: 'Run safety + site protocols in a day.' },
      { label: 'Reduce overtime',      detail: 'Cut OT on accelerated-schedule projects.' },
      { label: 'Route weather changes', detail: 'Auto-notify affected crews on weather days.' },
    ],
  },
  'light-industrial': {
    summary: 'Warehousing + logistics + manufacturing crews.',
    locations: [{ name: 'Main facility', city: '' }],
    roles: ['Picker', 'Forklift Op', 'Shift Lead', 'Quality'],
    agents: ['coverage', 'overtime'],
    suggestedConnectors: ['adp', 'quickbooks'],
    goals: [
      { label: 'Forecast peak season', detail: 'Project headcount 4 weeks ahead.' },
      { label: 'Cover line-outs fast', detail: 'Fill callouts in under 90 minutes.' },
      { label: 'Track certifications', detail: 'Keep forklift and OSHA current.' },
      { label: 'Reduce surge OT',      detail: 'Cut Q4 surge overtime.' },
      { label: 'Cross-train ops',      detail: 'Flex pickers and forklift ops for coverage.' },
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
