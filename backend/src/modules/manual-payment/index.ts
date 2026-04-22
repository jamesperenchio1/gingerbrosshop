import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import {
  BankTransferProviderService,
  CashOnDeliveryProviderService,
} from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [BankTransferProviderService, CashOnDeliveryProviderService],
})
