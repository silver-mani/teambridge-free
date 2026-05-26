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

function provisioningSteps(config, importMethod, policies, agents) {
  const headcount = config?.headcount?.toLocaleString() || ''
  const policyCount = (policies || []).length
  const agentCount = (agents || []).length
  return [
    {
      id: 'workspace',
      title: 'Provisioning your workspace',
      detail: `Standing up an isolated tenant for ${config?.companyName ?? 'your account'}.`,
      delay: 1500,
    },
    {
      id: 'roster',
      title: 'Loading your team',
      detail: importMethod === 'csv' ? `Importing ${headcount} employees from your CSV.`
            : importMethod === 'api' ? `Pulling ${headcount} employees from your HRIS.`
            :                          `Seeding ${headcount} sample employees across your roles.`,
      delay: 1800,
    },
    {
      id: 'agents',
      title: `Activating ${agentCount + policyCount} settings`,
      detail: `${agentCount} agent${agentCount === 1 ? '' : 's'} and ${policyCount} polic${policyCount === 1 ? 'y' : 'ies'} configured.`,
      delay: 1600,
    },
    {
      id: 'schedule',
      title: "Drafting your first schedule",
      detail: 'AI-balanced for coverage across your sites and shift patterns.',
      delay: 1600,
    },
    {
      id: 'dashboard',
      title: 'Opening your dashboard',
      detail: 'Almost there — final handoff.',
      delay: 1100,
    },
  ]
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
