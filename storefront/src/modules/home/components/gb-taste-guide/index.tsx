"use client"

import { useState, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useRouter } from "next/navigation"
import GbBottle, { detectFlavor } from "@modules/common/components/gb-bottle"

type Profile = {
  role: string
  servingTemp: string
  glass: string
  heat: number
  sweet: number
  fizz: number
  pairs: string[]
  notes: string[]
  moodBlurb: string
}

function profileFor(product: HttpTypes.StoreProduct): Profile {
  const meta = (product as any).metadata ?? {}
  const title = (product.title ?? "").toLowerCase()
  const handle = (product.handle ?? "").toLowerCase()
  const s = `${title} ${handle}`

  // Defaults derived from product type
  let base: Profile
  if (s.includes("shot")) {
    base = {
      role: "The morning kick",
      servingTemp: "Chilled · 4°C",
      glass: "Shot glass",
      heat: 5,
      sweet: 1,
      fizz: 1,
      pairs: ["On empty stomach", "With honey & lemon", "Post-workout"],
      notes: ["Raw ginger", "Warming heat", "Zero sugar"],
      moodBlurb:
        "Three seconds. One throat-clearing jolt. Zero filler. If coffee feels tired, this is the reset button.",
    }
  } else if (s.includes("ale")) {
    base = {
      role: "The easy sipper",
      servingTemp: "Ice-cold · 2°C",
      glass: "Tumbler or highball",
      heat: 2,
      sweet: 3,
      fizz: 4,
      pairs: ["Pad kra pao", "Fried chicken", "A long afternoon"],
      notes: ["Light ginger", "Crisp cane sugar", "Lemon finish"],
      moodBlurb:
        "The one you can drink three of. Light carbonation, real ginger, cane sugar — nothing you can't pronounce.",
    }
  } else if (s.includes("unpast")) {
    base = {
      role: "The purist",
      servingTemp: "Cold · 3°C (live culture)",
      glass: "Wine glass",
      heat: 4,
      sweet: 2,
      fizz: 5,
      pairs: ["Sushi", "Charcuterie", "A special Tuesday"],
      notes: ["Raw ferment", "Live probiotics", "Complex & dry"],
      moodBlurb:
        "No pasteurization, no shortcuts. A proper small-batch brew that tastes like the fermenter it came from.",
    }
  } else {
    // Ginger beer
    base = {
      role: "The cocktail backbone",
      servingTemp: "Cold · 3°C",
      glass: "Copper mug · Highball",
      heat: 4,
      sweet: 2,
      fizz: 4,
      pairs: ["Moscow mule", "Dark & stormy", "Slow-cooked pork"],
      notes: ["Punchy ginger", "Dry finish", "Balanced carb"],
      moodBlurb:
        "The workhorse. Strong enough to cut through whisky, dry enough to drink on its own.",
    }
  }

  // Override from metadata if provided
  return {
    role: meta.role ?? base.role,
    servingTemp: meta.servingTemp ?? base.servingTemp,
    glass: meta.glass ?? base.glass,
    heat: typeof meta.heat === "number" ? meta.heat : base.heat,
    sweet: typeof meta.sweet === "number" ? meta.sweet : base.sweet,
    fizz: typeof meta.fizz === "number" ? meta.fizz : base.fizz,
    pairs: Array.isArray(meta.pairs) ? meta.pairs : base.pairs,
    notes: Array.isArray(meta.notes) ? meta.notes : base.notes,
    moodBlurb: meta.moodBlurb ?? base.moodBlurb,
  }
}

function Meter({
  label,
  value,
  max = 5,
  colors = ["#C8893C", "#8B3A1A"],
}: {
  label: string
  value: number
  max?: number
  colors?: [string, string]
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-sans text-[11px] tracking-[0.16em] uppercase font-semibold text-dark/55">
          {label}
        </span>
        <span className="font-sans text-[11px] font-semibold text-dark/40">
          {value}/{max}
        </span>
      </div>
      <div className="flex gap-[5px]">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className="h-[5px] flex-1 rounded-[3px]"
            style={{
              background:
                i < value
                  ? `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`
                  : "rgba(44,24,16,0.08)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function GbTasteGuide({
  products,
  countryCode,
}: {
  products: HttpTypes.StoreProduct[]
  countryCode: string
}) {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(products[0]?.id ?? null)

  const active = useMemo(
    () => products.find((p) => p.id === activeId) ?? products[0],
    [products, activeId]
  )

  if (!active) return null

  const activeProfile = profileFor(active)
  const activeFlavor = detectFlavor(active.title, active.handle ?? "")

  return (
    <section
      id="taste-guide"
      className="py-24 bg-white relative"
      style={{ scrollMarginTop: 80 }}
    >
      <div className="content-container">
        <div className="text-center mb-14">
          <p className="text-primary font-sans font-bold tracking-[0.3em] uppercase text-xs mb-3">
            Taste Guide
          </p>
          <h2 className="font-display text-[52px] font-bold text-dark tracking-[-0.02em] leading-tight mb-3.5">
            Not sure where to{" "}
            <span className="italic text-primary">start?</span>
          </h2>
          <p className="font-sans text-base text-dark/65 max-w-[560px] mx-auto">
            Four brews, four moods. Tap one to see how to drink it, what to
            pair it with, and why we made it.
          </p>
        </div>

        <div className="grid gap-8 small:grid-cols-[1fr_360px]">
          {/* Left: featured card */}
          <article
            className="relative bg-background rounded-[22px] overflow-hidden border border-dark/[0.06] flex flex-col small:flex-row"
            style={{ minHeight: 480 }}
          >
            {/* Photo */}
            <div className="relative small:w-[46%] aspect-[4/5] small:aspect-auto bg-gradient-to-br from-[#F5E6D3] to-[#FDF6EC]">
              {active.thumbnail ? (
                <Image
                  key={active.id}
                  src={active.thumbnail}
                  alt={active.title ?? ""}
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <GbBottle flavor={activeFlavor} size={240} />
                </div>
              )}
              <div className="absolute top-5 left-5 inline-flex items-center gap-2 px-3 py-1.5 bg-dark/85 text-background rounded-full font-sans text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm">
                {activeProfile.role}
              </div>
            </div>

            {/* Info */}
            <div className="p-8 small:p-10 flex-1 flex flex-col">
              <h3 className="font-display text-[32px] font-bold text-dark tracking-[-0.01em] leading-[1.1]">
                {active.title}
              </h3>
              <p className="font-sans text-[15px] text-dark/70 mt-3 leading-[1.65]">
                {activeProfile.moodBlurb}
              </p>

              {/* Meters */}
              <div className="grid grid-cols-3 gap-5 mt-7">
                <Meter label="Heat" value={activeProfile.heat} />
                <Meter
                  label="Sweet"
                  value={activeProfile.sweet}
                  colors={["#E8B86A", "#C8893C"]}
                />
                <Meter
                  label="Fizz"
                  value={activeProfile.fizz}
                  colors={["#8FB09A", "#3a5d48"]}
                />
              </div>

              {/* Serving info */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-7 pt-6 border-t border-dark/[0.08]">
                <div>
                  <div className="font-sans text-[10px] tracking-[0.2em] uppercase text-dark/50 mb-1">
                    Serve
                  </div>
                  <div className="font-sans text-[13px] text-dark font-medium">
                    {activeProfile.servingTemp}
                  </div>
                </div>
                <div>
                  <div className="font-sans text-[10px] tracking-[0.2em] uppercase text-dark/50 mb-1">
                    Glass
                  </div>
                  <div className="font-sans text-[13px] text-dark font-medium">
                    {activeProfile.glass}
                  </div>
                </div>
              </div>

              {/* Pairings */}
              <div className="mt-5">
                <div className="font-sans text-[10px] tracking-[0.2em] uppercase text-dark/50 mb-2">
                  Pairs with
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeProfile.pairs.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center px-3 py-1.5 bg-white border border-dark/[0.08] rounded-full font-sans text-[12px] text-dark/75"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tasting notes */}
              <div className="mt-5">
                <div className="font-sans text-[10px] tracking-[0.2em] uppercase text-dark/50 mb-2">
                  Tasting notes
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeProfile.notes.map((n) => (
                    <span
                      key={n}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/[0.08] text-primary rounded-full font-sans text-[12px] font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-auto pt-8 flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    router.push(`/${countryCode}/products/${active.handle}`)
                  }
                  className="inline-flex items-center gap-2 px-6 py-3 bg-dark text-background rounded-full font-sans font-semibold text-[13px] hover:bg-[#3d2318] transition-colors"
                >
                  View {active.title}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>
          </article>

          {/* Right: selector list */}
          <div className="flex flex-col gap-3">
            {products.map((p) => {
              const profile = profileFor(p)
              const flavor = detectFlavor(p.title, p.handle ?? "")
              const isActive = p.id === active.id
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  aria-pressed={isActive}
                  className="group flex items-center gap-4 p-3 pr-5 rounded-[16px] text-left transition-all duration-200 border"
                  style={{
                    background: isActive ? "#FDF6EC" : "#fff",
                    borderColor: isActive
                      ? "rgba(200,112,42,0.4)"
                      : "rgba(44,24,16,0.08)",
                    boxShadow: isActive
                      ? "0 10px 28px rgba(44,24,16,0.08)"
                      : "none",
                  }}
                >
                  <div className="relative w-[76px] h-[94px] rounded-[11px] overflow-hidden bg-gradient-to-br from-[#F5E6D3] to-[#FDF6EC] flex-shrink-0">
                    {p.thumbnail ? (
                      <Image
                        src={p.thumbnail}
                        alt={p.title ?? ""}
                        fill
                        sizes="76px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <GbBottle flavor={flavor} size={58} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-[17px] font-semibold text-dark leading-tight truncate">
                      {p.title}
                    </div>
                    <div className="font-sans text-[11px] font-bold tracking-[0.14em] uppercase text-primary mt-1">
                      {profile.role}
                    </div>
                    <div className="flex gap-[3px] mt-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className="w-3 h-[3px] rounded-[2px]"
                          style={{
                            background:
                              i <= profile.heat
                                ? "linear-gradient(90deg,#C8893C,#8B3A1A)"
                                : "rgba(44,24,16,0.08)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isActive ? "text-primary" : "text-dark/25 group-hover:text-dark/50"}
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
