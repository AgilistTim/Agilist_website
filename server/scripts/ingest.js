import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const PROJECT_ROOT = path.resolve(process.cwd(), '..')
const DOC_GLOBS = ['*.md', 'client/src/content/**/*.md']
const TMP_DIR = path.resolve(process.cwd(), 'tmp')

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment')
  }

  let vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID

  if (!vectorStoreId) {
    const vectorStore = await openai.beta.vectorStores.create({
      name: 'tim-robinson-ai-consulting'
    })
    vectorStoreId = vectorStore.id
    console.log('Created vector store:', vectorStoreId)
  } else {
    console.log('Using existing vector store:', vectorStoreId)
  }

  await fs.promises.mkdir(TMP_DIR, { recursive: true })

  const files = await collectDocs()

  if (files.length === 0) {
    console.log('No documents found to ingest.')
    return
  }

  console.log(`Preparing ${files.length} documents for upload...`)

  const uploadFiles = []

  for (const filePath of files) {
    const content = await fs.promises.readFile(filePath, 'utf8')
    const relative = path.relative(PROJECT_ROOT, filePath)
    const decorated = `# Source: ${relative}\n\n${content}`
    const tmpPath = path.join(TMP_DIR, sanitizeFilename(relative) + '.txt')
    await fs.promises.writeFile(tmpPath, decorated, 'utf8')
    uploadFiles.push({ original: relative, tmpPath })
  }

  console.log('Uploading files to vector store...')

  const fileStreams = uploadFiles.map(({ tmpPath }) => fs.createReadStream(tmpPath))

  const batch = await openai.beta.vectorStores.fileBatches.uploadAndPoll(
    vectorStoreId,
    {
      files: fileStreams
    }
  )

  if (batch.status !== 'completed') {
    console.warn('File batch status:', batch.status)
  } else {
    console.log('All files processed successfully.')
  }

  console.log('Vector store ID:', vectorStoreId)
  console.log('Add this to your server .env as OPENAI_VECTOR_STORE_ID')
}

async function collectDocs() {
  const allPaths = []

  for (const pattern of DOC_GLOBS) {
    const matches = await glob(pattern, { cwd: PROJECT_ROOT })
    for (const match of matches) {
      const fullPath = path.join(PROJECT_ROOT, match)
      allPaths.push(fullPath)
    }
  }

  return allPaths
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9-_]+/g, '_')
}

function glob(pattern, options) {
  return new Promise((resolve, reject) => {
    import('glob')
      .then(({ glob }) => {
        glob(pattern, options, (err, matches) => {
          if (err) {
            reject(err)
          } else {
            resolve(matches)
          }
        })
      })
      .catch(reject)
  })
}

main().catch((error) => {
  console.error('Ingestion failed:', error)
  process.exit(1)
})
