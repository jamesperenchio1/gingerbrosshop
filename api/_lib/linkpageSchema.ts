import { z } from 'zod';

// Shared by the API (validation on save) and the frontend (types + rendering
// helpers). Keep this file free of Node- or DOM-only imports.

export const SOCIAL_TYPES = ['instagram', 'facebook', 'tiktok', 'line', 'youtube', 'x', 'shopee', 'email', 'website'] as const;
export const FONT_OPTIONS = ['Albert Sans', 'Inter', 'DM Sans', 'Poppins', 'Space Grotesk', 'Playfair Display', 'Fraunces', 'Nunito'] as const;
export const HIGHLIGHTS = ['none', 'pulse', 'wobble', 'shine'] as const;

const MAX_URL = 2048;

/** http(s), mailto: and tel: only — never javascript: or data: in a link target. */
const linkUrl = z
  .string()
  .trim()
  .max(MAX_URL)
  .refine((v) => /^(https?:\/\/|mailto:|tel:)/i.test(v), 'Must start with https://, mailto: or tel:');

/** Absolute https URL or a site-relative path (e.g. /linkpage/avatar.png). */
const imageUrl = z
  .string()
  .trim()
  .max(MAX_URL)
  .refine((v) => /^(https:\/\/|\/[^/])/i.test(v), 'Must be an https:// URL or a /path');

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a #RRGGBB colour');

const scheduleSchema = z.object({
  start: z.string().datetime({ offset: true }).nullable().default(null),
  end: z.string().datetime({ offset: true }).nullable().default(null),
});

const blockBase = {
  id: z.string().min(1).max(64),
  enabled: z.boolean().default(true),
  schedule: scheduleSchema.optional(),
  highlight: z.enum(HIGHLIGHTS).default('none'),
};

export const linkBlockSchema = z.object({
  ...blockBase,
  type: z.literal('link'),
  title: z.string().trim().min(1).max(120),
  url: linkUrl,
  thumbnailUrl: imageUrl.nullable().default(null),
  utm: z.boolean().default(true),
});

export const headerBlockSchema = z.object({
  ...blockBase,
  type: z.literal('header'),
  title: z.string().trim().min(1).max(120),
});

export const productBlockSchema = z.object({
  ...blockBase,
  type: z.literal('product'),
  /** Catalog product id from /api/products (e.g. ginger-fizz). */
  productId: z.string().min(1).max(120),
  /** Optional override for the product name shown on the card. */
  title: z.string().trim().max(120).default(''),
});

export const signupBlockSchema = z.object({
  ...blockBase,
  type: z.literal('signup'),
  headline: z.string().trim().min(1).max(120),
  subtext: z.string().trim().max(300).default(''),
  buttonText: z.string().trim().min(1).max(40),
});

export const socialCardBlockSchema = z.object({
  ...blockBase,
  type: z.literal('social-card'),
  network: z.enum(SOCIAL_TYPES),
  title: z.string().trim().min(1).max(120),
  handle: z.string().trim().max(80).default(''),
  url: linkUrl,
  imageUrl: imageUrl.nullable().default(null),
});

export const blockSchema = z.discriminatedUnion('type', [
  linkBlockSchema,
  headerBlockSchema,
  productBlockSchema,
  signupBlockSchema,
  socialCardBlockSchema,
]);

export const stickerSchema = z.object({
  id: z.string().min(1).max(64),
  imageUrl,
  /** 'header', 'socials', or a block id. The sticker is placed relative to that element. */
  anchor: z.string().min(1).max(64),
  /** Centre position as a fraction of the anchor's width / height. */
  x: z.number().min(-0.5).max(1.5),
  y: z.number().min(-3).max(4),
  rotation: z.number().min(-360).max(360).default(0),
  scale: z.number().min(0.2).max(4).default(1),
  zIndex: z.number().int().min(0).max(50).default(0),
});

export const socialSchema = z.object({
  type: z.enum(SOCIAL_TYPES),
  url: linkUrl,
});

export const themeSchema = z.object({
  background: z.object({
    type: z.enum(['color', 'gradient', 'image']).default('color'),
    color,
    color2: color.default('#ffffff'),
    imageUrl: imageUrl.nullable().default(null),
  }),
  buttonStyle: z.enum(['fill', 'outline', 'soft-shadow', 'hard-shadow']).default('fill'),
  buttonColor: color,
  buttonTextColor: color,
  corner: z.enum(['square', 'sm', 'md', 'pill']).default('sm'),
  font: z.enum(FONT_OPTIONS).default('Albert Sans'),
  textColor: color,
});

export const linkPageConfigSchema = z.object({
  version: z.literal(1).default(1),
  profile: z.object({
    name: z.string().trim().min(1).max(80),
    bio: z.string().max(400).default(''),
    avatarUrl: imageUrl.nullable().default(null),
  }),
  seo: z.object({
    title: z.string().trim().max(120).default(''),
    description: z.string().trim().max(300).default(''),
  }).default({ title: '', description: '' }),
  theme: themeSchema,
  socials: z.array(socialSchema).max(12).default([]),
  blocks: z.array(blockSchema).max(60).default([]),
  stickers: z.array(stickerSchema).max(30).default([]),
  showSubscribeButton: z.boolean().default(true),
  showShareButton: z.boolean().default(true),
});

export type LinkPageConfig = z.infer<typeof linkPageConfigSchema>;
export type LinkBlock = z.infer<typeof blockSchema>;
export type Sticker = z.infer<typeof stickerSchema>;
export type SocialType = (typeof SOCIAL_TYPES)[number];
export type LinkTheme = z.infer<typeof themeSchema>;

/** A block is live when enabled and `now` falls inside its (optional) schedule window. */
export function isBlockLive(block: LinkBlock, now: Date = new Date()): boolean {
  if (!block.enabled) return false;
  const start = block.schedule?.start ? Date.parse(block.schedule.start) : null;
  const end = block.schedule?.end ? Date.parse(block.schedule.end) : null;
  if (start !== null && now.getTime() < start) return false;
  if (end !== null && now.getTime() >= end) return false;
  return true;
}

/** Strip hidden/scheduled-out blocks and any stickers anchored to them. */
export function publicView(config: LinkPageConfig, now: Date = new Date()): LinkPageConfig {
  const blocks = config.blocks.filter((b) => isBlockLive(b, now));
  const liveIds = new Set(blocks.map((b) => b.id));
  const stickers = config.stickers.filter(
    (s) => s.anchor === 'header' || s.anchor === 'socials' || liveIds.has(s.anchor),
  );
  return { ...config, blocks, stickers };
}

const SHOP_HOST = /(^|\.)gingerbrosshop\.com$/i;

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'link';
}

/**
 * Tag links into our own shop with UTM params so link-in-bio traffic is
 * attributable in GA4. External links (Instagram, Grab, ...) are untouched, and
 * existing utm_* params on a URL are never overwritten.
 */
export function withUtm(url: string, campaign: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (!SHOP_HOST.test(parsed.hostname) || parsed.hostname.startsWith('link.')) return url;
  if (!parsed.searchParams.has('utm_source')) parsed.searchParams.set('utm_source', 'linkinbio');
  if (!parsed.searchParams.has('utm_medium')) parsed.searchParams.set('utm_medium', 'social');
  if (!parsed.searchParams.has('utm_campaign')) parsed.searchParams.set('utm_campaign', slugify(campaign));
  return parsed.toString();
}

/** The page as it was on linktr.ee/gingerbrosbrew (Sept 2026), used until the first save. */
export const DEFAULT_LINKPAGE_CONFIG: LinkPageConfig = {
  version: 1,
  profile: {
    name: 'GingerBros',
    bio: 'All new Ginger Fizz, with 3.5g of prebiotics!\n\nน้ำขิงซา พรีไบโอติก\n\n↓↓↓↓↓↓↓↓↓↓↓↓',
    avatarUrl: '/linkpage/avatar.png',
  },
  seo: {
    title: 'GingerBros — Links',
    description: 'All new Ginger Fizz, with 3.5g of prebiotics! Shop, LINE, Grab, Shopee, Instagram, TikTok and Facebook.',
  },
  theme: {
    background: { type: 'color', color: '#ffeee1', color2: '#ffffff', imageUrl: null },
    buttonStyle: 'fill',
    buttonColor: '#ffc294',
    buttonTextColor: '#000000',
    corner: 'sm',
    font: 'Albert Sans',
    textColor: '#000000',
  },
  socials: [
    { type: 'instagram', url: 'https://instagram.com/drinkgingerbros' },
    { type: 'facebook', url: 'https://www.facebook.com/profile.php?id=61573086524067' },
    { type: 'tiktok', url: 'https://tiktok.com/@gingerbrosbrew' },
  ],
  blocks: [
    {
      id: 'ig-card', type: 'social-card', enabled: true, highlight: 'none',
      network: 'instagram', title: 'GingerBros. Instagram', handle: 'drinkgingerbros',
      url: 'https://www.instagram.com/drinkgingerbros', imageUrl: '/linkpage/avatar.png',
    },
    {
      id: 'shop', type: 'link', enabled: true, highlight: 'none', utm: true,
      title: 'Shop - GingerBros', url: 'https://gingerbrosshop.com', thumbnailUrl: '/linkpage/thumb-shop.png',
    },
    {
      id: 'instagram', type: 'link', enabled: true, highlight: 'none', utm: true,
      title: 'Instagram', url: 'https://www.instagram.com/drinkgingerbros/', thumbnailUrl: null,
    },
    {
      id: 'line', type: 'link', enabled: true, highlight: 'none', utm: true,
      title: 'Line', url: 'https://lin.ee/qRnVI6E', thumbnailUrl: null,
    },
    {
      id: 'grab', type: 'link', enabled: true, highlight: 'none', utm: true,
      title: 'Grab',
      url: 'https://grab.onelink.me/2695613898?pid=inappsharing&c=3-c65znlddhav1we&is_retargeting=true&af_dp=grab%3a%2f%2fopen%3fscreentype%3dgrabfood%26sourceid%3da4pcqczks4%26merchantids%3d3-c65znlddhav1we&af_force_deeplink=true&af_web_dp=https%3a%2f%2fwww.grab.com%2fdownload',
      thumbnailUrl: '/linkpage/thumb-grab.png',
    },
    {
      id: 'shopee', type: 'link', enabled: true, highlight: 'none', utm: true,
      title: 'Shopee Thailand | Hot Deals, Best Prices', url: 'https://shopee.co.th/shop/433881332', thumbnailUrl: null,
    },
    {
      id: 'tiktok', type: 'link', enabled: true, highlight: 'none', utm: true,
      title: 'TikTok', url: 'https://www.tiktok.com/@gingerbrosbrew', thumbnailUrl: null,
    },
    {
      id: 'facebook', type: 'link', enabled: true, highlight: 'none', utm: true,
      title: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61573086524067', thumbnailUrl: null,
    },
    {
      id: 'feedback', type: 'link', enabled: true, highlight: 'none', utm: true,
      title: 'Feedback Form', url: 'https://forms.gle/poJgg69fbN9UJ8At5', thumbnailUrl: '/linkpage/thumb-feedback.png',
    },
  ],
  stickers: [
    { id: 'st-cat', imageUrl: '/stickers/cat.svg', anchor: 'header', x: 0.2, y: 0.22, rotation: 18.9, scale: 1.42, zIndex: 1 },
    { id: 'st-cursor', imageUrl: '/stickers/pointer.svg', anchor: 'socials', x: 0.19, y: 1.4, rotation: 0, scale: 1, zIndex: 0 },
    { id: 'st-shop', imageUrl: '/stickers/my-shop.svg', anchor: 'shop', x: 0.85, y: -0.06, rotation: 8.3, scale: 1.49, zIndex: 2 },
    { id: 'st-apple', imageUrl: '/stickers/apple.svg', anchor: 'grab', x: 0.26, y: 0.42, rotation: -9.3, scale: 0.75, zIndex: 3 },
  ],
  showSubscribeButton: true,
  showShareButton: true,
};

/** Built-in stickers offered in the CMS picker (all original artwork in /public/stickers). */
export const STARTER_STICKERS = [
  { name: 'Cat', url: '/stickers/cat.svg' },
  { name: 'Pointer', url: '/stickers/pointer.svg' },
  { name: 'My Shop!', url: '/stickers/my-shop.svg' },
  { name: 'Apple', url: '/stickers/apple.svg' },
  { name: 'Ginger', url: '/stickers/ginger.svg' },
  { name: 'Bottle', url: '/stickers/bottle.svg' },
  { name: 'New!', url: '/stickers/new.svg' },
  { name: 'Sparkle', url: '/stickers/sparkle.svg' },
] as const;
