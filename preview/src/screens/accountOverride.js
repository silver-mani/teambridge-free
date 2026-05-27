/* Personalizes the industry demo data with the operator's account
 * config from the build flow.
 *
 * The industry data in /data/industryData.js is rich and tightly
 * scripted (Sandra Lee's cancellation, Marcus T., etc.) — we don't
 * want to rebuild it per company because the scripted scenes are
 * what makes the demo land.
 *
 * Instead we do a surgical string-replacement pass on the JSON tree:
 * each industry has 1-2 recurring "default" venue names that appear
 * across mission cards, activity feed, schedule shifts, people
 * rosters, etc. We swap those defaults with the user's actual
 * locations from the derived config. End result: every venue mention
 * in the demo reads as the operator's site (Marcus T. cancelled his
 * shift at "Marriott Marquis SF" instead of "Civic Arena"), but the
 * scene structure stays intact.
 *
 * Also overrides:
 *   data.label     → companyName (shows in LeftNav brand row)
 *   data.workerNounPlural   → kept as industry default (e.g. "nurses")
 */

/* Per-industry default venue variants in priority order (longest /
 * most specific first so substring replaces don't clobber later
 * matches). Each row maps to one of config.locations[i] by index. */
export const INDUSTRY_VENUE_DEFAULTS = {
  healthcare: [
    ['Memorial North'],
    ['Memorial South'],
  ],
  events: [
    ['Civic Arena'],
    ['Harbor Theater'],
  ],
  hospitality: [
    ['Bayview Hotel', 'Bayview'],
    ['Riverside Hotel', 'Riverside'],
  ],
  'long-term-care': [
    ['Pine Ridge SNF', 'Pine Ridge'],
  ],
  'light-industrial': [
    ['DC East Warehouse'],
  ],
  construction: [
    ['5th and Main site', '5th and Main'],
  ],
  security: [
    ['Corporate Campus A', 'Corporate Campus'],
  ],
  janitorial: [
    ['Tower 4'],
  ],
  staffing: [
    ['Stellar Events'],
  ],
}

/* Read the build flow's saved config from sessionStorage. Returns
 * null when nothing's set or when the saved config is for a different
 * industry (operator went through build → routed elsewhere, or
 * visits the route directly). */
export function getStoredBuildConfig(industryId) {
  try {
    const raw = sessionStorage.getItem('tb:build-config')
    if (!raw) return null
    const config = JSON.parse(raw)
    if (!config?.industry || config.industry !== industryId) return null
    return config
  } catch {
    return null
  }
}

/* Returns a JSON-safe form of `str` ready to splice into already-
 * stringified JSON. JSON.stringify wraps in quotes and escapes special
 * chars; we strip the outer quotes. */
function escapeForJson(str) {
  const wrapped = JSON.stringify(String(str))
  return wrapped.slice(1, -1)
}

/* Apply the override transform. Returns a fresh data object — does
 * not mutate the input. */
export function applyAccountOverride(baseData, config) {
  if (!baseData) return baseData
  if (!config?.industry || !Array.isArray(config.locations) || config.locations.length === 0) {
    return baseData
  }
  const defaults = INDUSTRY_VENUE_DEFAULTS[config.industry]
  if (!defaults) return baseData

  let json = JSON.stringify(baseData)

  defaults.forEach((variants, idx) => {
    const target = config.locations[idx]?.name
    if (!target) return
    const replacement = escapeForJson(target)
    // Replace longer variants first so substring matches don't beat
    // the more specific form (e.g. "Bayview Hotel" before "Bayview").
    const sorted = [...variants].sort((a, b) => b.length - a.length)
    for (const variant of sorted) {
      json = json.split(variant).join(replacement)
    }
  })

  const updated = JSON.parse(json)
  if (config.companyName) {
    updated.label = config.companyName
  }
  if (config.url) {
    updated.brandUrl = config.url
  }
  return updated
}
