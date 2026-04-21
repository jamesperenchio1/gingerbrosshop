import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import GbShopSection from "@modules/home/components/gb-shop-section"
import GbTasteGuide from "@modules/home/components/gb-taste-guide"
import GbBundleBuilder from "@modules/home/components/gb-bundle-builder"
import GbStoryStrip from "@modules/home/components/gb-story-strip"
import GbSubscription from "@modules/home/components/gb-subscription"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Gingerbros - Thai Craft Ginger Beverages",
  description:
    "Handcrafted ginger beverages from Thailand. Bold flavors, natural ingredients, brewed with love.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      fields: "*variants.calculated_price",
      limit: 12,
    },
  })

  if (!products || products.length === 0) {
    return <Hero />
  }

  // Products that have a Single variant (for bundle builder)
  const productsWithSingle = products.filter((p) =>
    (p.variants || []).some((v: any) => v.title?.toLowerCase() === "single")
  )

  return (
    <>
      <Hero />
      <GbShopSection products={products} region={region} />
      <GbTasteGuide products={products} countryCode={countryCode} />
      {productsWithSingle.length > 0 && (
        <GbBundleBuilder products={productsWithSingle} region={region} countryCode={countryCode} />
      )}
      <GbStoryStrip />
      <GbSubscription />
    </>
  )
}
