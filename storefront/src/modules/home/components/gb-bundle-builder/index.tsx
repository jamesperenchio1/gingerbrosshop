"use client"

import { useState, useTransition } from "react"
import { HttpTypes } from "@medusajs/types"
import GbBottle, { detectFlavor } from "@modules/common/components/gb-bottle"
import { addToCart } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"

const MAX = 6

export default function GbBundleBuilder({
  products,
  region,
  countryCode,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  const [picks, setPicks] = useState<HttpTypes.StoreProduct[]>([])
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  const add = (p: HttpTypes.StoreProduct) => {
    if (picks.length < MAX) setPicks((prev) => [...prev, p])
  }
  const removeAt = (i: number) => setPicks((prev) => prev.filter((_, idx) => idx !== i))
  const progress = (picks.length / MAX) * 100

  const currency = region.currency_code ?? "thb"

  // Calculate price: sum of single variant prices × 0.83 (17% off)
  const total = picks.reduce((acc, p) => {
    const singleVariant = ((p.variants || []) as any[]).find(
      (v: any) => v.title?.toLowerCase() === "single"
    )
    return acc + (singleVariant?.calculated_price?.calculated_amount ?? 0)
  }, 0)
  const discounted = Math.round(total * 0.83)
  const saved = total - discounted

  const handleAddToCart = () => {
    startTransition(async () => {
      const singleVariants = picks.map((p) => {
        const v = ((p.variants || []) as any[]).find(
          (v: any) => v.title?.toLowerCase() === "single"
        )
        return v
      }).filter(Boolean)

      try {
        await Promise.all(
          singleVariants.map((v) =>
            addToCart({ variantId: v.id, quantity: 1, countryCode })
          )
        )
        setDone(true)
        setTimeout(() => { setPicks([]); setDone(false) }, 2000)
      } catch (e) {
        console.error("Bundle add failed:", e)
      }
    })
  }

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FDF6EC 0%, #F5E6D3 100%)" }}
    >
      <div className="content-container relative">
        <div
          className="grid gap-14 items-start"
          style={{ gridTemplateColumns: "1fr 440px" }}
        >
          {/* Left: picker */}
          <div>
            <p className="text-accent font-sans font-bold tracking-[0.3em] uppercase text-xs mb-3">
              Mix &amp; Match · Save 17%
            </p>
            <h2
              className="font-display font-bold text-dark mb-4"
              style={{ fontSize: 56, lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              Build your{" "}
              <span className="italic text-primary">own 6-pack.</span>
            </h2>
            <p className="font-sans text-[17px] text-dark/70 mb-9 max-w-[520px]" style={{ lineHeight: 1.6 }}>
              Can&apos;t decide? Pick any six bottles. Any flavors, any ratio. We&apos;ll pack it up and ship it within 48 hours.
            </p>

            <div className="grid grid-cols-1 xsmall:grid-cols-2 gap-3.5">
              {products.map((p) => {
                const flavor = detectFlavor(p.title, p.handle ?? "")
                const singleVariant = ((p.variants || []) as any[]).find(
                  (v: any) => v.title?.toLowerCase() === "single"
                )
                const priceAmt = singleVariant?.calculated_price?.calculated_amount
                const priceLabel = priceAmt != null ? convertToLocale({ amount: priceAmt, currency_code: currency }) : null

                return (
                  <button
                    key={p.id}
                    onClick={() => add(p)}
                    disabled={picks.length >= MAX}
                    className="flex items-center gap-3.5 px-[18px] py-3.5 bg-white border border-dark/[0.08] rounded-[14px] text-left font-sans transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onMouseEnter={(e) => { if (picks.length < MAX) { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(44,24,16,0.08)" } }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none" }}
                  >
                    <div className="w-11 h-14 bg-gradient-to-br from-light to-background rounded-lg flex items-center justify-center flex-shrink-0">
                      <GbBottle flavor={flavor} size={48} />
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-[15px] font-semibold text-dark">{p.title}</div>
                      {priceLabel && (
                        <div className="text-[11px] text-dark/55 mt-0.5">{priceLabel} each</div>
                      )}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-dark text-background flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: summary box */}
          <div
            className="bg-white rounded-[20px] p-6 sticky top-[100px]"
            style={{ boxShadow: "0 18px 40px rgba(44,24,16,0.08)" }}
          >
            <div className="flex justify-between items-baseline mb-3.5">
              <div className="font-display text-xl font-bold text-dark">Your box</div>
              <div className="font-sans text-[13px] text-dark/60">{picks.length} of {MAX}</div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-light rounded-full overflow-hidden mb-[18px]">
              <div
                className="h-full rounded-full transition-all duration-[320ms]"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #C8893C, #4A7C3F)" }}
              />
            </div>

            {/* 6 slots */}
            <div className="grid grid-cols-6 gap-1.5 mb-5">
              {Array.from({ length: MAX }).map((_, i) => {
                const p = picks[i]
                const flavor = p ? detectFlavor(p.title, p.handle ?? "") : "beer"
                return (
                  <div
                    key={i}
                    onClick={() => p && removeAt(i)}
                    className="rounded-[10px] flex items-center justify-center"
                    style={{
                      height: 70,
                      border: p ? "none" : "1px dashed rgba(44,24,16,0.2)",
                      background: p ? "linear-gradient(145deg,#F5E6D3,#FDF6EC)" : "transparent",
                      cursor: p ? "pointer" : "default",
                    }}
                    title={p ? `Remove ${p.title}` : undefined}
                  >
                    {p && <GbBottle flavor={flavor} size={52} />}
                  </div>
                )
              })}
            </div>

            {/* Price summary */}
            <div className="border-t border-dark/[0.08] pt-4">
              <div className="flex justify-between text-[13px] text-dark/65 font-sans mb-1.5">
                <span>Singles total</span>
                <span style={{ textDecoration: picks.length ? "line-through" : "none" }}>
                  {picks.length > 0 ? convertToLocale({ amount: total, currency_code: currency }) : "–"}
                </span>
              </div>
              <div className="flex justify-between text-[13px] text-accent font-semibold font-sans mb-3.5">
                <span>6-pack discount</span>
                <span>{picks.length > 0 ? `− ${convertToLocale({ amount: saved, currency_code: currency })}` : "–"}</span>
              </div>
              <div className="flex justify-between items-baseline mb-[18px]">
                <span className="font-display text-xl font-bold text-dark">Total</span>
                <span className="font-sans text-[26px] font-bold text-primary">
                  {picks.length > 0 ? convertToLocale({ amount: discounted, currency_code: currency }) : "–"}
                </span>
              </div>
              <button
                disabled={picks.length !== MAX || isPending}
                onClick={handleAddToCart}
                className="gb-btn gb-btn--primary w-full justify-center"
                style={{
                  opacity: picks.length === MAX && !isPending ? 1 : 0.45,
                  cursor: picks.length === MAX && !isPending ? "pointer" : "not-allowed",
                }}
              >
                {done
                  ? "✓ Added to cart!"
                  : isPending
                  ? "Adding..."
                  : picks.length === MAX
                  ? "Add to cart"
                  : `Pick ${MAX - picks.length} more`}
                {!done && !isPending && picks.length === MAX && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
