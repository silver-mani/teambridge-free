import { useEffect, useRef, useState } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'

/* BuildProgressCard — appears in the right pane once the operator picks
 * an import method. Walks through 6 build steps with checkmark animations
 * so it feels like Nova is doing real work behind the scenes. Each step
 * has its own delay; total ~5-6 seconds before onComplete fires. */

function buildSteps(config, importMethod) {
  const headcount = config?.headcount?.toLocaleString() || ''
  const importLine = importMethod === 'csv' ? `Importing ${headcount} employees`
                   : importMethod === 'api' ? `Syncing ${headcount} employees`
                   :                          `Loading ${headcount} employees`
  return [
    { id: 's1', text: 'Connecting data sources',     delay: 1100 },
    { id: 's2', text: importLine,                    delay: 1900 },
    { id: 's3', text: 'Mapping roles',               delay: 1400 },
    { id: 's4', text: 'Checking credentials',        delay: 1300 },
    { id: 's5', text: 'Activating your agents',      delay: 1500 },
    { id: 's6', text: 'Setting up policies',         delay: 1400 },
    { id: 's7', text: 'Configuring time tracking',   delay: 1100 },
    { id: 's8', text: 'Drafting your first schedule', delay: 1600 },
    { id: 's9', text: 'Opening your dashboard',      delay: 900 },
  ]
}

export default function BuildProgressCard({ config, importMethod, onComplete }) {
  const steps = buildSteps(config, importMethod)
  const [stepIndex, setStepIndex] = useState(0)
  const timersRef = useRef([])

  useEffect(() => {
    let cumulative = 0
    timersRef.current = steps.map((step, i) => {
      cumulative += step.delay
      return setTimeout(() => setStepIndex(i + 1), cumulative)
    })
    // After all steps complete + a settling beat, hand off.
    const finalTimer = setTimeout(() => onComplete?.(), cumulative + 700)
    timersRef.current.push(finalTimer)
    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [importMethod]) // eslint-disable-line react-hooks/exhaustive-deps

  const done = stepIndex >= steps.length

  return (
    <div className="cc cc--building">
      <header className="cc-head cc-head--building">
        <div className="cc-head-left">
          <span className="cc-head-mark cc-head-mark--ai" aria-hidden="true">
            <TeambridgeAIIcon size={18} />
          </span>
          <div className="cc-head-text">
            <span className="cc-head-name">
              {done ? 'Ready' : 'Setting up your account'}
            </span>
            <span className="cc-head-sub">
              {done
                ? `${config?.companyName ?? 'Your account'} is ready. Opening now…`
                : 'Hang tight — about 15 seconds.'}
            </span>
          </div>
        </div>
        <div className="cc-progress">
          <span
            className="cc-progress-fill"
            style={{ width: `${(stepIndex / steps.length) * 100}%` }}
          />
        </div>
      </header>

      <ul className="bp-steps">
        {steps.map((s, i) => {
          const isDone = i < stepIndex
          const isActive = i === stepIndex && !done
          const status = isDone ? 'done' : isActive ? 'active' : 'pending'
          return (
            <li key={s.id} className={`bp-step bp-step--${status}`}>
              <span className="bp-step-mark" aria-hidden="true">
                {isDone && <CheckCircleIcon size={14} />}
                {isActive && <span className="bp-step-spin" />}
              </span>
              <span className="bp-step-text">{s.text}</span>
              {isDone && <span className="bp-step-tick">Done</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
