# GingerBros — Developer Notes

## ⚠️ Important: Stripe is in LIVE mode

Do NOT place test orders. All Stripe transactions charge real money. The account is already at -15 THB from testing.

## Product Catalog

Products are fetched dynamically from Stripe via `/api/products`. The frontend does NOT have a hardcoded product list. If you need to add/modify products, do it in the **Stripe Dashboard**, then add editorial content in `src/lib/productContent.ts`.

### Current Products

- `ginger-fizz` — Single bottle, ฿140
- `ginger-fizz-6pack` — 6-Pack bundle, ฿750
- Subscription plans on single bottle (weekly, 2-week, monthly)
- Brewing equipment (KegLand products)

## Key Files for Commerce Changes

| File | What it does |
|------|-------------|
| `api/_lib/handlers/products.ts` | Fetches catalog from Stripe |
| `api/_lib/handlers/checkout.ts` | Creates Stripe Checkout sessions |
| `api/_lib/handlers/email-tracking.ts` | Sends tracking emails via Resend |
| `src/lib/productContent.ts` | Editorial content keyed by `app_id` |
| `src/pages/ProductDetail.tsx` | Product detail page |
| `src/sections/Shop.tsx` | Shop grid |

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

## Image Assets

| Image | Path |
|-------|------|
| Single bottle | `public/images/ginger-fizz-new.png` |
| 6-Pack | `public/images/ginger-fizz-6pack.png` |
| Product video | `public/images/product-ginger-fizz.mp4` |

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v3.4 + shadcn/ui
- Stripe Checkout (live mode)
- Resend for email
- Upstash Redis for order storage
- Vercel for hosting

## Full Documentation

See `GINGERBROS_DEV_REFERENCE.md` for complete API docs, all Stripe price IDs, shipping logic, email templates, and more.
