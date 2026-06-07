/* Vercel serverless function — uses Vercel AI SDK tool calling to turn
 * Nova/user transcript into safe, structured Teambridge demo UI actions.
 *
 * Requires ANTHROPIC_API_KEY in the Vercel environment. */

import { anthropic } from '@ai-sdk/anthropic'
import { generateText, stepCountIs, tool } from 'ai'
import { z } from 'zod'

const VALID_INDUSTRIES = [
  'healthcare', 'staffing', 'events', 'hospitality', 'long-term-care',
  'security', 'janitorial', 'light-industrial', 'construction',
]

const VALID_ACTIONS = [
  'intro', 'ready_workspaces', 'overview', 'schedule_gap', 'shift_requests',
  'time_tracking', 'payroll', 'pay_review', 'people', 'onboarding',
  'compliance', 'agents', 'sage_overtime', 'engage',
]

const SYSTEM_PROMPT = `You are Nova, Teambridge's AI demo guide.

Your job is not to write code. Your job is to decide whether a visitor's latest
voice transcript should move or highlight the Teambridge demo UI.

Always call the controlDemo tool. Never mention tool names, function calls,
JSON, code, selectors, or implementation details in natural language.

Use a demo action when the visitor asks to see, open, show, explain, walk
through, or go to a Teambridge workspace/capability. If the transcript is just
small talk, a consent notice, a partial phrase, or unrelated text, return
intent "none" with no actions.

Workspace examples:
- "show me healthcare" -> open_workspace healthcare
- "open security" -> open_workspace security
- "staffing agency demo" -> open_workspace staffing

Capability examples:
- scheduling, coverage gaps, open shifts -> show_capability schedule_gap
- payroll, pay approval, instant pay -> show_capability payroll
- people, roster, credentials -> show_capability people
- onboarding, new hires -> show_capability onboarding
- compliance, policies, certifications -> show_capability compliance
- agents, automations, workflows -> show_capability agents
- messages, communications -> show_capability engage
- demo accounts, verticals, workspaces -> show_capability ready_workspaces

Return only high-confidence UI actions.`

const actionSchema = z.object({
  type: z.enum(['open_workspace', 'show_capability']),
  industry: z.enum(VALID_INDUSTRIES).optional(),
  action: z.enum(VALID_ACTIONS).optional(),
  label: z.string().max(80).optional(),
})

const controlDemoInputSchema = z.object({
  intent: z.enum(['navigate', 'highlight', 'none']),
  confidence: z.number().min(0).max(1),
  spokenResponse: z.string().max(180).optional(),
  actions: z.array(actionSchema).max(3).default([]),
  rationale: z.string().max(220).optional(),
})

function normalizeActions(input) {
  if (!input || input.intent === 'none' || input.confidence < 0.55) return []

  return (Array.isArray(input.actions) ? input.actions : [])
    .map(action => {
      if (action.type === 'open_workspace' && VALID_INDUSTRIES.includes(action.industry)) {
        return {
          kind: 'workspace',
          value: action.industry,
          label: action.label || `${action.industry.replace(/-/g, ' ')} workspace`,
        }
      }

      if (action.type === 'show_capability' && VALID_ACTIONS.includes(action.action)) {
        return {
          kind: 'action',
          value: action.action,
          label: action.label || action.action.replace(/_/g, ' '),
        }
      }

      return null
    })
    .filter(Boolean)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY_not_configured' })
  }

  let body
  try {
    body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}')
  } catch {
    return res.status(400).json({ error: 'invalid_json' })
  }

  const text = String(body?.text || '').trim().slice(0, 1000)
  if (!text) return res.status(400).json({ error: 'text_required' })

  const snapshot = body?.snapshot && typeof body.snapshot === 'object' ? body.snapshot : {}
  const speaker = String(body?.speaker || 'unknown').slice(0, 80)
  const eventName = String(body?.eventName || 'transcript').slice(0, 120)

  const prompt = [
    `Latest transcript speaker: ${speaker}`,
    `Transcript event: ${eventName}`,
    `Current demo industry: ${snapshot.industry || 'none'}`,
    `Current demo view: ${snapshot.view || 'entry'}`,
    `Current path: ${snapshot.path || 'unknown'}`,
    '',
    `Transcript: ${text}`,
  ].join('\n')

  const toolOutputs = []

  try {
    const result = await generateText({
      model: anthropic('claude-sonnet-4-5'),
      system: SYSTEM_PROMPT,
      prompt,
      tools: {
        controlDemo: tool({
          description: 'Return safe Teambridge demo UI actions for the browser to execute.',
          inputSchema: controlDemoInputSchema,
          execute: async input => {
            const output = {
              intent: input.intent,
              confidence: input.confidence,
              spokenResponse: input.spokenResponse || '',
              rationale: input.rationale || '',
              actions: normalizeActions(input),
            }
            toolOutputs.push(output)
            return output
          },
        }),
      },
      toolChoice: { type: 'tool', toolName: 'controlDemo' },
      stopWhen: stepCountIs(1),
    })

    const output = toolOutputs[0] || {
      intent: 'none',
      confidence: 0,
      spokenResponse: '',
      rationale: 'No tool output returned.',
      actions: [],
    }

    return res.status(200).json({
      ...output,
      model: 'claude-sonnet-4-5',
      toolCalls: result.steps?.flatMap(step => step.toolCalls || []).length || 0,
    })
  } catch (err) {
    console.error('[nova-agent] failed:', err)
    return res.status(500).json({
      error: 'nova_agent_failed',
      message: String(err?.message ?? err).slice(0, 300),
    })
  }
}
