import { Fragment, useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Send, MessageCircle, Bot, Loader2 } from 'lucide-react'

export function TextChat({ messages, onSend, loading, error }) {
  const [value, setValue] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!value.trim() || loading) return

    await onSend(value.trim())
    setValue('')
  }

  const renderWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const segments = []
    let lastIndex = 0

    text.replace(urlRegex, (match, _, offset) => {
      if (offset > lastIndex) {
        segments.push(text.slice(lastIndex, offset))
      }
      segments.push(
        <a
          key={`${match}-${offset}`}
          href={match}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-200 underline underline-offset-4 hover:text-cyan-100"
        >
          {match}
        </a>
      )
      lastIndex = offset + match.length
      return match
    })

    if (lastIndex < text.length) {
      segments.push(text.slice(lastIndex))
    }

    return segments.map((segment, index) => (
      typeof segment === 'string' ? <Fragment key={index}>{segment}</Fragment> : segment
    ))
  }

  const renderAssistantMessage = (text) => {
    const blocks = text.split(/\n\s*\n/)
    return blocks.map((block, index) => (
      <p key={index} className="mb-3 last:mb-0 whitespace-pre-wrap leading-relaxed">
        {renderWithLinks(block)}
      </p>
    ))
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-0 flex flex-col h-[420px]">
        <div className="px-5 pt-5 flex items-center gap-2">
          <Badge className="bg-cyan-400/20 text-cyan-300 border-cyan-400/40">
            <MessageCircle className="h-3 w-3 mr-1" />
            AI Strategy Chat
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  message.role === 'user'
                    ? 'bg-cyan-400 text-slate-900'
                    : 'bg-slate-700/80 text-slate-100 border border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wide opacity-70">
                  {message.role === 'user' ? <MessageCircle className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  {message.role === 'user' ? 'You' : 'Tim\'s AI Assistant'}
                </div>
                <div className="text-sm">
                  {message.role === 'assistant'
                    ? renderAssistantMessage(message.text)
                    : <p className="whitespace-pre-wrap">{message.text}</p>}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-700/80 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-200 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="border-t border-slate-700 p-4">
          <div className="flex gap-2">
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Ask how AI can transform your business..."
              className="bg-slate-900 border-slate-700 text-white"
              disabled={loading}
            />
            <Button type="submit" disabled={loading} className="bg-cyan-400 hover:bg-cyan-500 text-slate-900">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
