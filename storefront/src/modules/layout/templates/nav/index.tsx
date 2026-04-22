import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import AnnouncementBar from "@modules/layout/components/announcement-bar"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions(),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <AnnouncementBar />
      <header className="relative mx-auto border-b bg-[rgba(253,246,236,0.92)] backdrop-blur-[14px] border-light">
        <nav
          className="max-w-[1440px] mx-auto px-8 h-[68px] grid items-center"
          style={{ gridTemplateColumns: "1fr auto 1fr" }}
        >
          {/* Left: nav links (desktop only) */}
          <div className="hidden small:flex items-center gap-7">
            <LocalizedClientLink
              href="/store"
              className="font-sans text-sm text-dark/75 hover:text-dark transition-colors duration-200 font-medium"
            >
              Shop
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/#taste-guide"
              className="font-sans text-sm text-dark/75 hover:text-dark transition-colors duration-200 font-medium"
            >
              Taste guide
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/#story"
              className="font-sans text-sm text-dark/75 hover:text-dark transition-colors duration-200 font-medium"
            >
              Our story
            </LocalizedClientLink>
          </div>

          {/* Mobile: hamburger on the left */}
          <div className="small:hidden flex items-center">
            <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center">
            <LocalizedClientLink
              href="/"
              className="flex items-center"
              data-testid="nav-store-link"
            >
              <span className="font-display text-[26px] font-bold text-dark tracking-tight leading-none">
                Ginger<span className="text-primary">bros</span>
              </span>
            </LocalizedClientLink>
          </div>

          {/* Right: utility icons + cart */}
          <div className="flex items-center gap-[22px] justify-end">
            <LocalizedClientLink
              href="/account"
              className="hidden small:flex text-dark/75 hover:text-primary transition-colors duration-200 p-0"
              data-testid="nav-account-link"
              aria-label="Account"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            </LocalizedClientLink>

            <Suspense
              fallback={
                <button
                  className="flex items-center gap-2 bg-dark text-background rounded-full px-4 py-[10px] font-sans text-sm font-semibold"
                  aria-label="Cart"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 7h12l-1 13H7L6 7Z" />
                    <path d="M9 7a3 3 0 1 1 6 0" />
                  </svg>
                  <span>Cart</span>
                  <span className="bg-primary text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">0</span>
                </button>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
