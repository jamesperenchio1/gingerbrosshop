import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * True when we should skip heavy/continuous animation. We only disable for
 * explicit user preference (prefers-reduced-motion); modern phones handle the
 * WebGL hero canvas fine, and the render loop pauses when the hero is off-screen.
 * Safe on the server (guards `window`/`navigator`).
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
}


/**
 * True on devices/connections where decorative, continuously-animating layers
 * (WebGL shader, canvas particles) cost more than they're worth: Save-Data on,
 * a 2G/3G connection, or a low-memory / low-core device. Safe on the server.
 */
export function isLowPowerDevice(): boolean {
  if (typeof navigator === "undefined") return false
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean; effectiveType?: string }
  }
  const conn = nav.connection
  if (conn?.saveData) return true
  if (conn?.effectiveType && /(^|-)(2g|3g)$/.test(conn.effectiveType)) return true
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return true
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) return true
  return false
}
