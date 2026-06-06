/* Vercel serverless function — returns a temporary ElevenLabs signed URL
 * for the Teambridge demo specialist. Requires ELEVENLABS_API_KEY and
 * ELEVENLABS_AGENT_ID in the Vercel environment. */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  const agentId = process.env.ELEVENLABS_AGENT_ID

  if (!apiKey) {
    return res.status(503).json({ error: 'ELEVENLABS_API_KEY not configured' })
  }
  if (!agentId) {
    return res.status(503).json({ error: 'ELEVENLABS_AGENT_ID not configured' })
  }

  try {
    const url = new URL('https://api.elevenlabs.io/v1/convai/conversation/get-signed-url')
    url.searchParams.set('agent_id', agentId)
    url.searchParams.set('include_conversation_id', 'true')

    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'accept': 'application/json',
      },
    })

    const text = await upstream.text()
    let body = null
    try { body = text ? JSON.parse(text) : null } catch { body = { error: text } }

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: body?.detail || body?.error || 'Failed to create ElevenLabs signed URL',
      })
    }

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      signedUrl: body?.signed_url,
      conversationId: body?.conversation_id,
      agentId,
    })
  } catch (err) {
    return res.status(500).json({ error: String(err?.message ?? err) })
  }
}
