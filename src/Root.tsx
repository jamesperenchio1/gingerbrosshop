import { startTransition, useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import { localeFromPath, basenameFor } from '@/lib/locale'

/**
 * The router's basename carries the locale ("/th" or ""). It is state here so
 * the language switch (see I18nContext) can change it and the URL together
 * without reloading the page, keeping scroll position and cart state.
 *
 * Lives outside main.tsx so the entry file stays export-free: React Fast
 * Refresh only works in files whose every export is a component.
 */
export default function Root() {
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
