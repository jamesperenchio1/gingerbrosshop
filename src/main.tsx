import { startTransition, useEffect, useState } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/inter'
import '@fontsource-variable/anuphan'
import './index.css'
import App from './App.tsx'
import { capturePromoFromUrl } from '@/lib/promo'
import { captureSourceFromUrl } from '@/lib/source'
import { localeFromPath, basenameFor } from '@/lib/locale'

// Own scroll positioning ourselves. Left on 'auto', the browser restores the
// previous scroll offset on back/forward *after* React has mounted the new
// route, which fights our own ScrollToTop.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// A promo link from the discount email (/?promo=CODE) is remembered so the
// site can show it and checkout can apply it.
capturePromoFromUrl()

// Remember which ad/link brought the visitor so the order can be attributed.
captureSourceFromUrl()

/**
 * The router's basename carries the locale ("/th" or ""). It is state here so
 * the language switch (see I18nContext) can change it and the URL together
 * without reloading the page, keeping scroll position and cart state.
 */
function Root() {
  const [locale, setLocale] = useState(() => localeFromPath(location.pathname))
  useEffect(() => {
    // Runs alongside the router's own popstate listener (back/forward and
    // the language switch), as a transition so both land in the same render.
    const sync = () => startTransition(() => setLocale(localeFromPath(location.pathname)))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])
  return (
    <HelmetProvider>
      <BrowserRouter basename={basenameFor(locale)}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  )
}
const app = <Root />

const root = document.getElementById('root')!
const normalise = (p: string) => p.replace(/\/$/, '') || '/'
if (root.getAttribute('data-prerendered') === normalise(location.pathname)) {
  // Prerendered at build time: attach to the existing HTML instead of
  // rebuilding it. Anything that can't be prerendered still gets client-rendered.
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
