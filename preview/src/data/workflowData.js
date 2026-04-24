/* ─────────────────────────────────────────────────────────────────────────────
   Workflow seed data
   One workflow end-to-end — the "Last-min Replacement" routine the Sandra scene
   just saved — modeled as a branching tree so operators see real decision
   structure instead of a straight line. The canvas walks this tree: every node
   on a stream renders in sequence; a node whose `branches` array is non-empty
   fans out below into parallel labeled streams. AI steps use `kind: 'agent'`
   and carry an `agentId`, which the renderer uses to swap the icon for the
   agent's animated avatar.
   ───────────────────────────────────────────────────────────────────────────── */

import { AGENTS } from './agents.js'

/* Node kinds map to pill colour + icon glyph. Keep these in sync with the CSS
   rules in workflows.css (`.wf-node-trigger`, `.wf-node-condition`, etc). */
export const NODE_KINDS = {
  trigger:   { label: 'Trigger',   tone: 'green'  },
  timer:     { label: 'Wait',      tone: 'amber'  },
  condition: { label: 'Condition', tone: 'slate'  },
  action:    { label: 'Action',    tone: 'blue'   },
  agent:     { label: 'AI Action', tone: 'purple' },
  end:       { label: 'End',       tone: 'mute'   },
}

/* ── Individual node definitions. Split out from the tree so they stay easy to
   read and we can flatten them for the click-to-details panel lookup. ── */

const TRIGGER = {
  id: 'trigger-shift-cancelled',
  kind: 'trigger',
  title: 'Shift is cancelled',
  subtitle: 'Shift · status changes to Cancelled',
  panel: {
    heading: 'Trigger · Shift cancelled',
    description: 'Fires the moment a scheduled shift flips to Cancelled.',
    promptPlaceholder: 'Describe the trigger you want — e.g. “only for ticketed events within 8 hrs of doors”.',
    fields: [
      { label: 'Object',        value: 'Shift',                        type: 'select' },
      { label: 'Event',         value: 'status changes to Cancelled',  type: 'select' },
      { label: 'Starts within', value: 'next 6 hours',                 type: 'text'   },
      { label: 'Sites',         value: ['Civic Auditorium', 'Harbor Theater'], type: 'pill-list' },
    ],
    chips: ['Status', 'Assignee', 'Start Time', 'Regular Pay Rate', 'Roles'],
  },
}

const COND_BACKUP = {
  id: 'condition-no-backup',
  kind: 'condition',
  title: 'Confirmed backup on the shift?',
  subtitle: 'Shift · backup_assignee',
  panel: {
    heading: 'Condition · Backup assignee',
    description: 'Splits the flow on whether another workflow (or ops lead) already locked in a swap.',
    promptPlaceholder: 'Tell me what this condition should check — e.g. “also route away if the venue is dark”.',
    fields: [
      { label: 'Field',    value: 'Shift.backup_assignee', type: 'select' },
      { label: 'Operator', value: 'is empty',              type: 'select' },
    ],
    chips: ['Backup', 'Assignee', 'Published status'],
  },
}

const END_ALREADY_COVERED = {
  id: 'end-already-covered',
  kind: 'end',
  title: 'Skip — already covered',
  subtitle: 'No outreach needed',
  panel: {
    heading: 'End · Already covered',
    description: 'A backup was already confirmed, so we stop here. Nova logs the skip for the coverage recap.',
    promptPlaceholder: 'Ask to tweak — e.g. “notify me anyway so I know it self-healed”.',
    fields: [
      { label: 'Logging', value: 'weekly coverage recap', type: 'text' },
    ],
    chips: ['Log only', 'Notify anyway', 'Add to recap'],
  },
}

const AGENT_RANK_AND_OFFER = {
  id: 'agent-nova-rank-offer',
  kind: 'agent',
  agentId: 'nova',
  title: 'Rank candidates & offer to top 3',
  subtitle: 'Score 12, SMS + in-app to top 3 in parallel, 90s expiry',
  panel: {
    heading: 'AI Action · Rank + offer with Nova',
    description: 'Nova scores eligible workers on four signals, then blasts offers to the top three in parallel. First confirmed accept wins; the other two offers are rescinded automatically.',
    promptPlaceholder: 'Shape this — e.g. “weight proximity higher at Civic”.',
    fields: [
      { label: 'Agent',          value: 'Nova · Schedule Coordinator',                               type: 'select'    },
      { label: 'Pool size',      value: '12 candidates',                                             type: 'text'      },
      { label: 'Signals',        value: ['Proximity (traffic-adjusted)', '90-day performance', 'Last-min accept rate', 'Hours fairness'], type: 'pill-list' },
      { label: 'Channels',       value: ['SMS', 'In-app push'],                                      type: 'pill-list' },
      { label: 'Offer expires',  value: '90 seconds',                                                type: 'text'      },
      { label: 'Offer template', value: 'Shift tonight: {{venue}} {{start_time}}. Tap to accept.',   type: 'template'  },
    ],
    chips: ['Proximity', 'Performance', 'Accept rate', 'SMS', 'In-app push'],
  },
}

const COND_URGENT = {
  id: 'condition-urgent-window',
  kind: 'condition',
  title: 'Notice window under 4 hours?',
  subtitle: 'start_time − now',
  panel: {
    heading: 'Condition · Urgent window',
    description: 'Inside 4 hours we fan out to three workers in parallel. Outside, we stagger offers one-by-one so we don’t over-notify.',
    promptPlaceholder: 'Ask to tweak — e.g. “make it under 6 hours for Civic only”.',
    fields: [
      { label: 'Field',    value: 'start_time − now', type: 'select' },
      { label: 'Operator', value: 'is less than',     type: 'select' },
      { label: 'Value',    value: '4 hours',          type: 'text'   },
    ],
    chips: ['Start Time', 'Notice window', 'Shift duration', 'Venue'],
  },
}

const WAIT_FOR_RESPONSES = {
  id: 'wait-for-responses',
  kind: 'timer',
  title: 'Wait 90 seconds',
  subtitle: 'Give workers time to tap accept',
  panel: {
    heading: 'Wait · 90 seconds',
    description: 'Pauses the workflow long enough for the top-three offers to be seen and acted on before we branch on the response.',
    promptPlaceholder: 'Ask to tweak — e.g. “give them 2 minutes at Harbor Theater”.',
    fields: [
      { label: 'Duration', value: '90 seconds',              type: 'text'   },
      { label: 'Expires',  value: 'end of offer.expiry',     type: 'select' },
    ],
    chips: ['30 sec', '90 sec', '2 min', '5 min'],
  },
}

const WAIT_QUEUE = {
  id: 'wait-queue-settle',
  kind: 'timer',
  title: 'Wait up to 40 minutes',
  subtitle: 'Let Atlas work through the queue before confirming',
  panel: {
    heading: 'Wait · Up to 40 minutes',
    description: 'Holds the flow while Atlas staggers offers every 8 minutes. Exits early as soon as someone accepts.',
    promptPlaceholder: 'Ask to tweak — e.g. “cap the wait at 30 minutes for Civic”.',
    fields: [
      { label: 'Max duration',  value: '40 minutes',            type: 'text'   },
      { label: 'Early exit on', value: 'offer.response = accepted', type: 'select' },
    ],
    chips: ['20 min', '40 min', '60 min', 'Until accept'],
  },
}

const AGENT_SEQUENTIAL = {
  id: 'agent-atlas-sequential',
  kind: 'agent',
  agentId: 'atlas',
  title: 'Run a staggered offer queue',
  subtitle: '5 candidates · 8 min between pings · in-app first, SMS fallback',
  panel: {
    heading: 'AI Action · Staggered queue with Atlas',
    description: 'For non-urgent coverage Atlas queues five offers one-at-a-time with an 8-minute wait between pings so workers aren’t carpet-bombed.',
    promptPlaceholder: 'Ask to tweak — e.g. “stretch to 12 minutes at the Harbor site”.',
    fields: [
      { label: 'Agent',           value: 'Atlas · Workforce Forecaster',    type: 'select'    },
      { label: 'Queue size',      value: '5 candidates',                    type: 'text'      },
      { label: 'Interval',        value: '8 minutes between offers',        type: 'text'      },
      { label: 'Primary channel', value: ['In-app push', 'SMS fallback'],   type: 'pill-list' },
    ],
    chips: ['In-app push', 'SMS', 'Queue', 'Fairness'],
  },
}

const COND_ACCEPT = {
  id: 'condition-accept-received',
  kind: 'condition',
  title: 'Accept received in time?',
  subtitle: 'offer.response · is · accepted',
  panel: {
    heading: 'Condition · Wait for accept',
    description: 'Branches on whether anyone accepted before the expiry. Happy path confirms the winner; the fallback hands off to a human.',
    promptPlaceholder: 'Ask to tweak — e.g. “also notify me on the happy path”.',
    fields: [
      { label: 'Field',    value: 'offer.response',    type: 'select' },
      { label: 'Operator', value: 'is',                type: 'select' },
      { label: 'Value',    value: 'accepted',          type: 'select' },
      { label: 'Timeout',  value: '90 seconds',        type: 'text'   },
    ],
    chips: ['Response', 'Timeout', 'First-accept wins'],
  },
}

const AGENT_CONFIRM = {
  id: 'agent-iris-confirm',
  kind: 'agent',
  agentId: 'iris',
  title: 'Credential-check, confirm & publish',
  subtitle: 'Verify badge · lock shift · rescind other offers · notify lead',
  panel: {
    heading: 'AI Action · Close the loop with Iris',
    description: 'Iris verifies the winner’s credentials for the site, locks them onto the shift, rescinds the other offers, and pings the event lead.',
    promptPlaceholder: 'Ask to tweak — e.g. “also log this to the weekly coverage recap”.',
    fields: [
      { label: 'Agent',     value: 'Iris · Credentialing Agent',                 type: 'select' },
      { label: 'Verify',    value: ['Venue badge', 'Training currency'],         type: 'pill-list' },
      { label: 'Confirm',   value: 'assign winner to Shift.assignee',            type: 'text'   },
      { label: 'Rescind',   value: 'cancel outstanding offers',                  type: 'text'   },
      { label: 'Publish',   value: 'update Saturday schedule at the site',       type: 'text'   },
      { label: 'Notify',    value: 'event lead · SMS + in-app',                  type: 'text'   },
    ],
    chips: ['Credentials', 'Confirm', 'Publish', 'Notify'],
  },
}

const AGENT_ESCALATE = {
  id: 'agent-leo-escalate',
  kind: 'agent',
  agentId: 'leo',
  title: 'Escalate to ops lead',
  subtitle: 'Page Miguel · attach override picks · chase GM after 2 min',
  panel: {
    heading: 'AI Action · Escalate with Leo',
    description: 'No accept in 90 seconds. Leo pages the ops lead with a ranked shortlist of overrides and the next three workers who didn’t receive the offer yet.',
    promptPlaceholder: 'Ask to tweak — e.g. “also text the GM if Miguel doesn’t acknowledge in 2 minutes”.',
    fields: [
      { label: 'Agent',       value: 'Leo · Compliance Agent',                         type: 'select' },
      { label: 'Page',        value: 'Miguel Rivera · SMS + phone call',               type: 'text'   },
      { label: 'Attach',      value: ['Top 3 override picks', 'Reject log'],           type: 'pill-list' },
      { label: 'Escalate to', value: 'GM if no ack in 2 minutes',                      type: 'text'   },
    ],
    chips: ['Page', 'Phone call', 'Shortlist', 'Override'],
  },
}

/* ── Tree layout.
   The top-level `stream` is a vertical flow. Any node with `branches` fans out
   below it into parallel labeled streams. Streams end when their array does —
   we don’t force a merge node, so branches can terminate independently, which
   is exactly what this scenario wants. ── */

const LAST_MIN_REPLACEMENT = {
  id: 'last-min-replacement',
  title: 'Last-min Replacement',
  status: 'draft',
  eyebrow: 'Created from Sandra cancellation · Saturday 7pm',
  description:
    'Nova detects a shift cancellation, checks that no backup is already ' +
    'confirmed, and branches on how urgent the window is before handing off ' +
    'to specialist agents for outreach, confirmation, and escalation.',
  owner: 'Nova (Schedule Coordinator)',
  lastEdited: 'Created just now',
  stream: [
    TRIGGER,
    {
      ...COND_BACKUP,
      branches: [
        {
          label: 'No backup',
          tone: 'primary',
          stream: [
            {
              ...COND_URGENT,
              branches: [
                {
                  label: 'Urgent (<4h)',
                  tone: 'primary',
                  stream: [
                    AGENT_RANK_AND_OFFER,
                    WAIT_FOR_RESPONSES,
                    {
                      ...COND_ACCEPT,
                      branches: [
                        {
                          label: 'Yes',
                          tone: 'primary',
                          stream: [AGENT_CONFIRM],
                        },
                        {
                          label: 'No',
                          tone: 'warn',
                          stream: [AGENT_ESCALATE],
                        },
                      ],
                    },
                  ],
                },
                {
                  label: 'Standard',
                  tone: 'mute',
                  stream: [AGENT_SEQUENTIAL, WAIT_QUEUE, AGENT_CONFIRM],
                },
              ],
            },
          ],
        },
        {
          label: 'Has backup',
          tone: 'mute',
          stream: [END_ALREADY_COVERED],
        },
      ],
    },
  ],
}

export const WORKFLOWS = [LAST_MIN_REPLACEMENT]

export function getWorkflow(id) {
  return WORKFLOWS.find(w => w.id === id) ?? WORKFLOWS[0]
}

/* Walk the tree and return a flat {id → node} index so the right panel can
   look up the selected node without carrying a path through the tree. */
export function flattenNodes(stream, acc = {}) {
  for (const node of stream ?? []) {
    acc[node.id] = node
    if (node.branches) {
      for (const b of node.branches) flattenNodes(b.stream, acc)
    }
  }
  return acc
}

/* First node id in the tree — what the detail panel selects by default. */
export function firstNodeId(workflow) {
  return workflow.stream?.[0]?.id ?? null
}

/* Resolve an agent for a node (only `agent` nodes carry an `agentId`). */
export function nodeAgent(node) {
  if (node?.kind !== 'agent') return null
  return AGENTS[node.agentId] ?? null
}
