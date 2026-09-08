import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useProductReviews } from '@/lib/reviews';
import { useReveal } from '@/lib/reveal';
import { Skeleton } from '@/components/ui/skeleton';
import StarRating from '@/components/StarRating';

interface Props {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: Props) {
  const { reviews, average, count, loading, submitReview } = useProductReviews(productId);
  const [formRating, setFormRating] = useState(0);
  const [formName, setFormName] = useState('');
  const [formText, setFormText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const scopeRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useReveal(
    scopeRef,
    (reveal) => {
      reveal(headerRef.current, { trigger: scopeRef.current, start: 'top 85%' });
      reveal(listRef.current, { trigger: scopeRef.current, start: 'top 85%', delay: 0.1 });
    },
    [productId, loading],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRating === 0 || !formName.trim() || !formText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await submitReview({ name: formName.trim(), rating: formRating, text: formText.trim() });
      toast.success('Thanks for your review!');
      setFormRating(0);
      setFormName('');
      setFormText('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={scopeRef} className="mt-20 border-t border-soft-peach/50 pt-14">
      <h3
        ref={headerRef}
        className="font-display font-semibold text-deep-brown text-[1.35rem] mb-8 flex items-center gap-4"
      >
        Reviews
        <span className="flex-1 h-px bg-soft-peach/60 hidden sm:block" />
      </h3>

      <div ref={listRef}>
        {loading ? (
          <Skeleton className="h-6 w-40 mb-8" />
        ) : (
          <div className="flex items-center gap-3 mb-8">
            <span className="font-display font-semibold text-deep-brown text-2xl">
              {count > 0 ? average.toFixed(1) : '—'}
            </span>
            <StarRating value={Math.round(average)} size={18} />
            <span className="font-body text-earth text-[14px]">
              {count > 0 ? `${count} review${count === 1 ? '' : 's'}` : 'No reviews yet'}
            </span>
          </div>
        )}

        {!loading && count === 0 && (
          <div className="bg-cream/40 border border-soft-peach/60 rounded-2xl p-6 text-center mb-8">
            <div className="flex justify-center mb-3">
              <StarRating value={0} size={22} />
            </div>
            <p className="font-body text-earth text-[14px]">
              No reviews yet — be the first to share what you think of {productName}.
            </p>
          </div>
        )}

        {!loading && count > 0 && (
          <div className="space-y-4 mb-10">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-soft-peach/60 shadow-card rounded-2xl p-5 sm:p-6"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="font-display font-semibold text-deep-brown text-[14px]">{r.name}</span>
                  <span className="font-body text-[12px] text-earth/50">
                    {new Date(r.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <StarRating value={r.rating} size={14} />
                <p className="font-body text-earth text-[14px] leading-relaxed mt-2.5">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-cream/40 rounded-xxl border border-soft-peach/60 p-6 md:p-8">
        <h4 className="font-display font-bold text-deep-brown text-lg mb-5">Leave a Review</h4>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-[520px]">
          <div>
            <span className="font-body font-semibold text-[12px] uppercase tracking-[0.08em] text-rust mb-2 block">
              Your Rating
            </span>
            <StarRating value={formRating} size={26} interactive onChange={setFormRating} />
          </div>
          <div>
            <label htmlFor="review-name" className="sr-only">
              Your name
            </label>
            <input
              id="review-name"
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Your name"
              required
              maxLength={60}
              className="w-full bg-white border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30"
            />
          </div>
          <div>
            <label htmlFor="review-text" className="sr-only">
              Your review
            </label>
            <textarea
              id="review-text"
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder="What did you think?"
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              className="w-full bg-white border border-soft-peach rounded-xl px-4 py-2.5 font-body text-[14px] text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || formRating === 0}
            className="font-body font-medium text-sm uppercase tracking-[0.08em] px-8 py-3 rounded-full bg-amber text-deep-brown hover:bg-warm-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
