import { Metadata } from "next"
import { Heading, Text } from "@medusajs/ui"

export const metadata: Metadata = {
  title: "Customer Service",
  description: "Get help with your Gingerbros order, shipping, returns, and more.",
}

export default function CustomerServicePage() {
  return (
    <div className="content-container py-12 max-w-3xl mx-auto">
      <Heading level="h1" className="text-3xl font-display font-bold text-dark mb-8">
        Customer Service
      </Heading>

      <div className="flex flex-col gap-y-8">
        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            Contact Us
          </Heading>
          <Text className="text-ui-fg-subtle leading-relaxed">
            Have a question or need help with your order? We&apos;re here for you.
          </Text>
          <ul className="mt-3 space-y-2 text-ui-fg-subtle">
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:support@gingerbrosshop.com" className="text-primary underline">
                support@gingerbrosshop.com
              </a>
            </li>
            <li>
              <strong>Response time:</strong> Within 24 hours on business days
            </li>
          </ul>
        </section>

        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            Orders & Shipping
          </Heading>
          <div className="space-y-4 text-ui-fg-subtle leading-relaxed">
            <div>
              <Text className="font-medium text-dark">How long does shipping take?</Text>
              <Text className="mt-1">
                Orders within Thailand are typically delivered within 3-5 business days.
                You&apos;ll receive a confirmation email once your order has been dispatched.
              </Text>
            </div>
            <div>
              <Text className="font-medium text-dark">How can I track my order?</Text>
              <Text className="mt-1">
                Once your order ships, you&apos;ll receive tracking information via email.
                You can also check your order status in your account under &quot;Orders&quot;.
              </Text>
            </div>
            <div>
              <Text className="font-medium text-dark">What shipping methods are available?</Text>
              <Text className="mt-1">
                We offer standard shipping across Thailand. Shipping costs are calculated
                at checkout based on your location and order size.
              </Text>
            </div>
          </div>
        </section>

        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            Returns & Refunds
          </Heading>
          <div className="space-y-4 text-ui-fg-subtle leading-relaxed">
            <div>
              <Text className="font-medium text-dark">What is your return policy?</Text>
              <Text className="mt-1">
                Due to the perishable nature of our beverages, we cannot accept returns on
                opened products. If your order arrives damaged or defective, please contact
                us within 48 hours of delivery with photos, and we&apos;ll arrange a
                replacement or full refund.
              </Text>
            </div>
            <div>
              <Text className="font-medium text-dark">How long do refunds take?</Text>
              <Text className="mt-1">
                Approved refunds are processed within 5-7 business days. The refund will
                be returned to your original payment method.
              </Text>
            </div>
          </div>
        </section>

        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            Products
          </Heading>
          <div className="space-y-4 text-ui-fg-subtle leading-relaxed">
            <div>
              <Text className="font-medium text-dark">What are your beverages made from?</Text>
              <Text className="mt-1">
                All Gingerbros beverages are crafted in Thailand using real ginger and
                natural ingredients. Each product page lists the full ingredients.
              </Text>
            </div>
            <div>
              <Text className="font-medium text-dark">How should I store the drinks?</Text>
              <Text className="mt-1">
                Keep bottles refrigerated after opening. Unopened bottles can be stored in
                a cool, dry place. Best consumed within the date printed on the bottle.
              </Text>
            </div>
          </div>
        </section>

        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            Payment
          </Heading>
          <div className="space-y-4 text-ui-fg-subtle leading-relaxed">
            <div>
              <Text className="font-medium text-dark">What payment methods do you accept?</Text>
              <Text className="mt-1">
                We accept credit/debit cards (Visa, Mastercard, American Express) and
                PromptPay for customers in Thailand.
              </Text>
            </div>
            <div>
              <Text className="font-medium text-dark">Is my payment information secure?</Text>
              <Text className="mt-1">
                All payments are processed securely through Stripe. We never store your
                card details on our servers.
              </Text>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
