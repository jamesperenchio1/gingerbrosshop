import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    // Show the success state immediately; confirm the subscription in the background
    // so the button feels instant.
    setSubscribed(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setSubscribed(false);
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-cream py-16">
      <div className="max-w-[600px] mx-auto px-6 text-center">
        <Mail className="w-8 h-8 text-rust mx-auto mb-4" />
        <h2 className="font-display font-bold text-deep-brown text-2xl mb-2">Join the Brew Crew</h2>
        <p className="font-body text-earth mb-6">
          Get exclusive offers, new flavor announcements, and ginger fizz tips delivered to your inbox.
        </p>
        {subscribed ? (
          <div className="flex items-center justify-center gap-2 text-accent-green">
            <CheckCircle className="w-5 h-5" />
            <span className="font-body font-medium">You are subscribed! Welcome aboard.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 bg-warm-white border border-soft-peach rounded-full px-5 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-deep-brown text-cream font-body font-medium px-6 py-3 rounded-full hover:bg-rust transition-colors disabled:opacity-60"
            >
              {loading ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}
        {error && (
          <div className="flex items-center justify-center gap-2 text-rust mt-4">
            <AlertCircle className="w-4 h-4" />
            <span className="font-body text-sm">{error}</span>
          </div>
        )}
      </div>
    </section>
  );
}
