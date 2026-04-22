"use client"

import { useState, useEffect } from "react"

const MESSAGES = [
  { icon: "truck", text: "Free shipping on orders over ฿500" },
  { icon: "leaf",  text: "Brewed fresh in Bangkok · Ships within 48h" },
  { icon: "gift",  text: "New: Build-your-own 6-pack — mix and match" },
]

function MsgIcon({ type }: { type: string }) {
  if (type === "truck") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="14" height="11" rx="1" /><path d="M15 10h4l3 3v4h-7" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" />
    </svg>
  )
  if (type === "leaf") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 4 13c0-6 5-10 16-10 0 8-4 17-9 17Z" /><path d="M4 20c4-6 7-8 12-10" />
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="1" /><path d="M12 8v13M3 13h18M7.5 8a2.5 2.5 0 1 1 0-5C9 3 12 5 12 8c0-3 3-5 4.5-5a2.5 2.5 0 1 1 0 5" />
    </svg>
  )
}

export default function AnnouncementBar() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(v => (v + 1) % MESSAGES.length), 4200)
    return () => clearInterval(t)
  }, [])

  const msg = MESSAGES[idx]

  return (
    <div className="bg-dark text-background flex items-center justify-center gap-[10px] py-[9px] px-4 text-xs font-medium tracking-[0.08em] overflow-hidden">
      <span className="text-primary flex items-center">
        <MsgIcon type={msg.icon} />
      </span>
      <span className="transition-opacity duration-400">{msg.text}</span>
    </div>
  )
}
