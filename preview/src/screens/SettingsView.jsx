import { SettingsGearIcon }    from '../../../src/components/icons/SettingsGearIcon.tsx'
import { Users03Icon }         from '../../../src/components/icons/Users03Icon.tsx'
import { CurrencyDollarCircleIcon } from '../../../src/components/icons/CurrencyDollarCircleIcon.tsx'
import { Globe01Icon }         from '../../../src/components/icons/Globe01Icon.tsx'
import { TeambridgeAIIcon }    from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { Bell01Icon }          from '../../../src/components/icons/Bell01Icon.tsx'
import { ChevronRightIcon }    from '../../../src/components/icons/ChevronRightIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * Settings — top-level system page. Cards are intentionally light;
 * real settings live in the actual product. The point here is to give
 * the bottom-pinned nav slot something to land on.
 * ────────────────────────────────────────────────────────────────────── */

const GROUPS = [
  {
    label: 'Workspace',
    items: [
      { id: 'org',       title: 'Organization',     desc: 'Name, logo, fiscal year, default currency.', Icon: Globe01Icon },
      { id: 'roster',    title: 'Roster & Roles',   desc: 'Define roles, pay grades, and venue assignments.', Icon: Users03Icon },
      { id: 'pay',       title: 'Pay & Payroll',    desc: 'Pay periods, OT thresholds, integration mappings.', Icon: CurrencyDollarCircleIcon },
    ],
  },
  {
    label: 'AI & Automation',
    items: [
      { id: 'agents',    title: 'AI Agents',         desc: 'Default agent persona, tone, and approval rules.', Icon: TeambridgeAIIcon },
      { id: 'notify',    title: 'Notifications',     desc: 'How operators and workers get alerted across SMS, email, and in-app.', Icon: Bell01Icon },
      { id: 'general',   title: 'General preferences', desc: 'Time zone, week start, language, accessibility.', Icon: SettingsGearIcon },
    ],
  },
]

export default function SettingsView({ onDemo }) {
  const buzz = () => onDemo?.()
  return (
    <section className="settings-view" aria-label="Settings">
      <header className="settings-view-head">
        <h1 className="settings-view-title">Settings</h1>
        <p className="settings-view-sub">
          Workspace-level configuration. Changes here apply to every operator and every venue.
        </p>
      </header>

      {GROUPS.map(g => (
        <div key={g.label} className="settings-group">
          <div className="settings-group-label">{g.label}</div>
          <div className="settings-group-grid">
            {g.items.map(it => {
              const Icon = it.Icon
              return (
                <button
                  key={it.id}
                  type="button"
                  className="settings-card"
                  onClick={buzz}
                >
                  <span className="settings-card-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className="settings-card-text">
                    <span className="settings-card-title">{it.title}</span>
                    <span className="settings-card-desc">{it.desc}</span>
                  </span>
                  <span className="settings-card-chev" aria-hidden="true">
                    <ChevronRightIcon size={14} />
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}
