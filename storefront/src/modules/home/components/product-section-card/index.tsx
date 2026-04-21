"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import GbBottle, { detectFlavor } from "@modules/common/components/gb-bottle"
import { convertToLocale } from "@lib/util/money"

type VariantType = "Single" | "6-Pack"

function Stars({ count = 5, size = 12 }: { count?: number; size?: number }) {
  return (
    <div className="inline-flex gap-0.5">
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

export default function ProductSectionCard({
  product,
  variantType,
  region,
  showSavings,
}: {
  product: HttpTypes.StoreProduct
  variantType: VariantType
  region: HttpTypes.StoreRegion
  showSavings?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  const variants = (product.variants || []) as any[]
  const variant = variants.find((v: any) => v.title?.toLowerCase() === variantType.toLowerCase())
  if (!variant) return null

  const price = variant.calculated_price?.calculated_amount
  const originalPrice = variant.calculated_price?.original_amount
  const currency = variant.calculated_price?.currency_code

  const priceLabel = price != null && currency ? convertToLocale({ amount: price, currency_code: currency }) : null
  const hasDiscount = originalPrice != null && price != null && originalPrice > price
  const originalPriceLabel = hasDiscount && currency ? convertToLocale({ amount: originalPrice, currency_code: currency }) : null

  // Per-bottle math for 6-packs
  let perBottleLabel: string | null = null
  let savingsLabel: string | null = null
  if (variantType === "6-Pack" && price && currency) {
    const perUnit = Math.round(price / 6)
    perBottleLabel = convertToLocale({ amount: perUnit, currency_code: currency }) + "/bottle"
    if (showSavings) {
      const singleVariant = variants.find((v: any) => v.title?.toLowerCase() === "single")
      if (singleVariant?.calculated_price?.calculated_amount) {
        const savings = singleVariant.calculated_price.calculated_amount * 6 - price
        if (savings > 0) savingsLabel = "Save " + convertToLocale({ amount: savings, currency_code: currency })
      }
    }
  }

  // Metadata
  const meta = (product as any).metadata ?? {}
  const heat: number = typeof meta.heat === "number" ? meta.heat : 3
  const rating: number = typeof meta.rating === "number" ? meta.rating : 5
  const reviews: number = typeof meta.reviews === "number" ? meta.reviews : 0
  const tag: string | null = meta.tag ?? null
  const lowStock: boolean = !!meta.low_stock

  const flavor = detectFlavor(product.title, product.handle ?? "")
  const hasThumbnail = !!product.thumbnail

  const href = `/products/${product.handle}?v_id=${variant.id}`

  return (
    <div
      className="bg-white rounded-[20px] overflow-hidden flex flex-col relative cursor-pointer"
      style={{
        boxShadow: hovered ? "0 18px 40px -10px rgba(44,24,16,0.16)" : "0 1px 3px rgba(44,24,16,0.06)",
        transition: "box-shadow 300ms, transform 300ms",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid="product-wrapper"
    >
      {/* Badges row */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between z-[2]">
        <div className="flex gap-1.5 flex-wrap">
          {tag && (
            <span className="bg-dark text-background text-[10px] font-bold tracking-[0.12em] uppercase px-[11px] py-[5px] rounded-[6px] leading-tight">
              {tag}
            </span>
          )}
          {savingsLabel && (
            <span className="bg-accent text-white text-[10px] font-bold tracking-[0.12em] uppercase px-[10px] py-[5px] rounded-full">
              {savingsLabel}
            </span>
          )}
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded-full bg-background/90 flex items-center justify-center text-dark/65 hover:text-primary transition-colors"
          aria-label="Wishlist"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6C19 16.5 12 21 12 21Z" />
          </svg>
        </button>
      </div>

      {/* Image area */}
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={{ height: 280, background: "linear-gradient(145deg, #F5E6D3, #FDF6EC)" }}
      >
          {/* Glow */}
          <div className="absolute w-[200px] h-[200px] rounded-full bg-primary/[0.12] blur-[40px]" />
          {hasThumbnail ? (
            <div
              className="relative transition-transform duration-400"
              style={{ transform: hovered ? "translateY(-6px) rotate(-2deg)" : "translateY(0)" }}
            >
              <Thumbnail thumbnail={product.thumbnail} images={product.images} size="full" priority />
            </div>
          ) : (
            <div
              className="relative transition-transform duration-400"
              style={{ transform: hovered ? "translateY(-6px) rotate(-2deg)" : "translateY(0)" }}
            >
              <GbBottle flavor={flavor} size={230} />
            </div>
          )}

          {/* Hover quick-add */}
          <div
            className="absolute left-3.5 right-3.5 bottom-3.5 transition-all duration-250"
            style={{ opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(8px)", pointerEvents: hovered ? "auto" : "none" }}
          >
            <LocalizedClientLink
              href={href}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-dark text-background rounded-full font-sans font-semibold text-[13px]"
            >
              View product
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </LocalizedClientLink>
          </div>
        </div>

      {/* Info */}
      <LocalizedClientLink href={href} className="block px-[22px] pt-5 pb-[22px]">
        {/* Rating row */}
        <div className="flex gap-2 items-center mb-2">
          <Stars count={rating} size={12} />
          {reviews > 0 && (
            <span className="font-sans text-[11px] text-dark/55">{reviews}</span>
          )}
          {lowStock && (
            <span className="ml-auto font-sans text-[10px] font-bold text-[#8B3A1A] tracking-[0.08em] uppercase">Low stock</span>
          )}
        </div>

        <h3 className="font-display text-[22px] font-semibold text-dark tracking-[-0.01em]">
          {product.title}
        </h3>
        <div className="mt-1 text-xs text-dark/60 font-sans">{product.subtitle}</div>

        {/* Price */}
        <div className="flex items-baseline gap-[10px] mt-3.5">
          {priceLabel && (
            <span className="font-sans text-[22px] font-bold text-primary">{priceLabel}</span>
          )}
          {originalPriceLabel && (
            <span className="font-sans text-[13px] text-dark/40 line-through">{originalPriceLabel}</span>
          )}
          {perBottleLabel && (
            <span className="font-sans text-[11px] text-dark/55 ml-auto">{perBottleLabel}</span>
          )}
        </div>

        {/* Heat meter */}
        <div className="flex items-center gap-2 mt-3.5">
          <span className="font-sans text-[10px] tracking-[0.14em] uppercase font-semibold text-dark/50">Heat</span>
          <div className="flex gap-[3px]">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="w-3.5 h-1 rounded-[2px]"
                style={{ background: i <= heat ? "linear-gradient(90deg, #C8893C, #8B3A1A)" : "rgba(44,24,16,0.08)" }}
              />
            ))}
          </div>
        </div>
      </LocalizedClientLink>
    </div>
  )
}
