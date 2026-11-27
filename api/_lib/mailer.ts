/**
 * Every outgoing email goes through here. The Resend SDK reports failures in
 * `error` instead of throwing, so calling it directly makes a failed send look
 * like a successful one.
 */
import { Redis } from '@upstash/redis';
import { getResend, FROM_EMAIL_NEWSLETTER, UNSUBSCRIBE_PLACEHOLDER } from './email.js';
import { isSuppressed, unsubscribeUrl } from './subscribers.js';
import { captureServerException } from './posthog.js';

export interface Message {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

export class EmailError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.name = 'EmailError';
    this.code = code;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Send, or throw. Returns the Resend email id. */
export async function sendEmail(message: Message): Promise<string> {
  const resend = getResend();
  if (!resend) throw new EmailError('not_configured', 'RESEND_API_KEY is not set');
  for (let attempt = 1; ; attempt++) {
    const { data, error } = await resend.emails.send(message);
    if (!error) return data?.id ?? '';
    if (error.name !== 'rate_limit_exceeded' || attempt >= 3) throw new EmailError(error.name, error.message);
    await sleep(attempt * 600);
  }
}

// ---------------------------------------------------------------------------
// Outbox: mail with no other way to be retried. The two daily crons flush it.
// ---------------------------------------------------------------------------

const OUTBOX_KEY = 'email:outbox';
const MAX_TRIES = 6; // two flushes a day: about three days
/** Failures that say nothing about this message, so they don't count against it. */
const ACCOUNT_LIMITS = new Set(['daily_quota_exceeded', 'monthly_quota_exceeded', 'rate_limit_exceeded', 'not_configured']);

interface QueuedEmail {
  message: Message;
  context: string;
  marketing: boolean;
  tries: number;
  queuedAt: string;
}

function report(error: unknown, context: string, stage: string): void {
  console.error(`email ${stage} (${context}):`, error);
  captureServerException(error, 'email', { context, stage });
}

/**
 * Send now; if that fails, keep the email for a later retry. Never throws.
 * `lost` means it could be neither sent nor stored.
 */
export async function sendOrQueue(
  message: Message,
  { context, marketing = false }: { context: string; marketing?: boolean },
): Promise<'sent' | 'queued' | 'lost'> {
  try {
    await sendEmail(message);
    return 'sent';
  } catch (err) {
    report(err, context, 'send failed');
    try {
      const item: QueuedEmail = { message, context, marketing, tries: 1, queuedAt: new Date().toISOString() };
      await Redis.fromEnv().rpush(OUTBOX_KEY, item);
      return 'queued';
    } catch (queueError) {
      report(queueError, context, 'queue failed');
      return 'lost';
    }
  }
}

export async function flushOutbox(max = 25): Promise<{ sent: number; requeued: number; dropped: number }> {
  const redis = Redis.fromEnv();
  const result = { sent: 0, requeued: 0, dropped: 0 };
  const waiting = Math.min(await redis.llen(OUTBOX_KEY), max);

  for (let i = 0; i < waiting; i++) {
    const item = await redis.lpop<QueuedEmail>(OUTBOX_KEY);
    if (!item) break;
    try {
      if (item.marketing && (await isSuppressed(item.message.to))) {
        result.dropped++;
        continue;
      }
      await sendEmail(item.message);
      result.sent++;
    } catch (err) {
      const accountLimit = err instanceof EmailError && ACCOUNT_LIMITS.has(err.code);
      const tries = item.tries + (accountLimit ? 0 : 1);
      if (tries < MAX_TRIES) {
        await redis.rpush(OUTBOX_KEY, { ...item, tries });
        result.requeued++;
      } else {
        report(err, item.context, 'gave up');
        result.dropped++;
      }
      if (accountLimit) break;
    }
  }
  return result;
}

/**
 * Give a marketing email its unsubscribe link: in the footer, and as the
 * one-click List-Unsubscribe header (RFC 8058, which requires an https URL).
 */
export async function withUnsubscribe(message: Message): Promise<Message> {
  const mailto = `mailto:${FROM_EMAIL_NEWSLETTER}?subject=Unsubscribe`;
  let url: string | null = null;
  try {
    url = await unsubscribeUrl(message.to);
  } catch (err) {
    report(err, 'unsubscribe-link', 'link failed');
  }
  return {
    ...message,
    html: message.html.replaceAll(UNSUBSCRIBE_PLACEHOLDER, url ?? mailto),
    headers: url
      ? { ...message.headers, 'List-Unsubscribe': `<${url}>, <${mailto}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
      : { ...message.headers, 'List-Unsubscribe': `<${mailto}>` },
  };
}
