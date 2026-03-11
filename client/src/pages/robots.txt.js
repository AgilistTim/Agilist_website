export async function GET({ site, url }) {
  const baseUrl = site ?? new URL(url.origin)
  const sitemapUrl = new URL('/sitemap.xml', baseUrl)

  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    '# AI crawlers',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    `Sitemap: ${sitemapUrl.href}`,
    ''
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}
