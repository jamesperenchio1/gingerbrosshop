import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { capturePromoFromUrl } from '@/lib/promo'
import { captureSourceFromUrl } from '@/lib/source'

// Own scroll positioning ourselves. Left on 'auto', the browser restores the
// previous scroll offset on back/forward *after* React has mounted the new
// route, which fights our own ScrollToTop.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// A promo link from the discount email (/?promo=CODE) is remembered so the
// site can show it and checkout can apply it.
capturePromoFromUrl()

// Remember which ad/link brought the visitor so the order can be attributed.
captureSourceFromUrl()

const app = (
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
)

const root = document.getElementById('root')!
const normalise = (p: string) => p.replace(/\/$/, '') || '/'
if (root.getAttribute('data-prerendered') === normalise(location.pathname)) {
  // Prerendered at build time: attach to the existing HTML instead of
  // rebuilding it. Anything that can't be prerendered still gets client-rendered.
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
