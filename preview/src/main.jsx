import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ComponentPreview from './ComponentPreview.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ComponentPreview />
  </StrictMode>,
)
