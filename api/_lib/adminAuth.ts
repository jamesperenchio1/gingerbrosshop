import type { VercelRequest } from '@vercel/node';

/** Admin endpoints share one bearer secret (ADMIN_SECRET), entered on the /admin pages. */
export function isAdminAuthorized(req: VercelRequest): boolean {
  const auth = req.headers.authorization;
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    console.error('ADMIN_SECRET is not configured');
    return false;
  }
  return auth === `Bearer ${expected}`;
}
