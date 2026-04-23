/* Vercel serverless function — proxies text-to-speech to ElevenLabs.
   Requires ELEVENLABS_API_KEY set in the Vercel project's environment. */

const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL' // Bella — warm female
const DEFAULT_MODEL    = 'eleven_turbo_v2_5'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'ELEVENLABS_API_KEY not configured' })
  }

  try {
    const body   = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})
    const text   = (body.text ?? '').toString()
    const voiceId = (body.voiceId ?? DEFAULT_VOICE_ID).toString()
    const model   = (body.model ?? DEFAULT_MODEL).toString()

    if (!text.trim()) {
      return res.status(400).json({ error: 'text is required' })
    }

    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key':   apiKey,
        'content-type': 'application/json',
        'accept':       'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
      }),
    })

    if (!upstream.ok) {
      const errText = await upstream.text()
      return res.status(upstream.status).json({ error: errText })
    }

    const buf = Buffer.from(await upstream.arrayBuffer())
    res.setHeader('Content-Type',  'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    return res.status(200).send(buf)
  } catch (err) {
    return res.status(500).json({ error: String(err?.message ?? err) })
  }
}
