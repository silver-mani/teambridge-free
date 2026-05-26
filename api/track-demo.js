/* Vercel serverless function — records Teambridge Free demo behavior in Convex. */

const CONVEX_URL = (process.env.CONVEX_URL || 'https://bright-squirrel-966.convex.cloud').replace(/\/+$/, '')

function decodeHeader(v) {
  if (!v) return undefined
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

function getClientIp(headers) {
  return (
    headers['x-vercel-forwarded-for'] ||
    headers['x-forwarded-for'] ||
    headers['x-real-ip'] ||
    undefined
  )
}

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  let body
  try {
    body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}')
  } catch {
    return res.status(400).json({ error: 'invalid_json' })
  }

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
  const eventName = typeof body.eventName === 'string' ? body.eventName : ''
  if (!sessionId || !eventName) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  const dataJson =
    body.data && typeof body.data === 'object'
      ? JSON.stringify(body.data).slice(0, 2000)
      : undefined

  const convexBody = {
    path: 'demoTracking:recordEvent',
    format: 'json',
    args: clean({
      sessionId,
      eventName,
      eventTs: typeof body.eventTs === 'number' ? body.eventTs : undefined,
      route: typeof body.route === 'string' ? body.route : undefined,
      path: typeof body.path === 'string' ? body.path : undefined,
      industry: typeof body.industry === 'string' ? body.industry : undefined,
      view: typeof body.view === 'string' ? body.view : undefined,
      landingPage: typeof body.landingPage === 'string' ? body.landingPage : undefined,
      referrer: typeof body.referrer === 'string' ? body.referrer : undefined,
      userAgent: req.headers['user-agent'],
      ipAddress: getClientIp(req.headers),
      country: decodeHeader(req.headers['x-vercel-ip-country']),
      city: decodeHeader(req.headers['x-vercel-ip-city']),
      region: decodeHeader(req.headers['x-vercel-ip-country-region']),
      ipTimezone: decodeHeader(req.headers['x-vercel-ip-timezone']),
      dataJson,
    }),
  }

  try {
    const upstream = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(convexBody),
    })
    if (!upstream.ok) {
      const text = await upstream.text()
      console.error('[track-demo] Convex failed:', upstream.status, text.slice(0, 300))
      return res.status(200).json({ ok: false })
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[track-demo] request failed:', err)
    return res.status(200).json({ ok: false })
  }
}
