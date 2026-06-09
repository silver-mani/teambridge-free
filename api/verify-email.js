/* Vercel serverless function — verifies a work email via Abstract API's
 * Email Reputation endpoint (full SMTP + mailbox existence + risk scoring),
 * mirroring the /api/verify-email route on www.teambridge.com so the free-tier
 * lead gate validates the same way as every other Teambridge form.
 *
 * Blocking rules:
 *   - deliverability status === "undeliverable" → invalid mailbox / domain
 *   - email_risk.address_risk_status === "high"  → suspicious address
 *   - email_quality.is_disposable                → temp / burner address
 *   - email_quality.is_free_email                → personal mailbox provider
 *
 * Requires ABSTRACT_EMAIL_API_KEY in the Vercel env. Falls back to an MX
 * lookup when the key is absent, and fails open on API / network errors so
 * infra issues never block a real prospect. */

import { promises as dns } from 'dns'

const ABSTRACT_API_KEY = process.env.ABSTRACT_EMAIL_API_KEY
const ABSTRACT_URL = 'https://emailreputation.abstractapi.com/v1/'

const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'ymail.com',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com',
  'proton.me', 'protonmail.com', 'pm.me',
])

function emailDomain(email) {
  return email.split('@')[1]?.trim().toLowerCase() ?? ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ valid: false, error: 'method_not_allowed' })
  }

  let email
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}')
    email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : undefined
  } catch {
    return res.status(200).json({ valid: false })
  }

  if (!email || !email.includes('@')) {
    return res.status(200).json({ valid: false })
  }

  const domain = emailDomain(email)
  if (PERSONAL_EMAIL_DOMAINS.has(domain)) {
    return res.status(200).json({ valid: false, reason: 'free_email', quality: 'personal' })
  }

  // No API key — fall back to a basic MX check so the gate still works.
  if (!ABSTRACT_API_KEY) {
    try {
      const records = await dns.resolveMx(domain)
      return res.status(200).json({ valid: records.length > 0, reason: 'mx_fallback' })
    } catch {
      return res.status(200).json({ valid: false, reason: 'no_mx' })
    }
  }

  try {
    const url = `${ABSTRACT_URL}?api_key=${ABSTRACT_API_KEY}&email=${encodeURIComponent(email)}`
    const upstream = await fetch(url)

    // API error — don't block real users.
    if (!upstream.ok) {
      return res.status(200).json({ valid: true, reason: 'api_error' })
    }

    const data = await upstream.json()
    const status = data?.email_deliverability?.status
    const risk = data?.email_risk?.address_risk_status
    const isDisposable = data?.email_quality?.is_disposable
    const isFreeEmail = data?.email_quality?.is_free_email

    if (status === 'undeliverable') {
      return res.status(200).json({
        valid: false,
        reason: data?.email_deliverability?.status_detail ?? 'undeliverable',
      })
    }
    if (risk === 'high') {
      return res.status(200).json({ valid: false, reason: 'high_risk' })
    }
    if (isDisposable) {
      return res.status(200).json({ valid: false, reason: 'disposable', quality: 'disposable' })
    }
    if (isFreeEmail) {
      return res.status(200).json({ valid: false, reason: 'free_email', quality: 'personal' })
    }

    return res.status(200).json({ valid: true, reason: status ?? 'ok' })
  } catch {
    // Network failure — fail open so infra never blocks a real prospect.
    return res.status(200).json({ valid: true, reason: 'fetch_error' })
  }
}
