import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IndustrySelector from './screens/IndustrySelector.jsx'

/**
 * App shell for the Teambridge Free sandbox.
 * Holds the active screen + the selected industry. Each Act slots in as a new
 * case here as we build them out.
 */
function App() {
  const [screen, setScreen]     = useState('industry-selector')
  const [industry, setIndustry] = useState(null)

  if (screen === 'industry-selector') {
    return (
      <IndustrySelector
        onSelect={id => {
          setIndustry(id)
          // Transition to Act 1 — wired up in the next step.
          // eslint-disable-next-line no-console
          console.log('Industry selected:', id)
        }}
      />
    )
  }

  // Future: act-1, act-2, act-3, act-4
  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
