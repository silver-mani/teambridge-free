/* ─────────────────────────────────────────────────────────────────────────────
   Card detail content — drives the right-side detail panel.
   Each card gets a structured detail: reasoning timeline, communications
   (SMS threads / call transcripts / emails), and an outcome block.

   The Marcus active card ("last minute replacement") is the anchor scenario
   and uses mode='animated' to play the existing step-by-step drill-in.
   Every other card uses mode='static' with a pre-written timeline and comms.
   ───────────────────────────────────────────────────────────────────────────── */

function sms({ contact, phone, timestamp, status, messages, note }) {
  return { type: 'sms', contact, phone, timestamp, status, messages, note }
}

function call({ contact, phone, timestamp, duration, outcome, transcript, summary }) {
  return { type: 'call', contact, phone, timestamp, duration, outcome, transcript, summary }
}

function email({ contact, to, timestamp, subject, body, status }) {
  return { type: 'email', contact, to, timestamp, subject, body, status }
}

function item(time, title, detail) {
  return { time, title, detail }
}

/* Marcus active card — animated playback + full communications record */
function marcusActiveDetail(data) {
  const winner = data.drillIn.steps.find(s => s.kind === 'matches')?.matches.find(m => m.winner)?.name ?? 'Janelle R.'
  return {
    mode: 'animated',
    // steps come from data.drillIn.steps (already defined per industry)
    communications: [
      sms({
        contact: 'Marcus T.',
        phone: '+1 (415) 555-0142',
        timestamp: '6:58 PM',
        status: 'received',
        note: 'Cancellation that started this workflow',
        messages: [
          { from: 'them', text: 'Hey, I can\'t make my 7pm shift tonight, something came up with my kid. Really sorry.', time: '6:58 PM' },
          { from: 'agent', text: 'Got it Marcus, I\'ve got you covered. No penalty on your record. I\'ll find the replacement.', time: '6:58 PM' },
        ],
      }),
      sms({
        contact: winner,
        phone: '+1 (415) 555-0187',
        timestamp: '7:00 PM',
        status: 'accepted',
        note: 'Top-ranked match — accepted',
        messages: [
          { from: 'agent', text: `Hi ${winner.split(' ')[0]}, this is Teambridge. Marcus T. just cancelled his 7pm shift at Memorial North. It\'s a 12-hour ICU shift. You\'re the closest qualified nurse and under overtime. $48/hr + $4 night diff. Can you take it?`, time: '7:00 PM' },
          { from: 'them', text: 'Yes! I\'m about 15 min away. Heading out now.', time: '7:01 PM' },
          { from: 'agent', text: 'Perfect. Charge nurse Karen is expecting you. Shift details in your app. Drive safe.', time: '7:01 PM' },
        ],
      }),
      call({
        contact: 'Priya S.',
        phone: '+1 (415) 555-0163',
        timestamp: '7:00 PM',
        duration: '0:14',
        outcome: 'Voicemail (fallback in case top match declined)',
        transcript: [
          { speaker: 'agent', text: 'Hi Priya, this is Teambridge calling about an open 7pm shift at Memorial North. Please call back or open the app if you\'d like to pick it up. Thanks!', time: '0:02' },
        ],
      }),
      email({
        contact: 'Karen M., Charge Nurse',
        to: 'karen.m@memorialnorth.health',
        timestamp: '7:01 PM',
        subject: 'Shift coverage confirmed: 7pm ICU (Marcus → Janelle)',
        status: 'delivered',
        body: `Hi Karen,

Quick note: Marcus T. cancelled his 7pm ICU shift (4 hrs notice). Replacement confirmed.

Covering: ${winner}
Arrival: 7:15 PM (en route)
Credentials: RN, BLS, ACLS, ICU 2 yrs
Overtime status: clear

Log entry updated. No action needed from you.

— Teambridge`,
      }),
    ],
    outcome: {
      title: 'Shift covered. Gap closed.',
      description: `${winner} accepted, en route, and confirmed with the charge nurse.`,
      metrics: [
        { label: 'Time to fill',       value: '4 min' },
        { label: 'Candidates messaged', value: '3' },
        { label: 'Cost differential',  value: '$0' },
        { label: 'Overtime risk',      value: 'None' },
      ],
    },
  }
}

/* Templates for the 4 shared feed cards + credential card.
   Parameterized by industry so the copy is industry-native. */

function swapsDetail(ctx) {
  return {
    mode: 'static',
    timeline: [
      item('11:47 AM', 'Swap requests received',     `2 ${ctx.workerNounPlural} submitted shift swap requests.`),
      item('11:47 AM', 'Credentials + certifications cross-checked', 'Both pairs match role and location requirements.'),
      item('11:48 AM', 'Hours and overtime checked',  'Both swaps stay under the weekly overtime threshold.'),
      item('11:48 AM', 'Fairness check',              'No pattern of one-sided trading. Both parties have reciprocated historically.'),
      item('11:49 AM', 'Auto-approved',               'Both parties notified. Manager log updated.'),
    ],
    communications: [
      sms({
        contact: 'Ashley P.',
        phone: '+1 (415) 555-0129',
        timestamp: '11:49 AM',
        status: 'delivered',
        messages: [
          { from: 'agent', text: 'Your swap with Jordan on Thursday is approved. New shift: Thurs 7a-3p at ' + ctx.activeLocation + '.', time: '11:49 AM' },
          { from: 'them', text: 'Thanks!', time: '11:52 AM' },
        ],
      }),
    ],
    outcome: {
      title: '2 swaps approved, 0 manager intervention',
      description: 'Both pairs received automatic confirmation. Schedule locked.',
      metrics: [
        { label: 'Swaps processed', value: '2' },
        { label: 'Time saved',      value: '~18 min' },
        { label: 'Manager actions', value: '0' },
      ],
    },
  }
}

function gapsDetail(ctx) {
  return {
    mode: 'static',
    timeline: [
      item('Live', 'Pattern detection', `Scanned call-out history for all ${ctx.workerNounPlural} on weekend roster.`),
      item('Live', '3 risk signals found', `2 ${ctx.workerNounPlural} have called out 2 of the last 3 weekends. 1 shift at ${ctx.activeLocation} is single-covered.`),
      item('Live', 'Backup pool identified', `11 ${ctx.workerNounPlural} available with under 30 hrs this week.`),
      item('Live', 'Flagged for early action', 'Created shortlist. No worker contacted yet.'),
    ],
    communications: [
      email({
        contact: 'You',
        to: 'ops-lead@yourteam',
        timestamp: '2 min ago',
        subject: '3 gap risks for Saturday — preempt?',
        status: 'drafted',
        body: `Heads up — I flagged 3 potential gaps opening Saturday. I haven\'t contacted anyone yet.

If you want me to preemptively offer coverage to my shortlist, approve this alert and I\'ll start messaging the backup pool by Thursday evening.

— Teambridge`,
      }),
    ],
    outcome: {
      title: 'Monitoring — no worker contact yet',
      description: 'Will escalate to you Thursday PM if the risk is still live.',
      metrics: [
        { label: 'Gaps detected', value: '3' },
        { label: 'Backup pool',   value: '11 ready' },
        { label: 'Next check',    value: 'Thu 4pm' },
      ],
    },
  }
}

function overtimeDetail(ctx) {
  return {
    mode: 'static',
    timeline: [
      item('Live', 'Hour tracking', `Checked weekly hours for all ${ctx.workerNounPlural} currently on shift.`),
      item('Live', '4 at risk', `4 ${ctx.workerNounPlural} are within 4 hours of the 40-hour overtime threshold.`),
      item('Live', 'Schedule conflict check', '2 of them are scheduled for additional shifts this week that would trigger overtime.'),
      item('Live', 'Alert raised',  'Proactive notification — no changes made yet.'),
    ],
    communications: [
      sms({
        contact: 'Ramon G.',
        phone: '+1 (415) 555-0174',
        timestamp: '1 min ago',
        status: 'delivered',
        messages: [
          { from: 'agent', text: 'Ramon — you\'re at 36 hrs this week. Your Friday shift would push you into overtime. Want to keep it, swap it, or drop it?', time: '1 min ago' },
        ],
      }),
    ],
    outcome: {
      title: 'Watching 4 workers, 2 conflicts flagged',
      description: 'No action taken yet. Workers were notified to self-adjust.',
      metrics: [
        { label: 'Workers at risk',  value: '4' },
        { label: 'Conflict shifts',  value: '2' },
        { label: 'Manager actions',  value: '0' },
      ],
    },
  }
}

function remindersDetail(ctx) {
  return {
    mode: 'static',
    timeline: [
      item('34 min ago', 'Roster pulled',             `Tomorrow\'s 5am early shift at ${ctx.activeLocation}: 6 ${ctx.workerNounPlural}.`),
      item('34 min ago', 'Reminder sent',             'Delivered via SMS and in-app push.'),
      item('32 min ago', 'Responses monitored',        '4 of 6 confirmed. 2 read but not confirmed.'),
      item('20 min ago', 'Follow-up scheduled',        'If not confirmed by 9pm, a second nudge goes out automatically.'),
    ],
    communications: [
      sms({
        contact: '6 workers',
        timestamp: '34 min ago',
        status: 'delivered',
        messages: [
          { from: 'agent', text: `Reminder: your shift starts at 5am tomorrow at ${ctx.activeLocation}. Reply Y to confirm.`, time: '34 min ago' },
        ],
      }),
    ],
    outcome: {
      title: '6 reminders sent, 4 confirmed',
      description: 'Auto follow-up to the 2 unconfirmed workers at 9pm.',
      metrics: [
        { label: 'Sent',        value: '6' },
        { label: 'Confirmed',   value: '4' },
        { label: 'Read',        value: '6' },
      ],
    },
  }
}

function credentialDetail(ctx) {
  return {
    mode: 'static',
    timeline: [
      item('1 hr 12 min ago', 'Submission received',    'New hire Sarah M. uploaded required documents via worker app.'),
      item('1 hr 10 min ago', 'Automatic verification', 'Documents parsed, checked against issuing authority databases.'),
      item('1 hr 5 min ago',  'Background match',       'No adverse records. Name, DOB, and issue dates all match.'),
      item('1 hr ago',        'Cleared',                'Assigned to first shift. Manager notified.'),
    ],
    communications: [
      sms({
        contact: 'Sarah M.',
        phone: '+1 (415) 555-0181',
        timestamp: '1 hr ago',
        status: 'delivered',
        messages: [
          { from: 'agent', text: 'Sarah — you\'re fully cleared! First shift scheduled Monday 7am at ' + ctx.activeLocation + '. Everything you need is in the Teambridge app. Welcome aboard.', time: '1 hr ago' },
          { from: 'them', text: 'Thank you! See you Monday.', time: '1 hr ago' },
        ],
      }),
      email({
        contact: 'Manager',
        to: 'manager@yourteam',
        timestamp: '1 hr ago',
        subject: 'Sarah M. cleared and scheduled',
        status: 'delivered',
        body: 'New hire Sarah M. has cleared all credential checks and is scheduled for her first shift Monday 7am at ' + ctx.activeLocation + '. No further action needed.',
      }),
    ],
    outcome: {
      title: 'Cleared in 12 minutes, zero manager time',
      description: 'Full credential verification, background match, and scheduling — all automated.',
      metrics: [
        { label: 'Time to clear', value: '12 min' },
        { label: 'Docs verified', value: '4' },
        { label: 'Manager touch', value: '0' },
      ],
    },
  }
}

/* Needs-your-attention cards — use existing `reasoning` array as timeline
   base, add 1-2 communications that would be triggered on approval.        */
function needsDetail(card, ctx) {
  const timeline = (card.reasoning || []).map((line, i) =>
    item(
      `${i === 0 ? card.timestamp : 'Just now'}`,
      i === 0 ? 'Initial signal' : `Check ${i}`,
      line,
    )
  )
  timeline.push(item('Pending', 'Awaiting your approval', `Recommended action: ${card.recommendation}`))

  // Pick a contact / comms pattern from the card type
  let communications = []
  if (card.id === 'pto-swap' || card.id === 'armed-post-swap' || card.id === 'weather-shift') {
    communications = [
      sms({
        contact: 'Ashley P.',
        phone: '+1 (415) 555-0129',
        timestamp: 'Draft',
        status: 'pending-approval',
        note: 'Will send on your approval',
        messages: [
          { from: 'agent', text: `Hi Ashley — there\'s an open shift that fits your availability. If you\'re interested, tap to claim it. No pressure.`, time: 'Draft' },
        ],
      }),
    ]
  } else if (card.id === 'new-hire') {
    communications = [
      email({
        contact: 'Diana R.',
        to: 'diana.r@example.com',
        timestamp: 'Draft',
        status: 'pending-approval',
        subject: 'Welcome to Memorial South — first shift Monday 7am',
        body: 'Hi Diana,\n\nWelcome aboard! You\'re all set for your first shift Monday at 7am at Memorial South ICU.\n\nBefore your first day: please bring photo ID and arrive 15 minutes early for a brief orientation with Karen, our charge nurse.\n\nWelcome,\nTeambridge',
      }),
    ]
  } else if (card.id === 'high-value-order') {
    communications = [
      email({
        contact: 'Meridian Healthcare',
        to: 'scheduling@meridian.health',
        timestamp: 'Draft',
        status: 'pending-approval',
        subject: 'Order confirmed: 3 RNs for next weekend',
        body: 'Hi Meridian team,\n\nOrder confirmed. 3 RNs dispatched for the 96-hour block starting Saturday.\n\nFill status will update live in your client portal.\n\n— Teambridge',
      }),
    ]
  } else if (card.id === 'rate-negotiation') {
    communications = [
      sms({
        contact: 'David K.',
        phone: '+1 (415) 555-0121',
        timestamp: 'Draft',
        status: 'pending-approval',
        messages: [
          { from: 'agent', text: 'David — rate increase approved. New rate effective next pay period. Thanks for the stellar work.', time: 'Draft' },
        ],
      }),
    ]
  } else if (card.id === 'surge-request' || card.id === 'client-request' || card.id === 'peak-surge') {
    communications = [
      sms({
        contact: '12 workers',
        timestamp: 'Draft',
        status: 'pending-approval',
        note: 'Batched offer — dispatched in seniority order',
        messages: [
          { from: 'agent', text: `Extra shifts opening at ${ctx.activeLocation}. First come, first served. Tap to claim.`, time: 'Draft' },
        ],
      }),
    ]
  } else if (card.id === 'new-venue') {
    communications = [
      email({
        contact: 'Harbor Theater',
        to: 'ops@harbortheater.com',
        timestamp: 'Draft',
        status: 'pending-approval',
        subject: 'Your staffing is ready — first event confirmed',
        body: 'Hi Harbor Theater team,\n\n18 trained staff pre-staged for your first event. Tuesday training session booked for the 8 alcohol-cert roles.\n\n— Teambridge',
      }),
    ]
  } else if (card.id === 'cert-expiring' || card.id === 'osha-expiring') {
    communications = [
      sms({
        contact: `${card.id === 'cert-expiring' ? '5 associates' : '4 crew members'}`,
        timestamp: 'Draft',
        status: 'pending-approval',
        messages: [
          { from: 'agent', text: 'Your certification expires soon. Renewal session scheduled Thursday 2pm — paid as training time. Tap to confirm.', time: 'Draft' },
        ],
      }),
    ]
  }

  return {
    mode: 'static',
    timeline,
    communications,
    outcome: {
      title: 'Awaiting your approval',
      description: 'Approve to execute the recommendation. Reject to dismiss.',
      metrics: [],
    },
  }
}

/* ─── Events prototype — subject-first detail content ────────────────────── */

function rachelReplacementDetail(data) {
  return {
    mode: 'animated',
    steps: data.drillIn.steps,
    kicker: data.drillIn.kicker,
    resolution: data.drillIn.resolution,
    communications: [
      sms({
        contact: 'Sandra Lee',
        phone: '+1 (415) 555-0142',
        timestamp: '2:58 PM',
        status: 'received',
        note: 'Cancellation that started this workflow',
        messages: [
          { from: 'them', text: 'Hi, can\'t make my 7pm usher shift Saturday at Civic Arena — family emergency. Really sorry about the short notice.', time: '2:58 PM' },
          { from: 'agent', text: 'Got it Sandra, no penalty on your record. I\'ll find the replacement and notify the charge lead. Hope everything\'s ok.', time: '2:58 PM' },
        ],
      }),
      sms({
        contact: 'Rachel Williams',
        phone: '+1 (415) 555-0187',
        timestamp: '3:00 PM',
        status: 'accepted',
        note: 'Top-ranked match — accepted',
        messages: [
          { from: 'agent', text: 'Hi Rachel, this is Teambridge. Sandra Lee just cancelled her 7pm usher shift at Civic Arena for the 49ers vs Rams Saturday. You\'re the closest qualified usher with a strong guest rating. Can you take it?', time: '3:00 PM' },
          { from: 'them', text: 'Yes! I\'m available, count me in.', time: '3:01 PM' },
          { from: 'agent', text: 'Perfect — pending manager approval. Report 6:30pm to the east entry. Details in your app.', time: '3:01 PM' },
        ],
      }),
      email({
        contact: 'Miguel R., Event Lead',
        to: 'miguel.r@civicarena.events',
        timestamp: '3:01 PM',
        subject: 'Replacement selected: Sandra → Rachel (Saturday 7pm)',
        status: 'delivered',
        body: `Hi Miguel,

Sandra Lee cancelled her Saturday 7pm usher shift. Replacement selected pending manager approval.

Covering: Rachel Williams
Arrival: 6:30 PM
Experience: 4 events this month, high guest rating
Overtime status: clear

Will confirm once approved.

— Teambridge`,
      }),
    ],
    outcome: {
      title: 'Rachel confirmed, awaiting your approval',
      description: 'Sandra handled with empathy. Rachel accepted and is pre-briefed. Manager approval unlocks final confirmation.',
      metrics: [
        { label: 'Time to fill',      value: '3 min' },
        { label: 'Candidates asked',  value: '1' },
        { label: 'Cost differential', value: '$0' },
      ],
    },
  }
}

function upcomingEventDetail() {
  return {
    mode: 'static',
    timeline: [
      item('2 hrs ago', 'Sellout confirmed',      'Ticket sales up 18% vs historical for this matchup.'),
      item('2 hrs ago', 'Surge plan staged',      'Atlas pre-staged 12 extra roles across entry, concourse, and parking.'),
      item('45 min ago', 'Credentials verified',   'Iris cleared Sarah M. (new hire) for alcohol service. Added to Saturday roster.'),
      item('3 min ago', 'Last-minute replacement', 'Sandra Lee cancelled. Nova selected Rachel Williams, accepted. Awaiting your approval.'),
    ],
    communications: [
      sms({
        contact: 'All staff (48)',
        timestamp: 'Thursday 9am',
        status: 'delivered',
        messages: [
          { from: 'agent', text: 'Saturday 7pm 49ers vs Rams at Civic Arena: reporting time 5:30pm. Reply Y to confirm.', time: 'Thursday 9am' },
        ],
      }),
      email({
        contact: '49ers Community Ops',
        to: 'ops@civicarena.events',
        timestamp: 'Wednesday',
        subject: 'Event plan confirmed — 49ers vs Rams Saturday',
        status: 'delivered',
        body: `Final staffing plan attached. Base roster 36 + surge 12 = 48 staff. Coverage 98% as of this morning.

No changes needed from your side. We\'ll update if anything shifts before game day.

— Teambridge`,
      }),
    ],
    outcome: {
      title: '98% staffed · 1 action required',
      description: 'On track for Saturday. Rachel Williams replacement approval pending.',
      metrics: [
        { label: 'Coverage',   value: '98%' },
        { label: 'Open roles', value: '1' },
        { label: 'Approvals',  value: '1 pending' },
      ],
    },
  }
}

/* Main lookup. Called by the panel with the card + industry data context.   */
export function getCardDetail(card, data) {
  const ctx = {
    workerNoun:       data.workerNoun,
    workerNounPlural: data.workerNounPlural,
    activeLocation:   data.activeCard?.title?.match(/at ([^,]+),/)?.[1]
                   ?? data.activeCard?.subject?.secondary?.match(/·\s*([^·]+?)(?:\s*·|$)/)?.[1]
                   ?? 'your location',
  }

  // Events prototype cards (subject-first)
  if (card.id === 'upcoming-event')       return upcomingEventDetail()
  if (card.id === 'last-min-replacement') return rachelReplacementDetail(data)

  if (card.id === 'active-cancellation') return { ...marcusActiveDetail(data), steps: data.drillIn.steps, kicker: data.drillIn.kicker, resolution: data.drillIn.resolution }
  if (card.id === 'swaps')        return swapsDetail(ctx)
  if (card.id === 'gaps')         return gapsDetail(ctx)
  if (card.id === 'overtime')     return overtimeDetail(ctx)
  if (card.id === 'reminders')    return remindersDetail(ctx)
  if (card.id === 'credential')   return credentialDetail(ctx)

  // Needs-your-attention cards
  if (card.reasoning) return needsDetail(card, ctx)

  return null
}
