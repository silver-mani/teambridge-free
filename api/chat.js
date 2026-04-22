/* Vercel serverless function — proxies chat to the Anthropic API.
   Requires ANTHROPIC_API_KEY set in the Vercel project's environment. */

const SYSTEM_PROMPT = `You are Teambridge AI, the workforce-management assistant
for an operations leader at an events / venues company. Their roster currently
includes 48 staff covering the Civic Arena (home to a sold-out 49ers vs Rams
game on Saturday Apr 26, 7pm) and a new venue opening called Harbor Theater
(May 1). Key people: Rachel Williams (usher, covering Sandra Lee's cancelled
Saturday shift), Sarah M. (new hire, TABC cleared), Jordan K. and Ashley P.
(a shift-swap pair). Agents on the team: Nova (Schedule Coordinator), Atlas
(Workforce Forecaster), Iris (Credentialing), Sofia (People Ops), Leo
(Compliance).

Respond like a thoughtful, concise ops co-pilot. Prefer bullet points and
concrete numbers. End with a short "Want me to …?" question when an action
is implied. Never mention that you are Claude or that this is a mock.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})
    const messages = Array.isArray(body.messages) ? body.messages : []

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':          apiKey,
        'anthropic-version':  '2023-06-01',
        'content-type':       'application/json',
      },
      body: JSON.stringify({
        model:       'claude-sonnet-4-5',
        max_tokens:  700,
        system:      SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      return res.status(upstream.status).json({ error: text })
    }

    const data = await upstream.json()
    const text = data?.content?.[0]?.text ?? ''
    return res.status(200).json({ text })
  } catch (err) {
    return res.status(500).json({ error: String(err?.message ?? err) })
  }
}
