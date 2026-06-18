import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * True when we should skip heavy/continuous animation: the user asked for
 * reduced motion, or the device looks low-powered (few CPU cores / little RAM).
 * Used to disable the WebGL noise + bubble canvases that stutter on weak GPUs.
 * Safe on the server (guards `window`/`navigator`).
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return true
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  return cores <= 4 || memory <= 4
}

