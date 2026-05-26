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
  const roleCount = config?.roles?.length || 0
  const locCount = config?.locations?.length || 0

  const policyNames = (policies || [])
    .map(id => POLICY_OPTIONS.find(o => o.id === id)?.label)
    .filter(Boolean)
  const agentNames = (agents || [])
    .map(id => PAIN_TO_AGENT[id]?.name)
    .filter(Boolean)

  const steps = [
    {
      id: 'workspace',
      title: 'Provisioning workspace',
      detail: `Spinning up ${company}'s isolated tenant on Teambridge.`,
      delay: 1700,
    },
    {
      id: 'analyze',
      title: 'Analyzing your team shape',
      detail: `Reading ${roleCount} role types across ${locCount} site${locCount === 1 ? '' : 's'} to set baselines.`,
      delay: 1900,
    },
    {
      id: 'roster',
      title: 'Loading roster',
      detail: importMethod === 'csv'
        ? `Importing ${headcount} employees from your CSV and mapping columns.`
        : importMethod === 'api'
        ? `Pulling ${headcount} employees from your HRIS and matching to roles.`
        : `Seeding ${headcount} sample employees, distributed across roles.`,
      delay: 2200,
    },
    {
      id: 'sites',
      title: 'Wiring up locations',
      detail: `${locCount} site${locCount === 1 ? '' : 's'} added to the schedule grid with templates.`,
      delay: 1600,
    },
  ]

  if (policyNames.length) {
    steps.push({
      id: 'policies',
      title: `Activating ${policyNames.length} labor polic${policyNames.length === 1 ? 'y' : 'ies'}`,
      detail: policyNames.slice(0, 4).join(' · ') + (policyNames.length > 4 ? ` and ${policyNames.length - 4} more` : ''),
      delay: 2400,
    })
  }

  if (agentNames.length) {
    steps.push({
      id: 'agents',
      title: `Standing up ${agentNames.length} agent${agentNames.length === 1 ? '' : 's'}`,
      detail: agentNames.slice(0, 4).join(' · ') + (agentNames.length > 4 ? ` and ${agentNames.length - 4} more` : ''),
      delay: 2500,
    })
  }

  steps.push({
    id: 'schedule',
    title: "Drafting next week's schedule",
    detail: `Templates seeded from your ${roleCount} roles; AI-balanced for coverage.`,
    delay: 2100,
  })

  if (config?.suggestedConnectors?.length) {
    steps.push({
      id: 'connectors',
      title: 'Connecting integrations',
      detail: `Wiring ${config.suggestedConnectors.length} tool${config.suggestedConnectors.length === 1 ? '' : 's'} into payroll + HRIS sync.`,
      delay: 1700,
    })
  }

  steps.push({
    id: 'compliance',
    title: 'Running first compliance check',
    detail: 'Validating no roster conflicts with the policies you turned on.',
    delay: 1800,
  })
  steps.push({
    id: 'dashboard',
    title: 'Opening your dashboard',
    detail: 'Final handoff — your team is live.',
    delay: 1300,
  })

  return steps
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
