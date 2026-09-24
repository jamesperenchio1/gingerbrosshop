import { useState, type ReactNode } from 'react';

/**
 * Strict confirmation modal. The destructive action stays disabled until the
 * operator types the exact confirm phrase, and — where relevant — supplies a
 * reason and/or amount. Used for every money-moving action. Mount it only while
 * open (the parent conditionally renders it) so state resets on each open.
 */
export default function ConfirmActionDialog({
  title,
  description,
  confirmPhrase,
  requireReason,
  requireAmount,
  amountLabel,
  defaultAmount,
  busy,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  description?: ReactNode;
  confirmPhrase: string;
  requireReason?: boolean;
  requireAmount?: boolean;
  amountLabel?: string;
  defaultAmount?: string;
  busy?: boolean;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (value: { confirm: string; reason: string; amount: string }) => void;
}) {
  const [phrase, setPhrase] = useState('');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState(defaultAmount ?? '');

  const phraseOk = phrase.trim().toUpperCase() === confirmPhrase.toUpperCase();
  const reasonOk = !requireReason || reason.trim().length >= 3;
  const amountOk = !requireAmount || Number(amount) > 0;
  const ok = phraseOk && reasonOk && amountOk;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-warm-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-display text-lg text-deep-brown">{title}</h3>
        {description && <div className="mt-2 font-body text-sm text-earth">{description}</div>}

        <div className="mt-4 space-y-3">
          {requireAmount && (
            <label className="block">
              <span className="font-body text-[13px] text-earth">{amountLabel ?? 'Amount (THB)'}</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                className="mt-1 w-full bg-cream border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown focus:outline-none focus:ring-2 focus:ring-rust/30"
              />
            </label>
          )}
          {requireReason && (
            <label className="block">
              <span className="font-body text-[13px] text-earth">Reason (required, logged)</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="mt-1 w-full bg-cream border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown focus:outline-none focus:ring-2 focus:ring-rust/30"
              />
            </label>
          )}
          <label className="block">
            <span className="font-body text-[13px] text-earth">
              Type <strong className="text-rust">{confirmPhrase}</strong> to confirm
            </span>
            <input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              autoComplete="off"
              className="mt-1 w-full bg-cream border border-soft-peach rounded-lg px-3 py-2 font-body text-deep-brown focus:outline-none focus:ring-2 focus:ring-rust/30"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="font-body text-sm px-4 py-2 rounded-lg text-earth hover:text-deep-brown"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ confirm: phrase.trim(), reason: reason.trim(), amount })}
            disabled={!ok || busy}
            className="font-body text-sm px-4 py-2 rounded-lg bg-rust text-cream hover:bg-deep-brown disabled:opacity-50"
          >
            {busy ? 'Working…' : confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
