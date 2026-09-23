import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Lock, MailCheck } from 'lucide-react';

type Session = { state: 'loading' } | { state: 'out' } | { state: 'in'; email: string };

/**
 * Wraps an admin page: shows a passwordless email login until the browser has a
 * valid admin session cookie, then renders `children` with the signed-in email
 * and a logout callback.
 */
export default function AdminGate({
  title,
  children,
}: {
  title: string;
  children: (session: { email: string; logout: () => void }) => ReactNode;
}) {
  const [session, setSession] = useState<Session>({ state: 'loading' });

  useEffect(() => {
    fetch('/api/auth?action=me', { credentials: 'same-origin' })
      .then(async (r) => (r.ok ? setSession({ state: 'in', email: ((await r.json()) as { email: string }).email }) : setSession({ state: 'out' })))
      .catch(() => setSession({ state: 'out' }));
  }, []);

  const logout = useCallback(() => {
    fetch('/api/auth?action=logout', { method: 'POST', credentials: 'same-origin' }).finally(() => setSession({ state: 'out' }));
  }, []);

  if (session.state === 'loading') {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
      </div>
    );
  }
  if (session.state === 'out') return <AdminLogin title={title} />;
  return <>{children({ email: session.email, logout })}</>;
}

function AdminLogin({ title }: { title: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/auth?action=request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, next: window.location.pathname }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      setMessage(data.message ?? 'Check your email.');
      setStatus('sent');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {status === 'sent' ? (
          <>
            <MailCheck className="w-10 h-10 text-deep-brown mx-auto mb-3" />
            <h1 className="font-display text-2xl text-deep-brown">Check your email</h1>
            <p className="font-body text-earth text-sm mt-2">{message}</p>
            <p className="font-body text-earth/80 text-xs mt-4">Open the link on this device. You'll stay logged in for 30 days.</p>
            <button type="button" onClick={() => setStatus('idle')} className="mt-6 font-body text-sm text-deep-brown underline">
              Use a different email
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <Lock className="w-10 h-10 text-deep-brown mx-auto mb-3" />
            <h1 className="font-display text-2xl text-deep-brown">{title}</h1>
            <p className="font-body text-earth text-sm mb-6">Enter your email and we'll send you a login link.</p>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-cream border border-soft-peach rounded-xl px-4 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-3 w-full bg-deep-brown text-cream font-body font-semibold rounded-xl px-4 py-3 hover:bg-earth transition-colors disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Email me a login link'}
            </button>
            {status === 'error' && <p className="mt-3 font-body text-[13px] text-rust">{message}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
