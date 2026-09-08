import { useCallback, useEffect, useMemo, useState } from 'react';

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
}

export interface UseProductReviewsResult {
  reviews: Review[];
  average: number;
  count: number;
  loading: boolean;
  error: string | null;
  submitReview: (input: { name: string; rating: number; text: string }) => Promise<void>;
}

export function useProductReviews(productId: string | undefined): UseProductReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load reviews');
        return res.json() as Promise<{ reviews: Review[] }>;
      })
      .then((data) => {
        if (!active) return;
        setReviews(data.reviews ?? []);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load reviews');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // productId is expected to be stable for the lifetime of this hook instance —
    // callers key the consuming component on productId to reset state on change,
    // matching the `useCatalog` pattern of a fetch-once-per-mount effect.
  }, [productId]);

  const submitReview = useCallback(
    async (input: { name: string; rating: number; text: string }) => {
      if (!productId) return;
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, ...input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to submit review');
      setReviews((prev) => [data.review as Review, ...prev]);
    },
    [productId],
  );

  const { average, count } = useMemo(() => {
    const count = reviews.length;
    const average = count === 0 ? 0 : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10;
    return { average, count };
  }, [reviews]);

  return { reviews, average, count, loading, error, submitReview };
}

export function useReviewSummaries(productIds: string[]): Record<string, ReviewSummary> {
  const [summaries, setSummaries] = useState<Record<string, ReviewSummary>>({});
  const key = productIds.join(',');

  useEffect(() => {
    if (!key) return;
    let active = true;
    fetch(`/api/reviews?productIds=${encodeURIComponent(key)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load review summaries');
        return res.json() as Promise<{ summaries: Record<string, ReviewSummary> }>;
      })
      .then((data) => {
        if (active) setSummaries(data.summaries ?? {});
      })
      .catch(() => {
        // Non-critical — the Shop grid just renders without rating badges.
      });
    return () => {
      active = false;
    };
  }, [key]);

  return summaries;
}
