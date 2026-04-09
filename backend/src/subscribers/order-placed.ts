import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationService = container.resolve(Modules.NOTIFICATION)
  const orderService = container.resolve(Modules.ORDER)

  const order = await orderService.retrieveOrder(event.data.id, {
    relations: ["items", "shipping_address"],
  })

  const items = (order.items || [])
    .map(
      (item: any) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${item.title} ${item.variant_title ? `(${item.variant_title})` : ""}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">฿${((item.unit_price * item.quantity) / 100).toFixed(0)}</td>
        </tr>`
    )
    .join("")

  const addr = order.shipping_address
  const addressBlock = addr
    ? `${addr.first_name} ${addr.last_name}<br>${addr.address_1}${addr.address_2 ? ", " + addr.address_2 : ""}<br>${addr.city}, ${addr.province || ""} ${addr.postal_code}<br>${addr.country_code?.toUpperCase()}`
    : ""

  const total = order.total ? `฿${(Number(order.total) / 100).toFixed(0)}` : ""

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Arial,sans-serif;color:#2d2d2d">
      <div style="background:#C8702A;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">Gingerbros</h1>
      </div>
      <div style="padding:32px 24px">
        <h2 style="color:#C8702A;margin:0 0 16px">Order Confirmed!</h2>
        <p>Thanks for your order. We're getting it ready for you.</p>
        <p style="color:#666;font-size:14px">Order ID: <strong>${order.display_id || order.id}</strong></p>

        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <thead>
            <tr style="border-bottom:2px solid #C8702A">
              <th style="text-align:left;padding:8px 0">Item</th>
              <th style="text-align:center;padding:8px 0">Qty</th>
              <th style="text-align:right;padding:8px 0">Price</th>
            </tr>
          </thead>
          <tbody>${items}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px 0;text-align:right;font-weight:bold">Total</td>
              <td style="padding:12px 0;text-align:right;font-weight:bold;color:#C8702A">${total}</td>
            </tr>
          </tfoot>
        </table>

        ${addressBlock ? `<div style="background:#f9f5f0;padding:16px;border-radius:8px;margin:24px 0"><h3 style="margin:0 0 8px;font-size:14px;color:#C8702A">Shipping to</h3><p style="margin:0;font-size:14px;line-height:1.5">${addressBlock}</p></div>` : ""}

        <p style="font-size:14px;color:#666">We'll send you another email when your order ships.</p>
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
      subject: `Order confirmed — #${order.display_id || order.id}`,
      html,
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
