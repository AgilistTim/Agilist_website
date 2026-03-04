#!/usr/bin/env node
import 'dotenv/config'
import OpenAI from 'openai'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = path.resolve(__dirname, '../../client/src/content/blog')
const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID

if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable not set')
  process.exit(1)
}

if (!VECTOR_STORE_ID) {
  console.error('Error: OPENAI_VECTOR_STORE_ID environment variable not set')
  process.exit(1)
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function uploadBlogToVectorStore(filePath, fileName) {
  try {
    console.log(`\n📄 Processing: ${fileName}`)

    const content = readFileSync(filePath, 'utf-8')

    // Create a file in OpenAI
    console.log('  → Uploading to OpenAI...')
    const file = await openai.files.create({
      file: new Blob([content], { type: 'text/markdown' }),
      purpose: 'assistants'
    })

    console.log(`  ✓ File created: ${file.id}`)

    // Add file to vector store
    console.log('  → Adding to vector store...')
    await openai.vectorStores.files.create(VECTOR_STORE_ID, {
      file_id: file.id
    })

    console.log(`  ✓ Added to vector store`)

    return { success: true, fileName, fileId: file.id }
  } catch (error) {
    console.error(`  ✗ Error processing ${fileName}:`, error.message)
    return { success: false, fileName, error: error.message }
  }
}

async function main() {
  console.log('🚀 Blog Vector Store Upload Script')
  console.log(`📁 Blog directory: ${BLOG_DIR}`)
  console.log(`🗃️  Vector store ID: ${VECTOR_STORE_ID}`)
  console.log('\n' + '='.repeat(60))

  // Get all markdown files in blog directory
  const files = readdirSync(BLOG_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      name: file,
      path: path.join(BLOG_DIR, file)
    }))

  console.log(`\nFound ${files.length} blog post(s) to upload\n`)

  const results = []

  for (const file of files) {
    const result = await uploadBlogToVectorStore(file.path, file.name)
    results.push(result)

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Upload Summary:')
  console.log(`  ✓ Successful: ${results.filter(r => r.success).length}`)
  console.log(`  ✗ Failed: ${results.filter(r => !r.success).length}`)

  const failed = results.filter(r => !r.success)
  if (failed.length > 0) {
    console.log('\n❌ Failed uploads:')
    failed.forEach(f => console.log(`  - ${f.fileName}: ${f.error}`))
  }

  console.log('\n✅ Done!')
}

main().catch(console.error)
