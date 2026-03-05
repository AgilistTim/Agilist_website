#!/usr/bin/env node

/**
 * Import LinkedIn Article to Blog
 *
 * Usage:
 *   node scripts/import-linkedin-article.js
 *
 * This script helps you convert a LinkedIn article to a blog post.
 * It will prompt you for the article details and create a markdown file.
 */

import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function main() {
  console.log('\n📝 LinkedIn Article Importer\n');
  console.log('This will help you convert a LinkedIn article to a blog post.\n');

  const title = await question('Article title: ');
  const date = await question('Publication date (YYYY-MM-DD): ');
  const summary = await question('Summary (1-2 sentences): ');
  const tags = await question('Tags (comma-separated): ');
  const linkedinUrl = await question('LinkedIn article URL (optional): ');
  const slug = await question('URL slug (e.g., "my-article-title"): ');

  console.log('\n📋 Now paste the article content (Markdown format).');
  console.log('When finished, type "END" on a new line and press Enter.\n');

  let content = '';
  let line;
  while ((line = await question('')) !== 'END') {
    content += line + '\n';
  }

  rl.close();

  // Create frontmatter
  const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
  const frontmatter = {
    title,
    date,
    summary,
    tags: tagArray,
    draft: false,
    ...(linkedinUrl ? { canonicalUrl: linkedinUrl } : {})
  };

  // Build markdown file
  const markdown = `---
title: "${frontmatter.title}"
date: "${frontmatter.date}"
summary: "${frontmatter.summary}"
tags: [${frontmatter.tags.map(t => `"${t}"`).join(', ')}]
draft: ${frontmatter.draft}${frontmatter.canonicalUrl ? `\ncanonicalUrl: "${frontmatter.canonicalUrl}"` : ''}
---

${content}`;

  // Write file
  const filePath = join(__dirname, '..', 'src', 'content', 'blog', `${slug}.md`);

  try {
    await writeFile(filePath, markdown, 'utf-8');
    console.log(`\n✅ Blog post created: ${filePath}`);
    console.log(`\nView at: http://localhost:4321/blog/${slug}`);
  } catch (error) {
    console.error('❌ Error writing file:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
