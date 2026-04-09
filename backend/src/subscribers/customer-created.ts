import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function customerCreatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationService = container.resolve(Modules.NOTIFICATION)
  const customerService = container.resolve(Modules.CUSTOMER)

  const customer = await customerService.retrieveCustomer(event.data.id)

  const firstName = customer.first_name || "there"

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#2d2d2d">
      <div style="background:#C8702A;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">Gingerbros</h1>
      </div>
      <div style="padding:32px 24px">
        <h2 style="color:#C8702A;margin:0 0 16px">Welcome to Gingerbros, ${firstName}!</h2>
        <p>Thanks for creating an account. You're now part of the Gingerbros family.</p>
        <p style="font-size:14px;color:#666;margin-top:16px">With your account you can:</p>
        <ul style="font-size:14px;color:#666;line-height:1.8">
          <li>Track your orders</li>
          <li>Save shipping addresses</li>
          <li>Check out faster</li>
        </ul>
        <div style="text-align:center;margin:32px 0">
          <a href="https://gingerbrosshop.com/th/store" style="background:#C8702A;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
            Shop Now
          </a>
        </div>
      </div>
      <div style="background:#f9f5f0;padding:16px;text-align:center;font-size:12px;color:#999">
        <p style="margin:0">Gingerbros — Thai Craft Ginger Beverages</p>
      </div>
    </div>
  `

  if (!customer.email) return

  await notificationService.createNotifications({
    to: customer.email,
    channel: "email",
    template: "",
    data: {
      subject: "Welcome to Gingerbros!",
      html,
    },
  })
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
