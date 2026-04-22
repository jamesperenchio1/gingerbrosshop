export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Next.js/Turbopack defines a partial window global on the server that
    // includes localStorage but without standard Storage methods. The Medusa JS
    // SDK calls localStorage.getItem() during module init, which throws.
    // Patch it here before any module that imports the SDK is evaluated.
    const g = globalThis as any
    if (typeof g.localStorage === "undefined" || typeof g.localStorage?.getItem !== "function") {
      const noop = () => null
      g.localStorage = {
        getItem: noop,
        setItem: noop,
        removeItem: noop,
        clear: noop,
        key: noop,
        length: 0,
      }
    }
  }
}
