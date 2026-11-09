/**
 * Minimal HTML → Markdown for "Markdown for Agents" content negotiation
 * (Accept: text/markdown). Runs in the edge middleware, so it is dependency-free
 * and regex based; it only has to be good enough for our own prerendered pages.
 */

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

const strip = (s: string) => decode(s.replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').trim();

export function htmlToMarkdown(html: string, baseUrl: string): string {
  const title = strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const description = decode(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? '');

  let body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
  body = body.replace(/<(script|style|svg|noscript|template|iframe|button|form|nav|footer|header)\b[\s\S]*?<\/\1>/gi, '');
  body = body.replace(/<!--[\s\S]*?-->/g, '');

  const abs = (href: string) => {
    try {
      return new URL(decode(href), baseUrl).toString();
    } catch {
      return href;
    }
  };

  body = body
    .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, l, t) => `\n\n${'#'.repeat(Number(l))} ${strip(t)}\n\n`)
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => {
      const text = strip(t);
      return text ? `[${text}](${abs(href)})` : '';
    })
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `**${strip(t)}**`)
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `*${strip(t)}*`)
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|article|ul|ol|tr|table|figure|main)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '');

  const text = decode(body)
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const head = `# ${title || 'GingerBros'}\n\n${description ? `> ${description}\n\n` : ''}Source: ${baseUrl}\n\n`;
  // The page's own h1 usually repeats the title; don't print it twice.
  const deduped = text.replace(new RegExp(`^# ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n+`), '');
  return `${head}${deduped}\n`;
}

/** True when the client asks for markdown and ranks it at least as high as HTML. */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const q = (type: string) => {
    let best = -1;
    for (const part of accept.split(',')) {
      const [t, ...params] = part.trim().split(';');
      if (t.trim().toLowerCase() !== type) continue;
      const qp = params.find((p) => p.trim().startsWith('q='));
      best = Math.max(best, qp ? Number(qp.trim().slice(2)) : 1);
    }
    return best;
  };
  const md = q('text/markdown');
  return md > 0 && md >= q('text/html');
}
