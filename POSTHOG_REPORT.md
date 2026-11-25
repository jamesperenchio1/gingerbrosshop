# PostHog reporting pack — GingerBros Shop

Seven dashboards, 63 insights, built on the events documented in `POSTHOG.md` plus the
Stripe / Resend / Vercel warehouse sources. Everything here is live in project **767811**
(US cloud).

| # | Dashboard | Link | Insights |
|---|---|---|---|
| 01 | Executive — Revenue & Growth | https://us.posthog.com/project/767811/dashboard/2413899 | 7 |
| 02 | Conversion Funnel | https://us.posthog.com/project/767811/dashboard/2413900 | 8 |
| 03 | Acquisition & Content | https://us.posthog.com/project/767811/dashboard/2413901 | 10 |
| 04 | Product & Merchandising | https://us.posthog.com/project/767811/dashboard/2413902 | 10 |
| 05 | Lifecycle & CRM | https://us.posthog.com/project/767811/dashboard/2413903 | 10 |
| 06 | Data Warehouse | https://us.posthog.com/project/767811/dashboard/2413904 | 8 |
| 07 | Web Health & Experience | https://us.posthog.com/project/767811/dashboard/2413905 | 9 |

> **Read this first.** Production currently contains a handful of test events from the
> integration work. Most trends will be empty or near-zero until real traffic and real
> orders accumulate (roughly 2–4 weeks for funnel rates to stabilise). The dashboards are
> structurally correct; the numbers are not yet meaningful.

---

## Metric definitions used throughout

| Metric | Definition | Notes |
|---|---|---|
| Revenue | `purchase` → `revenue` (THB) | Server copy from the Stripe webhook; client copy deduped by `$insert_id` |
| Orders | count of `purchase` | One per completed Checkout Session |
| AOV | revenue ÷ orders | Includes shipping and gift add-ons |
| New vs returning | 1 purchase ever = new, 2+ = returning | Computed by distinct id (email once identified) |
| Session | unique `$session_id` | 30-minute inactivity timeout (PostHog default) |
| View → cart | `add_to_cart` ÷ `product_viewed` | Per product when broken down |
| Cart → checkout | `checkout_started` ÷ `add_to_cart` | Same-session, 14-day funnel window |
| Checkout → purchase | `purchase` ÷ `checkout_started` | Stripe redirect completion |
| Cart abandonment | sessions with `checkout_started` and no `purchase` | Time-boxed by the funnel window |
| Newsletter verify rate | `newsletter_verified` ÷ `newsletter_subscribed` | Double opt-in; 24 h code validity |

Funnels all use a **14-day conversion window** and step ordering, so a user who views a
product, leaves, and buys two weeks later still counts.

---

## 01 · Executive — Revenue & Growth

The five-minute Monday read: is revenue up, where does it come from, who is buying.

| Tile | Question it answers | How to read it |
|---|---|---|
| Revenue per day (THB) | Daily top line | Look at the 7-day rolling shape, not single days. Weekend lift is normal for DTC. |
| Orders per day | Volume separate from price | If revenue rises but orders don't, AOV/discounting is doing the work. |
| Average order value (THB) | Basket size | AOV falling with orders rising = successful acquisition, thinner baskets. |
| Revenue by product | Which SKU actually earns | Fizz vs Tea vs equipment. Equipment is high-ticket, low-repeat. |
| One-time vs subscription revenue | Recurring mix | Share of revenue that is subscription is the single best health signal for this business. |
| Revenue by payment method | Card vs PromptPay vs others | PromptPay skew signals Thai-local demand; card skew signals tourists/expats. |
| New vs returning customers | Retention vs acquisition | A healthy DTC mix trends toward 30–40 % returning by month 3–6. |

**Benchmarks (DTC beverage, TH):** AOV ฿450–900; subscription share 8–15 % early,
25 %+ once retention is proven; returning-customer share 25–40 %.

**Act when:** subscription share drops below its trailing 4-week average, or returning
customers fall below 20 % — that is a retention problem, not a marketing one.

---

## 02 · Conversion Funnel

The four-step chain every visitor walks: **view → cart → checkout → paid**.

| Tile | What it exposes |
|---|---|
| Core purchase funnel | Absolute drop-off at each step. This is the headline number. |
| Product view → cart rate | Merchandising and pricing quality. |
| Cart → checkout rate | Cart-drawer friction: shipping cost shock, forced account, unclear delivery. |
| Checkout → purchase (paid conversion) | Stripe page abandonment: payment methods, trust, delivery timing. |
| Cart abandonment | Sessions that reached checkout but never paid. |
| Buy-now vs add-to-cart | Whether the shortcut is used or ignored. |
| Funnel by product | Which SKU converts and which only attracts views. |
| Funnel by gift purchase | Whether gifting converts better or worse than self-purchase. |

**Benchmarks:** view → cart 6–12 %; cart → checkout 40–60 %; checkout → purchase 55–75 %
for Stripe-redirect flows; overall cart abandonment 65–80 % is normal, above 85 % is not.

**Diagnosis order:** if view → cart is low, the problem is the product page (price, photos,
stock messaging). If cart → checkout is low, it is the drawer (shipping, delivery promise).
If checkout → purchase is low, it is payment/delivery options on the Stripe page — and
`checkout_started` vs webhook `purchase` will disagree, which itself is the signal.

---

## 03 · Acquisition & Content

Where visitors come from and whether content earns its keep.

| Tile | Use |
|---|---|
| Pageviews per day | Baseline traffic; compare against GA4 to sanity-check the DNT/ad-block delta. |
| Top pages | Which pages absorb attention. Product pages should dominate. |
| Traffic sources (referring domain) | Organic/paid/social split without relying on UTM hygiene. |
| UTM campaign sources | Campaign-level attribution where tags exist. |
| Guide/article views by slug | Content demand per guide. |
| Article → purchase | Whether reading a guide precedes buying — the core content-ROI question. |
| Language split | EN vs TH demand; drives which pages deserve Thai meta. |
| Link-page clicks by block type | Which link-in-bio blocks people actually press. |
| Link-page social clicks | Platform intent from the link page. |
| Link-page signups | Email capture specifically from the link page. |

**How to read article → purchase:** this is a two-step funnel (article view → purchase),
not proof of causation. Treat a rate above the site-wide baseline as evidence the topic
attracts buyers; treat high views with a low rate as traffic that will never convert.

---

## 04 · Product & Merchandising

SKU-level demand and the choices made on the product page.

| Tile | Use |
|---|---|
| Product views by product | Demand vs availability. |
| Add-to-cart by product | Actual intent, not curiosity. |
| View → cart rate by product | The cleanest per-SKU conversion measure. |
| One-time vs subscription option mix | Whether the subscription price is being seen and chosen. |
| Buy-now clicks | Shortcut adoption. |
| Delivery method mix | Standard vs hand-delivered demand; hand-delivered is a premium signal. |
| Gift purchases | Gifting share of orders. |
| Cart sharing | Shared-cart feature usage (`cart_shared` + `shared_cart_opened`). |
| Promo code exposure | Which promos are actually surfaced to users. |
| Shop tab engagement | Drinks vs equipment tab split. |

**Watch:** a SKU with high views and a view → cart rate well below the site average is
either mispriced, under-photographed, or out of stock (check `stock_status` on
`product_viewed`).

---

## 05 · Lifecycle & CRM

Email, referrals, reviews and B2B — the compounding channels.

| Tile | Reads |
|---|---|
| Newsletter signup → verified | Double opt-in health. Below 50 % means the welcome email is landing in spam or the code step is confusing. |
| Newsletter verified → first purchase | List quality. 5–15 % within 30 days is a good range for a warm list. |
| Referral journey | Link visit → code entered → credit applied. The middle step is where friction lives. |
| Referral revenue | Revenue attributed by `referral_code`. |
| Referral activity per day | Volume trend of the programme. |
| Review ratings | Star distribution; a spike of 1–2 stars is a product or shipping issue. |
| Stock alerts by product | Unmet demand — the strongest restock signal you have. |
| Wholesale inquiries | B2B pipeline volume. |
| Order tracking usage | Post-purchase anxiety proxy; high usage often correlates with delivery questions. |
| Newsletter email performance (Resend) | Delivered vs bounced per day, straight from the warehouse. |

**Benchmarks:** verify rate 50–70 %; referral conversion (code entered → credit) 60 %+;
review average 4.3+ with <5 % one-star.

---

## 06 · Data Warehouse

Native SQL over the connected sources — the ground truth that does not depend on browser
tracking.

| Tile | Source |
|---|---|
| Stripe revenue by day | `stripe.invoice` where `status = 'paid'`, `amount_paid / 100` |
| Stripe invoice status mix | `stripe.invoice.status` distribution |
| Subscriptions by status | `stripe.subscription.status` (active / past_due / canceled) |
| New subscriptions per month | `stripe.subscription.created_at` |
| Catalog: products & prices | `stripe.price` joined to `stripe.product`, interval extracted from `recurring` |
| Customers per month | `stripe.customer.created_at` |
| Email deliverability by day (Resend) | `resend.emails.last_event` counts |
| Deployments per day (Vercel) | `vercel.deployments` |

### Current warehouse limitations

- **Amounts are in minor units.** Divide by 100 for THB.
- **Only these Stripe tables are synced today:** `customer`, `invoice`, `product`,
  `price`, `subscription`. `charge`, `payment_intent`, `checkout_session`, `refund`,
  `coupon` and `promotion_code` have not completed a first sync, so no insight depends on
  them. If you want refund-adjusted revenue, enable those tables on the Stripe source and
  add a `stripe.charge`-based tile later.
- **Every existing Stripe invoice has `amount_paid = 0`** (test/comped invoices), which is
  why the Stripe revenue tile correctly reads zero. It is not a broken query.
- Resend tables are **full refresh only** (no incremental), so they re-read on each sync.
- Cross-source joins are possible (`stripe.customer.id` ↔ PostHog person email via
  `distinct_id`), but require consistent emails — identify() covers this for logged-in
  flows only.

---

## 07 · Web Health & Experience

Delivery quality: is the site fast, are recordings arriving, what breaks.

| Tile | Use |
|---|---|
| Sessions per day | Real visit counts (unique sessions, not pageviews). |
| Pageviews vs autocapture | Sanity check that instrumentation fires at the expected ratio. |
| Core Web Vitals | LCP / CLS / INP pulled from `$web_vitals`; LCP under 2.5 s, CLS under 0.1, INP under 200 ms. |
| Session replay coverage | Recordings per day; a sudden drop means the recorder is blocked or the CSP broke. |
| Top clicked elements | Autocapture's answer to "what do people actually press". |
| Device types | Mobile share (expected 70 %+ for this audience). |
| Countries | TH vs export demand; also spam/bot detection. |
| Engagement: pageview vs pageleave | Rough bounce proxy. |
| Errors | `$exception` volume — should be zero outside releases. |

---

## Weekly operating routine

1. **Monday** — dashboard 01: revenue, AOV, subscription share, new vs returning.
2. **Monday** — dashboard 02: the four funnel steps, compared with last week. Any step
   moving more than 5 points is worth a look.
3. **Wednesday** — dashboard 04: any SKU whose view → cart rate fell while views held.
4. **Friday** — dashboard 05: referral, newsletter and stock-alert volume; restock from
   `stock_alert_signup` if a product is out.
5. **Monthly** — dashboard 06: reconcile PostHog revenue against Stripe invoices. A gap
   above ~5 % means the webhook missed events (check `$insert_id` presence) or the client
   copy is double-counting.

## Other products switched on

Beyond the seven dashboards, the project uses the rest of the free tier:

- **Revenue analytics** — THB base currency, `purchase` counted from the `revenue`
  property. Compare it with dashboard 01 when they disagree.
- **Marketing analytics** — one conversion goal, “Purchase” (the `Purchased` action),
  marked as both a customer and a revenue event, so CAC/ROAS tiles have a denominator
  and a value. Authorized URLs are `gingerbrosshop.com` and `www.gingerbrosshop.com`.
- **Logs** — console logs from the browser, JSON parsed and PII-scrubbed, useful for
  correlating a replay with a client-side error.
- **Support** — the self-driving inbox is enabled; the chat widget is not embedded, so
  tickets would only arrive through the API or a forwarded mailbox.
- **Workflows** — engagement events and default UTM tags are configured; sending waits
  on a verified domain.
- **Data pipelines** — GeoIP and a transformation that drops `/admin` events run on
  every event before storage.

Group analytics is a paid addon and stays off; LLM analytics, AI observability and
Tracing have no traffic to observe.

## Known limitations

- **Only test data so far.** Rates will move wildly on tiny samples; do not act on a
  funnel step with fewer than ~50 entries at that step.
- **DNT is ignored** (`respect_dnt: false`) to match GA4/Meta, so counts are comparable
  across tools but exclude nothing. Flip it in `src/lib/posthog.ts` if that changes.
- **Ad blockers** suppress a slice of client events; server events (`purchase`,
  `newsletter_subscribed`, `checkout_session_created`) are the authoritative fallback.
- **Identified-only profiles** — anonymous visitors do not create person records, so
  "unique users" in PostHog means distinct ids, not people.
- **Warehouse sync lag** is minutes-to-hours; never compare a warehouse tile against a
  live event tile in the same minute.
