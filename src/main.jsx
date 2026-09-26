import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'

const container = document.getElementById('root')

// Fail loudly and immediately if the mount point is missing, rather than
// rendering nothing and leaving a blank page to debug in production.
if (!container) {
  throw new Error('Mount point #root is missing from index.html')
}

// Drop the pre-mount fallback before React takes over the container, so the
// two can never both be on screen.
container.replaceChildren()

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
