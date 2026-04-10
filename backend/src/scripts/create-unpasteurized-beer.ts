import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function createUnpasteurizedBeer({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)

  logger.info("Creating Unpasteurized Ginger Beer product...")

  const [defaultSalesChannel] = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!defaultSalesChannel) {
    throw new Error("Default Sales Channel not found")
  }

  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })
  const shippingProfile = shippingProfiles[0]
  if (!shippingProfile) {
    throw new Error("Default shipping profile not found")
  }

  const stockLocations = await stockLocationModuleService.listStockLocations({})
  const stockLocation = stockLocations[0]
  if (!stockLocation) {
    throw new Error("Stock location not found")
  }

  // Skip if it already exists
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: "unpasteurized-ginger-beer" },
  })
  if (existing.length) {
    logger.info("Unpasteurized Ginger Beer already exists. Skipping create.")
    return
  }

  const { result } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Unpasteurized Ginger Beer",
          subtitle: "Live, raw, made-to-order",
          description:
            "Our premium small-batch ginger beer, brewed fresh and bottled raw — never pasteurized. Made on demand to preserve the live cultures, wild ferment character, and intensely bright ginger bite that pasteurization strips away. Because it's living, it ships cold and arrives at peak vitality. Refrigerate immediately. Best within 14 days. For ginger lovers who want the real, unfiltered thing.",
          handle: "unpasteurized-ginger-beer",
          weight: 350,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [
            {
              title: "Size",
              values: ["Single", "6-Pack"],
            },
          ],
          variants: [
            {
              title: "Single",
              sku: "GBEER-RAW-1",
              options: { Size: "Single" },
              prices: [{ currency_code: "thb", amount: 14900 }], // ฿149
              manage_inventory: true,
            },
            {
              title: "6-Pack",
              sku: "GBEER-RAW-6",
              options: { Size: "6-Pack" },
              prices: [{ currency_code: "thb", amount: 79900 }], // ฿799
              manage_inventory: true,
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
      ],
    },
  })

  logger.info(`Created product: ${result[0].id}`)

  // Set inventory levels for the new variants
  const { data: newProduct } = await query.graph({
    entity: "product",
    fields: ["id", "variants.id", "variants.inventory_items.inventory.id"],
    filters: { handle: "unpasteurized-ginger-beer" },
  })

  const inventoryItemIds: string[] = []
  for (const v of newProduct[0].variants ?? []) {
    for (const ii of (v as any).inventory_items ?? []) {
      if (ii?.inventory?.id) inventoryItemIds.push(ii.inventory.id)
    }
  }

  if (inventoryItemIds.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryItemIds.map((id) => ({
          inventory_item_id: id,
          location_id: stockLocation.id,
          stocked_quantity: 100,
        })),
      },
    })
    logger.info(`Stocked ${inventoryItemIds.length} inventory items.`)
  }

  logger.info("Done.")
}
