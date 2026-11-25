# GingerBros Shop — Agent Notes

React 19 + Vite SPA, prerendered to static HTML, deployed on Vercel. Stripe Checkout is **LIVE**.
Deeper docs: `CLAUDE.md` (brand/hydration rules), `GINGERBROS_DEV_REFERENCE.md` (all routes, endpoints, price IDs), `POSTHOG.md` (analytics: env, events, warehouse).

## Commands

```bash
npm run dev            # vite on :3000 (playwright config expects this port)
npm run lint           # eslint, ignores dist + .claude
npx tsc -b             # typecheck (project refs; plain `tsc --noEmit` checks nothing useful)
npm run test:unit      # vitest, jsdom, tests/unit/**
npm run test:e2e       # playwright against localhost:3000 (auto-starts dev server)
npm run build          # check:claims -> tsc -b -> vite build -> SSR build -> prerender -> seo-audit
```

Single test: `npx vitest run tests/unit/brand-claims.test.ts`, `npx playwright test tests/cart.spec.ts`.

Build gotchas:
- `npm run build` hits `https://gingerbrosshop.com/api/products` (override with `CATALOG_URL`) to prerender the catalog — it fails offline and prerenders whatever prod currently serves.
- `check:claims` runs first and **fails the build** on health/fermentation claims. Run it after any copy change.

## Hard rules

- **Stripe is live.** Never create orders, refunds, cancellations, payouts or evidence in tests. Prefer `npm run test:unit` (mocked Stripe) and read-only endpoints.
- **No hardcoded catalog.** Products, prices and images live in Stripe and are read via `/api/products`. Add/edit products in the Stripe Dashboard (`metadata.app_id`, `metadata.category` = `drinks` | `brewing-equipment`), then add editorial copy in `src/lib/productContent.ts`. Prices in docs rot — read them from Stripe, don't trust tables.
- **No health claims.** Never write fermented/prebiotic/probiotic/gut/immunity. `tests/unit/brand-claims.test.ts` enforces it. Fizz = fresh Thai ginger, real lime, low sugar (no gram figures). Tea = the label's wording.
- Never read `localStorage`/`window`/`Date` during render — prerendered HTML must equal the first client render, or hydration breaks. Restore in an effect (see `CartContext`, `I18nContext`, `Shop`).

## Architecture

- **API**: one catch-all function, `api/[...path].ts`, that lazy-imports a handler per first path segment from `api/_lib/handlers/*.ts`. New endpoint = add a handler file + a row in that `routes` map. `api/webhook.ts` is separate (needs the raw body for Stripe signature verification).
- **Admin**: `/admin/*` renders the shell from `src/App.tsx`; API is `POST/GET /api/admin` dispatching on `resource` + `action` (`api/_lib/handlers/admin.ts` → `api/_lib/admin/*`). Every mutation requires an echoed `confirm` phrase, money actions a `reason`, and all are audit-logged.
- **SEO/route table**: `src/seo/routes.ts` is the single source for every static route's title/description/image/indexable/Thai copy. It feeds the page `<SEO>`, `middleware.ts`, `scripts/prerender.mjs` (sitemap) and `scripts/seo-audit.mjs`. New page = add it there; don't duplicate strings elsewhere. Imports in that file must be relative — the edge middleware is outside Vite and cannot resolve `@/`.
- **Prerender**: `vercel.json` rewrites every non-`/api` path to `/shell.html`; `middleware.ts` injects route meta and real 404 statuses for unknown routes. Non-prerendered routes fall back to the SPA shell, which still works.
- **i18n**: English at `/…`, Thai at `/th/…` (router `basename`). Only routes with `titleTh`/`descriptionTh` in `src/seo/routes.ts` get Thai versions. All UI copy is a flat string map in `src/context/I18nContext.tsx` (en + th entries side by side) — a literal string in JSX is a bug; add a key.
- **Images**: sources in `assets-src/`; `node scripts/build-images.mjs` regenerates `public/images/gen/*` + `src/lib/imageManifest.ts` (committed). Render with `<ResponsiveImage name="…">`, never raw `<img>` for catalog art.

## Gotchas

- **Analytics**: PostHog (client `src/lib/posthog.ts`, server `api/_lib/posthog.ts`), proxied same-origin through `/ingest` (rewrites in `vercel.json`). Every capture is a no-op without `VITE_POSTHOG_KEY`/`POSTHOG_API_KEY`. Event names are in `POSTHOG.md` — reuse them, don't invent parallel ones.
- Env vars actually read by code: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `ADMIN_EMAILS`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN`, `UPSTASH_REDIS_REST_URL`/`_TOKEN`, `META_CAPI_ACCESS_TOKEN`, `VERCEL_DEPLOY_HOOK_URL`, `VITE_POSTHOG_KEY`, `POSTHOG_API_KEY`. `.env.example` is stale: it lists `ADMIN_SECRET`, but admin login is passwordless and gated by `ADMIN_EMAILS`.
- ESLint disables `react-refresh/only-export-components` for `src/components/ui/**` on purpose (vendored shadcn); don't "fix" those files.
- Localized copy lives in two places that must stay in sync: `I18nContext` strings and `src/seo/routes.ts` meta.
- Order number shown to customers = last 8 chars of the Stripe `session_id`, uppercased.
