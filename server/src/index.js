import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = path.resolve(__dirname, '..')

function resolveAgentInstructionsFromFile(filePath) {
  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(SERVER_ROOT, filePath)

  try {
    console.log('[agent-config] Attempting to read instructions file:', resolvedPath)
    const content = readFileSync(resolvedPath, 'utf8')
    const trimmed = content.trim()

    if (!trimmed) {
      console.warn('[agent-config] Instructions file is empty:', resolvedPath)
      return null
    }

    console.log('[agent-config] Loaded instructions file successfully. Length:', trimmed.length)
    return trimmed
  } catch (error) {
    console.warn('[agent-config] Failed to read instructions file:', resolvedPath, error)
    return null
  }
}

// ── OpenAI / Agent config ──────────────────────────────────────────────
const PORT = process.env.PORT || 4000
const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID
const REALTIME_MODEL =
  process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17'
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-5-nano'
const AVAILABLE_VOICES = (
  process.env.OPENAI_REALTIME_VOICES &&
  process.env.OPENAI_REALTIME_VOICES.split(',').map((voice) => voice.trim()).filter(Boolean)
) || ['alloy', 'breeze', 'coral', 'marin', 'sage', 'verse']

const AGENT_INSTRUCTIONS =
  (process.env.OPENAI_AGENT_INSTRUCTIONS_FILE &&
    resolveAgentInstructionsFromFile(process.env.OPENAI_AGENT_INSTRUCTIONS_FILE)) ||
  process.env.OPENAI_AGENT_INSTRUCTIONS ||
  `You are Tim Robinson's AI consulting assistant. Blend executive-level clarity with practical, ROI-focused recommendations for SMB leaders evaluating AI adoption. Always ground advice in Tim's experience, and reference the consulting playbook when relevant.`

// ── Admin / Auth config ────────────────────────────────────────────────
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY || '2h'
const GITHUB_PAT = process.env.GITHUB_PAT
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'AgilistTim'
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || 'Agilist_website'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : ['https://www.agilist.co.uk', 'https://agilist.co.uk']

// ── Startup diagnostics ────────────────────────────────────────────────
console.log('[agent-config] Environment overview:', {
  hasApiKey: Boolean(process.env.OPENAI_API_KEY),
  realtimeModel: process.env.OPENAI_REALTIME_MODEL,
  textModel: process.env.OPENAI_TEXT_MODEL,
  instructionsFile: process.env.OPENAI_AGENT_INSTRUCTIONS_FILE,
  instructionsLoaded: AGENT_INSTRUCTIONS ? `${AGENT_INSTRUCTIONS.slice(0, 60)}...` : null,
  vectorStoreId: VECTOR_STORE_ID,
  voices: AVAILABLE_VOICES
})

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set. API requests will fail.')
}
if (!ADMIN_PASSWORD_HASH) {
  console.warn('Warning: ADMIN_PASSWORD_HASH is not set. Admin login will be disabled.')
}
if (!JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Admin login will be disabled.')
}
if (!GITHUB_PAT) {
  console.warn('Warning: GITHUB_PAT is not set. Blog publishing will fail.')
}

// Use a placeholder key to avoid constructor crash — actual calls will fail gracefully
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'not-configured' })

// ── Express app ────────────────────────────────────────────────────────
const app = express()

// CORS — restrict to known origins (+ localhost in dev)
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (server-to-server, curl, health checks)
      if (!origin) return callback(null, true)
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
      // In development, also allow localhost
      if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost')) {
        return callback(null, true)
      }
      callback(new Error('CORS: Origin not allowed'))
    },
    credentials: true
  })
)

app.use(express.json())

// ── Rate limiter for login ─────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' }
})

// ── Auth middleware ────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  const token = authHeader.slice(7)

  if (!JWT_SECRET) {
    return res.status(503).json({ error: 'Authentication is not configured on this server.' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.admin = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' })
    }
    return res.status(401).json({ error: 'Invalid token.' })
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/voice-options', (_req, res) => {
  res.json({
    model: REALTIME_MODEL,
    voices: AVAILABLE_VOICES
  })
})

app.get('/api/agent-config', (_req, res) => {
  res.json({
    instructions: AGENT_INSTRUCTIONS,
    textModel: TEXT_MODEL,
    realtimeModel: REALTIME_MODEL,
    voices: AVAILABLE_VOICES,
    vectorStoreId: VECTOR_STORE_ID || null
  })
})

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body || {}

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Request must include a non-empty messages array.' })
    }

    const conversation = []

    for (const message of messages) {
      if (!message || typeof message.role !== 'string' || typeof message.text !== 'string') {
        continue
      }

      conversation.push({
        role: message.role,
        type: 'message',
        content: message.text
      })
    }

    if (VECTOR_STORE_ID) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((entry) => entry && entry.role === 'user' && typeof entry.text === 'string' && entry.text.trim().length > 0)

      if (lastUserMessage) {
        try {
          const searchResults = await openai.vectorStores.search(VECTOR_STORE_ID, {
            query: lastUserMessage.text,
            max_num_results: 5
          })

          const snippets = []

          for (const item of searchResults.data ?? []) {
            const source = item.filename || item.file_id
            for (const chunk of item.content ?? []) {
              if (chunk?.text) {
                snippets.push(`Source: ${source}\n${chunk.text.trim()}`)
              }
            }
          }

          if (snippets.length > 0) {
            conversation.push({
              role: 'developer',
              type: 'message',
              content: `Relevant context from consulting knowledge base:\n\n${snippets.join('\n\n')}`
            })
          }
        } catch (searchError) {
          console.warn('Vector store search failed:', searchError)
        }
      }
    }

    const stream = await openai.responses.stream({
      model: TEXT_MODEL,
      instructions: AGENT_INSTRUCTIONS,
      input: conversation
    })

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    for await (const chunk of stream) {
      if (chunk.type === 'response.output_text.delta') {
        res.write(`data: ${JSON.stringify({ type: 'delta', text: chunk.delta })}\n\n`)
      } else if (chunk.type === 'response.output_text.done') {
        res.write(`data: ${JSON.stringify({ type: 'done', text: chunk.text })}\n\n`)
      } else if (chunk.type === 'response.done') {
        res.write(`data: ${JSON.stringify({
          type: 'complete',
          metadata: { model: chunk.response?.model, id: chunk.response?.id }
        })}\n\n`)
        res.end()
      }
    }
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: error.message || 'Unknown error' })
  }
})

app.post('/api/voice-token', async (req, res) => {
  try {
    const { model = REALTIME_MODEL, voice = AVAILABLE_VOICES[0] } = req.body || {}

    const sessionConfig = {
      session: {
        type: 'realtime',
        model,
        instructions: AGENT_INSTRUCTIONS,
        audio: {
          output: { voice }
        }
      }
    }

    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionConfig)
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Realtime client secret request failed (${response.status}): ${body}`)
    }

    const session = await response.json()

    res.json({
      token: session?.value,
      expiresAt: session?.expires_at,
      model,
      voice
    })
  } catch (error) {
    console.error('Voice token error:', error)
    res.status(500).json({ error: error.message || 'Failed to create realtime session.' })
  }
})

// ═══════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS (JWT-protected)
// ═══════════════════════════════════════════════════════════════════════

// ── Login ──────────────────────────────────────────────────────────────
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  try {
    const { password } = req.body || {}

    if (!password) {
      return res.status(400).json({ error: 'Password is required.' })
    }

    if (!ADMIN_PASSWORD_HASH || !JWT_SECRET) {
      return res.status(503).json({ error: 'Admin authentication is not configured.' })
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password.' })
    }

    const token = jwt.sign(
      { role: 'admin', iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    )

    res.json({ token, expiresIn: JWT_EXPIRY })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed.' })
  }
})

// ── Verify token ───────────────────────────────────────────────────────
app.get('/api/admin/verify', requireAdmin, (_req, res) => {
  res.json({ valid: true })
})

// ── Publish blog to GitHub ─────────────────────────────────────────────
app.post('/api/admin/publish-blog', requireAdmin, async (req, res) => {
  try {
    const { filename, content, commitMessage } = req.body || {}

    if (!filename || !content) {
      return res.status(400).json({ error: 'filename and content are required.' })
    }

    if (!GITHUB_PAT) {
      return res.status(503).json({ error: 'GitHub integration is not configured.' })
    }

    // Sanitize filename to prevent path traversal
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '-')
    if (safeFilename !== filename) {
      console.warn(`[publish-blog] Filename sanitized: "${filename}" -> "${safeFilename}"`)
    }

    const filePath = `client/src/content/blog/${safeFilename}`
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`
    const message = commitMessage || `Add blog post: ${safeFilename}`

    // 1. Check if file already exists (to get SHA for updates)
    let sha
    const getRes = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${GITHUB_PAT}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })

    if (getRes.ok) {
      const data = await getRes.json()
      sha = data.sha
    }

    // 2. Create or update the file
    const body = {
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      branch: GITHUB_BRANCH
    }
    if (sha) body.sha = sha

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_PAT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!putRes.ok) {
      const errorData = await putRes.json().catch(() => ({}))
      throw new Error(errorData.message || `GitHub API returned ${putRes.status}`)
    }

    const result = await putRes.json()

    res.json({
      success: true,
      htmlUrl: result.content?.html_url,
      sha: result.content?.sha
    })
  } catch (error) {
    console.error('Publish blog error:', error)
    res.status(500).json({ error: error.message || 'Failed to publish blog.' })
  }
})

// ── Upload to vector store ─────────────────────────────────────────────
app.post('/api/admin/upload-to-vectorstore', requireAdmin, async (req, res) => {
  try {
    const { content, fileName } = req.body || {}

    if (!content || !fileName) {
      return res.status(400).json({ error: 'Content and fileName are required' })
    }

    if (!VECTOR_STORE_ID) {
      return res.status(500).json({ error: 'Vector store not configured' })
    }

    // Create file in OpenAI using Buffer
    const buffer = Buffer.from(content, 'utf-8')
    const file = await openai.files.create({
      file: new File([buffer], fileName, { type: 'text/markdown' }),
      purpose: 'assistants'
    })

    // Add to vector store
    await openai.vectorStores.files.create(VECTOR_STORE_ID, {
      file_id: file.id
    })

    res.json({
      success: true,
      fileId: file.id,
      fileName,
      vectorStoreId: VECTOR_STORE_ID
    })
  } catch (error) {
    console.error('Upload to vector store error:', error)
    res.status(500).json({ error: error.message || 'Failed to upload to vector store' })
  }
})

// ── Tombstone: old unprotected endpoint ────────────────────────────────
app.post('/api/upload-blog-to-vectorstore', (_req, res) => {
  res.status(410).json({
    error: 'This endpoint has been removed. Use /api/admin/upload-to-vectorstore with authentication.'
  })
})

// ═══════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
