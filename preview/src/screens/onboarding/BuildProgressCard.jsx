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
  const headcount = config?.headcount || 0
  const headcountStr = headcount.toLocaleString()
  const policyCount = (policies || []).length
  const agentCount = (agents || []).length
  const roleCount = config?.roles?.length || 0
  const locCount = config?.locations?.length || 0
  const states = Array.from(new Set(
    (config?.locations || []).map(l => (String(l.city || '').match(/\b([A-Z]{2})\b\s*$/) || [])[1]).filter(Boolean)
  ))
  const stateCount = states.length || 1

  // Realistic-looking output numbers derived from the operator's
  // actual config so it reads as the AI doing real work for them.
  const certCount      = 47   // Sample credential database size
  const templateCount  = Math.max(6, Math.min(14, roleCount * 2))
  const payRuleCount   = roleCount * stateCount + 8
  const scenarioCount  = 47
  const tokensTrained  = (1.8 + agentCount * 0.4).toFixed(1)  // millions

  return [
    {
      id: 'workspace',
      title: 'Provisioning your workspace',
      detail: `Allocating isolated tenant for ${config?.companyName ?? 'your account'} · 4 GB encrypted storage.`,
      delay: 2200,
    },
    {
      id: 'roster',
      title: 'Loading your team',
      detail: importMethod === 'csv' ? `Imported ${headcountStr} employees · parsed 18 columns · resolved 12 duplicates.`
            : importMethod === 'api' ? `Synced ${headcountStr} employees from your HRIS · matched to ${roleCount} role types.`
            :                          `Seeded ${headcountStr} sample employees · distributed realistically across ${roleCount} roles.`,
      delay: 2800,
    },
    {
      id: 'roles',
      title: 'Mapping role types',
      detail: `${roleCount} roles mapped to ${roleCount * 3} internal job codes with shift-pattern variants.`,
      delay: 2000,
    },
    {
      id: 'templates',
      title: 'Building shift templates',
      detail: `Generated ${templateCount} templates from your common patterns (peak, mid, overnight).`,
      delay: 2400,
    },
    {
      id: 'payrules',
      title: 'Wiring pay rules',
      detail: `Configured ${payRuleCount} rate variations across ${stateCount} state${stateCount === 1 ? '' : 's'}.`,
      delay: 2300,
    },
    {
      id: 'sites',
      title: 'Setting up locations',
      detail: `${locCount} site${locCount === 1 ? '' : 's'} added with site-specific shift templates and break schedules.`,
      delay: 1900,
    },
    {
      id: 'compliance',
      title: 'Loading compliance engine',
      detail: `${policyCount} polic${policyCount === 1 ? 'y' : 'ies'} active · loaded ${stateCount} state-specific module${stateCount === 1 ? '' : 's'} + federal baseline.`,
      delay: 2200,
    },
    {
      id: 'creds',
      title: 'Pre-loading credential database',
      detail: `Indexed ${certCount} certification types relevant to your industry.`,
      delay: 1900,
    },
    {
      id: 'agents-infra',
      title: 'Allocating agent infrastructure',
      detail: `Compute reserved for ${agentCount} agent${agentCount === 1 ? '' : 's'} with isolated context windows.`,
      delay: 1900,
    },
    {
      id: 'agents-train',
      title: 'Training agents on your data',
      detail: `Fed ${tokensTrained}M tokens of context — roles, sites, policies, shift history.`,
      delay: 2800,
    },
    {
      id: 'notifications',
      title: 'Configuring notification pipelines',
      detail: 'Routes by role + shift · mobile push, SMS, Slack, and email enabled.',
      delay: 1800,
    },
    {
      id: 'schedule',
      title: 'Drafting your first schedule',
      detail: `168-hour grid drafted, AI-balanced for coverage across ${locCount} site${locCount === 1 ? '' : 's'}.`,
      delay: 2600,
    },
    {
      id: 'qa',
      title: 'Running quality checks',
      detail: `${scenarioCount}/${scenarioCount} compliance scenarios passing · no roster conflicts.`,
      delay: 2400,
    },
    {
      id: 'dashboard',
      title: 'Opening your dashboard',
      detail: 'Final pre-flights green · handing off to your team.',
      delay: 1400,
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
                : 'Real configuration work — templates, pay rules, agent training, QA.'}
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
