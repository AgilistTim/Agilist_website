import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createVoiceSession } from '@/lib/api.js'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Mic, MicOff, Loader2, Volume2, RefreshCw } from 'lucide-react'

const DEFAULT_NAME = "Tim's AI Assistant"
const DEFAULT_GREETING =
  "Hi there! I'm Tim's AI assistant. Ask about AI transformation, foresight, or regulated sectors and I'll respond in Tim's voice."
const LOCKED_VOICE = 'marin'
const VOICE_OPENING_DIRECTIVE =
  "VOICE MODE: Keep ALL responses extremely brief (3-4 sentences maximum). For voice, always open by greeting the listener, introducing yourself as Tim's AI assistant in one sentence, and inviting their question. Keep every response concise and conversational."

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
  const [realtimeDeps, setRealtimeDeps] = useState(null)
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
    if (!realtimeDeps?.fileSearchTool) return []
    if (vectorStoreId) {
      return [realtimeDeps.fileSearchTool(vectorStoreId)]
    }
    return []
  }, [realtimeDeps, vectorStoreId])

  useEffect(() => {
    let active = true

    const loadDeps = async () => {
      try {
        const [realtimeModule, openAiModule] = await Promise.all([
          import('@openai/agents/realtime'),
          import('@openai/agents-openai')
        ])

        if (!active) return
        setRealtimeDeps({
          RealtimeAgent: realtimeModule.RealtimeAgent,
          RealtimeSession: realtimeModule.RealtimeSession,
          fileSearchTool: openAiModule.fileSearchTool
        })
      } catch (err) {
        console.error('Failed to load realtime voice dependencies', err)
        if (active) {
          setError('Voice chat dependencies failed to load. Please refresh and try again.')
        }
      }
    }

    loadDeps()

    return () => {
      active = false
    }
  }, [])

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
      if (!realtimeDeps?.RealtimeAgent || !realtimeDeps?.RealtimeSession) {
        throw new Error('Voice chat is still loading. Please try again in a moment.')
      }

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

      const agent = new realtimeDeps.RealtimeAgent({
        name: DEFAULT_NAME,
        instructions: voiceInstructions,
        voice: voice || LOCKED_VOICE,
        tools
      })

      const session = new realtimeDeps.RealtimeSession(agent, {
        transport: 'webrtc',
        config: {
          model: model || realtimeModel,
          audio: {
            output: { voice: voice || LOCKED_VOICE }
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500
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
  const depsReady = Boolean(realtimeDeps?.RealtimeAgent && realtimeDeps?.RealtimeSession)

  return (
    <Card className="bg-[#16161A] border-[#2A2A35]">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/40">
            <Volume2 className="h-3 w-3 mr-1" />
            Live Voice
          </Badge>
        </div>
        <div className="space-y-2 text-sm text-[#A1A1AA]">
          <p>Start a realtime conversation with Tim's consulting playbook. Grant microphone access to enable voice.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isIdle && !depsReady && (
            <Button disabled className="bg-[#7C3AED]/60 text-white" size="lg">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Loading Voice Tools
            </Button>
          )}
          {isIdle && depsReady && (
            <Button onClick={startVoice} className="bg-[#7C3AED] text-white hover:bg-[#6D28D9]" size="lg">
              <Mic className="h-5 w-5 mr-2" />
              Start Voice Chat
            </Button>
          )}
          {isConnecting && (
            <Button disabled className="bg-[#7C3AED]/60 text-white" size="lg">
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
              <Button onClick={handleReset} variant="outline" className="border-[#2A2A35] text-[#A1A1AA]" size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Conversation
              </Button>
            </>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="bg-[#0D0D0F] border border-[#2A2A35] rounded-lg p-4 h-32 overflow-y-auto text-sm text-[#F4F4F5]">
          {transcript ? transcript : 'Assistant transcript will appear here during the conversation.'}
        </div>
      </CardContent>
    </Card>
  )
}
