import { useEffect, useMemo, useState } from 'react'
import { TextChat } from '@/components/chat/TextChat.jsx'
import { VoiceChat } from '@/components/chat/VoiceChat.jsx'
import { Button } from '@/components/ui/button.jsx'
import { getAgentConfig, sendChatMessage } from '@/lib/api.js'
import { initAnalytics, analytics } from '@/lib/analytics.js'
import { MessageCircle, Mic } from 'lucide-react'

const INITIAL_GREETING =
  "Hi! I'm Tim's AI assistant. Ask me about organisational transformation, AI adoption, or how to work with Tim."
const STORAGE_KEY = 'agilist_chat_history'

function createMessage(role, text) {
  const seed = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()
  return {
    id: `${role}-${seed}`,
    role,
    text
  }
}

function loadStoredMessages() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null

    const hydrated = parsed
      .filter((entry) => entry && typeof entry.role === 'string' && typeof entry.text === 'string')
      .map((entry) => createMessage(entry.role, entry.text))

    return hydrated.length > 0 ? hydrated : null
  } catch (err) {
    console.warn('Failed to read stored chat history', err)
    return null
  }
}

export default function AssistantSection() {
  const [messages, setMessages] = useState(() => loadStoredMessages() ?? [createMessage('assistant', INITIAL_GREETING)])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [config, setConfig] = useState(null)
  const [configError, setConfigError] = useState(null)
  const [chatMode, setChatMode] = useState('text')

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    try {
      const serializable = messages.map(({ role, text }) => ({ role, text }))
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable.slice(-100)))
    } catch (err) {
      console.warn('Failed to persist chat history', err)
    }
    return undefined
  }, [messages])

  useEffect(() => {
    getAgentConfig()
      .then((data) => {
        setConfig(data)
      })
      .catch(() => {
        setConfigError('Unable to load assistant configuration. Please try again later.')
      })
  }, [])

  const instructions = useMemo(() => config?.instructions ?? '', [config])

  const handleSend = async (userMessage) => {
    if (!config) {
      setError('Assistant configuration is still loading. Please wait a moment.')
      return
    }

    setError(null)
    const userEntry = createMessage('user', userMessage)
    setMessages((prev) => [...prev, userEntry])
    setLoading(true)

    const assistantId = `assistant-${Date.now()}`
    const streamingMessage = { id: assistantId, role: 'assistant', text: '' }
    setMessages((prev) => [...prev, streamingMessage])

    try {
      const historyForApi = [...messages, userEntry].map(({ role, text }) => ({ role, text }))

      await sendChatMessage({
        messages: historyForApi,
        onChunk: (delta, fullText) => {
          setMessages((prev) =>
            prev.map((msg) => msg.id === assistantId ? { ...msg, text: fullText } : msg)
          )
        }
      })
    } catch (err) {
      console.error(err)
      setError(err.message)
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantId))
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceHistorySync = (historyMessages) => {
    setMessages(historyMessages.slice(-100).map((msg) => createMessage(msg.role, msg.text)))
  }

  const handleClearHistory = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch (err) {
      console.warn('Failed to clear chat history', err)
    }

    analytics.historyCleared()
    setMessages([createMessage('assistant', INITIAL_GREETING)])
    setError(null)
    setLoading(false)
  }

  const disabledAssistant = Boolean(configError) || !config

  return (
    <section id="assistant" className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
          <div data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Talk to my AI</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Ask me anything. Literally.</h2>
            <p className="text-[#A1A1AA] mt-4">
              This is an AI trained on my diagnostic approach, transformation methodology, and thinking.
              Ask it about organisational change, AI adoption, operating model design, or anything else.
              It starts with understanding your problem &mdash; not selling solutions.
            </p>
          </div>
          <div data-aos="fade-up" data-aos-delay="100">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={chatMode === 'text' ? 'default' : 'outline'}
                  className={chatMode === 'text' ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]' : 'border-[#2A2A35] text-[#A1A1AA] hover:text-white'}
                  onClick={() => setChatMode('text')}
                  disabled={disabledAssistant}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Text
                </Button>
                <Button
                  size="sm"
                  variant={chatMode === 'voice' ? 'default' : 'outline'}
                  className={chatMode === 'voice' ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]' : 'border-[#2A2A35] text-[#A1A1AA] hover:text-white'}
                  onClick={() => setChatMode('voice')}
                  disabled={disabledAssistant}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Voice
                </Button>
              </div>
              <button
                type="button"
                onClick={handleClearHistory}
                className="ml-auto text-xs text-[#A1A1AA] hover:text-white transition-colors"
              >
                Clear history
              </button>
            </div>
            {configError ? (
              <p className="text-sm text-red-400">{configError}</p>
            ) : chatMode === 'text' ? (
              <TextChat messages={messages} onSend={handleSend} loading={loading} error={error} />
            ) : (
              <VoiceChat
                instructions={instructions}
                messages={messages}
                vectorStoreId={config?.vectorStoreId || null}
                realtimeModel={config?.realtimeModel}
                onConversationUpdate={handleVoiceHistorySync}
              />
            )}
          </div>
        </div>
        {disabledAssistant && (
          <p className="mt-4 text-sm text-[#A1A1AA]">Assistant is loading. Please wait a moment.</p>
        )}
      </div>
    </section>
  )
}
