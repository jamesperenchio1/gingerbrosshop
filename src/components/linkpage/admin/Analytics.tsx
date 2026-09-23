import { useEffect, useMemo, useState } from 'react';
import type { LinkBlock } from '@/lib/linkpage';
import { adminApi } from './api';

interface AnalyticsData {
  days: { day: string; views: number; clicks: number; qr: number }[];
  totals: { views: number; clicks: number; qr: number };
  clicksByBlock: Record<string, number>;
  countries: Record<string, number>;
  devices: Record<string, number>;
  referrers: Record<string, number>;
}

// Validated categorical pair (dataviz validator, light, on #FDF8F0): views, clicks.
const VIEWS = '#B8741A';
const CLICKS = '#2F73A8';
const RANGES = [7, 30, 90] as const;

const regionNames = typeof Intl !== 'undefined' && 'DisplayNames' in Intl ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
function countryName(cc: string): string {
  if (cc === 'XX') return 'Unknown';
  try {
    return regionNames?.of(cc) ?? cc;
  } catch {
    return cc;
  }
}

function blockName(id: string, blocks: LinkBlock[]): string {
  if (id.startsWith('social-')) return `${id.slice(7)} icon`;
  const b = blocks.find((x) => x.id === id);
  if (!b) return `${id} (removed)`;
  return b.type === 'signup' ? b.headline : b.type === 'product' ? b.title || b.productId : b.title;
}

export default function Analytics({ token, blocks }: { token: string; blocks: LinkBlock[] }) {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi<AnalyticsData>(token, { query: `view=analytics&days=${days}` })
      .then((d) => {
        setData(d);
        setError('');
      })
      .catch((e: Error) => setError(e.message));
  }, [token, days]);

  const ctr = data && data.totals.views > 0 ? (data.totals.clicks / data.totals.views) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setDays(r)}
            className={`px-3 py-1.5 rounded-lg font-body text-[13px] border ${
              days === r ? 'bg-deep-brown text-cream border-deep-brown' : 'bg-white text-deep-brown border-soft-peach'
            }`}
          >
            {r} days
          </button>
        ))}
      </div>

      {error && <p className="font-body text-[13px] text-rust">{error}</p>}
      {!data && !error && <p className="font-body text-[13px] text-earth">Loading…</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Views" value={data.totals.views.toLocaleString()} />
            <Stat label="Clicks" value={data.totals.clicks.toLocaleString()} />
            <Stat label="Click rate" value={`${ctr.toFixed(1)}%`} />
            <Stat label="QR scans" value={data.totals.qr.toLocaleString()} />
          </div>

          <section className="bg-white rounded-xl border border-soft-peach p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-[18px] text-deep-brown">Views and clicks per day</h3>
              <div className="flex gap-3 font-body text-[12px] text-earth">
                <LegendKey color={VIEWS} label="Views" />
                <LegendKey color={CLICKS} label="Clicks" />
              </div>
            </div>
            <DailyChart days={data.days} />
          </section>

          <section className="bg-white rounded-xl border border-soft-peach p-4">
            <h3 className="font-display text-[18px] text-deep-brown mb-3">Clicks by link</h3>
            <BarList
              rows={Object.entries(data.clicksByBlock).map(([id, n]) => ({
                label: blockName(id, blocks),
                value: n,
                note: data.totals.views > 0 ? `${((n / data.totals.views) * 100).toFixed(1)}% CTR` : undefined,
              }))}
              color={CLICKS}
              empty="No clicks yet."
            />
          </section>

          <div className="grid sm:grid-cols-3 gap-4">
            <section className="bg-white rounded-xl border border-soft-peach p-4">
              <h3 className="font-display text-[16px] text-deep-brown mb-3">Where from</h3>
              <BarList rows={Object.entries(data.referrers).map(([k, v]) => ({ label: k, value: v }))} color={VIEWS} empty="No visits yet." />
            </section>
            <section className="bg-white rounded-xl border border-soft-peach p-4">
              <h3 className="font-display text-[16px] text-deep-brown mb-3">Countries</h3>
              <BarList rows={Object.entries(data.countries).map(([k, v]) => ({ label: countryName(k), value: v }))} color={VIEWS} empty="No visits yet." />
            </section>
            <section className="bg-white rounded-xl border border-soft-peach p-4">
              <h3 className="font-display text-[16px] text-deep-brown mb-3">Devices</h3>
              <BarList rows={Object.entries(data.devices).map(([k, v]) => ({ label: k, value: v }))} color={VIEWS} empty="No visits yet." />
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-soft-peach p-4">
      <p className="font-body text-[12px] font-semibold uppercase tracking-wide text-earth">{label}</p>
      <p className="font-display text-[28px] text-deep-brown tabular-nums mt-1">{value}</p>
    </div>
  );
}

function LegendKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-3 h-[2px] rounded" style={{ background: color }} />
      {label}
    </span>
  );
}

/** Ranked horizontal bars; the label and number are text-coloured, the bar carries the hue. */
function BarList({ rows, color, empty }: { rows: { label: string; value: number; note?: string }[]; color: string; empty: string }) {
  const sorted = [...rows].sort((a, b) => b.value - a.value).slice(0, 10);
  const max = Math.max(1, ...sorted.map((r) => r.value));
  if (sorted.length === 0) return <p className="font-body text-[13px] text-earth">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {sorted.map((r) => (
        <li key={r.label} title={`${r.label}: ${r.value.toLocaleString()}`}>
          <div className="flex items-baseline justify-between gap-2 font-body text-[13px]">
            <span className="text-deep-brown truncate capitalize">{r.label}</span>
            <span className="text-deep-brown tabular-nums shrink-0">
              {r.value.toLocaleString()}
              {r.note && <span className="text-earth ml-1.5">{r.note}</span>}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-cream">
            <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DailyChart({ days }: { days: AnalyticsData['days'] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 200;
  const pad = { l: 36, r: 12, t: 12, b: 24 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const max = Math.max(4, ...days.map((d) => Math.max(d.views, d.clicks)));
  const niceMax = Math.ceil(max / 4) * 4;
  const x = (i: number) => pad.l + (days.length <= 1 ? iw / 2 : (i / (days.length - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / niceMax) * ih;
  const path = (key: 'views' | 'clicks') => days.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join('');
  const ticks = [0, niceMax / 4, niceMax / 2, (niceMax * 3) / 4, niceMax];
  const labelEvery = Math.ceil(days.length / 6);
  const fmt = (day: string) => new Date(`${day}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const h = hover !== null ? days[hover] : null;

  const summary = useMemo(() => days.map((d) => `${d.day}: ${d.views} views, ${d.clicks} clicks`).join('; '), [days]);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Daily views and clicks. ${summary}`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((px - pad.l) / iw) * (days.length - 1));
          setHover(Math.max(0, Math.min(days.length - 1, i)));
        }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#3D2410" strokeOpacity={t === 0 ? 0.25 : 0.08} />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#5C3D1E" fillOpacity="0.8">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {days.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={d.day} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="#5C3D1E" fillOpacity="0.8">
              {fmt(d.day)}
            </text>
          ) : null,
        )}
        <path d={path('views')} fill="none" stroke={VIEWS} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={path('clicks')} fill="none" stroke={CLICKS} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && h && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="#3D2410" strokeOpacity="0.3" />
            <circle cx={x(hover)} cy={y(h.views)} r="4.5" fill={VIEWS} stroke="#fff" strokeWidth="2" />
            <circle cx={x(hover)} cy={y(h.clicks)} r="4.5" fill={CLICKS} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover !== null && h && (
        <div
          className="absolute top-0 pointer-events-none bg-white border border-soft-peach rounded-lg shadow-card px-3 py-2 font-body text-[12px] text-deep-brown"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > days.length / 2 ? '-105%' : '5%'})` }}
        >
          <p className="font-semibold mb-1">{fmt(h.day)}</p>
          <p className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: VIEWS }} /> Views <span className="ml-auto pl-3 tabular-nums">{h.views}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: CLICKS }} /> Clicks <span className="ml-auto pl-3 tabular-nums">{h.clicks}</span>
          </p>
          {h.qr > 0 && <p className="text-earth mt-0.5">QR scans {h.qr}</p>}
        </div>
      )}
    </div>
  );
}
