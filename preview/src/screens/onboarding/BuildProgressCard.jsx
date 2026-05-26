import { useEffect, useMemo, useRef, useState } from 'react'
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

  const payRuleCount  = roleCount * stateCount + 8
  const tokensTrained = (1.8 + agentCount * 0.4).toFixed(1)

  // 7 substantive steps — each consolidates work that used to be 2-3
  // smaller substeps. Longer delays per step (2.5-3.5s) so each one
  // gets time to land.
  return [
    {
      id: 'workspace',
      title: 'Provisioning your workspace',
      detail: `Allocating isolated tenant for ${config?.companyName ?? 'your account'} · 4 GB encrypted storage.`,
      delay: 2500,
    },
    {
      id: 'roster',
      title: 'Loading your team',
      detail: importMethod === 'csv' ? `Imported ${headcountStr} employees · parsed 18 columns · resolved 12 duplicates.`
            : importMethod === 'api' ? `Synced ${headcountStr} employees from your HRIS · matched to ${roleCount} role types.`
            :                          `Seeded ${headcountStr} sample employees across ${roleCount} roles and ${locCount} site${locCount === 1 ? '' : 's'}.`,
      delay: 3200,
    },
    {
      id: 'roles-sites',
      title: 'Mapping roles, sites, and shift templates',
      detail: `${roleCount} roles to ${roleCount * 3} job codes · ${locCount} site${locCount === 1 ? '' : 's'} with peak/mid/overnight templates.`,
      delay: 3000,
    },
    {
      id: 'rules',
      title: 'Wiring pay rules + compliance engine',
      detail: `${payRuleCount} rate variations across ${stateCount} state${stateCount === 1 ? '' : 's'} · ${policyCount} polic${policyCount === 1 ? 'y' : 'ies'} active.`,
      delay: 3000,
    },
    {
      id: 'agents',
      title: 'Training your agents',
      detail: `${agentCount} agent${agentCount === 1 ? '' : 's'} fed ${tokensTrained}M tokens of context — roles, sites, policies, shift history.`,
      delay: 3500,
    },
    {
      id: 'schedule',
      title: 'Drafting your first schedule',
      detail: `168-hour grid drafted, AI-balanced for coverage · 47/47 compliance scenarios passing.`,
      delay: 3200,
    },
    {
      id: 'dashboard',
      title: 'Opening your dashboard',
      detail: 'Final pre-flights green · handing off to your team.',
      delay: 1500,
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
      {/* Card header removed — the right-pane head ("Launching your
       * account" + sub) carries the same info, so showing it twice
       * read as repetitive. Keep just the progress bar at the top
       * of the card so the operator still sees overall progress. */}
      <div className="cc-progress cc-progress--standalone">
        <span
          className="cc-progress-fill"
          style={{ width: `${(stepIndex / steps.length) * 100}%` }}
        />
      </div>

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
