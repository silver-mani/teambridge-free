import { useEffect, useState } from 'react'
import './sagehcm.css'
import './sagework.css'
import SageHcmChrome from './SageHcmChrome.jsx'
import Act1Dashboard from '../Act1Dashboard.jsx'
import { HCM_USER } from './hcmData.js'
import { WORK_NAV, WORK_VIEWS, expandedForView } from './workNav.js'

/* ──────────────────────────────────────────────────────────────────────
 * Sage Work — Teambridge, white-labelled, inside Sage HCM.
 *
 * The whole product runs here unchanged: the same schedule, the same
 * people table, the same always-on agent panel. What changes is the
 * frame and the palette. Sage's top bar and module rail stay exactly
 * where they were in Self Service, Teambridge's own left nav is
 * suppressed (its IA moved into Sage's rail — see workNav.js), and the
 * AI accent is remapped from Teambridge purple to Sage green in
 * sagework.css.
 *
 * The result is the thing the vision is actually arguing for: a customer
 * clicks Work in the Sage switcher and never leaves Sage.
 * ────────────────────────────────────────────────────────────────────── */

const INDUSTRY = 'healthcare'

export default function SageWork({ view = 'overview', onNavigate = () => {}, onSelectView }) {
  const safeView = WORK_VIEWS.has(view) ? view : 'overview'

  // The rail highlights the leaf view; its parent group needs to be open
  // for that highlight to be visible on a deep link.
  const [railNav, setRailNav] = useState(() => withExpanded(WORK_NAV, expandedForView(safeView)))
  useEffect(() => {
    setRailNav(withExpanded(WORK_NAV, expandedForView(safeView)))
  }, [safeView])

  const selectView = (id) => {
    if (!WORK_VIEWS.has(id)) return   // group headers only toggle
    onSelectView?.(id)
  }

  return (
    <SageHcmChrome
      moduleId="work"
      railItems={railNav}
      activeItem={safeView}
      onSelectItem={selectView}
      onNavigate={onNavigate}
      user={HCM_USER}
      bare
    >
      <Act1Dashboard
        industryId={INDUSTRY}
        view={safeView}
        sageMode
        hideNav
        onBack={() => onNavigate('/sage-hcm')}
        /* No `onBackToIntacct` — that CTA belongs to the Sage Intacct
           story. Here the way back to the rest of Sage is the module
           switcher, same as every other Sage module. */
        onSelectView={selectView}
        onExplore={() => {}}
      />
    </SageHcmChrome>
  )
}

/** Mark one group as default-expanded without mutating the shared config. */
function withExpanded(nav, groupId) {
  if (!groupId) return nav
  return nav.map(item =>
    item.id === groupId ? { ...item, defaultExpanded: true } : item)
}
