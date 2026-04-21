import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import AnnouncementBar from "@modules/home/components/announcement-bar"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  const navLink: React.CSSProperties = {
    background: "none",
    border: 0,
    cursor: "pointer",
    fontFamily: "Nunito, sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: "rgba(44,24,16,0.75)",
    padding: "8px 4px",
    textDecoration: "none",
  }

  return (
    <>
      <AnnouncementBar />
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid #F5E6D3",
          background: "rgba(253,246,236,0.92)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <nav
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "0 32px",
            height: 68,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
          }}
        >
          {/* Left nav links (desktop) */}
          <div
            style={{
              display: "flex",
              gap: 28,
              alignItems: "center",
            }}
          >
            {/* Mobile menu */}
            <div className="block small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>

            {/* Desktop links */}
            <div className="hidden small:flex" style={{ display: "flex", gap: 28 }}>
              <LocalizedClientLink href="/store" style={navLink}>
                Shop
              </LocalizedClientLink>
              <LocalizedClientLink href="/store" style={navLink}>
                Flavors
              </LocalizedClientLink>
              <LocalizedClientLink href="/store" style={navLink}>
                Our Story
              </LocalizedClientLink>
            </div>
          </div>

          {/* Center: logo */}
          <LocalizedClientLink
            href="/"
            style={{ textDecoration: "none" }}
            data-testid="nav-store-link"
          >
            <span
              style={{
                fontFamily: "Playfair Display, serif",
                fontWeight: 700,
                fontSize: 26,
                color: "#2C1810",
                letterSpacing: "-0.01em",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              Ginger
              <span style={{ color: "#C8893C" }}>bros</span>
            </span>
          </LocalizedClientLink>

          {/* Right: utility icons */}
          <div
            style={{
              display: "flex",
              gap: 22,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <LocalizedClientLink
              href="/account"
              style={{
                ...navLink,
                padding: 0,
                display: "flex",
              }}
              data-testid="nav-account-link"
              aria-label="Account"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            </LocalizedClientLink>

            <Suspense
              fallback={
                <LocalizedClientLink
                  href="/cart"
                  style={{
                    ...navLink,
                    padding: "10px 16px",
                    background: "#2C1810",
                    color: "#FDF6EC",
                    borderRadius: 9999,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    textDecoration: "none",
                  }}
                  data-testid="nav-cart-link"
                >
                  <svg
                    width={15}
                    height={15}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 7h12l-1 13H7L6 7Z" />
                    <path d="M9 7a3 3 0 1 1 6 0" />
                  </svg>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Cart</span>
                  <span
                    style={{
                      background: "#C8893C",
                      color: "#fff",
                      borderRadius: 9999,
                      minWidth: 20,
                      height: 20,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "0 6px",
                    }}
                  >
                    0
                  </span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </div>
    </>
  )
}
