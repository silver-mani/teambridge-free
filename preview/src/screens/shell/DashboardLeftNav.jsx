import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { Home02Icon } from '../../../../src/components/icons/Home02Icon.tsx'
import { Users03Icon } from '../../../../src/components/icons/Users03Icon.tsx'
import { PuzzlePiece01Icon } from '../../../../src/components/icons/PuzzlePiece01Icon.tsx'
import { MessageDotsSquareIcon } from '../../../../src/components/icons/MessageDotsSquareIcon.tsx'
import { Grid01Icon } from '../../../../src/components/icons/Grid01Icon.tsx'
import { ArrowCircleBrokenRightIcon } from '../../../../src/components/icons/ArrowCircleBrokenRightIcon.tsx'
import { Map01Icon } from '../../../../src/components/icons/Map01Icon.tsx'
import { ClockIcon } from '../../../../src/components/icons/ClockIcon.tsx'
import { CurrencyDollarCircleIcon } from '../../../../src/components/icons/CurrencyDollarCircleIcon.tsx'
import { ClipboardCheckIcon } from '../../../../src/components/icons/ClipboardCheckIcon.tsx'
import { GitBranch01Icon } from '../../../../src/components/icons/GitBranch01Icon.tsx'
import { BookOpen01Icon } from '../../../../src/components/icons/BookOpen01Icon.tsx'
import { SettingsGearIcon } from '../../../../src/components/icons/SettingsGearIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * DashboardLeftNav — extracted from Act1Dashboard.LeftNav.
 *
 * The vertical nav rail that sits in column 1 of the dashboard grid.
 * Renders a brand header (Teambridge + industry label), grouped nav
 * sections, and a flush-bottom Admin group. Used by both the build
 * flow (where many items render dimmed/locked until enough setup has
 * happened to make them meaningful) and eventually by Act1 itself
 * once we migrate it onto the shared shell.
 *
 * Items can be marked `locked: true` to render dimmed + non-clickable,
 * which the build flow uses to show the operator what's coming
 * without letting them poke at half-built surfaces.
 * ────────────────────────────────────────────────────────────────────── */

export const DEFAULT_NAV_GROUPS = [
  {
    label: null,
    items: [{ id: 'overview', label: 'Home', Icon: Home02Icon }],
  },
  {
    label: 'Team',
    items: [
      { id: 'people',     label: 'People',     Icon: Users03Icon },
      { id: 'onboarding', label: 'Onboarding', Icon: PuzzlePiece01Icon },
      { id: 'engage',     label: 'Engage',     Icon: MessageDotsSquareIcon },
    ],
  },
  {
    label: 'Schedule',
    items: [
      { id: 'schedule',       label: 'Full Schedule',  Icon: Grid01Icon },
      { id: 'shift-requests', label: 'Shift Requests', Icon: ArrowCircleBrokenRightIcon },
    ],
  },
  {
    label: 'Time Tracking',
    items: [
      { id: 'time-tracking', label: 'Live Tracking', Icon: Map01Icon },
      { id: 'timesheets',    label: 'Timesheets',    Icon: ClockIcon },
    ],
  },
  {
    label: 'Pay',
    items: [
      { id: 'pay',    label: 'Payroll', Icon: CurrencyDollarCircleIcon },
      { id: 'review', label: 'Review',  Icon: ClipboardCheckIcon },
    ],
  },
]

export const DEFAULT_NAV_BOTTOM = {
  label: 'Admin',
  items: [
    { id: 'workflows', label: 'Agent Workflows', Icon: GitBranch01Icon },
    { id: 'policies',  label: 'Policy Builder',  Icon: BookOpen01Icon },
    { id: 'settings',  label: 'Settings',        Icon: SettingsGearIcon },
  ],
}

function formatToday() {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function DashboardLeftNav({
  industryLabel = 'Workspace',
  view,
  navGroups = DEFAULT_NAV_GROUPS,
  navBottom = DEFAULT_NAV_BOTTOM,
  onBrand,
  onSelectView,
  hideBrand = false,
  mobileOpen = false,
  showFootDate = true,
}) {
  const renderItem = (item) => {
    const locked = !!item.locked
    const active = !locked && item.id === view
    return (
      <button
        key={item.id}
        type="button"
        className={[
          'act1-nav-item',
          active ? 'act1-nav-item-active' : '',
          locked ? 'act1-nav-item-locked' : '',
        ].filter(Boolean).join(' ')}
        onClick={() => !locked && onSelectView?.(item.id)}
        aria-current={active ? 'page' : undefined}
        aria-disabled={locked || undefined}
        disabled={locked}
      >
        <span className="act1-nav-icon" aria-hidden="true">
          <item.Icon size={18} />
        </span>
        <span className="act1-nav-label">{item.label}</span>
      </button>
    )
  }
  const renderGroup = (group, key) => (
    <div className="act1-nav-group" key={key}>
      {group.label && <div className="act1-nav-group-label">{group.label}</div>}
      {group.items.map(renderItem)}
    </div>
  )

  return (
    <aside className={`act1-nav ${mobileOpen ? 'is-mobile-open' : ''}`} aria-label="Primary">
      {!hideBrand && (
        <button
          type="button"
          className="act1-nav-brand"
          onClick={onBrand}
          aria-label="Change industry"
        >
          <span className="act1-nav-brandmark">
            <TeambridgeAIIcon size={16} />
          </span>
          <span className="act1-nav-brandtext">
            <span className="act1-nav-brandname">Teambridge</span>
            <span className="act1-nav-brandindustry">{industryLabel}</span>
          </span>
        </button>
      )}

      <nav className="act1-nav-list">
        {navGroups.map((g, i) => renderGroup(g, `top-${i}`))}
        <div className="act1-nav-spacer" />
        {navBottom && renderGroup(navBottom, 'bottom')}
      </nav>

      {showFootDate && (
        <div className="act1-nav-foot">
          <span className="act1-nav-foot-date">{formatToday()}</span>
        </div>
      )}
    </aside>
  )
}
