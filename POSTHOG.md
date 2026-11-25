# PostHog analytics

Product analytics, session replay and (optionally) the data warehouse for
gingerbrosshop.com. The browser SDK is `posthog-js`, the serverless functions
use `posthog-node`.

Everything is **optional at runtime**: with no key configured every capture is a
silent no-op, so local dev and preview builds don't pollute production data.

## Environment variables

| Variable | Where | Value |
|---|---|---|
| `VITE_POSTHOG_KEY` | client bundle (inlined at build) | project API key `phc_...` |
| `VITE_POSTHOG_HOST` | client | `/ingest` (default) |
| `POSTHOG_API_KEY` | serverless functions | the same `phc_...` key |
| `POSTHOG_HOST` | serverless functions | `https://us.i.posthog.com` |

Get the key from PostHog → **Project settings → Project API key**. Self-hosted
or EU cloud: change both hosts (`https://eu.i.posthog.com` + `eu.posthog.com`
for `ui_host` in `src/lib/posthog.ts`).

`VITE_*` values are baked into the JS at build time, so changing the key needs a
redeploy.

## Why `/ingest`

`vercel.json` proxies three paths to PostHog US cloud, ahead of the SPA shell
rewrite:

```
/ingest/static/:path*  → https://us-assets.i.posthog.com/static/:path*
/ingest/array/:path*   → https://us.i.posthog.com/array/:path*
/ingest/:path*         → https://us.i.posthog.com/:path*
```

Requests are same-origin, so they survive ad blockers better and the strict CSP
in `vercel.json` needs no extra origins. `posthog-js` is bundled by Vite, so
`script-src 'self'` also still holds.

## Client SDK setup — `src/lib/posthog.ts`

- Lazy `import('posthog-js')` inside `initPostHog()`, called once from
  `src/main.tsx`. Nothing loads during the SSR/prerender build.
- Events fired before the SDK is ready are queued and flushed on `loaded`.
- `capture_pageview: false` — `PageViewTracker` in `src/App.tsx` sends
  `$pageview` on every route change (the SPA would otherwise double-count).
- `person_profiles: 'identified_only'`; `respect_dnt: false` for consistency with
  the GA4/Meta tags already on the site (both ignore DNT). Flip it to `true` if
  you ever want to honour the DNT header.
- Session replay is on with `maskAllInputs: true` and text matching
  `[data-ph-mask], .ph-mask`. Add `data-ph-mask` to anything sensitive that
  isn't an input.
- Autocapture and heatmaps on; surveys off (unused, keeps the bundle smaller).

Imports: `captureEvent`, `capturePageView`, `identifyUser`, `resetUser` from
`@/lib/posthog`.

## Server setup — `api/_lib/posthog.ts`

Vercel freezes a function once the response is sent, so background flushing is
unreliable. `captureServerEvent()` creates a short-lived `posthog-node` client
with `flushAt: 1`, sends, shuts down, and races a 1.5 s timeout — analytics can
never fail or noticeably slow a request. `captureServerEventSoon()` is the
fire-and-forget variant (webhook only). `anonymousId(req)` hashes the client IP
so pre-login events still have a stable distinct id without storing raw IPs.

## Event catalogue

Client = funnel/intent. Server = authoritative conversions. Don't add client
twins of server events — PostHog will show duplicates.

### Client events

| Event | Where | Key properties |
|---|---|---|
| `$pageview` | `App.tsx` PageViewTracker | `$current_url`, `path`, `$host` |
| `product_list_viewed` | `sections/Shop.tsx` | `variant`, `product_count`, `product_ids`, `categories` |
| `shop_tab_changed` | `sections/Shop.tsx` | `tab` |
| `product_viewed` | `pages/ProductDetail.tsx` | `product_id`, `product_name`, `category`, `price`, `stock_status`, `badge` |
| `product_option_selected` | `pages/ProductDetail.tsx` | `product_id`, `price_id`, `nickname`, `price`, `is_subscription`, `subscription_interval` |
| `buy_now_clicked` | `pages/ProductDetail.tsx` | `product_id`, `price_id`, `quantity`, `value`, `is_subscription`, `is_gift` |
| `add_to_cart` | `CartContext.tsx` | `product_id`, `price_id`, `quantity`, `price`, `value`, `is_subscription`, `is_gift` |
| `remove_from_cart` | `CartContext.tsx` | `product_id`, `quantity`, `price`, `value` |
| `cart_quantity_updated` | `CartContext.tsx` | `product_id`, `previous_quantity`, `quantity`, `value` |
| `cart_opened` | `CartContext.tsx` | `source` (`toggle`/`open`), `item_count`, `value` |
| `cart_cleared` | `CartContext.tsx` | `item_count`, `value` |
| `cart_shared` | `CartDrawer.tsx` | `item_count`, `shared_cart_id` |
| `shared_cart_opened` | `App.tsx` CartLinkLoader | `shared_cart_id`, `item_count` |
| `cart_note_added` | `CartDrawer.tsx` | `length` (first non-empty only) |
| `delivery_method_selected` | `CartDrawer.tsx` | `delivery_method` |
| `referral_code_entered` | `CartDrawer.tsx` | `referral_code` |
| `referral_link_visited` | `App.tsx` ReferralCapture | `referral_code` |
| `referral_card_viewed` | `components/ReferralCard.tsx` | `referral_code`, `credit_baht`, `referrals` |
| `referral_share_clicked` | `components/ReferralCard.tsx` | `method` (`copy_code`/`copy_link`), `referral_code` |
| `checkout_started` | `lib/checkout.ts` | `product_ids`, `contents`, `num_items`, `value`, `has_subscription`, `is_gift` |
| `purchase` | `pages/OrderSuccess.tsx` | `$insert_id`, `order_id`, `session_id`, `revenue`, `currency`, `contents` |
| `subscription_started` | `pages/OrderSuccess.tsx` | `$insert_id`, `subscription_id`, `revenue`, `currency` |
| `promo_notice_viewed` | `components/PromoNotice.tsx` | `promo_code`, `percent_off`, `amount_off` |
| `newsletter_signup_started` | `components/Newsletter.tsx` | `verification_required` |
| `article_viewed` | `pages/BlogPage.tsx` | `article_slug`, `article_title`, `article_category`, `article_author` |
| `language_switched` | `sections/Navigation.tsx` | `from`, `to` |
| `linkpage_block_clicked` | `components/linkpage/LinkPageView.tsx` | `block_id`, `block_type`, `page` |
| `linkpage_social_clicked` | `components/linkpage/LinkPageView.tsx` | `platform`, `page` |
| `linkpage_share_clicked` | `components/linkpage/LinkPageView.tsx` | `link_title`, `link_url`, `method` |
| `linkpage_signup` | `components/linkpage/LinkPageView.tsx` | `email` |

`identifyUser()` is called with the customer email from: restored cart,
OrderSuccess, newsletter verification, stock alerts, wholesale, order tracking
and link-page signups.

### Server events

| Event | Handler | Distinct id | Key properties |
|---|---|---|---|
| `checkout_session_created` | `handlers/checkout.ts` | email, else hashed IP | `session_id`, `mode`, `payment_method`, `promo_code`, `referral_code`, `source`, `delivery_method`, `contents`, `value` |
| `purchase` | `api/webhook.ts` (Stripe) | email, else `session:<id>` | `$insert_id "<session>-purchase"`, `order_id`, `revenue`, `currency`, `contents`, `mode`, `is_subscription`, `is_gift` |
| `subscription_created` | `api/webhook.ts` | same | `$insert_id "<session>-subscription"`, `subscription_id`, `revenue`, `currency` |
| `newsletter_subscribed` | `handlers/subscribe.ts` | email | `verification_required` |
| `newsletter_verified` | `handlers/verify-email.ts` | email | `promo_code_sent` |
| `wholesale_inquiry_submitted` | `handlers/wholesale.ts` | email | `business_name`, `has_phone` |
| `stock_alert_signup` | `handlers/stock-alert.ts` | email | `product_id` |
| `order_tracked` | `handlers/track-order.ts` | email | `order_number`, `status`, `item_count` |
| `review_submitted` | `handlers/reviews.ts` | hashed IP (`reviewer:`) | `product_id`, `rating`, `review_length` |
| `cart_shared` | `handlers/share-cart.ts` | hashed IP | `shared_cart_id`, `item_count` |
| `referral_applied` | `handlers/referral.ts` | referred email | `referral_code`, `credit_baht` |
| `order_details_viewed` | `handlers/order-details.ts` | email, else `session:<id>` | `session_id`, `mode`, `amount_total`, `item_count` |

The client `purchase` and webhook `purchase` share `$insert_id`, so PostHog
deduplicates them (the server copy covers ad-blocked / closed-tab shoppers).

## Useful insights to create

- Funnel: `product_viewed` → `add_to_cart` → `checkout_started` → `purchase`
  (break down by `product_id`, `source`, `referral_code`).
- Revenue trend from `purchase` (`revenue` property), split by
  `is_subscription`.
- Subscription funnel: `checkout_session_created` → `subscription_created`.
- Cart abandonment: `checkout_started` in session minus `purchase`.
- Channel performance: `source` on checkout/purchase vs `referral_code`.
- Content: `article_viewed` → `add_to_cart` on sessions that read a guide.

## Data warehouse (Stripe, Resend, Upstash, Vercel)

PostHog's **Data pipeline → Sources** page lists these as “found in your code”
because the app imports their SDKs. Connecting them is done in the PostHog UI
with each provider's credentials — it cannot be configured from this repo:

1. **Stripe** — add a restricted key (read-only on Charges, Customers,
   Subscriptions, Invoices). Gives revenue/MRR tables next to `purchase`.
2. **Resend** — API key scoped to read; brings email delivery/bounce data so
   newsletter signup → delivered → clicked can be joined.
3. **Upstash Redis** — REST URL + token (same values as
   `UPSTASH_REDIS_REST_URL` / `_TOKEN`). Note it is a KV store, not an
   analytics source; connect only if you want link/CDN-style metrics.
4. **Vercel** — Vercel integration (OAuth), for deploy and Web Analytics data.

Create a read-only credential for each; never paste the production
`STRIPE_SECRET_KEY` or `RESEND_API_KEY` into a third-party source.

## Verifying the integration

```bash
npm run dev          # open the site, browse, add to cart
# PostHog → Activity → Live events should show $pageview, product_viewed, ...
```

Checklist:

- `$pageview` fires once per route change (not twice on load).
- `add_to_cart` includes `product_id` (the `metadata.app_id` value) and `value`
  in THB.
- `purchase` appears **once** per order after Stripe redirect (client + server
  dedupe).
- Session replay masks email/name fields.
- In production, requests go to `gingerbrosshop.com/ingest/...` (Network tab),
  not directly to `us.i.posthog.com`.

---

## What is enabled (all products, free tier)

Everything below is configured on project 767811. Free-tier budgets in brackets;
the site's volume is far below all of them.

| Product | Configuration |
|---|---|
| Product analytics [1M events] | Autocapture, custom events (see catalogue), timezone Asia/Bangkok, primary dashboard 01 |
| Session replay [5k recordings] | 100 % sample, 3 s minimum, 30-day retention, all inputs masked, `/admin` blocked, console logs + canvas + network timings captured (headers/bodies off) |
| Error tracking [100k exceptions] | Client `capture_exceptions`, `$exception` from `api/[...path].ts` via `captureServerException`, alert above 10/day, GitHub integration connected |
| Surveys [1.5k responses] | “Post-purchase rating” on `/order/success`, “Shop feedback” on `/shop` |
| Feature flags [1M requests] | `site-banner` (live, JSON payload en/th → `AnnouncementBar`), `hero-copy-experiment` (paused, multivariate), experiment “GB · Hero copy test” ready to launch |
| Data warehouse [1M rows] | Stripe, Resend, Vercel sources |
| Logs [10k MB] | Browser console logs sent to the Logs product; JSON parsing on; PII scrubbed at ingestion |
| Revenue analytics | Base currency THB; revenue event `purchase` using the `revenue` property (THB) |
| Marketing analytics | Conversion goal “Purchase” (action `Purchased`), counts as customer and revenue (THB, `revenue`); authorized URLs `gingerbrosshop.com` + `www` |
| Support (self-driving inbox) | Inbox enabled; chat widget deliberately not embedded |
| Workflows [10k emails] | Engagement events on; default UTM `utm_source=gingerbrosshop`, `utm_medium=email`; no sending domain connected |
| Alerts | Revenue < ฿500/day, checkout→purchase < 40 %, cart abandonment > 90 %, errors > 10/day |
| Cohorts | Purchasers, Subscribers, Newsletter verified, High-intent browsers, Cart abandoners |
| Actions | Purchased, Subscription started, Checkout started, Newsletter verified, Cart abandoned |
| Replay playlists | Purchasers, Checkout drop-off, Errors |
| Subscriptions | Weekly digest of dashboard 01 to gingerbros.brew@gmail.com |
| Annotations | “PostHog full product enablement” marker on the timeline |
| Heatmaps | On (toolbar/clicks) |
| AI (PostHog AI, replay vision) [credits] | Available in the UI; no code needed |

### Deliberately not enabled

- **Group analytics** — a paid addon ("Subscribe to the Group analytics addon");
  the project has no natural account entity anyway.
- **LLM analytics / AI observability / Tracing** — the site calls no LLM and emits no
  OTel spans, so these would stay empty. Add `posthog-node` tracing if that changes.
- **CSP reporting** — would require sending a `report-uri`/`report-to` header; adding a
  CSP header to a live shop is riskier than the value of the report stream.
- **MCP analytics** — no MCP server in this project.
- **Slack / Teams / CDP destinations** — need external credentials or an OAuth app, so
  they cannot be switched on from the repo. Transformations (GeoIP, drop `/admin`
  events) are enabled, and alerts already email the owner.
- **Workflows email sending** — needs a verified sending domain; UTM and engagement
  events are configured so it is ready when a domain exists.

### Privacy notes

Replay masks every input and anything tagged `data-ph-mask`, `/admin` is blocked from
recording, and network bodies are not captured. `respect_dnt` is `false` to match
GA4/Meta coverage — flip it in `src/lib/posthog.ts` if policy changes.
