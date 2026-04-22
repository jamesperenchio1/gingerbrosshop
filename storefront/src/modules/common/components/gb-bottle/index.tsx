type Flavor = "beer" | "shot" | "ale" | "unpast"

const PALETTES: Record<Flavor, { body: string; cap: string; label: string; accent: string; name: string }> = {
  shot:   { body: "#8B3A1A", cap: "#2C1810", label: "#FDF6EC", accent: "#C8893C", name: "SHOT" },
  beer:   { body: "#C8893C", cap: "#2C1810", label: "#FDF6EC", accent: "#8B3A1A", name: "BEER" },
  ale:    { body: "#E8B86A", cap: "#2C1810", label: "#FDF6EC", accent: "#4A7C3F", name: "ALE" },
  unpast: { body: "#9C6B2E", cap: "#1a0f08", label: "#FDF6EC", accent: "#4A7C3F", name: "UNPAST." },
}

export function detectFlavor(title: string = "", handle: string = ""): Flavor {
  const s = (title + " " + handle).toLowerCase()
  if (s.includes("unpast")) return "unpast"
  if (s.includes("shot")) return "shot"
  if (s.includes("ale")) return "ale"
  if (s.includes("beer")) return "beer"
  return "beer"
}

export default function GbBottle({ flavor = "beer", size = 160 }: { flavor?: Flavor; size?: number }) {
  const p = PALETTES[flavor] ?? PALETTES.beer
  const w = size * 0.42
  const h = size
  const id = `gb-${flavor}-${size}`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor={p.body} stopOpacity="0.85" />
          <stop offset="0.5" stopColor={p.body} />
          <stop offset="1" stopColor={p.body} stopOpacity="0.75" />
        </linearGradient>
      </defs>
      {/* Cap */}
      <rect x={w * 0.32} y={0} width={w * 0.36} height={h * 0.08} fill={p.cap} rx="2" />
      {/* Neck */}
      <rect x={w * 0.38} y={h * 0.08} width={w * 0.24} height={h * 0.1} fill={`url(#${id})`} />
      {/* Body */}
      <path
        d={`M ${w * 0.1} ${h * 0.22} Q ${w * 0.08} ${h * 0.3} ${w * 0.08} ${h * 0.4} L ${w * 0.08} ${h * 0.95} Q ${w * 0.08} ${h} ${w * 0.18} ${h} L ${w * 0.82} ${h} Q ${w * 0.92} ${h} ${w * 0.92} ${h * 0.95} L ${w * 0.92} ${h * 0.4} Q ${w * 0.92} ${h * 0.3} ${w * 0.9} ${h * 0.22} Z`}
        fill={`url(#${id})`}
      />
      {/* Label */}
      <rect x={w * 0.14} y={h * 0.42} width={w * 0.72} height={h * 0.38} fill={p.label} rx="2" />
      <text x={w / 2} y={h * 0.56} textAnchor="middle" fontFamily="Playfair Display, serif" fontWeight="700" fontSize={w * 0.16} fill="#2C1810">GB</text>
      <line x1={w * 0.22} y1={h * 0.63} x2={w * 0.78} y2={h * 0.63} stroke={p.accent} strokeWidth="1" />
      <text x={w / 2} y={h * 0.73} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="700" fontSize={w * 0.08} fill="#2C1810" letterSpacing="1.5">
        {p.name}
      </text>
      {/* Highlight */}
      <path
        d={`M ${w * 0.14} ${h * 0.24} L ${w * 0.18} ${h * 0.22} L ${w * 0.18} ${h * 0.95} L ${w * 0.14} ${h * 0.95} Z`}
        fill="rgba(255,255,255,0.25)"
      />
    </svg>
  )
}
