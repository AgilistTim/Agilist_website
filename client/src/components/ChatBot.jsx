import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { MessageCircle, X, Waves } from 'lucide-react'
import { TextChat } from '@/components/chat/TextChat.jsx'
import { VoiceChat } from '@/components/chat/VoiceChat.jsx'
import { getAgentConfig, sendChatMessage } from '@/lib/api.js'

const INITIAL_GREETING = `Hi there! I'm Tim's AI consulting assistant. Ask me how AI can boost automation, speed to market, or customer experience and I'll respond with proven strategies tailored to SMBs.`

function createMessage(role, text) {
  const seed = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()
  return {
    id: `${role}-${seed}`,
    role,
    text
  }
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState('text')
  const [messages, setMessages] = useState(() => [createMessage('assistant', INITIAL_GREETING)])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [config, setConfig] = useState(null)
  const [configError, setConfigError] = useState(null)

  useEffect(() => {
    getAgentConfig()
      .then((data) => {
        setConfig(data)
      })
      .catch((err) => {
        console.error('Failed to load agent config', err)
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

    try {
      const historyForApi = [...messages, userEntry].map(({ role, text }) => ({ role, text }))
      const result = await sendChatMessage({ messages: historyForApi })

      const assistantEntry = createMessage('assistant', result.response || '')
      setMessages((prev) => [...prev, assistantEntry])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceHistorySync = (historyMessages) => {
    setMessages(historyMessages.map((msg) => createMessage(msg.role, msg.text)))
  }

  const disabled = Boolean(configError) || !config

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen((prev) => !prev)}
          className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 rounded-full w-14 h-14 shadow-lg pulse-cyan"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] lg:w-[420px] z-50">
          <Card className="bg-slate-900 border-slate-700 shadow-xl flex flex-col">
            <CardHeader className="bg-gradient-to-r from-cyan-400 to-purple-600 text-slate-900 rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-cyan-400 font-bold text-sm">
                    AI
                  </span>
                  Tim's AI Assistant
                </span>
                <Badge className="bg-slate-900/40 text-slate-900">
                  {mode === 'text' ? 'Text' : 'Voice'} mode
                </Badge>
              </CardTitle>
              <p className="text-sm text-slate-800">
                Powered by OpenAI realtime voice and RAG over Tim's consulting playbook
              </p>
            </CardHeader>
            <CardContent className="bg-slate-900 border-b border-slate-800 flex gap-2 p-4">
              <Button
                variant={mode === 'text' ? 'default' : 'outline'}
                className={mode === 'text' ? 'bg-cyan-400 text-slate-900 hover:bg-cyan-500' : ''}
                onClick={() => setMode('text')}
                disabled={disabled}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Text Chat
              </Button>
              <Button
                variant={mode === 'voice' ? 'default' : 'outline'}
                className={mode === 'voice' ? 'bg-cyan-400 text-slate-900 hover:bg-cyan-500' : ''}
                onClick={() => setMode('voice')}
                disabled={disabled}
              >
                <Waves className="h-4 w-4 mr-2" />
                Voice Chat
              </Button>
            </CardContent>
            <div className="p-4">
              {configError ? (
                <div className="text-sm text-red-400">{configError}</div>
              ) : mode === 'text' ? (
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
          </Card>
        </div>
      )}
    </>
  )
}
