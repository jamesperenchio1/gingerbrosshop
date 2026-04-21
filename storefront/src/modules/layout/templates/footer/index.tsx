import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      >
        <path d="M15 4v10a4 4 0 1 1-4-4" />
        <path d="M15 4c0 2.5 2 4.5 4.5 4.5" />
      </svg>
    ),
  },
  {
    label: "LINE",
    href: "#",
    icon: (
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="14" rx="4" />
        <path d="M8 18l-1 3 4-3" />
        <path d="M7 9v4M10 9v4M10 9h1.5a1 1 0 0 1 1 1v3M15 9v4M17 9h-2v4h2" />
      </svg>
    ),
  },
]

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer
      style={{
        background: "#2C1810",
        color: "rgba(255,255,255,0.8)",
        width: "100%",
      }}
    >
      {/* Wave top */}
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: 60 }}
      >
        <path
          d="M0 40C360 80 720 0 1080 40C1260 60 1380 50 1440 40V80H0V40Z"
          fill="#2C1810"
        />
      </svg>

      <div
        style={{ maxWidth: 1440, margin: "0 auto", padding: "0 40px" }}
      >
        {/* Newsletter */}
        <div
          style={{
            padding: "48px 0 40px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: 36,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Recipes, restocks, and the occasional{" "}
              <span style={{ fontStyle: "italic", color: "#C8893C" }}>
                misfit batch.
              </span>
            </h3>
            <p
              style={{
                fontFamily: "Nunito, sans-serif",
                fontSize: 14,
                color: "rgba(255,255,255,0.6)",
                margin: "10px 0 0",
              }}
            >
              One email a month. No spam. ฿50 off your next order.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              background: "rgba(255,255,255,0.06)",
              padding: 6,
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <input
              type="email"
              placeholder="you@example.com"
              style={{
                flex: 1,
                background: "transparent",
                border: 0,
                outline: "none",
                color: "#fff",
                padding: "12px 18px",
                fontFamily: "Nunito, sans-serif",
                fontSize: 14,
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 22px",
                background: "#C8893C",
                color: "#fff",
                border: 0,
                borderRadius: 9999,
                fontFamily: "Nunito, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Links grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr 1fr 1fr",
            gap: 36,
            padding: "56px 0",
          }}
        >
          {/* Brand */}
          <div style={{ maxWidth: 280 }}>
            <LocalizedClientLink href="/" style={{ textDecoration: "none" }}>
              <span
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontWeight: 700,
                  fontSize: 30,
                  color: "#fff",
                  letterSpacing: "-0.01em",
                }}
              >
                Ginger
                <span style={{ color: "#C8893C" }}>bros</span>
              </span>
            </LocalizedClientLink>
            <p
              style={{
                fontFamily: "Nunito, sans-serif",
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                lineHeight: 1.65,
                margin: "16px 0 20px",
              }}
            >
              Handcrafted ginger beverages from Thailand. Real root, real
              ferment, real small-batch.
            </p>
            {/* Socials */}
            <div style={{ display: "flex", gap: 14 }}>
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 200ms",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = "#C8893C"
                    el.style.borderColor = "#C8893C"
                    el.style.color = "#fff"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = "transparent"
                    el.style.borderColor = "rgba(255,255,255,0.3)"
                    el.style.color = "rgba(255,255,255,0.7)"
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <div
              style={{
                fontFamily: "Nunito, sans-serif",
                fontWeight: 700,
                color: "#C8893C",
                fontSize: 12,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              Shop
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: 10,
              }}
            >
              {["All brews", "Ginger Beer", "Ginger Ale", "Ginger Shot", "Unpasteurized", "Build a 6-pack"].map(
                (item) => (
                  <li key={item}>
                    <LocalizedClientLink
                      href="/store"
                      style={{
                        color: "rgba(255,255,255,0.65)",
                        fontFamily: "Nunito, sans-serif",
                        fontSize: 13,
                        textDecoration: "none",
                        transition: "color 200ms",
                      }}
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLAnchorElement).style.color =
                          "#C8893C"
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLAnchorElement).style.color =
                          "rgba(255,255,255,0.65)"
                      }}
                    >
                      {item}
                    </LocalizedClientLink>
                  </li>
                )
              )}
              {productCategories?.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink
                    href={`/categories/${c.handle}`}
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontFamily: "Nunito, sans-serif",
                      fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    {c.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <div
              style={{
                fontFamily: "Nunito, sans-serif",
                fontWeight: 700,
                color: "#C8893C",
                fontSize: 12,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              Learn
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: 10,
              }}
            >
              {[
                ["Our story", "/store"],
                ["Brewing process", "/store"],
                ["Sourcing", "/store"],
                ["Press", "/store"],
              ].map(([label, href]) => (
                <li key={label}>
                  <LocalizedClientLink
                    href={href}
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontFamily: "Nunito, sans-serif",
                      fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    {label}
                  </LocalizedClientLink>
                </li>
              ))}
              {collections?.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink
                    href={`/collections/${c.handle}`}
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontFamily: "Nunito, sans-serif",
                      fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    {c.title}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <div
              style={{
                fontFamily: "Nunito, sans-serif",
                fontWeight: 700,
                color: "#C8893C",
                fontSize: 12,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              Help
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: 10,
              }}
            >
              {[
                ["Shipping info", "/store"],
                ["Track my order", "/account"],
                ["Returns", "/store"],
                ["FAQ", "/store"],
                ["Contact us", "/store"],
                ["Refer a friend", "/store"],
              ].map(([label, href]) => (
                <li key={label}>
                  <LocalizedClientLink
                    href={href}
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontFamily: "Nunito, sans-serif",
                      fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    {label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 0",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "Nunito, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span>
            &copy; {new Date().getFullYear()} Gingerbros · All rights reserved
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            <a
              href="#"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Privacy
            </a>
            <a
              href="#"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Terms
            </a>
            <a
              href="#"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Cookies
            </a>
          </div>
          <span>Brewed in Bangkok 🇹🇭</span>
        </div>
      </div>
    </footer>
  )
}
