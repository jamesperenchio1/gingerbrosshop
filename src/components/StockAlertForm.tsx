import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  productId: string;
  className?: string;
}

export default function StockAlertForm({ productId, className = '' }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stock-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to subscribe');
      setSubmitted(true);
      toast.success("We'll email you when it's back in stock!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <p className={`text-sm text-green-ink font-medium ${className}`}>
        ✓ We'll notify you when it's back!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <label htmlFor={`stock-alert-email-${productId}`} className="sr-only">Email address</label>
      <input
        id={`stock-alert-email-${productId}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 min-w-0 px-3 py-2 text-sm border border-deep-brown/20 rounded-full bg-warm-white text-deep-brown placeholder:text-earth/40 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 text-sm font-semibold rounded-full bg-deep-brown text-cream hover:bg-earth transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        {loading ? '…' : 'Notify me'}
      </button>
    </form>
  );
}
