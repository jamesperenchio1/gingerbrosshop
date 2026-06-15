import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { rateLimit, getClientIp } from './_lib/rateLimit.js';

const resendApiKey = process.env.RESEND_API_KEY;
const audienceId = process.env.RESEND_AUDIENCE_ID;
const fromEmail = process.env.FROM_EMAIL ?? 'orders@gingerbros.co';

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

  if (!resendApiKey) {
    res.status(500).json({ error: 'Newsletter service is not configured.' });
    return;
  }

  const resend = new Resend(resendApiKey);

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
      from: `GingerBros <${fromEmail}>`,
      to: email,
      subject: 'Welcome to the Brew Crew 🍺',
      html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#3D2410;">
        <h2 style="color:#3D2410;">Welcome to the Brew Crew!</h2>
        <p>Thanks for subscribing. You'll be the first to hear about new flavors, exclusive offers, and ginger fizz tips.</p>
        <p style="margin-top:24px;font-size:13px;color:#888;">Brewed with patience in Thailand.<br>GingerBros</p>
      </div>`,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Failed to subscribe. Please try again later.' });
  }
}
