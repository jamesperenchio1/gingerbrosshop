import { Metadata } from "next"
import { Heading, Text } from "@medusajs/ui"

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Gingerbros terms and conditions for using our website and purchasing our products.",
}

export default function TermsOfUsePage() {
  return (
    <div className="content-container py-12 max-w-3xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
      <Heading level="h1" className="text-3xl font-display font-bold text-dark mb-2">
        Terms of Use
      </Heading>
      <Text className="text-ui-fg-muted mb-8">Last updated: April 2026</Text>

      <div className="flex flex-col gap-y-10 text-ui-fg-subtle leading-relaxed">
        <section>
          <Heading level="h2" className="text-lg font-semibold text-dark mb-3 pb-2 border-b border-gray-100">
            1. General
          </Heading>
          <Text>
            These terms govern your use of the Gingerbros website (gingerbrosshop.com)
            and any purchases made through it. By using our website or placing an order,
            you agree to these terms.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-lg font-semibold text-dark mb-3 pb-2 border-b border-gray-100">
            2. Products & Pricing
          </Heading>
          <Text>
            All product descriptions and images are provided in good faith. Prices are
            displayed in Thai Baht (THB) and include applicable taxes unless stated
            otherwise. We reserve the right to update prices at any time. Any price
            changes will not affect orders that have already been confirmed.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-lg font-semibold text-dark mb-3 pb-2 border-b border-gray-100">
            3. Orders & Payment
          </Heading>
          <Text>
            When you place an order, you are making an offer to purchase. We reserve the
            right to decline or cancel orders in cases of pricing errors, suspected fraud,
            or product unavailability. Payment is collected at the time of order through
            our secure payment provider (Stripe). We accept credit/debit cards and
            PromptPay.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-lg font-semibold text-dark mb-3 pb-2 border-b border-gray-100">
            4. Shipping & Delivery
          </Heading>
          <Text>
            We ship within Thailand. Estimated delivery times are provided at checkout
            but are not guaranteed. Gingerbros is not responsible for delays caused by
            shipping carriers or circumstances beyond our control. Risk of loss passes
            to you upon delivery.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-lg font-semibold text-dark mb-3 pb-2 border-b border-gray-100">
            5. Returns & Refunds
          </Heading>
          <Text>
            Due to the perishable nature of our products, returns are only accepted for
            items that arrive damaged or defective. You must contact us within 48 hours
            of delivery with photographic evidence. Approved refunds will be processed
            to your original payment method within 5-7 business days.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-lg font-semibold text-dark mb-3 pb-2 border-b border-gray-100">
            6. Accounts
          </Heading>
          <Text>
            You are responsible for maintaining the confidentiality of your account
            credentials. You agree to provide accurate information when creating an
            account and to update it as needed. We reserve the right to suspend or
            terminate accounts that violate these terms.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-lg font-semibold text-dark mb-3 pb-2 border-b border-gray-100">
            7. Intellectual Property
          </Heading>
          <Text>
            All content on this website, including text, images, logos, and branding,
            is the property of Gingerbros and may not be reproduced, distributed, or
            used without written permission.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-lg font-semibold text-dark mb-3 pb-2 border-b border-gray-100">
            8. Limitation of Liability
          </Heading>
          <Text>
            Gingerbros is not liable for any indirect, incidental, or consequential
            damages arising from the use of our website or products. Our total liability
            is limited to the amount you paid for the relevant order.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-lg font-semibold text-dark mb-3 pb-2 border-b border-gray-100">
            9. Governing Law
          </Heading>
          <Text>
            These terms are governed by the laws of the Kingdom of Thailand. Any disputes
            will be resolved in the courts of Thailand.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-lg font-semibold text-dark mb-3 pb-2 border-b border-gray-100">
            10. Contact
          </Heading>
          <Text>
            For questions about these terms, contact us at{" "}
            <a href="mailto:support@gingerbrosshop.com" className="text-[#C8702A] hover:underline">
              support@gingerbrosshop.com
            </a>.
          </Text>
        </section>
      </div>
      </div>
    </div>
  )
}
