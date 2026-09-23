import { useEffect, useRef, useState } from 'react';

/** Landing page for the emailed login link: trades the one-time token for a session cookie. */
export default function AdminLogin() {
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // StrictMode double-run would burn the single-use token
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') ?? '';
    const nextParam = params.get('next') ?? '';
    const next = /^\/admin\/[\w/-]*$/.test(nextParam) ? nextParam : '/admin/links';
    // Drop the token from the address bar and history straight away.
    window.history.replaceState(null, '', '/admin/login');

    fetch('/api/auth?action=verify', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        if (r.ok) {
          window.location.replace(next);
          return;
        }
        const data = (await r.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'Login failed.');
      })
      .catch(() => setError('Network error. Try the link again.'));
  }, []);

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-6 text-center">
      {error ? (
        <div className="max-w-sm">
          <h1 className="font-display text-2xl text-deep-brown">Couldn't log you in</h1>
          <p className="font-body text-earth text-sm mt-2">{error}</p>
          <a href="/admin/links" className="inline-block mt-6 font-body text-sm text-deep-brown underline">
            Request a new link
          </a>
        </div>
      ) : (
        <div>
          <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin mx-auto" />
          <p className="font-body text-earth text-sm mt-4">Logging you in…</p>
        </div>
      )}
    </div>
  );
}
