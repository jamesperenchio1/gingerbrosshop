# GingerBros auth.md

How AI agents authenticate with gingerbrosshop.com.

## Audience

Shopping and research agents acting for a customer of GingerBros, a Thai ginger-drink brand.

## Registration

None. GingerBros does not offer agent registration, API keys or OAuth. There is no `/agent/auth` endpoint, and no credentials are issued to agents.

## Public endpoints (no credentials)

| Endpoint | Purpose |
| --- | --- |
| `GET https://gingerbrosshop.com/api/products` | Live catalog and prices (THB) |
| `GET https://gingerbrosshop.com/api/shipping-rate?province=&subtotal=` | Delivery fee estimate |
| `POST https://gingerbrosshop.com/api/checkout` | Creates a Stripe-hosted checkout URL (rate limited to 10 per minute per IP) |

Machine-readable description: <https://gingerbrosshop.com/openapi.json>. Discovery: <https://gingerbrosshop.com/.well-known/api-catalog>. Human notes: <https://gingerbrosshop.com/docs/api.md>.

## Paying

Checkout is live (real money). The API returns a Stripe Checkout URL; the human buyer opens it and pays. Agents must not complete payment without the buyer's explicit confirmation, and must not place test orders.

## Not available to agents

Everything under `/admin` and the order-management endpoints require an administrator session and are not part of this surface.

## Contact

gingerbros.brew@gmail.com
