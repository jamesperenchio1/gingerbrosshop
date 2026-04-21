"use client"

import GbBottle from "@modules/common/components/gb-bottle"

const MARQUEE_ITEMS = [
  "Fresh Thai ginger", "14-day natural ferment", "No flavoring agents", "Glass, not plastic", "Brewed in Bangkok",
]

function Stars({ count = 5, size = 14 }: { count?: number; size?: number }) {
  return (
    <div className="inline-flex gap-0.5" style={{ color: "#C8893C" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= count ? "#C8893C" : "#F5E6D3"}
          stroke="#C8893C" strokeWidth="1.5" strokeLinejoin="round"
        >
          <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z" />
        </svg>
      ))}
    </div>
  )
}

export default function Hero() {
  const scrollToShop = () => {
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })
  }
  const scrollToTasteGuide = () => {
    document.getElementById("taste-guide")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Main hero area */}
      <div
        className="relative"
        style={{
          minHeight: 660,
          background: "linear-gradient(160deg, #FDF6EC 0%, #F5E6D3 60%, #FDF6EC 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-10 -left-20 w-[420px] h-[420px] rounded-full bg-primary/[0.14] blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-16 w-[460px] h-[460px] rounded-full bg-accent/[0.10] blur-[80px] pointer-events-none" />

        {/* Content grid */}
        <div
          className="max-w-[1440px] mx-auto px-10 relative z-[2]"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 60,
            alignItems: "center",
            paddingTop: 72,
            paddingBottom: 120,
          }}
        >
          {/* Left: copy */}
          <div>
            {/* "NEW" pill */}
            <div className="inline-flex items-center gap-[10px] px-3.5 py-1.5 bg-white/70 border border-dark/[0.08] rounded-full mb-[22px] backdrop-blur-sm">
              <span className="bg-accent text-white text-[10px] font-bold tracking-[0.16em] px-2.5 py-1 rounded-full uppercase">NEW</span>
              <span className="font-sans text-[13px] text-dark/75">Unpasteurized Ginger Beer — now shipping</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>

            {/* Eyebrow */}
            <p className="text-primary font-sans font-bold tracking-[0.3em] uppercase text-xs mb-5">
              Handmade in Bangkok
            </p>

            {/* Headline */}
            <h1
              className="font-display font-bold text-dark mb-6"
              style={{ fontSize: 78, lineHeight: 1.02, letterSpacing: "-0.02em", margin: "0 0 24px" }}
            >
              Ginger with
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #C8893C 0%, #8B3A1A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontStyle: "italic",
                }}
              >
                a kick you can feel.
              </span>
            </h1>

            {/* Sub */}
            <p className="font-sans text-[18px] text-dark/72 max-w-[520px] mb-9" style={{ lineHeight: 1.6 }}>
              Fresh ginger, real fermentation, no syrupy shortcuts. The kind of drink that makes the supermarket version taste like tap water with sugar.
            </p>

            {/* CTAs */}
            <div className="flex gap-3 items-center flex-wrap">
              <button onClick={scrollToShop} className="gb-btn gb-btn--primary text-[15px]" style={{ padding: "16px 30px" }}>
                Shop the range
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <button onClick={scrollToTasteGuide} className="gb-btn gb-btn--ghost text-sm">
                Taste guide
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>

            {/* Trust row */}
            <div className="flex gap-7 mt-11 flex-wrap">
              <div>
                <div className="flex gap-2 items-center">
                  <Stars count={5} size={14} />
                  <span className="font-sans text-[13px] font-bold text-dark">4.9</span>
                </div>
                <div className="text-[11px] text-dark/55 mt-1 font-sans tracking-[0.04em]">From verified buyers</div>
              </div>
              <div className="w-px bg-dark/12" />
              <div>
                <div className="font-display text-xl font-bold text-dark">48h</div>
                <div className="text-[11px] text-dark/55 mt-1 font-sans tracking-[0.04em]">bottle-to-doorstep</div>
              </div>
              <div className="w-px bg-dark/12" />
              <div>
                <div className="font-display text-xl font-bold text-dark">14-day</div>
                <div className="text-[11px] text-dark/55 mt-1 font-sans tracking-[0.04em]">natural ferment</div>
              </div>
            </div>
          </div>

          {/* Right: bottles */}
          <div className="relative" style={{ height: 560 }}>
            {/* Shadow plate */}
            <div
              className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[380px] h-[30px] pointer-events-none"
              style={{ background: "radial-gradient(ellipse, rgba(44,24,16,0.25) 0%, transparent 70%)", filter: "blur(6px)" }}
            />
            {/* Ale (left) */}
            <div className="absolute left-1/2 bottom-10" style={{ transform: "translateX(calc(-50% - 90px)) translateY(-30px) rotate(-6deg)", zIndex: 1 }}>
              <GbBottle flavor="ale" size={380} />
            </div>
            {/* Beer (center) */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-10" style={{ zIndex: 3 }}>
              <GbBottle flavor="beer" size={460} />
            </div>
            {/* Shot (right) */}
            <div className="absolute left-1/2 bottom-10" style={{ transform: "translateX(calc(-50% + 90px)) translateY(-30px) rotate(6deg)", zIndex: 1 }}>
              <GbBottle flavor="shot" size={380} />
            </div>

            {/* Quote card */}
            <div
              className="absolute bottom-0 left-0 z-[5] bg-white rounded-[16px] p-[16px_18px] font-sans"
              style={{ width: 260, boxShadow: "0 12px 28px rgba(44,24,16,0.12)" }}
            >
              <div className="text-[10px] tracking-[0.2em] text-primary font-bold uppercase mb-2">Customer · Anchalee R.</div>
              <div className="font-display text-[15px] font-medium text-dark" style={{ lineHeight: 1.45 }}>
                &ldquo;Supermarket ginger beer will never taste the same.&rdquo;
              </div>
            </div>

            {/* Since 2024 badge */}
            <div
              className="absolute top-[10px] right-[10px] w-[110px] h-[110px] rounded-full bg-dark text-background flex flex-col items-center justify-center text-center font-sans"
              style={{ boxShadow: "0 8px 20px rgba(44,24,16,0.25)" }}
            >
              <div className="text-[10px] tracking-[0.2em] text-primary font-bold">SINCE</div>
              <div className="font-display text-[28px] font-bold leading-none">2024</div>
              <div className="text-[9px] tracking-[0.18em] opacity-70 mt-1">BANGKOK</div>
            </div>
          </div>
        </div>

        {/* Marquee strip */}
        <div
          className="absolute left-0 right-0 bottom-10 overflow-hidden py-[10px]"
          style={{ borderTop: "1px solid rgba(44,24,16,0.08)", borderBottom: "1px solid rgba(44,24,16,0.08)" }}
        >
          <div
            className="inline-flex whitespace-nowrap"
            style={{ animation: "gbMarquee 40s linear infinite" }}
          >
            {[...Array(4)].map((_, k) => (
              <span key={k} className="inline-flex items-center gap-7 font-display italic text-[18px] text-dark/55 mr-7">
                {MARQUEE_ITEMS.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-7">
                    {item}
                    {i < MARQUEE_ITEMS.length - 1 && <span className="text-primary">✦</span>}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block w-full -mt-px"
        style={{ height: 70 }}
      >
        <path d="M0 60C240 120 480 0 720 60C960 120 1200 0 1440 60V120H0V60Z" fill="white" />
      </svg>
    </div>
  )
}
