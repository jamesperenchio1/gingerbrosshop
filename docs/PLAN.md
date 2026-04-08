# Gingerbros E-Commerce Store — Master Plan

## Context

Gingerbros is a Thai craft ginger beverage brand selling ginger shots, ginger beer, and ginger ale. **This is a real product, not a side project.** The current custom Next.js+Prisma storefront at `~/gingerbrosshop/` is being **replaced** with a Medusa v2-powered stack for proper e-commerce features (inventory, orders, payments, admin dashboard).

The store runs on the homelab server (192.168.1.102) behind the existing Cloudflare → cloudflared → Caddy traffic flow. Payments via Stripe (Thai account) with native PromptPay QR support. Thailand-only market, THB currency, English language.

## Stability & Isolation Principles
- **No local/LAN access** — all traffic through Cloudflare tunnel only
- **Fully isolated** from other server projects (own Postgres, own Redis, own Docker network)
- **WAL archiving** — incremental Postgres backups, only captures changes, point-in-time recovery
- **Admin double-gated** — Authentik SSO + Medusa login on public /app URL
- **Tailscale backdoor** — `http://100.120.24.102:8080/app` bypasses SSO for local admin access
- **Docker restart policies** handle crash recovery (lean monitoring for small brand)
- **All ports bound to 127.0.0.1** — nothing exposed to network interfaces

## Architecture

```
Internet → Cloudflare (TLS) → cloudflared tunnel → Caddy (:80)
  gingerbrosshop.com       → localhost:8000  (Next.js storefront)
  api.gingerbrosshop.com   → localhost:9001  (Medusa backend + admin at /app)
```

All services in Docker Compose at `/opt/gingerbros/`.

## Products (3 products × 2 variants = 6 SKUs)

| Product      | Single | 6-Pack (5x price) |
|-------------|--------|-------------------|
| Ginger Shot | ฿70    | ฿350              |
| Ginger Beer | ฿120   | ฿600              |
| Ginger Ale  | ฿80    | ฿400              |

## Shipping
- Flat rate: ฿60
- Free shipping over ฿500

## Implementation Phases

### Phase 0: Git Repository Setup
- Create `/opt/gingerbros/` directory
- `git init`, copy plan docs into `docs/` directory
- Create GitHub repo (`gingerbrosshop`) and push
- All project files tracked in git from day one

### Phase 1: Infrastructure Setup
**Details:** [01-infrastructure.md](./gingerbros/01-infrastructure.md)
- Create `/opt/gingerbros/` directory structure
- Write `docker-compose.yml` (Postgres 16 on 5433, Redis 7, Medusa backend on 9001, Next.js storefront on 8000)
- Write `.env` with generated secrets
- Add Caddy reverse proxy entries for both domains
- Configure Cloudflare DNS + tunnel routes

### Phase 2: Medusa Backend
**Details:** [02-backend.md](./gingerbros/02-backend.md)
- Scaffold Medusa v2 project with `npx create-medusa-app@latest`
- Configure `medusa-config.ts` (Stripe with `automaticPaymentMethods: true` for native PromptPay)
- Write Dockerfile (multi-stage Node 20 Alpine build)
- Run migrations, create admin user (gingerbros.brew@gmail.com)
- Write seed script: Thailand region, THB, categories, products with variants, shipping options

### Phase 3: Next.js Storefront
**Details:** [03-storefront.md](./gingerbros/03-storefront.md)
- Clone Medusa Next.js starter
- Write Dockerfile (standalone output mode)
- Configure environment (dual backend URLs: internal for SSR, public for browser)
- Apply Gingerbros branding (colors, logo, fonts)
- Design direction: **calm, flowy, breathing** — generous whitespace, smooth scroll animations (Framer Motion), organic SVG wave dividers, warm ginger-gold palette. Not corporate-minimal, not cluttered. Soft transitions, flowing curves, content that breathes.
- Set Thailand/THB as default region

### Phase 4: Payments
**Details:** [04-payments.md](./gingerbros/04-payments.md)
- Stripe handles both card + PromptPay natively (Thai account)
- `automaticPaymentMethods: true` — Stripe Payment Element auto-shows PromptPay based on THB currency
- QR encodes exact amount (no free text entry)
- Stripe webhook at `api.gingerbrosshop.com/hooks/payment/stripe_stripe`
- No custom payment provider needed

### Phase 5: Production Hardening
**Details:** [05-production.md](./gingerbros/05-production.md)
- Daily Postgres backup cron → /mnt/hdd/gingerbros-backups/ (30-day retention)
- Authentik forward auth on admin dashboard (/app path)
- Caddy security headers (CSP, HSTS, X-Frame-Options)
- Docker restart policies (`unless-stopped` on all containers)
- .env file permissions (chmod 600)

### Phase 6: Deployment & Verification
**Details:** [06-deployment.md](./gingerbros/06-deployment.md)
- Build and start containers in order: postgres → redis → backend → storefront
- Run seed script
- Generate publishable API key from admin
- Set up backup cron job
- End-to-end verification checklist
- Archive old `~/gingerbrosshop/` project

### Phase 7: Post-Launch Features (Later)
- Product reviews
- Newsletter signup
- Social proof / testimonials
- Loyalty/referral program
- Instagram feed integration

## Key Decisions
- **Port 9001** for Medusa (9000 taken by Authentik)
- **Port 5433** for Postgres (5432 taken by Authentik)
- **Stripe-native PromptPay** — no custom payment module needed since Stripe account is Thai
- **Split plan files** for token efficiency — agents load only what they need
- **Core first** — launch with catalog + cart + checkout, add features incrementally
- **Authentik SSO on admin** — double-gated access for the real product
- **WAL archiving** — incremental backups, weekly base backup, WAL files rotated to HDD
- **Tailscale backdoor** — direct admin access via `100.120.24.102:8080`, no SSO
- **@medusajs/ui** — keep Medusa's own component library (Radix-based like shadcn), customize with Tailwind for the flowy look. Drop in individual shadcn components only if @medusajs/ui doesn't have what we need.
- **Lean monitoring** — Docker restart policies only, no external uptime service yet

## Critical Files
- `/opt/gingerbros/docker-compose.yml`
- `/opt/gingerbros/.env`
- `/opt/gingerbros/backend/medusa-config.ts`
- `/opt/gingerbros/backend/src/scripts/seed.ts`
- `/opt/gingerbros/storefront/.env.local`
- `/etc/caddy/Caddyfile` (add 2 new blocks)

## Skills to Install (first step of implementation)

```bash
# Add Medusa marketplace and install skills
/plugin marketplace add medusajs/medusa-agent-skills
/plugin install medusa-dev@medusa
/plugin install ecommerce-storefront@medusa
```

These provide:
- `medusa-dev` — modules, workflows, API routes, DB migrations, admin customizations
- `ecommerce-storefront` — conversion-optimized storefront patterns, checkout flows, component dev
- Slash commands: `/medusa-dev:db-migrate`, `/medusa-dev:new-user`, etc.
