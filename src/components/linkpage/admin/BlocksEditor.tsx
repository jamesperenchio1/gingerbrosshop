import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, Trash2, Copy, Link2, Heading, ShoppingBag, Mail, AtSign, Plus, Clock } from 'lucide-react';
import type { CatalogProduct } from '@/lib/catalog';
import { HIGHLIGHTS, SOCIAL_LABELS, SOCIAL_TYPES, isBlockLive, type LinkBlock } from '@/lib/linkpage';
import { Field, ImageField, Segmented, TextField, Toggle, inputClass } from './fields';
import { newId } from './api';

const TYPE_META: Record<LinkBlock['type'], { label: string; icon: typeof Link2 }> = {
  link: { label: 'Link', icon: Link2 },
  header: { label: 'Header', icon: Heading },
  product: { label: 'Product', icon: ShoppingBag },
  signup: { label: 'Email signup', icon: Mail },
  'social-card': { label: 'Social card', icon: AtSign },
};

function newBlock(type: LinkBlock['type'], products: CatalogProduct[]): LinkBlock {
  const base = { id: newId(type === 'social-card' ? 'card' : type), enabled: true, highlight: 'none' as const };
  switch (type) {
    case 'link':
      return { ...base, type, title: 'New link', url: 'https://', thumbnailUrl: null, utm: true };
    case 'header':
      return { ...base, type, title: 'Section title' };
    case 'product':
      return { ...base, type, productId: products[0]?.id ?? 'ginger-fizz', title: '' };
    case 'signup':
      return { ...base, type, headline: 'Get 10% off your first order', subtext: 'Join the GingerBros list for drops and deals.', buttonText: 'Join' };
    case 'social-card':
      return { ...base, type, network: 'instagram', title: 'Follow us', handle: '', url: 'https://', imageUrl: null };
  }
}

function blockLabel(b: LinkBlock): string {
  if (b.type === 'signup') return b.headline;
  if (b.type === 'product') return b.title || b.productId;
  return b.title;
}

/** ISO → value for <input type="datetime-local"> in the admin's local time. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(v: string): string | null {
  return v ? new Date(v).toISOString() : null;
}

export default function BlocksEditor({
  blocks,
  onChange,
  products,
}: {
  blocks: LinkBlock[];
  onChange: (blocks: LinkBlock[]) => void;
  products: CatalogProduct[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const update = (id: string, patch: Partial<LinkBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as LinkBlock) : b)));

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = blocks.findIndex((b) => b.id === e.active.id);
    const to = blocks.findIndex((b) => b.id === e.over!.id);
    onChange(arrayMove(blocks, from, to));
  };

  const add = (type: LinkBlock['type']) => {
    const block = newBlock(type, products);
    onChange([block, ...blocks]);
    setOpenId(block.id);
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-deep-brown text-cream font-body font-semibold text-[15px] hover:bg-earth transition-colors"
        >
          <Plus className="w-5 h-5" /> Add
        </button>
        {adding && (
          <div className="absolute z-20 left-0 right-0 mt-2 bg-white rounded-xl border border-soft-peach shadow-panel p-2 grid grid-cols-2 gap-1">
            {(Object.keys(TYPE_META) as LinkBlock['type'][]).map((t) => {
              const Icon = TYPE_META[t].icon;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => add(t)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-cream font-body text-[14px] text-deep-brown text-left"
                >
                  <Icon className="w-4 h-4 text-earth" /> {TYPE_META[t].label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((b) => (
            <SortableRow
              key={b.id}
              block={b}
              open={openId === b.id}
              onToggleOpen={() => setOpenId(openId === b.id ? null : b.id)}
              onUpdate={(patch) => update(b.id, patch)}
              onDelete={() => {
                if (confirm(`Delete "${blockLabel(b)}"?`)) onChange(blocks.filter((x) => x.id !== b.id));
              }}
              onDuplicate={() => {
                const i = blocks.findIndex((x) => x.id === b.id);
                const copy = { ...b, id: newId(b.type) } as LinkBlock;
                onChange([...blocks.slice(0, i + 1), copy, ...blocks.slice(i + 1)]);
              }}
              products={products}
             
            />
          ))}
        </SortableContext>
      </DndContext>
      {blocks.length === 0 && <p className="font-body text-[14px] text-earth text-center py-6">No links yet. Tap Add to create one.</p>}
    </div>
  );
}

function SortableRow({
  block,
  open,
  onToggleOpen,
  onUpdate,
  onDelete,
  onDuplicate,
  products,
}: {
  block: LinkBlock;
  open: boolean;
  onToggleOpen: () => void;
  onUpdate: (patch: Partial<LinkBlock>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  products: CatalogProduct[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const Icon = TYPE_META[block.type].icon;
  const scheduled = !!(block.schedule?.start || block.schedule?.end);
  const liveNow = isBlockLive(block);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-white rounded-xl border border-soft-peach ${isDragging ? 'shadow-panel relative z-10' : ''}`}
    >
      <div className="flex items-center gap-2 p-2 pr-3">
        <button type="button" {...attributes} {...listeners} aria-label="Drag to reorder" className="p-2 text-earth/70 hover:text-deep-brown cursor-grab touch-none">
          <GripVertical className="w-4 h-4" />
        </button>
        <Icon className="w-4 h-4 text-earth shrink-0" />
        <button type="button" onClick={onToggleOpen} className="flex-1 min-w-0 text-left">
          <span className={`block font-body text-[14px] font-medium truncate ${block.enabled ? 'text-deep-brown' : 'text-earth/60 line-through'}`}>
            {blockLabel(block)}
          </span>
          {scheduled && (
            <span className={`flex items-center gap-1 font-body text-[11px] ${liveNow ? 'text-green-ink' : 'text-amber-ink'}`}>
              <Clock className="w-3 h-3" /> {liveNow ? 'Scheduled · showing now' : 'Scheduled · hidden now'}
            </span>
          )}
        </button>
        <Toggle label="" checked={block.enabled} onChange={(enabled) => onUpdate({ enabled })} />
        <button type="button" onClick={onToggleOpen} aria-label={open ? 'Collapse' : 'Edit'} className="p-1 text-earth">
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="border-t border-soft-peach p-4 space-y-4">
          <BlockFields block={block} onUpdate={onUpdate} products={products} />

          {block.type !== 'header' && (
            <Segmented
              label="Highlight"
              value={block.highlight}
              options={HIGHLIGHTS.map((h) => ({ value: h, label: h === 'none' ? 'None' : h[0].toUpperCase() + h.slice(1) }))}
              onChange={(highlight) => onUpdate({ highlight })}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Show from" hint="Optional">
              <input
                type="datetime-local"
                value={toLocalInput(block.schedule?.start)}
                onChange={(e) => onUpdate({ schedule: { start: fromLocalInput(e.target.value), end: block.schedule?.end ?? null } })}
                className={inputClass}
              />
            </Field>
            <Field label="Hide after" hint="Optional">
              <input
                type="datetime-local"
                value={toLocalInput(block.schedule?.end)}
                onChange={(e) => onUpdate({ schedule: { start: block.schedule?.start ?? null, end: fromLocalInput(e.target.value) } })}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onDuplicate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-[13px] text-earth hover:bg-cream">
              <Copy className="w-4 h-4" /> Duplicate
            </button>
            <button type="button" onClick={onDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-[13px] text-rust hover:bg-rust/10">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BlockFields({
  block,
  onUpdate,
  products,
}: {
  block: LinkBlock;
  onUpdate: (patch: Partial<LinkBlock>) => void;
  products: CatalogProduct[];
}) {
  switch (block.type) {
    case 'link':
      return (
        <>
          <TextField label="Title" value={block.title} onChange={(title) => onUpdate({ title })} />
          <TextField label="URL" value={block.url} onChange={(url) => onUpdate({ url })} placeholder="https://" />
          <ImageField label="Thumbnail" value={block.thumbnailUrl} onChange={(thumbnailUrl) => onUpdate({ thumbnailUrl })} maxSize={192} />
          <Toggle label="Add UTM tags (gingerbrosshop.com links only)" checked={block.utm} onChange={(utm) => onUpdate({ utm })} />
        </>
      );
    case 'header':
      return <TextField label="Title" value={block.title} onChange={(title) => onUpdate({ title })} />;
    case 'product':
      return (
        <>
          <Field label="Product">
            <select value={block.productId} onChange={(e) => onUpdate({ productId: e.target.value })} className={inputClass}>
              {!products.some((p) => p.id === block.productId) && <option value={block.productId}>{block.productId}</option>}
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <TextField label="Title override" value={block.title} onChange={(title) => onUpdate({ title })} placeholder="Uses the product name" />
        </>
      );
    case 'signup':
      return (
        <>
          <TextField label="Headline" value={block.headline} onChange={(headline) => onUpdate({ headline })} />
          <TextField label="Subtext" value={block.subtext} onChange={(subtext) => onUpdate({ subtext })} />
          <TextField label="Button text" value={block.buttonText} onChange={(buttonText) => onUpdate({ buttonText })} />
          <p className="font-body text-[12px] text-earth">Signups get the GingerBros welcome email with a discount code, and show up in the Signups tab.</p>
        </>
      );
    case 'social-card':
      return (
        <>
          <Field label="Network">
            <select value={block.network} onChange={(e) => onUpdate({ network: e.target.value as typeof block.network })} className={inputClass}>
              {SOCIAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SOCIAL_LABELS[t]}
                </option>
              ))}
            </select>
          </Field>
          <TextField label="Title" value={block.title} onChange={(title) => onUpdate({ title })} />
          <TextField label="Handle" value={block.handle} onChange={(handle) => onUpdate({ handle: handle.replace(/^@/, '') })} placeholder="drinkgingerbros" />
          <TextField label="URL" value={block.url} onChange={(url) => onUpdate({ url })} />
          <ImageField label="Image" value={block.imageUrl} onChange={(imageUrl) => onUpdate({ imageUrl })} maxSize={192} round />
        </>
      );
  }
}
