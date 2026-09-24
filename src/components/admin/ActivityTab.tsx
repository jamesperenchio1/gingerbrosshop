import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminApi, baht, type AdminAction } from './api';

export default function ActivityTab() {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi<{ actions: AdminAction[] }>({ resource: 'activity', query: { limit: 200 } });
      setActions(data.actions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-earth text-sm">
          Every mutating admin action is logged here — {actions.length} record{actions.length !== 1 ? 's' : ''}.
        </p>
        <button
          onClick={load}
          className="flex items-center gap-2 bg-deep-brown text-cream font-body text-sm px-4 py-2 rounded-lg hover:bg-rust transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && <p className="mb-4 font-body text-[13px] text-rust">{error}</p>}

      {loading && actions.length === 0 && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-deep-brown/20 border-t-deep-brown rounded-full animate-spin" />
        </div>
      )}

      {!loading && actions.length === 0 && !error && (
        <p className="text-center py-16 font-body text-earth">No admin actions logged yet.</p>
      )}

      <div className="bg-cream rounded-2xl overflow-hidden">
        {actions.map((a) => (
          <div key={a.id} className="px-5 py-3 border-b border-soft-peach/50 last:border-0 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-body text-[13px] text-deep-brown">
                <span className="font-semibold">{a.resource}.{a.action}</span>
                {a.target ? ` · ${a.target}` : ''}
                {a.amount ? ` · ${baht(a.amount)}` : ''}
              </p>
              {a.reason && <p className="font-body text-[12px] text-earth/80 italic">“{a.reason}”</p>}
              {a.detail && <p className="font-body text-[11px] text-earth/50 break-all">{a.detail}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="font-body text-[11px] text-earth/60">{new Date(a.at).toLocaleString('en-GB')}</p>
              <p className="font-body text-[11px] text-earth/60">{a.email ?? 'unknown'}</p>
              <p className="font-body text-[11px] text-accent-green">{a.result}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
