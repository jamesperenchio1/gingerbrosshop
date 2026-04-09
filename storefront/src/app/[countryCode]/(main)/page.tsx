import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import ProductSectionCard from "@modules/home/components/product-section-card"
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
    return (
      <>
        <Hero />
      </>
    )
  }

  // Filter to products that have the relevant variant
  const productsWithSingle = products.filter((p) =>
    (p.variants || []).some(
      (v: any) => v.title?.toLowerCase() === "single"
    )
  )

  const productsWithSixPack = products.filter((p) =>
    (p.variants || []).some(
      (v: any) => v.title?.toLowerCase() === "6-pack"
    )
  )

  return (
    <>
      <Hero />

      {/* Singles Section */}
      {productsWithSingle.length > 0 && (
        <section className="py-16 bg-white">
          <div className="content-container">
            <div className="text-center mb-12">
              <p className="text-primary font-nunito font-semibold tracking-[0.2em] uppercase text-sm mb-3">
                Try Our Flavors
              </p>
              <h2 className="font-display text-3xl small:text-4xl font-bold text-dark">
                Shop Singles
              </h2>
              <p className="font-nunito text-dark/60 mt-3 max-w-lg mx-auto">
                Perfect for trying something new. Pick your favorite ginger brew.
              </p>
            </div>
            <ul className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-6 small:gap-8">
              {productsWithSingle.map((product) => (
                <li key={product.id}>
                  <ProductSectionCard
                    product={product}
                    variantType="Single"
                    region={region}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 6-Packs Section */}
      {productsWithSixPack.length > 0 && (
        <section className="py-16 bg-background">
          <div className="content-container">
            <div className="text-center mb-12">
              <p className="text-accent font-nunito font-semibold tracking-[0.2em] uppercase text-sm mb-3">
                Better Value
              </p>
              <h2 className="font-display text-3xl small:text-4xl font-bold text-dark">
                Save More with 6-Packs
              </h2>
              <p className="font-nunito text-dark/60 mt-3 max-w-lg mx-auto">
                Stock up and save. The perfect way to keep your favorites on hand.
              </p>
            </div>
            <ul className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-6 small:gap-8">
              {productsWithSixPack.map((product) => (
                <li key={product.id}>
                  <ProductSectionCard
                    product={product}
                    variantType="6-Pack"
                    region={region}
                    showSavings
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
