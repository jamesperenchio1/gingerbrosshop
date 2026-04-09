import { Metadata } from "next"
import { Heading, Text } from "@medusajs/ui"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Gingerbros privacy policy — how we collect, use, and protect your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="content-container py-12 max-w-3xl mx-auto">
      <Heading level="h1" className="text-3xl font-display font-bold text-dark mb-2">
        Privacy Policy
      </Heading>
      <Text className="text-ui-fg-muted mb-8">Last updated: April 2026</Text>

      <div className="flex flex-col gap-y-8 text-ui-fg-subtle leading-relaxed">
        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            1. Information We Collect
          </Heading>
          <Text>When you use Gingerbros, we may collect the following information:</Text>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Account information:</strong> Name, email address, phone number, and password when you create an account.</li>
            <li><strong>Order information:</strong> Shipping address, billing address, and order history.</li>
            <li><strong>Payment information:</strong> Payment details are processed securely by Stripe. We do not store your full card number.</li>
            <li><strong>Usage data:</strong> Pages visited, browser type, and device information to improve our website.</li>
          </ul>
        </section>

        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            2. How We Use Your Information
          </Heading>
          <Text>We use your information to:</Text>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Manage your account and provide customer support</li>
            <li>Improve our products and website experience</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            3. Information Sharing
          </Heading>
          <Text>
            We do not sell your personal information. We share data only with:
          </Text>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Payment processors:</strong> Stripe, to securely handle transactions.</li>
            <li><strong>Shipping providers:</strong> To deliver your orders.</li>
            <li><strong>Legal authorities:</strong> When required by law.</li>
          </ul>
        </section>

        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            4. Data Security
          </Heading>
          <Text>
            We take reasonable measures to protect your personal information. All data
            is transmitted over encrypted connections (HTTPS), and payment processing
            is handled by PCI-compliant providers.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            5. Cookies
          </Heading>
          <Text>
            We use essential cookies to maintain your shopping session and account login.
            We do not use third-party advertising cookies.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            6. Your Rights
          </Heading>
          <Text>You have the right to:</Text>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for marketing communications</li>
          </ul>
          <Text className="mt-2">
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:support@gingerbrosshop.com" className="text-primary underline">
              support@gingerbrosshop.com
            </a>.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            7. Changes to This Policy
          </Heading>
          <Text>
            We may update this privacy policy from time to time. Changes will be posted
            on this page with an updated revision date.
          </Text>
        </section>

        <section>
          <Heading level="h2" className="text-xl font-semibold text-dark mb-3">
            8. Contact
          </Heading>
          <Text>
            For questions about this privacy policy, email us at{" "}
            <a href="mailto:support@gingerbrosshop.com" className="text-primary underline">
              support@gingerbrosshop.com
            </a>.
          </Text>
        </section>
      </div>
    </div>
  )
}
