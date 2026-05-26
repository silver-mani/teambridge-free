import { useState } from 'react'
import { TeambridgeAIIcon } from '../../../../src/components/icons/TeambridgeAIIcon.tsx'

/* Renders the operator's company logo when we have a URL to derive it
 * from, falls back to the Teambridge mark otherwise. We fetch the
 * favicon through Google's s2 service — it accepts a bare domain and
 * 404s gracefully if the company doesn't expose one, in which case the
 * onError handler swaps in the Teambridge AI mark so the brand row
 * always renders something. */
function faviconUrl(url, size) {
  if (!url) return null
  const bare = String(url).trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
  if (!bare) return null
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(bare)}&sz=${size * 2}`
}

export default function CompanyLogo({ url, size = 18, fallbackSize }) {
  const [errored, setErrored] = useState(false)
  const src = faviconUrl(url, size)
  if (!src || errored) {
    return <TeambridgeAIIcon size={fallbackSize ?? size} />
  }
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      onError={() => setErrored(true)}
      style={{ display: 'block', borderRadius: 4, objectFit: 'contain' }}
    />
  )
}
