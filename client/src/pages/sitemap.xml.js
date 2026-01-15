import { getCollection } from 'astro:content'

export async function GET({ site, url }) {
  const baseUrl = site ?? new URL(url.origin)
  const posts = await getCollection('blog', ({ data }) => !data.draft)

  const staticRoutes = ['/', '/blog']

  const urls = [
    ...staticRoutes.map((route) => ({
      loc: new URL(route, baseUrl).href
    })),
    ...posts.map((post) => ({
      loc: new URL(`/blog/${post.slug}`, baseUrl).href,
      lastmod: post.data.date.toISOString()
    }))
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((entry) => {
    return `  <url>\n    <loc>${entry.loc}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''}\n  </url>`
  })
  .join('\n')}
</urlset>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  })
}
