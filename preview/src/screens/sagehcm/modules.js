import {
  PeopleIcon, PayrollIcon, RecruitingIcon, WorkIcon, SelfServiceIcon,
} from './icons.jsx'

/*
 * The Sage HCM product switcher.
 *
 * This list is the whole vision in one object: today Sage ships
 * HR / Payroll / Recruiting / Scheduling / Self Service. In the
 * Teambridge world, **Scheduling is replaced by Work** — a full
 * workforce-management module, not a calendar bolt-on — and the
 * customer never sees a second vendor.
 */
export const SAGE_MODULES = [
  { id: 'hr',           label: 'HR',           Icon: PeopleIcon,       route: null },
  { id: 'payroll',      label: 'Payroll',      Icon: PayrollIcon,      route: null },
  { id: 'recruiting',   label: 'Recruiting',   Icon: RecruitingIcon,   route: null },
  // Replaces the old "Scheduling" entry.
  { id: 'work',         label: 'Work',         Icon: WorkIcon,         route: '/sage-hcm/work', isNew: true },
  { id: 'self-service', label: 'Self Service', Icon: SelfServiceIcon,  route: '/sage-hcm' },
]

export function getModule(id) {
  return SAGE_MODULES.find(m => m.id === id) ?? SAGE_MODULES[4]
}
