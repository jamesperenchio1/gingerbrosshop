import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[]
    store_id: string
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => ({
              currency_code: currency.currency_code,
              is_default: currency.is_default ?? false,
            })
          ),
        },
      }
    })

    const stores = updateStoresStep(normalizedInput)
    return new WorkflowResponse(stores)
  }
)

export default async function seedGingerBrosData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const storeModuleService = container.resolve(Modules.STORE)

  // ──────────────────────────────────────────
  // 1. Store & Sales Channel
  // ──────────────────────────────────────────
  logger.info("Seeding store data...")
  const [store] = await storeModuleService.listStores()

  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [{ name: "Default Sales Channel" }],
      },
    })
    defaultSalesChannel = salesChannelResult
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        { currency_code: "thb", is_default: true },
      ],
    },
  })

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  })
  logger.info("Finished seeding store data.")

  // ──────────────────────────────────────────
  // 2. Region — Thailand (THB)
  // ──────────────────────────────────────────
  logger.info("Seeding region data...")
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Thailand",
          currency_code: "thb",
          countries: ["th"],
          payment_providers: ["pp_stripe_stripe"],
        },
      ],
    },
  })
  const region = regionResult[0]
  logger.info("Finished seeding region data.")

  // ──────────────────────────────────────────
  // 3. Tax Region
  // ──────────────────────────────────────────
  logger.info("Seeding tax region...")
  await createTaxRegionsWorkflow(container).run({
    input: [
      {
        country_code: "th",
        provider_id: "tp_system",
      },
    ],
  })
  logger.info("Finished seeding tax region.")

  // ──────────────────────────────────────────
  // 4. Stock Location & Fulfillment
  // ──────────────────────────────────────────
  logger.info("Seeding stock location data...")
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "GingerBros Warehouse",
          address: {
            city: "Bangkok",
            country_code: "TH",
            address_1: "",
          },
        },
      ],
    },
  })
  const stockLocation = stockLocationResult[0]

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  })

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  })

  // Shipping profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      })
    shippingProfile = shippingProfileResult[0]
  }

  // Fulfillment set with Thailand service zone
  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Thailand Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Thailand",
        geo_zones: [
          {
            country_code: "th",
            type: "country",
          },
        ],
      },
    ],
  })

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  })

  // ──────────────────────────────────────────
  // 5. Shipping Options
  // ──────────────────────────────────────────
  logger.info("Seeding shipping options...")
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping (฿60)",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Delivery in 3-5 business days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "thb",
            amount: 6000, // ฿60 in satang
          },
          {
            region_id: region.id,
            amount: 6000,
          },
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
      {
        name: "Free Shipping (orders over ฿500)",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Free Shipping",
          description: "Free delivery for orders over ฿500.",
          code: "free",
        },
        prices: [
          {
            currency_code: "thb",
            amount: 0,
          },
          {
            region_id: region.id,
            amount: 0,
          },
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
  logger.info("Finished seeding shipping options.")

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  })
  logger.info("Finished seeding stock location data.")

  // ──────────────────────────────────────────
  // 6. Products — GingerBros Beverages
  // ──────────────────────────────────────────
  logger.info("Seeding product data...")
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Ginger Shot",
          description:
            "Concentrated ginger shot made from organic Thai ginger. A quick, fiery boost to start your day.",
          handle: "ginger-shot",
          weight: 100,
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
              sku: "GSHOT-1",
              options: { Size: "Single" },
              prices: [{ currency_code: "thb", amount: 7000 }], // ฿70
            },
            {
              title: "6-Pack",
              sku: "GSHOT-6",
              options: { Size: "6-Pack" },
              prices: [{ currency_code: "thb", amount: 35000 }], // ฿350
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "Ginger Beer",
          description:
            "Craft ginger beer brewed with real Thai ginger root. Bold, spicy, and naturally carbonated.",
          handle: "ginger-beer",
          weight: 330,
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
              sku: "GBEER-1",
              options: { Size: "Single" },
              prices: [{ currency_code: "thb", amount: 12000 }], // ฿120
            },
            {
              title: "6-Pack",
              sku: "GBEER-6",
              options: { Size: "6-Pack" },
              prices: [{ currency_code: "thb", amount: 60000 }], // ฿600
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "Ginger Ale",
          description:
            "Refreshing ginger ale made with a blend of Thai ginger and natural cane sugar. Light and crisp.",
          handle: "ginger-ale",
          weight: 330,
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
              sku: "GALE-1",
              options: { Size: "Single" },
              prices: [{ currency_code: "thb", amount: 8000 }], // ฿80
            },
            {
              title: "6-Pack",
              sku: "GALE-6",
              options: { Size: "6-Pack" },
              prices: [{ currency_code: "thb", amount: 40000 }], // ฿400
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  })
  logger.info("Finished seeding product data.")

  // ──────────────────────────────────────────
  // 7. Inventory Levels
  // ──────────────────────────────────────────
  logger.info("Seeding inventory levels...")
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })

  const inventoryLevels = inventoryItems.map((item) => ({
    location_id: stockLocation.id,
    stocked_quantity: 10000,
    inventory_item_id: item.id,
  }))

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  })
  logger.info("Finished seeding inventory levels.")

  logger.info("GingerBros seed data complete!")
}
