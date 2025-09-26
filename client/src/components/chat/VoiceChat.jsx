import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime'
import { fileSearchTool } from '@openai/agents-openai'
import { createVoiceSession } from '@/lib/api.js'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Mic, MicOff, Loader2, Volume2, RefreshCw } from 'lucide-react'

const DEFAULT_NAME = "Tim's AI Assistant"
const DEFAULT_GREETING =
  "Hi there! I'm Tim's AI assistant. Ask how AI can accelerate your business and I'll tailor recommendations for SMB leaders."
const LOCKED_VOICE = 'marin'
const VOICE_OPENING_DIRECTIVE =
  "Always open a fresh voice session by speaking first: greet the listener, introduce yourself as Tim's AI assistant, explain you can draw on Tim's consulting playbook, and invite their first question. Keep it warm and concise."

function toRealtimeHistory(messages) {
  const items = []
  let previousItemId = null

  messages.forEach((message, index) => {
    if (!message?.text) return

    const itemId = `hist_${index}_${message.role}`

    if (message.role === 'assistant') {
      items.push({
        type: 'message',
        role: 'assistant',
        status: 'completed',
        content: [
          {
            type: 'output_text',
            text: message.text
          }
        ],
        itemId,
        previousItemId
      })
    } else {
      items.push({
        type: 'message',
        role: 'user',
        status: 'completed',
        content: [
          {
            type: 'input_text',
            text: message.text
          }
        ],
        itemId,
        previousItemId
      })
    }

    previousItemId = itemId
  })

  return items
}

function reduceHistoryToMessages(history) {
  const output = []

  history.forEach((item) => {
    if (item.type !== 'message') return
    if (item.role !== 'assistant' && item.role !== 'user') return

    let text = ''
    if (Array.isArray(item.content)) {
      for (const chunk of item.content) {
        if (chunk?.type === 'output_text' && typeof chunk.text === 'string') {
          text += chunk.text
        }
        if (chunk?.type === 'output_audio' && typeof chunk.transcript === 'string') {
          text += chunk.transcript
        }
        if (chunk?.type === 'input_text' && typeof chunk.text === 'string') {
          text += chunk.text
        }
        if (chunk?.type === 'input_audio' && typeof chunk.transcript === 'string') {
          text += chunk.transcript
        }
      }
    }

    if (text.trim().length > 0) {
      output.push({ role: item.role, text: text.trim() })
    }
  })

  return output
}

export function VoiceChat({ instructions, messages, vectorStoreId, realtimeModel, onConversationUpdate }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [transcript, setTranscript] = useState('')
  const sessionRef = useRef(null)

  const voiceInstructions = useMemo(() => {
    if (!instructions || instructions.trim().length === 0) {
      return VOICE_OPENING_DIRECTIVE
    }

    const normalized = instructions.trim()
    if (normalized.includes(VOICE_OPENING_DIRECTIVE)) {
      return normalized
    }

    return `${normalized}\n\n${VOICE_OPENING_DIRECTIVE}`
  }, [instructions])

  const tools = useMemo(() => {
    if (vectorStoreId) {
      return [fileSearchTool(vectorStoreId)]
    }
    return []
  }, [vectorStoreId])

  const teardown = useCallback(() => {
    if (sessionRef.current) {
      try {
        sessionRef.current.close()
      } catch (err) {
        console.warn('Error closing realtime session', err)
      }
      sessionRef.current = null
    }
    setStatus('idle')
  }, [])

  useEffect(() => {
    return () => {
      teardown()
    }
  }, [teardown])

  const startVoice = async () => {
    if (status === 'connecting' || status === 'connected') {
      return
    }

    try {
      setError(null)
      setTranscript('')
      setStatus('connecting')

      if (!realtimeModel) {
        throw new Error('Realtime model configuration missing. Refresh and try again.')
      }

      const { token, model, voice } = await createVoiceSession({
        model: realtimeModel,
        voice: LOCKED_VOICE,
        instructions: voiceInstructions
      })

      if (!token) {
        throw new Error('Realtime client token not returned by the server.')
      }

      const agent = new RealtimeAgent({
        name: DEFAULT_NAME,
        instructions: voiceInstructions,
        voice: voice || LOCKED_VOICE,
        tools
      })

      const session = new RealtimeSession(agent, {
        transport: 'webrtc',
        config: {
          model: model || realtimeModel,
          audio: {
            output: { voice: voice || LOCKED_VOICE }
          }
        }
      })

      session.on('history_updated', (history) => {
        const simplified = reduceHistoryToMessages(history)
        if (simplified.length > 0) {
          setTranscript(simplified[simplified.length - 1].text || '')
          if (onConversationUpdate) {
            onConversationUpdate(simplified)
          }
        }
      })

      session.on('error', ({ error: sessionError }) => {
        console.error('Realtime session error', sessionError)
        setError('Realtime session encountered an error. Try restarting the conversation.')
      })

      await session.connect({
        apiKey: token,
        model: model || realtimeModel
      })

      const seededHistory = toRealtimeHistory(messages)
      const shouldSeedHistory = messages?.some((message) => message.role === 'user')
      if (shouldSeedHistory && seededHistory.length > 0) {
        try {
          session.updateHistory(seededHistory)
        } catch (historyError) {
          console.warn('Failed to seed realtime history', historyError)
        }
      }

      sessionRef.current = session
      setStatus('connected')
      try {
        session.transport?.sendEvent({ type: 'response.create' })
      } catch (introError) {
        console.warn('Failed to trigger opening response', introError)
      }
    } catch (err) {
      console.error('Failed to start realtime session', err)
      setError(err.message)
      teardown()
    }
  }

  const handleStop = () => {
    teardown()
  }

  const handleReset = () => {
    teardown()
    const greeting = messages[0] ?? { role: 'assistant', text: DEFAULT_GREETING }
    onConversationUpdate?.([greeting])
    setTranscript('')
    setError(null)
  }

  const isIdle = status === 'idle'
  const isConnecting = status === 'connecting'
  const isConnected = status === 'connected'

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-cyan-400/20 text-cyan-300 border-cyan-400/40">
            <Volume2 className="h-3 w-3 mr-1" />
            Live AI Voice
          </Badge>
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <p>
            Start a realtime conversation with Tim's consulting playbook. Grant microphone access to enable voice.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isIdle && (
            <Button onClick={startVoice} className="bg-cyan-400 text-slate-900 hover:bg-cyan-500" size="lg">
              <Mic className="h-5 w-5 mr-2" />
              Start Voice Chat
            </Button>
          )}
          {isConnecting && (
            <Button disabled className="bg-cyan-400/60 text-slate-900" size="lg">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Connecting…
            </Button>
          )}
          {isConnected && (
            <>
              <Button onClick={handleStop} variant="outline" className="border-red-400 text-red-300" size="lg">
                <MicOff className="h-5 w-5 mr-2" />
                Stop Voice Chat
              </Button>
              <Button onClick={handleReset} variant="outline" className="border-slate-600 text-slate-300" size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Conversation
              </Button>
            </>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 h-32 overflow-y-auto text-sm text-slate-200">
          {transcript ? transcript : 'Assistant transcript will appear here during the conversation.'}
        </div>
      </CardContent>
    </Card>
  )
}
