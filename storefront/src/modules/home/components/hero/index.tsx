import Bottle from "@modules/common/components/bottle"
import Stars from "@modules/common/components/stars"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Hero() {
  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      <div
        style={{
          position: "relative",
          minHeight: 660,
          background:
            "linear-gradient(160deg, #FDF6EC 0%, #F5E6D3 60%, #FDF6EC 100%)",
        }}
      >
        {/* decorative blobs */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: -80,
            width: 420,
            height: 420,
            background: "rgba(200,137,60,0.14)",
            borderRadius: "50%",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -60,
            width: 460,
            height: 460,
            background: "rgba(74,124,63,0.10)",
            borderRadius: "50%",
            filter: "blur(80px)",
          }}
        />

        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "72px 40px 120px",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 60,
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Left: copy */}
          <div>
            {/* New product pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 14px 6px 6px",
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(44,24,16,0.08)",
                borderRadius: 9999,
                marginBottom: 22,
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                style={{
                  background: "#4A7C3F",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  padding: "4px 10px",
                  borderRadius: 9999,
                }}
              >
                NEW
              </span>
              <span
                style={{
                  fontFamily: "Nunito, sans-serif",
                  fontSize: 13,
                  color: "rgba(44,24,16,0.75)",
                }}
              >
                Unpasteurized Ginger Beer — now shipping
              </span>
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "rgba(44,24,16,0.5)" }}
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>

            <p
              style={{
                color: "#C8893C",
                fontFamily: "Nunito, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                fontSize: 12,
                margin: "0 0 20px",
              }}
            >
              Handmade in Bangkok
            </p>

            <h1
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "clamp(48px, 5vw, 78px)",
                fontWeight: 700,
                color: "#2C1810",
                lineHeight: 1.02,
                margin: "0 0 24px",
                letterSpacing: "-0.02em",
              }}
            >
              Ginger with
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #C8893C 0%, #8B3A1A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontStyle: "italic",
                }}
              >
                a kick you can feel.
              </span>
            </h1>

            <p
              style={{
                fontFamily: "Nunito, sans-serif",
                fontSize: 18,
                color: "rgba(44,24,16,0.72)",
                maxWidth: 520,
                margin: "0 0 36px",
                lineHeight: 1.6,
              }}
            >
              Fresh ginger, real fermentation, no syrupy shortcuts. The kind of
              drink that makes the supermarket version taste like tap water with
              sugar.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <a
                href="#shop"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "16px 30px",
                  background: "#C8893C",
                  color: "#fff",
                  borderRadius: 9999,
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                  transition: "all 200ms",
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.background =
                    "#B57A2F"
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.background =
                    "#C8893C"
                }}
              >
                Shop the range
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a
                href="#taste-guide"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 20px",
                  background: "transparent",
                  color: "#2C1810",
                  borderRadius: 9999,
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: "none",
                  border: "1px solid rgba(44,24,16,0.2)",
                }}
              >
                Taste guide
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </a>
            </div>

            {/* Trust row */}
            <div
              style={{
                display: "flex",
                gap: 28,
                marginTop: 44,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <Stars value={5} size={14} />
                  <span
                    style={{
                      fontFamily: "Nunito, sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#2C1810",
                    }}
                  >
                    4.9
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(44,24,16,0.55)",
                    marginTop: 4,
                    fontFamily: "Nunito, sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  From verified buyers
                </div>
              </div>
              <div
                style={{ width: 1, background: "rgba(44,24,16,0.12)" }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2C1810",
                  }}
                >
                  48h
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(44,24,16,0.55)",
                    marginTop: 4,
                    fontFamily: "Nunito, sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  bottle-to-doorstep
                </div>
              </div>
              <div
                style={{ width: 1, background: "rgba(44,24,16,0.12)" }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2C1810",
                  }}
                >
                  14-day
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(44,24,16,0.55)",
                    marginTop: 4,
                    fontFamily: "Nunito, sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  natural ferment
                </div>
              </div>
            </div>
          </div>

          {/* Right: hero bottles + press quote */}
          <div style={{ position: "relative", height: 560 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              {/* shadow plate */}
              <div
                style={{
                  position: "absolute",
                  bottom: 40,
                  width: 380,
                  height: 30,
                  background:
                    "radial-gradient(ellipse, rgba(44,24,16,0.25) 0%, transparent 70%)",
                  filter: "blur(6px)",
                }}
              />
              <div
                style={{
                  transform: "translateX(-90px) translateY(-30px) rotate(-6deg)",
                  zIndex: 1,
                }}
              >
                <Bottle flavor="ale" size={380} />
              </div>
              <div
                style={{
                  position: "absolute",
                  zIndex: 3,
                  bottom: 40,
                }}
              >
                <Bottle flavor="beer" size={460} />
              </div>
              <div
                style={{
                  transform:
                    "translateX(90px) translateY(-30px) rotate(6deg)",
                  zIndex: 1,
                }}
              >
                <Bottle flavor="shot" size={380} />
              </div>
            </div>

            {/* Press quote */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: 260,
                zIndex: 5,
                background: "#fff",
                borderRadius: 16,
                padding: "16px 18px",
                boxShadow: "0 12px 28px rgba(44,24,16,0.12)",
                fontFamily: "Nunito, sans-serif",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "#C8893C",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Customer · Anchalee R.
              </div>
              <div
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#2C1810",
                  lineHeight: 1.45,
                }}
              >
                "Supermarket ginger beer will never taste the same."
              </div>
            </div>

            {/* Static badge */}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "#2C1810",
                color: "#FDF6EC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                fontFamily: "Nunito, sans-serif",
                textAlign: "center",
                boxShadow: "0 8px 20px rgba(44,24,16,0.25)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "#C8893C",
                  fontWeight: 700,
                }}
              >
                SINCE
              </div>
              <div
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                2024
              </div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  opacity: 0.7,
                  marginTop: 4,
                }}
              >
                BANGKOK
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling marquee */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 40,
            overflow: "hidden",
            padding: "10px 0",
            borderTop: "1px solid rgba(44,24,16,0.08)",
            borderBottom: "1px solid rgba(44,24,16,0.08)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              whiteSpace: "nowrap",
              animation: "gbMarquee 40s linear infinite",
            }}
          >
            {Array.from({ length: 4 }).map((_, k) => (
              <span
                key={k}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 28,
                  fontFamily: "Playfair Display, serif",
                  fontStyle: "italic",
                  fontSize: 18,
                  color: "rgba(44,24,16,0.55)",
                  marginRight: 28,
                }}
              >
                Fresh Thai ginger{" "}
                <span style={{ color: "#C8893C" }}>✦</span> 14-day natural
                ferment <span style={{ color: "#C8893C" }}>✦</span> No
                flavoring agents{" "}
                <span style={{ color: "#C8893C" }}>✦</span> Glass, not plastic{" "}
                <span style={{ color: "#C8893C" }}>✦</span> Brewed in Bangkok{" "}
                <span style={{ color: "#C8893C" }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{
          display: "block",
          width: "100%",
          height: 70,
          marginTop: -1,
          marginBottom: -1,
        }}
      >
        <path
          d="M0 60C240 120 480 0 720 60C960 120 1200 0 1440 60V120H0V60Z"
          fill="#ffffff"
        />
      </svg>
    </div>
  )
}
