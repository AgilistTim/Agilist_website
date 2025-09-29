import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'
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

const PORT = process.env.PORT || 4000
const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID
const REALTIME_MODEL =
  process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17'
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-5-nano'
const AGENT_INSTRUCTIONS =
  (process.env.OPENAI_AGENT_INSTRUCTIONS_FILE &&
    resolveAgentInstructionsFromFile(process.env.OPENAI_AGENT_INSTRUCTIONS_FILE)) ||
  process.env.OPENAI_AGENT_INSTRUCTIONS ||
  `You are Tim Robinson's AI consulting assistant. Blend executive-level clarity with practical, ROI-focused recommendations for SMB leaders evaluating AI adoption. Always ground advice in Tim's experience, and reference the consulting playbook when relevant.`

console.log('[agent-config] Environment overview:', {
  hasApiKey: Boolean(process.env.OPENAI_API_KEY),
  realtimeModel: process.env.OPENAI_REALTIME_MODEL,
  textModel: process.env.OPENAI_TEXT_MODEL,
  instructionsFile: process.env.OPENAI_AGENT_INSTRUCTIONS_FILE,
  instructionsLoaded: AGENT_INSTRUCTIONS ? `${AGENT_INSTRUCTIONS.slice(0, 60)}...` : null,
  vectorStoreId: VECTOR_STORE_ID,
  voices: AVAILABLE_VOICES
})

const AVAILABLE_VOICES = (
  process.env.OPENAI_REALTIME_VOICES &&
  process.env.OPENAI_REALTIME_VOICES.split(',').map((voice) => voice.trim()).filter(Boolean)
) || ['alloy', 'breeze', 'coral', 'marin', 'sage', 'verse']

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set. API requests will fail.')
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const app = express()
app.use(cors())
app.use(express.json())

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

    const response = await openai.responses.create({
      model: TEXT_MODEL,
      instructions: AGENT_INSTRUCTIONS,
      input: conversation
    })

    const outputText = response.output_text ?? ''

    res.json({
      response: outputText,
      metadata: {
        model: response.model,
        id: response.id
      }
    })
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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
