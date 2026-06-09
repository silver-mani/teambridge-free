import { useEffect, useState } from 'react'

const BASE = import.meta.env.BASE_URL
const TEAMBRIDGE_LOGO =
  'https://cdn.prod.website-files.com/67adea23aa73a53ff4afb197/67b499f67cace40b0939e859_teambridge%20logo%20main.svg'
const ROBOT_ANIMATION = `${BASE}agents/nova.gif`

/* ──────────────────────────────────────────────────────────────────────
 * LeadCaptureGate
 *   Blur-backed modal that opens when a selected or built account is
 *   ready. Asks for contact context before letting them poke around
 *   the demo. Submission is persisted for the session
 *   (App owns the storage) so they don't see this again on every
 *   navigation. There is no dismiss-without-submitting affordance —
 *   the gate is the gate.
 * ────────────────────────────────────────────────────────────────────── */

// ─── Email quality classification ────────────────────────────────────────────
// Inline sets — no npm package, instant, zero bundle overhead.
// Two tiers: PERSONAL (free consumer providers) and DISPOSABLE (temp/burner).
// "work" is the residual: anything that passes both checks.

const PERSONAL_DOMAINS = new Set([
  // Google
  'gmail.com','googlemail.com',
  // Microsoft
  'outlook.com','hotmail.com','hotmail.co.uk','hotmail.fr','hotmail.de',
  'hotmail.es','hotmail.it','live.com','live.co.uk','live.fr','live.de',
  'msn.com','passport.com',
  // Apple
  'icloud.com','me.com','mac.com',
  // Yahoo
  'yahoo.com','yahoo.co.uk','yahoo.fr','yahoo.de','yahoo.es','yahoo.it',
  'yahoo.ca','yahoo.com.br','yahoo.com.mx','yahoo.com.ar','ymail.com','rocketmail.com',
  // AOL / Oath
  'aol.com','aim.com',
  // Privacy / encrypted
  'protonmail.com','proton.me','pm.me','tutanota.com','tuta.io','hey.com',
  // Zoho free tier
  'zoho.com',
  // Generic free
  'mail.com','email.com','inbox.com','fastmail.com','fastmail.fm',
  'gmx.com','gmx.net','gmx.de','web.de','freenet.de','t-online.de',
  // Russian / CIS
  'yandex.com','yandex.ru','mail.ru','bk.ru','list.ru','inbox.ru',
  // Asian providers
  'qq.com','163.com','126.com','sina.com','sina.cn',
  'naver.com','daum.net','hanmail.net',
  // European ISPs
  'orange.fr','laposte.net','sfr.fr','free.fr','wanadoo.fr',
  'libero.it','virgilio.it','tiscali.it','alice.it',
  'gmx.at','chello.at',
  'rambler.ru','ukr.net',
  // Other
  'rediffmail.com','indiatimes.com',
])

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','guerrillamail.net','guerrillamail.org',
  'guerrillamail.biz','guerrillamail.de','guerrillamail.info',
  'yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf','nospam.ze.tc',
  'nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf',
  'moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf',
  'tempmail.com','temp-mail.org','temp-mail.io','dispostable.com',
  'throwam.com','trashmail.com','trashmail.me','trashmail.net',
  'trashmail.at','trashmail.io','trashmail.org',
  'mailnull.com','maildrop.cc','sharklasers.com','guerrillamailblock.com',
  'grr.la','spam4.me','spamgourmet.com','spamgourmet.net','spamgourmet.org',
  'spammotel.com','spamspot.com','spambox.us',
  'spamhole.com','spaml.com','spaml.de','spamoff.de',
  'getairmail.com','filzmail.com',
  'fakeinbox.com','fakeinbox.net','fakeinbox.org',
  'mailexpire.com','mailscrap.com','mailnew.com',
  'tempemail.net','tempinbox.com','tempinbox.net','tempinbox.co.uk',
  'discard.email','discardmail.com','discardmail.de',
  'spamgrab.net','spamavert.com','spam.la','spam.su',
  'bogusmailaddress.com','dontreg.com','dontsendmespam.de',
  'example.com','test.com','test.org','testing.com',
  'nospamfor.us','nospam4.us','no-spam.ws','no-spam.host',
  'jetable.com','jetable.net','jetable.org','jetable.fr',
  'despam.it','despammed.com',
  'obobbo.com','spamfree24.org','spamfree24.de','spamfree24.info',
  'spamfree24.biz','spamfree24.eu',
  'kasmail.com','lol.ovpn.to','trbvm.com','33mail.com',
  'cuvox.de','dayrep.com','einrot.com','fleckens.hu',
  'gustr.com','harakirimail.com','jourrapide.com','objectmail.com',
  'ownmail.net','pecinan.com','rhyta.com','superrito.com',
  'teleworm.us','tinyurl24.com','zetmail.com',
])

/**
 * Returns "work" | "personal" | "disposable".
 * Quality is set client-side and trusted — no server re-check.
 */
function classifyEmail(email) {
  const trimmed = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'personal'
  const domain = trimmed.split('@')[1]
  if (DISPOSABLE_DOMAINS.has(domain)) return 'disposable'
  if (PERSONAL_DOMAINS.has(domain)) return 'personal'
  return 'work'
}

function normalizeDomain(value) {
  const raw = String(value || '').trim().toLowerCase()
  const fromEmail = raw.includes('@') ? raw.split('@').pop() : raw
  return fromEmail
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/[^a-z0-9.-]/g, '')
}

function companyFromDomain(domain) {
  const root = domain.split('.')[0] || ''
  return root
    ? root.replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    : ''
}

// Maps an Abstract API rejection reason to a short, human message for the gate.
function messageForReason(reason) {
  switch (reason) {
    case 'free_email':
      return 'Use a company email so Nova can attach the workspace to the right organization.'
    case 'disposable':
      return "Temporary addresses can't unlock a saved workspace."
    case 'high_risk':
      return 'That address looks risky — please use your main work email.'
    case 'no_mx':
      return "We couldn't find a mail server for that domain. Double-check the spelling?"
    default:
      return "That email doesn't look reachable. Please double-check it."
  }
}

export default function LeadCaptureGate({ onSubmit, onShown, sessionId, delayMs = 3000, title = 'Your workspace is ready', subtitle = 'Use a verified work email so Nova can save this workspace, connect your walkthrough to the right organization, and keep your follow-up notes together.' }) {
  const [visible, setVisible]   = useState(false)
  const [email, setEmail]       = useState('')
  const [touched, setTouched]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [emailAttempts, setEmailAttempts] = useState([])
  const [serverError, setServerError] = useState('')

  // Pop after the configured delay. Direct demo visitors use 0ms so the
  // gate appears immediately; approved landing visitors skip the gate.
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true)
      onShown?.()
    }, delayMs)
    return () => clearTimeout(t)
  }, [delayMs, onShown])

  // Lock body scroll while the gate is up so the blurred surface
  // can't be scrolled around behind the modal.
  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [visible])

  if (!visible) return null

  const domain = normalizeDomain(email)
  const emailQuality = classifyEmail(email)
  const emailOk = emailQuality === 'work'

  const submit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (submitting) return

    if (!emailOk) {
      const attempt = {
        email: email.trim().toLowerCase(),
        quality: emailQuality,
        blockedAt: Date.now(),
      }
      setEmailAttempts(prev => [...prev, attempt])

      // Fire-and-forget log to server — never blocks the UX
      if (sessionId) {
        fetch('/api/log-email-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            attemptedEmail: attempt.email,
            emailQuality,
            userAgent: navigator.userAgent,
          }),
          keepalive: true,
        }).catch(() => { /* swallowed — log failure is non-fatal */ })
      }
      return // keep gate open
    }

    setSubmitting(true)
    setServerError('')

    // Server-side verification via Abstract API — the same email check every
    // other Teambridge form runs (full SMTP + mailbox existence + risk),
    // catching undeliverable mailboxes, catch-all domains, and high-risk
    // addresses that the client-side classifier can't see. Fails open so an
    // API hiccup never blocks a real prospect. This is a quick (~1-2s) check —
    // not the old 60s company research.
    const cleanEmail = email.trim().toLowerCase()
    let verification = { valid: true }
    try {
      const r = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })
      if (r.ok) verification = await r.json()
    } catch {
      verification = { valid: true, reason: 'fetch_error' } // fail open
    }

    if (verification && verification.valid === false) {
      const quality = verification.quality || 'undeliverable'
      const attempt = { email: cleanEmail, quality, blockedAt: Date.now() }
      setEmailAttempts(prev => [...prev, attempt])
      if (sessionId) {
        fetch('/api/log-email-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, attemptedEmail: cleanEmail, emailQuality: quality, userAgent: navigator.userAgent }),
          keepalive: true,
        }).catch(() => {})
      }
      setServerError(messageForReason(verification.reason))
      setSubmitting(false)
      return // keep gate open
    }

    // Verified. Enter immediately — company research no longer blocks here
    // (it used to take up to ~60s); the lead is captured and enriched in the
    // background by the parent, and richer research still runs in the
    // build/onboarding flow if they build a workspace.
    onSubmit({
      name: '',
      company: companyFromDomain(domain),
      email: cleanEmail,
      submittedDomain: domain,
      submittedContact: cleanEmail,
      contactInputType: 'email',
      emailQuality: 'work',
      emailAttempts,
      domainResearch: null,
    })
  }

  return (
    <div className="lead-gate-backdrop" role="dialog" aria-modal="true" aria-labelledby="lead-gate-title">
      <div className="lead-gate-modal">
        <div className="lead-gate-visual" aria-hidden="true">
          <div className="lead-gate-brand">
            <img src={TEAMBRIDGE_LOGO} alt="" className="lead-gate-logo" />
            <span>Live demo</span>
          </div>
          <div className="lead-gate-unlock-card">
            <div className="lead-gate-unlock-head">
              <img src={ROBOT_ANIMATION} alt="" />
              <div>
                <span>Specialist online</span>
                <strong>Nova is your guide for this live demo.</strong>
              </div>
            </div>
            <div className="lead-gate-unlock-preview">
              <span>Schedule loaded</span>
              <span>Compliance rules attached</span>
              <span>Agent actions ready</span>
            </div>
          </div>
          <p className="lead-gate-visual-note">Nova uses your work email domain to keep the walkthrough specific to your team, not generic demo data.</p>
        </div>
        <div className="lead-gate-panel">
          <div className="lead-gate-mark" aria-hidden="true">
            <img src={TEAMBRIDGE_LOGO} alt="" />
          </div>
          <div className="lead-gate-nova-note">
            <img src={ROBOT_ANIMATION} alt="" />
            <p>Before we start, add your work email. I use it to tailor the demo to your organization and keep your session together.</p>
          </div>
          <h2 id="lead-gate-title" className="lead-gate-title">{title}</h2>
          <p className="lead-gate-sub">
            {subtitle}
          </p>

          <form className="lead-gate-form" onSubmit={submit} noValidate>
            <label className="lead-gate-field">
              <span className="lead-gate-label">Work email</span>
              <input
                className={`lead-gate-input ${(touched && !emailOk) || serverError ? 'is-invalid' : ''}`}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setServerError('') }}
                placeholder="alex@company.com"
                autoFocus
              />
              {touched && !emailOk ? (
                <span className="lead-gate-hint">
                  {email.trim().length === 0
                    ? 'Work email required.'
                    : emailQuality === 'disposable'
                    ? "Temporary addresses can't unlock a saved workspace."
                    : 'Use a company email so Nova can attach the workspace to the right organization.'}
                </span>
              ) : serverError ? (
                <span className="lead-gate-hint">{serverError}</span>
              ) : null}
            </label>

            <button
              type="submit"
              className="lead-gate-submit"
              disabled={email.trim().length === 0 || submitting}
            >
              {submitting ? 'Verifying…' : 'Start Demo Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
