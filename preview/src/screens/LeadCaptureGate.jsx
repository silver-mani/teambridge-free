import { useEffect, useState } from 'react'
import { TeambridgeAIIcon } from '../../../src/components/icons/TeambridgeAIIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * LeadCaptureGate
 *   Blur-backed modal that pops 3 seconds after the user lands inside
 *   any account. Asks for name + company + work email before letting
 *   them poke around the demo. Submission is persisted for the session
 *   (App owns the storage) so they don't see this again on every
 *   navigation. There is no dismiss-without-submitting affordance —
 *   the gate is the gate.
 * ────────────────────────────────────────────────────────────────────── */

const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'aol.com', 'msn.com', 'live.com', 'me.com', 'mac.com', 'proton.me', 'protonmail.com',
])

function isWorkEmail(email) {
  const trimmed = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return false
  const domain = trimmed.split('@')[1]
  return !PERSONAL_EMAIL_DOMAINS.has(domain)
}

export default function LeadCaptureGate({ onSubmit }) {
  const [visible, setVisible]   = useState(false)
  const [name, setName]         = useState('')
  const [company, setCompany]   = useState('')
  const [email, setEmail]       = useState('')
  const [touched, setTouched]   = useState(false)

  // Pop after 3s so the operator gets a glimpse of the dashboard first.
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(t)
  }, [])

  // Lock body scroll while the gate is up so the blurred surface
  // can't be scrolled around behind the modal.
  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [visible])

  if (!visible) return null

  const nameOk    = name.trim().length >= 2
  const companyOk = company.trim().length >= 2
  const emailOk   = isWorkEmail(email)
  const valid     = nameOk && companyOk && emailOk

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    onSubmit({ name: name.trim(), company: company.trim(), email: email.trim().toLowerCase() })
  }

  return (
    <div className="lead-gate-backdrop" role="dialog" aria-modal="true" aria-labelledby="lead-gate-title">
      <div className="lead-gate-modal">
        <div className="lead-gate-mark" aria-hidden="true">
          <TeambridgeAIIcon size={20} />
        </div>
        <h2 id="lead-gate-title" className="lead-gate-title">Continue your demo</h2>
        <p className="lead-gate-sub">
          Tell us a little about yourself so we can keep this demo working
          for your team. We'll only use this to follow up if you ask us to.
        </p>

        <form className="lead-gate-form" onSubmit={submit} noValidate>
          <label className="lead-gate-field">
            <span className="lead-gate-label">Your name</span>
            <input
              className={`lead-gate-input ${touched && !nameOk ? 'is-invalid' : ''}`}
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              autoFocus
            />
          </label>
          <label className="lead-gate-field">
            <span className="lead-gate-label">Company</span>
            <input
              className={`lead-gate-input ${touched && !companyOk ? 'is-invalid' : ''}`}
              type="text"
              autoComplete="organization"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Levi's Stadium Operations"
            />
          </label>
          <label className="lead-gate-field">
            <span className="lead-gate-label">Work email</span>
            <input
              className={`lead-gate-input ${touched && !emailOk ? 'is-invalid' : ''}`}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@yourcompany.com"
            />
            {touched && !emailOk && (
              <span className="lead-gate-hint">
                {email.trim().length === 0
                  ? 'Work email required.'
                  : 'Please use your work email — we can\'t verify personal addresses.'}
              </span>
            )}
          </label>

          <button
            type="submit"
            className="lead-gate-submit"
            disabled={!valid}
          >
            Continue to demo
          </button>
        </form>
      </div>
    </div>
  )
}
