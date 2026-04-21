/* ─────────────────────────────────────────────────────────────────────────────
   Industry dummy data for Act 1
   One record per industry. Each record carries:
   - label            : Human-readable industry name for the header
   - workerNoun       : Industry-appropriate noun (nurse / guard / crew member…)
   - activeCard       : The in-progress cancellation card (always index 0)
   - feed             : Five additional activity cards, newest first
   - drillIn          : Reasoning script shown after the active card is clicked
   Copy avoids em-dashes per direction.
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
    { name: 'Janelle R.', meta: '2.3 mi · Framing lead, 32 hrs',     winner: true  },
    { name: 'David K.',   meta: '3.6 mi · Framer, 28 hrs',           winner: false },
    { name: 'Priya S.',   meta: '4.9 mi · Carpenter apprentice, 24', winner: false },
  ],
}

function buildIndustry({
  id, label, workerNoun, venueNoun,
  activeLocation, shiftNoun,
  credentialCard,
  offerReason,
}) {
  const matches = MATCH_TEMPLATE[id]
  const winner = matches.find(m => m.winner)

  return {
    id,
    label,
    workerNoun,

    activeCard: {
      id: 'active-cancellation',
      status: 'in-progress',
      statusLabel: 'In progress',
      timestamp: 'Now',
      title: `Shift cancellation at ${activeLocation}, 7pm`,
      description: `Marcus T. cancelled his ${shiftNoun} with 4 hours notice. Finding replacement.`,
    },

    feed: [
      {
        id: 'swaps',
        status: 'resolved',
        statusLabel: 'Resolved',
        timestamp: '12 min ago',
        title: '2 shift swap requests auto approved',
        description: 'Checked credentials, hours, and overtime. Both approved automatically.',
      },
      {
        id: 'gaps',
        status: 'monitoring',
        statusLabel: 'Monitoring',
        timestamp: 'Live',
        title: '3 potential gaps opening this weekend',
        description: `2 ${workerNoun}s approaching call out pattern. Flagging for early action.`,
      },
      {
        id: 'overtime',
        status: 'watching',
        statusLabel: 'Watching',
        timestamp: 'Live',
        title: `4 ${workerNoun}s approaching weekly overtime limit`,
        description: 'Proactive alert before a scheduling conflict occurs.',
      },
      {
        id: 'reminders',
        status: 'sent',
        statusLabel: 'Sent',
        timestamp: '34 min ago',
        title: `Shift reminders sent to 6 ${workerNoun}s`,
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
          title: `Searching qualified ${workerNoun}s available tonight...`,
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
    venueNoun: 'facility',
    activeLocation: 'Memorial North',
    shiftNoun: 'ICU shift',
    offerReason: 'Closest match. 2.1 miles away. 32 hours this week, under the overtime threshold.',
    credentialCard: {
      id: 'credential',
      status: 'resolved',
      statusLabel: 'Resolved',
      timestamp: '1 hr ago',
      title: 'Credential check completed for new hire',
      description: 'Sarah M. cleared. First shift Monday at Memorial South.',
    },
  }),

  staffing: buildIndustry({
    id: 'staffing',
    label: 'Staffing',
    workerNoun: 'contractor',
    venueNoun: 'client site',
    activeLocation: 'Stellar Events',
    shiftNoun: 'per diem shift',
    offerReason: 'Closest match. 1.9 miles away. 28 hours this week, 3 prior placements at this client.',
    credentialCard: {
      id: 'credential',
      status: 'resolved',
      statusLabel: 'Resolved',
      timestamp: '1 hr ago',
      title: 'Client site onboarding completed',
      description: 'Sarah M. cleared for Meridian Healthcare. First placement Monday.',
    },
  }),

  events: buildIndustry({
    id: 'events',
    label: 'Events & Venues',
    workerNoun: 'staff member',
    venueNoun: 'venue',
    activeLocation: 'Civic Arena',
    shiftNoun: 'usher shift',
    offerReason: 'Closest match. 1.7 miles away. Worked 4 events this month, high guest rating.',
    credentialCard: {
      id: 'credential',
      status: 'resolved',
      statusLabel: 'Resolved',
      timestamp: '1 hr ago',
      title: 'Event certification completed for new hire',
      description: 'Sarah M. cleared for alcohol service. First event Saturday.',
    },
  }),

  security: buildIndustry({
    id: 'security',
    label: 'Security',
    workerNoun: 'guard',
    venueNoun: 'post',
    activeLocation: 'Corporate Campus A',
    shiftNoun: 'overnight patrol',
    offerReason: 'Closest match. 2.4 miles away. Armed post certified, 30 hours this week.',
    credentialCard: {
      id: 'credential',
      status: 'resolved',
      statusLabel: 'Resolved',
      timestamp: '1 hr ago',
      title: 'Guard license verified for new hire',
      description: 'Sarah M. licensed and cleared. First post Monday at North Gate.',
    },
  }),

  'light-industrial': buildIndustry({
    id: 'light-industrial',
    label: 'Light Industrial',
    workerNoun: 'associate',
    venueNoun: 'facility',
    activeLocation: 'DC East Warehouse',
    shiftNoun: 'pick and pack shift',
    offerReason: 'Closest match. 1.8 miles away. Forklift certified, 30 hours this week, under overtime.',
    credentialCard: {
      id: 'credential',
      status: 'resolved',
      statusLabel: 'Resolved',
      timestamp: '1 hr ago',
      title: 'Forklift certification verified',
      description: 'Sarah M. cleared for DC East. First shift Monday.',
    },
  }),

  construction: buildIndustry({
    id: 'construction',
    label: 'Construction',
    workerNoun: 'crew member',
    venueNoun: 'job site',
    activeLocation: '5th and Main site',
    shiftNoun: 'framing shift',
    offerReason: 'Closest match. 2.3 miles away. Framing lead, 32 hours this week, under overtime.',
    credentialCard: {
      id: 'credential',
      status: 'resolved',
      statusLabel: 'Resolved',
      timestamp: '1 hr ago',
      title: 'OSHA 30 verified for new hire',
      description: 'Sarah M. cleared for 5th and Main. First shift Monday.',
    },
  }),
}

export function getIndustryData(id) {
  return INDUSTRY_DATA[id] ?? INDUSTRY_DATA.healthcare
}
