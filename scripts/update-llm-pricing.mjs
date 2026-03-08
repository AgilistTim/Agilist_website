#!/usr/bin/env node
/**
 * Fetches latest LLM pricing from provider websites and uses Claude
 * to extract structured pricing data. Updates llm-pricing.json if
 * any prices have changed.
 *
 * Requires: ANTHROPIC_API_KEY environment variable
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PRICING_PATH = join(__dirname, '..', 'client', 'src', 'data', 'llm-pricing.json')

const PRICING_URLS = {
  openai: 'https://developers.openai.com/api/docs/pricing',
  anthropic: 'https://platform.claude.com/docs/en/about-claude/pricing',
  google: 'https://ai.google.dev/gemini-api/docs/pricing',
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LLMPricingBot/1.0)' },
  })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return await res.text()
}

function truncateHtml(html, maxChars = 30000) {
  // Strip scripts/styles, keep text content manageable for Claude
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return stripped.slice(0, maxChars)
}

async function askClaude(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set — skipping pricing update')
    process.exit(0)
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Claude API error ${res.status}: ${body}`)
  }

  const data = await res.json()
  return data.content[0].text
}

async function main() {
  const currentPricing = JSON.parse(readFileSync(PRICING_PATH, 'utf-8'))

  console.log('Fetching pricing pages...')

  const pages = {}
  for (const [provider, url] of Object.entries(PRICING_URLS)) {
    try {
      const html = await fetchPage(url)
      pages[provider] = truncateHtml(html)
      console.log(`  ✓ ${provider} (${pages[provider].length} chars)`)
    } catch (err) {
      console.error(`  ✗ ${provider}: ${err.message}`)
      pages[provider] = null
    }
  }

  const availableProviders = Object.entries(pages)
    .filter(([, text]) => text)
    .map(([name]) => name)

  if (availableProviders.length === 0) {
    console.log('No pricing pages fetched — skipping update')
    return
  }

  const prompt = `You are a data extraction assistant. I need you to extract current LLM API pricing from provider websites and compare it with our existing pricing data.

## Current pricing data
\`\`\`json
${JSON.stringify(currentPricing, null, 2)}
\`\`\`

## Provider page content
${availableProviders.map((p) => `### ${p}\n${pages[p]}`).join('\n\n')}

## Instructions
1. Compare the pricing from the page content with our current JSON data
2. For each model in our JSON, check if the input price, output price, or cache discount has changed
3. Check if there are significant NEW models worth adding (major releases only, not previews or deprecated)
4. Check if any of our listed models have been deprecated and should be removed

IMPORTANT: Only output valid JSON. Respond with EXACTLY one of these two formats:

If nothing changed:
{"changed": false}

If prices changed:
{"changed": true, "pricing": <the full updated pricing object matching the exact schema of the current data>}

The pricing object must match the exact same schema as the current data (with providers, hardware, and lastUpdated fields). Set lastUpdated to today's date in YYYY-MM-DD format.

Only change values you are confident about from the page content. If you cannot verify a price, keep the existing value.`

  console.log('\nAsking Claude to compare pricing...')
  const response = await askClaude(prompt)

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('Could not parse Claude response as JSON')
    console.error('Response:', response.slice(0, 500))
    return
  }

  let result
  try {
    result = JSON.parse(jsonMatch[0])
  } catch {
    console.error('Invalid JSON in response:', jsonMatch[0].slice(0, 500))
    return
  }

  if (!result.changed) {
    console.log('✓ All prices are up to date — no changes needed')
    return
  }

  // Validate the new data has the expected shape
  const newPricing = result.pricing
  if (!newPricing?.providers || !newPricing?.hardware || !newPricing?.lastUpdated) {
    console.error('Invalid pricing structure returned')
    return
  }

  // Sanity check: ensure we didn't lose any providers
  for (const key of Object.keys(currentPricing.providers)) {
    if (!newPricing.providers[key]) {
      console.error(`Missing provider: ${key} — aborting`)
      return
    }
  }

  // Log what changed
  for (const [provKey, prov] of Object.entries(newPricing.providers)) {
    const oldProv = currentPricing.providers[provKey]
    if (!oldProv) {
      console.log(`  + New provider: ${provKey}`)
      continue
    }
    for (const model of prov.models) {
      const oldModel = oldProv.models.find((m) => m.id === model.id)
      if (!oldModel) {
        console.log(`  + New model: ${model.name} ($${model.input}/$${model.output})`)
        continue
      }
      const changes = []
      if (oldModel.input !== model.input) changes.push(`input $${oldModel.input}→$${model.input}`)
      if (oldModel.output !== model.output) changes.push(`output $${oldModel.output}→$${model.output}`)
      if (oldModel.cacheDiscount !== model.cacheDiscount)
        changes.push(`cache ${oldModel.cacheDiscount * 100}%→${model.cacheDiscount * 100}%`)
      if (changes.length) console.log(`  ~ ${model.name}: ${changes.join(', ')}`)
    }
  }

  writeFileSync(PRICING_PATH, JSON.stringify(newPricing, null, 2) + '\n')
  console.log(`\n✓ Updated ${PRICING_PATH}`)
  console.log(`  lastUpdated: ${newPricing.lastUpdated}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
