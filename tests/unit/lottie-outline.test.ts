import { describe, expect, it } from 'vitest';
import { buildOutlineAnimation } from '../../src/lib/lottieOutline';

interface Item { ty: string; nm?: string; c?: { k: number[] }; o?: { k: number }; w?: { k: number } }
interface Out {
  assets: { layers: { shapes: { it: Item[] }[] }[] }[];
  layers: ({ shapes: { it: Item[] }[] } | { ty: number })[];
}
const run = (data: object): Out => buildOutlineAnimation(data as Record<string, unknown>, 2, 64) as unknown as Out;
const first = (o: Out) => (o.layers[0] as { shapes: { it: Item[] }[] }).shapes[0].it;

const sample = () => ({
  w: 1024,
  h: 1024,
  assets: [{ id: 'c', layers: [{ ty: 4, shapes: [{ ty: 'gr', it: [{ ty: 'sh' }, { ty: 'gf' }, { ty: 'tr' }] }] }] }],
  layers: [
    { ty: 4, shapes: [{ ty: 'gr', it: [{ ty: 'sh' }, { ty: 'fl', c: { a: 0, k: [1, 0, 0, 1] }, o: { a: 0, k: 40 } }, { ty: 'st', w: { a: 0, k: 10 } }, { ty: 'tr' }] }] },
    { ty: 3 },
  ],
});

describe('buildOutlineAnimation', () => {
  it('recolours fills white at full opacity and adds a stroke before each group transform', () => {
    const items = first(run(sample()));
    expect(items.map((i) => i.ty)).toEqual(['sh', 'fl', 'st', 'st', 'tr']);
    expect(items[1].c?.k).toEqual([1, 1, 1, 1]);
    expect(items[1].o?.k).toBe(100);
    expect(items[3].nm).toBe('outline');
  });

  it('converts border pixels into Lottie units and widens existing strokes', () => {
    const items = first(run(sample()));
    const width = 2 * 2 * (1024 / 64); // 64
    expect(items[3].w?.k).toBe(width);
    expect(items[2].w?.k).toBe(10 + width);
  });

  it('turns gradient fills solid and handles precomp assets', () => {
    const out = run(sample());
    expect(out.assets[0].layers[0].shapes[0].it.map((i) => i.ty)).toEqual(['sh', 'fl', 'st', 'tr']);
  });

  it('does not mutate the input and leaves non-shape layers alone', () => {
    const input = sample();
    const before = JSON.stringify(input);
    const out = run(input);
    expect(JSON.stringify(input)).toBe(before);
    expect(out.layers[1]).toEqual({ ty: 3 });
  });
});
