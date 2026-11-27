/**
 * Request values arrive as whatever the caller sent: a number, an object, or an
 * array when a query parameter is repeated. Read text through this, so anything
 * else is treated as missing instead of crashing on `.trim()`.
 */
export const str = (value: unknown): string => (typeof value === 'string' ? value : '');
