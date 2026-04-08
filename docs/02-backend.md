# Phase 2: Medusa Backend

## Scaffold Project

```bash
cd /tmp
npx create-medusa-app@latest --skip-db --no-browser gingerbros-backend
sudo mkdir -p /opt/gingerbros/backend
cp -r /tmp/gingerbros-backend/* /opt/gingerbros/backend/
cp -r /tmp/gingerbros-backend/.* /opt/gingerbros/backend/ 2>/dev/null
sudo chown -R james:james /opt/gingerbros
```

## Dockerfile (`/opt/gingerbros/backend/Dockerfile`)

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json yarn.lock* package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS builder
COPY package.json yarn.lock* package-lock.json* ./
RUN npm ci
COPY . .
RUN npx medusa build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/.medusa /app/.medusa
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/medusa-config.ts /app/medusa-config.ts
EXPOSE 9000
CMD ["npx", "medusa", "start"]
```

## Config (`/opt/gingerbros/backend/medusa-config.ts`)

```typescript
import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: { ssl: false },
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
    workerMode: "background",
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    vite: () => ({
      server: {
        allowedHosts: ["api.gingerbrosshop.com"],
      },
    }),
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              automaticPaymentMethods: true,  // enables PromptPay for THB
            },
          },
        ],
      },
    },
  ],
})
```

## Database Setup

```bash
cd /opt/gingerbros

# Start DB + cache first
docker compose up -d postgres redis
# Wait for healthy
docker compose ps

# Run migrations
docker compose run --rm backend npx medusa db:migrate

# Create admin user
docker compose run --rm backend npx medusa user \
  -e gingerbros.brew@gmail.com -p '<strong-password>'
```

## Seed Script (`/opt/gingerbros/backend/src/scripts/seed.ts`)

Creates:
1. **Region**: Thailand, THB, country code TH
2. **Categories**: Ginger Shot, Ginger Beer, Ginger Ale
3. **Products with variants**:

| Product | Variant | Price (cents) |
|---------|---------|---------------|
| Ginger Shot | Single | 7000 |
| Ginger Shot | 6-Pack | 35000 |
| Ginger Beer | Single | 12000 |
| Ginger Beer | 6-Pack | 60000 |
| Ginger Ale | Single | 8000 |
| Ginger Ale | 6-Pack | 40000 |

4. **Shipping options**:
   - "Standard Shipping" — flat ฿60 (6000 cents)
   - "Free Shipping" — ฿0, minimum order ฿500 (50000 cents)

5. **Sales channel**: Default, all products linked
6. **Payment providers**: Stripe enabled for Thailand region

Run with:
```bash
docker compose run --rm backend npx medusa exec ./src/scripts/seed.ts
```

## Admin Post-Setup (manual in browser)

1. Login at `https://api.gingerbrosshop.com/app`
2. Settings → Regions → verify Thailand/THB
3. Settings → Regions → Payment Providers → enable Stripe
4. Settings → API Key Management → generate publishable key
5. Copy publishable key to storefront `.env.local`
6. Products → upload product images for each item

## Stripe Webhook

In Stripe Dashboard → Webhooks:
- Endpoint URL: `https://api.gingerbrosshop.com/hooks/payment/stripe_stripe`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
