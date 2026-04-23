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
          kind: 'pair',
          primary: 'Rachel Williams ↔ Sandra Lee',
          secondary: 'Replacement · 49ers vs Rams · Saturday 7pm',
          images: [
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces&auto=format',
            'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=160&h=160&fit=crop&crop=faces&auto=format',
          ],
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

// Build the upcoming-event card inline — it now lives at the top of needsYou
// instead of the active/hero slot. BASE_URL covers GitHub Pages + Vercel.
const UPCOMING_EVENT_CARD = {
  id: 'upcoming-event',
  status: 'monitoring',
  statusLabel: 'Coverage 98%',
  timestamp: 'Sat Apr 26 · 7:00 PM',
  eyebrow: 'Event Coverage Update',
  agentId: 'atlas',
  agentTask: 'Event Surge Planning',
  title: '49ers vs Rams, Saturday 7pm',
  description: 'Civic Arena. Sold out. Staffing is tracking to 98% complete. One action waiting: Rachel Williams replacement approval.',
  subject: {
    kind: 'event',
    primary: '49ers vs Rams',
    secondary: 'Sat Apr 26 · 7:00 PM · Civic Arena · Sold out',
    metric: 'Coverage 98%',
    image: `${import.meta.env.BASE_URL}events/49ers-rams.svg`,
    imageKind: 'rect',
  },
}

// Give each background feed card a subject + eyebrow. Drop noisy "Live"
// pattern cards (gaps, overtime) — they're monitoring-only and add clutter.
const EVENTS_FEED_OVERRIDES = {
  swaps: {
    eyebrow: 'Shift Swap Approved',
    subject: {
      kind: 'pair',
      primary: 'Jordan K. ↔ Ashley P.',
      secondary: 'Thursday usher shift swap · Civic Arena',
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces&auto=format',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=faces&auto=format',
      ],
    },
  },
  reminders: {
    eyebrow: 'Shift Reminders Sent',
    subject: {
      kind: 'group',
      primary: '6 staff reminded · 4 confirmed',
      secondary: 'Saturday 5am call · Harbor Theater load-in',
      images: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces&auto=format',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces&auto=format',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=faces&auto=format',
      ],
    },
  },
}

INDUSTRY_DATA.events.feed = INDUSTRY_DATA.events.feed
  .filter(card => card.id !== 'gaps' && card.id !== 'overtime')
  .map(card => {
    const override = EVENTS_FEED_OVERRIDES[card.id]
    if (override) return { ...card, ...override }
    if (card.id === 'credential') return { ...card, eyebrow: 'Credential Cleared' }
    return card
  })

// Extra background activity — mix of staff, manager, and agent actions across
// the events account so the feed reads like a real day of WFM work.
const EVENTS_FEED_EXTRA = [
  { id: 'time-off-priya', eyebrow: 'Time off requested', status: 'monitoring', statusLabel: 'Pending review',
    timestamp: '1 hr 20 min ago',
    description: 'Priya S. requested Saturday Apr 26 off — needs review before the 49ers event.',
    subject: { kind: 'person', primary: 'Priya S.', secondary: 'Priya S. requested Sat Apr 26 off',
               image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=faces&auto=format' } },
  { id: 'clock-in-diego', eyebrow: 'Clocked in', status: 'resolved', statusLabel: 'On the clock',
    timestamp: '1 hr 45 min ago',
    description: 'Diego P. clocked in on time at Civic Arena · Gate 2.',
    subject: { kind: 'person', primary: 'Diego P.', secondary: 'Diego P. clocked in · Civic Arena gate 2',
               image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&auto=format' } },
  { id: 'ot-watch-marcus', eyebrow: 'Overtime watch', status: 'watching', statusLabel: 'Flagged',
    timestamp: '2 hrs ago', agentId: 'leo',
    description: 'flagged Marcus J. — projecting 41 hrs this week if he works Saturday.',
    subject: { kind: 'icon', icon: 'alert', primary: 'Overtime risk', secondary: 'Marcus J. projecting 41 hrs this week' } },
  { id: 'shift-pickup-jordan', eyebrow: 'Shift picked up', status: 'resolved', statusLabel: 'Resolved',
    timestamp: '2 hrs 30 min ago',
    description: 'Jordan K. picked up the open 10pm concourse post for Saturday.',
    subject: { kind: 'person', primary: 'Jordan K.', secondary: 'Jordan K. picked up open 10pm concourse post',
               image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&auto=format' } },
  { id: 'sick-call-nate', eyebrow: 'Sick call', status: 'monitoring', statusLabel: 'Logged',
    timestamp: '3 hrs ago',
    description: 'Nate H. called out for Friday 6pm — coverage needed at Harbor Theater.',
    subject: { kind: 'icon', icon: 'bell', primary: 'Nate H.', secondary: 'Nate H. called out for Friday 6pm' } },
  { id: 'cert-expiring', eyebrow: 'Certs expiring', status: 'watching', statusLabel: 'Flagged',
    timestamp: '3 hrs 30 min ago', agentId: 'iris',
    description: 'flagged 4 TABC certs expiring within 7 days — renewal session Tuesday.',
    subject: { kind: 'icon', icon: 'clock', primary: 'TABC renewals', secondary: '4 TABC certs expire within 7 days' } },
  { id: 'break-policy', eyebrow: 'Break policy enforced', status: 'resolved', statusLabel: 'Resolved',
    timestamp: '3 hrs 45 min ago', agentId: 'leo',
    description: 'auto-inserted 30-minute meal breaks across 3 Harbor Theater shifts.',
    subject: { kind: 'icon', icon: 'clock', primary: 'Harbor Theater', secondary: '30-min meal break auto-inserted · 3 shifts' } },
  { id: 'team-message', eyebrow: 'Team message', status: 'sent', statusLabel: 'Sent',
    timestamp: '4 hrs ago',
    description: 'Miguel R. posted the Saturday brief to the event team channel.',
    subject: { kind: 'person', primary: 'Miguel R.', secondary: 'Miguel R. posted Saturday brief to event team',
               image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&auto=format' } },
  { id: 'schedule-published', eyebrow: 'Schedule published', status: 'resolved', statusLabel: 'Published',
    timestamp: '4 hrs 30 min ago',
    description: 'Civic Arena schedule published for week of May 4 — 36 staff across 12 shifts.',
    subject: { kind: 'icon', icon: 'bell', primary: 'Civic Arena', secondary: 'Week of May 4 · 36 staff · 12 shifts' } },
  { id: 'surge-accepted-rachel', eyebrow: 'Surge offer accepted', status: 'resolved', statusLabel: 'Resolved',
    timestamp: '5 hrs ago', agentId: 'nova',
    description: 'confirmed Rachel Williams for the Saturday surge usher post.',
    subject: { kind: 'person', primary: 'Rachel Williams', secondary: 'Rachel Williams picked up surge usher post',
               image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=faces&auto=format' } },
  { id: 'gate-edit', eyebrow: 'Gate assignments updated', status: 'resolved', statusLabel: 'Saved',
    timestamp: '5 hrs 30 min ago',
    description: 'Miguel R. rebalanced Gates 3–5 to handle the Saturday sellout.',
    subject: { kind: 'person', primary: 'Miguel R.', secondary: 'Miguel R. rebalanced gates 3–5 for sellout',
               image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&auto=format' } },
  { id: 'no-show', eyebrow: 'No-show · no-call', status: 'in-progress', statusLabel: 'Escalated',
    timestamp: '6 hrs ago',
    description: 'Kelly T. missed her 2pm call-time at Civic Arena — escalated to the charge lead.',
    subject: { kind: 'icon', icon: 'alert', primary: 'Kelly T.', secondary: 'Kelly T. missed 2pm call at Civic Arena' } },
  { id: 'payroll-submitted', eyebrow: 'Payroll submitted', status: 'resolved', statusLabel: 'Submitted',
    timestamp: '7 hrs ago',
    description: 'Payroll closed pay period Apr 13–19 for 48 staff.',
    subject: { kind: 'icon', icon: 'clock', primary: 'Pay period', secondary: 'Pay period Apr 13–19 closed · 48 staff' } },
  { id: 'expense-ashley', eyebrow: 'Expense approved', status: 'resolved', statusLabel: 'Approved',
    timestamp: '8 hrs ago',
    description: 'Ashley P. uniform reimbursement approved — $84 routed to next payroll run.',
    subject: { kind: 'person', primary: 'Ashley P.', secondary: 'Ashley P. uniform reimbursement · $84',
               image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces&auto=format' } },
  { id: 'feedback-tasha', eyebrow: 'Worker feedback', status: 'resolved', statusLabel: 'Logged',
    timestamp: '9 hrs ago',
    description: 'Tasha K. rated Saturday manager 5 / 5 after shift — note logged to Miguel.',
    subject: { kind: 'icon', icon: 'bell', primary: 'Tasha K.', secondary: 'Tasha K. rated Saturday manager 5 / 5' } },
  { id: 'surge-plan', eyebrow: 'Surge plan approved', status: 'resolved', statusLabel: 'Approved',
    timestamp: '10 hrs ago', agentId: 'atlas',
    description: 'approved +12 staff surge across entry, concourse, and parking for Saturday.',
    subject: { kind: 'icon', icon: 'bell', primary: 'Saturday surge', secondary: '+12 staff staged across entry, concourse, parking' } },
  { id: 'training-active-shooter', eyebrow: 'Training completed', status: 'resolved', statusLabel: 'Completed',
    timestamp: 'Yesterday · 6:12 PM',
    description: '6 staff completed active-shooter response training ahead of Saturday.',
    subject: { kind: 'icon', icon: 'bell', primary: 'Safety training', secondary: '6 staff completed active-shooter response' } },
  { id: 'budget-check', eyebrow: 'Labor budget check', status: 'resolved', statusLabel: 'On track',
    timestamp: 'Yesterday · 4:50 PM', agentId: 'leo',
    description: 'checked Saturday labor budget — projecting 94% of target, on track.',
    subject: { kind: 'icon', icon: 'clock', primary: 'Weekend budget', secondary: 'Saturday projected 94% of labor target' } },
  { id: 'doc-upload-liquor', eyebrow: 'Document uploaded', status: 'resolved', statusLabel: 'On file',
    timestamp: 'Yesterday · 2:04 PM',
    description: 'Harbor Theater uploaded liquor license + occupancy permit — on file.',
    subject: { kind: 'icon', icon: 'bell', primary: 'Harbor Theater', secondary: 'Liquor license + occupancy permit on file' } },
  { id: 'venue-onboard-harbor', eyebrow: 'Venue onboarded', status: 'resolved', statusLabel: 'Resolved',
    timestamp: 'Apr 10', agentId: 'sofia',
    description: 'onboarded Harbor Theater to the roster system — first event May 1.',
    subject: { kind: 'icon', icon: 'bell', primary: 'Harbor Theater', secondary: 'Harbor Theater added to the roster system' } },
  { id: 'new-hire-diego', eyebrow: 'New hire onboarded', status: 'resolved', statusLabel: 'Cleared',
    timestamp: 'Apr 8',
    description: 'Diego P. cleared for Civic Arena · gate crew — first shift Saturday.',
    subject: { kind: 'person', primary: 'Diego P.', secondary: 'Diego P. cleared for Civic Arena · gate crew',
               image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&auto=format' } },
  { id: 'sarah-added', eyebrow: 'Added to roster', status: 'resolved', statusLabel: 'Resolved',
    timestamp: 'Mar 12',
    description: 'Sarah M. added to the events-staff roster by HR.',
    subject: { kind: 'person', primary: 'Sarah M.', secondary: 'Sarah M. added to events-staff roster',
               image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=faces&auto=format' } },
]

// Last-min replacement — high-urgency card pinned to the top of the feed.
// Its record (EVENTS_RECORDS['last-min-replacement']) has a rich reasoning
// timeline that expands inline.
const LAST_MIN_REPLACEMENT_FEED_CARD = {
  id: 'last-min-replacement',
  eyebrow: 'Last-min shift replacement',
  agentId: 'nova',
  status: 'resolved',
  statusLabel: 'Resolved',
  timestamp: '3 min ago',
  description: 'Rachel Williams in for Sandra Lee · Saturday 7pm',
  subject: {
    kind: 'pair',
    primary: 'Rachel Williams ↔ Sandra Lee',
    secondary: 'Rachel Williams confirmed · Saturday 7pm usher · Civic Arena',
    images: [
      'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=160&h=160&fit=crop&crop=faces&auto=format',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces&auto=format',
    ],
  },
}

INDUSTRY_DATA.events.feed = [
  LAST_MIN_REPLACEMENT_FEED_CARD,
  ...INDUSTRY_DATA.events.feed,
  ...EVENTS_FEED_EXTRA,
]

// Events needsYou: 49ers event (1st — the thing you care about), then the
// Rachel replacement (2nd — the action you need to take). Drop Harbor Theater.
INDUSTRY_DATA.events.needsYou = [
  UPCOMING_EVENT_CARD,
  ...INDUSTRY_DATA.events.needsYou
    .filter(c => c.id !== 'new-venue')
    .map(c => c.id === 'last-min-replacement' ? { ...c, eyebrow: 'Shift Replacement' } : c),
]

// No hero "active" card anymore — the Teambridge-is-handling zone just lists
// the background feed items (swap, reminders, credential).
INDUSTRY_DATA.events.activeCard = null

/* ─────────────────────────────────────────────────────────────────────────────
   Schedule — week view grid, one shift per user per day max.
   Week: Sun Apr 19 – Sat Apr 25, 2026 (today is Thursday).
   Status tones: completed (past) · upcoming (future) · no-show (rare, past).
   ───────────────────────────────────────────────────────────────────────────── */
INDUSTRY_DATA.events.schedule = {
  weekLabel: 'Apr 19 – Apr 25, 2026, PDT',
  todayId: 'thu',
  rows: [
    { userId: 'rachel', name: 'Rachel Williams', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=faces&auto=format',
      estPay: '$528', estHours: '22 hrs',
      shifts: {
        sun: { start: '10:00a', end: '2:00p',  role: 'Usher', venue: 'Civic',  status: 'completed' },
        tue: { start: '5:00p',  end: '9:00p',  role: 'Usher', venue: 'Civic',  status: 'completed' },
        thu: { start: '3:00p',  end: '6:00p',  role: 'Usher', venue: 'Civic',  status: 'completed' },
        sat: { start: '6:30p',  end: '12:00a', role: 'Usher', venue: 'Civic',  status: 'upcoming'  },
      } },
    { userId: 'sandra', name: 'Sandra Lee', avatar: 'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=96&h=96&fit=crop&crop=faces&auto=format',
      estPay: '$384', estHours: '16 hrs',
      shifts: {
        mon: { start: '12:00p', end: '4:00p',  role: 'Usher', venue: 'Civic',  status: 'completed' },
        wed: { start: '5:00p',  end: '9:00p',  role: 'Usher', venue: 'Civic',  status: 'no-show'   },
        thu: { start: '1:00p',  end: '5:00p',  role: 'Usher', venue: 'Civic',  status: 'completed' },
      } },
    { userId: 'sarah', name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=faces&auto=format',
      estPay: '$312', estHours: '13 hrs',
      shifts: {
        mon: { start: '4:00p',  end: '8:00p',  role: 'Bev Service', venue: 'Civic',  status: 'completed' },
        thu: { start: '5:00p',  end: '9:00p',  role: 'Bev Service', venue: 'Civic',  status: 'completed' },
        sat: { start: '6:30p',  end: '12:00a', role: 'Bev Service', venue: 'Civic',  status: 'upcoming'  },
      } },
    { userId: 'jordan', name: 'Jordan K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&auto=format',
      estPay: '$672', estHours: '28 hrs',
      shifts: {
        sun: { start: '7:00p',  end: '11:00p', role: 'Usher', venue: 'Civic',  status: 'completed' },
        tue: { start: '3:00p',  end: '7:00p',  role: 'Usher', venue: 'Civic',  status: 'completed' },
        wed: { start: '6:00p',  end: '10:00p', role: 'Usher', venue: 'Harbor', status: 'completed' },
        thu: { start: '7:00p',  end: '11:00p', role: 'Usher', venue: 'Civic',  status: 'upcoming'  },
        fri: { start: '4:00p',  end: '8:00p',  role: 'Usher', venue: 'Civic',  status: 'upcoming'  },
        sat: { start: '7:00p',  end: '3:00a',  role: 'Usher', venue: 'Civic',  status: 'upcoming'  },
      } },
    { userId: 'ashley', name: 'Ashley P.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces&auto=format',
      estPay: '$720', estHours: '30 hrs',
      shifts: {
        mon: { start: '3:00p',  end: '7:00p',  role: 'Usher', venue: 'Civic',  status: 'completed' },
        tue: { start: '4:00p',  end: '8:00p',  role: 'Usher', venue: 'Civic',  status: 'no-show'   },
        wed: { start: '6:00p',  end: '10:00p', role: 'Usher', venue: 'Civic',  status: 'completed' },
        thu: { start: '7:00p',  end: '11:00p', role: 'Usher', venue: 'Civic',  status: 'upcoming'  },
        sat: { start: '6:30p',  end: '12:00a', role: 'Usher', venue: 'Civic',  status: 'upcoming'  },
      } },
    { userId: 'miguel', name: 'Miguel R.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces&auto=format',
      estPay: '$960', estHours: '32 hrs',
      shifts: {
        mon: { start: '9:00a',  end: '5:00p',  role: 'Event Lead', venue: 'Civic',  status: 'completed' },
        tue: { start: '9:00a',  end: '5:00p',  role: 'Event Lead', venue: 'Civic',  status: 'completed' },
        wed: { start: '9:00a',  end: '5:00p',  role: 'Event Lead', venue: 'Civic',  status: 'completed' },
        thu: { start: '9:00a',  end: '5:00p',  role: 'Event Lead', venue: 'Civic',  status: 'completed' },
        sat: { start: '3:00p',  end: '12:00a', role: 'Event Lead', venue: 'Civic',  status: 'upcoming'  },
      } },
    { userId: 'priya', name: 'Priya S.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&crop=faces&auto=format',
      estPay: '$312', estHours: '13 hrs',
      shifts: {
        sun: { start: '2:00p',  end: '6:00p',  role: 'Usher', venue: 'Civic',  status: 'completed' },
        thu: { start: '6:00p',  end: '10:00p', role: 'Usher', venue: 'Civic',  status: 'completed' },
        fri: { start: '5:00p',  end: '9:00p',  role: 'Usher', venue: 'Civic',  status: 'upcoming'  },
        sat: { start: '5:00a',  end: '9:00a',  role: 'Load-in', venue: 'Harbor', status: 'upcoming' },
      } },
    { userId: 'diego', name: 'Diego P.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&auto=format',
      estPay: '$216', estHours: '9 hrs',
      shifts: {
        tue: { start: '4:00p',  end: '7:00p',  role: 'Gate Crew', venue: 'Civic', status: 'completed' },
        thu: { start: '6:00p',  end: '9:00p',  role: 'Gate Crew', venue: 'Civic', status: 'upcoming'  },
        sat: { start: '6:00p',  end: '11:00p', role: 'Gate Crew', venue: 'Civic', status: 'upcoming'  },
      } },
    { userId: 'marcus', name: 'Marcus J.', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=96&h=96&fit=crop&crop=faces&auto=format',
      estPay: '$432', estHours: '18 hrs',
      shifts: {
        mon: { start: '5:00p',  end: '9:00p',  role: 'Usher', venue: 'Civic',  status: 'completed' },
        wed: { start: '5:00p',  end: '9:00p',  role: 'Usher', venue: 'Civic',  status: 'completed' },
        thu: { start: '5:00p',  end: '9:00p',  role: 'Usher', venue: 'Civic',  status: 'upcoming'  },
        sat: { start: '6:30p',  end: '12:00a', role: 'Usher', venue: 'Civic',  status: 'upcoming'  },
      } },
    { userId: 'tasha', name: 'Tasha K.', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=96&h=96&fit=crop&crop=faces&auto=format',
      estPay: '$360', estHours: '15 hrs',
      shifts: {
        sun: { start: '5:00p',  end: '9:00p',  role: 'Bev Service', venue: 'Civic',  status: 'completed' },
        tue: { start: '4:00p',  end: '8:00p',  role: 'Bev Service', venue: 'Civic',  status: 'completed' },
        fri: { start: '4:00p',  end: '8:00p',  role: 'Bev Service', venue: 'Civic',  status: 'upcoming'  },
      } },
    { userId: 'nate', name: 'Nate H.', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=96&h=96&fit=crop&crop=faces&auto=format',
      estPay: '$288', estHours: '12 hrs',
      shifts: {
        sun: { start: '6:00p',  end: '10:00p', role: 'Gate Crew', venue: 'Civic', status: 'completed' },
        wed: { start: '7:00p',  end: '11:00p', role: 'Gate Crew', venue: 'Civic', status: 'completed' },
        fri: { start: '6:00p',  end: '10:00p', role: 'Gate Crew', venue: 'Civic', status: 'no-show'   },
      } },
    { userId: 'kelly', name: 'Kelly T.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&auto=format',
      estPay: '$264', estHours: '11 hrs',
      shifts: {
        mon: { start: '3:00p',  end: '7:00p',  role: 'Usher', venue: 'Civic',  status: 'completed' },
        thu: { start: '4:00p',  end: '8:00p',  role: 'Usher', venue: 'Civic',  status: 'upcoming'  },
        sat: { start: '6:30p',  end: '10:00p', role: 'Usher', venue: 'Civic',  status: 'upcoming'  },
      } },
  ],
}

/* ─────────────────────────────────────────────────────────────────────────────
   People — flat roster for the People page list view.
   ───────────────────────────────────────────────────────────────────────────── */
INDUSTRY_DATA.events.people = {
  stats: [
    { id: 'active',  label: 'Active staff',         value: '48', tone: 'blue'    },
    { id: 'pending', label: 'Awaiting clearance',   value: '3',  tone: 'warning' },
    { id: 'avg-hrs', label: 'Avg weekly hours',     value: '24', tone: 'success' },
  ],
  rows: [
    { id: 'rachel', name: 'Rachel Williams', role: 'Usher',       venue: 'Civic Arena',   hours: '22 / 40', certs: 'Guest svc',              status: 'active',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'sandra', name: 'Sandra Lee',      role: 'Usher',       venue: 'Civic Arena',   hours: '0 / 40',  certs: 'Guest svc',              status: 'on-leave',
      avatar: 'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'sarah',  name: 'Sarah M.',        role: 'Bev Service', venue: 'Civic Arena',   hours: '13 / 30', certs: 'TABC · Verified',         status: 'new-hire',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'jordan', name: 'Jordan K.',       role: 'Usher',       venue: 'Civic Arena',   hours: '28 / 40', certs: 'Guest svc',              status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'ashley', name: 'Ashley P.',       role: 'Usher',       venue: 'Civic Arena',   hours: '30 / 40', certs: 'Guest svc',              status: 'active',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'miguel', name: 'Miguel R.',       role: 'Event Lead',  venue: 'Civic Arena',   hours: '32 / 40', certs: 'Lead · Safety',          status: 'active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'priya',  name: 'Priya S.',        role: 'Usher',       venue: 'Civic Arena',   hours: '13 / 40', certs: 'TABC · Expires Apr 30',  status: 'cert-expiring',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'diego',  name: 'Diego P.',        role: 'Gate Crew',   venue: 'Civic Arena',   hours: '9 / 30',  certs: '—',                      status: 'new-hire',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'marcus', name: 'Marcus J.',       role: 'Usher',       venue: 'Civic Arena',   hours: '38 / 40', certs: 'Guest svc',              status: 'ot-risk',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'tasha',  name: 'Tasha K.',        role: 'Bev Service', venue: 'Civic Arena',   hours: '15 / 40', certs: 'TABC · Verified',        status: 'active',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'nate',   name: 'Nate H.',         role: 'Gate Crew',   venue: 'Civic Arena',   hours: '12 / 30', certs: 'Safety',                  status: 'active',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'kelly',  name: 'Kelly T.',        role: 'Usher',       venue: 'Civic Arena',   hours: '11 / 40', certs: 'Guest svc',              status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'harbor-staff-1', name: 'Elena V.', role: 'Bev Service', venue: 'Harbor Theater', hours: '6 / 20',  certs: 'TABC · Pending',          status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'harbor-staff-2', name: 'Omar K.',  role: 'Load-in',    venue: 'Harbor Theater', hours: '18 / 30', certs: '—',                      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=faces&auto=format' },
    { id: 'harbor-staff-3', name: 'Lydia C.', role: 'Usher',      venue: 'Harbor Theater', hours: '14 / 30', certs: 'Guest svc · Pending',    status: 'cert-expiring',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=96&h=96&fit=crop&crop=faces&auto=format' },
  ],
}

/* ─────────────────────────────────────────────────────────────────────────────
   Records — the thing each card is about.
   When the operator clicks a card, the right drawer opens on this record and
   shows its Details tab (fields) and Activity tab (AI work + record history).
   ───────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────────
   Shared user + record stubs — used by Events records as linked-record chips
   (each one gets a small popover in the details panel).
   ───────────────────────────────────────────────────────────────────────────── */

const RACHEL  = { kind: 'user', name: 'Rachel Williams', role: 'Usher', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=faces&auto=format',
                  popover: { title: 'Rachel Williams', subtitle: 'Usher · Active', status: { label: '4.8 rating', tone: 'success' },
                             fields: [{ label: 'Home venue', value: 'Civic Arena' }, { label: 'Events this month', value: '4' }, { label: 'Weekly hours', value: '22 of 40' }] } }
const SANDRA  = { kind: 'user', name: 'Sandra Lee', role: 'Usher', avatar: 'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=96&h=96&fit=crop&crop=faces&auto=format',
                  popover: { title: 'Sandra Lee', subtitle: 'Usher · Active', status: { label: 'On leave', tone: 'warning' },
                             fields: [{ label: 'Home venue', value: 'Civic Arena' }, { label: 'Cancellation reason', value: 'Family emergency' }, { label: 'Events this month', value: '3' }] } }
const SARAH   = { kind: 'user', name: 'Sarah M.', role: 'Event staff', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=faces&auto=format',
                  popover: { title: 'Sarah M.', subtitle: 'New hire · Beverage service', status: { label: 'Cleared', tone: 'success' },
                             fields: [{ label: 'Hired', value: 'Mar 12, 2026' }, { label: 'Home venue', value: 'Civic Arena' }, { label: 'Certifications', value: 'TABC · Verified' }] } }
const JORDAN  = { kind: 'user', name: 'Jordan K.', role: 'Usher', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&auto=format',
                  popover: { title: 'Jordan K.', subtitle: 'Usher · Active',
                             fields: [{ label: 'Home venue', value: 'Civic Arena' }, { label: 'Weekly hours', value: '28 of 40' }, { label: 'Swap history', value: '3 this quarter' }] } }
const ASHLEY  = { kind: 'user', name: 'Ashley P.', role: 'Usher', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces&auto=format',
                  popover: { title: 'Ashley P.', subtitle: 'Usher · Active',
                             fields: [{ label: 'Home venue', value: 'Civic Arena' }, { label: 'Weekly hours', value: '30 of 40' }, { label: 'Swap history', value: '2 this quarter' }] } }
const MIGUEL  = { kind: 'user', name: 'Miguel R.', role: 'Event Lead', avatar: null,
                  popover: { title: 'Miguel R.', subtitle: 'Event Lead · Civic Arena',
                             fields: [{ label: 'Team', value: 'Civic Arena ops' }, { label: 'Contact', value: 'miguel.r@civicarena.events' }] } }

const LINK_EVENT_49ERS = { kind: 'link', recordType: 'event', display: '49ers vs Rams',
                           popover: { title: '49ers vs Rams', subtitle: 'Saturday Apr 26 · Civic Arena', status: { label: '98% staffed', tone: 'success' },
                                      fields: [{ label: 'Kickoff', value: '7:15 PM' }, { label: 'Attendance', value: '68,500 (sold out)' }, { label: 'Staff', value: '48 total' }] } }
const LINK_VENUE_CIVIC = { kind: 'link', recordType: 'venue', display: 'Civic Arena',
                           popover: { title: 'Civic Arena', subtitle: 'Home venue',
                                      fields: [{ label: 'Capacity', value: '68,500' }, { label: 'Address', value: '1 Civic Plaza' }, { label: 'Active events', value: '3 this month' }] } }
const LINK_VENUE_HARBOR = { kind: 'link', recordType: 'venue', display: 'Harbor Theater',
                            popover: { title: 'Harbor Theater', subtitle: 'New venue', status: { label: 'Onboarding', tone: 'warning' },
                                       fields: [{ label: 'Capacity', value: '1,800' }, { label: 'First event', value: 'May 1 · Opening Night' }] } }
const LINK_ROLE_USHER = { kind: 'link', recordType: 'role', display: 'Usher',
                          popover: { title: 'Usher', subtitle: 'Role · Event staff',
                                     fields: [{ label: 'Certifications', value: 'Guest services' }, { label: 'Rate', value: '$28/hr base' }, { label: 'Active staff', value: '48' }] } }

const EVENTS_RECORDS = {
  'upcoming-event': {
    type: 'event',
    title: '49ers vs Rams',
    subtitle: 'Saturday Apr 26, 7:00 PM · Civic Arena',
    status: { label: '98% staffed', tone: 'success' },
    fields: [
      { label: 'Venue',              value: LINK_VENUE_CIVIC },
      { label: 'Date',               value: 'Saturday, Apr 26, 2026' },
      { label: 'Doors / Kickoff',    value: '5:00 PM · 7:15 PM' },
      { label: 'Expected attendance', value: '68,500 (sold out)' },
      { label: 'Gates covered',      value: 'A–D · Gates 1–6' },
      { label: 'Base roster',        value: '36 staff' },
      { label: 'Surge',              value: '12 additional (approved)' },
      { label: 'Total staff',        value: '48' },
      { label: 'Coverage',           value: '98% · 1 role pending' },
      { label: 'Event lead',         value: MIGUEL },
      { label: 'Client',             value: 'Civic Arena Operations' },
      { label: 'Weather',            value: 'Clear · 62°F at kickoff' },
      { label: 'Ticket pace',        value: '+18% vs historical' },
      { label: 'Event ID',           value: 'EVT-04-0426-01' },
    ],
    activity: [
      { kind: 'agent', agentId: 'nova',  actor: 'Nova',  verb: 'flagged Rachel Williams replacement for approval', time: '3 min ago' },
      { kind: 'user',  actor: 'Sandra Lee', avatar: SANDRA.avatar, verb: 'cancelled her Saturday 7pm shift', time: '5 min ago',
        comm: { type: 'sms', contact: 'Sandra Lee', phone: '+1 (415) 555-0142',
                messages: [
                  { from: 'them',  text: 'Hi, can\'t make my 7pm usher shift Saturday at Civic Arena — family emergency.', time: '2:58 PM' },
                  { from: 'agent', text: 'Got it Sandra, no penalty on your record. I\'ll find the replacement.', time: '2:58 PM' },
                ] } },
      { kind: 'agent', agentId: 'nova',  actor: 'Nova',  verb: 'started replacement search for Sandra\'s shift', time: '5 min ago' },
      { kind: 'agent', agentId: 'leo',   actor: 'Leo',   verb: 'verified no overtime conflicts for Saturday surge', time: '28 min ago' },
      { kind: 'agent', agentId: 'iris',  actor: 'Iris',  verb: 'cleared Sarah M. for alcohol service', time: '45 min ago' },
      { kind: 'user',  actor: 'Sarah M.', avatar: SARAH.avatar, verb: 'uploaded her TABC cert + ID', time: '1 hr 12 min ago' },
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'sent arrival reminders to 36 staff', time: '1 hr ago' },
      { kind: 'agent', agentId: 'atlas', actor: 'Atlas', verb: 'staged surge plan (+12 staff across entry, concourse, parking)', time: '2 hrs ago' },
      { kind: 'agent', agentId: 'atlas', actor: 'Atlas', verb: 'detected sellout — ticket sales up 18% vs historical', time: '2 hrs ago' },
      { kind: 'user',  actor: 'Marcus J.', verb: 'swapped to Gate 5 (approved)', time: '3 hrs ago' },
      { kind: 'user',  actor: 'Civic Arena Ops', verb: 'confirmed final staffing plan', time: 'Wednesday' },
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'dispatched event pre-brief email to the roster', time: 'Wednesday' },
      { kind: 'agent', agentId: 'leo',   actor: 'Leo',   verb: 'ran compliance sweep — all certs current', time: 'Tuesday' },
      { kind: 'user',  actor: 'Miguel R.', verb: 'locked gate assignments', time: 'Tuesday' },
      { kind: 'agent', agentId: 'atlas', actor: 'Atlas', verb: 'opened this event', time: 'Monday' },
    ],
  },

  'last-min-replacement': {
    type: 'shift',
    title: 'Usher Shift · Saturday 7pm',
    subtitle: '49ers vs Rams · Civic Arena, East Entry',
    status: { label: 'Awaiting approval', tone: 'warning' },
    fields: [
      { label: 'Event',           value: LINK_EVENT_49ERS },
      { label: 'Scheduled',       value: 'Sat Apr 26 · 7:00 PM – 7:00 AM CDT' },
      { label: 'Report time',     value: '6:30 PM' },
      { label: 'Location',        value: LINK_VENUE_CIVIC },
      { label: 'Position',        value: 'East Entry · Gate 3' },
      { label: 'Role',            value: LINK_ROLE_USHER },
      { label: 'Rate',            value: '$28/hr + $4 night diff' },
      { label: 'Total hours',     value: '12 hrs scheduled' },
      { label: 'Assignee',        value: RACHEL },
      { label: 'Replacing',       value: SANDRA },
      { label: 'Overtime risk',   value: 'None (Rachel at 22 of 40 hrs)' },
      { label: 'Credentials',     value: 'Guest services · Verified' },
      { label: 'Event lead',      value: MIGUEL },
      { label: 'Published',       value: 'Yes' },
      { label: 'Shift ID',        value: 'SHF-04-0426-U14' },
    ],
    activity: [
      { kind: 'user',  actor: 'Scheduling', verb: 'published this shift',                                        time: 'Monday 9:15 AM' },
      { kind: 'user',  actor: 'Miguel R.',  verb: 'approved the final event roster',                             time: 'Wednesday 4:20 PM' },
      { kind: 'user',  actor: 'Sandra Lee', avatar: SANDRA.avatar, verb: 'cancelled her shift — family emergency', time: '5 min ago',
        comm: { type: 'sms', contact: 'Sandra Lee', phone: '+1 (415) 555-0142',
                messages: [
                  { from: 'them',  text: 'Hi, can\'t make my 7pm usher shift Saturday at Civic Arena — family emergency.', time: '2:58 PM' },
                  { from: 'agent', text: 'Got it Sandra, no penalty on your record. I\'ll find the replacement.', time: '2:58 PM' },
                ] } },
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'acknowledged Sandra and logged the cancellation', time: '+0s' },
      { kind: 'agent', agentId: 'nova',  actor: 'Nova',  verb: 'opened shift-coverage workflow for SHF-04-0426-U14', time: '+2s' },
      { kind: 'agent', agentId: 'nova',  actor: 'Nova',  verb: 'pulled 42 candidates within 6 miles of Civic Arena', time: '+4s' },
      { kind: 'agent', agentId: 'nova',  actor: 'Nova',  verb: 'filtered to available, non-overlapping: 18 remain',  time: '+6s' },
      { kind: 'agent', agentId: 'leo',   actor: 'Leo',   verb: 'overtime guard — removed 4 above 36 hrs this week',  time: '+8s' },
      { kind: 'agent', agentId: 'iris',  actor: 'Iris',  verb: 'verified guest-services cert — 11 qualify',          time: '+11s' },
      { kind: 'agent', agentId: 'nova',  actor: 'Nova',  verb: 'scored candidates on proximity + rating + past no-shows', time: '+14s' },
      { kind: 'agent', agentId: 'nova',  actor: 'Nova',  verb: 'ranked top 3: Rachel Williams, Jordan K., Priya S.',  time: '+17s' },
      { kind: 'agent', agentId: 'nova',  actor: 'Nova',  verb: 'sent SMS offer to Rachel Williams (highest score)',   time: '+19s' },
      { kind: 'user',  actor: 'Rachel Williams', avatar: RACHEL.avatar, verb: 'accepted the shift offer',             time: '+1m 44s',
        comm: { type: 'sms', contact: 'Rachel Williams', phone: '+1 (415) 555-0187',
                messages: [
                  { from: 'agent', text: 'Hi Rachel, this is Teambridge. Sandra Lee just cancelled her 7pm usher shift at Civic Arena for 49ers vs Rams Saturday. You\'re the closest qualified usher with a strong guest rating. Can you take it?', time: '3:00 PM' },
                  { from: 'them',  text: 'Yes! I\'m available, count me in.', time: '3:01 PM' },
                  { from: 'agent', text: 'Perfect — pending manager approval. Report 6:30pm to the east entry. Details in your app.', time: '3:01 PM' },
                ] } },
      { kind: 'agent', agentId: 'nova',  actor: 'Nova',  verb: 'held assignment pending manager approval',            time: '+1m 47s' },
      { kind: 'agent', agentId: 'nova',  actor: 'Nova',  verb: 'emailed Miguel with replacement summary',             time: '+1m 52s',
        comm: { type: 'email', contact: 'Miguel R., Event Lead', to: 'miguel.r@civicarena.events',
                subject: 'Replacement selected: Sandra → Rachel (Saturday 7pm)',
                body: `Hi Miguel,\n\nSandra Lee cancelled her Saturday 7pm usher shift. Replacement selected pending manager approval.\n\nCovering: Rachel Williams\nArrival: 6:30 PM\nExperience: 4 events this month, high guest rating\nOvertime status: clear\n\nWill confirm once approved.\n\n— Teambridge` } },
    ],
    summary: {
      headline: "found a replacement for Sandra Lee's cancellation",
      outcome: 'Replacement found and confirmed in 1m 52s — well inside the 4-hour window.',
      duration: '1m 52s',
      manual:   '30–45 min',
      saved:    '~43 min',
    },
    dataChanges: [
      { field: 'Saturday 7pm usher · Civic Arena · Gate 3',
        before: { name: 'Sandra Lee',      avatar: SANDRA.avatar },
        after:  { name: 'Rachel Williams', avatar: RACHEL.avatar } },
    ],
    conversations: [
      { id: 'sandra-sms', kind: 'sms', contact: 'Sandra Lee',
        summary: '2 messages · Cancelled',
        phone: '+1 (415) 555-0142',
        messages: [
          { from: 'them',  text: "Hi — can't make my 7pm usher shift Saturday at Civic Arena. Family emergency came up.", time: '2:58 PM' },
          { from: 'agent', text: "Got it Sandra, no penalty on your record. I'll find the replacement — take care of yourself.", time: '2:58 PM' },
        ],
      },
      { id: 'rachel-sms', kind: 'sms', contact: 'Rachel Williams',
        summary: '3 messages · Accepted',
        phone: '+1 (415) 555-0187',
        messages: [
          { from: 'agent', text: "Hi Rachel, Nova from Teambridge. Sandra just cancelled her 7pm usher shift Saturday. You're the closest qualified usher with strong guest ratings — can you take it?", time: '3:00 PM' },
          { from: 'them',  text: "Yes! I'm available, count me in.", time: '3:01 PM' },
          { from: 'agent', text: "Perfect — approval pending. Report 6:30 PM to the east entry. Details in your app.", time: '3:01 PM' },
        ],
      },
      { id: 'miguel-email', kind: 'email', contact: 'Miguel R., Event Lead',
        summary: 'Replacement summary',
        to: 'miguel.r@civicarena.events',
        subject: 'Replacement selected: Sandra → Rachel (Saturday 7pm)',
        body: "Hi Miguel,\n\nSandra Lee cancelled her Saturday 7pm usher shift. Replacement selected pending manager approval.\n\nCovering: Rachel Williams\nArrival: 6:30 PM\nExperience: 4 events this month, high guest rating\nOvertime status: clear\n\nWill confirm once approved.\n\n— Nova",
      },
    ],
    workflow: { id: 'nova-replacement', label: 'Last-min shift replacement', url: '#' },
  },

  'credential': {
    type: 'user',
    title: 'Sarah M.',
    subtitle: 'New hire · Event staff',
    status: { label: 'Cleared', tone: 'success' },
    fields: [
      { label: 'Role',             value: 'Event staff · Beverage service' },
      { label: 'Home venue',       value: LINK_VENUE_CIVIC },
      { label: 'First shift',      value: 'Saturday Apr 26 · 49ers vs Rams' },
      { label: 'Certifications',   value: 'Alcohol service (TABC) · Verified' },
      { label: 'Background check', value: 'Cleared · No adverse records' },
      { label: 'Hired',            value: 'Mar 12, 2026' },
      { label: 'Reporting to',     value: MIGUEL },
      { label: 'Distance to home venue', value: '3.4 mi' },
      { label: 'Weekly availability', value: 'Fri–Sun · 30 hrs max' },
      { label: 'User ID',          value: 'USR-0311-SM' },
    ],
    activity: [
      { kind: 'user',  actor: 'HR',          verb: 'added Sarah to the roster',                               time: 'Mar 12, 2026' },
      { kind: 'user',  actor: 'Miguel R.',   verb: 'reviewed Sarah\'s interview notes',                       time: 'Yesterday 11:04 AM' },
      { kind: 'user',  actor: 'Sarah M.', avatar: SARAH.avatar, verb: 'uploaded 6 required documents',        time: '1 hr 12 min ago' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'opened clearance workflow — 3-stage gate',       time: '+0s' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'OCR-scanned uploads — 6 of 6 legible',           time: '+3s' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'parsed driver license + work authorization',    time: '+8s' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'matched DL ↔ I-9 — identity confirmed',         time: '+12s' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'DMV cross-check — license active, no flags',   time: '+18s' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'queried Texas ABC registry for TABC license',  time: '+22s' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'TABC verified — active through Mar 2028',      time: '+26s' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'ran background check across 3 databases',      time: '+31s' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'no adverse records — 7-year window',           time: '+38s' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'OFAC / sanctions screen — clear',              time: '+44s' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'decision score 94 / 100 — auto-clear gate met', time: '+48s' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'cleared Sarah for first shift',                time: '+51s' },
      { kind: 'agent', agentId: 'iris', actor: 'Iris', verb: 'assigned Saturday Civic Arena · beverage svc', time: '+54s' },
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'sent welcome packet + first-shift info',     time: '+1m 12s',
        comm: { type: 'sms', contact: 'Sarah M.', phone: '+1 (415) 555-0181',
                messages: [
                  { from: 'agent', text: 'Sarah — you\'re cleared! First shift Saturday 7pm at Civic Arena. Report 6:30pm to the bev-service area. Welcome aboard.', time: '4:12 PM' },
                  { from: 'them',  text: 'Thanks! See you Saturday.', time: '4:14 PM' },
                ] } },
    ],
    summary: {
      headline: 'cleared Sarah M. for her first shift',
      outcome: 'Sarah cleared and staffed for Saturday.',
      duration: '1m 12s',
      manual:   '2–3 days',
      saved:    '~3 days',
    },
    dataChanges: [
      { field: 'Sarah M. · Clearance status',
        before: { value: 'Pending documents' },
        after:  { value: 'Cleared for Saturday' } },
    ],
    conversations: [
      { id: 'sarah-sms', kind: 'sms', contact: 'Sarah M.',
        summary: '2 messages',
        phone: '+1 (415) 555-0181',
        messages: [
          { from: 'agent', text: "Sarah — you're cleared! First shift Saturday 7pm at Civic Arena. Report 6:30pm to the bev-service area. Welcome aboard.", time: '4:12 PM' },
          { from: 'them',  text: 'Thanks! See you Saturday.', time: '4:14 PM' },
        ],
      },
    ],
    workflow: { id: 'iris-onboarding', label: 'Credentialing · New hire', url: '#' },
  },

  'new-venue': {
    type: 'venue',
    title: 'Harbor Theater',
    subtitle: 'New venue · First event in 9 days',
    status: { label: 'Awaiting approval', tone: 'warning' },
    fields: [
      { label: 'Address',           value: '120 Harbor Way · Downtown' },
      { label: 'Capacity',          value: '1,800' },
      { label: 'Contract',          value: '6-month, signed Apr 10' },
      { label: 'First event',       value: 'May 1 · Opening Night Gala' },
      { label: 'Staff needed',      value: '24 trained · 18 pre-staged' },
      { label: 'Training session',  value: 'Tuesday 7pm (scheduled)' },
      { label: 'Training required', value: 'Alcohol service (TABC)' },
      { label: 'Client contact',    value: 'ops@harbortheater.com' },
      { label: 'Owner',             value: 'Harbor Theater Operations' },
      { label: 'Venue ID',          value: 'VEN-0410-HT' },
    ],
    activity: [
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'awaiting your approval',                      time: 'Pending' },
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'pre-staged 18 staff within 5 miles',          time: '29 min ago' },
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'matched 14 staff with current TABC cert',     time: '30 min ago' },
      { kind: 'agent', agentId: 'iris',  actor: 'Iris',  verb: 'flagged 4 certs to renew Tuesday evening',    time: '31 min ago' },
      { kind: 'agent', agentId: 'atlas', actor: 'Atlas', verb: 'estimated 24 staff needed for opening night', time: '45 min ago' },
      { kind: 'user',  actor: 'Miguel R.', verb: 'shared venue floorplan + beverage posts',                   time: '2 hrs ago' },
      { kind: 'user',  actor: 'Harbor Theater',  verb: 'uploaded liquor license + occupancy permit',         time: 'Apr 11' },
      { kind: 'user',  actor: 'Harbor Theater',  verb: 'signed the 6-month contract',                        time: 'Apr 10' },
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'onboarded the venue to the roster system',    time: 'Apr 10' },
    ],
  },

  'swaps': {
    type: 'swap',
    title: 'Shift Swap · Thursday usher',
    subtitle: 'Jordan K. ↔ Ashley P.',
    status: { label: 'Auto-approved', tone: 'success' },
    fields: [
      { label: 'Requester',      value: JORDAN },
      { label: 'Swapping with',  value: ASHLEY },
      { label: 'Shift',          value: 'Thursday · 7:00 PM – 3:00 AM' },
      { label: 'Role',           value: LINK_ROLE_USHER },
      { label: 'Location',       value: LINK_VENUE_CIVIC },
      { label: 'Overtime risk',  value: 'None (both under 40 hrs)' },
      { label: 'Reciprocity',    value: 'Balanced · 2 prior swaps each way' },
      { label: 'Auto-approved by', value: 'Swap policy (manager log updated)' },
      { label: 'Swap ID',        value: 'SWP-04-0424-L9' },
    ],
    activity: [
      { kind: 'user',  actor: 'Miguel R.', verb: 'assigned original shifts to both',                              time: 'Monday 9:12 AM' },
      { kind: 'user',  actor: 'Jordan K.', avatar: JORDAN.avatar, verb: 'submitted swap request with Ashley',     time: '11:47 AM' },
      { kind: 'agent', agentId: 'nova', actor: 'Nova', verb: 'validated requested shift — Thursday usher · Civic Arena', time: '+0s' },
      { kind: 'agent', agentId: 'nova', actor: 'Nova', verb: 'confirmed Ashley is off and qualified for the slot', time: '+2s' },
      { kind: 'agent', agentId: 'nova', actor: 'Nova', verb: 'notified Ashley of Jordan\'s request',              time: '+4s' },
      { kind: 'user',  actor: 'Ashley P.', avatar: ASHLEY.avatar, verb: 'accepted the trade',                     time: '+38s' },
      { kind: 'agent', agentId: 'leo',  actor: 'Leo',  verb: 'overtime guard — both under 40 hrs',                time: '+40s' },
      { kind: 'agent', agentId: 'nova', actor: 'Nova', verb: 'checked reciprocity — 2 swaps each way, balanced',  time: '+41s' },
      { kind: 'agent', agentId: 'nova', actor: 'Nova', verb: 'ran swap-policy gate — all 4 conditions pass',      time: '+42s' },
      { kind: 'agent', agentId: 'nova', actor: 'Nova', verb: 'auto-approved the swap + logged to manager journal', time: '+43s',
        comm: { type: 'sms', contact: 'Ashley P.', phone: '+1 (415) 555-0129',
                messages: [
                  { from: 'agent', text: 'Your swap with Jordan on Thursday is approved. New shift: Thurs 7p–3a at Civic Arena.', time: '11:49 AM' },
                  { from: 'them',  text: 'Thanks!', time: '11:52 AM' },
                ] } },
    ],
    summary: {
      headline: "auto-approved Jordan K. ↔ Ashley P.'s Thursday swap",
      outcome: 'Swap approved and confirmed in 43 seconds.',
      duration: '43s',
      manual:   '1–2 days',
      saved:    '~2 days',
    },
    dataChanges: [
      { field: 'Thursday 7pm usher · Civic Arena',
        before: { name: 'Jordan K.', avatar: JORDAN.avatar },
        after:  { name: 'Ashley P.', avatar: ASHLEY.avatar } },
    ],
    conversations: [
      { id: 'ashley-sms', kind: 'sms', contact: 'Ashley P.',
        summary: '2 messages',
        phone: '+1 (415) 555-0129',
        messages: [
          { from: 'agent', text: 'Your swap with Jordan on Thursday is approved. New shift: Thurs 7p–3a at Civic Arena.', time: '11:49 AM' },
          { from: 'them',  text: 'Thanks!', time: '11:52 AM' },
        ],
      },
    ],
    workflow: { id: 'nova-swaps', label: 'Shift swaps · Auto-approve', url: '#' },
  },

  'reminders': {
    type: 'batch',
    title: 'Saturday 5am Reminder Batch',
    subtitle: 'Harbor Theater load-in',
    status: { label: '4 of 6 confirmed', tone: 'info' },
    fields: [
      { label: 'Shift',       value: 'Saturday · 5:00 AM · Harbor Theater' },
      { label: 'Venue',       value: LINK_VENUE_HARBOR },
      { label: 'Reminded',    value: '6 staff' },
      { label: 'Confirmed',   value: '4' },
      { label: 'Read',        value: '6 (100%)' },
      { label: 'Follow-up',   value: '9pm auto-nudge for 2 unconfirmed' },
      { label: 'Batch ID',    value: 'REM-04-0425-05' },
    ],
    activity: [
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'pulled Saturday 5am roster — 6 staff, Harbor Theater load-in', time: '34 min ago' },
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'drafted reminder copy + YES/NO reply mapping',                 time: '+3s' },
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'sent reminders to 6 staff via SMS',                             time: '+5s',
        comm: { type: 'sms', contact: '6 workers',
                messages: [{ from: 'agent', text: 'Reminder: your shift starts at 5am tomorrow at Harbor Theater. Reply Y to confirm.', time: '4:26 PM' }] } },
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'scheduled 9pm auto-nudge for anyone still unconfirmed',         time: '+6s' },
      { kind: 'user',  actor: 'Jordan K.', avatar: JORDAN.avatar, verb: 'confirmed (read)',                                    time: '+3m 12s' },
      { kind: 'user',  actor: 'Ashley P.', avatar: ASHLEY.avatar, verb: 'confirmed (read)',                                    time: '+6m 04s' },
      { kind: 'user',  actor: 'Marcus J.',                        verb: 'confirmed (read)',                                    time: '+9m 47s' },
      { kind: 'user',  actor: 'Priya S.',                         verb: 'confirmed (read)',                                    time: '+11m 22s' },
      { kind: 'agent', agentId: 'sofia', actor: 'Sofia', verb: 'monitoring — 4 of 6 confirmed, 2 still pending',               time: '+14m' },
    ],
    summary: {
      headline: 'sent shift reminders to 6 staff for Saturday load-in',
      outcome: '6 reminders sent, 4 confirmed in under 15 minutes.',
      duration: '14 min',
      manual:   '3–4 hrs',
      saved:    '~3.5 hrs',
    },
    dataChanges: [
      { field: 'Saturday 5am · Harbor Theater · Reminder batch',
        before: { value: '0 of 6 confirmed' },
        after:  { value: '4 of 6 confirmed' } },
    ],
    conversations: [
      { id: 'batch-sms', kind: 'sms', contact: '6 workers',
        summary: '1 outbound · 4 replies',
        messages: [
          { from: 'agent', text: 'Reminder: your shift starts at 5am tomorrow at Harbor Theater. Reply Y to confirm.', time: '4:26 PM' },
          { from: 'them',  text: 'Y (Jordan K.)',  time: '4:29 PM' },
          { from: 'them',  text: 'Y (Ashley P.)',  time: '4:32 PM' },
          { from: 'them',  text: 'Y (Marcus J.)',  time: '4:36 PM' },
          { from: 'them',  text: 'Y (Priya S.)',   time: '4:37 PM' },
        ],
      },
    ],
    workflow: { id: 'sofia-reminders', label: 'Shift reminders · Batch', url: '#' },
  },
}

function applyRecord(card) {
  const rec = EVENTS_RECORDS[card.id]
  return rec ? { ...card, record: rec } : card
}

if (INDUSTRY_DATA.events.activeCard) {
  INDUSTRY_DATA.events.activeCard = applyRecord(INDUSTRY_DATA.events.activeCard)
}
INDUSTRY_DATA.events.feed     = INDUSTRY_DATA.events.feed.map(applyRecord)
INDUSTRY_DATA.events.needsYou = INDUSTRY_DATA.events.needsYou.map(applyRecord)
