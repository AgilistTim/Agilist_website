export async function GET({ site, url }) {
  const baseUrl = site ?? new URL(url.origin)
  const sitemapUrl = new URL('/sitemap.xml', baseUrl)

  const body = `User-agent: *\nAllow: /\nSitemap: ${sitemapUrl.href}\n`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}
