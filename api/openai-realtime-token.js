/* Vercel serverless function — creates an ephemeral OpenAI Realtime
 * client secret for the browser voice demo.
 *
 * Requires OPENAI_API_KEY in the Vercel environment. */

const MODEL = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2'

const toolDefinitions = [
  {
    type: 'function',
    name: 'openWorkspace',
    description: 'Open a Teambridge demo workspace by industry vertical.',
    parameters: {
      type: 'object',
      properties: {
        industry: {
          type: 'string',
          enum: [
            'healthcare', 'staffing', 'events', 'hospitality', 'long-term-care',
            'security', 'janitorial', 'light-industrial', 'construction',
          ],
        },
      },
      required: ['industry'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'buildWorkspace',
    description: 'Open the guided Teambridge build flow so Nova can create a workspace from a company website or short company description.',
    parameters: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'showCapability',
    description: 'Navigate to or highlight a Teambridge demo capability.',
    parameters: {
      type: 'object',
      properties: {
        capability: {
          type: 'string',
          enum: [
            'overview', 'schedule_gap', 'shift_requests', 'time_tracking',
            'payroll', 'pay_review', 'people', 'onboarding', 'compliance',
            'agents', 'engage', 'ready_workspaces',
          ],
        },
      },
      required: ['capability'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'requestMeeting',
    description: 'Open the Teambridge demo booking flow when the visitor asks to talk to sales.',
    parameters: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
      },
      required: ['reason'],
      additionalProperties: false,
    },
  },
]

const instructions = `You are Nova, Teambridge's AI demo guide.

You are inside an interactive workforce management demo. Speak naturally, confidently,
and briefly. Sound like a product specialist, not a chatbot.
Only respond to clear user intent: a spoken question, command, or typed message.
Ignore accidental noises, coughs, breaths, short unclear sounds, and background
speech that is not directed at Nova.
Some visitors are on a visible access form that asks for a work email. If a tool
returns lead_gate_required, do not imply you opened anything. Explain that the
workspace is ready, but you need them to enter their work email in the visible
form first so Nova can save the workspace and connect the walkthrough to the
right organization.
When a visitor asks to open, show, navigate to, walk through, or explain a workspace
or product area, call the matching tool immediately. Do not say code, JSON, function
names, selectors, or implementation details.

Use tools aggressively for demo navigation:
- build my workspace, create my workspace, start with my company, company
  website, website, domain, describe my company -> buildWorkspace
- healthcare, staffing, events, hospitality, long-term-care, security, janitorial,
  light-industrial, construction -> openWorkspace
- schedule, coverage, open shifts -> showCapability schedule_gap
- payroll, pay approval, instant pay -> showCapability payroll
- roster, people, credentials -> showCapability people
- onboarding, new hires -> showCapability onboarding
- compliance, policies, certifications -> showCapability compliance
- agents, workflows, automations -> showCapability agents
- messages, SMS, communications -> showCapability engage

After a tool succeeds, explain what changed in one sentence and offer one next area.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'OPENAI_API_KEY_not_configured' })
  }

  try {
    const upstream = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: MODEL,
          instructions,
          audio: {
            input: {
              noise_reduction: { type: 'far_field' },
              turn_detection: {
                type: 'semantic_vad',
                eagerness: 'low',
                create_response: true,
                interrupt_response: false,
              },
            },
          },
          tools: toolDefinitions,
          tool_choice: 'auto',
        },
      }),
    })

    const data = await upstream.json().catch(() => ({}))
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'openai_realtime_token_failed',
        detail: data?.error?.message || data?.error || data,
      })
    }

    return res.status(200).json({
      clientSecret: data.value || data.client_secret?.value || data.client_secret,
      expiresAt: data.expires_at || data.client_secret?.expires_at,
      model: MODEL,
    })
  } catch (err) {
    return res.status(500).json({
      error: 'openai_realtime_token_failed',
      message: String(err?.message ?? err),
    })
  }
}
