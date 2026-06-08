import { useEffect, useState } from 'react'
import { deriveConfig } from './onboarding/urlMatcher.js'

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

function isLikelyDomain(value) {
  const domain = normalizeDomain(value)
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domain)
}

function companyFromDomain(domain) {
  const root = domain.split('.')[0] || ''
  return root
    ? root.replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    : ''
}

function syntheticEmailForDomain(domain) {
  return `demo@${domain}`
}

export default function LeadCaptureGate({ onSubmit, onShown, sessionId, delayMs = 3000, title = 'Your workspace is ready', subtitle = 'Share a work email or company domain so Nova can save the workspace, research the organization, and keep the walkthrough relevant to your operation.' }) {
  const [visible, setVisible]   = useState(false)
  const [contact, setContact]   = useState('')
  const [touched, setTouched]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
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

  const domain = normalizeDomain(contact)
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim().toLowerCase())
  const contactOk = isEmail
    ? classifyEmail(contact) === 'work'
    : isLikelyDomain(contact) && !PERSONAL_DOMAINS.has(domain) && !DISPOSABLE_DOMAINS.has(domain)
  const displayQuality = isEmail
    ? classifyEmail(contact)
    : DISPOSABLE_DOMAINS.has(domain)
    ? 'disposable'
    : PERSONAL_DOMAINS.has(domain) || !isLikelyDomain(contact)
    ? 'personal'
    : 'domain'

  const submit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (submitting) return

    if (!contactOk) {
      const attempt = {
        email: contact.trim().toLowerCase(),
        quality: displayQuality,
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
            emailQuality: displayQuality,
            userAgent: navigator.userAgent,
          }),
          keepalive: true,
        }).catch(() => { /* swallowed — log failure is non-fatal */ })
      }
      return // keep gate open
    }

    setSubmitting(true)
    let domainResearch = null
    try {
      domainResearch = await deriveConfig(`https://${domain}`, { fromFreeText: false })
    } catch {
      domainResearch = null
    }

    onSubmit({
      name: '',
      company: domainResearch?.companyName || companyFromDomain(domain),
      email: isEmail ? contact.trim().toLowerCase() : syntheticEmailForDomain(domain),
      submittedDomain: domain,
      submittedContact: contact.trim().toLowerCase(),
      contactInputType: isEmail ? 'email' : 'domain',
      emailQuality: isEmail ? 'work' : 'domain',
      emailAttempts,
      domainResearch,
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
                <strong>Nova prepared this workspace for your session.</strong>
              </div>
            </div>
            <div className="lead-gate-unlock-preview">
              <span>Schedule loaded</span>
              <span>Compliance rules attached</span>
              <span>Agent actions ready</span>
            </div>
          </div>
          <p className="lead-gate-visual-note">Nova uses your company context to make the walkthrough specific to your team, not generic demo data.</p>
        </div>
        <div className="lead-gate-panel">
          <div className="lead-gate-mark" aria-hidden="true">
            <img src={TEAMBRIDGE_LOGO} alt="" />
          </div>
          <div className="lead-gate-nova-note">
            <img src={ROBOT_ANIMATION} alt="" />
            <p>Before I open it, share a work email or company domain. I use it to save this workspace and tailor the walkthrough to the operation I find.</p>
          </div>
          <h2 id="lead-gate-title" className="lead-gate-title">{title}</h2>
          <p className="lead-gate-sub">
            {subtitle}
          </p>

          <form className="lead-gate-form" onSubmit={submit} noValidate>
            <label className="lead-gate-field">
              <span className="lead-gate-label">Work email or company domain</span>
              <input
                className={`lead-gate-input ${touched && !contactOk ? 'is-invalid' : ''}`}
                type="text"
                autoComplete="email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="alex@company.com or company.com"
                autoFocus
              />
              {touched && !contactOk && (
                <span className="lead-gate-hint">
                  {contact.trim().length === 0
                    ? 'Work email or company domain required.'
                    : displayQuality === 'disposable'
                    ? "Temporary addresses can't unlock a saved workspace."
                    : 'Use a company address or domain so Nova can attach the workspace to the right organization.'}
                </span>
              )}
            </label>

            <button
              type="submit"
              className="lead-gate-submit"
              disabled={contact.trim().length === 0 || submitting}
            >
              {submitting ? 'Researching workspace...' : 'Start Demo Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
