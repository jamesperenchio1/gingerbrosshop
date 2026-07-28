import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { getResend, MAIL_FROM, SELLER_EMAIL, wholesaleInquiryHtml, wholesaleConfirmationHtml, type WholesaleInquiry } from '../email.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  if (!businessName || !contactName || !email || !message) {
    res.status(400).json({ error: 'Business name, contact name, email, and message are required.' });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  if (businessName.length > 200 || contactName.length > 200 || message.length > 4000) {
    res.status(400).json({ error: 'One of the fields is too long.' });
    return;
  }

  const inquiry: WholesaleInquiry = { businessName, contactName, email, phone, message };

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
      subject: `Wholesale inquiry — ${businessName}`,
      html: wholesaleInquiryHtml(inquiry),
    });

    // Best-effort confirmation to the submitter; failure here shouldn't fail the request.
    await resend.emails.send({
      from: MAIL_FROM,
      to: email,
      subject: 'We got your wholesale inquiry — GingerBros',
      html: wholesaleConfirmationHtml(inquiry),
    }).catch((err) => console.error('Wholesale confirmation email failed:', err));

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Wholesale inquiry error:', err);
    res.status(500).json({ error: 'Failed to send inquiry. Please try again later.' });
  }
}
