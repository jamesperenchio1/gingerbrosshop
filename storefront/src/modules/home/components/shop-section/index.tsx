"use client"

import { useState } from "react"
import Link from "next/link"
import Bottle, { BottleFlavor } from "@modules/common/components/bottle"
import Stars from "@modules/common/components/stars"

export type ShopProduct = {
  id: string
  handle: string
  title: string
  subtitle?: string
  flavor: BottleFlavor
  singlePrice?: number
  sixpackPrice?: number
  singleVariantId?: string
  sixpackVariantId?: string
  currency: string
  heat: number
  rating: number
  reviews: number
  tag?: string
  tagColor?: string
  filterTags: string[]
  blurb?: string
  lowStock?: boolean
}

const FILTERS = [
  { id: "all", label: "All brews" },
  { id: "fiery", label: "🔥 Fiery" },
  { id: "mild", label: "Mild & easy" },
  { id: "mixer", label: "For cocktails" },
  { id: "shot", label: "Morning shot" },
  { id: "new", label: "New" },
]

function HeatMeter({ value }: { value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: "rgba(44,24,16,0.5)",
          fontFamily: "Nunito, sans-serif",
        }}
      >
        Heat
      </span>
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            style={{
              width: 14,
              height: 4,
              borderRadius: 2,
              background:
                i <= value
                  ? "linear-gradient(90deg, #C8893C, #8B3A1A)"
                  : "rgba(44,24,16,0.08)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ProductCard({
  product,
  variant,
  countryCode,
}: {
  product: ShopProduct
  variant: "Single" | "6-Pack"
  countryCode: string
}) {
  const [hovered, setHovered] = useState(false)
  const price = variant === "6-Pack" ? product.sixpackPrice : product.singlePrice
  const origPrice = variant === "6-Pack" && product.singlePrice ? product.singlePrice * 6 : null
  const perBottle = variant === "6-Pack" && product.sixpackPrice ? Math.round(product.sixpackPrice / 6) : null
  const savings = origPrice && product.sixpackPrice ? origPrice - product.sixpackPrice : 0

  const variantId = variant === "6-Pack" ? product.sixpackVariantId : product.singleVariantId
  const href = `/${countryCode}/products/${product.handle}${variantId ? `?v_id=${variantId}` : ""}`

  const formatPrice = (amount: number) =>
    `฿${Math.round(amount / 100)}`

  return (
    <Link
      href={href}
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: hovered
            ? "0 18px 40px -10px rgba(44,24,16,0.16)"
            : "0 1px 3px rgba(44,24,16,0.06)",
          transition: "box-shadow 300ms, transform 300ms",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* badges */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: 14,
            display: "flex",
            justifyContent: "space-between",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {product.tag && (
              <span
                style={{
                  background: product.tagColor || "#2C1810",
                  color: "#FDF6EC",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "5px 11px",
                  borderRadius: 6,
                  lineHeight: 1.2,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {product.tag}
              </span>
            )}
            {savings > 0 && (
              <span
                style={{
                  background: "#4A7C3F",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "5px 10px",
                  borderRadius: 9999,
                }}
              >
                Save {formatPrice(savings)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => e.preventDefault()}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: 0,
              background: "rgba(253,246,236,0.9)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(44,24,16,0.65)",
            }}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6C19 16.5 12 21 12 21Z" />
            </svg>
          </button>
        </div>

        {/* image */}
        <div
          style={{
            height: 280,
            background: "linear-gradient(145deg, #F5E6D3, #FDF6EC)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              background: "rgba(200,137,60,0.12)",
              borderRadius: "50%",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "relative",
              transform: hovered ? "translateY(-6px) rotate(-2deg)" : "translateY(0)",
              transition: "transform 400ms",
            }}
          >
            <Bottle flavor={product.flavor} size={230} />
          </div>
        </div>

        {/* info */}
        <div style={{ padding: "20px 22px 22px" }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Stars value={product.rating} size={12} />
            <span
              style={{
                fontSize: 11,
                fontFamily: "Nunito, sans-serif",
                color: "rgba(44,24,16,0.55)",
              }}
            >
              {product.reviews}
            </span>
            {product.lowStock && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#8B3A1A",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Low stock
              </span>
            )}
          </div>
          <h3
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: 22,
              fontWeight: 600,
              color: "#2C1810",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {product.title}
          </h3>
          {product.subtitle && (
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "rgba(44,24,16,0.6)",
                fontFamily: "Nunito, sans-serif",
              }}
            >
              {product.subtitle}
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginTop: 14,
            }}
          >
            {price != null ? (
              <>
                <span
                  style={{
                    fontFamily: "Nunito, sans-serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#C8893C",
                  }}
                >
                  {formatPrice(price)}
                </span>
                {origPrice && (
                  <span
                    style={{
                      fontSize: 13,
                      color: "rgba(44,24,16,0.4)",
                      textDecoration: "line-through",
                    }}
                  >
                    {formatPrice(origPrice)}
                  </span>
                )}
                {perBottle && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(44,24,16,0.55)",
                      marginLeft: "auto",
                      fontFamily: "Nunito, sans-serif",
                    }}
                  >
                    {formatPrice(perBottle)}/bottle
                  </span>
                )}
              </>
            ) : (
              <span
                style={{
                  fontFamily: "Nunito, sans-serif",
                  fontSize: 14,
                  color: "rgba(44,24,16,0.5)",
                }}
              >
                Not available
              </span>
            )}
          </div>
          <HeatMeter value={product.heat} />
        </div>
      </div>
    </Link>
  )
}

export default function ShopSection({
  products,
  countryCode,
}: {
  products: ShopProduct[]
  countryCode: string
}) {
  const [size, setSize] = useState<"Single" | "6-Pack">("Single")
  const [filter, setFilter] = useState("all")

  const filtered =
    filter === "all"
      ? products
      : products.filter((p) => p.filterTags?.includes(filter))

  const visibleProducts = filtered.filter((p) =>
    size === "6-Pack" ? p.sixpackPrice != null : p.singlePrice != null
  )

  return (
    <section
      id="shop"
      style={{
        padding: "96px 0 80px",
        background: "#fff",
        position: "relative",
        scrollMarginTop: 80,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 40px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 36,
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div>
            <p
              style={{
                color: "#C8893C",
                fontFamily: "Nunito, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                fontSize: 12,
                margin: "0 0 12px",
              }}
            >
              Our Range
            </p>
            <h2
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: 48,
                fontWeight: 700,
                color: "#2C1810",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Pick your pour.
            </h2>
            <p
              style={{
                fontFamily: "Nunito, sans-serif",
                color: "rgba(44,24,16,0.65)",
                fontSize: 16,
                marginTop: 10,
                maxWidth: 480,
              }}
            >
              Four brews, one obsessive recipe process. Shot, ale, beer, and
              our new unpasteurized beer for the adventurers.
            </p>
          </div>

          {/* Size toggle */}
          <div
            style={{
              display: "inline-flex",
              padding: 4,
              background: "#FDF6EC",
              borderRadius: 9999,
              border: "1px solid rgba(44,24,16,0.08)",
            }}
          >
            {(["Single", "6-Pack"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                style={{
                  padding: "9px 20px",
                  border: 0,
                  borderRadius: 9999,
                  cursor: "pointer",
                  background: size === s ? "#2C1810" : "transparent",
                  color: size === s ? "#FDF6EC" : "rgba(44,24,16,0.7)",
                  fontFamily: "Nunito, sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 200ms",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {s}
                {s === "6-Pack" && (
                  <span
                    style={{
                      background: "#4A7C3F",
                      color: "#fff",
                      padding: "2px 7px",
                      borderRadius: 9999,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    SAVE
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter chips */}
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: "9px 16px",
                border:
                  filter === f.id
                    ? "1px solid #2C1810"
                    : "1px solid rgba(44,24,16,0.12)",
                background: filter === f.id ? "#2C1810" : "#fff",
                color:
                  filter === f.id ? "#FDF6EC" : "rgba(44,24,16,0.75)",
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "Nunito, sans-serif",
                cursor: "pointer",
                transition: "all 200ms",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {visibleProducts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 22,
            }}
          >
            {visibleProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                variant={size}
                countryCode={countryCode}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              fontFamily: "Nunito, sans-serif",
              color: "rgba(44,24,16,0.5)",
            }}
          >
            No brews match that filter.{" "}
            <button
              onClick={() => setFilter("all")}
              style={{
                background: "none",
                border: 0,
                color: "#C8893C",
                cursor: "pointer",
                textDecoration: "underline",
                fontFamily: "inherit",
                fontSize: "inherit",
              }}
            >
              Show all
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
