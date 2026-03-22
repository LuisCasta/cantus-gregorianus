export default async function middleware(request) {
  const url = new URL(request.url);

  // Only handle root path with ?canto= param
  if (url.pathname !== '/') return;
  const cantoId = url.searchParams.get('canto');
  if (!cantoId) return;

  // Only intercept social media bots
  const ua = request.headers.get('user-agent') || '';
  const isBot = /facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|TelegramBot|Slackbot|vkShare|Pinterest|Discordbot/i.test(ua);
  if (!isBot) return;

  try {
    const titlesRes = await fetch(`${url.origin}/data/titles.json`);
    if (!titlesRes.ok) return;
    const titles = await titlesRes.json();
    const titulo = titles[cantoId];
    if (!titulo) return;

    const esc = s => String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${esc(titulo)} — AMDG Cantos Gregorianos</title>
  <meta name="description" content="${esc(titulo)} · Portal de cantos y devociones de la tradición católica." />
  <meta property="og:title" content="${esc(titulo)}" />
  <meta property="og:description" content="Portal de cantos y devociones de la tradición católica." />
  <meta property="og:url" content="${esc(url.href)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="AMDG — Cantos Gregorianos" />
</head>
<body></body>
</html>`;

    return new Response(html, {
      headers: { 'content-type': 'text/html;charset=utf-8' },
    });
  } catch {
    return;
  }
}

export const config = { matcher: '/' };
