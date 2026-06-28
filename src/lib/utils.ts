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

