import type { CartItem } from '@/types/cart';

// Set right before redirecting to the first (one-time) leg of a split checkout.
// The success page reads it once to know it should pick up the subscription leg.
export const PENDING_SUBSCRIPTION_CHECKOUT_KEY = 'gbros-pending-subscription-checkout';

export function getGiftInfo(items: CartItem[]) {
  const giftItem = items.find((i) => i.isGift);
  if (!giftItem) return undefined;
  return {
    isGift: true as const,
    recipientEmail: giftItem.recipientEmail,
    recipientName: giftItem.recipientName,
    message: giftItem.giftMessage,
  };
}

export const REFERRAL_CODE_STORAGE_KEY = 'gbros-referral-code';

export async function startCheckout(
  items: CartItem[],
  options?: { email?: string; referralCode?: string; orderNote?: string },
): Promise<string> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map((i) => ({ priceId: i.priceId ?? i.id, quantity: i.quantity, productId: i.productId })),
      giftInfo: getGiftInfo(items),
      email: options?.email?.trim() || undefined,
      referralCode: options?.referralCode?.trim() || undefined,
      orderNote: options?.orderNote?.trim() || undefined,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data?.url) {
    throw new Error(data?.error ?? 'Checkout failed');
  }
  return data.url as string;
}
