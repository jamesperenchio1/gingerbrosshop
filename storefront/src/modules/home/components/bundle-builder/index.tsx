"use client"

import { useState } from "react"
import Bottle, { BottleFlavor } from "@modules/common/components/bottle"

type BundleProduct = {
  handle: string
  title: string
  flavor: BottleFlavor
  singlePrice?: number
}

const MAX = 6

export default function BundleBuilder({
  products,
  countryCode,
}: {
  products: BundleProduct[]
  countryCode: string
}) {
  const [picks, setPicks] = useState<BundleProduct[]>([])

  const add = (p: BundleProduct) => {
    if (picks.length < MAX) setPicks([...picks, p])
  }
  const removeAt = (i: number) => setPicks(picks.filter((_, idx) => idx !== i))

  const total = picks.reduce((a, p) => a + (p.singlePrice || 0), 0)
  const discounted = Math.round(total * 0.83)
  const saved = total - discounted
  const progress = (picks.length / MAX) * 100

  const formatPrice = (amount: number) => `฿${Math.round(amount / 100)}`

  return (
    <section
      style={{
        padding: "96px 0",
        background: "linear-gradient(180deg, #FDF6EC 0%, #F5E6D3 100%)",
        position: "relative",
        overflow: "hidden",
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
            display: "grid",
            gridTemplateColumns: "1fr min(440px, 100%)",
            gap: 56,
            alignItems: "flex-start",
          }}
        >
          {/* Left: pick your bottles */}
          <div>
            <p
              style={{
                color: "#4A7C3F",
                fontFamily: "Nunito, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                fontSize: 12,
                margin: "0 0 12px",
              }}
            >
              Mix &amp; Match · Save 17%
            </p>
            <h2
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "clamp(36px, 4vw, 56px)",
                fontWeight: 700,
                color: "#2C1810",
                margin: "0 0 16px",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              Build your{" "}
              <span style={{ fontStyle: "italic", color: "#C8893C" }}>
                own 6-pack.
              </span>
            </h2>
            <p
              style={{
                fontFamily: "Nunito, sans-serif",
                fontSize: 17,
                color: "rgba(44,24,16,0.7)",
                margin: "0 0 36px",
                maxWidth: 520,
                lineHeight: 1.6,
              }}
            >
              Can&apos;t decide? Pick any six bottles. Any flavors, any ratio. We&apos;ll
              pack it up and ship it within 48 hours.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 14,
              }}
            >
              {products.map((p) => (
                <button
                  key={p.handle}
                  onClick={() => add(p)}
                  disabled={picks.length >= MAX}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    background: "#fff",
                    border: "1px solid rgba(44,24,16,0.08)",
                    borderRadius: 14,
                    cursor: picks.length >= MAX ? "not-allowed" : "pointer",
                    opacity: picks.length >= MAX ? 0.5 : 1,
                    textAlign: "left",
                    fontFamily: "Nunito, sans-serif",
                    transition: "all 200ms",
                  }}
                  onMouseEnter={(e) => {
                    if (picks.length < MAX) {
                      e.currentTarget.style.transform = "translateY(-2px)"
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(44,24,16,0.08)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 56,
                      background: "linear-gradient(145deg,#F5E6D3,#FDF6EC)",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Bottle flavor={p.flavor} size={48} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "Playfair Display, serif",
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#2C1810",
                      }}
                    >
                      {p.title}
                    </div>
                    {p.singlePrice && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(44,24,16,0.55)",
                          marginTop: 2,
                        }}
                      >
                        {formatPrice(p.singlePrice)} each
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#2C1810",
                      color: "#FDF6EC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: summary */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 18px 40px rgba(44,24,16,0.08)",
              position: "sticky",
              top: 100,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#2C1810",
                }}
              >
                Your box
              </div>
              <div
                style={{
                  fontFamily: "Nunito, sans-serif",
                  fontSize: 13,
                  color: "rgba(44,24,16,0.6)",
                }}
              >
                {picks.length} of {MAX}
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: 8,
                background: "#F5E6D3",
                borderRadius: 9999,
                overflow: "hidden",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #C8893C, #4A7C3F)",
                  transition: "width 320ms cubic-bezier(0.5,0,0.5,1)",
                }}
              />
            </div>

            {/* Slots */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: 6,
                marginBottom: 20,
              }}
            >
              {Array.from({ length: MAX }).map((_, i) => {
                const p = picks[i]
                return (
                  <div
                    key={i}
                    onClick={() => p && removeAt(i)}
                    style={{
                      height: 70,
                      borderRadius: 10,
                      border: p
                        ? "none"
                        : "1px dashed rgba(44,24,16,0.2)",
                      background: p
                        ? "linear-gradient(145deg,#F5E6D3,#FDF6EC)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: p ? "pointer" : "default",
                      position: "relative",
                    }}
                    title={p ? `Remove ${p.title}` : undefined}
                  >
                    {p && <Bottle flavor={p.flavor} size={52} />}
                  </div>
                )
              })}
            </div>

            {/* Price summary */}
            <div
              style={{
                borderTop: "1px solid rgba(44,24,16,0.08)",
                paddingTop: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "rgba(44,24,16,0.65)",
                  fontFamily: "Nunito, sans-serif",
                  marginBottom: 6,
                }}
              >
                <span>Singles total</span>
                <span
                  style={{
                    textDecoration: picks.length ? "line-through" : "none",
                  }}
                >
                  {formatPrice(total)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#4A7C3F",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 600,
                  marginBottom: 14,
                }}
              >
                <span>6-pack discount</span>
                <span>− {formatPrice(saved)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2C1810",
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontFamily: "Nunito, sans-serif",
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#C8893C",
                  }}
                >
                  {picks.length ? formatPrice(discounted) : "฿—"}
                </span>
              </div>
              <a
                href={
                  picks.length === MAX
                    ? `/${countryCode}/store`
                    : undefined
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  padding: "14px 20px",
                  background: picks.length === MAX ? "#C8893C" : "#C8893C",
                  color: "#fff",
                  border: 0,
                  borderRadius: 9999,
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: picks.length === MAX ? "pointer" : "not-allowed",
                  opacity: picks.length === MAX ? 1 : 0.45,
                  textDecoration: "none",
                }}
              >
                {picks.length === MAX ? (
                  <>
                    Add to cart
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                ) : (
                  `Pick ${MAX - picks.length} more`
                )}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
