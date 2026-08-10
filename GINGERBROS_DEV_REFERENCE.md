# GingerBros Shop — Developer Reference

> Last updated: 2026-08-10  
> This file documents the Stripe setup, product catalog, checkout logic, and key integration points. **Read this before making commerce changes.**

---

## Stripe Account

- **Account**: `gingerbros.brew@gmail.com`
- **Secret key**: `STRIPE_SECRET_KEY` env var
- **Publishable key**: `STRIPE_PUBLISHABLE_KEY` env var
- **Webhook secret**: `STRIPE_WEBHOOK_SECRET` env var
- **Mode**: Live (production)

---

## Products & Prices

All products live in Stripe. The `/api/products` endpoint fetches active prices with expanded products automatically — **no hardcoded product list**. Products are surfaced via `metadata.app_id`.

### Drink Products

| Product | Stripe Product ID | Price ID | Price | app_id | Category |
|---------|-------------------|----------|-------|--------|----------|
| Ginger Fizz (single) | `prod_Ui5xhllgZN1b7a` | `price_1Tj1Gj4xTvnGlHCDPTwOQhDd` | ฿140 | `ginger-fizz` | drinks |
| Ginger Fizz 6-Pack | `prod_V2i9wXUip8ceFL` | `price_1U2clC4xTvnGlHCDTrZDeuLU` | **฿750** | `ginger-fizz-6pack` | drinks |
| — Weekly Sub | same product | `price_1TjER74xTvnGlHCDel4GYtWi` | ฿119/wk | `unpasteurized-sub-week` | drinks |
| — 2-Week Sub | same product | `price_1TjERe4xTvnGlHCDjakpfS8d` | ฿126/2wk | `unpasteurized-sub-2week` | drinks |
| — Monthly Sub | same product | `price_1TlT9j4xTvnGlHCDwrgy2MEu` | ฿133/mo | `unpasteurized-sub-month` | drinks |

### Delivery Fee Prices (Subscriptions only)

| Key | Price ID | Amount |
|-----|----------|--------|
| `week_1` | `price_1TlT9f4xTvnGlHCDrZQrZ4kI` | ฿60 |
| `week_2` | `price_1TlT9h4xTvnGlHCDBXJjknzd` | ฿60 |
| `month_1` | `price_1TlT9j4xTvnGlHCDwrgy2MEu` | ฿60 |

### Equipment Products

Equipment products also live in Stripe with `category: brewing-equipment`. These use **variant prices** (size · type format, e.g. `6.35mm · Gas`). See `src/lib/productContent.ts` for editorial content keyed by `app_id`.

---

## Product Metadata Schema

Every Stripe product should have these metadata fields:

```
app_id:            string   ← Required. Used for routing & content lookup
badge:             string   ← Optional. Shown on product card
badge_color:       string   ← Optional. Tailwind bg class, e.g. "bg-accent-green"
category:          string   ← "drinks" or "brewing-equipment"
short_description: string   ← Optional. Shown under product name in shop
hidden:            "true"   ← Set to hide from catalog (e.g. delivery fees)
```

---

## Editorial Content

`src/lib/productContent.ts` contains enrichment content keyed by `app_id`:
- `headline`, `longDescription`
- `ingredients`, `specs`, `nutrition`
- `features`, `compatibility`
- `relatedProducts` — array of `app_id`s for cross-sell

**Products work fine without an entry** — they just won't show extra detail sections.

### Adding a New Product

1. **Create in Stripe Dashboard** (or API):
   - Set `metadata.app_id` to a unique kebab-case ID
   - Set `metadata.category` to `drinks` or `brewing-equipment`
   - Upload product image(s)
   - Create price(s)

2. **Add editorial content** in `src/lib/productContent.ts`:
   ```ts
   'your-product-id': {
     headline: '...',
     longDescription: '...',
     // ... etc
   },
   ```

3. **Wire up checkout logic** if needed (see below).

4. **Add image** to `public/images/` if not using a hosted URL.

---

## Checkout Logic

`api/_lib/handlers/checkout.ts`

### Key Rules

- **No mixing one-time + subscription items** — Stripe Checkout limitation
- **COD not available for subscriptions**
- **Free shipping** at ฿500 subtotal (standard delivery)
- **Cold-chain delivery** available when cart contains ginger fizz products (`ginger-fizz` or `ginger-fizz-6pack`)
- **Subscription delivery fee** auto-added as recurring line item (Stripe doesn't support `shipping_options` in subscription mode)
- **Store credit** (box-return) auto-applied via dynamic coupon if customer email has credit balance

### Shipping Rates

| Type | Threshold | Amount |
|------|-----------|--------|
| Standard | subtotal < ฿500 | ฿100 |
| Standard | subtotal ≥ ฿500 | FREE |
| Cold-chain | subtotal < ฿500 | ฿200 |
| Cold-chain | subtotal ≥ ฿500 | ฿100 |

### Adding a New Product to Checkout

If the new product needs special checkout behavior (shipping, subscriptions, etc.), update `checkout.ts`:

```ts
// For cold-chain shipping eligibility
const hasGingerFizz = items.some(i => i.productId === 'ginger-fizz' || i.productId === 'your-new-id');

// For subscription delivery fee
const hasGingerFizzSub = recurringCount > 0 && items.some(i => i.productId === 'ginger-fizz' || i.productId === 'your-new-id');
```

---

## Product Images

| Image | Path | Used By |
|-------|------|---------|
| Single bottle | `public/images/ginger-fizz-new.png` | Product detail, hero |
| 6-Pack | `public/images/ginger-fizz-6pack.png` | 6-Pack product card & detail |
| Product video | `public/images/product-ginger-fizz.mp4` | Product detail gallery |

**Important**: The 6-Pack Stripe product references `https://gingerbrosshop.com/images/ginger-fizz-6pack.png` (absolute URL). Make sure this file exists on the production server at `/images/ginger-fizz-6pack.png`.

---

## Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `HomePage.tsx` | Landing with hero, shop, benefits, etc. |
| `/product/:id` | `ProductDetail.tsx` | Product detail with cart, variants, subscriptions |
| `/order/success` | `OrderSuccess.tsx` | Post-checkout success + subscription upsell |
| `/orders` | `OrdersPage.tsx` | Customer order lookup |
| `/track` | `TrackOrderPage.tsx` | Track order by order number |
| `/wholesale` | `WholesalePage.tsx` | B2B inquiry form |
| `/shipping` | `ShippingPage.tsx` | Shipping policy |
| `/faq` | `FAQPage.tsx` | FAQs |
| `/returns` | `ReturnsPage.tsx` | Return policy |
| `/privacy` | `PrivacyPage.tsx` | Privacy policy |
| `/terms` | `TermsPage.tsx` | Terms of service |
| `/blog` | `BlogPage.tsx` | Blog listing |
| `/blog/:slug` | `BlogPost.tsx` | Individual blog post |

### API Routes

| Route | File | Purpose |
|-------|------|---------|
| `/api/products` | `api/_lib/handlers/products.ts` | Fetch catalog from Stripe |
| `/api/checkout` | `api/_lib/handlers/checkout.ts` | Create Stripe Checkout session |
| `/api/webhook` | `api/webhook.ts` | Stripe webhook handler |
| `/api/orders` | `api/_lib/handlers/orders.ts` | Lookup orders by email |
| `/api/track-order` | `api/_lib/handlers/track-order.ts` | Track order by email + order number (last 8 of session ID) |
| `/api/email-tracking` | `api/_lib/handlers/email-tracking.ts` | Email tracking status via Resend |
| `/api/wholesale` | `api/_lib/handlers/wholesale.ts` | Wholesale inquiry email |
| `/api/stock-alert` | `api/_lib/handlers/stock-alert.ts` | Stock alert signup |
| `/api/reorder` | `api/_lib/handlers/reorder.ts` | Quick reorder |
| `/api/contact` | `api/_lib/handlers/contact.ts` | Contact form |
| `/api/credit` | `api/_lib/handlers/credit.ts` | Store credit lookup |

| Route | File | Purpose |
|-------|------|---------|
| `/api/products` | `api/_lib/handlers/products.ts` | Fetch catalog from Stripe |
| `/api/checkout` | `api/_lib/handlers/checkout.ts` | Create Stripe Checkout session |
| `/api/webhook` | `api/webhook.ts` | Stripe webhook handler |
| `/api/orders` | `api/_lib/handlers/orders.ts` | Lookup orders by email |
| `/api/track` | `api/_lib/handlers/track.ts` | Track order by order number |
| `/api/email-tracking` | `api/_lib/handlers/email-tracking.ts` | Email tracking info via Resend |
| `/api/wholesale` | `api/_lib/handlers/wholesale.ts` | Wholesale inquiry email |
| `/api/stock-alert` | `api/_lib/handlers/stock-alert.ts` | Stock alert signup |
| `/api/reorder` | `api/_lib/handlers/reorder.ts` | Quick reorder |
| `/api/contact` | `api/_lib/handlers/contact.ts` | Contact form |
| `/api/credit` | `api/_lib/handlers/credit.ts` | Store credit lookup |

---

## Email (Resend)

- **Service**: Resend
- **From**: `orders@gingerbrosshop.com`
- **Key**: `RESEND_API_KEY` env var
- **Templates**: `api/_lib/email.ts`

### Email Templates

| Template | Function | Used By |
|----------|----------|---------|
| `orderConfirmationEmailHtml` | Order confirmation | Webhook (checkout complete) |
| `subscriptionConfirmationEmailHtml` | Subscription signup | Webhook (checkout complete) |
| `wholesaleInquiryEmailHtml` | Wholesale inquiry | `/api/wholesale` |
| `stockAlertEmailHtml` | Back-in-stock notification | `/api/stock-alert` (future) |
| `trackingInfoEmailHtml` | Tracking status email | `/api/email-tracking` |

---

### Email Tracking Flow

The `/track` page lets customers look up their order and request a tracking email:

1. Customer enters **email** + **order number** (last 8 chars of Stripe session ID)
2. Frontend POSTs to `/api/email-tracking` with `{ email, order }`
3. Backend validates the order exists in Redis and matches the email
4. Resend sends a branded email with:
   - Order items
   - Tracking number + carrier (if set)
   - Link back to `/track`
   - "Being prepared" message if no tracking yet

**Rate limit**: 5 requests per minute per IP.

**To test**: Create an order via Stripe Checkout, then use the last 8 chars of the `session_id` as the order number on `/track`.

---

## Environment Variables Required

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

---

## Common Tasks

### Change a product price
Update the price in **Stripe Dashboard** → Products. The API picks it up automatically within 60 seconds (cache).

### Add a subscription plan
1. Create a new recurring Price on the existing Stripe Product
2. Set `metadata.app_id` on the price (e.g. `unpasteurized-sub-week`)
3. If it's a new interval, add the delivery fee Price ID to `DELIVERY_PRICE` in `checkout.ts`

### Add a new drink product
1. Create Product + Price in Stripe with `metadata.app_id` and `metadata.category: drinks`
2. Add editorial content to `src/lib/productContent.ts`
3. Add image to `public/images/`
4. Update `checkout.ts` if it needs special shipping logic
5. Build & deploy

### Hide a product from the shop
Set `metadata.hidden = "true"` on the Stripe Product.

---

## Notes

- The site uses **Thai Baht (THB)** with amounts in **satang** (1 THB = 100 satang) for Stripe
- Subscription products are attached to the **single bottle product** (`prod_Ui5xhllgZN1b7a`) — the 6-pack is one-time only
- The `app_id` on the single bottle is `ginger-fizz` but its prices use `unpasteurized` / `unpasteurized-sub-*` for historical reasons
- All checkout sessions redirect to `/order/success?session_id={CHECKOUT_SESSION_ID}`
