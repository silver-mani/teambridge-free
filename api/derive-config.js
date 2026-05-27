/* Vercel serverless function — derives a Teambridge workforce config
 * from a company URL (or free-text description) using Claude.
 *
 * Input:
 *   POST /api/derive-config
 *   { input: "hollywoodparkca.com", fromFreeText: false }
 *
 * Output:
 *   { config: { companyName, industry, headcount, ... } }
 *
 * Uses Claude's web_search tool when given a URL so the model can
 * actually look at the site, public filings, LinkedIn, etc., rather
 * than guessing from its training data.
 *
 * Requires ANTHROPIC_API_KEY in the Vercel env. */

const VALID_INDUSTRIES = [
  'healthcare', 'staffing', 'events', 'security', 'light-industrial',
  'construction', 'hospitality', 'long-term-care', 'janitorial',
]
const VALID_AGENTS = ['coverage', 'overtime', 'onboarding', 'compliance', 'comms', 'scheduling']
const VALID_CONNECTORS = [
  'gusto', 'adp', 'rippling', 'justworks', 'bamboohr', 'workday',
  'quickbooks', 'sage-intacct', 'slack', 'msteams',
]
const VALID_RANGES = ['1-25', '26-100', '101-500', '500+']

const SYSTEM_PROMPT = `You are a workforce management consultant for Teambridge, an AI-native WFM platform for hourly, contract, and frontline teams.

Given a company URL or short description, analyze the company and return a JSON object describing the shape of their hourly / shift workforce — what Teambridge would set up for them on day one.

When given a URL, use the web_search tool to research the company (homepage, careers page, LinkedIn, news articles, public filings). When given a description, reason from the description alone.

Return ONLY a single JSON object — no markdown, no commentary, no code fences. Schema:

{
  "companyName": "Official company name",
  "industry": "one of: ${VALID_INDUSTRIES.join(', ')}",
  "headcount": <integer estimate of HOURLY / SHIFT WORKERS only — not corporate>,
  "headcountRange": "one of: ${VALID_RANGES.join(', ')}",
  "summary": "One sentence about what the company does",
  "locations": [
    { "name": "Site name", "city": "City, ST" }
  ],
  "roles": ["Role 1", "Role 2", ...],
  "agents": ["coverage", "overtime", ...],
  "suggestedConnectors": ["adp", "slack", ...],
  "insights": [
    "Specific observation 1",
    "Specific observation 2",
    "Specific observation 3"
  ],
  "goals": [
    { "label": "Short 2-4 word goal", "detail": "One short sentence of context." }
  ],
  "confidence": {
    "industry": "high|medium|low",
    "headcount": "high|medium|low",
    "locations": "high|medium|low",
    "roles": "high|medium|low"
  }
}

Guidance:
- INDUSTRY: pick the closest fit from the enum based on the dominant hourly workforce. A hospital is healthcare. A stadium operator is events. A senior-living REIT is long-term-care. A contract guard firm is security. A facility-services vendor is janitorial. A staffing agency is staffing.
- HEADCOUNT: estimate the size of the hourly/shift workforce specifically, not the total company. For a 50,000-person retailer that's also a corporate HQ, return only the store associate count. Round to a sensible 2-3 sig fig number.
- HEADCOUNT RANGE: pick the bucket that contains your headcount estimate.
- LOCATIONS: include 1-6 representative sites/regions. For multi-site companies, name the most notable ones with their city/state.
- ROLES: 4-6 hourly role types most typical for this kind of company. Be specific (e.g. "Banquet Server" not "Server").
- AGENTS: choose 2-4 agent IDs most relevant to this workforce shape.
  - coverage    = last-minute shift replacement (high for venues, healthcare, events)
  - overtime    = OT cap auto-replace (high for 24/7 ops, healthcare, security)
  - onboarding  = onboarding auto-advance (high for staffing, hospitality, high-turnover)
  - compliance  = credential / license watch (high for healthcare, security, construction)
  - comms       = smart notify / role-routing (high for multi-site, distributed teams)
  - scheduling  = schedule auto-draft (high for stable rotating teams)
- CONNECTORS: 2-4 integration IDs the company most likely uses. Pick from the enum based on industry norms (e.g. Workday for large enterprises, BambooHR for mid-market, Gusto/Rippling for small/medium, Sage Intacct for construction, ADP very common across).
- GOALS: 5-7 workforce-management goals this company would want from Teambridge. Each goal is an OBJECT { label, detail }.
    * LABEL: 2-4 words, verb-first, plain-English outcome. Examples: "Fill shifts faster", "Reduce overtime", "Onboard faster", "Pre-clear credentials", "Forecast peak demand", "Improve show rate", "Cut manager workload". KEEP IT SHORT — it shows as a chip in the UI.
    * DETAIL: ONE short sentence (≤ 18 words) that names something specific to THIS company — a venue, a role, an operational pattern, or a state quirk. Use this for the supporting context the operator hovers/clicks for.
    * Together each goal should target a WFM outcome only: scheduling, coverage, overtime, compliance, onboarding, comms, forecasting, retention.
  Bad: label "Improve scheduling" (generic), detail none. Or labels longer than 4 words.
  Good label "Fill shifts faster", detail "Cover SoFi Stadium event-day gaps when ushers no-show."
  Good label "Reduce overtime",    detail "Smooth ICU RN hours at Memorial North across busy weeks."
  Good label "Pre-clear credentials", detail "Catch armed-post cert expiries 30 days ahead in SoCal."
- INSIGHTS: this is the most important field. Three SPECIFIC observations about this company's workforce that demonstrate you actually researched them — not generic industry truisms. Each insight should:
    * Reference something verifiable: a specific event, a public stat, a known fact about the company, a quirk of their operating model, a regulatory exposure their state creates, a competitor benchmark, a recent news item, a known shift pattern.
    * Connect to a Teambridge capability they'd activate: an agent that addresses it, a policy that matters because of it, a workflow that fits their shape.
    * Read like a thoughtful consultant would say it on first meeting, not a brochure.
  Bad: "Healthcare companies often face nurse shortages." (generic, useless)
  Good: "Memorial reported 14% RN turnover in your 2024 CMS filing — Credential Watch + Smart Notify would catch onboarding gaps before they become callouts."
  Good: "SoFi Stadium averages 22 ticketed events/month with 240% peak-to-trough staff variance — Last-minute Replacement is the highest-leverage agent for that pattern."
  Good: "California's predictive scheduling rule (SB 478) applies to most of your roles; we've activated 14-day post-ahead so you're never below the compliance floor."
  Each insight should be ONE sentence, ≤ 35 words, end with a period. No markdown, no asterisks.
- CONFIDENCE: be honest. URL with a clear public website → high. URL with little info found → medium. Pure description → medium at best. Guesses → low.

If you can't find the company, set companyName to your best guess derived from the URL, and use low confidence throughout.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY_not_configured' })
  }

  let body
  try {
    body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}')
  } catch {
    return res.status(400).json({ error: 'invalid_json' })
  }

  const { input, fromFreeText = false } = body || {}
  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'input_required' })
  }

  const userMessage = fromFreeText
    ? `Company description: "${input}"\n\nReturn the JSON config (no other text).`
    : `Company URL: ${input}\n\nSearch the web for this company and return the JSON config (no other text).`

  // Web search is enabled only for URL inputs. Free-text descriptions
  // get reasoned from directly — no web grounding needed and faster.
  const tools = fromFreeText ? undefined : [
    { type: 'web_search_20250305', name: 'web_search', max_uses: 3 },
  ]

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        ...(tools && { tools }),
      }),
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      console.error('[derive-config] anthropic non-2xx:', upstream.status, text.slice(0, 500))
      return res.status(502).json({ error: 'anthropic_error', status: upstream.status, detail: text.slice(0, 300) })
    }

    const data = await upstream.json()

    // Find the final text block — Claude may emit tool_use / tool_result
    // blocks in between when web_search runs. The last text block
    // contains the JSON.
    const textBlocks = (data?.content || []).filter(b => b.type === 'text')
    const lastText = textBlocks[textBlocks.length - 1]?.text || ''

    const jsonMatch = lastText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[derive-config] no JSON found:', lastText.slice(0, 500))
      return res.status(502).json({ error: 'no_json_in_response' })
    }

    let config
    try {
      config = JSON.parse(jsonMatch[0])
    } catch (err) {
      console.error('[derive-config] JSON parse failed:', err, jsonMatch[0].slice(0, 500))
      return res.status(502).json({ error: 'json_parse_failed' })
    }

    // Validate + normalize so downstream code can trust the shape.
    if (!VALID_INDUSTRIES.includes(config.industry)) {
      console.warn('[derive-config] invalid industry, defaulting:', config.industry)
      config.industry = 'staffing'
    }
    if (!VALID_RANGES.includes(config.headcountRange)) {
      const h = Number(config.headcount) || 0
      config.headcountRange = h <= 25 ? '1-25' : h <= 100 ? '26-100' : h <= 500 ? '101-500' : '500+'
    }
    config.agents = Array.isArray(config.agents)
      ? config.agents.filter(a => VALID_AGENTS.includes(a))
      : []
    config.suggestedConnectors = Array.isArray(config.suggestedConnectors)
      ? config.suggestedConnectors.filter(c => VALID_CONNECTORS.includes(c))
      : []
    config.locations = Array.isArray(config.locations) ? config.locations.slice(0, 6) : []
    config.roles = Array.isArray(config.roles) ? config.roles.slice(0, 8) : []
    config.insights = Array.isArray(config.insights)
      ? config.insights.filter(s => typeof s === 'string' && s.trim()).slice(0, 3)
      : []
    // Goals can come back as objects { label, detail } (new shape) or
    // bare strings (older prompt). Normalize both to { label, detail }.
    config.goals = Array.isArray(config.goals)
      ? config.goals
          .map(g => {
            if (g && typeof g === 'object' && typeof g.label === 'string' && g.label.trim()) {
              return { label: g.label.trim(), detail: typeof g.detail === 'string' ? g.detail.trim() : '' }
            }
            if (typeof g === 'string' && g.trim()) {
              return { label: g.trim().split(/\s+/).slice(0, 4).join(' '), detail: g.trim() }
            }
            return null
          })
          .filter(Boolean)
          .slice(0, 7)
      : []
    config.url = fromFreeText ? '' : input
    config.origin = fromFreeText ? 'ai-text' : 'ai-url'

    return res.status(200).json({ config })
  } catch (err) {
    console.error('[derive-config] threw:', err)
    return res.status(500).json({ error: 'derive_failed', message: String(err?.message ?? err).slice(0, 300) })
  }
}
