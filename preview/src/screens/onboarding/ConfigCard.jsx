import { useState, useEffect, useRef } from 'react'
import { INDUSTRIES } from '../IndustrySelector.jsx'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { PlusIcon } from '../../../../src/components/icons/PlusIcon.tsx'
import { XIcon } from '../../../../src/components/icons/XIcon.tsx'
import { Edit03Icon } from '../../../../src/components/icons/Edit03Icon.tsx'
import { PAIN_OPTIONS, PAIN_TO_AGENT } from './steps.js'
import AgentAvatar from './AgentAvatar.jsx'

/* ──────────────────────────────────────────────────────────────────────
 * ConfigCard — the visual representation of the derived configuration.
 * Used by both:
 *   • ResearchNarrative (read-only, animated reveal piece-by-piece via
 *     the `visibleFields` prop)
 *   • ConfigReview (fully editable, every field with an inline editor)
 *
 * Source of truth for what the derived config looks like, so the
 * "Nova is researching" frame and the "Here's what I set up" frame
 * are visually identical — just one is mid-reveal and one is editable.
 * ────────────────────────────────────────────────────────────────────── */

export const ALL_FIELDS = ['summary', 'industry', 'headcount', 'locations', 'roles', 'agents']

function ConfidenceBadge({ level }) {
  if (!level) return null
  const cls = level === 'high' ? 'cc-conf--high' : level === 'medium' ? 'cc-conf--med' : 'cc-conf--low'
  return <span className={`cc-conf ${cls}`}>{level} confidence</span>
}

function FieldRow({ label, visible, children, status }) {
  if (!visible) {
    return (
      <div className="cc-row cc-row--pending">
        <div className="cc-row-label">{label}</div>
        <div className="cc-row-value cc-row-skeleton" aria-hidden="true">
          <span className="cc-skel-bar" />
        </div>
      </div>
    )
  }
  return (
    <div className="cc-row">
      <div className="cc-row-label">
        {label}
        {status && (
          <span className="cc-row-status" aria-hidden="true">
            <CheckCircleIcon size={11} />
          </span>
        )}
      </div>
      <div className="cc-row-value">{children}</div>
    </div>
  )
}

/* ── Inline editors ── */

function TextEdit({ value, onChange, placeholder }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef(null)
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])
  useEffect(() => { setDraft(value) }, [value])

  if (!editing) {
    return (
      <button type="button" className="cc-inline-display" onClick={() => setEditing(true)}>
        <span className="cc-inline-text">{value || placeholder}</span>
        <span className="cc-inline-edit" aria-hidden="true"><Edit03Icon size={12} /></span>
      </button>
    )
  }

  const commit = () => {
    setEditing(false)
    if (draft !== value) onChange(draft)
  }
  return (
    <input
      ref={ref}
      type="text"
      className="cc-inline-input"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); else if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
      placeholder={placeholder}
    />
  )
}

function NumberEdit({ value, onChange, suffix }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const ref = useRef(null)
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])
  useEffect(() => { setDraft(String(value)) }, [value])

  if (!editing) {
    return (
      <button type="button" className="cc-inline-display" onClick={() => setEditing(true)}>
        <span className="cc-inline-text">{value.toLocaleString()}{suffix ? ` ${suffix}` : ''}</span>
        <span className="cc-inline-edit" aria-hidden="true"><Edit03Icon size={12} /></span>
      </button>
    )
  }
  const commit = () => {
    const n = parseInt(draft, 10)
    setEditing(false)
    if (!Number.isNaN(n) && n > 0 && n !== value) onChange(n)
    else setDraft(String(value))
  }
  return (
    <input
      ref={ref}
      type="number"
      className="cc-inline-input cc-inline-input--num"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); else if (e.key === 'Escape') { setDraft(String(value)); setEditing(false) } }}
    />
  )
}

function ChipsEdit({ items, onChange, suggestions = [], placeholder = 'Add' }) {
  // Editable chip list — current items can be removed, suggestions added.
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const ref = useRef(null)
  useEffect(() => { if (adding) ref.current?.focus() }, [adding])

  const remove = (item) => onChange(items.filter(i => i !== item))
  const add = (item) => {
    const v = item.trim()
    if (!v) return
    if (items.includes(v)) return
    onChange([...items, v])
  }
  const commitDraft = () => {
    if (draft.trim()) add(draft)
    setDraft('')
    setAdding(false)
  }
  const remainingSuggestions = suggestions.filter(s => !items.includes(s))

  return (
    <div className="cc-chips">
      {items.map(item => (
        <span key={item} className="cc-chip">
          <span>{item}</span>
          <button
            type="button"
            className="cc-chip-x"
            onClick={() => remove(item)}
            aria-label={`Remove ${item}`}
          >
            <XIcon size={10} />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          ref={ref}
          type="text"
          className="cc-chip-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={e => { if (e.key === 'Enter') commitDraft(); else if (e.key === 'Escape') { setDraft(''); setAdding(false) } }}
          placeholder={placeholder}
        />
      ) : (
        <button type="button" className="cc-chip cc-chip--add" onClick={() => setAdding(true)}>
          <PlusIcon size={10} /> {placeholder}
        </button>
      )}
      {remainingSuggestions.length > 0 && (
        <div className="cc-chip-suggestions">
          <span className="cc-chip-suggestions-label">Suggestions:</span>
          {remainingSuggestions.slice(0, 4).map(s => (
            <button key={s} type="button" className="cc-chip-suggestion" onClick={() => add(s)}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function LocationsEdit({ items, onChange }) {
  const [adding, setAdding] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftCity, setDraftCity] = useState('')

  const remove = i => onChange(items.filter((_, idx) => idx !== i))
  const addNew = () => {
    if (!draftName.trim()) return
    onChange([...items, { name: draftName.trim(), city: draftCity.trim() }])
    setDraftName(''); setDraftCity(''); setAdding(false)
  }

  return (
    <div className="cc-locs">
      <ul className="cc-loc-list">
        {items.map((loc, i) => (
          <li key={`${loc.name}-${i}`} className="cc-loc-row">
            <span className="cc-loc-dot" aria-hidden="true" />
            <span className="cc-loc-name">{loc.name}</span>
            {loc.city && <span className="cc-loc-city">{loc.city}</span>}
            <button
              type="button"
              className="cc-loc-x"
              onClick={() => remove(i)}
              aria-label={`Remove ${loc.name}`}
            >
              <XIcon size={11} />
            </button>
          </li>
        ))}
      </ul>
      {adding ? (
        <div className="cc-loc-add">
          <input
            type="text"
            className="cc-inline-input"
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            placeholder="Location name"
            autoFocus
          />
          <input
            type="text"
            className="cc-inline-input"
            value={draftCity}
            onChange={e => setDraftCity(e.target.value)}
            placeholder="City"
          />
          <button type="button" className="cc-mini-cta" onClick={addNew}>Add</button>
          <button type="button" className="cc-mini-ghost" onClick={() => { setAdding(false); setDraftName(''); setDraftCity('') }}>Cancel</button>
        </div>
      ) : (
        <button type="button" className="cc-chip cc-chip--add cc-chip--block" onClick={() => setAdding(true)}>
          <PlusIcon size={10} /> Add location
        </button>
      )}
    </div>
  )
}

function IndustryEdit({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const current = INDUSTRIES.find(i => i.id === value)
  if (!open) {
    return (
      <button type="button" className="cc-inline-display" onClick={() => setOpen(true)}>
        <span className="cc-industry-mark" style={current ? {
          background: `var(--color-${current.color}-bg-tertiary)`,
          color:      `var(--color-${current.color}-content-secondary)`,
        } : undefined} aria-hidden="true">
          {current ? <current.Icon /> : null}
        </span>
        <span className="cc-inline-text">{current?.name ?? value}</span>
        <span className="cc-inline-edit" aria-hidden="true"><Edit03Icon size={12} /></span>
      </button>
    )
  }
  return (
    <div className="cc-industry-picker">
      {INDUSTRIES.map(ind => (
        <button
          key={ind.id}
          type="button"
          className={`cc-industry-opt ${value === ind.id ? 'is-selected' : ''}`}
          onClick={() => { onChange(ind.id); setOpen(false) }}
        >
          <span className="cc-industry-mark" style={{
            background: `var(--color-${ind.color}-bg-tertiary)`,
            color:      `var(--color-${ind.color}-content-secondary)`,
          }} aria-hidden="true">
            <ind.Icon />
          </span>
          <span>{ind.name}</span>
        </button>
      ))}
    </div>
  )
}

function AgentsEdit({ ids, onChange }) {
  const set = new Set(ids)
  const toggle = (id) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(Array.from(next))
  }
  return (
    <ul className="cc-agent-list">
      {PAIN_OPTIONS.map(p => {
        const agent = PAIN_TO_AGENT[p.id]
        if (!agent) return null
        const on = set.has(p.id)
        return (
          <li key={p.id}>
            <button
              type="button"
              className={`cc-agent-row ${on ? 'is-on' : 'is-off'}`}
              onClick={() => toggle(p.id)}
            >
              <AgentAvatar painId={p.id} size={28} />
              <span className="cc-agent-text">
                <span className="cc-agent-name">{agent.name}</span>
                <span className="cc-agent-detail">{agent.detail}</span>
              </span>
              <span className={`cc-agent-toggle ${on ? 'is-on' : ''}`} aria-hidden="true">
                {on && <CheckCircleIcon size={12} />}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/* ── ConfigCard ── */

export default function ConfigCard({
  config,
  editable = false,
  onChange = () => {},
  visibleFields = ALL_FIELDS,
  showHeader = true,
  roleSuggestions = [],
}) {
  if (!config) return null
  const visible = new Set(visibleFields)

  const industry = INDUSTRIES.find(i => i.id === config.industry)

  const update = (field, value) => onChange({ ...config, [field]: value })

  return (
    <div className={`cc ${editable ? 'cc--editable' : 'cc--readonly'}`}>
      {showHeader && (
        <header className="cc-head">
          <div className="cc-head-left">
            <span className="cc-head-mark" style={industry ? {
              background: `var(--color-${industry.color}-bg-tertiary)`,
              color:      `var(--color-${industry.color}-content-secondary)`,
            } : undefined} aria-hidden="true">
              {industry ? <industry.Icon /> : <TeambridgeAIIcon size={16} />}
            </span>
            <div className="cc-head-text">
              {editable ? (
                <TextEdit value={config.companyName || ''} onChange={v => update('companyName', v)} placeholder="Company name" />
              ) : (
                <span className="cc-head-name">{config.companyName || 'Your company'}</span>
              )}
              {config.url && <span className="cc-head-url">{config.url}</span>}
            </div>
          </div>
        </header>
      )}

      <FieldRow label="What you do" visible={visible.has('summary')} status={!editable}>
        {editable ? (
          <TextEdit value={config.summary || ''} onChange={v => update('summary', v)} placeholder="One-line summary" />
        ) : (
          <span className="cc-row-flat">{config.summary}</span>
        )}
      </FieldRow>

      <FieldRow label="Industry" visible={visible.has('industry')} status={!editable}>
        {editable ? (
          <IndustryEdit value={config.industry} onChange={v => update('industry', v)} />
        ) : (
          <span className="cc-row-flat">
            <span className="cc-industry-mark" style={industry ? {
              background: `var(--color-${industry.color}-bg-tertiary)`,
              color:      `var(--color-${industry.color}-content-secondary)`,
            } : undefined} aria-hidden="true">
              {industry ? <industry.Icon /> : null}
            </span>
            {industry?.name ?? config.industry}
            <ConfidenceBadge level={config.confidence?.industry} />
          </span>
        )}
      </FieldRow>

      <FieldRow label="Headcount" visible={visible.has('headcount')} status={!editable}>
        {editable ? (
          <NumberEdit value={config.headcount} onChange={v => update('headcount', v)} suffix="people" />
        ) : (
          <span className="cc-row-flat">
            ~{config.headcount?.toLocaleString()} people
            <ConfidenceBadge level={config.confidence?.headcount} />
          </span>
        )}
      </FieldRow>

      <FieldRow label="Locations" visible={visible.has('locations')} status={!editable}>
        {editable ? (
          <LocationsEdit items={config.locations || []} onChange={v => update('locations', v)} />
        ) : (
          <ul className="cc-loc-list">
            {(config.locations || []).map((loc, i) => (
              <li key={i} className="cc-loc-row cc-loc-row--readonly">
                <span className="cc-loc-dot" aria-hidden="true" />
                <span className="cc-loc-name">{loc.name}</span>
                {loc.city && <span className="cc-loc-city">{loc.city}</span>}
              </li>
            ))}
          </ul>
        )}
      </FieldRow>

      <FieldRow label="Roles" visible={visible.has('roles')} status={!editable}>
        {editable ? (
          <ChipsEdit
            items={config.roles || []}
            onChange={v => update('roles', v)}
            suggestions={roleSuggestions}
            placeholder="Add role"
          />
        ) : (
          <div className="cc-chips">
            {(config.roles || []).map(r => (
              <span key={r} className="cc-chip cc-chip--readonly">{r}</span>
            ))}
          </div>
        )}
      </FieldRow>

      <FieldRow label="Active agents" visible={visible.has('agents')} status={!editable}>
        {editable ? (
          <AgentsEdit ids={config.agents || []} onChange={v => update('agents', v)} />
        ) : (
          <ul className="cc-agent-list cc-agent-list--readonly">
            {(config.agents || []).map(id => {
              const agent = PAIN_TO_AGENT[id]
              if (!agent) return null
              return (
                <li key={id} className="cc-agent-row cc-agent-row--readonly">
                  <AgentAvatar painId={id} size={28} />
                  <span className="cc-agent-text">
                    <span className="cc-agent-name">{agent.name}</span>
                    <span className="cc-agent-detail">{agent.detail}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </FieldRow>
    </div>
  )
}
