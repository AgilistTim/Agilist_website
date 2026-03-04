import { useEffect, useMemo, useState } from 'react'
import AdminDashboard from './components/AdminDashboard'
import Blog from './components/Blog'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { TextChat } from '@/components/chat/TextChat.jsx'
import { VoiceChat } from '@/components/chat/VoiceChat.jsx'
import { getAgentConfig, sendChatMessage } from '@/lib/api.js'
import { initAnalytics, analytics } from '@/lib/analytics.js'
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Menu,
  MessageCircle,
  X,
  BookOpen,
  Globe,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './App.css'

const INITIAL_GREETING =
  "Hi! I'm Tim's AI assistant. Ask me about AI transformation, foresight, regulated sectors, or how to work with Tim."
const STORAGE_KEY = 'agilist_chat_history'

const bookCover = 'https://assets.lulu.com/cover_thumbs/v/8/v8mqjq4-front-shortedge-384.jpg'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
})

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

function App({ latestPosts = [] }) {
  const bookingLink = 'https://calendly.com/agilist/quick-chat'
  const bookFreeLink = 'https://books.genorg.ai'
  const bookReasoningLink = 'https://books.genorg.ai/pr'

  const trackRecord = [
    {
      project: 'Web-Coin',
      year: '2023',
      insight: 'The internet would need verifiable post attribution and anti-AI slop mechanisms to preserve human engagement and content quality.',
      link: 'https://github.com/AgilistTim/web-coin'
    },
    {
      project: 'GEO (Generative Engine Optimisation)',
      year: '2023',
      insight: 'AI would replace traditional search — two years before "GEO" became a category.'
    },
    {
      project: 'EvaCares',
      year: '2023',
      insight: 'AI voice companions for elderly care would become critical infrastructure.',
      link: 'https://www.evacares.co.uk'
    },
    {
      project: 'Project Bias',
      year: '2024',
      insight: 'Investment committees needed AI co-pilots to surface cognitive bias in real time.',
      link: 'https://www.mybias.co.uk'
    },
    {
      project: 'Delphi Decision Co-Pilot',
      year: '2024',
      insight: 'Strategic planning needed AI that could model scenarios and synthesize competing signals.',
      link: 'https://github.com/AgilistTim/Delphi'
    },
    {
      project: 'PodGuide',
      year: '2026',
      insight: 'Podcasters needed an AI co-pilot for the full episode lifecycle — from planning through live interview to content generation.',
      link: 'https://podguide.agilist.co.uk/'
    },
    {
      project: 'OBD-AI',
      year: '2026',
      insight: 'Vehicle diagnostics needed AI that could bridge complex automotive telemetry and human-readable insights — transforming how drivers maintain vehicles and buyers evaluate purchases.',
      link: 'https://github.com/AgilistTim/OBD-AI'
    }
  ]

  const featuredProjects = [
    {
      title: 'EvaCares',
      year: '2023',
      problem: 'Isolation and fragmented care signals in elderly support.',
      proof: 'Phone-first AI companion delivering wellbeing insights without new devices.',
      stack: ['Voice AI', 'RAG', 'Telephony', 'React'],
      link: 'https://www.evacares.co.uk',
      signal: 'Voice AI would become critical infrastructure for care — not through apps, but by meeting the elderly where they already are: on the phone.'
    },
    {
      title: 'Project Bias',
      year: '2024',
      problem: 'Investment committees miss hidden cognitive bias in high-stakes decisions.',
      proof: 'Bias fingerprinting engine that surfaces blind spots before capital is allocated.',
      stack: ['Next.js', 'OpenAI', 'Chart.js', 'Auth0'],
      link: 'https://www.mybias.co.uk',
      signal: 'High-stakes decisions needed real-time cognitive bias detection. Built before decision intelligence became a category.'
    },
    {
      title: 'GEO (Generative Engine Optimisation)',
      year: '2023',
      problem: 'Traditional SEO breaks when AI answers replace search results.',
      proof: 'Frameworks and tooling that optimise for AI retrieval, not page rank.',
      stack: ['LLMs', 'Search', 'Content systems'],
      signal: 'Called in 2023: AI would replace traditional search. Two years before "GEO" became an industry term.'
    },
    {
      title: 'Delphi Decision Co-Pilot',
      year: '2024',
      problem: 'Strategy teams need faster synthesis of competing signals.',
      proof: 'Scenario modelling with AI summaries that move decisions from debate to action.',
      stack: ['TypeScript', 'LangGraph', 'PostgreSQL'],
      link: 'https://github.com/AgilistTim/Delphi',
      signal: 'Strategic planning needed AI that could model scenarios and synthesize competing signals — not just summarize documents.'
    },
    {
      title: 'PodGuide',
      year: '2026',
      problem: 'Podcasters waste hours on prep, run interviews blind, then face a content cliff after recording.',
      proof: 'Full-lifecycle AI co-pilot: episode planning, 3 live interview modes (including a fully autonomous AI interviewer), and 10+ content pieces generated per episode. Invite-only beta live.',
      stack: ['GPT-4.1', 'ElevenLabs', 'Next.js'],
      link: 'https://podguide.agilist.co.uk/',
      signal: 'Podcast production would shift from post-production editing to AI-assisted live interview. Built the full lifecycle before the market saw the gap.'
    },
    {
      title: 'OBD-AI',
      year: '2026',
      problem: 'Vehicle diagnostics are impenetrable to non-mechanics, and pre-purchase inspections miss hidden risks.',
      proof: 'Professional-grade diagnostic platform bridging OBD2 telemetry and natural language. AI Mechanic correlates symptoms with live sensor data. Buyer Analysis mode delivers Purchase Risk Scores for used cars. Web Bluetooth integration — no app required.',
      stack: ['React', 'Gemini API', 'Web Bluetooth', 'TypeScript'],
      link: 'https://github.com/AgilistTim/OBD-AI',
      signal: 'Pre-purchase vehicle inspection needed AI that could interpret telemetry in real-time — transforming trust in the used car market.'
    }
  ]

  const engagementModels = [
    {
      title: 'Partner Track',
      description:
        'I generate the thesis. I build the POC. You handle commercialisation. We split the upside. This is how EvaCares was built, and how I want to build the next five.'
    },
    {
      title: 'Engage Track',
      description:
        "You have an AI challenge. I've probably already solved a version of it. Fixed-scope engagements, fast validation, no long retainers."
    }
  ]

  const publicSignals = [
    {
      title: 'SETsquared Bath Sessions',
      description: "As AI Advisor in Residence, you'll find me at First Thursday sessions and Third Thursday co-working at SETsquared Bath Innovation Centre.",
      link: 'https://www.eventbrite.co.uk/e/first-thursday-in-march-at-setsquared-bath-innovation-centre-tickets-1982873027603?aff=oddtdtcreator#organizer-card',
      linkText: 'View upcoming sessions'
    },
    {
      title: 'Long-form Articles',
      description: 'I share my thinking on AI transformation, foresight, and strategy through in-depth articles on LinkedIn.',
      link: 'https://www.linkedin.com/in/tim-robinson-agilist/recent-activity/articles/',
      linkText: 'Read the articles'
    },
    {
      title: 'Connect on LinkedIn',
      description: 'Always happy to discuss AI, process improvements, and transformation challenges.',
      link: 'https://www.linkedin.com/in/tim-robinson-agilist/',
      linkText: 'Connect with me'
    }
  ]

  const faqItems = [
    {
      question: 'Who is Tim Robinson AI?',
      answer:
        'Tim Robinson is a UK-based AI inventor and consultant known for building AI products ahead of market demand and guiding regulated-sector transformations.'
    },
    {
      question: 'What is GEO (Generative Engine Optimisation)?',
      answer:
        'GEO is the practice of shaping content, structure, and signals so AI systems can retrieve and cite your work accurately—beyond traditional SEO.'
    },
    {
      question: 'How does AI transformation work for regulated sectors?',
      answer:
        'It starts with risk-aware use cases, fast validation, and governance-by-design—then scales through secure data pipelines and clear accountability.'
    },
    {
      question: 'What is EvaCares?',
      answer:
        'EvaCares is a phone-first AI companion for elderly care that captures wellbeing signals and keeps carers informed without new devices.'
    }
  ]

  const [currentPath, setCurrentPath] = useState('/')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [messages, setMessages] = useState(() => loadStoredMessages() ?? [createMessage('assistant', INITIAL_GREETING)])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [config, setConfig] = useState(null)
  const [configError, setConfigError] = useState(null)

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 120
    })

    initAnalytics()

    setCurrentPath(window.location.pathname)
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
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

    // Create streaming assistant message
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
      // Remove failed streaming message
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

  const normalizedPath = currentPath.endsWith('/') && currentPath.length > 1 ? currentPath.slice(0, -1) : currentPath

  if (normalizedPath === '/admin') {
    return <AdminDashboard />
  }

  if (normalizedPath === '/blog' || normalizedPath.startsWith('/blog/')) {
    return <Blog />
  }

  const disabledAssistant = Boolean(configError) || !config

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F4F4F5]">
      <nav className="sticky top-0 z-40 border-b border-[#2A2A35]/80 bg-[#0D0D0F]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <a href="#top" className="text-lg font-semibold tracking-tight">
              Tim Robinson
              <span className="ml-2 text-xs uppercase tracking-[0.3em] text-[#A78BFA]">AI Foresight</span>
            </a>
            <div className="hidden md:flex items-center gap-6 text-sm text-[#A1A1AA]">
              <a href="#track-record" className="hover:text-white transition-colors">Track record</a>
              <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              <a href="#assistant" className="hover:text-white transition-colors">AI Assistant</a>
              <a href="#engagement" className="hover:text-white transition-colors">Engage</a>
              <a href="#insights" className="hover:text-white transition-colors">Insights</a>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Button
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analytics.bookingLinkClicked('nav')}
                className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FA] text-white hover:opacity-90"
              >
                Start a conversation
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden text-[#F4F4F5]"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 text-sm text-[#A1A1AA]">
              <a href="#track-record" className="block hover:text-white">Track record</a>
              <a href="#projects" className="block hover:text-white">Projects</a>
              <a href="#assistant" className="block hover:text-white">AI Assistant</a>
              <a href="#engagement" className="block hover:text-white">Engage</a>
              <a href="#insights" className="block hover:text-white">Insights</a>
              <a href="#contact" className="block hover:text-white">Contact</a>
            </div>
          )}
        </div>
      </nav>

      <header id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(124,58,237,0.18),_transparent_65%)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="max-w-3xl" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Tim Robinson • UK</p>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              AI foresight. I see what&apos;s coming.
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-[#A1A1AA]">
              I&apos;ve been building AI products since before most organisations knew they needed them. If you&apos;re
              looking for someone who&apos;s already solved the problem you&apos;re about to face — let&apos;s talk.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                href="#track-record"
                className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FA] text-white text-base px-6 py-3"
              >
                See the track record
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                href="#assistant"
                variant="outline"
                className="border-[#7C3AED] text-[#F4F4F5] hover:border-[#A78BFA]"
              >
                Talk to my AI
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#A1A1AA]">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[#A78BFA]" />
                AI transformation
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#A78BFA]" />
                Regulated sectors
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#A78BFA]" />
                Venture studio model
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="track-record" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Foresight Track Record</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">I called these before the market did.</h2>
            <p className="text-[#A1A1AA] mt-4 max-w-2xl">
              A timeline of bets that became categories. Every project is a signal I acted on early — with dates you
              can cite.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2" data-aos="fade-up" data-aos-delay="100">
            {trackRecord.map((item) => (
              <Card
                key={item.project}
                className="bg-[#16161A] border border-[#2A2A35] hover:border-[#7C3AED]/60 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/40">{item.year}</Badge>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => analytics.projectClicked(item.project, 'track-record', item.link)}
                        className="text-xs text-[#A1A1AA] hover:text-white inline-flex items-center gap-1"
                      >
                        View project
                        <ChevronRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <CardTitle className="text-xl text-white mt-4">{item.project}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#A1A1AA]">{item.insight}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="py-16 sm:py-20 bg-[#121216]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Validated Theses</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Working proof, not slide decks.</h2>
            <p className="text-[#A1A1AA] mt-4 max-w-3xl">
              Every build starts with a foresight thesis. These are the products that proved it.
            </p>
          </div>
          <div className="grid gap-6" data-aos="fade-up" data-aos-delay="100">
            {featuredProjects.map((project) => (
              <Card
                key={project.title}
                className="bg-[#16161A] border border-[#2A2A35]"
              >
                <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] p-6 sm:p-8">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/40">
                        {project.year}
                      </Badge>
                      <div className="text-xs uppercase tracking-[0.3em] text-[#A1A1AA]">{project.stack.join(' • ')}</div>
                    </div>
                    <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
                    <p className="text-[#A1A1AA]">Problem: {project.problem}</p>
                    <p className="text-[#F4F4F5]">Proof: {project.proof}</p>
                    {project.link && (
                      <Button
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => analytics.projectClicked(project.title, 'featured-projects', project.link)}
                        variant="outline"
                        className="border-[#7C3AED] text-[#F4F4F5] w-fit"
                      >
                        View live project
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                  {project.signal && (
                    <div className="bg-[#0D0D0F] border border-[#2A2A35] rounded-xl p-5 text-sm text-[#A1A1AA]">
                      <p className="text-xs uppercase tracking-[0.3em] text-[#A78BFA]">Signal</p>
                      <p className="mt-3">
                        {project.signal}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="assistant" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
            <div data-aos="fade-up">
              <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Talk to my AI</p>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4">Ask me anything. Literally.</h2>
              <p className="text-[#A1A1AA] mt-4">
                This is an AI trained on my consulting playbook, methodology, and thinking. Ask it about AI adoption,
                transformation strategy, regulated sectors, or anything else. It speaks in my voice because it was built
                from my work.
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm text-[#A1A1AA]">
                <MessageCircle className="h-4 w-4 text-[#A78BFA]" />
                Text and voice modes are both live.
              </div>
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="border-[#7C3AED] text-[#F4F4F5]"
                  onClick={handleClearHistory}
                >
                  Reset assistant
                </Button>
              </div>
            </div>
            <div className="grid gap-6" data-aos="fade-up" data-aos-delay="100">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#A78BFA] mb-3">Text Chat</p>
                <TextChat messages={messages} onSend={handleSend} loading={loading} error={error} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#A78BFA] mb-3">Voice Chat</p>
                <VoiceChat
                  instructions={instructions}
                  messages={messages}
                  vectorStoreId={config?.vectorStoreId || null}
                  realtimeModel={config?.realtimeModel}
                  onConversationUpdate={handleVoiceHistorySync}
                />
                {configError && <p className="mt-3 text-sm text-red-400">{configError}</p>}
              </div>
            </div>
          </div>
          {disabledAssistant && (
            <p className="mt-4 text-sm text-[#A1A1AA]">Assistant is loading. Please wait a moment.</p>
          )}
        </div>
      </section>

      <section id="engagement" className="py-16 sm:py-20 bg-[#121216]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Engagement Models</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Two ways to work with me.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {engagementModels.map((model) => (
              <Card key={model.title} className="bg-[#16161A] border border-[#2A2A35]" data-aos="fade-up">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">{model.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#A1A1AA]">{model.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="book" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-center">
            <div data-aos="fade-right">
              <img
                src={bookCover}
                alt="The Generative Organization book cover"
                className="w-64 sm:w-72 rounded-2xl border border-[#2A2A35] shadow-lg"
              />
            </div>
            <div data-aos="fade-left">
              <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">The Book</p>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4">The Generative Organization</h2>
              <p className="text-[#A1A1AA] mt-4">
                Co-authored with 34 AI practitioners. Not a theory book — a field guide for leaders building AI-native
                organisations. Available free — we care about people using the tools, not buying books they do nothing with.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button
                  href={bookFreeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FA] text-white"
                >
                  Download the book (free)
                  <BookOpen className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  href={bookReasoningLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  className="border-[#7C3AED] text-[#F4F4F5]"
                >
                  Why we made it free
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="speaking" className="py-16 sm:py-20 bg-[#121216]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Public Signals</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Signals I share publicly.</h2>
            <p className="text-[#A1A1AA] mt-4 max-w-2xl">
              As AI Advisor in Residence at SETsquared Bath, I share insights through events, articles, and conversations.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {publicSignals.map((item) => (
              <Card key={item.title} className="bg-[#16161A] border border-[#2A2A35]" data-aos="fade-up">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                  <CardDescription className="text-[#A1A1AA]">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    className="border-[#7C3AED] text-[#F4F4F5] w-full"
                  >
                    {item.linkText}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {latestPosts.length > 0 && (
        <section id="insights" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12" data-aos="fade-up">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Latest Insights</p>
                <h2 className="text-3xl sm:text-4xl font-bold mt-4">From the blog</h2>
                <p className="text-[#A1A1AA] mt-4 max-w-2xl">
                  Field notes on AI foresight, venture studio execution, and enterprise transformation.
                </p>
              </div>
              <Button href="/blog" variant="outline" className="border-[#7C3AED] text-white">
                View all posts
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {latestPosts.map((post, index) => {
                const formattedDate = post.date ? dateFormatter.format(new Date(post.date)) : ''
                return (
                  <Card
                    key={post.slug}
                    className="bg-[#16161A] border border-[#2A2A35] hover:border-[#7C3AED]/60 transition-colors"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-[#A1A1AA]">
                        <span>{formattedDate}</span>
                        {post.tags?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <Badge key={tag} className="bg-[#0D0D0F] text-[#A78BFA] border-[#2A2A35]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <CardTitle className="text-xl text-white">{post.title}</CardTitle>
                      <CardDescription className="text-[#A1A1AA] text-sm leading-relaxed">
                        {post.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        href={`/blog/${post.slug}`}
                        onClick={() => analytics.blogPostClicked(post.title, post.slug)}
                        variant="outline"
                        className="border-[#7C3AED] text-white w-full"
                      >
                        Read the article
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section id="faq" className="py-16 sm:py-20 bg-[#121216]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Questions AI systems keep asking.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {faqItems.map((item) => (
              <Card key={item.question} className="bg-[#16161A] border border-[#2A2A35]" data-aos="fade-up">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#A1A1AA]">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8" data-aos="fade-up">
          <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Start here</p>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4">Seen something I should be building?</h2>
          <p className="text-lg text-[#A1A1AA] mt-4">
            If you&apos;re an operator, investor, or enterprise leader — and you&apos;ve got a problem that needs a foresight
            engine — let&apos;s talk.
          </p>
          <Button
            href={bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.bookingLinkClicked('contact-section')}
            size="lg"
            className="mt-8 bg-gradient-to-r from-[#7C3AED] to-[#9F67FA] text-white text-base px-6 py-3"
          >
            Start a conversation
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <div className="mt-6 text-sm text-[#A1A1AA]">Calendly booking • 30 minutes • UK time</div>
        </div>
      </section>

      <footer className="border-t border-[#2A2A35] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-white">Tim Robinson</div>
              <p className="text-[#A1A1AA] mt-2">AI Foresight & Venture Studio</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <div className="space-y-2 text-[#A1A1AA]">
                <a href="#track-record" className="block hover:text-white">Track record</a>
                <a href="#projects" className="block hover:text-white">Projects</a>
                <a href="#assistant" className="block hover:text-white">AI assistant</a>
                <a href="/blog" className="block hover:text-white">Blog</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <Button
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analytics.bookingLinkClicked('footer')}
                className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FA] text-white w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Start a conversation
              </Button>
            </div>
          </div>
          <div className="border-t border-[#2A2A35] mt-8 pt-6 text-center text-[#A1A1AA]">
            <p>&copy; 2026 Tim Robinson. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
