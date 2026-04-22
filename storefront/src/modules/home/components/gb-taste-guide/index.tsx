"use client"

import { useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import GbBottle, { detectFlavor } from "@modules/common/components/gb-bottle"

function getUseCase(title: string = ""): string {
  const t = title.toLowerCase()
  if (t.includes("ale")) return "For easy sipping"
  if (t.includes("shot")) return "For your morning kick"
  if (t.includes("unpast")) return "For the purists"
  return "For cocktail nights"
}

function HeatBar({ heat = 3 }: { heat?: number }) {
  return (
    <div className="flex gap-[3px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="w-3.5 h-1 rounded-[2px]"
          style={{ background: i <= heat ? "linear-gradient(90deg, #C8893C, #8B3A1A)" : "rgba(44,24,16,0.08)" }}
        />
      ))}
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

  return (
    <section id="taste-guide" className="py-24 bg-white relative" style={{ scrollMarginTop: 80 }}>
      <div className="content-container">
        <div className="text-center mb-12">
          <p className="text-primary font-sans font-bold tracking-[0.3em] uppercase text-xs mb-3">Taste Guide</p>
          <h2 className="font-display text-[52px] font-bold text-dark tracking-[-0.02em] leading-tight mb-3.5">
            Not sure where to{" "}
            <span className="italic text-primary">start?</span>
          </h2>
          <p className="font-sans text-base text-dark/65 max-w-[560px] mx-auto">
            Four brews, four moods. Here&apos;s what each one is for.
          </p>
        </div>

        <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-4 gap-[18px]">
          {products.map((product) => {
            const flavor = detectFlavor(product.title, product.handle ?? "")
            const useCase = getUseCase(product.title ?? "")
            const meta = (product as any).metadata ?? {}
            const heat: number = typeof meta.heat === "number" ? meta.heat : 3
            const firstSentence = product.description?.split(".")[0]

            return (
              <button
                key={product.id}
                onClick={() => router.push(`/${countryCode}/products/${product.handle}`)}
                className="bg-background border border-dark/[0.06] rounded-[18px] p-[22px] cursor-pointer text-left font-sans transition-all duration-200 hover:-translate-y-1"
                style={{ transitionProperty: "transform, box-shadow" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 32px rgba(44,24,16,0.08)" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none" }}
              >
                <div className="flex justify-center mb-3">
                  <GbBottle flavor={flavor} size={120} />
                </div>
                <div className="font-display text-xl font-bold text-dark mb-1">{product.title}</div>
                <div className="font-sans text-[12px] tracking-[0.14em] uppercase text-primary font-bold mb-3">{useCase}</div>
                <HeatBar heat={heat} />
                {firstSentence && (
                  <p className="font-sans text-[13px] text-dark/70 mt-3" style={{ lineHeight: 1.55 }}>
                    {firstSentence}.
                  </p>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
