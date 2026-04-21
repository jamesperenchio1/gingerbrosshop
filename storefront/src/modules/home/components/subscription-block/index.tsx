import Bottle from "@modules/common/components/bottle"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function SubscriptionBlock() {
  return (
    <section
      style={{
        padding: "96px 0",
        background: "#2C1810",
        color: "#FDF6EC",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* blobs */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 400,
          height: 400,
          background: "rgba(200,137,60,0.15)",
          borderRadius: "50%",
          filter: "blur(100px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 500,
          height: 500,
          background: "rgba(74,124,63,0.12)",
          borderRadius: "50%",
          filter: "blur(100px)",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 40px",
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          alignItems: "center",
        }}
      >
        {/* Left: copy */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "rgba(200,137,60,0.18)",
              color: "#C8893C",
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: 22,
              fontFamily: "Nunito, sans-serif",
            }}
          >
            🔄 Save 15% Forever
          </div>
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(36px, 4vw, 58px)",
              fontWeight: 700,
              margin: "0 0 20px",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#FDF6EC",
            }}
          >
            Never run out of{" "}
            <span style={{ fontStyle: "italic", color: "#E8B86A" }}>
              the good stuff.
            </span>
          </h2>
          <p
            style={{
              fontFamily: "Nunito, sans-serif",
              fontSize: 17,
              color: "rgba(253,246,236,0.75)",
              lineHeight: 1.6,
              margin: "0 0 32px",
              maxWidth: 480,
            }}
          >
            Subscribe for a monthly 6-pack. Change flavors, skip a month, or
            cancel from your account — no phone calls, no nonsense.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, auto)",
              gap: 28,
              marginBottom: 36,
              justifyContent: "start",
            }}
          >
            {[
              { icon: "✓", label: "Save 15%" },
              { icon: "🔄", label: "Skip or cancel anytime" },
              { icon: "🚚", label: "Free shipping always" },
            ].map((b) => (
              <div
                key={b.label}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  fontFamily: "Nunito, sans-serif",
                  fontSize: 13,
                  color: "#FDF6EC",
                }}
              >
                <span style={{ color: "#C8893C" }}>{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>
          <LocalizedClientLink
            href="/store"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 30px",
              background: "#C8893C",
              color: "#fff",
              border: 0,
              borderRadius: 9999,
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
              transition: "all 200ms",
            }}
          >
            Start a subscription
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
          </LocalizedClientLink>
        </div>

        {/* Right: plan card */}
        <div
          style={{
            background:
              "linear-gradient(145deg, rgba(253,246,236,0.06), rgba(253,246,236,0.02))",
            border: "1px solid rgba(253,246,236,0.12)",
            borderRadius: 20,
            padding: 28,
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 22,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "#C8893C",
                  fontWeight: 700,
                  marginBottom: 6,
                  fontFamily: "Nunito, sans-serif",
                }}
              >
                The Crate
              </div>
              <div
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#FDF6EC",
                }}
              >
                Monthly 6-pack
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(253,246,236,0.5)",
                  textDecoration: "line-through",
                  fontFamily: "Nunito, sans-serif",
                }}
              >
                ฿600
              </div>
              <div
                style={{
                  fontFamily: "Nunito, sans-serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#C8893C",
                  lineHeight: 1,
                }}
              >
                ฿510
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(253,246,236,0.55)",
                  marginTop: 2,
                  fontFamily: "Nunito, sans-serif",
                }}
              >
                /month
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            <Bottle flavor="beer" size={90} />
            <Bottle flavor="ale" size={90} />
            <Bottle flavor="shot" size={90} />
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(253,246,236,0.1)",
              paddingTop: 16,
              fontSize: 13,
              color: "rgba(253,246,236,0.7)",
              fontFamily: "Nunito, sans-serif",
              lineHeight: 1.6,
            }}
          >
            Your first box ships within 2 days. Then every 30 days — or
            whenever you tell us to.
          </div>
        </div>
      </div>
    </section>
  )
}
