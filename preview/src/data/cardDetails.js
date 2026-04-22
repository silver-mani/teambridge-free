/* ─────────────────────────────────────────────────────────────────────────────
   Card detail content — drives the right-side detail panel.

   Each detail has a unified `timeline` of steps. A step can optionally carry
   one inline `comm` (SMS thread / call transcript / email preview) that
   expands inline as an accordion. The separate "Communications" section has
   been merged into the timeline so the reader follows one chronological flow.
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

/* kind drives eyebrow color + icon in the renderer */
function step({ kind, eyebrow, time, title, subtitle, status = 'complete', comm }) {
  return { kind, eyebrow, time, title, subtitle, status, comm }
}

/* ─── Marcus active card — animated playback + communications ────────────── */

function marcusActiveDetail(data) {
  const winner = data.drillIn.steps.find(s => s.kind === 'matches')?.matches.find(m => m.winner)?.name ?? 'Janelle R.'
  return {
    mode: 'animated',
    steps: data.drillIn.steps,
    kicker: data.drillIn.kicker,
    resolution: data.drillIn.resolution,
    timeline: [
      step({
        kind: 'dropout',
        eyebrow: 'Cancellation received',
        time: '4 hrs before shift',
        title: 'Marcus T. cancelled his ICU shift',
        subtitle: 'Memorial North · Tonight 7pm–7am',
        comm: sms({
          contact: 'Marcus T.',
          phone: '+1 (415) 555-0142',
          messages: [
            { from: 'them',  text: 'Hey, I can\'t make my 7pm shift tonight, something came up with my kid. Really sorry.', time: '6:58 PM' },
            { from: 'agent', text: 'Got it Marcus, I\'ve got you covered. No penalty on your record. I\'ll find the replacement.', time: '6:58 PM' },
          ],
        }),
      }),
      step({
        kind: 'scan',
        eyebrow: 'Scanning eligible workers',
        time: '2 seconds later',
        title: 'Found 3 qualified nurses available',
        subtitle: 'Filtered by: ICU certification, proximity, no overtime conflict',
      }),
      step({
        kind: 'outreach',
        eyebrow: 'Outreach initiated',
        time: '3 seconds later',
        title: `Parallel SMS to top match, voicemail to backup`,
        subtitle: `${winner} (top rank), Priya S. (backup via voicemail)`,
      }),
      step({
        kind: 'conversation',
        eyebrow: 'Conversation',
        time: '2 min later',
        title: `${winner} accepted the shift`,
        subtitle: 'En route to Memorial North',
        comm: sms({
          contact: winner,
          phone: '+1 (415) 555-0187',
          messages: [
            { from: 'agent', text: `Hi ${winner.split(' ')[0]}, Marcus T. just cancelled his 7pm ICU shift at Memorial North. 12-hour call. You\'re the closest qualified nurse under overtime. $48/hr + $4 night diff. Can you take it?`, time: '7:00 PM' },
            { from: 'them',  text: 'Yes! I\'m about 15 min away. Heading out now.', time: '7:01 PM' },
            { from: 'agent', text: 'Perfect. Charge nurse Karen is expecting you. Details in your app. Drive safe.', time: '7:01 PM' },
          ],
        }),
      }),
      step({
        kind: 'confirmed',
        eyebrow: 'Confirmed',
        time: '4 min elapsed',
        title: 'Charge nurse notified, shift locked',
        subtitle: 'Memorial North coverage restored',
        comm: email({
          contact: 'Karen M., Charge Nurse',
          to: 'karen.m@memorialnorth.health',
          subject: `Shift coverage confirmed: 7pm ICU (Marcus → ${winner})`,
          status: 'delivered',
          body: `Hi Karen,

Marcus T. cancelled his 7pm ICU shift (4 hrs notice). Replacement confirmed.

Covering: ${winner}
Arrival: 7:15 PM (en route)
Credentials: RN, BLS, ACLS, ICU 2 yrs
Overtime status: clear

Log entry updated. No action needed from you.

— Teambridge`,
        }),
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

/* ─── Feed card templates (industry-parameterised) ───────────────────────── */

function swapsDetail(ctx) {
  return {
    mode: 'static',
    timeline: [
      step({
        kind: 'detect',
        eyebrow: 'Swap requests received',
        time: '11:47 AM',
        title: `2 ${ctx.workerNounPlural} submitted shift swap requests`,
        subtitle: 'Thursday evening pairing',
      }),
      step({
        kind: 'scan',
        eyebrow: 'Checks run in parallel',
        time: '11:48 AM',
        title: 'Credentials, overtime, and fairness verified',
        subtitle: 'Both pairs qualified · No overtime risk · Reciprocal history clean',
      }),
      step({
        kind: 'confirmed',
        eyebrow: 'Auto-approved',
        time: '11:49 AM',
        title: 'Both swaps approved automatically',
        subtitle: 'Manager log updated, schedule locked',
        comm: sms({
          contact: 'Ashley P.',
          phone: '+1 (415) 555-0129',
          messages: [
            { from: 'agent', text: `Your swap with Jordan on Thursday is approved. New shift: Thurs 7a–3p at ${ctx.activeLocation}.`, time: '11:49 AM' },
            { from: 'them',  text: 'Thanks!', time: '11:52 AM' },
          ],
        }),
      }),
    ],
    outcome: {
      title: '2 swaps approved, 0 manager intervention',
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
      step({
        kind: 'scan',
        eyebrow: 'Pattern detection',
        time: 'Live',
        title: 'Scanned call-out history across weekend roster',
        subtitle: `All ${ctx.workerNounPlural} on schedule reviewed`,
      }),
      step({
        kind: 'alert',
        eyebrow: 'Risk signals found',
        time: 'Live',
        title: '3 potential gaps identified',
        subtitle: `2 ${ctx.workerNounPlural} with call-out pattern · 1 single-covered shift`,
      }),
      step({
        kind: 'monitoring',
        eyebrow: 'Monitoring',
        time: 'Live',
        title: 'Will escalate Thursday PM if risk still live',
        subtitle: 'No contact made · awaiting your direction',
      }),
    ],
    outcome: {
      title: 'Monitoring · no worker contact yet',
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
      step({
        kind: 'alert',
        eyebrow: 'Workers at risk',
        time: 'Live',
        title: `4 ${ctx.workerNounPlural} within 4 hrs of overtime threshold`,
        subtitle: '2 have additional shifts this week that would trip overtime',
      }),
      step({
        kind: 'outreach',
        eyebrow: 'Preemptive nudge',
        time: '1 min ago',
        title: 'Asked each to self-adjust: keep, swap, or drop',
        subtitle: 'No manager action taken yet',
        comm: sms({
          contact: 'Ramon G.',
          phone: '+1 (415) 555-0174',
          messages: [
            { from: 'agent', text: 'Ramon — you\'re at 36 hrs this week. Your Friday shift would push you into overtime. Want to keep it, swap it, or drop it?', time: '1 min ago' },
          ],
        }),
      }),
    ],
    outcome: {
      title: '4 workers watched, 2 conflicts flagged',
      metrics: [
        { label: 'Workers at risk', value: '4' },
        { label: 'Conflict shifts', value: '2' },
        { label: 'Manager actions', value: '0' },
      ],
    },
  }
}

function remindersDetail(ctx) {
  return {
    mode: 'static',
    timeline: [
      step({
        kind: 'detect',
        eyebrow: 'Roster pulled',
        time: '34 min ago',
        title: `Tomorrow's 5am early shift · 6 ${ctx.workerNounPlural}`,
        subtitle: ctx.activeLocation,
      }),
      step({
        kind: 'outreach',
        eyebrow: 'Reminders dispatched',
        time: '34 min ago',
        title: 'Delivered via SMS and in-app push',
        subtitle: 'Personalised with shift details and directions',
        comm: sms({
          contact: '6 workers',
          messages: [
            { from: 'agent', text: `Reminder: your shift starts at 5am tomorrow at ${ctx.activeLocation}. Reply Y to confirm.`, time: '34 min ago' },
          ],
        }),
      }),
      step({
        kind: 'monitoring',
        eyebrow: 'Responses monitored',
        time: '20 min ago',
        title: '4 of 6 confirmed · 2 read but silent',
        subtitle: 'Auto follow-up scheduled at 9pm if still unconfirmed',
      }),
    ],
    outcome: {
      title: '6 reminders sent, 4 confirmed',
      metrics: [
        { label: 'Sent',      value: '6' },
        { label: 'Confirmed', value: '4' },
        { label: 'Read',      value: '6' },
      ],
    },
  }
}

function credentialDetail(ctx) {
  return {
    mode: 'static',
    timeline: [
      step({
        kind: 'detect',
        eyebrow: 'Submission received',
        time: '1 hr 12 min ago',
        title: 'Sarah M. uploaded required documents',
        subtitle: 'Via worker onboarding app',
      }),
      step({
        kind: 'scan',
        eyebrow: 'Automatic verification',
        time: '1 hr 10 min ago',
        title: 'Documents parsed and cross-checked',
        subtitle: 'Against issuing authority databases',
      }),
      step({
        kind: 'scan',
        eyebrow: 'Background match',
        time: '1 hr 5 min ago',
        title: 'No adverse records · Identity verified',
        subtitle: 'Name, DOB, and issue dates all match',
      }),
      step({
        kind: 'cleared',
        eyebrow: 'Cleared',
        time: '1 hr ago',
        title: 'Assigned to first shift',
        subtitle: `Manager notified · First call Monday at ${ctx.activeLocation}`,
        comm: sms({
          contact: 'Sarah M.',
          phone: '+1 (415) 555-0181',
          messages: [
            { from: 'agent', text: `Sarah — you\'re fully cleared! First shift Monday 7am at ${ctx.activeLocation}. Everything you need is in the Teambridge app. Welcome aboard.`, time: '1 hr ago' },
            { from: 'them',  text: 'Thank you! See you Monday.', time: '1 hr ago' },
          ],
        }),
      }),
    ],
    outcome: {
      title: 'Cleared in 12 minutes, zero manager time',
      metrics: [
        { label: 'Time to clear', value: '12 min' },
        { label: 'Docs verified', value: '4' },
        { label: 'Manager touch', value: '0' },
      ],
    },
  }
}

/* ─── Needs-your-attention cards ─────────────────────────────────────────── */

function needsDetail(card, ctx) {
  const timeline = (card.reasoning || []).map((line, i) =>
    step({
      kind: i === 0 ? 'detect' : 'scan',
      eyebrow: i === 0 ? 'Signal detected' : `Check ${i}`,
      time: i === 0 ? card.timestamp : 'Just now',
      title: line,
    })
  )

  // Append a "draft comms" step showing what will go out when approved.
  let draftComm = null
  if (card.id === 'pto-swap' || card.id === 'armed-post-swap' || card.id === 'weather-shift') {
    draftComm = sms({
      contact: 'Ashley P.',
      phone: '+1 (415) 555-0129',
      status: 'pending-approval',
      messages: [
        { from: 'agent', text: `Hi Ashley — there\'s an open shift that fits your availability. If you\'re interested, tap to claim it. No pressure.`, time: 'Draft' },
      ],
    })
  } else if (card.id === 'new-hire') {
    draftComm = email({
      contact: 'Diana R.',
      to: 'diana.r@example.com',
      status: 'pending-approval',
      subject: 'Welcome to Memorial South — first shift Monday 7am',
      body: 'Hi Diana,\n\nWelcome aboard! You\'re all set for your first shift Monday at 7am at Memorial South ICU.\n\nBefore your first day: please bring photo ID and arrive 15 minutes early for a brief orientation with Karen, our charge nurse.\n\nWelcome,\nTeambridge',
    })
  } else if (card.id === 'high-value-order') {
    draftComm = email({
      contact: 'Meridian Healthcare',
      to: 'scheduling@meridian.health',
      status: 'pending-approval',
      subject: 'Order confirmed: 3 RNs for next weekend',
      body: 'Order confirmed. 3 RNs dispatched for the 96-hour block starting Saturday.\n\nFill status will update live in your client portal.\n\n— Teambridge',
    })
  } else if (card.id === 'new-venue') {
    draftComm = email({
      contact: 'Harbor Theater',
      to: 'ops@harbortheater.com',
      status: 'pending-approval',
      subject: 'Your staffing is ready — first event confirmed',
      body: '18 trained staff pre-staged for your first event. Tuesday training session booked for the 8 alcohol-cert roles.\n\n— Teambridge',
    })
  }

  timeline.push(
    step({
      kind: 'approval',
      eyebrow: 'Awaiting your approval',
      time: 'Pending',
      title: card.recommendation,
      subtitle: 'Approve to execute · Reject to dismiss',
      status: 'pending',
      comm: draftComm,
    })
  )

  return { mode: 'static', timeline,
    outcome: null,
  }
}

/* ─── Events prototype — subject-first detail content ────────────────────── */

function rachelReplacementDetail(data) {
  return {
    mode: 'animated',
    steps: data.drillIn.steps,
    kicker: data.drillIn.kicker,
    resolution: data.drillIn.resolution,
    timeline: [
      step({
        kind: 'dropout',
        eyebrow: 'Dropout detected',
        time: '24 hrs before event',
        title: 'Sandra Lee cancelled her usher shift',
        subtitle: 'Civic Arena · Saturday 7pm · 12-hour call',
        comm: sms({
          contact: 'Sandra Lee',
          phone: '+1 (415) 555-0142',
          messages: [
            { from: 'them',  text: 'Hi, can\'t make my 7pm usher shift Saturday at Civic Arena — family emergency. Really sorry about the short notice.', time: '2:58 PM' },
            { from: 'agent', text: 'Got it Sandra, no penalty on your record. I\'ll find the replacement and notify the charge lead. Hope everything\'s ok.', time: '2:58 PM' },
          ],
        }),
      }),
      step({
        kind: 'scan',
        eyebrow: 'Scanning eligible workers',
        time: '2 seconds later',
        title: 'Found 3 qualified ushers available',
        subtitle: 'Filtered by: certification, proximity, no overtime conflict',
      }),
      step({
        kind: 'outreach',
        eyebrow: 'Outreach initiated',
        time: '3 seconds later',
        title: 'Messaged top match first',
        subtitle: 'Rachel Williams · 1.7 mi · 4 events this month',
      }),
      step({
        kind: 'conversation',
        eyebrow: 'Conversation',
        time: 'Real-time',
        title: 'Rachel accepted the shift',
        subtitle: 'Acceptance in 3 minutes via SMS',
        comm: sms({
          contact: 'Rachel Williams',
          phone: '+1 (415) 555-0187',
          messages: [
            { from: 'agent', text: 'Hi Rachel, this is Teambridge. Sandra Lee just cancelled her 7pm usher shift at Civic Arena for 49ers vs Rams Saturday. You\'re the closest qualified usher with a strong guest rating. Can you take it?', time: '3:00 PM' },
            { from: 'them',  text: 'Yes! I\'m available, count me in.', time: '3:01 PM' },
            { from: 'agent', text: 'Perfect — pending manager approval. Report 6:30pm to the east entry. Details in your app.', time: '3:01 PM' },
          ],
        }),
      }),
      step({
        kind: 'approval',
        eyebrow: 'Awaiting your approval',
        time: 'Pending',
        title: 'Confirm Rachel Williams for Saturday 7pm',
        subtitle: 'Manager approval unlocks final confirmation',
        status: 'pending',
        comm: email({
          contact: 'Miguel R., Event Lead',
          to: 'miguel.r@civicarena.events',
          subject: 'Replacement selected: Sandra → Rachel (Saturday 7pm)',
          status: 'pending-approval',
          body: `Hi Miguel,

Sandra Lee cancelled her Saturday 7pm usher shift. Replacement selected pending manager approval.

Covering: Rachel Williams
Arrival: 6:30 PM
Experience: 4 events this month, high guest rating
Overtime status: clear

Will confirm once approved.

— Teambridge`,
        }),
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
      step({
        kind: 'alert',
        eyebrow: 'Sellout confirmed',
        time: '2 hrs ago',
        title: 'Ticket sales closed 18% above historical',
        subtitle: 'Walk-up traffic expected at concourse + east entry',
      }),
      step({
        kind: 'scan',
        eyebrow: 'Surge plan staged',
        time: '2 hrs ago',
        title: 'Atlas pre-staged 12 extra roles',
        subtitle: 'Distributed across entry, concourse, and parking',
      }),
      step({
        kind: 'cleared',
        eyebrow: 'Credentials verified',
        time: '45 min ago',
        title: 'Sarah M. (new hire) cleared for alcohol service',
        subtitle: 'Added to Saturday roster',
      }),
      step({
        kind: 'approval',
        eyebrow: 'Last-minute replacement',
        time: '3 min ago',
        title: 'Sandra Lee cancelled · Rachel Williams selected',
        subtitle: 'Awaiting your approval to finalise',
        status: 'pending',
      }),
      step({
        kind: 'outreach',
        eyebrow: 'Event communications',
        time: 'Wednesday',
        title: 'Final plan confirmed with Civic Arena ops',
        subtitle: '48 staff total · 98% coverage · no client action needed',
        comm: email({
          contact: 'Civic Arena ops',
          to: 'ops@civicarena.events',
          subject: 'Event plan confirmed — 49ers vs Rams Saturday',
          status: 'delivered',
          body: `Final staffing plan attached. Base roster 36 + surge 12 = 48 staff. Coverage 98% as of this morning.

No changes needed from your side. We\'ll update if anything shifts before game day.

— Teambridge`,
        }),
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

  // Events prototype (subject-first)
  if (card.id === 'upcoming-event')       return upcomingEventDetail()
  if (card.id === 'last-min-replacement') return rachelReplacementDetail(data)

  if (card.id === 'active-cancellation') return marcusActiveDetail(data)
  if (card.id === 'swaps')        return swapsDetail(ctx)
  if (card.id === 'gaps')         return gapsDetail(ctx)
  if (card.id === 'overtime')     return overtimeDetail(ctx)
  if (card.id === 'reminders')    return remindersDetail(ctx)
  if (card.id === 'credential')   return credentialDetail(ctx)

  // Needs-your-attention cards
  if (card.reasoning) return needsDetail(card, ctx)

  return null
}
