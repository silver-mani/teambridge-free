import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { ChevronLeftIcon } from '../../../../src/components/icons/ChevronLeftIcon.tsx'
import ConfigCard, { ALL_FIELDS } from './ConfigCard.jsx'

/* ──────────────────────────────────────────────────────────────────────
 * ConfigReview — Screen 3. Shows the derived configuration in a fully
 * editable card. Every field has an inline editor. The operator either
 * accepts ("Looks right — open my Teambridge") or starts over.
 *
 * No multi-step form: one card, edit anything in place, confirm.
 * ────────────────────────────────────────────────────────────────────── */

const ROLE_LIBRARY = {
  events:         ['Event Staff', 'Security', 'F&B', 'Ushers', 'Box Office', 'Operations'],
  healthcare:     ['RN', 'LPN', 'CNA', 'Allied Health', 'Patient Care Tech', 'Charge Nurse', 'Med Tech'],
  hospitality:    ['Front Desk', 'Housekeeping', 'F&B', 'Banquet Server', 'Bellhop', 'Operations', 'Concierge'],
  'long-term-care': ['CNA', 'LPN', 'Med Tech', 'Caregiver', 'Activities Lead', 'Resident Services', 'Dietary'],
  security:       ['Officer', 'Supervisor', 'Armed Officer', 'Patrol', 'Account Manager'],
  janitorial:     ['Day Porter', 'Night Crew', 'Floor Tech', 'Restroom Tech', 'Account Lead'],
  staffing:       ['Recruiter', 'Account Manager', 'Field Tech', 'Onboarding Coordinator'],
  construction:   ['Foreman', 'Carpenter', 'Electrician', 'Project Manager', 'Safety Lead', 'Laborer'],
  'light-industrial': ['Picker', 'Forklift Op', 'Shift Lead', 'Quality', 'Machine Op'],
}

export default function ConfigReview({ config, onChange, onConfirm, onStartOver }) {
  const roleSuggestions = ROLE_LIBRARY[config.industry] ?? []

  return (
    <section className="cr" aria-label="Review your configuration">
      <div className="cr-inner">
        <header className="cr-head">
          <div className="cr-nova">
            <span className="cr-nova-mark" aria-hidden="true">
              <TeambridgeAIIcon size={11} />
            </span>
            <span>Nova</span>
          </div>
          <h1 className="cr-title">Here's what I set up for you.</h1>
          <p className="cr-sub">
            I derived this from {config.url ? <strong>{config.url}</strong> : 'what you told me'}. Anything off? Tap to edit.
            When you're happy, open your Teambridge.
          </p>
        </header>

        <ConfigCard
          config={config}
          editable={true}
          onChange={onChange}
          visibleFields={ALL_FIELDS}
          roleSuggestions={roleSuggestions}
        />

        <footer className="cr-foot">
          <button type="button" className="cr-back" onClick={onStartOver}>
            <ChevronLeftIcon size={14} /> Start over
          </button>
          <button type="button" className="cr-cta" onClick={onConfirm}>
            Looks right — open my Teambridge
            <ArrowNarrowRightIcon size={14} />
          </button>
        </footer>
      </div>
    </section>
  )
}
