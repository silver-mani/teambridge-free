/* Step definitions for the guided onboarding flow. Each step is one
 * "turn" in the Nova chat: a prompt the AI says, plus the
 * answer affordance presented under it. The answer field gets persisted
 * onto the running `answers` object that drives the right-side preview.
 *
 * Keep prompts short and conversational — copy reads aloud, not as
 * form labels. The validator only fires for free-text inputs; choice
 * inputs are validated structurally. */

import { INDUSTRIES } from '../IndustrySelector.jsx'

export const TEAM_SIZE_OPTIONS = [
  { id: '1-25',    label: '1 – 25',    detail: 'Small team',    headcount: 18  },
  { id: '26-100',  label: '26 – 100',  detail: 'Growing crew',  headcount: 64  },
  { id: '101-500', label: '101 – 500', detail: 'Multi-location', headcount: 240 },
  { id: '500+',    label: '500+',      detail: 'Enterprise',    headcount: 820 },
]

export const LOCATION_OPTIONS = [
  { id: 'single',         label: 'A single site or location' },
  { id: 'multi-local',    label: 'A few sites, same region' },
  { id: 'multi-regional', label: 'Many sites, multiple regions' },
]

export const PAIN_OPTIONS = [
  { id: 'coverage',   label: 'Last-minute shift coverage' },
  { id: 'overtime',   label: 'Overtime creeping up' },
  { id: 'onboarding', label: 'Onboarding new hires' },
  { id: 'compliance', label: 'Credentials & compliance' },
  { id: 'comms',      label: 'Reaching the right people' },
  { id: 'scheduling', label: 'Building the schedule' },
]

/* Map a pain to the agent that handles it — the preview surfaces these
 * as "recommended agents" once the user picks their pains. */
export const PAIN_TO_AGENT = {
  coverage:   { name: 'Last-minute Replacement',  detail: 'Auto-fills cancellations in minutes.' },
  overtime:   { name: 'OT Cap Auto-Replace',      detail: 'Flips assignments before OT hits.'   },
  onboarding: { name: 'Onboarding Auto-Advance',  detail: 'Moves new hires through ATS stages.' },
  compliance: { name: 'Credential Watch',         detail: 'Flags expirations 30 days out.'      },
  comms:      { name: 'Smart Notify',             detail: 'Routes messages by role + shift.'    },
  scheduling: { name: 'Schedule Builder',         detail: 'Drafts the week from last week.'     },
}

/* Map a pain to a Teambridge AI persona (Nova, Atlas, Iris, Leo, Sofia).
 * These personas have animated avatar GIFs in /public/agents/ — used
 * across the build flow's agent rows to give each one a face.
 *   - Nova   = Schedule Coordinator     (covers schedule + scheduling)
 *   - Atlas  = Workforce Forecaster     (covers OT)
 *   - Sofia  = People Ops Agent         (covers onboarding)
 *   - Iris   = Credentialing Agent      (covers compliance)
 *   - Leo    = Comms / Notify Agent     (covers comms)
 */
export const PAIN_TO_PERSONA = {
  coverage:   'nova',
  overtime:   'atlas',
  onboarding: 'sofia',
  compliance: 'iris',
  comms:      'leo',
  scheduling: 'nova',
}

/* Outcome-style questions the operator answers right after research.
 * Multi-select. The chosen outcomes drive which agents we
 * pre-recommend later (OUTCOME_TO_AGENTS). */
export const OUTCOME_OPTIONS = [
  { id: 'sites',       label: 'A single place to manage all my locations' },
  { id: 'compliance',  label: 'Reduce compliance risks and overtime' },
  { id: 'scheduling',  label: 'Schedule my team smarter' },
  { id: 'coverage',    label: 'Cover shifts faster when people drop' },
  { id: 'onboarding',  label: 'Onboard new hires faster' },
  { id: 'comms',       label: 'Reach my team without chasing texts' },
]

export const OUTCOME_TO_AGENTS = {
  sites:      [],
  compliance: ['compliance', 'overtime'],
  scheduling: ['scheduling'],
  coverage:   ['coverage'],
  onboarding: ['onboarding'],
  comms:      ['comms'],
}

/* Labor policies surfaced on the policies-pick step, keyed by state.
 * Distilled from teambridge.com/compliance — common state policies
 * across CA / NY / OR / WA / IL / etc., plus a federal baseline.
 * `category` drives the icon + accent color on the policy card. */
export const POLICY_OPTIONS = [
  { id: 'daily-ot',   category: 'overtime',  label: 'Daily overtime after 8 hrs',           detail: 'Track and flag shifts hitting daily OT thresholds.' },
  { id: 'weekly-ot',  category: 'overtime',  label: 'Weekly overtime after 40 hrs',         detail: 'FLSA federal standard. Flag before week closes.' },
  { id: 'meal-rest',  category: 'breaks',    label: 'Meal & rest break enforcement',        detail: 'Auto-insert breaks based on shift length.' },
  { id: 'sick-leave', category: 'pay',       label: 'Paid sick leave accrual',              detail: 'Accrue hours per worked hour, by state rate.' },
  { id: 'predictive', category: 'scheduling', label: 'Predictive (fair workweek) scheduling', detail: 'Post schedules 14 days ahead; pay premiums on changes.' },
  { id: 'spread-hrs', category: 'pay',       label: 'Spread of hours premium',              detail: 'Pay extra hour at minimum wage when spread exceeds 10 hrs.' },
  { id: 'day-rest',   category: 'scheduling', label: 'One day of rest in seven',            detail: 'Block 7-day-on schedules without consent.' },
  { id: 'final-pay',  category: 'pay',       label: 'Same-day final pay on termination',    detail: 'Auto-cut final paycheck on separation.' },
  { id: 'minor-work', category: 'workforce', label: 'Minor work-hour limits',               detail: 'Cap hours for under-18 workers, school nights.' },
]

/* Which policies typically apply per state. '*' is federal baseline. */
export const POLICIES_BY_STATE = {
  '*': ['weekly-ot', 'minor-work'],
  CA:  ['daily-ot', 'meal-rest', 'sick-leave', 'predictive', 'final-pay'],
  NY:  ['sick-leave', 'spread-hrs', 'day-rest', 'predictive', 'final-pay'],
  OR:  ['meal-rest', 'sick-leave', 'predictive', 'final-pay'],
  WA:  ['meal-rest', 'sick-leave', 'predictive'],
  IL:  ['day-rest', 'predictive', 'sick-leave'],
  TX:  ['weekly-ot'],
  AZ:  ['sick-leave'],
  MA:  ['sick-leave', 'final-pay', 'day-rest'],
  NJ:  ['sick-leave', 'predictive'],
  CO:  ['meal-rest', 'sick-leave', 'daily-ot'],
  NV:  ['daily-ot', 'sick-leave'],
  CT:  ['sick-leave', 'predictive'],
  MD:  ['sick-leave'],
  PA:  ['sick-leave'],
  GA:  ['weekly-ot'],
  FL:  ['weekly-ot'],
  VA:  ['sick-leave'],
}

export const CONNECTOR_OPTIONS = [
  { id: 'gusto',       label: 'Gusto',           category: 'Payroll',     accent: 'orange' },
  { id: 'adp',         label: 'ADP',             category: 'Payroll',     accent: 'matcha' },
  { id: 'rippling',    label: 'Rippling',        category: 'HR + Payroll', accent: 'azure' },
  { id: 'justworks',   label: 'Justworks',       category: 'PEO',         accent: 'green'  },
  { id: 'bamboohr',    label: 'BambooHR',        category: 'HRIS',        accent: 'matcha' },
  { id: 'workday',     label: 'Workday',         category: 'HRIS',        accent: 'blue'   },
  { id: 'quickbooks',  label: 'QuickBooks',      category: 'Accounting',  accent: 'green'  },
  { id: 'sage-intacct',label: 'Sage Intacct',    category: 'Accounting',  accent: 'matcha' },
  { id: 'slack',       label: 'Slack',           category: 'Comms',       accent: 'purple' },
  { id: 'msteams',     label: 'Microsoft Teams', category: 'Comms',       accent: 'azure'  },
]

export const ROSTER_OPTIONS = [
  { id: 'csv',  label: 'Upload a CSV',         detail: "We'll auto-map columns" },
  { id: 'hris', label: 'Sync from your HRIS',  detail: 'Live two-way connection' },
  { id: 'skip', label: 'Skip for now',         detail: 'You can do this later' },
]

export const STEPS = [
  {
    id: 'name',
    phase: 'chat-centric',
    prompt: () =>
      "Hi! I'm Nova, your Teambridge AI. I'll help you stand up your account in a couple of minutes, then stick around as you run it. What should I call you?",
    input: { kind: 'text', field: 'firstName', placeholder: 'e.g. Alex' },
    validate: v => (v.trim().length >= 2 ? null : 'Tell me your first name.'),
    transcript: a => `${a.firstName}.`,
    focus: 'overview',
  },
  {
    id: 'company',
    phase: 'chat-centric',
    prompt: a => `Nice to meet you, ${a.firstName}. What's your company called?`,
    input: { kind: 'text', field: 'company', placeholder: 'e.g. Cascade Health' },
    validate: v => (v.trim().length >= 2 ? null : 'A company name helps me set things up.'),
    transcript: a => a.company,
    focus: 'overview',
  },
  {
    id: 'industry',
    phase: 'chat-centric',
    prompt: a => `Got it — setting up ${a.company}. Which industry best describes your work?`,
    input: {
      kind: 'choice',
      field: 'industry',
      options: INDUSTRIES.map(i => ({ id: i.id, label: i.name, detail: i.description })),
      columns: 2,
    },
    transcript: a => INDUSTRIES.find(i => i.id === a.industry)?.name ?? a.industry,
    focus: 'overview',
  },

  /* Batched setup card — three chip groups in one Nova message, with
   * a single Skip/Continue at the bottom. Pattern matches the Claude
   * for SMBs onboarding card. */
  {
    id: 'team-shape',
    phase: 'chat-centric',
    title: 'Set up your team shape',
    prompt: () => "A few quick details and I'll have enough to start building.",
    input: {
      kind: 'batched',
      groups: [
        {
          label: 'How many people work shifts?',
          kind: 'choice', field: 'teamSize',
          options: TEAM_SIZE_OPTIONS,
        },
        {
          label: 'Where do they work?',
          kind: 'choice', field: 'locationModel',
          options: LOCATION_OPTIONS,
        },
        {
          label: "What's slowing you down most? Pick up to 3.",
          kind: 'multichoice', field: 'pains',
          options: PAIN_OPTIONS, max: 3, optional: true,
        },
      ],
    },
    transcript: a => {
      const ts = TEAM_SIZE_OPTIONS.find(o => o.id === a.teamSize)?.label
      const loc = LOCATION_OPTIONS.find(o => o.id === a.locationModel)?.label
      const pains = (a.pains || []).map(p => PAIN_OPTIONS.find(o => o.id === p)?.label).filter(Boolean)
      const parts = []
      if (ts) parts.push(ts)
      if (loc) parts.push(loc.toLowerCase())
      if (pains.length) parts.push(`${pains.length} pain${pains.length === 1 ? '' : 's'}`)
      return parts.join(' · ') || 'Skip'
    },
    focus: 'people',
  },

  {
    id: 'connectors',
    phase: 'chat-centric',
    prompt: () =>
      "Which tools should I talk to? Pick anything you use today — I'll keep data flowing in automatically.",
    input: { kind: 'connectors', field: 'connectors', options: CONNECTOR_OPTIONS, optional: true },
    transcript: a => {
      const labels = (a.connectors || []).map(c => CONNECTOR_OPTIONS.find(o => o.id === c)?.label).filter(Boolean)
      return labels.length ? `Connected ${labels.length}: ${labels.join(', ')}` : 'No tools yet'
    },
    focus: 'integrations',
  },

  /* ── Pivot point. From here on we render the full DashboardShell. ── */

  {
    id: 'roster',
    phase: 'full',
    prompt: () => "Last thing: want to bring your roster over now, or set that up later?",
    input: { kind: 'choice', field: 'rosterChoice', options: ROSTER_OPTIONS, columns: 1 },
    transcript: a => ROSTER_OPTIONS.find(o => o.id === a.rosterChoice)?.label ?? a.rosterChoice,
    focus: 'people',
  },
  {
    id: 'done',
    phase: 'full',
    prompt: a =>
      `That's everything I need, ${a.firstName}. Your Teambridge is live — take a look around, and I'll keep working in the background.`,
    input: { kind: 'done' },
    transcript: () => null,
    focus: 'overview',
  },
]

