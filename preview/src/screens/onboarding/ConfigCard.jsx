import { useState, useEffect, useRef } from 'react'
import { INDUSTRIES } from '../IndustrySelector.jsx'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { CheckCircleIcon } from '../../../../src/components/icons/CheckCircleIcon.tsx'
import { PlusIcon } from '../../../../src/components/icons/PlusIcon.tsx'
import { XIcon } from '../../../../src/components/icons/XIcon.tsx'
import { Edit03Icon } from '../../../../src/components/icons/Edit03Icon.tsx'
import { PAIN_OPTIONS, PAIN_TO_AGENT } from './steps.js'
import AgentAvatar from './AgentAvatar.jsx'

/* Map-pin icon — inline because Alloy doesn't ship a MapPin in its
 * icon set. Stroke style matches the Alloy convention (round caps,
 * scaled stroke-width). Used as the leading mark on location chips. */
function MapPinIcon({ size = 10 }) {
  const s = typeof size === 'number' ? size : parseFloat(size)
  const sw = s <= 12 ? 2 : s <= 16 ? 1.75 : 1.5
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth={sw} aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" />
    </svg>
  )
}

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

export const ALL_FIELDS = ['summary', 'industry', 'headcount', 'locations', 'roles']

/* Sample the dominant background color of a loaded favicon image by
 * averaging its 4 corner pixels. Skips fully-transparent corners (so
 * a transparent-PNG favicon falls back to whatever the caller chooses,
 * typically white). Returns an `rgb(...)` string or null if the image
 * can't be read (CORS) or every corner is transparent. */
function detectFaviconBg(img) {
  try {
    const w = img.naturalWidth, h = img.naturalHeight
    if (!w || !h) return null
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const data = ctx.getImageData(0, 0, w, h).data
    const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]]
    let r = 0, g = 0, b = 0, n = 0
    for (const [x, y] of corners) {
      const i = (y * w + x) * 4
      if (data[i + 3] < 128) continue
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++
    }
    if (!n) return null
    return `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`
  } catch {
    return null // CORS failure (image tainted)
  }
}

/* CompanyFavicon — pulls the favicon for `url` via Google's s2/favicons
 * service and renders it as a 24×24 image. Falls back to the
 * caller-provided `fallback` node on load error (e.g. for a fresh
 * intake before the URL resolves, or when the site has no favicon).
 *
 * Background color detection runs as a SEPARATE best-effort probe
 * with crossOrigin="anonymous" so the displayed image isn't blocked
 * when Google's service omits CORS headers. If the probe fails (CORS
 * or 404), onBgColor receives null and the parent uses its default. */
function CompanyFavicon({ url, fallback, onBgColor }) {
  const [errored, setErrored] = useState(false)
  // Reset the error flag when the URL changes — a new domain deserves
  // a fresh attempt before falling back.
  useEffect(() => { setErrored(false) }, [url])
  const domain = (url || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').trim()
  const src = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64` : null

  // Out-of-band color probe. Uses a detached Image with CORS so we
  // can read pixels; failure is silent (the visible img keeps working).
  useEffect(() => {
    if (!src || !onBgColor) return
    let cancelled = false
    const probe = new Image()
    probe.crossOrigin = 'anonymous'
    probe.onload = () => { if (!cancelled) onBgColor(detectFaviconBg(probe)) }
    probe.onerror = () => { if (!cancelled) onBgColor(null) }
    probe.src = src
    return () => { cancelled = true; probe.onload = null; probe.onerror = null }
  }, [src, onBgColor])

  if (!src || errored) return fallback
  return (
    <img
      src={src}
      alt=""
      width={24}
      height={24}
      style={{ display: 'block', width: 24, height: 24, borderRadius: 4 }}
      onError={() => setErrored(true)}
    />
  )
}

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
    <div className="cc-chips">
      {items.map((loc, i) => (
        <span key={`${loc.name}-${i}`} className="cc-chip cc-chip--loc">
          <MapPinIcon size={10} />
          <span>{loc.name}{loc.city ? ` · ${loc.city}` : ''}</span>
          <button
            type="button"
            className="cc-chip-x"
            onClick={() => remove(i)}
            aria-label={`Remove ${loc.name}`}
          >
            <XIcon size={10} />
          </button>
        </span>
      ))}
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
        <button type="button" className="cc-chip cc-chip--add" onClick={() => setAdding(true)}>
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

  // Background color of the favicon chip — auto-detected from the
  // favicon's corner pixels once it loads, defaults to white. Reset
  // whenever the URL changes so we re-sample for the new domain.
  const [faviconBg, setFaviconBg] = useState(null)
  useEffect(() => { setFaviconBg(null) }, [config.url])

  const update = (field, value) => onChange({ ...config, [field]: value })

  return (
    <div className={`cc ${editable ? 'cc--editable' : 'cc--readonly'}`}>
      {showHeader && (
        <header className="cc-head">
          <div className="cc-head-left">
            <span
              className="cc-head-mark"
              aria-hidden="true"
              style={{
                background: config.url
                  ? (faviconBg || 'var(--color-bg-secondary)')
                  : industry
                    ? `var(--color-${industry.color}-bg-tertiary)`
                    : 'var(--color-bg-secondary)',
                color: industry
                  ? `var(--color-${industry.color}-content-secondary)`
                  : undefined,
              }}
            >
              <CompanyFavicon
                url={config.url}
                fallback={industry ? <industry.Icon /> : <TeambridgeAIIcon size={16} />}
                onBgColor={setFaviconBg}
              />
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
          <div className="cc-chips">
            {(config.locations || []).map((loc, i) => (
              <span key={i} className="cc-chip cc-chip--readonly cc-chip--loc">
                <MapPinIcon size={10} />
                <span>{loc.name}{loc.city ? ` · ${loc.city}` : ''}</span>
              </span>
            ))}
          </div>
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

    </div>
  )
}
