import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IndustrySelector from './screens/IndustrySelector.jsx'
import Act1Dashboard    from './screens/Act1Dashboard.jsx'

/**
 * App shell for the Teambridge Free sandbox.
 * Holds the active screen + the selected industry. Each Act slots in here.
 */
function App() {
  const [screen, setScreen]     = useState('industry-selector')
  const [industry, setIndustry] = useState(null)

  if (screen === 'industry-selector') {
    return (
      <IndustrySelector
        onSelect={id => {
          setIndustry(id)
          setScreen('act-1')
        }}
      />
    )
  }

  if (screen === 'act-1') {
    return (
      <Act1Dashboard
        industryId={industry}
        onBack={() => setScreen('industry-selector')}
        onExplore={() => setScreen('act-2')}
      />
    )
  }

  // Future: act-2, act-3, act-4
  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
