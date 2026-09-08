import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { getReviews, addReview, deleteReview, type Review } from '../reviews.js';

function isAdminAuthorized(req: VercelRequest): boolean {
  const auth = req.headers.authorization;
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    console.error('ADMIN_SECRET is not configured');
    return false;
  }
  return auth === `Bearer ${expected}`;
}

function summarize(reviews: Review[]) {
  const count = reviews.length;
  const average = count === 0 ? 0 : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10;
  return { average, count };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const productIdsParam = (req.query.productIds as string | undefined)?.trim();
    if (productIdsParam) {
      const ids = productIdsParam.split(',').map((id) => id.trim()).filter(Boolean);
      const reviewLists = await Promise.all(ids.map((id) => getReviews(id)));
      const summaries: Record<string, { average: number; count: number }> = {};
      ids.forEach((id, i) => {
        summaries[id] = summarize(reviewLists[i]);
      });
      res.status(200).json({ summaries });
      return;
    }

    const productId = (req.query.productId as string | undefined)?.trim();
    if (!productId) {
      res.status(400).json({ error: 'Product ID is required.' });
      return;
    }
    const reviews = await getReviews(productId);
    res.status(200).json({ reviews, ...summarize(reviews) });
    return;
  }

  if (req.method === 'POST') {
    const { allowed } = await rateLimit({
      key: `review:${getClientIp(req)}`,
      limit: 5,
      windowSeconds: 3600,
    });
    if (!allowed) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    const productId = (req.body?.productId as string | undefined)?.trim();
    const name = (req.body?.name as string | undefined)?.trim();
    const rating = req.body?.rating;
    const text = (req.body?.text as string | undefined)?.trim();

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required.' });
      return;
    }
    if (!name || name.length > 60) {
      res.status(400).json({ error: name ? 'Name is too long.' : 'Please enter your name.' });
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5.' });
      return;
    }
    if (!text || text.length < 10) {
      res.status(400).json({ error: 'Please write a bit more detail.' });
      return;
    }
    if (text.length > 1000) {
      res.status(400).json({ error: 'Review is too long.' });
      return;
    }

    const review: Review = {
      id: randomUUID(),
      productId,
      name,
      rating,
      text,
      createdAt: new Date().toISOString(),
    };

    try {
      await addReview(productId, review);
    } catch (err) {
      console.error('Failed to save review:', err);
      res.status(500).json({ error: 'Failed to save review. Please try again.' });
      return;
    }

    res.status(200).json({ review });
    return;
  }

  if (req.method === 'DELETE') {
    if (!isAdminAuthorized(req)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const productId = (req.query.productId as string | undefined)?.trim();
    const reviewId = (req.query.reviewId as string | undefined)?.trim();
    if (!productId || !reviewId) {
      res.status(400).json({ error: 'productId and reviewId are required.' });
      return;
    }

    const deleted = await deleteReview(productId, reviewId);
    if (!deleted) {
      res.status(404).json({ error: 'Review not found.' });
      return;
    }
    res.status(200).json({ deleted: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
