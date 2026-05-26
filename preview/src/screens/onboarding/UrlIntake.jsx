import { useState, useRef, useEffect } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ArrowNarrowUpIcon } from '../../../../src/components/icons/ArrowNarrowUpIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * UrlIntake — Screen 1. A single input for the company URL (or, after
 * a failed match, a free-text description). One input, one decision.
 *
 * Nova's intro message lives above the input to set context: "I'll
 * derive the rest from your site."
 * ────────────────────────────────────────────────────────────────────── */

export default function UrlIntake({
  mode = 'url',          // 'url' | 'free-text'
  onSubmit,
  error,
}) {
  const [value, setValue] = useState('')
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [mode])

  const handleSubmit = (e) => {
    e.preventDefault()
    const v = value.trim()
    if (!v) return
    onSubmit(v)
  }

  const isUrl = mode === 'url'

  return (
    <section className="ui-intake" aria-label="Get started">
      <div className="ui-intake-inner">
        <div className="ui-intake-mark" aria-hidden="true">
          <TeambridgeAIIcon size={28} />
        </div>

        <h1 className="ui-intake-title">
          {isUrl ? "Let's build your Teambridge in 60 seconds." : "Tell me what your team does."}
        </h1>

        <p className="ui-intake-sub">
          {isUrl
            ? "Drop in your company's website and I'll set up your account from what I learn about you — industry, headcount, locations, and the agents you'll need from day one."
            : "I couldn't fully read that site. A two-line description of your business is plenty for me to set things up."}
        </p>

        <form className="ui-intake-form" onSubmit={handleSubmit}>
          <div className="ui-intake-field">
            {isUrl && <span className="ui-intake-prefix">https://</span>}
            <input
              ref={ref}
              type="text"
              className={`ui-intake-input ${error ? 'is-invalid' : ''}`}
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={isUrl ? 'yourcompany.com' : 'e.g. We run 3 senior-living communities across Los Angeles.'}
              autoComplete="off"
              spellCheck={!isUrl}
            />
            <button
              type="submit"
              className="ui-intake-submit"
              disabled={!value.trim()}
              aria-label="Continue"
            >
              <ArrowNarrowUpIcon size={16} />
            </button>
          </div>

          {error && <span className="ui-intake-error">{error}</span>}

          {isUrl && (
            <p className="ui-intake-hint">
              Try one of these to see how the demo works:{' '}
              <button type="button" className="ui-intake-example" onClick={() => onSubmit('hollywoodparkca.com')}>
                hollywoodparkca.com
              </button>
              {' · '}
              <button type="button" className="ui-intake-example" onClick={() => onSubmit('dignityhealth.org')}>
                dignityhealth.org
              </button>
              {' · '}
              <button type="button" className="ui-intake-example" onClick={() => onSubmit('marriott.com')}>
                marriott.com
              </button>
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
