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
  return VALID_INDUSTRIES.has(raw) ? raw : null
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
  const [industry, setIndustry] = useState(() => parseHash())

  useEffect(() => {
    const sync = () => setIndustry(parseHash())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  if (!industry) {
    return (
      <IndustrySelector
        onSelect={id => setHash(`/${id}`)}
      />
    )
  }

  return (
    <Act1Dashboard
      industryId={industry}
      onBack={() => setHash('/')}
      onExplore={() => { /* Act 2 not built yet */ }}
    />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
