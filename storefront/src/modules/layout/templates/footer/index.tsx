import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import GbBottle from "@modules/common/components/gb-bottle"

function SocialIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="w-9 h-9 rounded-full border border-white/70 flex items-center justify-center text-white/70 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
    >
      {children}
    </a>
  )
}

function Wave() {
  return (
    <svg
      viewBox="0 0 1440 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="block w-full"
      preserveAspectRatio="none"
      style={{ height: 60, marginBottom: -1 }}
    >
      <path
        d="M0 40C360 80 720 0 1080 40C1260 60 1380 50 1440 40V80H0V40Z"
        fill="#2C1810"
      />
    </svg>
  )
}

export default async function Footer() {
  const { collections } = await listCollections({ fields: "*products" })
  const productCategories = await listCategories()

  return (
    <footer className="bg-dark text-white/80 w-full">
      <Wave />

      <div className="content-container">
        {/* Newsletter row */}
        <div
          className="py-12 border-b grid gap-[60px] items-center"
          style={{ borderColor: "rgba(255,255,255,0.1)", gridTemplateColumns: "1fr 1fr" }}
        >
          <div>
            <h3 className="font-display text-[36px] font-bold text-white tracking-tight leading-tight">
              Recipes, restocks, and the occasional{" "}
              <span className="italic text-primary">misfit batch.</span>
            </h3>
            <p className="font-sans text-sm text-white/60 mt-2.5">
              One email a month. No spam. ฿50 off your next order.
            </p>
          </div>
          <div
            className="flex gap-2 items-center p-1.5 rounded-full border"
            style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 bg-transparent border-0 outline-none text-white placeholder-white/40 px-[18px] py-3 font-sans text-sm"
            />
            <button
              type="button"
              className="px-[22px] py-3 bg-primary text-white rounded-full font-sans font-semibold text-sm hover:bg-[#B57A2F] transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Main columns */}
        <div
          className="grid py-14 gap-9"
          style={{ gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr" }}
        >
          {/* Brand */}
          <div className="max-w-[280px]">
            <LocalizedClientLink href="/" className="inline-block mb-4">
              <span className="font-display text-[30px] font-bold text-white tracking-tight">
                Ginger<span className="text-primary">bros</span>
              </span>
            </LocalizedClientLink>
            <p className="font-sans text-white/60 text-[13px] leading-[1.65] mb-5">
              Handcrafted ginger beverages from Thailand. Real root, real ferment, real small-batch.
            </p>
            {/* Social icons */}
            <div className="flex gap-3.5">
              <SocialIcon label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </SocialIcon>
              <SocialIcon label="TikTok">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 4v10a4 4 0 1 1-4-4" /><path d="M15 4c0 2.5 2 4.5 4.5 4.5" />
                </svg>
              </SocialIcon>
              <SocialIcon label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v5h4v-5h3l1-4h-4V8.5A.5.5 0 0 1 14.5 8H14Z" />
                </svg>
              </SocialIcon>
              <SocialIcon label="LINE">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="14" rx="4" /><path d="M8 18l-1 3 4-3" /><path d="M7 9v4M10 9v4M10 9h1.5a1 1 0 0 1 1 1v3M15 9v4M17 9h-2v4h2" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Shop */}
          <div>
            <div className="font-sans font-bold text-primary text-xs tracking-[0.24em] uppercase mb-[18px]">Shop</div>
            <ul className="grid gap-2.5">
              {[
                { label: "All brews", href: "/store" },
                ...((productCategories ?? []).slice(0, 5).map((c) => ({
                  label: c.name,
                  href: `/categories/${c.handle}`,
                }))),
                { label: "Build a 6-pack", href: "/#shop" },
              ].map((item) => (
                <li key={item.label}>
                  <LocalizedClientLink
                    href={item.href}
                    className="font-sans text-[13px] text-white/65 hover:text-primary transition-colors duration-200"
                  >
                    {item.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <div className="font-sans font-bold text-primary text-xs tracking-[0.24em] uppercase mb-[18px]">Learn</div>
            <ul className="grid gap-2.5">
              {[
                { label: "Our story", href: "/#story" },
                { label: "Where we source", href: "/#story" },
                { label: "Brewing process", href: "/#story" },
                { label: "Recipes", href: "/store" },
                ...((collections ?? []).slice(0, 2).map((c) => ({
                  label: c.title,
                  href: `/collections/${c.handle}`,
                }))),
              ].map((item) => (
                <li key={item.label}>
                  <LocalizedClientLink
                    href={item.href}
                    className="font-sans text-[13px] text-white/65 hover:text-primary transition-colors duration-200"
                  >
                    {item.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <div className="font-sans font-bold text-primary text-xs tracking-[0.24em] uppercase mb-[18px]">Help</div>
            <ul className="grid gap-2.5">
              {[
                { label: "Shipping info", href: "/store" },
                { label: "Track my order", href: "/account/orders" },
                { label: "Returns", href: "/customer-service" },
                { label: "FAQ", href: "/customer-service" },
                { label: "Contact us", href: "/customer-service" },
              ].map((item) => (
                <li key={item.label}>
                  <LocalizedClientLink
                    href={item.href}
                    className="font-sans text-[13px] text-white/65 hover:text-primary transition-colors duration-200"
                  >
                    {item.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* More */}
          <div>
            <div className="font-sans font-bold text-primary text-xs tracking-[0.24em] uppercase mb-[18px]">More</div>
            <ul className="grid gap-2.5">
              {[
                { label: "Gifting", href: "/store" },
                { label: "Refer a friend", href: "/account" },
                { label: "Press kit", href: "/customer-service" },
              ].map((item) => (
                <li key={item.label}>
                  <LocalizedClientLink
                    href={item.href}
                    className="font-sans text-[13px] text-white/65 hover:text-primary transition-colors duration-200"
                  >
                    {item.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex justify-between items-center py-6 border-t flex-wrap gap-2.5"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <span className="font-sans text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Gingerbros · All rights reserved
          </span>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <a key={l} href="#" className="font-sans text-white/40 text-xs no-underline hover:text-white/60 transition-colors">
                {l}
              </a>
            ))}
          </div>
          <span className="font-sans text-white/40 text-xs">Brewed in Bangkok 🇹🇭</span>
        </div>
      </div>
    </footer>
  )
}
