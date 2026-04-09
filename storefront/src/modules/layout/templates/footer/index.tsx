import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="bg-dark text-white/80 w-full">
      {/* Wave top */}
      <div className="relative -mt-1">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 40C360 80 720 0 1080 40C1260 60 1380 50 1440 40V80H0V40Z"
            fill="#2C1810"
          />
        </svg>
      </div>

      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-8 xsmall:flex-row items-start justify-between py-16">
          <div className="max-w-xs">
            <LocalizedClientLink
              href="/"
              className="inline-block mb-4"
            >
              <span className="font-display text-3xl font-bold text-white tracking-tight">
                Ginger<span className="text-primary">bros</span>
              </span>
            </LocalizedClientLink>
            <p className="font-nunito text-white/60 text-sm leading-relaxed">
              Handcrafted ginger beverages from Thailand. Bold flavors, natural ingredients, brewed with love.
            </p>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="font-nunito font-semibold text-white text-sm tracking-wide uppercase">
                  Categories
                </span>
                <ul
                  className="grid grid-cols-1 gap-2 mt-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li
                        className="flex flex-col gap-2 text-white/60 font-nunito text-sm"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-primary transition-colors duration-200",
                            children && "font-medium"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-primary transition-colors duration-200"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="font-nunito font-semibold text-white text-sm tracking-wide uppercase">
                  Collections
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-white/60 font-nunito text-sm mt-2",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-primary transition-colors duration-200"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="font-nunito font-semibold text-white text-sm tracking-wide uppercase">
                Company
              </span>
              <ul className="grid grid-cols-1 gap-y-2 text-white/60 font-nunito text-sm mt-2">
                <li>
                  <span className="hover:text-primary transition-colors duration-200 cursor-pointer">
                    About Us
                  </span>
                </li>
                <li>
                  <span className="hover:text-primary transition-colors duration-200 cursor-pointer">
                    Contact
                  </span>
                </li>
                <li>
                  <span className="hover:text-primary transition-colors duration-200 cursor-pointer">
                    Shipping Info
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full py-8 justify-between border-t border-white/10">
          <Text className="font-nunito text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Gingerbros. All rights reserved.
          </Text>
          <Text className="font-nunito text-white/40 text-xs">
            Brewed in Thailand
          </Text>
        </div>
      </div>
    </footer>
  )
}
