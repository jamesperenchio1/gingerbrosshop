import { Redis } from '@upstash/redis';

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  text: string;
  createdAt: string;
}

const redis = Redis.fromEnv();

function key(productId: string) {
  return `reviews:${productId}`;
}

export async function getReviews(productId: string): Promise<Review[]> {
  try {
    const data = await redis.get<Review[]>(key(productId));
    return data ?? [];
  } catch (err) {
    console.error('Redis read error:', err);
    return [];
  }
}

export async function addReview(productId: string, review: Review): Promise<void> {
  const reviews = await getReviews(productId);
  reviews.unshift(review);
  try {
    await redis.set(key(productId), reviews);
  } catch (err) {
    console.error('Redis write error:', err);
    throw err;
  }
}

export async function deleteReview(productId: string, reviewId: string): Promise<boolean> {
  const reviews = await getReviews(productId);
  const next = reviews.filter((r) => r.id !== reviewId);
  if (next.length === reviews.length) return false;
  await redis.set(key(productId), next);
  return true;
}
