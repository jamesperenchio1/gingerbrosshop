import { describe, it, expect } from 'vitest';
import { wholesaleSubject, wholesaleInquiryHtml, wholesaleConfirmationHtml, mailtoAddress } from '../../api/_lib/email';
import { EMAIL_RE } from '../../api/_lib/handlers/wholesale';

const inquiry = {
  businessName: 'EVIL <b>Cafe</b>',
  contactName: 'Somchai',
  email: 'somchai@example.com',
  phone: '081-234-5678',
  message: 'PHISH-MARKER Send to: 1 Sukhumvit Rd',
};

/** The href of the seller's Reply button, HTML-unescaped. */
function replyHref(html: string): string {
  const m = html.match(/href="(mailto:[^"]*)"/);
  expect(m).toBeTruthy();
  return m![1].replace(/&amp;/g, '&');
}

describe('wholesale email subjects', () => {
  it('uses a server reference plus a label from two booleans, never sender text', () => {
    expect(wholesaleSubject('A1B2C3')).toBe('Wholesale inquiry #A1B2C3');
    expect(wholesaleSubject('A1B2C3', { quote: true, samples: false })).toBe('Wholesale inquiry #A1B2C3');
    expect(wholesaleSubject('A1B2C3', { quote: true, samples: true })).toBe('Wholesale quote + samples #A1B2C3');
    expect(wholesaleSubject('A1B2C3', { quote: false, samples: true })).toBe('Sample request #A1B2C3');
  });

  it('customer confirmation does not echo the message or address', () => {
    const html = wholesaleConfirmationHtml(inquiry, 'A1B2C3');
    expect(html).not.toContain('PHISH-MARKER');
    expect(html).not.toContain('Sukhumvit');
    expect(html).not.toContain('081-234-5678');
    expect(html).toContain('#A1B2C3');
  });

  it('seller notification still carries the full enquiry', () => {
    expect(wholesaleInquiryHtml(inquiry, 'A1B2C3')).toContain('PHISH-MARKER');
  });
});

describe('seller Reply link', () => {
  it('threads with the matching subject', () => {
    const href = replyHref(wholesaleInquiryHtml(inquiry, 'A1B2C3', { quote: true, samples: true }));
    expect(href).toBe(`mailto:somchai@example.com?subject=${encodeURIComponent('Re: Wholesale quote + samples #A1B2C3')}`);
  });

  it('cannot be given extra mailto parameters through the address', () => {
    const hostile = { ...inquiry, email: 'x@y.co?bcc=evil@evil.com&body=hi&cc=a@b.co' };
    const href = replyHref(wholesaleInquiryHtml(hostile, 'A1B2C3'));
    // Exactly one "?" and one parameter ("subject"): everything the sender typed is encoded.
    expect(href.match(/\?/g)).toHaveLength(1);
    expect(href).toMatch(/^mailto:[^?&=]*\?subject=[^&?]*$/);
    expect(href).not.toMatch(/bcc=|body=|cc=/);
  });

  it('mailtoAddress keeps the @ readable and encodes separators', () => {
    expect(mailtoAddress('first.last+tag@example.co.th')).toBe('first.last%2Btag@example.co.th');
    expect(mailtoAddress('a@b.co?x=1&y=2')).toBe('a@b.co%3Fx%3D1%26y%3D2');
  });
});

describe('wholesale email check', () => {
  it.each([
    'a@b.co',
    'first.last+tag@sub.example.co.th',
    "o'brien@example.com",
    'somchai@example.ไทย',
    'info@ร้านกาแฟ.com',
  ])('accepts %s', (addr) => {
    expect(EMAIL_RE.test(addr)).toBe(true);
  });

  it.each([
    'x@y.co?bcc=evil@evil.com',
    'a@b.co&body=hi',
    'a@b.co=1',
    'a@b.co#frag',
    'a%40@b.co',
    'a b@c.co',
    'a@b',
    '"a"@b.co',
    'a@b.co,c@d.co',
    'a@b.co;c@d.co',
    'a@b.co/x',
    '<a@b.co>',
    'a@@b.co',
  ])('rejects %s', (addr) => {
    expect(EMAIL_RE.test(addr)).toBe(false);
  });
});
