import GbBottle from "@modules/common/components/gb-bottle"

export default function GbSubscription() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "#2C1810", color: "#FDF6EC" }}>
      {/* Background blobs */}
      <div className="absolute -top-24 -left-24 w-[400px] h-[400px] rounded-full bg-primary/[0.15] blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-accent/[0.12] blur-[100px] pointer-events-none" />

      <div
        className="content-container relative grid gap-[60px] items-center"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Left: copy */}
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/[0.18] text-primary rounded-full font-sans font-bold text-[11px] tracking-[0.24em] uppercase mb-[22px]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            Save 15% Forever
          </div>
          <h2
            className="font-display font-bold mb-5"
            style={{ fontSize: 58, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#FDF6EC" }}
          >
            Never run out of{" "}
            <span className="italic" style={{ color: "#E8B86A" }}>the good stuff.</span>
          </h2>
          <p className="font-sans text-[17px] mb-8 max-w-[480px]" style={{ color: "rgba(253,246,236,0.75)", lineHeight: 1.6 }}>
            Subscribe for a monthly 6-pack. Change flavors, skip a month, or cancel from your account — no phone calls, no nonsense.
          </p>

          <div className="grid grid-cols-3 gap-7 mb-9 font-sans text-[13px]" style={{ justifyContent: "start" }}>
            {[
              { label: "Save 15%", icon: "check" },
              { label: "Skip or cancel anytime", icon: "repeat" },
              { label: "Free shipping always", icon: "truck" },
            ].map((b) => (
              <div key={b.label} className="flex gap-2 items-center text-background">
                <span className="text-primary">
                  {b.icon === "check" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                  {b.icon === "repeat" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                  )}
                  {b.icon === "truck" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="6" width="14" height="11" rx="1" /><path d="M15 10h4l3 3v4h-7" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" />
                    </svg>
                  )}
                </span>
                {b.label}
              </div>
            ))}
          </div>

          <a
            href="mailto:orders@gingerbrosshop.com?subject=Start%20my%20monthly%20crate&body=Hi%20Gingerbros!%20I%27d%20like%20to%20subscribe%20to%20the%20monthly%206-pack%20crate.%20Please%20send%20me%20the%20next%20steps.%0A%0AName%3A%0AAddress%3A%0APhone%3A%0AFlavor%20mix%20preference%3A%0A"
            className="inline-flex items-center gap-[10px] px-[30px] py-4 bg-primary text-white rounded-full font-sans font-semibold text-[15px] hover:bg-[#B57A2F] transition-colors"
          >
            Start a subscription
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>

        {/* Right: plan card */}
        <div
          className="rounded-[20px] p-7"
          style={{
            background: "linear-gradient(145deg, rgba(253,246,236,0.06), rgba(253,246,236,0.02))",
            border: "1px solid rgba(253,246,236,0.12)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex justify-between items-start mb-[22px]">
            <div>
              <div className="font-sans text-[11px] tracking-[0.24em] uppercase text-primary font-bold mb-1.5">The Crate</div>
              <div className="font-display text-[28px] font-bold text-background">Monthly 6-pack</div>
            </div>
            <div className="text-right">
              <div className="font-sans text-xs text-background/50 line-through">฿600</div>
              <div className="font-sans text-[32px] font-bold text-primary leading-none">฿510</div>
              <div className="font-sans text-[11px] text-background/55 mt-0.5">/month</div>
            </div>
          </div>

          <div className="flex gap-2 mb-[22px]">
            <GbBottle flavor="beer" size={90} />
            <GbBottle flavor="ale" size={90} />
            <GbBottle flavor="shot" size={90} />
          </div>

          <div
            className="border-t pt-4 font-sans text-[13px]"
            style={{ borderColor: "rgba(253,246,236,0.1)", color: "rgba(253,246,236,0.7)", lineHeight: 1.6 }}
          >
            Your first box ships within 2 days. Then every 30 days — or whenever you tell us to.
          </div>
        </div>
      </div>
    </section>
  )
}
