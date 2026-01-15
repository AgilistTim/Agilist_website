const API_BASE_URL =
  import.meta.env.PUBLIC_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:4000'

export async function sendChatMessage({ messages }) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Failed to contact assistant')
  }

  return response.json()
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
