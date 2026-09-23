import { useRef, useState, type ReactNode } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadImage } from './api';

export const inputClass =
  'w-full bg-white border border-soft-peach rounded-lg px-3 py-2 font-body text-[14px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30';

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block font-body text-[12px] font-semibold uppercase tracking-wide text-earth mb-1">{label}</span>
      {children}
      {hint && <span className="block font-body text-[12px] text-earth/80 mt-1">{hint}</span>}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className={inputClass} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
      )}
    </Field>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  // Local text lets the hex box hold partial input ("#ff") without clobbering the colour.
  const [text, setText] = useState(value);
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setText(e.target.value);
          }}
          className="w-10 h-10 rounded-lg border border-soft-peach bg-white cursor-pointer p-1"
        />
        <input
          value={/^#[0-9a-f]{6}$/i.test(text) && text.toLowerCase() !== value.toLowerCase() ? value : text}
          onChange={(e) => {
            setText(e.target.value);
            if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onChange(e.target.value.toLowerCase());
          }}
          className={`${inputClass} font-mono`}
        />
      </div>
    </Field>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-accent-green' : 'bg-earth/30'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </button>
      <span className="font-body text-[14px] text-deep-brown">{label}</span>
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 rounded-lg font-body text-[13px] border transition-colors ${
              value === o.value ? 'bg-deep-brown text-cream border-deep-brown' : 'bg-white text-deep-brown border-soft-peach hover:border-earth'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

/** Image picker: shows the current image, uploads a new one to Blob, or clears it. */
export function ImageField({
  label,
  value,
  onChange,
  token,
  maxSize,
  round,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  token: string;
  maxSize?: number;
  round?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await uploadImage(token, file, maxSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <div className={`w-14 h-14 bg-cream border border-soft-peach overflow-hidden shrink-0 ${round ? 'rounded-full' : 'rounded-lg'}`}>
          {value && <img src={value} alt="" className="w-full h-full object-cover" />}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-soft-peach font-body text-[13px] text-deep-brown hover:border-earth disabled:opacity-50"
        >
          <Upload className="w-4 h-4" /> {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="p-2 text-earth hover:text-rust" aria-label="Remove image">
            <X className="w-4 h-4" />
          </button>
        )}
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {error && <span className="block font-body text-[12px] text-rust mt-1">{error}</span>}
    </Field>
  );
}
