/* Super-Agent action feed — what the always-on agent has uncovered,
 * thought through, and is ready to fix on the operator's behalf.
 *
 * Important framing: each card surfaces a SPECIFIC current event
 * (Sandra cancelled, Marcus didn't clock out, etc.), but the recommended
 * action is always to turn on the AGENTIC WORKFLOW that handles every
 * future case like it. The agent is teaching the operator to delegate
 * a pattern, not one-off chores. */

/* Worker face library — same Unsplash crops used elsewhere so the
 * same person reads consistently across the dashboard. */
const FACE = {
  sandra:  'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=160&h=160&fit=crop&crop=faces&auto=format',
  marcus:  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=160&h=160&fit=crop&crop=faces&auto=format',
  miguel:  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&h=160&fit=crop&crop=faces&auto=format',
  priya:   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=faces&auto=format',
  ashley:  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces&auto=format',
}

export const SUPER_AGENT_ACTIONS = {
  events: [
    {
      id: 'callout-sandra',
      kind: 'callout',
      severity: 'urgent',
      eyebrow: 'Last-minute call-out',
      timestamp: '4 min ago',
      subject: {
        name: 'Sandra Lee',
        role: 'Gate 3 Usher · Saturday 7pm',
        initials: 'SL',
        color: '#dc2626',
        bg: '#fee2e2',
        avatar: FACE.sandra,
      },
      headline: "Sandra Lee cancelled her Saturday 7pm gate-3 shift",
      context: "Levi's Stadium · 4 hours notice",
      reasoning: [
        "12 gate-3 qualified workers are currently under your OT cap",
        "Top 3 average 4.7★, closest is 6 min from Levi's",
        "Saturday differential applies — no pay-rate impact",
        "This is the 11th same-day call-out you've gotten this quarter",
      ],
      workflow: {
        name: 'Last-min Replacement',
        scope: 'Every shift cancellation, automatically',
        plan: [
          "Detects every shift cancellation inside the no-show window",
          "Ranks eligible workers by proximity, accept rate, hours fairness, and 90-day rating",
          "Sends timed offers (90-second expiry) to the top 3 in parallel; first accept wins",
          "Auto-rescinds the other offers, updates the schedule, notifies the on-shift lead",
        ],
      },
      forecast: {
        label: 'Average time to fill',
        value: '~4 min',
        confidence: 94,
        confidenceLabel: '94% confident based on the last 30 same-day calls',
      },
      cta: 'Turn on Last-min Replacement',
      handled: {
        eyebrow: 'Workflow turned on',
        timestamp: 'Just now',
        headline: "Last-min Replacement is live · Sandra's shift handled",
        detail: 'Workflow active for every cancellation going forward. For Sandra: Janelle R. accepted in 47 seconds, gate 3 fully covered.',
        outcomeBullets: [
          "Sandra's shift covered in 47s",
          "Every future call-out will run the same way",
          "Coverage recap updated automatically",
        ],
      },
    },
    {
      id: 'missed-clockout-marcus',
      kind: 'clockout',
      severity: 'watch',
      eyebrow: 'Missed clock-out',
      timestamp: '12 min ago',
      subject: {
        name: 'Marcus T.',
        role: 'Gate 3 Usher · Friday',
        initials: 'MT',
        color: '#2563eb',
        bg: '#dbeafe',
        avatar: FACE.marcus,
      },
      headline: "Marcus T. didn't clock out from his Friday 6:30 PM shift",
      context: "Scheduled 6:30 PM – 11:30 PM · Geofence shows he left at 11:34 PM",
      reasoning: [
        "Marcus's last text at 11:15 PM said 'wrapping up the section'",
        "Stadium geofence registered exit at 11:34 PM",
        "He's clocked out cleanly on 47 of his last 48 shifts",
        "You've had 14 missed clock-outs across the team this month",
      ],
      workflow: {
        name: 'Missed Punch Recovery',
        scope: 'Every shift with no clock-out, automatically',
        plan: [
          "Detects every shift missing a clock-out within 15 min of the scheduled end",
          "Cross-references geofence exit time, last message, and past punch history",
          "Drafts a friendly clarification SMS to the worker for your approval",
          "On confirm (or no reply by EOD) files the reconstructed punch and routes to your timesheet approver",
        ],
      },
      forecast: {
        label: 'Resolution time, typical',
        value: 'under 30 min',
        confidence: 92,
        confidenceLabel: '92% across the last 6 months of recovery patterns',
      },
      cta: 'Turn on Missed Punch Recovery',
      handled: {
        eyebrow: 'Workflow turned on',
        timestamp: 'Just now',
        headline: "Missed Punch Recovery is live · Marcus filed",
        detail: 'Workflow active for every missed clock-out from here on. For Marcus: punch filed 6:30 – 11:34 PM, approved for payroll.',
        outcomeBullets: [
          "Marcus's 5h 4min filed and approved",
          "Future missed clock-outs route the same way",
          "Friday close ready on time",
        ],
      },
    },
    {
      id: 'ot-cap-miguel',
      kind: 'ot',
      severity: 'watch',
      eyebrow: 'OT cap approaching',
      timestamp: '38 min ago',
      subject: {
        name: 'Miguel R.',
        role: 'Event Lead · this week',
        initials: 'MR',
        color: '#9333ea',
        bg: '#ede9fe',
        avatar: FACE.miguel,
      },
      headline: "Miguel R. is projecting 46 hours this week — 6 over your cap",
      context: 'Civic Arena (32 hrs) + Saturday Niners home game (14 hrs) trips your 40-hr OT cap',
      reasoning: [
        "Jordan K. is gate-3 qualified, sitting at 28 hrs this week, 4.9★",
        "Same pay tier — zero rate-card impact for either worker",
        "No 14-day predictive-scheduling premium triggers on the move",
        "You've had 9 cap-trip projections this period across the roster",
      ],
      workflow: {
        name: 'OT Cap Auto-Replace',
        scope: 'Every worker trending past your cap, automatically',
        plan: [
          "Projects each worker's weekly hours daily, not just at period close",
          "Flags anyone trending past your OT ceiling 3 days ahead",
          "Surfaces compliant swaps from teammates with matching skills + lower hours",
          "Proposes the swap for a single-tap approval, then auto-publishes and notifies both workers",
        ],
      },
      forecast: {
        label: 'OT premium avoided per case',
        value: '~$640',
        confidence: 100,
        confidenceLabel: 'Fully policy-compliant — no manager override needed',
      },
      cta: 'Turn on OT Cap Auto-Replace',
      handled: {
        eyebrow: 'Workflow turned on',
        timestamp: 'Just now',
        headline: 'OT Cap Auto-Replace is live · Miguel rebalanced',
        detail: 'Workflow active across every worker going forward. For Miguel: Saturday gate-3 moved to Jordan K., back under cap.',
        outcomeBullets: [
          'Miguel back to 32 hrs · $640 OT avoided',
          'Every cap-risk projection handled the same way',
          'Payroll updated, both workers notified',
        ],
      },
    },
    {
      id: 'cert-priya',
      kind: 'credential',
      severity: 'info',
      eyebrow: 'Credential renewal',
      timestamp: '2 hr ago',
      subject: {
        name: 'Priya S.',
        role: 'Bev Service',
        initials: 'PS',
        color: '#0d9488',
        bg: '#ccfbf1',
        avatar: FACE.priya,
      },
      headline: "Priya's TABC certification expires Tuesday",
      context: '4 shifts on her schedule after that date · state law blocks alcohol service without an active cert',
      reasoning: [
        "TABC valid through Tue Apr 30",
        "4 upcoming shifts touch alcohol service",
        "She's renewed 4 of 4 previous certs on her own with a single nudge",
        "23 other workers have credentials expiring in the next 60 days",
      ],
      workflow: {
        name: 'Credential Watch',
        scope: 'Every credential across your workforce, automatically',
        plan: [
          "Tracks every state license, cert, and training across your roster",
          "Nudges workers 60 / 30 / 7 days out with the right state portal link",
          "Auto-blocks scheduling against any role whose credential lapses",
          "Attaches renewed certs to the worker profile and clears holds",
        ],
      },
      forecast: {
        label: 'Renewal compliance, typical',
        value: '99%',
        confidence: 88,
        confidenceLabel: '88% of workers renew on the first or second nudge',
      },
      cta: 'Turn on Credential Watch',
      handled: {
        eyebrow: 'Workflow turned on',
        timestamp: 'Just now',
        headline: "Credential Watch is live · Priya's cert in motion",
        detail: 'Workflow active across all 24 expiring credentials. Priya was sent the TABC renewal link; F&B lead notified about the hold window.',
        outcomeBullets: [
          'All 24 upcoming expiries scheduled',
          "Priya's cert link sent · hold prepared",
          'F&B lead looped in on the window',
        ],
      },
    },
    {
      id: 'pattern-ashley',
      kind: 'pattern',
      severity: 'watch',
      eyebrow: 'No-show pattern',
      timestamp: '5 hr ago',
      subject: {
        name: 'Ashley M.',
        role: 'Usher · multi-site',
        initials: 'AM',
        color: '#ea580c',
        bg: '#fed7aa',
        avatar: FACE.ashley,
      },
      headline: "Ashley M. has 2 no-shows in the last 4 weeks",
      context: 'Missed Mar 8 (Civic) and Mar 22 (Harbor) · both Sunday evenings · 18 of 20 other shifts on time',
      reasoning: [
        "Both misses fell at distant venues; her Levi's shifts have stayed on time",
        "HR file shows she moved across town in early March",
        "Pattern reads like a transit issue, not an attitude one",
        "7 other workers on the roster are showing similar early-pattern signals",
      ],
      workflow: {
        name: 'No-Show Coaching',
        scope: 'Every emerging attendance pattern, automatically',
        plan: [
          "Watches each worker's attendance over a rolling 4-week window",
          "Flags anyone with 2+ misses plus a behavioural signal (venue, time, distance)",
          "Drafts a warm coaching message keyed to the inferred root cause",
          "Routes to the worker's manager for approval before sending; escalates only after a 3rd miss",
        ],
      },
      forecast: {
        label: 'Resolves with a single check-in',
        value: '~78%',
        confidence: 78,
        confidenceLabel: '78% across similar patterns in the last year',
      },
      cta: 'Turn on No-Show Coaching',
      handled: {
        eyebrow: 'Workflow turned on',
        timestamp: 'Just now',
        headline: "No-Show Coaching is live · Ashley's draft routed",
        detail: 'Workflow active for every emerging pattern. For Ashley: warm draft sent to her manager for approval.',
        outcomeBullets: [
          'Pattern monitoring active for 142 workers',
          "Ashley's draft pending manager review",
          'Other 7 emerging patterns queued up',
        ],
      },
    },
  ],
}
