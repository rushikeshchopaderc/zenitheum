import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Self-hosted variable fonts (no third-party font requests).
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/sora/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'

import './index.css'
import './components/fx/fx.css'
import App from './App.jsx'
import { initAnalytics } from './lib/analytics'

initAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
