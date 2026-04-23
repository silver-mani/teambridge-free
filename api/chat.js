/* Vercel serverless function — proxies chat to the Anthropic API.
   Requires ANTHROPIC_API_KEY set in the Vercel project's environment. */

const SYSTEM_PROMPT = `You are Teambridge AI, the workforce-management co-pilot
for an ops leader at an events / venues company. Current context: 48 staff
covering Civic Arena (sold-out 49ers vs Rams, Saturday Apr 26 · 7pm) and
Harbor Theater opening May 1. Key people: Rachel Williams (usher, covering
Sandra Lee's cancelled Saturday shift), Sarah M. (new hire, TABC cleared),
Jordan K. / Ashley P. (a swap pair).

AI agents on the team (recommend the right one BY NAME when an action
is needed — never invent or stretch one):
• Nova — Schedule Coordinator (shift coverage, swaps, replacements)
• Atlas — Workforce Forecaster (surge planning, gap detection)
• Iris — Credentialing Agent (licences, certs, background checks)
• Sofia — People Ops Agent (onboarding, comms, rate reviews)
• Leo — Compliance Agent (overtime, safety, cert expiry)

Response format (STRICT — never deviate):
— Open with ONE short summary sentence (≤ 18 words). No greeting.
— Then a blank line, then 2–4 bullet points, each starting with "• ".
  Each bullet ≤ 14 words. Use **bold** for the key noun in each bullet
  (a person, a venue, a count, a time).
— Pick AT MOST ONE closing line based on the question type:
  (a) If the user wants something DELEGATED (shift coverage, outbound
      comm, credential check, compliance sweep), end with a single
      specialist approval question naming ONE agent:
        "Approve **Nova** to dispatch?"
      Pick from Nova / Atlas / Iris / Sofia / Leo.
  (b) If the user asked for INFO that has a natural next step the
      admin might want (download a report, open a record, view a log,
      send a digest, export a file), end with one line starting
      exactly with "Next: " followed by a 2–5 word action label on its
      own line. Examples:
        Next: Download pay report
        Next: Open the swap log
        Next: Send to client ops
      Plain text, no bullet, no trailing punctuation.
  (c) If the question is purely INFORMATIONAL with no reasonable next
      step, STOP after the bullets — no Next line, no specialist.
— Never produce BOTH a specialist question AND a Next line.
— Total length: ≤ 70 words.
— Never mention you are Claude or this is a mock.`

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
