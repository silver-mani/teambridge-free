import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IndustrySelector   from './screens/IndustrySelector.jsx'
import Act1Dashboard      from './screens/Act1Dashboard.jsx'
import SageDashboard      from './screens/sage/SageDashboard.jsx'
import SageWorkforceEmbed from './screens/sage/SageWorkforceEmbed.jsx'

const VALID_INDUSTRIES = new Set([
  'healthcare', 'staffing', 'events', 'security', 'light-industrial', 'construction',
])

function parseHash() {
  const raw = (window.location.hash || '').replace(/^#/, '').replace(/^\//, '').trim()
  if (!raw) return null
  const segs = raw.split('/')
  if (segs[0] === 'sage') {
    const sub = segs[1] || 'dashboard'
    const sageOk = new Set(['dashboard', 'workforce'])
    return { kind: 'sage', view: sageOk.has(sub) ? sub : 'dashboard' }
  }
  const [industry, view = 'overview'] = segs
  if (!VALID_INDUSTRIES.has(industry)) return null
  const viewOk = new Set(['overview', 'schedule', 'people', 'pay', 'workflows', 'engage', 'policies'])
  return { kind: 'industry', industry, view: viewOk.has(view) ? view : 'overview' }
}

function setHash(path) {
  // Use replaceState so the title updates without piling history when bouncing.
  if (window.location.hash !== `#${path}`) {
    window.location.hash = path
  }
}

/**
 * App shell for the Teambridge Free sandbox.
 * The URL hash drives the screen — `#/` shows the industry picker, while
 * `#/events`, `#/healthcare`, etc. deep-link straight into a dashboard.
 */
function App() {
  const [route, setRoute] = useState(() => parseHash())

  useEffect(() => {
    const sync = () => setRoute(parseHash())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  if (!route) {
    return (
      <IndustrySelector
        onSelect={id => setHash(`/${id}`)}
      />
    )
  }

  if (route.kind === 'sage') {
    const sageNav = (v) => setHash(v === 'dashboard' ? '/sage' : `/sage/${v}`)
    if (route.view === 'workforce') {
      return <SageWorkforceEmbed onNavigate={sageNav} />
    }
    return <SageDashboard onNavigate={sageNav} />
  }

  return (
    <Act1Dashboard
      industryId={route.industry}
      view={route.view}
      onBack={() => setHash('/')}
      onSelectView={(v) => setHash(v === 'overview' ? `/${route.industry}` : `/${route.industry}/${v}`)}
      onExplore={() => { /* Act 2 not built yet */ }}
    />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
