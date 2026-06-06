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
export default function LeadCaptureGate({ onSubmit, onShown, sessionId, delayMs = 3000 }) {
  const [visible, setVisible]   = useState(false)
  const [name, setName]         = useState('')
  const [company, setCompany]   = useState('')
  const [email, setEmail]       = useState('')
  const [touched, setTouched]   = useState(false)
  const [emailAttempts, setEmailAttempts] = useState([])

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

  const nameOk    = name.trim().length >= 2
  const companyOk = company.trim().length >= 2
  const emailOk   = classifyEmail(email) === 'work'
  const valid     = nameOk && companyOk && emailOk

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!nameOk || !companyOk) return

    const quality = classifyEmail(email)
    if (quality !== 'work') {
      const attempt = {
        email: email.trim().toLowerCase(),
        quality,
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
            emailQuality: quality,
            userAgent: navigator.userAgent,
          }),
          keepalive: true,
        }).catch(() => { /* swallowed — log failure is non-fatal */ })
      }
      return // keep gate open
    }

    onSubmit({
      name: name.trim(),
      company: company.trim(),
      email: email.trim().toLowerCase(),
      emailQuality: 'work',
      emailAttempts,
    })
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
                  : classifyEmail(email) === 'disposable'
                  ? "Temporary email addresses aren't allowed. Please use your work email."
                  : "Please use your work email — we can't verify personal addresses."}
              </span>
            )}
          </label>

          <button
            type="submit"
            className="lead-gate-submit"
            disabled={!nameOk || !companyOk || email.trim().length === 0}
          >
            Continue to demo
          </button>
        </form>
      </div>
    </div>
  )
}
