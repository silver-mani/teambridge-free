import { useState } from 'react'
import SageShell      from './SageShell.jsx'
import Act1Dashboard  from '../Act1Dashboard.jsx'

/**
 * The deep integration moment: the user lands here from the CFO
 * dashboard's "Resolve OT Crisis" CTA. Sage chrome stays on top
 * (re-branded "Sage | Workforce"), and the entire Teambridge
 * experience — LeftNav, Schedule canvas, and chat panel — renders
 * underneath. `sageMode` flips Act1Dashboard into a mode where the
 * Schedule view auto-plays the OT crisis scene through Nova.
 *
 * View state is owned here so LeftNav clicks don't escape the embed
 * (URL stays /#/sage/workforce while the user pokes around inside).
 */
export default function SageWorkforceEmbed({ onNavigate }) {
  const [view, setView] = useState('schedule')
  return (
    <SageShell
      module="workforce"
      viewLabel="Workforce"
      onNavigate={onNavigate}
      bare
    >
      <Act1Dashboard
        industryId="events"
        view={view}
        sageMode
        onBack={() => onNavigate('dashboard')}
        onSelectView={setView}
        onExplore={() => {}}
      />
    </SageShell>
  )
}
