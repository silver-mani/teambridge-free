import DashboardLeftNav, { DEFAULT_NAV_GROUPS, DEFAULT_NAV_BOTTOM } from './DashboardLeftNav.jsx'

/* ──────────────────────────────────────────────────────────────────────
 * DashboardShell — the layout chrome shared by build mode and (in a
 * follow-up) run mode (Act1Dashboard). Owns the grid composition,
 * mobile nav state plumbing, and slot positioning. Knows nothing
 * about the surfaces it hosts.
 *
 * Layout columns:
 *   col 1: LeftNav (240px) — collapsed to 0 in 'chat-prominent' mode
 *   col 2: chat panel (Nova, 460px on Home; 360px on other views)
 *   col 3: content + activity feed (1fr; activity feed shown on Home,
 *          becomes a drawer on other views)
 *
 * Modes:
 *   'chat-prominent' — pre-industry build state. LeftNav hidden, chat
 *                      centered + roomy, content slot shows a quiet
 *                      "workspace forming" hint. Same .act1-root grid
 *                      so the transition into 'full' animates smoothly.
 *   'full'           — standard 3-column layout. Used post-industry-pick
 *                      in build flow and (eventually) for run mode.
 * ────────────────────────────────────────────────────────────────────── */

export { DEFAULT_NAV_GROUPS, DEFAULT_NAV_BOTTOM }

export default function DashboardShell({
  mode = 'full',
  industryLabel,
  view = 'overview',
  navGroups,
  navBottom,
  onBrand,
  onSelectView,
  chat,
  content,
  activityFeed = null,
  showLeftNav = true,
  showChat = true,
  showActivityFeed = true,
  topBar = null,
}) {
  const rootClasses = [
    'act1-root',
    view && view !== 'overview' ? `act1-root--${view}` : '',
    mode === 'chat-prominent' ? 'ds-mode-prelude' : 'ds-mode-full',
  ].filter(Boolean).join(' ')

  return (
    <div className={rootClasses}>
      {topBar}

      {showLeftNav && mode !== 'chat-prominent' && (
        <DashboardLeftNav
          industryLabel={industryLabel}
          view={view}
          navGroups={navGroups}
          navBottom={navBottom}
          onBrand={onBrand}
          onSelectView={onSelectView}
        />
      )}

      {showChat && chat}

      {content}

      {showActivityFeed && activityFeed}
    </div>
  )
}
