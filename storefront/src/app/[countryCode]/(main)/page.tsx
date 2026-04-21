import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import ShopSection, {
  ShopProduct,
} from "@modules/home/components/shop-section"
import TasteGuide from "@modules/home/components/taste-guide"
import BundleBuilder from "@modules/home/components/bundle-builder"
import StoryStrip from "@modules/home/components/story-strip"
import SubscriptionBlock from "@modules/home/components/subscription-block"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getProductMeta, inferFlavor } from "@lib/product-metadata"

export const metadata: Metadata = {
  title: "Gingerbros — Thai Craft Ginger Beverages",
  description:
    "Fresh ginger, real fermentation, no syrupy shortcuts. Small-batch ginger beer, ale, and shots brewed in Bangkok.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    return <Hero />
  }

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      fields: "*variants.calculated_price",
      limit: 20,
    },
  })

  // Transform Medusa products → ShopProduct format
  const shopProducts: ShopProduct[] = (products ?? []).map((p) => {
    const meta = getProductMeta(p.handle)
    const variants = (p.variants ?? []) as any[]

    const singleV = variants.find(
      (v) => v.title?.toLowerCase() === "single"
    )
    const sixpackV = variants.find(
      (v) => v.title?.toLowerCase() === "6-pack"
    )

    const currency =
      singleV?.calculated_price?.currency_code ??
      sixpackV?.calculated_price?.currency_code ??
      region.currency_code

    return {
      id: p.id ?? "",
      handle: p.handle ?? "",
      title: p.title ?? "",
      flavor: meta.flavor ?? inferFlavor(p.handle),
      singlePrice: singleV?.calculated_price?.calculated_amount ?? undefined,
      sixpackPrice: sixpackV?.calculated_price?.calculated_amount ?? undefined,
      singleVariantId: singleV?.id ?? undefined,
      sixpackVariantId: sixpackV?.id ?? undefined,
      currency,
      heat: meta.heat,
      rating: meta.rating,
      reviews: meta.reviews,
      tag: meta.tag,
      tagColor: meta.tagColor,
      filterTags: meta.filterTags,
      blurb: meta.blurb,
      lowStock: meta.lowStock,
    }
  })

  const tasteProducts = shopProducts.map((p) => {
    const meta = getProductMeta(p.handle)
    return {
      handle: p.handle,
      title: p.title,
      flavor: p.flavor,
      heat: p.heat,
      blurb: meta.blurb,
      tasteGuideLabel: meta.tasteGuideLabel,
    }
  })

  const bundleProducts = shopProducts.map((p) => ({
    handle: p.handle,
    title: p.title,
    flavor: p.flavor,
    singlePrice: p.singlePrice,
  }))

  return (
    <>
      <Hero />

      {shopProducts.length > 0 && (
        <ShopSection products={shopProducts} countryCode={countryCode} />
      )}

      {tasteProducts.length > 0 && (
        <TasteGuide products={tasteProducts} countryCode={countryCode} />
      )}

      {bundleProducts.length > 0 && (
        <BundleBuilder products={bundleProducts} countryCode={countryCode} />
      )}

      <StoryStrip />

      <SubscriptionBlock />

      {/* Tracking CTA */}
      <section
        style={{
          padding: "80px 0",
          background: "#FDF6EC",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "0 40px",
          }}
        >
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: 44,
              fontWeight: 700,
              color: "#2C1810",
              margin: "0 0 14px",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Already ordered?{" "}
            <span style={{ fontStyle: "italic", color: "#C8893C" }}>
              Track your brew.
            </span>
          </h2>
          <p
            style={{
              fontFamily: "Nunito, sans-serif",
              fontSize: 16,
              color: "rgba(44,24,16,0.7)",
              margin: "0 0 28px",
            }}
          >
            Live timeline from bottle-line to your door. Because
            &quot;it&apos;ll get there&quot; isn&apos;t an update.
          </p>
          <a
            href={`/${countryCode}/account`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 28px",
              background: "transparent",
              color: "#C8893C",
              border: "2px solid #C8893C",
              borderRadius: 9999,
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
              transition: "all 200ms",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = "#C8893C"
              el.style.color = "#fff"
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = "transparent"
              el.style.color = "#C8893C"
            }}
          >
            Track an order
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </section>
    </>
  )
}
