# GingerBros Shop — Coding Agent Reference

> Read this before making any commerce/product/checkout changes.

## Stripe Setup

- **Account**: `gingerbros.brew@gmail.com`
- **Secret key**: `STRIPE_SECRET_KEY` env var
- **Publishable key**: `STRIPE_PUBLISHABLE_KEY` env var
- **Webhook secret**: `STRIPE_WEBHOOK_SECRET` env var
- **Mode**: Live (production) — do NOT place test orders
- **Currency**: THB (amounts in satang: 1 THB = 100 satang)

## Products & Prices

All products live in Stripe. The `/api/products` endpoint fetches active prices with expanded products automatically. Products are surfaced via `metadata.app_id`.

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

## Product Metadata Schema

Every Stripe product must have these metadata fields:

```
app_id:            string   ← Required. Used for routing & content lookup
badge:             string   ← Optional. Shown on product card
badge_color:       string   ← Optional. Tailwind bg class, e.g. "bg-accent-green"
category:          string   ← "drinks" or "brewing-equipment"
short_description: string   ← Optional. Shown under product name in shop
hidden:            "true"   ← Set to hide from catalog
```

## Editorial Content

`src/lib/productContent.ts` contains enrichment content keyed by `app_id`:
- `headline`, `longDescription`, `ingredients`, `specs`, `nutrition`, `features`, `compatibility`, `relatedProducts`
- Products work fine without an entry — they just won't show extra detail sections.

## Checkout Logic (`api/_lib/handlers/checkout.ts`)

Key rules:
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

If the new product needs special checkout behavior, update `checkout.ts`:
```ts
const hasGingerFizz = items.some(i => i.productId === 'ginger-fizz' || i.productId === 'your-new-id');
const hasGingerFizzSub = recurringCount > 0 && items.some(i => i.productId === 'ginger-fizz' || i.productId === 'your-new-id');
```

## Adding a New Product

1. **Create in Stripe Dashboard** (do NOT use API for live products unless confirmed):
   - Set `metadata.app_id` to a unique kebab-case ID
   - Set `metadata.category` to `drinks` or `brewing-equipment`
   - Upload product image(s)
   - Create price(s)

2. **Add editorial content** in `src/lib/productContent.ts`

3. **Update checkout logic** if needed

4. **Add image** to `public/images/` if not using a hosted URL

5. **Build & deploy**

## Email (Resend)

- **Service**: Resend
- **From**: `orders@gingerbrosshop.com`
- **Key**: `RESEND_API_KEY` env var
- **Templates**: `api/_lib/email.ts`

## Environment Variables

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

## Full Reference

For complete documentation (all routes, API endpoints, email templates, equipment products), see `GINGERBROS_DEV_REFERENCE.md`.
