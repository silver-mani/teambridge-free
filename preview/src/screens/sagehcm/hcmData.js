import {
  TimeIcon, PayIcon, BenefitsIcon, LearningIcon, PerformanceIcon,
  RecruitingIcon, CareerIcon, EmploymentIcon, PersonalInfoIcon,
  CalendarIcon, ResourcesIcon, SelfServiceIcon,
} from './icons.jsx'
import { Home02Icon } from '../../../../src/components/icons/Home02Icon.tsx'

/*
 * Sage HCM Self Service — the surface a Sage customer already lives in.
 * We rebuild it faithfully so the Work module has something real to be
 * embedded *into*: the vision only lands if the host product looks like
 * the host product.
 *
 * The operator persona is deliberately an ops leader at a multi-site
 * care group — a Sage HCM customer who also runs a large hourly
 * workforce, i.e. exactly the account where Work replaces Scheduling.
 */

export const HCM_USER = {
  name: 'Dana Whitfield',
  initials: 'DW',
  title: 'VP of Operations',
  org: 'Meridian Care Group',
}

export const SELF_SERVICE_NAV = [
  { id: 'home', label: 'Home', Icon: Home02Icon },
  {
    id: 'time',
    label: 'Time',
    Icon: TimeIcon,
    defaultExpanded: true,
    children: [
      { id: 'my-time-offs',     label: 'My Time Offs' },
      { id: 'my-timesheets',    label: 'My Timesheets' },
      { id: 'my-commissions',   label: 'My Commissions' },
      { id: 'my-schedule',      label: 'My Schedule' },
      { id: 'team-time-offs',   label: 'Team Time Offs' },
      { id: 'team-timesheets',  label: 'Team Timesheets' },
      { id: 'team-attendance',  label: 'Team Attendance' },
      { id: 'team-schedule',    label: 'Team Schedule' },
      { id: 'whos-working',     label: "Who's Working" },
    ],
  },
  { id: 'pay',           label: 'Pay',           Icon: PayIcon,          children: [] },
  { id: 'benefits',      label: 'Benefits',      Icon: BenefitsIcon,     children: [] },
  { id: 'learning',      label: 'Learning',      Icon: LearningIcon,     children: [] },
  { id: 'performance',   label: 'Performance',   Icon: PerformanceIcon,  children: [] },
  { id: 'recruiting',    label: 'Recruiting',    Icon: RecruitingIcon,   children: [] },
  { id: 'career',        label: 'Career',        Icon: CareerIcon,       children: [] },
  { id: 'employment',    label: 'Employment',    Icon: EmploymentIcon,   children: [] },
  { id: 'personal-info', label: 'Personal Info', Icon: PersonalInfoIcon, children: [] },
  { id: 'calendar',      label: 'Calendar',      Icon: CalendarIcon,     children: [] },
  { id: 'resources',     label: 'Resources',     Icon: ResourcesIcon,    children: [] },
]

export const MY_TASKS = [
  { id: 'assignment', label: 'Assignment',         count: 1 },
  { id: 'review',     label: 'Performance Review',  count: 1 },
]

export const TIME_OFF = [
  { label: 'Sick Leave, Family Leave…', used: 0, total: 40 },
  { label: 'Paid Time Off',             used: 0, total: 187.31 },
]

export const EXTERNAL_LINKS = [
  'API Information',
  'Company Directory',
  'Company Videos',
  'Benefits — FAQs',
  'Forms: Health & Safety',
  'Status and Status Card Application',
]

/*
 * The engagement feed. One post is authored by Sage Work itself — that's
 * how an existing Sage customer finds out the module is live, inside the
 * surface they already read every morning. It is the on-ramp into the
 * whole Teambridge experience.
 */
export const FEED = [
  {
    id: 'work-launch',
    kind: 'work',
    time: 'Today · 06:04 am',
    author: 'Sage Work',
    tag: 'Workforce',
    headline: 'Overnight coverage closed itself. 3 call-outs, 3 fills, zero escalations.',
    sub: 'Sage Work found credentialed replacements at Arrington, Wiggins, and Biloxi before the 6am handover. Average time to fill: 4 minutes.',
    cta: 'Open Sage Work',
    likes: 12,
    replies: 3,
  },
  {
    id: 'post-1',
    time: '08/04/2026 · 04:41 pm',
    author: 'Meara Carson',
    initials: 'MC',
    tag: 'Job Posting Announcements',
    headline: 'We are now accepting applications for the Weekend Charge Nurse role.',
    link: 'Apply Here.',
    likes: 3,
    replies: 0,
  },
  {
    id: 'post-2',
    time: '08/01/2026 · 10:34 am',
    author: 'Meara Carson',
    initials: 'MC',
    tag: 'HR News',
    headline: 'Congratulate Rachel on 15 years with the company!',
    sub: 'Rachel Longworth started as a CNA at Gautier in 2011 and now runs our float pool across all six facilities.',
    likes: 41,
    replies: 6,
  },
  {
    id: 'post-3',
    time: '07/29/2026 · 03:57 pm',
    author: 'Shaun Littgow',
    initials: 'SL',
    tag: 'Global Announcements',
    headline: 'Upcoming Safe Patient Handling training:',
    link: 'Click Here to Register',
    likes: 8,
    replies: 2,
  },
  {
    id: 'post-4',
    time: '07/26/2026 · 06:48 am',
    author: 'Catherine Owens',
    initials: 'CO',
    tag: 'HR News',
    headline: 'Open enrollment closes Friday — confirm your elections.',
    sub: 'Everyone scheduled through Sage Work will get a reminder on their shift-start notification.',
    likes: 5,
    replies: 1,
  },
]

export const SURVEYS = [{ id: 's1', label: 'All Employee Survey' }]

/*
 * Notifications. The first two are pushed by Work — the module writes
 * into Sage's own notification stream rather than standing up a parallel
 * inbox, which is what "native" actually means here.
 */
export const NOTIFICATIONS = [
  { id: 'n1', date: '08/05/2026', text: 'Sage Work covered 3 overnight call-outs. No action needed.', source: 'work' },
  { id: 'n2', date: '08/05/2026', text: 'Overtime is trending 8% under plan across all six facilities.', source: 'work' },
  { id: 'n3', date: '08/05/2026', text: 'Deborah Hunsley celebrates a birthday today!' },
  { id: 'n4', date: '08/03/2026', text: 'Eric Jones celebrates a work anniversary of 4 years with us!' },
  { id: 'n5', date: '08/02/2026', text: 'William Lowe celebrates a birthday today!' },
]

/*
 * Who's Working is the clearest small proof of the integration: it is a
 * Sage HCM widget, but every row is live Work data.
 */
export const WHOS_WORKING = [
  {
    role: 'CNA',
    people: [
      { name: 'Jasmine Abney',   loc: 'George Regional Health', hrs: '7:19p – 7:30a' },
      { name: 'Shonda Hartzog',  loc: 'Wiggins Community Home', hrs: '5:04p – 10:00p' },
    ],
  },
  {
    role: 'LPN',
    people: [
      { name: 'Sierra Barnes',   loc: 'Arrington Living Center', hrs: '7:17a – 7:00p' },
    ],
  },
]
