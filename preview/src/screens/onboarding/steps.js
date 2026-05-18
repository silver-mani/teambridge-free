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

