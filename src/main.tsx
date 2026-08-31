import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

// Own scroll positioning ourselves. Left on 'auto', the browser restores the
// previous scroll offset on back/forward *after* React has mounted the new
// route, which fights our own ScrollToTop.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>,
)
