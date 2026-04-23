/* ─────────────────────────────────────────────────────────────────────────────
   Workflow seed data
   For this pass we model ONE workflow end-to-end — the "Last-min Replacement"
   routine the Sandra scene just saved — so the operator can click through and
   see how the trigger, conditions, and actions are configured. Everything is
   declarative: the canvas renders whatever node list we hand it, and the
   right-panel reads straight off each node's `panel` payload.
   ───────────────────────────────────────────────────────────────────────────── */

/* Node kinds map to pill colour + icon glyph. Keep these in sync with the CSS
   rules in workflows.css (`.wf-node-trigger`, `.wf-node-condition`, etc). */
export const NODE_KINDS = {
  trigger:   { label: 'Trigger',   tone: 'green'  },
  timer:     { label: 'Wait',      tone: 'amber'  },
  condition: { label: 'Condition', tone: 'slate'  },
  action:    { label: 'Action',    tone: 'blue'   },
}

const LAST_MIN_REPLACEMENT = {
  id: 'last-min-replacement',
  title: 'Last-min Replacement',
  status: 'draft',
  eyebrow: 'Created from Sandra cancellation · Saturday 7pm',
  description:
    'Nova detects a shift cancellation with < 6 hrs notice, checks that no ' +
    'backup is already confirmed, ranks qualified workers, and offers the ' +
    'shift to the top three in parallel. First accept wins; ops lead is ' +
    'notified if nobody responds inside 90 seconds.',
  owner: 'Nova (Schedule Coordinator)',
  lastEdited: 'Created just now',
  nodes: [
    {
      id: 'trigger-shift-cancelled',
      kind: 'trigger',
      title: 'Shift is cancelled',
      subtitle: 'Shift · status changes to Cancelled',
      panel: {
        heading: 'Trigger · Shift cancelled',
        description: 'Fires the moment a scheduled shift flips to Cancelled.',
        promptPlaceholder: 'Describe the trigger you want — e.g. “only for ticketed events within 8 hrs of doors”.',
        fields: [
          { label: 'Object',      value: 'Shift',                    type: 'select' },
          { label: 'Event',       value: 'status changes to Cancelled', type: 'select' },
          { label: 'Starts within', value: 'next 6 hours',           type: 'text' },
          { label: 'Sites',       value: ['Civic Auditorium', 'Harbor Theater'], type: 'pill-list' },
        ],
        chips: ['Status', 'Assignee', 'Start Time', 'Regular Pay Rate', 'Roles'],
      },
    },
    {
      id: 'condition-no-backup',
      kind: 'condition',
      title: 'Has no confirmed backup',
      subtitle: 'Backup assignee · is empty',
      panel: {
        heading: 'Condition · Backup assignee is empty',
        description: 'Skip the rest of the workflow if a swap was already locked in by another workflow or by the ops lead.',
        promptPlaceholder: 'Tell me what this condition should check — e.g. “also skip if the venue is dark”.',
        fields: [
          { label: 'Field',    value: 'Shift.backup_assignee', type: 'select' },
          { label: 'Operator', value: 'is empty',              type: 'select' },
        ],
        chips: ['Backup', 'Assignee', 'Published status', 'Last-min accept rate'],
      },
    },
    {
      id: 'condition-urgent-window',
      kind: 'condition',
      title: 'Notice window is under 4 hours',
      subtitle: 'start_time − now · is less than · 4 hours',
      panel: {
        heading: 'Condition · Urgent window',
        description: 'Treat anything inside 4 hours as the urgent branch — parallel outreach, 90-second expiry.',
        promptPlaceholder: 'Ask to tweak this condition — e.g. “make it less than 6 hours for Civic only”.',
        fields: [
          { label: 'Field',    value: 'start_time − now', type: 'select' },
          { label: 'Operator', value: 'is less than',     type: 'select' },
          { label: 'Value',    value: '4 hours',          type: 'text'   },
        ],
        chips: ['Start Time', 'Notice window', 'Shift duration', 'Venue'],
      },
    },
    {
      id: 'action-rank-candidates',
      kind: 'action',
      title: 'Rank qualified candidates',
      subtitle: 'Nova · top 12 by proximity, rating, accept rate, fairness',
      panel: {
        heading: 'Action · Rank candidates with Nova',
        description: 'Nova scores eligible workers using four signals. Highest-ranked twelve advance; top three receive offers in the next step.',
        promptPlaceholder: 'Tell me what you want Nova to do here — e.g. “weight proximity higher for Civic”.',
        fields: [
          { label: 'Agent',      value: 'Nova (Schedule Coordinator)', type: 'select' },
          { label: 'Pool size',  value: '12 candidates',               type: 'text'   },
          { label: 'Signals',    value: ['Proximity (traffic-adjusted)', '90-day performance', 'Last-min accept rate', 'Hours fairness'], type: 'pill-list' },
          { label: 'OT guard',   value: 'skip workers over 32 hrs this week', type: 'text' },
        ],
        chips: ['Proximity', 'Performance', 'Accept rate', 'Fairness', 'OT cap'],
      },
    },
    {
      id: 'action-offer-top3',
      kind: 'action',
      title: 'Offer shift to top 3 in parallel',
      subtitle: 'SMS + in-app · 90-second expiry',
      panel: {
        heading: 'Action · Dispatch offers',
        description: 'Sends the offer to the first three ranked workers simultaneously and waits for the first confirmed accept.',
        promptPlaceholder: 'Shape this action — e.g. “only SMS between 9p–7a so we don’t ping in-app at odd hours”.',
        fields: [
          { label: 'Channels', value: ['SMS', 'In-app push'], type: 'pill-list' },
          { label: 'Offer expires', value: '90 seconds',     type: 'text' },
          { label: 'Offer template', value: 'Shift tonight: {{venue}} {{start_time}}. Tap to accept.', type: 'template' },
          { label: 'Fallback',  value: 'notify ops lead if no accept within expiry', type: 'text' },
        ],
        chips: ['SMS', 'In-app push', 'Email', 'Voice'],
      },
    },
    {
      id: 'condition-accept-received',
      kind: 'condition',
      title: 'First accept received in 90s?',
      subtitle: 'offer.response · is · accepted',
      panel: {
        heading: 'Condition · Wait for accept',
        description: 'Branches on whether anyone accepted before the expiry. The happy path confirms the winner; the fallback (implied, not drawn yet) escalates to the ops lead.',
        promptPlaceholder: 'Tell me what should happen next — e.g. “also notify me on the happy path”.',
        fields: [
          { label: 'Field',    value: 'offer.response',    type: 'select' },
          { label: 'Operator', value: 'is',                type: 'select' },
          { label: 'Value',    value: 'accepted',          type: 'select' },
          { label: 'Timeout',  value: '90 seconds',        type: 'text'   },
        ],
        chips: ['Response', 'Timeout', 'First-accept wins'],
      },
    },
    {
      id: 'action-confirm-notify',
      kind: 'action',
      title: 'Confirm, update schedule, notify ops lead',
      subtitle: 'Lock the winner · cancel outstanding offers · notify Miguel',
      panel: {
        heading: 'Action · Close the loop',
        description: 'Locks the winning worker onto the shift, cancels the other two outstanding offers, publishes the schedule update, and pings the event lead.',
        promptPlaceholder: 'Ask to tweak — e.g. “also log this to the weekly coverage recap”.',
        fields: [
          { label: 'Confirm',  value: 'assign winner to Shift.assignee', type: 'text' },
          { label: 'Rescind',  value: 'cancel outstanding offers (2)',   type: 'text' },
          { label: 'Publish',  value: 'update Saturday schedule at Civic Auditorium', type: 'text' },
          { label: 'Notify',   value: 'Miguel Rivera (event lead) · SMS + in-app',    type: 'text' },
        ],
        chips: ['Confirm', 'Cancel', 'Publish schedule', 'Notify'],
      },
    },
  ],
}

export const WORKFLOWS = [LAST_MIN_REPLACEMENT]

export function getWorkflow(id) {
  return WORKFLOWS.find(w => w.id === id) ?? WORKFLOWS[0]
}
