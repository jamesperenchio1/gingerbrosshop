# GingerBros — Developer Notes

## ⚠️ Important: Stripe is in LIVE mode

Do NOT place test orders. All Stripe transactions charge real money. The account is already at -15 THB from testing.

## Product Catalog

Products are fetched dynamically from Stripe via `/api/products`. The frontend does NOT have a hardcoded product list. If you need to add/modify products, do it in the **Stripe Dashboard**, then add editorial content in `src/lib/productContent.ts`.

### Current Products

- `ginger-fizz` — Ginger Fizz, ฿140 (subscriptions: weekly, 2-week, monthly)
- `ginger-tea` — Ginger Tea · Thai Spice, ฿119
- Packs: `ginger-fizz-2pack/3pack/6pack` (฿260/390/780), `ginger-tea-2pack/3pack/6pack` (฿220/315/600), `fizz-tea-duo` ฿240, `fizz-tea-4pack` ฿460. Multi-buy pricing: `api/_lib/multiBuy.ts`.
- Brewing equipment (KegLand products), shown on the /shop "Brewing Equipment" tab

## Brand rules (Nov 2026 rebrand)

- Tagline **Think Ginger. Drink Different.** Positioning: the modern ginger drink brand of Thailand. Lead with taste, not health.
- **Neither drink is fermented.** No fermentation, prebiotic, probiotic, gut, immunity or other health claims anywhere. `tests/unit/brand-claims.test.ts` fails the build if they creep back.
- Verified facts only: Fizz = fresh Thai ginger, real lime, low sugar (no sugar grams). Tea = the label's wording (real ginger slowly simmered with lemongrass, lime and spices; no artificial colours or flavours).
- Design: charcoal `#1E1A17`, ginger yellow `#F2B632`, cream/amber/deep brown. Fonts self-hosted: Bricolage Grotesque (display, `.font-poster`), Inter (body), Anuphan (Thai).
- Thai pages live under `/th` (router basename); only paths in `src/lib/locale.ts` `TH_PATHS` have Thai versions + hreflang.

## Key Files for Commerce Changes

| File | What it does |
|------|-------------|
| `api/_lib/handlers/products.ts` | Fetches catalog from Stripe |
| `api/_lib/handlers/checkout.ts` | Creates Stripe Checkout sessions |
| `api/_lib/handlers/email-tracking.ts` | Sends tracking emails via Resend |
| `src/lib/productContent.ts` | Editorial content keyed by `app_id` |
| `src/pages/ProductDetail.tsx` | Product detail page |
| `src/sections/Shop.tsx` | Drinks lineup (pack pickers) + /shop tabs |
| `src/lib/drinks.ts` | Groups packs into drink families, taste profiles |

## How Order Tracking Works

Orders are stored in **Upstash Redis** with key `orders`.

When a customer completes checkout:
1. Stripe webhook (`api/webhook.ts`) receives `checkout.session.completed`
2. Order is saved to Redis with the full Stripe session data
3. Admin can add tracking info via `/admin/orders`

When a customer tracks an order:
1. They go to `/track`
2. Enter their **email** + **order number**
3. The order number is the **last 8 characters** of the Stripe `session_id` (e.g. if session ID is `cs_test_1234567890abcdef`, the order number is `7890ABCDEF`)
4. Frontend calls `/api/track-order?email=...&order=...`
5. Backend looks up the order in Redis by matching email + last-8 session ID
6. If found, returns order details including tracking number

The "Email me this tracking info" button on `/track` POSTs to `/api/email-tracking` which sends a branded email via Resend.

## Order Source Tracking

Tag a product link with `?src=<where>` (e.g. `/product/ginger-fizz-6pack?src=meta`). The tag is remembered for 30 days, saved on the order at checkout (Stripe `metadata.source` + Redis `order.source`), and shown in `/admin/orders`. Meta `fbclid`, TikTok `ttclid` and Google `gclid` clicks are labelled automatically. Details in `GINGERBROS_DEV_REFERENCE.md` ("Order Source Attribution").

## Prerendering (SSG) — how pages load fast

`npm run build` = client build → SSR build of `src/entry-server.tsx` → `scripts/prerender.mjs`, which renders `/`, `/product/*`, `/blog/*` and the static pages to `dist/<route>/index.html` (catalog fetched from the live `/api/products` at build time). The client hydrates (`src/main.tsx`); if a route isn't prerendered, or prerendering fails, the untouched SPA shell (`dist/shell.html`, via the `vercel.json` rewrite and `middleware.ts`) is served and nothing breaks.

Rules for keeping pages hydration-safe (first client render must equal the server HTML):
- Never read `localStorage`/`sessionStorage`/`Date`/`window` during render. Start from a default and restore in an effect (see `CartContext`, `I18nContext`, `Shop`, `ProductDetail` delivery estimate).
- Run `node scripts/check-hydration.mjs <base-url>` against a static server of `dist/` to catch React hydration errors on every prerendered route.
- After changing products in Stripe the prerendered pages refresh on the next deploy. Set `VERCEL_DEPLOY_HOOK_URL` and subscribe the Stripe webhook to `product.*`/`price.*` events to rebuild automatically (debounced 2 min); the client also revalidates the catalog on load.

## Agent Discovery

Static files in `public/` (content types set in `vercel.json`): `.well-known/api-catalog`, `.well-known/acp.json`, `.well-known/ucp`, `openapi.json`, `auth.md`, `docs/api.md`; `robots.txt` carries a `Content-Signal` line (search + ai-input yes, ai-train no). `middleware.ts` adds the homepage `Link` header and returns markdown for `Accept: text/markdown` (`src/seo/htmlToMarkdown.ts`). x402 checkout: `POST /api/x402/order` (`api/_lib/handlers/x402.ts`, pricing in `api/_lib/x402Pricing.ts`) takes real orders paid in USDC on Base mainnet via the PayAI facilitator, straight to the shop's Rabby wallet. Prices come from Stripe, THB→USD from frankfurter (cached per hour, +2%), max ฿3000. Orders land in Redis (source `x402`) and the seller is emailed to fulfil; there is no automatic refund. Bare `/api`, `/api/v1`, `/api/x402` return an example 402 for scanners. Not implemented on purpose: AP2 (needs an A2A agent). Checkout is live-mode, so these documents only describe the existing hosted Stripe Checkout flow.

## Image Assets

Sources live in `assets-src/` (transparent bottle cutouts, real Fizz photos, text-free lifestyle shots). Generated output is committed:

- `node scripts/build-images.mjs` → `public/images/gen/<name>-<width>.{avif,webp}` + `<name>.jpg`, and `src/lib/imageManifest.ts`. Render with `<ResponsiveImage name="...">`.
- `node scripts/build-og.mjs` → 1200×630 share cards in `public/images/og/` + `src/lib/ogImages.ts`.
- Stripe product images point at `/images/gen/<app_id>.jpg` (`scripts/update-drink-listings.js`, dry run unless `--apply`).
- Product galleries, tasting notes, serves and pairings: `src/lib/productContent.ts`.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v3.4 + shadcn/ui
- Stripe Checkout (live mode)
- Resend for email
- Upstash Redis for order storage
- Vercel for hosting

## Full Documentation

See `GINGERBROS_DEV_REFERENCE.md` for complete API docs, all Stripe price IDs, shipping logic, email templates, and more.
