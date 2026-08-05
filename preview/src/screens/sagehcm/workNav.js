import {
  WorkIcon, TimeIcon, PayIcon, PeopleIcon, ResourcesIcon,
} from './icons.jsx'
import { Home02Icon }      from '../../../../src/components/icons/Home02Icon.tsx'
import { GitBranch01Icon } from '../../../../src/components/icons/GitBranch01Icon.tsx'
import { SettingsGearIcon } from '../../../../src/components/icons/SettingsGearIcon.tsx'

/*
 * Teambridge's information architecture, re-expressed in Sage's rail
 * idiom (top-level entries that expand into sub-items). The ids are the
 * Act1Dashboard view ids verbatim, so the rail drives the embedded
 * product directly — no translation layer, no second nav.
 */
export const WORK_NAV = [
  { id: 'overview', label: 'Home', Icon: Home02Icon },
  {
    id: 'scheduling',
    label: 'Scheduling',
    Icon: WorkIcon,
    defaultExpanded: true,
    children: [
      { id: 'schedule',       label: 'Schedule' },
      { id: 'shift-requests', label: 'Requests' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    Icon: PeopleIcon,
    children: [
      { id: 'people',     label: 'People' },
      { id: 'onboarding', label: 'Onboarding' },
      { id: 'engage',     label: 'Engage' },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    Icon: TimeIcon,
    children: [
      { id: 'time-tracking', label: 'Tracking' },
      { id: 'timesheets',    label: 'Timesheets' },
    ],
  },
  {
    id: 'pay-group',
    label: 'Pay',
    Icon: PayIcon,
    children: [
      { id: 'pay',    label: 'Payroll' },
      { id: 'review', label: 'Review' },
    ],
  },
  { id: 'workflows', label: 'Agents',   Icon: GitBranch01Icon },
  { id: 'policies',  label: 'Policies', Icon: ResourcesIcon },
  { id: 'settings',  label: 'Settings', Icon: SettingsGearIcon },
]

/** Every id the rail can actually route to (groups are toggles, not views). */
export const WORK_VIEWS = new Set([
  'overview', 'schedule', 'shift-requests', 'people', 'onboarding', 'engage',
  'time-tracking', 'timesheets', 'pay', 'review', 'workflows', 'policies', 'settings',
])

/** The rail entry a given view should light up, plus its parent group. */
export function expandedForView(view) {
  const group = WORK_NAV.find(item =>
    item.children?.some(child => child.id === view))
  return group?.id ?? null
}
