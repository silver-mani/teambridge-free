import { useEffect, useMemo, useRef, useState } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { CONNECTOR_OPTIONS } from './steps.js'

/* DataMappingCard — replaces the right pane with a clean slate and
 * animates a list of "X → Y" mapping rows as if Nova is wiring up the
 * account behind the scenes. Each mapping appears with a spinner that
 * flips to a check after a short delay; total runtime ~10s for ~14
 * mappings. Calls onComplete when the last mapping resolves. */

function buildMappings(config, importMethod) {
  const out = []
  ;(config.roles || []).slice(0, 4).forEach(r =>
    out.push({ source: r, target: 'Role type', kind: 'role' })
  )
  ;(config.locations || []).slice(0, 4).forEach(l =>
    out.push({ source: l.name, target: 'Site', kind: 'location' })
  )
  const importLabel = importMethod === 'csv' ? 'CSV employees'
                    : importMethod === 'api' ? 'HRIS employees'
                    :                          'Sample employees'
  out.push({ source: importLabel, target: 'Roster',       kind: 'data' })
  out.push({ source: 'Hourly + shift',     target: 'Pay structure', kind: 'data' })
  out.push({ source: 'Weekly schedule',    target: 'Cadence',       kind: 'data' })
  out.push({ source: 'Time + attendance',  target: 'Module',        kind: 'data' })
  ;(config.suggestedConnectors || []).slice(0, 3).forEach(id => {
    const c = CONNECTOR_OPTIONS.find(o => o.id === id)
    if (c) out.push({ source: c.label, target: 'Integration', kind: 'integration' })
  })
  return out
}

export default function DataMappingCard({ config, importMethod, onComplete }) {
  const mappings = useMemo(() => buildMappings(config, importMethod), [config, importMethod])
  const [idx, setIdx] = useState(0)  // index of currently-active mapping
  const timersRef = useRef([])

  useEffect(() => {
    const perStep = 900   // slower per-mapping so it reads as deliberate work
    timersRef.current = mappings.map((_, i) => setTimeout(() => setIdx(i + 1), (i + 1) * perStep))
    const final = setTimeout(() => onComplete?.(), mappings.length * perStep + 1000)
    timersRef.current.push(final)
    return () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }
  }, [mappings, onComplete])

  return (
    <div className="cc cc--mapping">
      <header className="cc-head cc-head--building">
        <div className="cc-head-left">
          <span className="cc-head-mark cc-head-mark--ai" aria-hidden="true">
            <TeambridgeAIIcon size={18} />
          </span>
          <div className="cc-head-text">
            <span className="cc-head-name">Mapping your account</span>
            <span className="cc-head-sub">Wiring data into the right fields.</span>
          </div>
        </div>
        <div className="cc-progress">
          <span
            className="cc-progress-fill"
            style={{ width: `${(idx / mappings.length) * 100}%` }}
          />
        </div>
      </header>

      <ul className="dm-list">
        {mappings.map((m, i) => {
          const done = i < idx
          const active = i === idx
          const status = done ? 'done' : active ? 'active' : 'pending'
          return (
            <li key={`${m.source}-${i}`} className={`dm-row dm-row--${status}`}>
              <span className="dm-row-mark" aria-hidden="true">
                {done && <CheckCircleIcon size={14} />}
                {active && <span className="dm-row-spin" />}
              </span>
              <span className="dm-row-source">{m.source}</span>
              <span className="dm-row-arrow" aria-hidden="true">→</span>
              <span className="dm-row-target">{m.target}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
