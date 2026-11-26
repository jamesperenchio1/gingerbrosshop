import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/inter'
import '@fontsource-variable/anuphan'
import './index.css'
import Root from './Root.tsx'
import { capturePromoFromUrl } from '@/lib/promo'
import { captureSourceFromUrl } from '@/lib/source'
import { initPostHog } from '@/lib/posthog'

// Own scroll positioning ourselves. Left on 'auto', the browser restores the
// previous scroll offset on back/forward *after* React has mounted the new
// route, which fights our own ScrollToTop.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// A promo link from the discount email (/?promo=CODE) is remembered so the
// site can show it and checkout can apply it.
capturePromoFromUrl()

// Remember which ad/link brought the visitor so the order can be attributed.
captureSourceFromUrl()

// Analytics: load once, after the promo/source params are on record. The
// wrapper no-ops during SSR and when no project key is configured.
initPostHog()

const app = <Root />

const root = document.getElementById('root')!
const normalise = (p: string) => p.replace(/\/$/, '') || '/'
if (root.getAttribute('data-prerendered') === normalise(location.pathname)) {
  // Prerendered at build time: attach to the existing HTML instead of
  // rebuilding it. Anything that can't be prerendered still gets client-rendered.
  //
  // react-helmet-async 3 renders <title>/<meta>/<link> as React elements and
  // lets React 19 hoist them, so it never adopts the copies scripts/prerender.mjs
  // lifted into <head> (they carry data-rh="true" but nothing reads them). Drop
  // them first, otherwise every page keeps two titles, two canonicals and two
  // descriptions once hydrated. Crawlers still see the prerendered tags in the
  // HTML the server sends.
  document.head.querySelectorAll('[data-rh]').forEach((el) => el.remove())
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
