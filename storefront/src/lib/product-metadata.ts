export type ProductFlavor = "beer" | "shot" | "ale" | "unpast"

export type ProductMeta = {
  flavor: ProductFlavor
  heat: number
  rating: number
  reviews: number
  tag: string
  tagColor?: string
  filterTags: string[]
  blurb: string
  lowStock?: boolean
  tasteGuideLabel: string
}

const METADATA: Record<string, ProductMeta> = {
  "ginger-beer": {
    flavor: "beer",
    heat: 4,
    rating: 5,
    reviews: 284,
    tag: "Bestseller",
    filterTags: ["fiery", "mixer"],
    blurb:
      "Our flagship. Fourteen days of natural ferment, a proper kick, and a fizz that actually bubbles. The ginger beer people send us unsolicited DMs about.",
    tasteGuideLabel: "For cocktail nights",
  },
  "ginger-shot": {
    flavor: "shot",
    heat: 5,
    rating: 5,
    reviews: 312,
    tag: "Morning Ritual",
    filterTags: ["fiery", "shot"],
    blurb:
      "A concentrated hit of raw ginger, cold-pressed with lemon and a pinch of cayenne. Morning fuel in 60ml.",
    tasteGuideLabel: "For your morning kick",
  },
  "ginger-ale": {
    flavor: "ale",
    heat: 2,
    rating: 5,
    reviews: 198,
    tag: "Staff Pick",
    filterTags: ["mild", "mixer"],
    blurb:
      "Crisp, light, refreshing. The easy-drinking cousin in the family — perfect with dinner or a splash of rum.",
    tasteGuideLabel: "For easy sipping",
  },
  "unpasteurized-ginger-beer": {
    flavor: "unpast",
    heat: 5,
    rating: 5,
    reviews: 42,
    tag: "NEW",
    tagColor: "#4A7C3F",
    filterTags: ["new", "fiery"],
    lowStock: true,
    blurb:
      "Live cultures, wild ferment, full depth. For the drinker who wants their ginger beer to taste like a proper brewery.",
    tasteGuideLabel: "For the purists",
  },
}

const DEFAULT_META: ProductMeta = {
  flavor: "beer",
  heat: 3,
  rating: 5,
  reviews: 100,
  tag: "Popular",
  filterTags: ["all"],
  blurb: "Handcrafted ginger beverage from Bangkok.",
  tasteGuideLabel: "A great pour",
}

export function getProductMeta(handle: string | null | undefined): ProductMeta {
  if (!handle) return DEFAULT_META
  return METADATA[handle] ?? DEFAULT_META
}

export function inferFlavor(handle: string | null | undefined): ProductFlavor {
  if (!handle) return "beer"
  if (handle.includes("shot")) return "shot"
  if (handle.includes("ale") && !handle.includes("pale")) return "ale"
  if (handle.includes("unpast") || handle.includes("raw")) return "unpast"
  return "beer"
}
