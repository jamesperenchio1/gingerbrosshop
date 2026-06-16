import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit, getClientIp } from '../rateLimit.js';
import { getResend, MAIL_FROM, welcomeHtml } from '../email.js';

const audienceId = process.env.RESEND_AUDIENCE_ID;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { allowed } = await rateLimit({ key: `subscribe:${getClientIp(req)}`, limit: 5, windowSeconds: 60 });
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    return;
  }

  const email = (req.body?.email as string)?.toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const resend = getResend();
  if (!resend) {
    res.status(500).json({ error: 'Newsletter service is not configured.' });
    return;
  }

  try {
    // Add to Resend audience if configured
    if (audienceId) {
      const { error } = await resend.contacts.create({
        email,
        audienceId,
        unsubscribed: false,
      });
      if (error) {
        console.error('Resend audience error:', error);
        // Continue to send welcome email even if audience add fails
      }
    }

    // Send a welcome/thank-you email
    await resend.emails.send({
      from: MAIL_FROM,
      to: email,
      subject: 'Welcome to the Brew Crew 🍺',
      html: welcomeHtml(),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Failed to subscribe. Please try again later.' });
  }
}
