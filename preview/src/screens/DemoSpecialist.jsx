import { useEffect, useMemo, useRef, useState } from 'react'
import { trackDemoEvent, getDemoSnapshot } from '../lib/demoTracking.js'

const BASE = import.meta.env.BASE_URL
const NOVA_AVATAR = `${BASE}agents/nova.gif`
const WIDGET_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed'

function loadWidgetScript() {
  if (typeof document === 'undefined') return Promise.resolve()
  if (customElements.get('elevenlabs-convai')) return Promise.resolve()

  const ready = customElements
    .whenDefined('elevenlabs-convai')
    .then(() => undefined)

  if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return ready

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = WIDGET_SRC
    script.async = true
    script.type = 'text/javascript'
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
    ready.then(resolve).catch(() => {})
  })
}

function readJsonStorage(key) {
  try {
    const raw = sessionStorage.getItem(key) || localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setHashPath(path) {
  if (!path || typeof path !== 'string') return
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (window.location.hash !== `#${normalized}`) {
    window.location.hash = normalized
  }
}

export function openDemoSpecialist(source = 'unknown') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('tb:open-demo-specialist', { detail: { source } }))
}

function routeForView(view) {
  const snapshot = getDemoSnapshot()
  const currentIndustry = snapshot.industry && snapshot.industry !== 'demos'
    ? snapshot.industry
    : 'healthcare'
  const safeView = String(view || 'overview').replace(/^\/+/, '')

  if (safeView === 'sage' || safeView === 'sage-dashboard') return '/sage'
  if (safeView === 'sage-workforce') return '/sage/workforce'
  if (safeView.includes('/')) return `/${safeView}`
  return safeView === 'overview'
    ? `/${currentIndustry}`
    : `/${currentIndustry}/${safeView}`
}

function highlightSelector(selector, label) {
  const el = selector ? document.querySelector(selector) : null
  if (!el) return { ok: false, reason: 'target_not_found' }

  el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  el.classList.add('demo-specialist-highlight')
  el.setAttribute('data-specialist-highlight', label || 'Teambridge specialist')
  window.setTimeout(() => {
    el.classList.remove('demo-specialist-highlight')
    el.removeAttribute('data-specialist-highlight')
  }, 5200)
  return { ok: true }
}

export default function DemoSpecialist({ enabled, route, autoOpen = false }) {
  const [open, setOpen] = useState(false)
  const [signedUrl, setSignedUrl] = useState('')
  const [conversationId, setConversationId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const widgetRef = useRef(null)
  const autoStartRef = useRef(false)

  const lead = useMemo(() => readJsonStorage('tb:lead-data') || {}, [enabled, route])
  const dynamicVariables = useMemo(() => {
    const snapshot = getDemoSnapshot()
    return JSON.stringify({
      user_name: lead.name || lead.firstName || 'there',
      company: lead.company || 'your team',
      work_email: lead.email || '',
      industry: snapshot.industry || 'unknown',
      demo_view: snapshot.view || 'overview',
      demo_session_id: snapshot.sessionId,
    })
  }, [lead, route])

  useEffect(() => {
    if (!enabled) return undefined

    const handleOpen = event => {
      setOpen(true)
      trackDemoEvent('demo_specialist_open_requested', {
        source: event?.detail?.source || 'unknown',
      })
    }

    window.addEventListener('tb:open-demo-specialist', handleOpen)
    return () => window.removeEventListener('tb:open-demo-specialist', handleOpen)
  }, [enabled])

  useEffect(() => {
    if (!enabled || !autoOpen) return undefined

    const timer = window.setTimeout(() => {
      setOpen(true)
      trackDemoEvent('demo_specialist_auto_opened', { source: 'entry_page' })
    }, 900)

    return () => window.clearTimeout(timer)
  }, [enabled, autoOpen])

  useEffect(() => {
    if (!enabled || !open || signedUrl || loading) return
    let cancelled = false
    setLoading(true)
    setError('')

    loadWidgetScript().catch(err => {
      if (cancelled) return
      trackDemoEvent('demo_specialist_widget_load_failed', {
        error: String(err?.message || err),
      })
    })

    fetch('/api/elevenlabs-signed-url', { headers: { accept: 'application/json' } })
      .then(async response => {
        const body = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(body?.error || 'Unable to start specialist')
        return body
      })
      .then(body => {
        if (cancelled) return
        setSignedUrl(body.signedUrl || '')
        setConversationId(body.conversationId || '')
        trackDemoEvent('demo_specialist_ready', {
          conversationId: body.conversationId,
          agentId: body.agentId,
        })
      })
      .catch(err => {
        if (cancelled) return
        setError(String(err?.message || err))
        trackDemoEvent('demo_specialist_setup_failed', {
          error: String(err?.message || err),
        })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [enabled, open, signedUrl])

  useEffect(() => {
    const widget = widgetRef.current
    if (!widget) return

    const handleCall = event => {
      const detail = event.detail
      if (!detail) return
      detail.config = detail.config || {}
      detail.config.clientTools = {
        navigateToDemoView: ({ view }) => {
          const path = routeForView(view)
          setHashPath(path)
          trackDemoEvent('demo_specialist_tool_navigate', { view, path, conversationId })
          return { ok: true, path }
        },
        runDemoScenario: ({ scenario }) => {
          const key = String(scenario || '').toLowerCase()
          let path = routeForView('overview')
          if (key.includes('schedule') || key.includes('shift')) path = routeForView('schedule')
          if (key.includes('payroll') || key.includes('pay')) path = routeForView('pay')
          if (key.includes('onboarding')) path = routeForView('onboarding')
          if (key.includes('compliance') || key.includes('policy')) path = routeForView('policies')
          if (key.includes('overtime') || key.includes('sage')) path = '/sage'
          setHashPath(path)
          trackDemoEvent('demo_specialist_tool_scenario', { scenario, path, conversationId })
          return { ok: true, path }
        },
        highlightDemoArea: ({ selector, label }) => {
          const result = highlightSelector(selector, label)
          trackDemoEvent('demo_specialist_tool_highlight', { selector, label, ...result, conversationId })
          return result
        },
        saveDemoNote: ({ note, intent, nextStep }) => {
          const payload = { note, intent, nextStep, conversationId }
          try {
            const notes = JSON.parse(localStorage.getItem('tb:demo-specialist-notes') || '[]')
            notes.push({ ...payload, at: Date.now(), route: window.location.href })
            localStorage.setItem('tb:demo-specialist-notes', JSON.stringify(notes.slice(-30)))
          } catch { /* ignore */ }
          trackDemoEvent('demo_specialist_note_saved', payload)
          return { ok: true }
        },
        requestMeeting: ({ reason }) => {
          trackDemoEvent('demo_specialist_meeting_requested', { reason, conversationId })
          window.open('https://www.teambridge.com/book-demo/schedule', '_blank', 'noopener,noreferrer')
          return { ok: true }
        },
      }
    }

    widget.addEventListener('elevenlabs-convai:call', handleCall)
    return () => widget.removeEventListener('elevenlabs-convai:call', handleCall)
  }, [conversationId, signedUrl])

  useEffect(() => {
    if (!open || !signedUrl || autoStartRef.current) return undefined
    autoStartRef.current = true

    let attempts = 0
    const timer = window.setInterval(() => {
      attempts += 1
      const widget = widgetRef.current
      const root = widget?.shadowRoot
      const controls = root ? Array.from(root.querySelectorAll('button, [role="button"]')) : []
      const start = controls.find(control => {
        const label = [
          control.getAttribute('aria-label'),
          control.getAttribute('title'),
          control.textContent,
        ].filter(Boolean).join(' ').toLowerCase()
        return label.includes('start') || label.includes('call')
      })

      if (start) {
        start.click()
        trackDemoEvent('demo_specialist_auto_start_attempted', { attempts })
        window.clearInterval(timer)
      } else if (attempts >= 12) {
        trackDemoEvent('demo_specialist_auto_start_unavailable', { attempts })
        window.clearInterval(timer)
      }
    }, 500)

    return () => window.clearInterval(timer)
  }, [open, signedUrl])

  if (!enabled) return null

  return (
    <div className={`demo-specialist ${open ? 'is-open' : ''}`}>
      {open && (
        <section className="demo-specialist-widget" aria-label="Teambridge AI demo specialist">
          {loading && <div className="demo-specialist-state">Connecting Nova...</div>}
          {error && (
            <div className="demo-specialist-state demo-specialist-state--error">
              {error}
            </div>
          )}
          {signedUrl && (
            <elevenlabs-convai
              ref={widgetRef}
              signed-url={signedUrl}
              server-location="us"
              variant="expanded"
              dismissible="true"
              default-expanded="true"
              avatar-image-url={NOVA_AVATAR}
              action-text="Talk to Teambridge"
              start-call-text="Start voice demo"
              end-call-text="End demo"
              listening-text="Listening..."
              speaking-text="Nova is speaking"
              dynamic-variables={dynamicVariables}
            />
          )}
        </section>
      )}
    </div>
  )
}
