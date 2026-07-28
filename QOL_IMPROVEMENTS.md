# Storefront QoL Improvements

Tracking file for quality-of-life improvements identified in a code-level audit of the
**real, live** gingerbrosshop.com codebase (2026-07-28), cloned fresh from
`jamesperenchio1/gingerbrosshop` (Vite + React + TypeScript + shadcn/Radix + Vercel
serverless). This is the third and final audit this session — two earlier rounds were
mistakenly done against non-live codebases (a Medusa/Next.js app and a separate
Next.js+Stripe app); both have been deleted from disk.

## Done

- [x] Wire up `sonner` Toaster + toast feedback: mounted `<Toaster/>` in `App.tsx`,
      added `toast.success()` on every add-to-cart path (Shop grid, PDP, related products)
- [x] Cart remove undo: removing a line now shows a toast with a built-in sonner action
      button ("Undo") that re-adds the exact item via `addItem()` (`CartDrawer.tsx`)
- [x] Real out-of-stock status. Investigated first: there's no inventory-quantity system
      anywhere in this codebase — availability is managed by deactivating the Stripe
      product/price, and the catalog API already filters to `active: true` only, so
      "In Stock" was technically never a lie. But there was no way to show "low stock" or
      "out of stock" for a product still worth *showing* (e.g. to collect back-in-stock
      interest) without fully deactivating it in Stripe. Added `stockStatus()` in
      `lib/catalog.ts` reading a `stock_status` Stripe product metadata key
      (`low_stock`/`out_of_stock`, defaults to `in_stock`) — no backend change needed,
      `metadata` was already passed through. Wired into Shop cards and the PDP: real
      badge + disabled Add to Cart when `out_of_stock`.
- [x] Fixed empty `alt=""` on the PDP thumbnail rail (main gallery image already had good
      alt text); also added an `aria-label` to each thumbnail button
- [x] Skeleton loading states: replaced "Loading…" text with shadcn `Skeleton`-based
      placeholders matching the actual layout — a 3-card grid skeleton on the Shop page,
      a two-column image+info skeleton on the PDP.
- [x] Mobile nav: Escape-to-close + body-scroll-lock added (matches `CartDrawer`'s
      existing pattern), `aria-expanded`/`aria-controls` on the hamburger button, and
      Track Order / Wholesale / FAQ links added to the mobile menu — those pages were
      already linked from the Footer, but had no entry point in primary nav (desktop or
      mobile), meaning mobile users had to scroll all the way down to find them.
- [x] Copy-to-clipboard for order numbers on Order Success, Track Order, and Admin Orders
      (new `components/CopyButton.tsx`, using `lucide-react` icons to match those pages'
      existing icon set rather than the custom `Icons.tsx` used elsewhere)
- [x] Top-level React error boundary (`components/ErrorBoundary.tsx`), wrapping
      Navigation/routes/CartDrawer in `App.tsx`. On-brand fallback with a reload button
      and a mailto link to support, instead of a blank white screen.
- [x] Cleaned up the two `console.log`s: both were deliberate fallback logging for
      missing Resend config (not accidental debug leftovers), so bumped to
      `console.warn` to match severity. Also stopped logging the *full* order object
      in `api/webhook.ts` — it carries customer PII (email, name, phone, shipping
      address); now logs just the session ID.

## Bigger items (scoped as small features, not one-line fixes)

- [x] Referral program frontend + a real bug fix underneath it. Investigation found the
      backend wasn't actually usable even with a UI: referral rewards were tracked as
      "points" (`api/_lib/referrals.ts`) in a completely separate system from the store
      credit that checkout actually knows how to redeem (`api/_lib/credits.ts`) — so
      building a UI on top of "points" would have shipped a fake, unspendable balance.
      Fixed by granting referral rewards as real store credit instead (฿5 each side,
      auto-applied at the next checkout by existing logic in
      `api/_lib/handlers/checkout.ts` — no new redemption code needed), removed the
      now-dead points functions, and added:
        - `components/ReferralCard.tsx` — shown on Order Success, displays the
          customer's code, current credit balance, and copy-code/copy-share-link buttons
        - a referral code field in the cart drawer that persists to localStorage and
          flows through `startCheckout()` → `/api/checkout` → webhook → credit grant
        - `?ref=CODE` capture on any page load (`App.tsx`), so a shared link pre-fills
          the code for whoever clicks it
- [x] Wholesale inquiry form: replaced the `mailto:` stub with a real form (business name,
      contact name, email, phone, message) that posts to a new `/api/wholesale` endpoint
      (rate-limited 5/hr/IP, validated, matches the existing `/api/subscribe` pattern).
      Sends the team a notification email and the submitter a confirmation, both via the
      existing Resend setup. Added an `escapeHtml()` helper in `api/_lib/email.ts` and used
      it for all user-supplied fields in the new templates, since this is the first
      email template built from a fully public, unauthenticated form.

## Out of scope

- Checkout flow itself (`src/lib/checkout.ts`, `api/_lib/handlers/checkout.ts`) — already
  solid: rate-limited, server-revalidates every price, guest checkout, gift + subscription
  split handled well. No changes needed.
- Shop listing has no search/sort/pagination, but the catalog is small enough that this
  isn't yet a real gap — noted for later if the catalog grows.

## Notes

- This file supersedes any QOL_IMPROVEMENTS.md found in other gingerbros-related
  directories — those projects were confirmed not to be the live site and were deleted.
