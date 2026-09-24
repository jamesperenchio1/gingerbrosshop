import type Stripe from 'stripe';

export interface AdminPrice {
  id: string;
  unitAmount: number | null;
  currency: string;
  nickname: string | null;
  active: boolean;
  type: 'one_time' | 'recurring';
  recurring: { interval: string; intervalCount: number } | null;
  metadata: Record<string, string>;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  images: string[];
  metadata: Record<string, string>;
  appId: string | null;
  category: string | null;
  hidden: boolean;
  createdAt: string;
  defaultPriceId: string | null;
  prices: AdminPrice[];
}

function toAdminPrice(p: Stripe.Price): AdminPrice {
  return {
    id: p.id,
    unitAmount: p.unit_amount,
    currency: p.currency,
    nickname: p.nickname ?? null,
    active: p.active,
    type: p.type === 'recurring' ? 'recurring' : 'one_time',
    recurring: p.recurring
      ? { interval: p.recurring.interval, intervalCount: p.recurring.interval_count }
      : null,
    metadata: (p.metadata ?? {}) as Record<string, string>,
  };
}

function toAdminProduct(p: Stripe.Product, prices: AdminPrice[]): AdminProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? null,
    active: p.active,
    images: p.images ?? [],
    metadata: (p.metadata ?? {}) as Record<string, string>,
    appId: p.metadata?.app_id ?? null,
    category: p.metadata?.category ?? null,
    hidden: p.metadata?.hidden === 'true',
    createdAt: new Date(p.created * 1000).toISOString(),
    defaultPriceId:
      typeof p.default_price === 'string' ? p.default_price : p.default_price?.id ?? null,
    prices,
  };
}

async function pricesFor(stripe: Stripe, productId: string): Promise<AdminPrice[]> {
  const res = await stripe.prices.list({ product: productId, limit: 100 });
  return res.data.map(toAdminPrice);
}

export async function listProducts(
  stripe: Stripe,
  opts: { limit?: number; startingAfter?: string; search?: string } = {},
): Promise<{ products: AdminProduct[]; hasMore: boolean; nextCursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  const res = await stripe.products.list({ limit, starting_after: opts.startingAfter });
  const products = await Promise.all(
    res.data.map(async (p) => toAdminProduct(p, await pricesFor(stripe, p.id))),
  );
  const term = opts.search?.trim().toLowerCase();
  const filtered = term
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.appId ?? '').toLowerCase().includes(term) ||
          p.id.includes(term),
      )
    : products;
  return {
    products: filtered,
    hasMore: res.has_more,
    nextCursor: res.data.length ? res.data[res.data.length - 1].id : null,
  };
}

export async function getProductDetail(stripe: Stripe, id: string): Promise<AdminProduct> {
  const product = await stripe.products.retrieve(id);
  return toAdminProduct(product, await pricesFor(stripe, id));
}

export interface ProductInput {
  name?: string;
  description?: string | null;
  images?: string[];
  active?: boolean;
  metadata?: Record<string, string>;
}

export async function createProduct(stripe: Stripe, input: ProductInput): Promise<AdminProduct> {
  const name = (input.name ?? '').trim();
  if (!name) throw new Error('A product name is required.');
  const product = await stripe.products.create({
    name,
    description: input.description ?? undefined,
    images: input.images?.length ? input.images : undefined,
    active: input.active ?? true,
    metadata: input.metadata ?? undefined,
  });
  return toAdminProduct(product, []);
}

export async function updateProduct(
  stripe: Stripe,
  id: string,
  input: ProductInput,
): Promise<AdminProduct> {
  if (!id) throw new Error('Missing product id.');
  const params: Stripe.ProductUpdateParams = {};
  if (input.name !== undefined) params.name = String(input.name);
  if (input.description !== undefined) {
    params.description = input.description === null ? '' : String(input.description);
  }
  if (input.images !== undefined) params.images = input.images;
  if (input.active !== undefined) params.active = input.active;
  if (input.metadata !== undefined) params.metadata = input.metadata;
  if (Object.keys(params).length === 0) throw new Error('Nothing to update.');
  const product = await stripe.products.update(id, params);
  return toAdminProduct(product, await pricesFor(stripe, id));
}

export async function archiveProduct(stripe: Stripe, id: string): Promise<AdminProduct> {
  const product = await stripe.products.update(id, { active: false });
  return toAdminProduct(product, await pricesFor(stripe, id));
}

export interface PriceInput {
  product: string;
  unitAmount: number;
  currency?: string;
  nickname?: string | null;
  recurring?: { interval: 'day' | 'week' | 'month' | 'year'; intervalCount?: number } | null;
  metadata?: Record<string, string>;
}

export async function createPrice(stripe: Stripe, input: PriceInput): Promise<AdminPrice> {
  if (!input.product) throw new Error('Missing product.');
  if (!Number.isFinite(input.unitAmount) || input.unitAmount <= 0) {
    throw new Error('A positive amount (in satang) is required.');
  }
  const params: Stripe.PriceCreateParams = {
    product: input.product,
    currency: (input.currency ?? 'thb').toLowerCase(),
    unit_amount: Math.round(input.unitAmount),
  };
  if (input.nickname) params.nickname = input.nickname;
  if (input.recurring) {
    params.recurring = {
      interval: input.recurring.interval,
      interval_count: input.recurring.intervalCount ?? 1,
    };
  }
  if (input.metadata) params.metadata = input.metadata;
  const price = await stripe.prices.create(params);
  return toAdminPrice(price);
}

export async function updatePrice(
  stripe: Stripe,
  id: string,
  patch: { active?: boolean; nickname?: string | null; metadata?: Record<string, string> },
): Promise<AdminPrice> {
  if (!id) throw new Error('Missing price id.');
  const params: Stripe.PriceUpdateParams = {};
  if (patch.active !== undefined) params.active = patch.active;
  if (patch.nickname !== undefined) params.nickname = patch.nickname ?? '';
  if (patch.metadata !== undefined) params.metadata = patch.metadata;
  if (Object.keys(params).length === 0) throw new Error('Nothing to update.');
  const price = await stripe.prices.update(id, params);
  return toAdminPrice(price);
}
