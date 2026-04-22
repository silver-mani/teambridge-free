/* ─────────────────────────────────────────────────────────────────────────────
   Industry dummy data for Act 1 (rebuild)
   One record per industry, each with:
   - label            : Industry label for the header / nav
   - workerNoun       : Singular industry-appropriate noun
   - workerNounPlural : Plural form
   - mission          : Top-of-page briefing (headline + stat tiles)
   - needsYou         : 3 AI-prepared cards that need human approval
   - activeCard       : In-progress auto-handled card (Marcus cancellation)
   - feed             : Background activity cards
   - drillIn          : Reasoning script shown after active card is clicked
   Copy avoids em-dashes throughout.
   ───────────────────────────────────────────────────────────────────────────── */

const MATCH_TEMPLATE = {
  healthcare: [
    { name: 'Janelle R.', meta: '2.1 mi · 32 hrs this week', winner: true  },
    { name: 'David K.',   meta: '3.8 mi · 28 hrs this week', winner: false },
    { name: 'Priya S.',   meta: '4.5 mi · 24 hrs this week', winner: false },
  ],
  staffing: [
    { name: 'Janelle R.', meta: '1.9 mi · 28 hrs, 3 prior placements', winner: true  },
    { name: 'David K.',   meta: '4.2 mi · 24 hrs, 2 prior placements', winner: false },
    { name: 'Priya S.',   meta: '5.1 mi · 30 hrs, 4 prior placements', winner: false },
  ],
  events: [
    { name: 'Janelle R.', meta: '1.7 mi · 4 events this month', winner: true  },
    { name: 'David K.',   meta: '3.3 mi · 2 events this month', winner: false },
    { name: 'Priya S.',   meta: '4.8 mi · 3 events this month', winner: false },
  ],
  security: [
    { name: 'Janelle R.', meta: '2.4 mi · Armed post certified, 30 hrs', winner: true  },
    { name: 'David K.',   meta: '3.9 mi · Armed post certified, 28 hrs', winner: false },
    { name: 'Priya S.',   meta: '5.2 mi · Unarmed only, 34 hrs',         winner: false },
  ],
  'light-industrial': [
    { name: 'Janelle R.', meta: '1.8 mi · Forklift certified, 30 hrs', winner: true  },
    { name: 'David K.',   meta: '3.5 mi · Forklift certified, 26 hrs', winner: false },
    { name: 'Priya S.',   meta: '4.7 mi · Ground only, 34 hrs',        winner: false },
  ],
  construction: [
    { name: 'Janelle R.', meta: '2.3 mi · Framing lead, 32 hrs',        winner: true  },
    { name: 'David K.',   meta: '3.6 mi · Framer, 28 hrs',              winner: false },
    { name: 'Priya S.',   meta: '4.9 mi · Carpenter apprentice, 24 hrs',winner: false },
  ],
}

function buildIndustry({
  id, label, workerNoun, workerNounPlural, venueNoun,
  activeLocation, shiftNoun,
  credentialCard,
  offerReason,
  mission,
  needsYou,
}) {
  const matches = MATCH_TEMPLATE[id]
  const winner = matches.find(m => m.winner)

  return {
    id,
    label,
    workerNoun,
    workerNounPlural,

    mission,
    needsYou,

    activeCard: {
      id: 'active-cancellation',
      status: 'in-progress',
      statusLabel: 'In progress',
      timestamp: 'Now',
      agentId: 'nova',
      agentTask: 'Last Minute Shift Replacement',
      title: `Shift cancellation at ${activeLocation}, 7pm`,
      description: `Marcus T. cancelled his ${shiftNoun} with 4 hours notice. Finding replacement.`,
    },

    feed: [
      {
        id: 'swaps',
        status: 'resolved',
        statusLabel: 'Resolved',
        timestamp: '12 min ago',
        agentId: 'nova',
        agentTask: 'Swap Auto-Approvals',
        title: '2 shift swap requests auto approved',
        description: 'Checked credentials, hours, and overtime. Both approved automatically.',
      },
      {
        id: 'gaps',
        status: 'monitoring',
        statusLabel: 'Monitoring',
        timestamp: 'Live',
        agentId: 'atlas',
        agentTask: 'Gap Detection',
        title: '3 potential gaps opening this weekend',
        description: `2 ${workerNounPlural} approaching call out pattern. Flagging for early action.`,
      },
      {
        id: 'overtime',
        status: 'watching',
        statusLabel: 'Watching',
        timestamp: 'Live',
        agentId: 'leo',
        agentTask: 'Overtime Watch',
        title: `4 ${workerNounPlural} approaching weekly overtime limit`,
        description: 'Proactive alert before a scheduling conflict occurs.',
      },
      {
        id: 'reminders',
        status: 'sent',
        statusLabel: 'Sent',
        timestamp: '34 min ago',
        agentId: 'sofia',
        agentTask: 'Shift Reminders',
        title: `Shift reminders sent to 6 ${workerNounPlural}`,
        description: `Tomorrow's early shift. All delivered, 4 confirmed.`,
      },
      credentialCard,
    ],

    drillIn: {
      steps: [
        {
          id: 'search',
          kind: 'loading',
          delay: 0,
          title: `Searching qualified ${workerNounPlural} available tonight...`,
        },
        {
          id: 'filter',
          kind: 'status',
          delay: 2500,
          title: 'Found 3 matches.',
          detail: 'Filtering by proximity, hours worked this week, and past no show history.',
        },
        {
          id: 'matches',
          kind: 'matches',
          delay: 2000,
          matches,
          title: 'Ranked shortlist',
        },
        {
          id: 'send',
          kind: 'status',
          delay: 3000,
          title: `Sending shift offer to ${winner.name}`,
          detail: offerReason,
        },
        {
          id: 'wait',
          kind: 'loading',
          delay: 4000,
          title: 'Waiting for response...',
        },
        {
          id: 'accepted',
          kind: 'success',
          delay: 3000,
          title: `${winner.name} accepted.`,
          detail: 'Shift covered. Gap closed. Total time elapsed: 4 minutes.',
        },
      ],
      resolution: {
        statusLabel: 'Resolved',
        timestamp: 'Just now',
        title: `Shift covered by ${winner.name}`,
        description: 'Replacement accepted and confirmed. All parties notified.',
      },
      kicker: 'Your team used to spend 45 minutes on this.',
    },
  }
}

export const INDUSTRY_DATA = {
  healthcare: buildIndustry({
    id: 'healthcare',
    label: 'Healthcare',
    workerNoun: 'nurse',
    workerNounPlural: 'nurses',
    venueNoun: 'facility',
    activeLocation: 'Memorial North',
    shiftNoun: 'ICU shift',
    offerReason: 'Closest match. 2.1 miles away. 32 hours this week, under the overtime threshold.',
    credentialCard: {
      id: 'credential',
      status: 'resolved',
      statusLabel: 'Resolved',
      timestamp: '1 hr ago',
      agentId: 'iris',
      agentTask: 'New Hire Credentialing',
      title: 'Credential check completed for new hire',
      description: 'Sarah M. cleared. First shift Monday at Memorial South.',
    },
    mission: {
      headline: 'Your floors are staffed. 2 decisions waiting on you.',
      stats: [
        { label: 'Open shifts next 72 hrs',     value: '0',    tone: 'success' },
        { label: 'Readiness this week',         value: '94%',  tone: 'success' },
        { label: 'Items needing approval',      value: '2',    tone: 'warning' },
        { label: 'Auto resolved today',         value: '14',   tone: 'neutral' },
      ],
    },
    needsYou: [
      {
        id: 'pto-swap',
        type: 'approval',
        timestamp: '5 min ago',
        agentId: 'nova',
        agentTask: 'PTO Conflict Resolution',
        title: 'PTO request overlaps a thin shift',
        summary: 'Keisha N. requested PTO Saturday, 7am to 7pm. ICU is down to 3 nurses that shift.',
        reasoning: [
          'Checked weekend coverage: ICU has 3 nurses scheduled, target is 4.',
          'Scanned 18 nurses off that day. 2 are qualified and under overtime.',
          'Ashley P. has worked 4 of Keisha\'s last 6 swaps. High acceptance rate.',
        ],
        recommendation: 'Approve PTO and auto offer the shift to Ashley P.',
        resolvedTitle: 'PTO approved, shift offered to Ashley P.',
        resolvedDescription: 'Offer sent. Ashley confirmed 2 min later. Coverage intact.',
      },
      {
        id: 'new-hire',
        type: 'approval',
        timestamp: '18 min ago',
        agentId: 'sofia',
        agentTask: 'New Hire Onboarding',
        title: 'New hire ready to onboard',
        summary: 'Diana R. completed paperwork, credentials verified. Ready to assign to Memorial South ICU.',
        reasoning: [
          'RN license active and verified with state board.',
          'BLS, ACLS, and PALS current through 2027.',
          'Requested Memorial South. Lives 3.2 miles away.',
        ],
        recommendation: 'Onboard to Memorial South ICU. First shift Monday.',
        resolvedTitle: 'Diana R. onboarded to Memorial South ICU',
        resolvedDescription: 'Assignment confirmed. Welcome message sent. First shift scheduled Monday 7am.',
      },
    ],
  }),

  staffing: buildIndustry({
    id: 'staffing',
    label: 'Staffing',
    workerNoun: 'contractor',
    workerNounPlural: 'contractors',
    venueNoun: 'client site',
    activeLocation: 'Stellar Events',
    shiftNoun: 'per diem shift',
    offerReason: 'Closest match. 1.9 miles away. 28 hours this week, 3 prior placements at this client.',
    credentialCard: {
      id: 'credential',
      status: 'resolved',
      statusLabel: 'Resolved',
      timestamp: '1 hr ago',
      agentId: 'iris',
      agentTask: 'Client Site Onboarding',
      title: 'Client site onboarding completed',
      description: 'Sarah M. cleared for Meridian Healthcare. First placement Monday.',
    },
    mission: {
      headline: 'Clients are covered. 2 placements need your call.',
      stats: [
        { label: 'Open orders next 72 hrs',     value: '1',    tone: 'warning' },
        { label: 'Fill rate this week',         value: '97%',  tone: 'success' },
        { label: 'Items needing approval',      value: '2',    tone: 'warning' },
        { label: 'Auto placed today',           value: '11',   tone: 'neutral' },
      ],
    },
    needsYou: [
      {
        id: 'high-value-order',
        type: 'approval',
        timestamp: '8 min ago',
        agentId: 'atlas',
        agentTask: 'Client Order Dispatch',
        title: 'New order from high margin client',
        summary: 'Meridian Healthcare posted 3 RN slots for next weekend. 96 hours total.',
        reasoning: [
          'Client has 100% fill rate over last 9 months. High retention.',
          '5 contractors match credentials, all above 4.7 rating.',
          'Pay rate is 18% above market. Likely to fill in under an hour.',
        ],
        recommendation: 'Accept order and auto dispatch to top 5 contractors.',
        resolvedTitle: 'Order accepted, 3 contractors confirmed',
        resolvedDescription: 'All 3 slots filled in 34 minutes. Client notified.',
      },
      {
        id: 'rate-negotiation',
        type: 'approval',
        timestamp: '22 min ago',
        agentId: 'sofia',
        agentTask: 'Contractor Rate Review',
        title: 'Contractor rate increase request',
        summary: 'David K. asked for $3/hr increase. 4.9 rating, 6 month tenure, 2 client recommendations.',
        reasoning: [
          'David has placed at 8 clients, zero complaints, 98% attendance.',
          'Current rate is $2/hr below contractors with similar profile.',
          'Clients Meridian and Stellar specifically requested him twice.',
        ],
        recommendation: 'Approve $3/hr increase. Margin impact minimal.',
        resolvedTitle: 'Rate increase approved for David K.',
        resolvedDescription: 'New rate effective next pay period. David notified.',
      },
    ],
  }),

  events: buildIndustry({
    id: 'events',
    label: 'Events & Venues',
    workerNoun: 'staff member',
    workerNounPlural: 'staff',
    venueNoun: 'venue',
    activeLocation: 'Civic Arena',
    shiftNoun: 'usher shift',
    offerReason: 'Closest match. 1.7 miles away. Worked 4 events this month, high guest rating.',
    credentialCard: {
      id: 'credential',
      status: 'resolved',
      statusLabel: 'Resolved',
      timestamp: '1 hr ago',
      agentId: 'iris',
      agentTask: 'Event Certification',
      title: 'Event certification completed for new hire',
      description: 'Sarah M. cleared for alcohol service. First event Saturday.',
      subject: {
        kind: 'person',
        primary: 'Sarah M.',
        secondary: 'Alcohol service certified · First event Saturday',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&fit=crop&crop=faces&auto=format',
      },
    },
    mission: {
      headline: 'Saturday is staffed. 2 surge decisions waiting.',
      stats: [
        { label: 'Open positions next 72 hrs',  value: '0',    tone: 'success' },
        { label: 'Saturday readiness',          value: '100%', tone: 'success' },
        { label: 'Items needing approval',      value: '2',    tone: 'warning' },
        { label: 'Auto resolved today',         value: '9',    tone: 'neutral' },
      ],
    },
    needsYou: [
      {
        id: 'last-min-replacement',
        type: 'approval',
        timestamp: '3 min ago',
        agentId: 'nova',
        agentTask: 'Last Minute Replacement',
        title: 'Rachel Williams selected to replace Sandra Lee',
        summary: 'Sandra Lee cancelled her usher shift for 49ers vs Rams, Saturday 7pm. Rachel Williams matched, accepted. Awaiting your approval.',
        reasoning: [
          'Rachel Williams is 1.7 mi from Civic Arena, worked 4 events this month with high guest rating.',
          'Under weekly hours. No overtime risk.',
          'Accepted in 3 minutes via SMS. Charge lead has been pre-notified.',
        ],
        recommendation: 'Confirm Rachel Williams for Saturday 7pm. Notify charge lead.',
        resolvedTitle: 'Rachel Williams confirmed for Saturday 7pm',
        resolvedDescription: 'Assignment locked. Rachel notified. Sandra\'s record updated.',
        animated: true,
        subject: {
          kind: 'person',
          primary: 'Rachel Williams',
          secondary: 'Replacing Sandra Lee · 49ers vs Rams',
          image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces&auto=format',
        },
      },
      {
        id: 'new-venue',
        type: 'approval',
        timestamp: '29 min ago',
        agentId: 'sofia',
        agentTask: 'Venue Onboarding',
        title: 'New venue added to rotation',
        summary: 'Harbor Theater signed a 6 month contract. First event in 9 days. Need 24 trained staff.',
        reasoning: [
          '31 staff within 5 miles, 18 have theater experience.',
          'Alcohol certification required for 8 roles. 14 staff currently certified.',
          'Training session can be scheduled for Tuesday evening.',
        ],
        recommendation: 'Accept venue. Pre stage 18 staff, schedule training Tuesday.',
        resolvedTitle: 'Harbor Theater onboarded',
        resolvedDescription: 'Staff pre staged. Training scheduled. First event ready.',
        subject: {
          kind: 'location',
          primary: 'Harbor Theater',
          secondary: 'First event in 9 days · Needs 24 trained staff',
          metric: '18 pre-staged',
          badge: { text: 'HT', color: 'purple' },
        },
      },
    ],
  }),

  security: buildIndustry({
    id: 'security',
    label: 'Security',
    workerNoun: 'guard',
    workerNounPlural: 'guards',
    venueNoun: 'post',
    activeLocation: 'Corporate Campus A',
    shiftNoun: 'overnight patrol',
    offerReason: 'Closest match. 2.4 miles away. Armed post certified, 30 hours this week.',
    credentialCard: {
      id: 'credential',
      status: 'resolved',
      statusLabel: 'Resolved',
      timestamp: '1 hr ago',
      agentId: 'iris',
      agentTask: 'Guard License Verification',
      title: 'Guard license verified for new hire',
      description: 'Sarah M. licensed and cleared. First post Monday at North Gate.',
    },
    mission: {
      headline: 'Every post is manned. 2 decisions waiting on you.',
      stats: [
        { label: 'Open posts next 72 hrs',      value: '0',    tone: 'success' },
        { label: 'Post coverage this week',     value: '99%',  tone: 'success' },
        { label: 'Items needing approval',      value: '2',    tone: 'warning' },
        { label: 'Auto resolved today',         value: '12',   tone: 'neutral' },
      ],
    },
    needsYou: [
      {
        id: 'armed-post-swap',
        type: 'approval',
        timestamp: '6 min ago',
        agentId: 'nova',
        agentTask: 'Armed Post Swap',
        title: 'Armed post swap request',
        summary: 'Rivera wants to swap Thursday armed post with Chen. Both are certified. Hours within limits.',
        reasoning: [
          'Both guards hold current armed post certification and firearm permits.',
          'Chen has worked this post 11 times, Rivera 14 times. Both familiar.',
          'No overtime risk. No client restrictions on either guard.',
        ],
        recommendation: 'Approve swap. Client notification auto sent.',
        resolvedTitle: 'Swap approved, Chen assigned Thursday',
        resolvedDescription: 'Both guards notified. Client updated. Schedule locked.',
      },
      {
        id: 'client-request',
        type: 'approval',
        timestamp: '25 min ago',
        agentId: 'atlas',
        agentTask: 'Coverage Expansion',
        title: 'Client requested additional coverage',
        summary: 'Corporate Campus A asked for a second patrol guard nightly for 2 weeks.',
        reasoning: [
          '14 armed certified guards available nightly, all under overtime.',
          'Client is prepaid, high retention, 24 month contract.',
          'Rate matches contract terms. No scope change needed.',
        ],
        recommendation: 'Accept. Stage 3 guards to rotate across 2 weeks.',
        resolvedTitle: 'Coverage accepted, 3 guards staged',
        resolvedDescription: 'Schedule built. Guards notified. Client confirmed.',
      },
    ],
  }),

  'light-industrial': buildIndustry({
    id: 'light-industrial',
    label: 'Light Industrial',
    workerNoun: 'associate',
    workerNounPlural: 'associates',
    venueNoun: 'facility',
    activeLocation: 'DC East Warehouse',
    shiftNoun: 'pick and pack shift',
    offerReason: 'Closest match. 1.8 miles away. Forklift certified, 30 hours this week, under overtime.',
    credentialCard: {
      id: 'credential',
      status: 'resolved',
      statusLabel: 'Resolved',
      timestamp: '1 hr ago',
      agentId: 'iris',
      agentTask: 'Forklift Certification',
      title: 'Forklift certification verified',
      description: 'Sarah M. cleared for DC East. First shift Monday.',
    },
    mission: {
      headline: 'Lines are running. 2 decisions waiting on you.',
      stats: [
        { label: 'Open shifts next 72 hrs',     value: '0',    tone: 'success' },
        { label: 'Line readiness this week',    value: '96%',  tone: 'success' },
        { label: 'Items needing approval',      value: '2',    tone: 'warning' },
        { label: 'Auto resolved today',         value: '13',   tone: 'neutral' },
      ],
    },
    needsYou: [
      {
        id: 'peak-surge',
        type: 'approval',
        timestamp: '7 min ago',
        agentId: 'atlas',
        agentTask: 'Peak Volume Surge',
        title: 'Peak volume surge detected',
        summary: 'DC East projecting 22% above forecast next 5 days. Recommend adding 8 forklift certified associates.',
        reasoning: [
          'Last 3 similar surges required 6 to 10 extra associates.',
          '12 forklift certified associates available, all under overtime.',
          'Adding 8 keeps throughput at target with 15% buffer.',
        ],
        recommendation: 'Add 8 associates to DC East next 5 days.',
        resolvedTitle: 'Surge staffing confirmed at DC East',
        resolvedDescription: '8 associates scheduled. Shift leads notified. Throughput protected.',
      },
      {
        id: 'cert-expiring',
        type: 'approval',
        timestamp: '31 min ago',
        agentId: 'iris',
        agentTask: 'Certification Renewal',
        title: '5 forklift certs expiring in 14 days',
        summary: 'Batch renewal available at $45 per associate. On site training Thursday afternoon.',
        reasoning: [
          'All 5 are active, high performers, zero safety incidents.',
          'Thursday session covers 2 hours. Paid as training time.',
          'Not renewing would remove 5 from forklift pool during peak.',
        ],
        recommendation: 'Approve batch renewal. Schedule Thursday.',
        resolvedTitle: 'Renewal approved for 5 associates',
        resolvedDescription: 'Training booked Thursday 2pm. All 5 confirmed attendance.',
      },
    ],
  }),

  construction: buildIndustry({
    id: 'construction',
    label: 'Construction',
    workerNoun: 'crew member',
    workerNounPlural: 'crew members',
    venueNoun: 'job site',
    activeLocation: '5th and Main site',
    shiftNoun: 'framing shift',
    offerReason: 'Closest match. 2.3 miles away. Framing lead, 32 hours this week, under overtime.',
    credentialCard: {
      id: 'credential',
      status: 'resolved',
      statusLabel: 'Resolved',
      timestamp: '1 hr ago',
      agentId: 'iris',
      agentTask: 'OSHA 30 Verification',
      title: 'OSHA 30 verified for new hire',
      description: 'Sarah M. cleared for 5th and Main. First shift Monday.',
    },
    mission: {
      headline: 'Every site has a crew. 2 decisions waiting on you.',
      stats: [
        { label: 'Open crew slots next 72 hrs', value: '0',    tone: 'success' },
        { label: 'Site readiness this week',    value: '95%',  tone: 'success' },
        { label: 'Items needing approval',      value: '2',    tone: 'warning' },
        { label: 'Auto resolved today',         value: '10',   tone: 'neutral' },
      ],
    },
    needsYou: [
      {
        id: 'weather-shift',
        type: 'approval',
        timestamp: '9 min ago',
        agentId: 'nova',
        agentTask: 'Weather Contingency',
        title: 'Weather forecast moves framing inside schedule',
        summary: 'Heavy rain Thursday. Recommend shifting 5th and Main crew to Elm Street interior work.',
        reasoning: [
          '85% chance of 1+ inch rain Thursday. Framing unsafe.',
          'Elm Street has drywall and interior trim ready, no crew assigned.',
          'Same crew qualifies for both. No overtime, no comp risk.',
        ],
        recommendation: 'Swap crews Thursday. Resume framing Friday.',
        resolvedTitle: 'Crew reassigned to Elm Street Thursday',
        resolvedDescription: 'Foreman notified. 5th and Main framing resumes Friday 6am.',
      },
      {
        id: 'osha-expiring',
        type: 'approval',
        timestamp: '33 min ago',
        agentId: 'iris',
        agentTask: 'OSHA Renewal',
        title: '4 OSHA 30 certs expiring in 21 days',
        summary: 'Group renewal available online. $75 per crew member, can start this week.',
        reasoning: [
          'All 4 are leads or senior crew. Loss of cert pulls them off site.',
          'Online renewal is self paced, average 4 hours.',
          'Cost well below replacing coverage during active projects.',
        ],
        recommendation: 'Approve group renewal. Send links today.',
        resolvedTitle: 'Renewal approved for 4 crew',
        resolvedDescription: 'Links sent. All 4 started. Certs renewed within 5 days.',
      },
    ],
  }),
}

export function getIndustryData(id) {
  return INDUSTRY_DATA[id] ?? INDUSTRY_DATA.healthcare
}

/* ─────────────────────────────────────────────────────────────────────────────
   Events industry — subject-first card prototype.
   Cards are about the thing you care about (an event, a person, a venue); the
   AI agent is the executor shown in a small footer on each card.
   ───────────────────────────────────────────────────────────────────────────── */

INDUSTRY_DATA.events.activeCard = {
  id: 'upcoming-event',
  status: 'monitoring',
  statusLabel: 'Coverage 98%',
  timestamp: 'Saturday 7pm',
  agentId: 'atlas',
  agentTask: 'Event Surge Planning',
  title: '49ers vs Rams, Saturday 7pm',
  description: 'Civic Arena. Sold out. Staffing is tracking to 98% complete. One action waiting: Rachel Williams replacement approval.',
  subject: {
    kind: 'event',
    primary: '49ers vs Rams',
    secondary: 'Saturday 7pm · Civic Arena · Sold out',
    metric: 'Coverage 98%',
    image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=220&h=220&fit=crop&auto=format',
    imageKind: 'rect',
  },
}

// Give each background feed card a subject so the layout stays consistent.
const EVENTS_FEED_SUBJECTS = {
  swaps: {
    kind: 'pattern',
    primary: '2 shift swaps auto-approved',
    secondary: 'Thursday · Civic Arena concourse',
    icon: 'swap',
  },
  gaps: {
    kind: 'pattern',
    primary: '3 potential gaps this weekend',
    secondary: 'Call-out pattern in 2 ushers · Flagged for early action',
    icon: 'alert',
  },
  overtime: {
    kind: 'pattern',
    primary: '4 staff near overtime limit',
    secondary: 'Could affect next week\'s shows at Civic Arena',
    icon: 'clock',
  },
  reminders: {
    kind: 'pattern',
    primary: '6 staff reminded for Saturday 5am call',
    secondary: 'Harbor Theater load-in · 4 confirmed',
    icon: 'bell',
  },
}

INDUSTRY_DATA.events.feed = INDUSTRY_DATA.events.feed.map(card => {
  const subject = EVENTS_FEED_SUBJECTS[card.id]
  return subject ? { ...card, subject } : card
})
