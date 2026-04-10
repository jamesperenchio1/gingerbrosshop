import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function createCoolDelivery({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const regionModuleService = container.resolve(Modules.REGION)

  logger.info("Creating Cool Delivery shipping option...")

  // Find the default shipping profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })
  const shippingProfile = shippingProfiles[0]
  if (!shippingProfile) {
    throw new Error("Default shipping profile not found")
  }

  // Find the Thailand fulfillment set
  const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets(
    {},
    { relations: ["service_zones"] }
  )
  const fulfillmentSet = fulfillmentSets.find(
    (fs: any) => fs.service_zones?.length
  )
  if (!fulfillmentSet || !fulfillmentSet.service_zones?.[0]) {
    throw new Error("Thailand service zone not found")
  }
  const serviceZone = fulfillmentSet.service_zones[0]

  // Find the THB region
  const regions = await regionModuleService.listRegions({ currency_code: "thb" })
  const region = regions[0]
  if (!region) {
    throw new Error("THB region not found")
  }

  // Skip if a Cool Delivery option already exists
  const { data: existing } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
  })
  if (existing.some((o: any) => o.name?.toLowerCase().includes("cool"))) {
    logger.info("Cool Delivery shipping option already exists. Skipping.")
    return
  }

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Cool Delivery (refrigerated, +฿120)",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Cool Delivery",
          description:
            "Temperature-controlled refrigerated delivery. Required for unpasteurized products. 3-5 business days.",
          code: "cool",
        },
        prices: [
          { currency_code: "thb", amount: 12000 }, // ฿120 in satang
          { region_id: region.id, amount: 12000 },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  })

  logger.info("Cool Delivery shipping option created.")
}
