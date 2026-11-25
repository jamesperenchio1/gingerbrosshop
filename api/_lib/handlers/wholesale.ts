import { randomBytes } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { getResend, MAIL_FROM, SELLER_EMAIL, FROM_EMAIL, wholesaleSubject, wholesaleInquiryHtml, wholesaleConfirmationHtml, type WholesaleInquiry } from '../email.js';
import { captureServerEvent } from '../posthog.js';

// The address ends up in the seller's Reply link and in outgoing mail headers,
// so besides the basic shape it must not contain characters that act as
// mailto/URL/header separators (? & = # % < > " , ; : \ /). Real addresses
// almost never use them.
export const EMAIL_RE = /^[^\s@?&=#%<>",;:\\/]+@[^\s@?&=#%<>",;:\\/]+\.[^\s@?&=#%<>",;:\\/]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { allowed } = await rateLimit({ key: `wholesale:${getClientIp(req)}`, limit: 5, windowSeconds: 3600 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  const businessName = (req.body?.businessName as string)?.trim();
  const contactName = (req.body?.contactName as string)?.trim();
  const email = (req.body?.email as string)?.toLowerCase().trim();
  const phone = (req.body?.phone as string)?.trim() || undefined;
  const message = (req.body?.message as string)?.trim();
  // Which options the sender ticked on the form. Booleans only: these pick the
  // subject label, so no sender-typed text can reach a subject line.
  const wants = {
    samples: req.body?.wantsSamples === true,
    quote: req.body?.wantsQuote !== false,
  };

  if (!businessName || !contactName || !email || !message) {
    res.status(400).json({ error: 'Business name, contact name, email, and message are required.' });
    return;
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  if (businessName.length > 200 || contactName.length > 200 || message.length > 4000) {
    res.status(400).json({ error: 'One of the fields is too long.' });
    return;
  }

  const inquiry: WholesaleInquiry = { businessName, contactName, email, phone, message };
  // Server-made reference used in both email subjects (never sender-typed text).
  const ref = randomBytes(3).toString('hex').toUpperCase();

  const resend = getResend();
  if (!resend) {
    res.status(500).json({ error: 'Inquiry service is not configured.' });
    return;
  }
  if (!SELLER_EMAIL) {
    res.status(500).json({ error: 'Inquiry service is not configured.' });
    return;
  }

  try {
    await resend.emails.send({
      from: MAIL_FROM,
      to: SELLER_EMAIL,
      replyTo: email,
      subject: wholesaleSubject(ref, wants),
      html: wholesaleInquiryHtml(inquiry, ref, wants),
    });

    // Best-effort confirmation to the submitter; failure here shouldn't fail the request.
    // Same subject as the seller notification above, so the seller's plain
    // Reply ("Re: <subject>") threads under this email in the customer's mailbox.
    // Customer replies go to the sending address, which Cloudflare Email Routing forwards to the support inbox.
    await resend.emails.send({
      from: MAIL_FROM,
      to: email,
      replyTo: FROM_EMAIL,
      subject: wholesaleSubject(ref, wants),
      html: wholesaleConfirmationHtml(inquiry, ref),
    }).catch((err) => console.error('Wholesale confirmation email failed:', err));

    await captureServerEvent('wholesale_inquiry_submitted', email, {
      business_name: businessName,
      contact_name: contactName,
      has_phone: Boolean(phone),
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Wholesale inquiry error:', err);
    res.status(500).json({ error: 'Failed to send inquiry. Please try again later.' });
  }
}
