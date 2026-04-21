export default function GbStoryStrip() {
  return (
    <section className="py-[100px] bg-background relative overflow-hidden">
      <div className="content-container">
        <div
          className="grid gap-20 items-center"
          style={{ gridTemplateColumns: "1fr 1fr" }}
        >
          {/* Left: illustration */}
          <div className="relative" style={{ height: 480 }}>
            <div
              className="absolute inset-0 rounded-[20px] overflow-hidden"
              style={{ background: "linear-gradient(145deg, #3a2418 0%, #8B3A1A 50%, #C8893C 100%)" }}
            >
              <svg width="100%" height="100%" viewBox="0 0 480 480" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
                <defs>
                  <linearGradient id="tankG" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#FDF6EC" stopOpacity="0.12" />
                    <stop offset="1" stopColor="#FDF6EC" stopOpacity="0.04" />
                  </linearGradient>
                  <radialGradient id="glowG" cx="0.5" cy="0.3" r="0.6">
                    <stop offset="0" stopColor="#C8893C" stopOpacity="0.5" />
                    <stop offset="1" stopColor="#C8893C" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="480" height="480" fill="url(#glowG)" />
                <rect x="140" y="100" width="200" height="300" rx="12" fill="url(#tankG)" stroke="#FDF6EC" strokeWidth="1.5" strokeOpacity="0.35" />
                <ellipse cx="240" cy="100" rx="100" ry="18" fill="#FDF6EC" fillOpacity="0.15" stroke="#FDF6EC" strokeWidth="1.5" strokeOpacity="0.35" />
                <rect x="150" y="180" width="180" height="210" rx="6" fill="#C8893C" fillOpacity="0.35" />
                <ellipse cx="240" cy="180" rx="90" ry="10" fill="#E8B86A" fillOpacity="0.55" />
                {[{ x: 180, y: 330, r: 4 }, { x: 220, y: 270, r: 6 }, { x: 260, y: 310, r: 3 }, { x: 290, y: 260, r: 5 }, { x: 200, y: 220, r: 4 }, { x: 270, y: 370, r: 3 }].map((b, i) => (
                  <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#FDF6EC" fillOpacity="0.6" />
                ))}
                <rect x="330" y="320" width="40" height="10" fill="#FDF6EC" fillOpacity="0.3" />
                <circle cx="380" cy="325" r="12" fill="none" stroke="#FDF6EC" strokeWidth="2" strokeOpacity="0.4" />
                <line x1="140" y1="200" x2="340" y2="200" stroke="#FDF6EC" strokeOpacity="0.25" strokeWidth="1" />
                <line x1="140" y1="300" x2="340" y2="300" stroke="#FDF6EC" strokeOpacity="0.25" strokeWidth="1" />
                <text x="240" y="440" textAnchor="middle" fontFamily="Nunito, sans-serif" fontSize="11" letterSpacing="3" fill="#FDF6EC" fillOpacity="0.5" fontWeight="700">
                  FERMENTER · TANK 02
                </text>
              </svg>
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/[0.15] backdrop-blur-sm rounded-full font-sans text-[10px] font-bold tracking-[0.2em] text-white uppercase">
                Day 9 · active ferment
              </div>
            </div>

            {/* Provenance card */}
            <div
              className="absolute -bottom-8 -right-8 w-[240px] bg-white p-5 rounded-[16px]"
              style={{ boxShadow: "0 16px 40px rgba(44,24,16,0.14)" }}
            >
              <div className="text-[11px] tracking-[0.2em] text-primary font-bold uppercase font-sans">Provenance</div>
              <div className="font-display text-[22px] font-bold text-dark mt-1.5" style={{ lineHeight: 1.2 }}>
                Ginger from <span className="italic text-primary">Chiang Rai</span>
              </div>
              <div className="font-sans text-xs text-dark/65 mt-2" style={{ lineHeight: 1.5 }}>
                Highland-grown. Harvested within 72h of bottling.
              </div>
            </div>
          </div>

          {/* Right: copy */}
          <div>
            <p className="text-primary font-sans font-bold tracking-[0.3em] uppercase text-xs mb-3.5">Our Craft</p>
            <h2
              className="font-display font-bold text-dark mb-5"
              style={{ fontSize: 52, lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              One guy. One stubborn recipe.
            </h2>
            <p className="font-sans text-[17px] text-dark/70 mb-8" style={{ lineHeight: 1.65 }}>
              Started in a small Bangkok kitchen in 2024 after one too many bad supermarket ginger beers. Now a proper little brewery — fresh Thai ginger, a 14-day ferment, and no shortcuts.
            </p>

            <div className="grid grid-cols-3 gap-5">
              {[
                { n: "14", u: "day ferment" },
                { n: "0", u: "added flavor" },
                { n: "100%", u: "Thai ginger" },
              ].map((s) => (
                <div key={s.u} className="border-t border-dark/12 pt-3.5">
                  <div className="font-display text-[36px] font-bold text-dark leading-none">{s.n}</div>
                  <div className="font-sans text-[11px] text-dark/60 mt-1.5 tracking-[0.14em] uppercase">{s.u}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
