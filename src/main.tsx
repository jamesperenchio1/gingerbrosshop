import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'
import App from './App.tsx'

gsap.registerPlugin(ScrollTrigger)

// Own scroll positioning ourselves. Left on 'auto', the browser restores the
// previous scroll offset on back/forward *after* React has mounted the new
// route, which fights both ScrollToTop and ScrollTrigger.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// Late-arriving images and webfonts shift element positions, invalidating every
// trigger start that was measured before they landed.
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
if (document.fonts) void document.fonts.ready.then(() => ScrollTrigger.refresh())

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>,
)
