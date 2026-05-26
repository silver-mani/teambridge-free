import { useEffect, useMemo, useRef, useState } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import {
  PAIN_TO_AGENT, POLICY_OPTIONS, OUTCOME_OPTIONS,
} from './steps.js'

/* BuildProgressCard — final step of the build flow. Walks through a
 * substantive list of provisioning steps (workspace, roster, sites,
 * each chosen policy, each chosen agent, integrations, schedule
 * draft, dashboard open) with title + one-line detail per step,
 * spinner → checkmark transitions, and a progress bar. Each step
 * is tied to the operator's actual picks so it reads as "I'm
 * activating Last-minute Replacement for you" not just "starting
 * agents". Total runtime ~14-18s depending on how many policies +
 * agents were selected. */

function provisioningSteps(config, importMethod, policies, agents, outcomes) {
  const headcount = config?.headcount?.toLocaleString() || ''
  const company = config?.companyName ?? 'your account'
  const out = []

  out.push({
    id: 'workspace',
    title: 'Provisioning workspace',
    detail: `Creating ${company}'s Teambridge instance.`,
    delay: 1200,
  })
  out.push({
    id: 'roster',
    title: 'Loading roster',
    detail: importMethod === 'csv'
      ? `Importing ${headcount} employees from your CSV.`
      : importMethod === 'api'
      ? `Syncing ${headcount} employees from your HRIS.`
      : `Loading ${headcount} sample employees mapped to roles.`,
    delay: 1500,
  })
  out.push({
    id: 'sites',
    title: 'Wiring up locations',
    detail: `${config?.locations?.length || 0} sites added to the schedule grid.`,
    delay: 1100,
  })

  // One step per policy picked
  ;(policies || []).slice(0, 5).forEach(id => {
    const p = POLICY_OPTIONS.find(o => o.id === id)
    if (!p) return
    out.push({
      id: `policy-${id}`,
      title: `Activating ${p.label.toLowerCase()}`,
      detail: p.detail,
      delay: 1000,
    })
  })

  // One step per agent toggled on
  ;(agents || []).slice(0, 6).forEach(id => {
    const a = PAIN_TO_AGENT[id]
    if (!a) return
    out.push({
      id: `agent-${id}`,
      title: `Standing up ${a.name}`,
      detail: a.detail,
      delay: 1100,
    })
  })

  out.push({
    id: 'modules',
    title: 'Enabling modules',
    detail: 'Time tracking, payroll, shift requests, engage.',
    delay: 1100,
  })
  out.push({
    id: 'schedule',
    title: "Drafting next week's schedule",
    detail: `Templates seeded from your ${config?.roles?.length || 0} roles.`,
    delay: 1500,
  })

  if (config?.suggestedConnectors?.length) {
    out.push({
      id: 'connectors',
      title: 'Connecting integrations',
      detail: `Syncing ${config.suggestedConnectors.length} tool${config.suggestedConnectors.length === 1 ? '' : 's'} into payroll + HRIS.`,
      delay: 1200,
    })
  }

  out.push({
    id: 'notifications',
    title: 'Setting up notifications',
    detail: 'Routes by role + shift, with mobile + Slack delivery.',
    delay: 1000,
  })
  out.push({
    id: 'dashboard',
    title: 'Opening your dashboard',
    detail: 'Almost there — final touches.',
    delay: 900,
  })

  return out
}

export default function BuildProgressCard({
  config, importMethod, policies, agents, outcomes, onComplete,
}) {
  const steps = useMemo(
    () => provisioningSteps(config, importMethod, policies, agents, outcomes),
    [config, importMethod, policies, agents, outcomes],
  )
  const [stepIndex, setStepIndex] = useState(0)
  const timersRef = useRef([])

  useEffect(() => {
    let cumulative = 0
    timersRef.current = steps.map((step, i) => {
      cumulative += step.delay
      return setTimeout(() => setStepIndex(i + 1), cumulative)
    })
    const finalTimer = setTimeout(() => onComplete?.(), cumulative + 900)
    timersRef.current.push(finalTimer)
    return () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }
  }, [steps, onComplete])

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
              {done ? 'Ready' : `Launching ${config?.companyName ?? 'your account'}`}
            </span>
            <span className="cc-head-sub">
              {done
                ? 'Opening your dashboard now…'
                : 'Hang tight — provisioning every piece of your workspace.'}
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
              <div className="bp-step-text">
                <span className="bp-step-title">{s.title}</span>
                <span className="bp-step-detail">{s.detail}</span>
              </div>
              {isDone && <span className="bp-step-tick">Done</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
