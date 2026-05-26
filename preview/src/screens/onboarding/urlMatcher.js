/* URL → derived configuration matcher for the build flow.
 *
 * Three tiers:
 *   1. Curated map — recognizable demo URLs (hollywoodparkca.com,
 *      sofistadium.com, dignityhealth.com, etc.) each map to a specific
 *      industry template with rich, believable derivations (company
 *      name, locations, headcount, roles, agents).
 *   2. Keyword heuristics — for unrecognized URLs, infer from
 *      substrings (hospital → healthcare, stadium → events, etc.).
 *   3. Free-text fallback — Nova asks for a short description, parsed
 *      with the same keyword matcher.
 *
 * Output is a `config` object: the shape the rest of the onboarding
 * UI consumes. Curated entries are richer; heuristic matches use the
 * vertical's default seed data from industryData.js.
 *
 * In a real product these signals come from crawling + LinkedIn + a
 * model. Here we fake the inference but keep the shape honest so the
 * UX is what would ship. */

import { TEAM_SIZE_OPTIONS, PAIN_OPTIONS, CONNECTOR_OPTIONS } from './steps.js'

const CONFIDENCE = {
  high:   'high',
  medium: 'medium',
  low:    'low',
}

/* ── Curated demo entries. Pre-seeded richness so the demo lands. ── */
const CURATED = {
  'hollywoodparkca.com': {
    companyName: 'Hollywood Park',
    industry: 'events',
    headcount: 420,
    headcountRange: '101-500',
    summary: 'Entertainment + sports venue district in Inglewood, CA. Anchor of the SoFi Stadium ecosystem.',
    locations: [
      { name: 'SoFi Stadium',          city: 'Inglewood, CA' },
      { name: 'YouTube Theater',       city: 'Inglewood, CA' },
      { name: 'Champions Plaza',       city: 'Inglewood, CA' },
      { name: 'Hollywood Park Casino', city: 'Inglewood, CA' },
    ],
    roles: ['Event Staff', 'Security', 'F&B', 'Operations Lead', 'Box Office', 'Cleaning'],
    agents: ['coverage', 'overtime', 'onboarding'],
    suggestedConnectors: ['adp', 'slack', 'quickbooks'],
    confidence: { industry: CONFIDENCE.high, headcount: CONFIDENCE.medium, locations: CONFIDENCE.high, roles: CONFIDENCE.medium },
  },
  'sofistadium.com': {
    companyName: 'SoFi Stadium',
    industry: 'events',
    headcount: 380,
    headcountRange: '101-500',
    summary: 'NFL stadium and event venue in Inglewood. Home of the Rams and Chargers.',
    locations: [
      { name: 'SoFi Stadium',    city: 'Inglewood, CA' },
      { name: 'YouTube Theater', city: 'Inglewood, CA' },
    ],
    roles: ['Event Staff', 'Security', 'F&B', 'Ushers', 'Operations'],
    agents: ['coverage', 'overtime', 'comms'],
    suggestedConnectors: ['adp', 'slack', 'quickbooks'],
    confidence: { industry: CONFIDENCE.high, headcount: CONFIDENCE.medium, locations: CONFIDENCE.high, roles: CONFIDENCE.medium },
  },
  'levisstadium.com': {
    companyName: "Levi's Stadium",
    industry: 'events',
    headcount: 340,
    headcountRange: '101-500',
    summary: 'NFL stadium in Santa Clara. Home of the 49ers and a year-round concert + corporate venue.',
    locations: [
      { name: "Levi's Stadium", city: 'Santa Clara, CA' },
    ],
    roles: ['Event Staff', 'Security', 'F&B', 'Premium Hospitality', 'Operations'],
    agents: ['coverage', 'overtime', 'onboarding'],
    suggestedConnectors: ['adp', 'slack', 'quickbooks'],
    confidence: { industry: CONFIDENCE.high, headcount: CONFIDENCE.medium, locations: CONFIDENCE.high, roles: CONFIDENCE.medium },
  },
  'dignityhealth.org': {
    companyName: 'Dignity Health',
    industry: 'healthcare',
    headcount: 720,
    headcountRange: '500+',
    summary: 'Multi-state non-profit health system. Acute care, outpatient, and specialty clinics.',
    locations: [
      { name: 'Memorial North',    city: 'Phoenix, AZ' },
      { name: 'St. Joseph Campus', city: 'Stockton, CA' },
      { name: 'Northridge Clinic', city: 'Los Angeles, CA' },
    ],
    roles: ['RN', 'LPN', 'CNA', 'Allied Health', 'Patient Care Tech', 'Charge Nurse'],
    agents: ['coverage', 'overtime', 'compliance'],
    suggestedConnectors: ['workday', 'rippling', 'msteams'],
    confidence: { industry: CONFIDENCE.high, headcount: CONFIDENCE.medium, locations: CONFIDENCE.medium, roles: CONFIDENCE.high },
  },
  'brookdale.com': {
    companyName: 'Brookdale Senior Living',
    industry: 'long-term-care',
    headcount: 680,
    headcountRange: '500+',
    summary: 'Independent + assisted living and memory care across 40+ states.',
    locations: [
      { name: 'Brookdale Westside',   city: 'Los Angeles, CA' },
      { name: 'Brookdale Northgate',  city: 'San Antonio, TX' },
      { name: 'Brookdale Lakeshore',  city: 'Chicago, IL' },
    ],
    roles: ['CNA', 'LPN', 'Med Tech', 'Caregiver', 'Activities Lead', 'Resident Services'],
    agents: ['coverage', 'compliance', 'onboarding'],
    suggestedConnectors: ['workday', 'rippling', 'msteams'],
    confidence: { industry: CONFIDENCE.high, headcount: CONFIDENCE.medium, locations: CONFIDENCE.medium, roles: CONFIDENCE.high },
  },
  'marriott.com': {
    companyName: 'Marriott International',
    industry: 'hospitality',
    headcount: 820,
    headcountRange: '500+',
    summary: 'Global hospitality group. Full-service, select-service, and luxury properties.',
    locations: [
      { name: 'Marriott Marquis',   city: 'San Francisco, CA' },
      { name: 'Marriott Riverside', city: 'Houston, TX' },
      { name: 'Marriott Lakeshore', city: 'Chicago, IL' },
      { name: 'Marriott Bayview',   city: 'Seattle, WA' },
    ],
    roles: ['Front Desk', 'Housekeeping', 'F&B', 'Banquet Server', 'Bellhop', 'Operations'],
    agents: ['coverage', 'overtime', 'compliance'],
    suggestedConnectors: ['adp', 'slack', 'quickbooks'],
    confidence: { industry: CONFIDENCE.high, headcount: CONFIDENCE.medium, locations: CONFIDENCE.medium, roles: CONFIDENCE.high },
  },
  'securitas.com': {
    companyName: 'Securitas',
    industry: 'security',
    headcount: 540,
    headcountRange: '500+',
    summary: 'Contract guard services across commercial, healthcare, and event sites.',
    locations: [
      { name: 'Bay Area Region',    city: 'Oakland, CA' },
      { name: 'SoCal Region',       city: 'Los Angeles, CA' },
      { name: 'Pacific NW Region',  city: 'Seattle, WA' },
    ],
    roles: ['Officer', 'Supervisor', 'Armed Officer', 'Patrol', 'Account Manager'],
    agents: ['coverage', 'compliance', 'comms'],
    suggestedConnectors: ['adp', 'msteams'],
    confidence: { industry: CONFIDENCE.high, headcount: CONFIDENCE.medium, locations: CONFIDENCE.medium, roles: CONFIDENCE.high },
  },
  'abm.com': {
    companyName: 'ABM Industries',
    industry: 'janitorial',
    headcount: 760,
    headcountRange: '500+',
    summary: 'Facility services: janitorial, engineering, and parking across commercial properties.',
    locations: [
      { name: 'LAX Account',         city: 'Los Angeles, CA' },
      { name: 'Downtown Tower Acct', city: 'Chicago, IL' },
      { name: 'JFK Account',         city: 'New York, NY' },
    ],
    roles: ['Day Porter', 'Night Crew', 'Floor Tech', 'Restroom Tech', 'Account Lead'],
    agents: ['coverage', 'overtime', 'comms'],
    suggestedConnectors: ['adp', 'quickbooks'],
    confidence: { industry: CONFIDENCE.high, headcount: CONFIDENCE.medium, locations: CONFIDENCE.medium, roles: CONFIDENCE.high },
  },
  'bechtel.com': {
    companyName: 'Bechtel',
    industry: 'construction',
    headcount: 620,
    headcountRange: '500+',
    summary: 'Global infrastructure, oil & gas, mining, and nuclear engineering projects.',
    locations: [
      { name: 'Reston HQ Office',    city: 'Reston, VA' },
      { name: 'Houston Project Yard', city: 'Houston, TX' },
      { name: 'San Francisco Office', city: 'San Francisco, CA' },
    ],
    roles: ['Foreman', 'Carpenter', 'Electrician', 'Project Manager', 'Safety Lead'],
    agents: ['coverage', 'compliance', 'onboarding'],
    suggestedConnectors: ['sage-intacct', 'msteams'],
    confidence: { industry: CONFIDENCE.high, headcount: CONFIDENCE.medium, locations: CONFIDENCE.medium, roles: CONFIDENCE.high },
  },
  'aerotek.com': {
    companyName: 'Aerotek',
    industry: 'staffing',
    headcount: 480,
    headcountRange: '101-500',
    summary: 'Skilled trades + industrial staffing agency. Per-diem and contract placements.',
    locations: [
      { name: 'Hanover HQ',     city: 'Hanover, MD' },
      { name: 'West Coast Hub', city: 'Phoenix, AZ' },
      { name: 'Midwest Hub',    city: 'Chicago, IL' },
    ],
    roles: ['Recruiter', 'Account Manager', 'Field Tech', 'Onboarding Coordinator'],
    agents: ['onboarding', 'compliance', 'comms'],
    suggestedConnectors: ['workday', 'slack', 'sage-intacct'],
    confidence: { industry: CONFIDENCE.high, headcount: CONFIDENCE.medium, locations: CONFIDENCE.medium, roles: CONFIDENCE.high },
  },
}

/* ── Keyword heuristics for unrecognized URLs / free text. ── */
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
    locations: [{ name: 'Main venue', city: '' }, { name: 'Secondary site', city: '' }],
    roles: ['Event Staff', 'Security', 'F&B', 'Operations'],
    agents: ['coverage', 'overtime'],
    suggestedConnectors: ['adp', 'slack'],
  },
  healthcare: {
    summary: 'Acute care + clinical operations.',
    locations: [{ name: 'Main campus', city: '' }, { name: 'Satellite clinic', city: '' }],
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

/* Strip protocol, www, trailing slash from input — accept "foo.com",
 * "https://www.foo.com/", "FOO.com", etc. as the same key. */
function normalizeUrl(input) {
  if (!input) return ''
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
}

/* Derive a company name from a URL when we don't have a curated entry.
 * "hollywoodparkca.com" → "Hollywoodparkca", "acme-staffing.com" →
 * "Acme Staffing". Heuristic; the operator can correct it in review. */
function nameFromUrl(url) {
  const stem = url.replace(/\.(com|org|net|io|co|us|biz|info)$/, '').replace(/-/g, ' ')
  return stem.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/* Main entry. Returns a `config` (see ConfigCard.jsx) plus an
 * `origin` flag for telemetry / UI ("curated" | "heuristic" | "fallback"). */
export function deriveConfig(rawInput, opts = {}) {
  const { fromFreeText = false } = opts
  const url = fromFreeText ? '' : normalizeUrl(rawInput)
  const text = String(rawInput || '').toLowerCase()

  // Tier 1: curated.
  if (url && CURATED[url]) {
    return {
      origin: 'curated',
      url,
      ...structuredClone(CURATED[url]),
    }
  }

  // Tier 2: keyword heuristics on URL or free text.
  const haystack = url || text
  for (const k of KEYWORDS) {
    if (k.match.test(haystack)) {
      const defaults = INDUSTRY_DEFAULTS[k.industry]
      return {
        origin: fromFreeText ? 'fallback' : 'heuristic',
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
        confidence: { industry: CONFIDENCE.medium, headcount: CONFIDENCE.low, locations: CONFIDENCE.low, roles: CONFIDENCE.medium },
      }
    }
  }

  // No match — signal the caller to ask for free text.
  return null
}

/* Map a derived headcount to a TEAM_SIZE_OPTIONS id, for downstream
 * components that take a `teamSize` answer key. */
export function headcountRangeFor(headcount) {
  if (headcount <= 25)  return '1-25'
  if (headcount <= 100) return '26-100'
  if (headcount <= 500) return '101-500'
  return '500+'
}

/* Pretty labels for the review card. Pulls from steps.js so the
 * vocabulary stays consistent with the rest of the flow. */
export function agentLabel(id) {
  return PAIN_OPTIONS.find(p => p.id === id)?.label ?? id
}
export function connectorLabel(id) {
  return CONNECTOR_OPTIONS.find(c => c.id === id)?.label ?? id
}
export function teamSizeLabel(id) {
  return TEAM_SIZE_OPTIONS.find(o => o.id === id)?.label ?? id
}
