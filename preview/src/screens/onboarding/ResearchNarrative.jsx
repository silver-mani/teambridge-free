import { useEffect, useRef, useState } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import ConfigCard, { ALL_FIELDS } from './ConfigCard.jsx'

/* ──────────────────────────────────────────────────────────────────────
 * ResearchNarrative — Screen 2. Nova "researches" the URL/description
 * over ~5-6 seconds, narrating each discovery. The right pane's
 * ConfigCard fills in piece by piece as each step completes.
 *
 * Steps are time-paced (not fake API calls) — each adds the next
 * field to the `visibleFields` set, then transitions to the review
 * screen once everything is revealed.
 *
 * The chat copy is generated from the derived config so it feels
 * specific: "Found Hollywood Park" vs a generic "found your site."
 * ────────────────────────────────────────────────────────────────────── */

function buildSteps(config) {
  const industryName = config.industry
  return [
    {
      delay: 600,
      field: null,
      label: `Reading ${config.url || 'your description'}…`,
      done: `Read ${config.url || 'your description'} — ${config.summary?.split('.')[0] || 'got it'}.`,
    },
    {
      delay: 800,
      field: 'industry',
      label: 'Identifying your industry…',
      done: `Industry: ${industryName.replace('-', ' ')}. High confidence.`,
    },
    {
      delay: 700,
      field: 'headcount',
      label: 'Estimating your team size…',
      done: `Team: ~${config.headcount?.toLocaleString()} people.`,
    },
    {
      delay: 900,
      field: 'locations',
      label: 'Mapping your locations…',
      done: `Found ${config.locations?.length ?? 0} site${(config.locations?.length ?? 0) === 1 ? '' : 's'}.`,
    },
    {
      delay: 700,
      field: 'roles',
      label: 'Drafting your role list…',
      done: `${config.roles?.length ?? 0} role types identified.`,
    },
    {
      delay: 900,
      field: 'agents',
      label: 'Recommending your first agents…',
      done: `${config.agents?.length ?? 0} agents ready to activate.`,
    },
  ]
}

export default function ResearchNarrative({ config, onComplete }) {
  // Index of the step currently running (in-progress). After all steps
  // complete, we wait a beat and call onComplete.
  const [stepIndex, setStepIndex] = useState(0)
  const [visible, setVisible] = useState(new Set(['summary']))
  const [completedSteps, setCompletedSteps] = useState([])
  const timersRef = useRef([])

  useEffect(() => {
    const steps = buildSteps(config)
    let cumulative = 0
    timersRef.current = steps.map((s, i) => {
      cumulative += s.delay
      return setTimeout(() => {
        if (s.field) {
          setVisible(prev => new Set([...prev, s.field]))
        }
        setCompletedSteps(prev => [...prev, { ...s, idx: i }])
        setStepIndex(i + 1)
      }, cumulative)
    })
    // After all steps + a settling beat, pivot to review.
    const finalTimer = setTimeout(() => onComplete?.(), cumulative + 700)
    timersRef.current.push(finalTimer)

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [config, onComplete])

  const steps = buildSteps(config)
  const inProgress = stepIndex < steps.length ? steps[stepIndex] : null

  return (
    <section className="rn" aria-label="Researching your company">
      <div className="rn-chat">
        <div className="rn-chat-inner">
          <div className="rn-nova">
            <span className="rn-nova-mark" aria-hidden="true">
              <TeambridgeAIIcon size={11} />
            </span>
            <span>Nova</span>
          </div>

          <p className="rn-headline">
            Looking up <strong>{config.url || 'your company'}</strong>…
          </p>

          <ul className="rn-steps">
            {completedSteps.map(s => (
              <li key={s.idx} className="rn-step rn-step--done">
                <span className="rn-step-mark rn-step-mark--done" aria-hidden="true">
                  <CheckCircleIcon size={12} />
                </span>
                <span className="rn-step-text">{s.done}</span>
              </li>
            ))}
            {inProgress && (
              <li className="rn-step rn-step--active">
                <span className="rn-step-mark rn-step-mark--active" aria-hidden="true">
                  <span className="rn-spinner" />
                </span>
                <span className="rn-step-text">{inProgress.label}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <aside className="rn-preview" aria-label="Workspace forming">
        <div className="rn-preview-head">
          <span className="rn-preview-eyebrow">Workspace</span>
          <span className="rn-preview-flag">
            <span className="rn-spinner rn-spinner--small" aria-hidden="true" />
            Building…
          </span>
        </div>
        <ConfigCard
          config={config}
          editable={false}
          visibleFields={ALL_FIELDS.filter(f => visible.has(f))}
        />
      </aside>
    </section>
  )
}
