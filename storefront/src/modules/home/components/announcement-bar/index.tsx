"use client"

import { useState, useEffect } from "react"

const MESSAGES = [
  "🚚  Free shipping on orders over ฿500",
  "🌿  Brewed fresh in Bangkok · Ships within 48h",
  "🎁  New: Build-your-own 6-pack — mix and match",
]

export default function AnnouncementBar() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % MESSAGES.length), 4200)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      style={{
        background: "#2C1810",
        color: "#FDF6EC",
        fontFamily: "Nunito, sans-serif",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.08em",
        textAlign: "center",
        padding: "9px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <span style={{ transition: "opacity 400ms" }}>{MESSAGES[i]}</span>
    </div>
  )
}
