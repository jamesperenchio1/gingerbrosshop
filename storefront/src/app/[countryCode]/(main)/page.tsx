import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
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

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <div className="py-16 bg-white">
        <div className="content-container text-center mb-12">
          <p className="text-primary font-nunito font-semibold tracking-[0.2em] uppercase text-sm mb-3">
            Our Products
          </p>
          <h2 className="font-display text-3xl small:text-4xl font-bold text-dark">
            Craft Ginger Beverages
          </h2>
        </div>
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
