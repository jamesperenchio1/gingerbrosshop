import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/** Small "copy this text to clipboard" button — e.g. order numbers. */
export default function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // ignore — clipboard access can be denied/unavailable
        }
      }}
      aria-label={`Copy ${label}`}
      className={`inline-flex items-center gap-1 font-body font-medium text-[12px] transition-colors ${
        copied ? 'text-accent-green' : 'text-rust hover:text-deep-brown'
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  );
}
