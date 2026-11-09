# GingerBros API notes

Base URL: `https://gingerbrosshop.com`. No authentication for the endpoints below (see [auth.md](/auth.md)). Full schema: [openapi.json](/openapi.json).

- `GET /api/products` returns `{ products: [...] }` with `id`, `name`, `description`, `images`, `category` and `prices[]` (`priceId`, `unitAmount` in THB, `recurring`). Cached about 5 minutes.
- `GET /api/shipping-rate?province=bangkok&subtotal=300` returns `{ rate, free, estimatedDays }`. Free over THB 500.
- `POST /api/checkout` with `{ "items": [{ "priceId": "price_...", "quantity": 1 }] }` returns `{ "url": "https://checkout.stripe.com/..." }`. Live payments: hand the URL to the buyer; never pay for them or test it.

Discovery: [/.well-known/api-catalog](/.well-known/api-catalog), [/.well-known/acp.json](/.well-known/acp.json), [/.well-known/ucp](/.well-known/ucp), [/llms.txt](/llms.txt).
