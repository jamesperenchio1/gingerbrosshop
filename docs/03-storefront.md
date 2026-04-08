# Phase 3: Next.js Storefront

## Design Direction

**Calm, flowy, breathing layout** — not corporate minimalism, not cluttered. Think:
- Generous whitespace and padding
- Smooth scroll animations (Framer Motion)
- Soft transitions between sections
- Organic shapes and flowing curves (SVG wave dividers, rounded cards)
- Warm, inviting color palette — ginger golds, creamy whites, earthy tones
- Large hero imagery with subtle parallax
- Typography that breathes: generous line-height, comfortable reading size

**NOT**: rigid grids, aggressive CTAs, popup overlays, busy navigation, stock-photo energy.

## Scaffold

```bash
cd /opt/gingerbros
git clone https://github.com/medusajs/nextjs-starter-medusa.git storefront
cd storefront
npm install
# Add animation library
npm install framer-motion
```

## Dockerfile (`/opt/gingerbros/storefront/Dockerfile`)

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json yarn.lock* package-lock.json* ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 8000
ENV PORT=8000
CMD ["node", "server.js"]
```

**Important**: `next.config.js` must have `output: "standalone"` for this to work.

## Environment (`/opt/gingerbros/storefront/.env.local`)

```bash
# Server-side (SSR) — internal Docker network
MEDUSA_BACKEND_URL=http://backend:9000

# Client-side (browser) — public URL through Cloudflare
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.gingerbrosshop.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_<from-admin-dashboard>
NEXT_PUBLIC_BASE_URL=https://gingerbrosshop.com
NEXT_PUBLIC_DEFAULT_REGION=th

REVALIDATE_WINDOW=60
```

## Branding Customization

### Color Palette (tailwind.config.ts)
```
Primary:     #C8893C  (ginger gold)
Background:  #FDF6EC  (warm cream)
Dark:        #2C1810  (bark brown)
Accent:      #4A7C3F  (leaf green)
Light:       #F5E6D3  (light sand)
```

### Typography
- Headings: Playfair Display (serif, elegant)
- Body: Nunito or Inter (clean, readable)
- Generous line-height (1.7+ for body)

### Layout Principles
- Max-width content containers (1200px) centered with large margins
- Sections separated by SVG wave dividers (not hard lines)
- Cards with large border-radius (16-24px), subtle shadows
- Product images float with breathing room
- Checkout: single-page, minimal steps, progress feels effortless

### Page Structure
1. **Hero**: Full-width lifestyle shot, overlaid headline, gentle scroll-down indicator
2. **Products**: Relaxed grid (3 columns desktop, generous gaps), hover animations
3. **Product Detail**: Large image left, details right, smooth add-to-cart animation
4. **Cart**: Slide-in drawer (not separate page), clean summary
5. **Checkout**: Streamlined flow, Stripe Payment Element (auto-shows card + PromptPay)
6. **Footer**: Minimal — contact, socials, that's it

### Animations (Framer Motion)
- Fade-in-up on scroll for sections
- Smooth scale on product card hover
- Cart count badge bounce on add
- Page transitions with opacity fade
- No jarring, no bouncy, no flashy — everything eases in gently

## Key Files to Modify in Starter

| File | What to change |
|------|---------------|
| `tailwind.config.ts` | Colors, fonts, border-radius defaults |
| `src/app/layout.tsx` | Font imports, global styles |
| `src/app/page.tsx` | Hero section, featured products |
| `src/modules/products/` | Product card, product detail styling |
| `src/modules/cart/` | Cart drawer behavior |
| `src/modules/checkout/` | Streamlined checkout flow |
| `src/modules/layout/` | Nav, footer styling |
| `public/` | Logo, favicon, OG images |

## SEO Basics
- Page titles: "Gingerbros — Craft Ginger Beverages"
- Meta descriptions for all pages
- OG image for social sharing
- Structured data (Product schema) for search results
