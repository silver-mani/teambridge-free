import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IndustrySelector from './screens/IndustrySelector.jsx'
import Act1Dashboard    from './screens/Act1Dashboard.jsx'

const VALID_INDUSTRIES = new Set([
  'healthcare', 'staffing', 'events', 'security', 'light-industrial', 'construction',
])

function parseHash() {
  const raw = (window.location.hash || '').replace(/^#/, '').replace(/^\//, '').trim()
  if (!raw) return null
  const [industry, view = 'overview'] = raw.split('/')
  if (!VALID_INDUSTRIES.has(industry)) return null
  return { industry, view: view === 'schedule' ? 'schedule' : 'overview' }
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
