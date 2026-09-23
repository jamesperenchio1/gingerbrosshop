import { describe, it, expect } from 'vitest';
import {
  DEFAULT_LINKPAGE_CONFIG,
  linkPageConfigSchema,
  isBlockLive,
  publicView,
  withUtm,
  notoSticker,
  fluentSticker,
  twemojiSticker,
  emojitwoSticker,
  stickerThumb,
  stickerSourceOf,
  parseFluentSticker,
  stickerCredits,
  type LinkBlock,
} from '../../api/_lib/linkpageSchema';

const link = (patch: Partial<Extract<LinkBlock, { type: 'link' }>> = {}): LinkBlock => ({
  id: 'x', type: 'link', enabled: true, highlight: 'none', title: 'X', url: 'https://example.com', thumbnailUrl: null, utm: true, ...patch,
});

describe('linkpage schema', () => {
  it('accepts the Linktree snapshot as a valid config', () => {
    expect(linkPageConfigSchema.safeParse(DEFAULT_LINKPAGE_CONFIG).success).toBe(true);
  });

  it('keeps the Linktree destinations (Shop first, no duplicate plain Instagram link)', () => {
    const urls = DEFAULT_LINKPAGE_CONFIG.blocks.map((b) => ('url' in b ? b.url : null));
    expect(urls).toEqual([
      'https://gingerbrosshop.com',
      'https://www.instagram.com/drinkgingerbros',
      'https://lin.ee/qRnVI6E',
      expect.stringContaining('https://grab.onelink.me/2695613898?'),
      'https://shopee.co.th/shop/433881332',
      'https://www.tiktok.com/@gingerbrosbrew',
      'https://www.facebook.com/profile.php?id=61573086524067',
      'https://forms.gle/poJgg69fbN9UJ8At5',
    ]);
  });

  it('rejects javascript: and data: link targets', () => {
    for (const url of ['javascript:alert(1)', 'data:text/html,hi']) {
      const cfg = { ...DEFAULT_LINKPAGE_CONFIG, blocks: [link({ url })] };
      expect(linkPageConfigSchema.safeParse(cfg).success).toBe(false);
    }
  });
});

describe('withUtm', () => {
  it('tags shop links', () => {
    const u = new URL(withUtm('https://gingerbrosshop.com/product/ginger-fizz', 'Shop - GingerBros'));
    expect(u.searchParams.get('utm_source')).toBe('linkinbio');
    expect(u.searchParams.get('utm_medium')).toBe('social');
    expect(u.searchParams.get('utm_campaign')).toBe('shop-gingerbros');
  });

  it('leaves external links and existing utm params alone', () => {
    expect(withUtm('https://www.instagram.com/drinkgingerbros/', 'IG')).toBe('https://www.instagram.com/drinkgingerbros/');
    const u = new URL(withUtm('https://gingerbrosshop.com/?utm_source=bottle', 'x'));
    expect(u.searchParams.get('utm_source')).toBe('bottle');
  });

  it('does not tag the link page itself', () => {
    expect(withUtm('https://link.gingerbrosshop.com/', 'x')).toBe('https://link.gingerbrosshop.com/');
  });
});

describe('scheduling', () => {
  const now = new Date('2026-09-24T12:00:00Z');

  it('hides disabled and out-of-window blocks', () => {
    expect(isBlockLive(link({ enabled: false }), now)).toBe(false);
    expect(isBlockLive(link({ schedule: { start: '2026-09-25T00:00:00Z', end: null } }), now)).toBe(false);
    expect(isBlockLive(link({ schedule: { start: null, end: '2026-09-24T11:59:00Z' } }), now)).toBe(false);
    expect(isBlockLive(link({ schedule: { start: '2026-09-01T00:00:00Z', end: '2026-10-01T00:00:00Z' } }), now)).toBe(true);
  });

  it('drops stickers anchored to hidden blocks', () => {
    const cfg = {
      ...DEFAULT_LINKPAGE_CONFIG,
      blocks: DEFAULT_LINKPAGE_CONFIG.blocks.map((b) => (b.id === 'shop' ? { ...b, enabled: false } : b)),
    };
    const view = publicView(cfg, now);
    expect(view.blocks.some((b) => b.id === 'shop')).toBe(false);
    expect(view.stickers.some((s) => s.anchor === 'shop')).toBe(false);
    expect(view.stickers.some((s) => s.anchor === 'header')).toBe(true);
  });
});

describe('sticker sources', () => {
  it('builds a URL per source', () => {
    expect(notoSticker('1f431')).toBe('https://fonts.gstatic.com/s/e/notoemoji/latest/1f431/lottie.json');
    expect(fluentSticker('Cat face', 'cat_face', '3d')).toBe(
      'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Cat%20face/3D/cat_face_3d.png',
    );
    expect(fluentSticker('Cat face', 'cat_face', 'flat')).toBe(
      'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Cat%20face/Flat/cat_face_flat.svg',
    );
    expect(twemojiSticker('1f431')).toBe('https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/1f431.svg');
    expect(emojitwoSticker('1f431')).toBe('https://cdn.jsdelivr.net/gh/EmojiTwo/emojitwo@master/svg/1f431.svg');
  });

  it('identifies the source of a URL', () => {
    expect(stickerSourceOf(notoSticker('1f431'))).toBe('noto');
    expect(stickerSourceOf(fluentSticker('Cat face', 'cat_face', '3d'))).toBe('fluent');
    expect(stickerSourceOf(twemojiSticker('1f431'))).toBe('twemoji');
    expect(stickerSourceOf(emojitwoSticker('1f431'))).toBe('emojitwo');
    expect(stickerSourceOf('https://example.com/x.png')).toBe(null);
  });

  it('maps a Noto sticker to its static SVG thumbnail', () => {
    expect(stickerThumb(notoSticker('1f431'))).toBe('https://fonts.gstatic.com/s/e/notoemoji/latest/1f431/emoji.svg');
    expect(stickerThumb(twemojiSticker('1f431'))).toBe(twemojiSticker('1f431'));
    expect(stickerThumb(fluentSticker('Cat face', 'cat_face', '3d'))).toBe(fluentSticker('Cat face', 'cat_face', '3d'));
  });

  it('round-trips a Fluent URL back to its parts', () => {
    const url = fluentSticker('Cat face', 'cat_face', 'color');
    expect(parseFluentSticker(url)).toEqual({ name: 'Cat face', snake: 'cat_face', style: 'color' });
    expect(parseFluentSticker(notoSticker('1f431'))).toBe(null);
    expect(parseFluentSticker(twemojiSticker('1f431'))).toBe(null);
  });

  it('returns only the credits the licences require, deduped', () => {
    const credits = stickerCredits([
      notoSticker('1f431'),
      notoSticker('1f446'),
      twemojiSticker('1f431'),
      fluentSticker('Cat face', 'cat_face', '3d'),
      emojitwoSticker('1f431'),
    ]);
    expect(credits.map((c) => c.key)).toEqual(['noto', 'twemoji', 'emojitwo']);
    expect(credits.every((c) => c.href.startsWith('https://'))).toBe(true);
    expect(credits.some((c) => c.key === 'fluent')).toBe(false);
  });

  it('returns no credits when no attribution-required sticker is present', () => {
    expect(stickerCredits([fluentSticker('Cat face', 'cat_face', '3d'), 'https://example.com/x.png'])).toEqual([]);
  });
});
