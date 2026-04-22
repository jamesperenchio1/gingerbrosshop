"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductSectionCard from "@modules/home/components/product-section-card"

type Size = "Single" | "6-Pack"

const FILTERS = [
  { id: "all", label: "All brews" },
  { id: "fiery", label: "🔥 Fiery" },
  { id: "mild", label: "Mild & easy" },
  { id: "mixer", label: "For cocktails" },
  { id: "shot", label: "Morning shot" },
  { id: "new", label: "New" },
]

function getFilterTags(product: HttpTypes.StoreProduct): string[] {
  const meta = (product as any).metadata ?? {}
  if (meta.filter_tags && Array.isArray(meta.filter_tags)) return meta.filter_tags

  // Derive from title/handle if no metadata
  const s = ((product.title ?? "") + " " + (product.handle ?? "")).toLowerCase()
  const tags: string[] = []
  if (s.includes("shot")) tags.push("shot", "fiery")
  else if (s.includes("ale")) tags.push("mild", "mixer")
  else if (s.includes("unpast")) tags.push("fiery", "new")
  else tags.push("fiery", "mixer") // beer default
  return tags
}

export default function GbShopSection({
  products,
  region,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}) {
  const [size, setSize] = useState<Size>("Single")
  const [filter, setFilter] = useState("all")

  const filtered =
    filter === "all"
      ? products
      : products.filter((p) => getFilterTags(p).includes(filter))

  // Filter to products that have the chosen size variant
  const withVariant = filtered.filter((p) =>
    (p.variants || []).some((v: any) => v.title?.toLowerCase() === size.toLowerCase())
  )

  return (
    <section id="shop" className="py-24 bg-white relative">
      <div className="content-container relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-9 flex-wrap gap-6">
          <div>
            <p className="text-primary font-sans font-bold tracking-[0.3em] uppercase text-xs mb-3">
              Our Range
            </p>
            <h2 className="font-display text-[48px] font-bold text-dark tracking-[-0.02em] leading-tight">
              Pick your pour.
            </h2>
            <p className="font-sans text-dark/65 text-base mt-2.5 max-w-[480px]">
              Four brews, one obsessive recipe process. Shot, ale, beer, and our new unpasteurized beer for the adventurers.
            </p>
          </div>

          {/* Size toggle */}
          <div className="inline-flex p-1 bg-background rounded-full border border-dark/[0.08]">
            {(["Single", "6-Pack"] as Size[]).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className="px-5 py-[9px] rounded-full font-sans text-[13px] font-semibold transition-all duration-200 flex items-center gap-1.5"
                style={{
                  background: size === s ? "#2C1810" : "transparent",
                  color: size === s ? "#FDF6EC" : "rgba(44,24,16,0.7)",
                }}
              >
                {s}
                {s === "6-Pack" && (
                  <span className="bg-accent text-white px-[7px] py-[2px] rounded-full text-[10px] font-bold">SAVE</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap mb-7">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-4 py-[9px] rounded-full font-sans text-[13px] font-medium transition-all duration-200"
              style={{
                border: filter === f.id ? "1px solid #2C1810" : "1px solid rgba(44,24,16,0.12)",
                background: filter === f.id ? "#2C1810" : "#fff",
                color: filter === f.id ? "#FDF6EC" : "rgba(44,24,16,0.75)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {withVariant.length > 0 ? (
          <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 large:grid-cols-4 gap-[22px]">
            {withVariant.map((product) => (
              <ProductSectionCard
                key={product.id}
                product={product}
                variantType={size}
                region={region}
                showSavings={size === "6-Pack"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 font-sans text-dark/50">
            No products found for this filter. Try another.
          </div>
        )}
      </div>
    </section>
  )
}
