# GingerBros API notes

Base URL: `https://gingerbrosshop.com`. No authentication for the endpoints below (see [auth.md](/auth.md)). Full schema: [openapi.json](/openapi.json).

- `GET /api/products` returns `{ products: [...] }` with `id`, `name`, `description`, `images`, `category` and `prices[]` (`priceId`, `unitAmount` in THB, `recurring`). Cached about 5 minutes.
- `GET /api/shipping-rate?province=bangkok&subtotal=300` returns `{ rate, free, estimatedDays }`. Free over THB 500.
- `POST /api/checkout` with `{ "items": [{ "priceId": "price_...", "quantity": 1 }] }` returns `{ "url": "https://checkout.stripe.com/..." }`. Live payments: hand the URL to the buyer; never pay for them or test it.
- `POST /api/x402/order` takes `{ items:[{priceId,quantity}], email, name, phone, address:{line1,line2?,district?,province,postalCode}, coldChain?, note? }` and answers `402` with the exact USDC price (x402, Base mainnet, pays to `0x941eb61c0052da28d09e39f7ddc946a9631a5eeb`). Repeat the request with the `X-PAYMENT` header to pay and place the order. Live money, delivery in Thailand, max ฿3000, never test.

Discovery: [/.well-known/api-catalog](/.well-known/api-catalog), [/.well-known/acp.json](/.well-known/acp.json), [/.well-known/ucp](/.well-known/ucp), [/llms.txt](/llms.txt).
