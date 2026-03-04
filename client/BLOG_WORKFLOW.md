# Blog & LinkedIn Sync Workflow

This document explains how to manage your blog content and keep it in sync with LinkedIn articles.

## SEO Strategy: Host on Your Site First

**Recommended approach:** Publish articles on your website first, then cross-post to LinkedIn. This maximizes SEO/GEO benefits:

- ✅ Your domain gets the authority and backlinks
- ✅ AI systems cite your domain, not LinkedIn
- ✅ You control metadata and structured data
- ✅ Content persists regardless of platform changes
- ✅ LinkedIn still provides distribution and engagement

## Three Sync Options

### Option 1: Full Articles on Both (Recommended)

Host complete articles on your site and cross-post to LinkedIn. This gives you both SEO benefits and LinkedIn's reach.

**Workflow:**
1. Write article in markdown
2. Add to `src/content/blog/article-slug.md` with your LinkedIn URL in frontmatter
3. Publish to your site
4. Copy content to LinkedIn
5. Your site will include a canonical link to LinkedIn (or vice versa)

**Example frontmatter:**
```markdown
---
title: "Why Your Product Team Is Stuck"
date: "2026-01-14"
summary: "The operating model is the bottleneck..."
tags: ["product-ops", "ai", "strategy"]
linkedinUrl: "https://www.linkedin.com/pulse/article-url"
draft: false
---
```

### Option 2: Your Site as Primary (Best for SEO)

Write on your site first, then post a summary/excerpt on LinkedIn with a link back.

**Workflow:**
1. Publish full article on your site
2. Post 2-3 paragraphs on LinkedIn with "Read the full article: [link]"
3. Do NOT include LinkedIn URL in frontmatter (your site is the canonical source)

### Option 3: LinkedIn as Primary (Quick but Less SEO)

Just link to LinkedIn articles from your blog listing.

**Not recommended** - you lose all the SEO/GEO benefits.

## Adding New Articles

### Method 1: Manual (Simple)

1. Create a new file in `src/content/blog/` named `your-article-slug.md`
2. Add frontmatter and content:

```markdown
---
title: "Your Article Title"
date: "2026-03-04"
summary: "A compelling 1-2 sentence summary"
tags: ["ai", "strategy", "transformation"]
draft: false
---

Your article content here in markdown format...
```

3. Save and the dev server will hot-reload

### Method 2: Import Script (Assisted)

Run the interactive import script:

```bash
node scripts/import-linkedin-article.js
```

It will prompt you for:
- Title
- Date
- Summary
- Tags
- LinkedIn URL (optional)
- URL slug
- Article content (paste and type END when done)

The script creates the markdown file for you.

## Converting LinkedIn Articles to Markdown

LinkedIn articles are in HTML. To convert:

1. **Copy from LinkedIn's editor** - preserves formatting better than published view
2. **Use a converter**:
   - [Turndown](https://domchristie.github.io/turndown/) - paste HTML, get Markdown
   - Or use ChatGPT: "Convert this HTML to clean Markdown: [paste]"
3. **Clean up**:
   - Remove unnecessary formatting
   - Ensure headings use `##` `###` syntax
   - Check links work
   - Add line breaks between paragraphs

## Canonical URLs Explained

When you include `linkedinUrl` or `canonicalUrl` in your frontmatter:
- The blog post page will include `<link rel="canonical" href="[linkedin-url]">` in the HTML head
- This tells search engines "this content exists elsewhere and that's the primary version"
- Use this when LinkedIn is your primary publishing platform

**For maximum SEO benefit**, do NOT include a canonical URL - let your site be the canonical source.

## Quick Reference

### File Structure
```
src/content/blog/
├── article-one.md
├── article-two.md
└── article-three.md
```

### Frontmatter Fields
- `title` (required) - Article title
- `date` (required) - Publication date (YYYY-MM-DD)
- `summary` (required) - 1-2 sentence description for listing pages
- `tags` (optional) - Array of tags for categorization
- `draft` (optional) - Set to `true` to hide from public site
- `linkedinUrl` (optional) - LinkedIn article URL for canonical link
- `canonicalUrl` (optional) - Alternative field for canonical URL

### URLs
- Blog listing: `http://localhost:4321/blog`
- Individual post: `http://localhost:4321/blog/article-slug`

## Keeping in Sync

### For Regular Updates

If you publish on LinkedIn first and want to import to your site:

1. Copy the article from LinkedIn
2. Convert to Markdown (see above)
3. Run `node scripts/import-linkedin-article.js` or create manually
4. Include the LinkedIn URL in frontmatter

### Automation Ideas (Future)

Potential ways to automate:
- LinkedIn API integration (requires approval)
- Zapier/Make.com workflow
- RSS feed parser (if LinkedIn provides one)
- Chrome extension to export from LinkedIn

For now, manual sync is straightforward for 1-2 articles per month.

## SEO Checklist

When publishing an article:
- [ ] Compelling title (under 60 characters)
- [ ] Clear summary for meta description
- [ ] Relevant tags for categorization
- [ ] Date is accurate
- [ ] Decide: your site primary or LinkedIn primary?
- [ ] If LinkedIn primary, include `linkedinUrl` in frontmatter
- [ ] If your site primary, do NOT include canonical URL
- [ ] Proofread markdown formatting
- [ ] Check it renders correctly on dev server
- [ ] Deploy to production

## Questions?

The blog uses Astro Content Collections. Docs: https://docs.astro.build/en/guides/content-collections/
