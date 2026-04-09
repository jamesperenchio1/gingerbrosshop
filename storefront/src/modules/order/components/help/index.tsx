import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6 bg-gray-50 rounded-xl p-5">
      <Heading className="text-base-semi mb-2">Need help?</Heading>
      <div className="text-base-regular text-ui-fg-subtle">
        <p className="mb-2">
          If you have any questions about your order, we&apos;re here to help.
        </p>
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink href="/customer-service" className="text-[#C8702A] hover:underline">
              Customer Service & FAQ
            </LocalizedClientLink>
          </li>
          <li>
            <span className="text-ui-fg-subtle">
              Email us at{" "}
              <a href="mailto:support@gingerbrosshop.com" className="text-[#C8702A] hover:underline">
                support@gingerbrosshop.com
              </a>
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
