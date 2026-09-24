import type Stripe from 'stripe';

export interface AdminCoupon {
  id: string;
  name: string | null;
  percentOff: number | null;
  amountOff: number | null;
  currency: string | null;
  duration: string;
  durationInMonths: number | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  valid: boolean;
  redeemBy: string | null;
  createdAt: string;
  metadata: Record<string, string>;
  /** How many promotion codes point at this coupon. A coupon with none is not redeemable. */
  promotionCodeCount: number;
}

export interface AdminPromotionCode {
  id: string;
  code: string;
  couponId: string;
  couponName: string | null;
  active: boolean;
  timesRedeemed: number;
  maxRedemptions: number | null;
  expiresAt: string | null;
  createdAt: string;
}

function toAdminCoupon(c: Stripe.Coupon, promotionCodeCount = 0): AdminCoupon {
  return {
    id: c.id,
    name: c.name ?? null,
    percentOff: c.percent_off ?? null,
    amountOff: c.amount_off ?? null,
    currency: c.currency ?? null,
    duration: c.duration,
    durationInMonths: c.duration_in_months ?? null,
    maxRedemptions: c.max_redemptions ?? null,
    timesRedeemed: c.times_redeemed,
    valid: c.valid,
    redeemBy: c.redeem_by ? new Date(c.redeem_by * 1000).toISOString() : null,
    createdAt: new Date(c.created * 1000).toISOString(),
    metadata: (c.metadata ?? {}) as Record<string, string>,
    promotionCodeCount,
  };
}

/** Best-effort map of coupon id -> number of promotion codes pointing at it. */
async function promotionCodeCounts(stripe: Stripe): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  try {
    const promos = await stripe.promotionCodes.list({ limit: 100, expand: ['data.coupon'] });
    for (const p of promos.data) {
      const coupon = p.coupon as unknown as string | { id: string } | null | undefined;
      const cid = typeof coupon === 'string' ? coupon : coupon?.id;
      if (cid) counts.set(cid, (counts.get(cid) ?? 0) + 1);
    }
  } catch {
    // counts are best-effort; ignore failures
  }
  return counts;
}

function toAdminPromotionCode(p: Stripe.PromotionCode): AdminPromotionCode {
  const coupon = p.coupon;
  return {
    id: p.id,
    code: p.code,
    couponId: coupon.id,
    couponName: coupon.name ?? null,
    active: p.active,
    timesRedeemed: p.times_redeemed,
    maxRedemptions: p.max_redemptions ?? null,
    expiresAt: p.expires_at ? new Date(p.expires_at * 1000).toISOString() : null,
    createdAt: new Date(p.created * 1000).toISOString(),
  };
}

export async function listCoupons(
  stripe: Stripe,
  opts: { limit?: number; startingAfter?: string } = {},
): Promise<{ coupons: AdminCoupon[]; hasMore: boolean; nextCursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  const res = await stripe.coupons.list({ limit, starting_after: opts.startingAfter });
  const counts = await promotionCodeCounts(stripe);
  return {
    coupons: res.data.map((c) => toAdminCoupon(c, counts.get(c.id) ?? 0)),
    hasMore: res.has_more,
    nextCursor: res.data.length ? res.data[res.data.length - 1].id : null,
  };
}

export async function getCoupon(stripe: Stripe, id: string): Promise<AdminCoupon> {
  const coupon = await stripe.coupons.retrieve(id);
  let count = 0;
  try {
    const promos = await stripe.promotionCodes.list({ coupon: id, limit: 100 });
    count = promos.data.length;
  } catch {
    // best-effort
  }
  return toAdminCoupon(coupon, count);
}

export interface CouponInput {
  name?: string | null;
  percentOff?: number | null;
  amountOff?: number | null;
  currency?: string;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number | null;
  maxRedemptions?: number | null;
  redeemBy?: string | null;
  metadata?: Record<string, string>;
}

export async function createCoupon(stripe: Stripe, input: CouponInput): Promise<AdminCoupon> {
  const hasPercent = Number.isFinite(input.percentOff) && (input.percentOff as number) > 0;
  const hasAmount = Number.isFinite(input.amountOff) && (input.amountOff as number) > 0;
  if (hasPercent === hasAmount) {
    throw new Error('Set exactly one of percent off or amount off.');
  }
  if (!['once', 'repeating', 'forever'].includes(input.duration)) {
    throw new Error('Duration must be once, repeating or forever.');
  }
  if (input.duration === 'repeating' && !(Number(input.durationInMonths) > 0)) {
    throw new Error('Repeating coupons need a number of months.');
  }

  const params: Stripe.CouponCreateParams = { duration: input.duration };
  if (input.name) params.name = String(input.name);
  if (hasPercent) params.percent_off = Number(input.percentOff);
  if (hasAmount) {
    params.amount_off = Math.round(Number(input.amountOff));
    params.currency = (input.currency ?? 'thb').toLowerCase();
  }
  if (input.duration === 'repeating') params.duration_in_months = Math.round(Number(input.durationInMonths));
  if (Number(input.maxRedemptions) > 0) params.max_redemptions = Math.round(Number(input.maxRedemptions));
  if (input.redeemBy) params.redeem_by = Math.floor(new Date(input.redeemBy).getTime() / 1000);
  if (input.metadata) params.metadata = input.metadata;

  const coupon = await stripe.coupons.create(params);
  return toAdminCoupon(coupon);
}

export async function updateCoupon(
  stripe: Stripe,
  id: string,
  patch: { name?: string | null; metadata?: Record<string, string> },
): Promise<AdminCoupon> {
  if (!id) throw new Error('Missing coupon id.');
  const params: Stripe.CouponUpdateParams = {};
  if (patch.name !== undefined) params.name = patch.name ?? '';
  if (patch.metadata !== undefined) params.metadata = patch.metadata;
  if (Object.keys(params).length === 0) throw new Error('Nothing to update.');
  return toAdminCoupon(await stripe.coupons.update(id, params));
}

export async function deleteCoupon(stripe: Stripe, id: string): Promise<{ deleted: true }> {
  if (!id) throw new Error('Missing coupon id.');
  await stripe.coupons.del(id);
  return { deleted: true };
}

export async function listPromotionCodes(
  stripe: Stripe,
  opts: { limit?: number; startingAfter?: string; coupon?: string; active?: boolean } = {},
): Promise<{ promotionCodes: AdminPromotionCode[]; hasMore: boolean; nextCursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  const res = await stripe.promotionCodes.list({
    limit,
    starting_after: opts.startingAfter,
    coupon: opts.coupon,
    active: opts.active,
  });
  return {
    promotionCodes: res.data.map(toAdminPromotionCode),
    hasMore: res.has_more,
    nextCursor: res.data.length ? res.data[res.data.length - 1].id : null,
  };
}

export interface PromotionCodeInput {
  coupon: string;
  code?: string | null;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
  metadata?: Record<string, string>;
}

export async function createPromotionCode(
  stripe: Stripe,
  input: PromotionCodeInput,
): Promise<AdminPromotionCode> {
  if (!input.coupon) throw new Error('Missing coupon.');
  const params: Stripe.PromotionCodeCreateParams = {
    promotion: { type: 'coupon', coupon: input.coupon },
  };
  if (input.code) params.code = String(input.code);
  if (Number(input.maxRedemptions) > 0) params.max_redemptions = Math.round(Number(input.maxRedemptions));
  if (input.expiresAt) params.expires_at = Math.floor(new Date(input.expiresAt).getTime() / 1000);
  if (input.metadata) params.metadata = input.metadata;
  return toAdminPromotionCode(await stripe.promotionCodes.create(params));
}

export async function updatePromotionCode(
  stripe: Stripe,
  id: string,
  patch: { active?: boolean },
): Promise<AdminPromotionCode> {
  if (!id) throw new Error('Missing promotion code id.');
  const params: Stripe.PromotionCodeUpdateParams = {};
  if (patch.active !== undefined) params.active = patch.active;
  if (Object.keys(params).length === 0) throw new Error('Nothing to update.');
  return toAdminPromotionCode(await stripe.promotionCodes.update(id, params));
}
