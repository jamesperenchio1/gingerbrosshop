// Builds the white die-cut border for an animated sticker as a *second animation*.
//
// A CSS/SVG filter over a playing animation re-rasters every frame and tanks the frame
// rate, and a static silhouette can't follow the movement. Instead we take the sticker's
// own Lottie data and recolour it: every fill becomes white and every shape group gets a
// thick white round-joined stroke, which grows the artwork outwards by half the stroke
// width. Played in lock-step behind the real animation it is an outline that moves with it,
// rendered by the same cheap SVG path as the animation itself.

type Json = Record<string, unknown>;

const WHITE = { a: 0, k: [1, 1, 1, 1] };
const FULL = { a: 0, k: 100 };

/** Lottie value (static or keyframed) with `extra` added to every number it holds. */
function widen(prop: unknown, extra: number): unknown {
  const p = prop as { a?: number; k?: unknown } | undefined;
  if (!p || typeof p !== 'object') return { a: 0, k: extra };
  if (p.a === 1 && Array.isArray(p.k)) {
    const k = (p.k as Json[]).map((frame) => {
      const bump = (v: unknown) => (Array.isArray(v) ? v.map((n) => (typeof n === 'number' ? n + extra : n)) : v);
      return { ...frame, s: bump(frame.s), e: bump(frame.e) };
    });
    return { ...p, k };
  }
  return { ...p, k: typeof p.k === 'number' ? p.k + extra : extra };
}

function outlineStroke(width: number): Json {
  return { ty: 'st', nm: 'outline', c: WHITE, o: FULL, w: { a: 0, k: width }, lc: 2, lj: 2, bm: 0 };
}

function whiten(items: Json[], width: number): Json[] {
  const out: Json[] = [];
  for (const item of items) {
    if (item.ty === 'gf') {
      out.push({ ty: 'fl', nm: 'outline-fill', c: WHITE, o: FULL, r: item.r ?? 1, bm: 0 });
    } else if (item.ty === 'fl') {
      out.push({ ...item, c: WHITE, o: FULL });
    } else if (item.ty === 'gs' || item.ty === 'st') {
      out.push({ ...item, ty: 'st', c: WHITE, o: FULL, w: widen(item.w, width), lc: 2, lj: 2 });
    } else if (item.ty === 'gr' && Array.isArray(item.it)) {
      const inner = whiten(item.it as Json[], width);
      const hasTransform = inner.length > 0 && inner[inner.length - 1].ty === 'tr';
      // Strokes sit just before the group's transform, which must stay last.
      inner.splice(hasTransform ? inner.length - 1 : inner.length, 0, outlineStroke(width));
      out.push({ ...item, it: inner });
    } else {
      out.push(item);
    }
  }
  return out;
}

function whitenLayers(layers: unknown, width: number): Json[] {
  if (!Array.isArray(layers)) return [];
  return (layers as Json[]).map((layer) => (Array.isArray(layer.shapes) ? { ...layer, shapes: whiten(layer.shapes as Json[], width) } : layer));
}

/**
 * @param data     a Lottie animation (not mutated)
 * @param borderPx border thickness in rendered pixels
 * @param renderPx rendered size of the sticker in pixels (to convert px → Lottie units)
 */
export function buildOutlineAnimation(data: Json, borderPx: number, renderPx: number): Json {
  const canvas = typeof data.w === 'number' ? data.w : 512;
  // Strokes are centred on the path, so the border grows outwards by half the stroke width.
  const width = 2 * borderPx * (canvas / Math.max(1, renderPx));
  const assets = Array.isArray(data.assets)
    ? (data.assets as Json[]).map((a) => (Array.isArray(a.layers) ? { ...a, layers: whitenLayers(a.layers, width) } : a))
    : data.assets;
  return { ...data, assets, layers: whitenLayers(data.layers, width) };
}
