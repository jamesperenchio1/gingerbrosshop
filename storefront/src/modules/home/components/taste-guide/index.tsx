import Bottle, { BottleFlavor } from "@modules/common/components/bottle"
import Link from "next/link"

type GuideProduct = {
  handle: string
  title: string
  flavor: BottleFlavor
  heat: number
  blurb: string
  tasteGuideLabel: string
}

export default function TasteGuide({
  products,
  countryCode,
}: {
  products: GuideProduct[]
  countryCode: string
}) {
  if (!products.length) return null

  return (
    <section
      id="taste-guide"
      style={{
        padding: "96px 0",
        background: "#fff",
        position: "relative",
        scrollMarginTop: 80,
      }}
    >
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
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
            Taste Guide
          </p>
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: 52,
              fontWeight: 700,
              color: "#2C1810",
              margin: "0 0 14px",
              letterSpacing: "-0.02em",
            }}
          >
            Not sure where to{" "}
            <span style={{ fontStyle: "italic", color: "#C8893C" }}>
              start?
            </span>
          </h2>
          <p
            style={{
              fontFamily: "Nunito, sans-serif",
              fontSize: 16,
              color: "rgba(44,24,16,0.65)",
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            Four brews, four moods. Here&apos;s what each one is for.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          {products.map((p) => (
            <Link
              key={p.handle}
              href={`/${countryCode}/products/${p.handle}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "#FDF6EC",
                  border: "1px solid rgba(44,24,16,0.06)",
                  borderRadius: 18,
                  padding: 22,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "Nunito, sans-serif",
                  transition: "all 200ms",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = "translateY(-4px)"
                  el.style.boxShadow = "0 14px 32px rgba(44,24,16,0.08)"
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = "translateY(0)"
                  el.style.boxShadow = "none"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Bottle flavor={p.flavor} size={120} />
                </div>
                <div
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2C1810",
                    marginBottom: 4,
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#C8893C",
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  {p.tasteGuideLabel}
                </div>
                <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 14,
                        height: 4,
                        borderRadius: 2,
                        background:
                          i <= p.heat
                            ? "linear-gradient(90deg, #C8893C, #8B3A1A)"
                            : "rgba(44,24,16,0.08)",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(44,24,16,0.7)",
                    lineHeight: 1.55,
                  }}
                >
                  {p.blurb.split(".")[0] + "."}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
