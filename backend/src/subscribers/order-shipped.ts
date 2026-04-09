import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function orderShippedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string; order_id: string }>) {
  const notificationService = container.resolve(Modules.NOTIFICATION)
  const orderService = container.resolve(Modules.ORDER)
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)

  let orderId = event.data.order_id
  let trackingNumbers: string[] = []

  try {
    const fulfillment = await fulfillmentService.retrieveFulfillment(
      event.data.id,
      { relations: ["labels"] }
    )
    if (fulfillment.labels?.length) {
      trackingNumbers = fulfillment.labels
        .map((l: any) => l.tracking_number)
        .filter(Boolean)
    }
    if (!orderId && (fulfillment as any).order_id) {
      orderId = (fulfillment as any).order_id
    }
  } catch {
    // fulfillment may not be accessible, continue with order_id from event
  }

  if (!orderId) return

  const order = await orderService.retrieveOrder(orderId, {
    relations: ["shipping_address"],
  })

  const trackingHtml = trackingNumbers.length
    ? `<p style="font-size:14px">Tracking number${trackingNumbers.length > 1 ? "s" : ""}: <strong>${trackingNumbers.join(", ")}</strong></p>`
    : ""

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#2d2d2d">
      <div style="background:#C8702A;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">Gingerbros</h1>
      </div>
      <div style="padding:32px 24px">
        <h2 style="color:#C8702A;margin:0 0 16px">Your order is on its way!</h2>
        <p>Great news — your order <strong>#${order.display_id || order.id}</strong> has been shipped.</p>
        ${trackingHtml}
        <p style="font-size:14px;color:#666;margin-top:24px">
          Estimated delivery: 3-5 business days within Thailand.
        </p>
        <p style="font-size:14px;color:#666">
          If you have any questions, reply to this email or contact us at
          <a href="mailto:support@gingerbrosshop.com" style="color:#C8702A">support@gingerbrosshop.com</a>.
        </p>
      </div>
      <div style="background:#f9f5f0;padding:16px;text-align:center;font-size:12px;color:#999">
        <p style="margin:0">Gingerbros — Thai Craft Ginger Beverages</p>
      </div>
    </div>
  `

  if (!order.email) return

  await notificationService.createNotifications({
    to: order.email,
    channel: "email",
    template: "",
    data: {
      subject: `Your Gingerbros order has shipped — #${order.display_id || order.id}`,
      html,
    },
  })
}

export const config: SubscriberConfig = {
  event: "fulfillment.created",
}
