import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import EntryChoice        from './screens/EntryChoice.jsx'
import IndustrySelector   from './screens/IndustrySelector.jsx'
import Act1Dashboard      from './screens/Act1Dashboard.jsx'
import SageDashboard      from './screens/sage/SageDashboard.jsx'
import SageWorkforceEmbed from './screens/sage/SageWorkforceEmbed.jsx'
import LeadCaptureGate    from './screens/LeadCaptureGate.jsx'
import OnboardingFlow     from './screens/onboarding/OnboardingFlow.jsx'
import { getDemoSnapshot, initDemoBehaviorTracking, trackDemoEvent } from './lib/demoTracking.js'

const VALID_INDUSTRIES = new Set([
  'healthcare', 'staffing', 'events', 'security', 'light-industrial', 'construction',
  'hospitality', 'long-term-care', 'janitorial',
])

function parseHash() {
  const raw = (window.location.hash || '').replace(/^#/, '').replace(/^\//, '').trim()
  if (!raw) return null
  const segs = raw.split('/')
  // #/build → guided onboarding flow
  if (segs[0] === 'build') return { kind: 'build' }
  // #/demos → existing industry picker (entry choice routes here)
  if (segs[0] === 'demos') return { kind: 'demos' }
  if (segs[0] === 'sage') {
    const sub = segs[1] || 'dashboard'
    const sageOk = new Set(['dashboard', 'workforce'])
    return { kind: 'sage', view: sageOk.has(sub) ? sub : 'dashboard' }
  }
  const [industry, view = 'overview'] = segs
  if (!VALID_INDUSTRIES.has(industry)) return null
  const viewOk = new Set([
    'overview', 'schedule', 'people', 'pay', 'workflows', 'engage', 'policies',
    'time-tracking', 'shift-requests', 'settings',
    'onboarding', 'timesheets', 'review',
  ])
  return { kind: 'industry', industry, view: viewOk.has(view) ? view : 'overview' }
}

function setHash(path) {
  // Use replaceState so the title updates without piling history when bouncing.
  if (window.location.hash !== `#${path}`) {
    window.location.hash = path
  }
}

function readDemoAccessToken() {
  try {
    return new URLSearchParams(window.location.search).get('tb_demo_access')
  } catch {
    return null
  }
}

function removeDemoAccessTokenFromUrl() {
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('tb_demo_access')) return
    url.searchParams.delete('tb_demo_access')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  } catch { /* ignore */ }
}

/**
 * App shell for the Teambridge Free sandbox.
 * The URL hash drives the screen — `#/` shows the industry picker, while
 * `#/events`, `#/healthcare`, etc. deep-link straight into a dashboard.
 */
function App() {
  const [route, setRoute] = useState(() => parseHash())
  useEffect(() => {
    initDemoBehaviorTracking()
    trackDemoEvent('session_started')
  }, [])
  // Cross-route flag for the OT-fix story arc. The CFO clicks Resolve OT
  // Crisis on the Sage dashboard → lands in workforce → runs Nova's
  // replacement flow. When the flow completes we flip this to true so
  // the Sage dashboard, schedule grid, and stats drawer all reflect the
  // post-fix state. Stored in sessionStorage so the flag survives a
  // hash change but resets on a fresh tab.
  const [otFixed, setOtFixedRaw] = useState(() => {
    try { return sessionStorage.getItem('tb:ot-fixed') === '1' } catch { return false }
  })
  const setOtFixed = (next) => {
    setOtFixedRaw(next)
    try {
      if (next) sessionStorage.setItem('tb:ot-fixed', '1')
      else sessionStorage.removeItem('tb:ot-fixed')
    } catch { /* ignore */ }
  }

  // Lead capture — gate the demo behind a name / company / work-email
  // form 3 seconds after the user lands inside any account. Persisted
  // for the session so they don't see it again on every navigation.
  // Operators who came through the build flow are also exempt: they
  // already gave us their company URL on intake, so popping a second
  // capture on top of their freshly-built account reads as a bait-
  // and-switch. tb:build-config presence is the signal.
  const [leadCaptured, setLeadCaptured] = useState(() => {
    try {
      if (sessionStorage.getItem('tb:lead') === '1') return true
      if (sessionStorage.getItem('tb:build-config')) return true
      return false
    } catch { return false }
  })
  const [accessChecked, setAccessChecked] = useState(() => {
    try {
      return !readDemoAccessToken() || sessionStorage.getItem('tb:lead') === '1'
    } catch {
      return true
    }
  })

  useEffect(() => {
    const token = readDemoAccessToken()
    if (!token) {
      setAccessChecked(true)
      return
    }

    let cancelled = false
    fetch('/api/verify-demo-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return
        if (data?.valid) {
          try {
            sessionStorage.setItem('tb:lead', '1')
            sessionStorage.setItem('tb:lead-data', JSON.stringify({
              email: data.email,
              source: data.source,
              demoSessionId: data.demoSessionId,
              verifiedByLanding: true,
            }))
          } catch { /* ignore */ }
          setLeadCaptured(true)
          trackDemoEvent('landing_demo_access_accepted', {
            source: data.source,
          })
        } else {
          trackDemoEvent('landing_demo_access_rejected')
        }
      })
      .catch(() => {
        if (!cancelled) trackDemoEvent('landing_demo_access_verify_failed')
      })
      .finally(() => {
        if (cancelled) return
        removeDemoAccessTokenFromUrl()
        setAccessChecked(true)
      })

    return () => { cancelled = true }
  }, [])
  const submitLead = (lead) => {
    const demo = getDemoSnapshot()
    try {
      sessionStorage.setItem('tb:lead', '1')
      sessionStorage.setItem('tb:lead-data', JSON.stringify(lead))
    } catch { /* ignore */ }
    setLeadCaptured(true)
    trackDemoEvent('lead_gate_submitted', {
      company: lead.company,
      timeInDemoMs: demo.timeInDemoMs,
    })

    // Mirror to /api/capture-lead so the signup lands in the same Convex
    // `leads` table + HubSpot CRM as /book-demo on www.teambridge.com.
    // We log success / failure to the console so the wiring is easy to
    // verify from DevTools without having to dig through CRMs.
    try {
      fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          company: lead.company,
          email: lead.email,
          pageUrl: window.location.href,
          referrer: document.referrer || undefined,
          demoSessionId: demo.sessionId,
          industry: demo.industry,
          view: demo.view,
          route: demo.route,
          path: demo.path,
          landingPage: demo.landingPage,
          timeInDemoMs: demo.timeInDemoMs,
          emailQuality: lead.emailQuality,
          emailAttempts: lead.emailAttempts,
        }),
        keepalive: true,
      })
        .then(async (r) => {
          let body = null
          try { body = await r.json() } catch { /* tolerated */ }
          if (!r.ok) {
            console.error('[capture-lead] non-2xx', r.status, body)
            return
          }
          if (body && Array.isArray(body.errors) && body.errors.length) {
            console.error('[capture-lead] upstream errors', body.errors)
            return
          }
          console.info('[capture-lead] ok', body ?? {})
        })
        .catch((err) => {
          console.error('[capture-lead] request failed', err)
        })
    } catch (err) {
      console.error('[capture-lead] threw before fetch', err)
    }
  }

  useEffect(() => {
    const sync = () => setRoute(parseHash())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    const snapshot = getDemoSnapshot()
    trackDemoEvent('route_viewed', {
      routeKind: route?.kind ?? 'entry_choice',
      industry: snapshot.industry,
      view: snapshot.view,
    })
  }, [route])

  // The gate runs on every route except the front-of-funnel screens
  // (entry choice, demo picker, build flow). The build flow has its
  // own first-class signup capture in step 1.
  const showGate = accessChecked && !leadCaptured && route?.kind !== 'build'

  let view
  if (!route) {
    view = (
      <EntryChoice
        onBuild={() => setHash('/build')}
        onExplore={() => setHash('/demos')}
      />
    )
  } else if (route.kind === 'demos') {
    view = <IndustrySelector onSelect={id => { trackDemoEvent('industry_selected', { industry: id }); setHash(`/${id}`) }} />
  } else if (route.kind === 'build') {
    view = (
      <OnboardingFlow
        onExit={() => setHash('/demos')}
        onComplete={(answers) => {
          // Drop them into the dashboard for the industry they picked.
          // If they didn't pick (unlikely), fall back to the demo picker.
          if (answers.industry && VALID_INDUSTRIES.has(answers.industry)) {
            setHash(`/${answers.industry}`)
          } else {
            setHash('/demos')
          }
        }}
      />
    )
  } else if (route.kind === 'sage') {
    const sageNav = (v) => setHash(v === 'dashboard' ? '/sage' : `/sage/${v}`)
    if (route.view === 'workforce') {
      view = (
        <SageWorkforceEmbed
          onNavigate={sageNav}
          otFixed={otFixed}
          onApplyOTFix={() => { trackDemoEvent('ot_fix_applied'); setOtFixed(true) }}
        />
      )
    } else {
      view = (
        <SageDashboard
          onNavigate={sageNav}
          otFixed={otFixed}
          onResetOTFix={() => setOtFixed(false)}
        />
      )
    }
  } else {
    view = (
      <Act1Dashboard
        industryId={route.industry}
        view={route.view}
        onBack={() => setHash('/demos')}
        onSelectView={(v) => setHash(v === 'overview' ? `/${route.industry}` : `/${route.industry}/${v}`)}
        onExplore={() => { /* Act 2 not built yet */ }}
      />
    )
  }

  return (
    <>
      {view}
      {showGate && (
        <LeadCaptureGate
          sessionId={getDemoSnapshot().sessionId}
          delayMs={0}
          onShown={() => trackDemoEvent('lead_gate_shown', { immediate: true })}
          onSubmit={submitLead}
        />
      )}
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
