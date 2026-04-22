import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  PaymentSessionStatus,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import { AbstractPaymentProvider } from "@medusajs/framework/utils"

// Shared implementation used by both Bank Transfer and Cash on Delivery.
// Sessions are created in `pending` / `authorized` state without calling
// any external API — the admin confirms receipt of funds manually.
function manualImpl() {
  return {
    async initiatePayment(
      input: InitiatePaymentInput
    ): Promise<InitiatePaymentOutput> {
      return {
        id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        status: "pending" as PaymentSessionStatus,
        data: { ...(input.data ?? {}) },
      }
    },
    async authorizePayment(
      input: AuthorizePaymentInput
    ): Promise<AuthorizePaymentOutput> {
      return {
        data: input.data ?? {},
        status: "authorized" as PaymentSessionStatus,
      }
    },
    async capturePayment(
      input: CapturePaymentInput
    ): Promise<CapturePaymentOutput> {
      return { data: input.data ?? {} }
    },
    async cancelPayment(
      input: CancelPaymentInput
    ): Promise<CancelPaymentOutput> {
      return { data: input.data ?? {} }
    },
    async deletePayment(
      input: DeletePaymentInput
    ): Promise<DeletePaymentOutput> {
      return { data: input.data ?? {} }
    },
    async getPaymentStatus(
      input: GetPaymentStatusInput
    ): Promise<GetPaymentStatusOutput> {
      return {
        data: input.data ?? {},
        status: "authorized" as PaymentSessionStatus,
      }
    },
    async refundPayment(
      input: RefundPaymentInput
    ): Promise<RefundPaymentOutput> {
      return { data: input.data ?? {} }
    },
    async retrievePayment(
      input: RetrievePaymentInput
    ): Promise<RetrievePaymentOutput> {
      return { data: input.data ?? {} }
    },
    async updatePayment(
      input: UpdatePaymentInput
    ): Promise<UpdatePaymentOutput> {
      return { data: input.data ?? {} }
    },
    async getWebhookActionAndData(
      _payload: ProviderWebhookPayload["payload"]
    ): Promise<WebhookActionResult> {
      return { action: "not_supported" } as WebhookActionResult
    },
  }
}

export class BankTransferProviderService extends AbstractPaymentProvider {
  static identifier = "bank-transfer"
  // Re-export as public so ModuleProvider's Constructor<any> can instantiate us.
  constructor(...args: any[]) {
    // @ts-expect-error -- base class uses protected ctor; proxy args through
    super(...args)
  }
  initiatePayment = manualImpl().initiatePayment
  authorizePayment = manualImpl().authorizePayment
  capturePayment = manualImpl().capturePayment
  cancelPayment = manualImpl().cancelPayment
  deletePayment = manualImpl().deletePayment
  getPaymentStatus = manualImpl().getPaymentStatus
  refundPayment = manualImpl().refundPayment
  retrievePayment = manualImpl().retrievePayment
  updatePayment = manualImpl().updatePayment
  getWebhookActionAndData = manualImpl().getWebhookActionAndData
}

export class CashOnDeliveryProviderService extends AbstractPaymentProvider {
  static identifier = "cod"
  constructor(...args: any[]) {
    // @ts-expect-error -- base class uses protected ctor; proxy args through
    super(...args)
  }
  initiatePayment = manualImpl().initiatePayment
  authorizePayment = manualImpl().authorizePayment
  capturePayment = manualImpl().capturePayment
  cancelPayment = manualImpl().cancelPayment
  deletePayment = manualImpl().deletePayment
  getPaymentStatus = manualImpl().getPaymentStatus
  refundPayment = manualImpl().refundPayment
  retrievePayment = manualImpl().retrievePayment
  updatePayment = manualImpl().updatePayment
  getWebhookActionAndData = manualImpl().getWebhookActionAndData
}
