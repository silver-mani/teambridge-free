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

/* ── Workflow trees.
   Each workflow is a single vertical `stream`. Nodes with `branches` fork
   into parallel labeled streams; we keep at most one fork per workflow so
   the canvas stays readable.
   ── */

const LAST_MIN_REPLACEMENT = {
  id: 'last-min-replacement',
  title: 'Last-min Replacement',
  status: 'active',
  eyebrow: 'Auto-fills shift cancellations within 4 hours',
  description:
    'Nova ranks qualified workers, offers the shift to the top 3 in parallel, ' +
    'and waits 90 seconds for an accept. On accept, Iris confirms and publishes; ' +
    'otherwise Leo pages the ops lead.',
  owner: 'Nova (Schedule Coordinator)',
  lastEdited: 'Created from the Sandra Lee scene',
  stream: [
    TRIGGER,
    AGENT_RANK_AND_OFFER,
    WAIT_FOR_RESPONSES,
    {
      ...COND_ACCEPT,
      branches: [
        { label: 'Accepted',  tone: 'primary', stream: [AGENT_CONFIRM]  },
        { label: 'No accept', tone: 'warn',    stream: [AGENT_ESCALATE] },
      ],
    },
  ],
}

/* ── 2. OT Cap Auto-Replace
   Triggered when a schedule update would push a worker past 40 hrs/week.
   Nova rebalances; if a clean swap exists we apply it, otherwise Leo
   loops the ops lead in. ── */

const OTCAP_TRIGGER = {
  id: 'otcap-trigger',
  kind: 'trigger',
  title: 'Worker projected over 40 hrs',
  subtitle: 'Schedule · weekly hours > 40',
  panel: {
    heading: 'Trigger · Projected over OT cap',
    description: 'Fires when a publish or shift assignment would push a worker over the 40-hr weekly cap.',
    promptPlaceholder: 'Tweak — e.g. "only fire on Levi\'s shifts" or "include daily 8-hr cap too".',
    fields: [
      { label: 'Object',    value: 'Schedule',                 type: 'select' },
      { label: 'Threshold', value: '> 40 hrs / week (weekly)', type: 'select' },
    ],
    chips: ['40 hrs/week', '8 hrs/day', 'Daily double-time', 'Per venue'],
  },
}

const OTCAP_FIND = {
  id: 'otcap-find',
  kind: 'agent',
  agentId: 'nova',
  title: 'Find a clean swap',
  subtitle: 'Top 2 workers under cap, qualified for the shift',
  panel: {
    heading: 'AI Action · Nova picks a swap',
    description: 'Nova scans the same role + venue pool, filters to workers under their weekly cap and properly credentialed, and ranks the top 2 by performance + fairness.',
    promptPlaceholder: 'Shape the rank — e.g. "weight under-utilised workers higher".',
    fields: [
      { label: 'Agent',     value: 'Nova · Schedule Coordinator', type: 'select' },
      { label: 'Pool',      value: 'Same role · same venue · under 38 hrs', type: 'text' },
      { label: 'Rank by',   value: ['Performance (90d)', 'Hours fairness'], type: 'pill-list' },
      { label: 'Offer to',  value: 'Top 2 · 60 sec expiry',       type: 'text' },
    ],
    chips: ['Performance', 'Fairness', 'Cap headroom', 'SMS + in-app'],
  },
}

const OTCAP_WAIT = {
  id: 'otcap-wait',
  kind: 'timer',
  title: 'Wait 60 seconds',
  subtitle: 'Give the offered workers a chance to accept',
  panel: {
    heading: 'Wait · 60 seconds',
    description: 'Holds the workflow long enough for either offer to come back accepted.',
    promptPlaceholder: 'Tweak — e.g. "stretch to 2 minutes for non-game days".',
    fields: [{ label: 'Duration', value: '60 seconds', type: 'text' }],
    chips: ['30 sec', '60 sec', '2 min'],
  },
}

const OTCAP_COND = {
  id: 'otcap-cond',
  kind: 'condition',
  title: 'Did anyone accept?',
  subtitle: 'offer.response · accepted',
  panel: {
    heading: 'Condition · Accept received',
    description: 'Branches on whether either offered worker took the shift inside the 60-second window.',
    promptPlaceholder: 'Tweak — e.g. "always page the GM if it goes to escalation".',
    fields: [
      { label: 'Field',    value: 'offer.response', type: 'select' },
      { label: 'Operator', value: 'is',             type: 'select' },
      { label: 'Value',    value: 'accepted',       type: 'select' },
    ],
    chips: ['Response', 'First-accept wins'],
  },
}

const OTCAP_SWAP = {
  id: 'otcap-swap',
  kind: 'agent',
  agentId: 'iris',
  title: 'Swap and notify both workers',
  subtitle: 'Move the shift, message both staff, log the OT recovery',
  panel: {
    heading: 'AI Action · Iris finalises the swap',
    description: 'Iris re-assigns the shift to the accepter, notifies both workers, and logs the recovery to the OT ledger so payroll downstream stays clean.',
    promptPlaceholder: 'Tweak — e.g. "also CC the GM on the swap message".',
    fields: [
      { label: 'Agent',  value: 'Iris · Credentialing Agent',         type: 'select' },
      { label: 'Update', value: 'Shift.assignee → accepter',           type: 'text'   },
      { label: 'Notify', value: ['Original worker', 'Accepter'],       type: 'pill-list' },
      { label: 'Log',    value: 'OT recovery ledger',                  type: 'text'   },
    ],
    chips: ['Re-assign', 'Notify both', 'Log recovery'],
  },
}

const OTCAP_ESCALATE = {
  id: 'otcap-escalate',
  kind: 'agent',
  agentId: 'leo',
  title: 'Escalate to ops lead',
  subtitle: 'Page Miguel with the override picks',
  panel: {
    heading: 'AI Action · Leo loops in the ops lead',
    description: 'No accept inside 60 seconds — Leo pages the ops lead with a 3-deep override shortlist plus the option to approve the OT.',
    promptPlaceholder: 'Tweak — e.g. "also notify the GM if Miguel doesn\'t ack in 90 sec".',
    fields: [
      { label: 'Agent',    value: 'Leo · Compliance Agent',                type: 'select' },
      { label: 'Page',     value: 'Miguel Rivera · SMS + phone',           type: 'text'   },
      { label: 'Options',  value: ['3 override picks', 'Approve OT once'], type: 'pill-list' },
    ],
    chips: ['Page', 'Phone', 'Approve OT', 'Shortlist'],
  },
}

const OT_CAP_AUTOREPLACE = {
  id: 'ot-cap-autoreplace',
  title: 'OT Cap Auto-Replace',
  status: 'active',
  eyebrow: 'Re-balances when a publish would trip the 40-hr cap',
  description:
    'When a schedule change would push a worker over 40 hrs, Nova finds a ' +
    'qualified swap candidate. Iris commits the swap if it lands; otherwise ' +
    'Leo pages the ops lead with override options.',
  owner: 'Nova (Schedule Coordinator)',
  lastEdited: '3 days ago',
  stream: [
    OTCAP_TRIGGER,
    OTCAP_FIND,
    OTCAP_WAIT,
    {
      ...OTCAP_COND,
      branches: [
        { label: 'Accepted',  tone: 'primary', stream: [OTCAP_SWAP]      },
        { label: 'No accept', tone: 'warn',    stream: [OTCAP_ESCALATE] },
      ],
    },
  ],
}

/* ── 3. Late Clock-In Recovery
   Worker is past their scheduled start with no clock-in. Sofia nudges
   them; if they're still missing 5 minutes later, Leo escalates with
   backup options. ── */

const LATE_TRIGGER = {
  id: 'late-trigger',
  kind: 'trigger',
  title: 'Worker is 5 min late, no clock-in',
  subtitle: 'Shift · start_time + 5 min · no punch',
  panel: {
    heading: 'Trigger · Late clock-in',
    description: 'Fires when the scheduled start time is 5 minutes in the past and no clock-in has been recorded.',
    promptPlaceholder: 'Tweak — e.g. "fire after 10 minutes for grace-period shifts".',
    fields: [
      { label: 'Field',     value: 'now − Shift.start_time', type: 'select' },
      { label: 'Threshold', value: '> 5 minutes',            type: 'select' },
    ],
    chips: ['3 min', '5 min', '10 min', 'Per role'],
  },
}

const LATE_NUDGE = {
  id: 'late-nudge',
  kind: 'agent',
  agentId: 'sofia',
  title: 'Nudge the worker',
  subtitle: 'SMS + in-app · "Are you on your way?"',
  panel: {
    heading: 'AI Action · Sofia checks in',
    description: 'Sofia sends a friendly SMS plus an in-app push asking if the worker is on the way. Tracks the read receipt for the next condition.',
    promptPlaceholder: 'Tweak — e.g. "skip in-app for night shifts".',
    fields: [
      { label: 'Agent',    value: 'Sofia · People Ops Agent',          type: 'select' },
      { label: 'Channels', value: ['SMS', 'In-app push'],              type: 'pill-list' },
      { label: 'Message',  value: 'Hey {{first_name}} — running late? Tap to confirm or reschedule.', type: 'template' },
    ],
    chips: ['SMS', 'In-app push', 'Read receipt'],
  },
}

const LATE_WAIT = {
  id: 'late-wait',
  kind: 'timer',
  title: 'Wait 5 minutes',
  subtitle: 'Give them a chance to clock in',
  panel: {
    heading: 'Wait · 5 minutes',
    description: 'Holds the workflow so we don\'t escalate immediately on every late clock-in.',
    promptPlaceholder: 'Tweak — e.g. "give them 10 minutes for cleanup shifts".',
    fields: [{ label: 'Duration', value: '5 minutes', type: 'text' }],
    chips: ['3 min', '5 min', '10 min'],
  },
}

const LATE_COND = {
  id: 'late-cond',
  kind: 'condition',
  title: 'Did they clock in?',
  subtitle: 'Shift · clock_in_time · is set',
  panel: {
    heading: 'Condition · Clocked in?',
    description: 'Branches on whether the worker clocked in during the 5-minute grace window.',
    promptPlaceholder: 'Tweak — e.g. "also branch on partial-attendance".',
    fields: [
      { label: 'Field',    value: 'Shift.clock_in_time', type: 'select' },
      { label: 'Operator', value: 'is set',              type: 'select' },
    ],
    chips: ['Clocked in', 'Still missing'],
  },
}

const LATE_LOG = {
  id: 'late-log',
  kind: 'end',
  title: 'Log lateness · close',
  subtitle: 'Pattern flag if 2+ this period',
  panel: {
    heading: 'End · Logged',
    description: 'Records the lateness on the worker\'s file. If this is the second late clock-in in the period, raises a pattern flag for the next pay review.',
    promptPlaceholder: 'Tweak — e.g. "also notify their direct manager".',
    fields: [{ label: 'Logging', value: 'Worker file + pattern flag', type: 'text' }],
    chips: ['Pattern flag', 'Manager notify'],
  },
}

const LATE_ESCALATE = {
  id: 'late-escalate',
  kind: 'agent',
  agentId: 'leo',
  title: 'Notify ops lead with backup options',
  subtitle: 'Page Miguel · attach 3 ranked replacements',
  panel: {
    heading: 'AI Action · Leo escalates',
    description: 'No clock-in after the 5-minute window. Leo pages the ops lead with a 3-deep replacement shortlist already filtered for qualifications and proximity.',
    promptPlaceholder: 'Tweak — e.g. "also auto-offer to the top replacement".',
    fields: [
      { label: 'Agent',     value: 'Leo · Compliance Agent',           type: 'select' },
      { label: 'Page',      value: 'Ops lead · SMS + phone',           type: 'text'   },
      { label: 'Attach',    value: '3 ranked replacements',            type: 'text'   },
    ],
    chips: ['Page', 'Replacement shortlist'],
  },
}

const LATE_CLOCKIN_RECOVERY = {
  id: 'late-clockin-recovery',
  title: 'Late Clock-In Recovery',
  status: 'active',
  eyebrow: 'Nudges, then escalates with replacement options',
  description:
    'Five minutes after a missed clock-in Sofia nudges the worker. If they\'re ' +
    'still missing five minutes later, Leo pages the ops lead with a ranked ' +
    'shortlist of replacements.',
  owner: 'Sofia (People Ops Agent)',
  lastEdited: '1 week ago',
  stream: [
    LATE_TRIGGER,
    LATE_NUDGE,
    LATE_WAIT,
    {
      ...LATE_COND,
      branches: [
        { label: 'Yes',         tone: 'primary', stream: [LATE_LOG]      },
        { label: 'Still missing', tone: 'warn',  stream: [LATE_ESCALATE] },
      ],
    },
  ],
}

/* ── 4. Onboarding Auto-Advance
   New candidate finishes the form → Iris kicks off background check
   and DocuSign in parallel. When both clear, the candidate flips to
   Hired; otherwise Sofia surfaces the failure for review. ── */

const ONB_TRIGGER = {
  id: 'onb-trigger',
  kind: 'trigger',
  title: 'Candidate completed intake form',
  subtitle: 'Onboarding · stage = Form · status = submitted',
  panel: {
    heading: 'Trigger · Form submitted',
    description: 'Fires when a candidate finishes the intake form and is ready for verification.',
    promptPlaceholder: 'Tweak — e.g. "skip if hiring manager is set to manual".',
    fields: [
      { label: 'Object', value: 'Onboarding record', type: 'select' },
      { label: 'Stage',  value: 'Form · submitted',  type: 'select' },
    ],
    chips: ['Form', 'Manual override', 'Per role'],
  },
}

const ONB_DISPATCH = {
  id: 'onb-dispatch',
  kind: 'agent',
  agentId: 'iris',
  title: 'Run background check + send DocuSign packet',
  subtitle: 'Both kick off in parallel · standard 48-hr SLA',
  panel: {
    heading: 'AI Action · Iris kicks off verifications',
    description: 'Iris files the background check with the contracted vendor and emails the DocuSign packet to the candidate at the same time so the two clocks run concurrently.',
    promptPlaceholder: 'Tweak — e.g. "include I-9 in the DocuSign packet".',
    fields: [
      { label: 'Agent',          value: 'Iris · Credentialing Agent',         type: 'select' },
      { label: 'Background SLA', value: '48 hours · contracted vendor',        type: 'text'   },
      { label: 'DocuSign packet', value: ['Offer letter', 'W-4', 'Direct deposit'], type: 'pill-list' },
    ],
    chips: ['Background', 'DocuSign', '48-hr SLA'],
  },
}

const ONB_WAIT = {
  id: 'onb-wait',
  kind: 'timer',
  title: 'Wait until both complete',
  subtitle: 'Up to 72 hours · early-exit when both clear',
  panel: {
    heading: 'Wait · Until both complete',
    description: 'Holds the candidate at the verification stage. Exits early as soon as both the background check and the signed packet are received; gives up at 72 hrs.',
    promptPlaceholder: 'Tweak — e.g. "max wait 5 days for executive roles".',
    fields: [
      { label: 'Max duration',  value: '72 hours',                                       type: 'text' },
      { label: 'Early exit on', value: 'both = complete',                                type: 'select' },
    ],
    chips: ['48 hrs', '72 hrs', '5 days'],
  },
}

const ONB_COND = {
  id: 'onb-cond',
  kind: 'condition',
  title: 'Both clear?',
  subtitle: 'background.status = pass AND docusign.status = signed',
  panel: {
    heading: 'Condition · Both clear',
    description: 'Branches on whether both verifications came back green inside the wait window.',
    promptPlaceholder: 'Tweak — e.g. "treat partial pass as a soft hold".',
    fields: [
      { label: 'Background', value: 'pass',   type: 'select' },
      { label: 'DocuSign',   value: 'signed', type: 'select' },
    ],
    chips: ['Both pass', 'Either fails'],
  },
}

const ONB_HIRE = {
  id: 'onb-hire',
  kind: 'agent',
  agentId: 'iris',
  title: 'Hire · add to roster · notify ops lead',
  subtitle: 'Stage flips to Hired · ops lead gets the welcome packet to send',
  panel: {
    heading: 'AI Action · Iris finalises the hire',
    description: 'Iris flips the candidate to Hired, adds them to the roster, and pings the ops lead with the welcome-packet template ready to send.',
    promptPlaceholder: 'Tweak — e.g. "also enrol them in the next training cohort".',
    fields: [
      { label: 'Agent',     value: 'Iris · Credentialing Agent',          type: 'select' },
      { label: 'Update',    value: 'Onboarding.stage → Hired',             type: 'text'   },
      { label: 'Add to',    value: 'Active roster',                        type: 'text'   },
      { label: 'Notify',    value: 'Ops lead · welcome packet ready',      type: 'text'   },
    ],
    chips: ['Stage flip', 'Roster add', 'Welcome packet'],
  },
}

const ONB_FLAG = {
  id: 'onb-flag',
  kind: 'agent',
  agentId: 'sofia',
  title: 'Flag for HR review',
  subtitle: 'Surface the failed step + suggested next move',
  panel: {
    heading: 'AI Action · Sofia surfaces the failure',
    description: 'A check came back fail or the packet timed out. Sofia logs which step blocked, attaches the agency response, and surfaces it on the HR review queue.',
    promptPlaceholder: 'Tweak — e.g. "auto-decline if background fail is criminal".',
    fields: [
      { label: 'Agent',  value: 'Sofia · People Ops Agent',                  type: 'select' },
      { label: 'Log',    value: 'Failed step + vendor response',             type: 'text'   },
      { label: 'Route',  value: 'HR review queue · default assignee',        type: 'text'   },
    ],
    chips: ['Manual review', 'Vendor response', 'Auto-decline rule'],
  },
}

const ONBOARDING_AUTO_ADVANCE = {
  id: 'onboarding-auto-advance',
  title: 'Onboarding Auto-Advance',
  status: 'active',
  eyebrow: 'Form → Background + DocuSign → Hired',
  description:
    'When a candidate finishes the form, Iris kicks off the background check and ' +
    'DocuSign packet in parallel. If both clear, the candidate flips to Hired; ' +
    'if either fails, Sofia surfaces it on the HR review queue.',
  owner: 'Iris (Credentialing Agent)',
  lastEdited: '2 days ago',
  stream: [
    ONB_TRIGGER,
    ONB_DISPATCH,
    ONB_WAIT,
    {
      ...ONB_COND,
      branches: [
        { label: 'Both clear', tone: 'primary', stream: [ONB_HIRE] },
        { label: 'Failed',     tone: 'warn',    stream: [ONB_FLAG] },
      ],
    },
  ],
}

export const WORKFLOWS = [
  LAST_MIN_REPLACEMENT,
  OT_CAP_AUTOREPLACE,
  LATE_CLOCKIN_RECOVERY,
  ONBOARDING_AUTO_ADVANCE,
]

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
