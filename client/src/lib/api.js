const API_BASE_URL =
  import.meta.env.PUBLIC_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:4000'

export async function sendChatMessage({ messages, onChunk }) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to contact assistant')
  }

  // If no onChunk callback, return full response (backward compatible)
  if (!onChunk) {
    return response.json()
  }

  // Handle streaming response
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6))

          if (data.type === 'delta') {
            fullText += data.text
            onChunk(data.text, fullText)
          } else if (data.type === 'done') {
            fullText = data.text
            onChunk('', fullText)
          } else if (data.type === 'complete') {
            return { response: fullText, metadata: data.metadata }
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return { response: fullText }
}

export async function createVoiceSession({ model, voice, instructions } = {}) {
  const response = await fetch(`${API_BASE_URL}/api/voice-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, voice, ...(instructions ? { instructions } : {}) })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to create voice session token')
  }

  return response.json()
}

export async function getVoiceOptions() {
  const response = await fetch(`${API_BASE_URL}/api/voice-options`)

  if (!response.ok) {
    throw new Error('Failed to fetch voice options')
  }

  return response.json()
}

export async function getAgentConfig() {
  const response = await fetch(`${API_BASE_URL}/api/agent-config`)

  if (!response.ok) {
    throw new Error('Failed to fetch agent configuration')
  }

  return response.json()
}

export { API_BASE_URL }
