import { useEffect, useMemo, useState } from 'react'
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
  BrainCircuit,
  Search,
  Wrench,
  Anchor,
  Users,
  Cpu,
  Award,
  Mic
} from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './App.css'

const INITIAL_GREETING =
  "Hi! I'm Tim's AI assistant. Ask me about organisational transformation, AI adoption, or how to work with Tim."
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

  const credibilitySignals = [
    {
      icon: Users,
      label: '20+ years in organisational transformation and agile delivery'
    },
    {
      icon: BrainCircuit,
      label: 'AI Advisor in Residence, SETsquared Bath'
    },
    {
      icon: BookOpen,
      label: 'Co-author, The Generative Organization (with Bryan Cassady)'
    },
    {
      icon: Award,
      label: 'Trained several hundred people in AI adoption'
    },
    {
      icon: Cpu,
      label: '7+ production AI products built and shipped'
    },
    {
      icon: Anchor,
      label: 'Royal Navy veteran'
    }
  ]

  const problemPatterns = [
    {
      title: 'The transformation that stalled',
      description:
        'You invested in agile, SAFe, or some flavour of transformation. Teams adopted the ceremonies but the underlying decision-making never changed. Progress slowed and people are tired.',
      rootCause:
        'The constraint is usually structural — information doesn\u2019t flow, decisions take too long, and feedback loops are broken. The framework wasn\u2019t the problem. The operating model was.'
    },
    {
      title: 'AI adoption that\u2019s going nowhere',
      description:
        'You\u2019ve run pilots, done training, maybe built a chatbot. But nothing has stuck and the organisation is no more capable than it was six months ago.',
      rootCause:
        'AI tools bolted onto an operating model that wasn\u2019t designed for them won\u2019t create change. The model needs to evolve first — then AI accelerates it.'
    },
    {
      title: 'Product teams hitting a ceiling',
      description:
        'You\u2019re shipping features but not fast enough. Learning but not systematically. Everyone\u2019s working hard, but effort doesn\u2019t translate cleanly into outcomes.',
      rootCause:
        'The constraint isn\u2019t effort or capability — it\u2019s how work, decisions, and learning actually flow. When those are misaligned, working harder makes things worse.'
    },
    {
      title: 'The executive who can\u2019t get a straight answer',
      description:
        'You know something is wrong. Every consultant gives you a framework, not a diagnosis. You need someone who will tell you what they actually see.',
      rootCause:
        'Most consultants sell methodology. What you need is someone close enough to the work to see the real constraint — and direct enough to name it.'
    }
  ]

  const engagementModes = [
    {
      title: 'Diagnostic & Transformation',
      subtitle: 'For leaders whose change has stalled',
      description:
        'I start with diagnosis, not solutions. Understanding what\u2019s structurally stuck before recommending what to change — because the wrong intervention at the wrong layer makes things worse.',
      details: [
        'Organisational and delivery diagnostics',
        'Operating model redesign',
        'Agile transformation and coaching',
        'Leadership advisory',
        'Day-rate or fixed-price outcomes'
      ],
      whoItsFor: 'Senior leaders who need clarity on what\u2019s structurally wrong — and someone who\u2019ll name it.',
      cta: 'Start a conversation'
    },
    {
      title: 'AI Capability Building',
      subtitle: 'For organisations ready to move beyond pilots',
      description:
        'Practical AI adoption that sticks. Not tool demos — real capability building embedded in how your teams already work. I\u2019ve trained hundreds and built the products to prove the approach works.',
      details: [
        'AI readiness assessments and training',
        'Operating model redesign for AI-native working',
        'Governance-by-design frameworks',
        'Hands-on tool integration and workflow embedding'
      ],
      whoItsFor: 'Organisations that need AI capability, not just AI awareness — from someone who actually builds it.',
      cta: 'Start a conversation'
    }
  ]

  const builtProjects = [
    {
      title: 'EvaCares',
      year: '2023',
      description: 'Voice AI wellbeing calls for elderly people. Phone-first, no new devices needed. Born from a personal challenge — reducing isolation for my father.',
      link: 'https://www.evacares.co.uk'
    },
    {
      title: 'PodGuide',
      year: '2026',
      description: 'Full-lifecycle AI co-pilot for podcasters: episode planning, live interview modes including an autonomous AI interviewer, and 10+ content pieces per episode.',
      link: 'https://podguide.agilist.co.uk/'
    },
    {
      title: 'Delphi Decision Co-Pilot',
      year: '2024',
      description: 'Multi-round AI engine for strategic decisions. Produces cited consensus positions, epistemic stress tests, counterfactual risk analysis, and a full decision canvas.',
      link: 'https://github.com/AgilistTim/Delphi'
    },
    {
      title: 'OBD-AI',
      year: '2026',
      description: 'Vehicle diagnostics meets natural language. AI Mechanic correlates symptoms with live sensor data. Web Bluetooth — no app required.',
      link: 'https://github.com/AgilistTim/OBD-AI'
    },
    {
      title: 'GEO',
      year: '2023',
      description: 'Generative Engine Optimisation — built frameworks and tooling for AI retrieval before "GEO" was a category. Scrapes, analyses, and provides detailed guidance on content refactoring.',
    },
    {
      title: 'LLM Cost Calculator',
      year: '2026',
      description: 'Interactive tool comparing real costs of cloud LLM APIs vs self-hosted inference. Hardware amortisation, electricity, and token caching savings.',
      link: '/tools/cost-calculator'
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
      description: 'I share my thinking on transformation, organisational design, and applied AI through in-depth articles.',
      link: 'https://www.linkedin.com/in/tim-robinson-agilist/recent-activity/articles/',
      linkText: 'Read the articles'
    },
    {
      title: 'Connect on LinkedIn',
      description: 'Always happy to discuss transformation, AI adoption, and the messy problems that sit between the two.',
      link: 'https://www.linkedin.com/in/tim-robinson-agilist/',
      linkText: 'Connect with me'
    }
  ]

  const faqItems = [
    {
      question: 'What kind of organisations do you work with?',
      answer:
        'I work with organisations where progress has slowed — not because people aren\u2019t capable, but because the system has reached its limits. That might be a large enterprise whose transformation has stalled, or a smaller organisation trying to make AI stick. The common thread is: something structural needs to change.'
    },
    {
      question: 'How is this different from a management consultancy?',
      answer:
        'I don\u2019t sell frameworks or methodology. I diagnose what\u2019s structurally stuck, name it clearly, and help you redesign how work, decisions, and learning actually flow. And unlike most consultants in this space, I actually build AI products — so the advice comes from practice, not theory.'
    },
    {
      question: 'Do I need to have started an AI initiative already?',
      answer:
        'No. Some clients come to me because their AI adoption isn\u2019t landing. Others come because their transformation stalled long before AI entered the picture. I work at the intersection — the operating model problems are often the same regardless of whether AI is involved yet.'
    },
    {
      question: 'What does a typical engagement look like?',
      answer:
        'It starts with a conversation. From there it might be a short diagnostic, a coaching engagement, a training programme, or an ongoing advisory relationship. I work on day-rate or fixed-price outcomes, and I start with diagnosis — not solutions.'
    }
  ]

  const [currentPath, setCurrentPath] = useState('/')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [messages, setMessages] = useState(() => loadStoredMessages() ?? [createMessage('assistant', INITIAL_GREETING)])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [config, setConfig] = useState(null)
  const [configError, setConfigError] = useState(null)
  const [chatMode, setChatMode] = useState('text')

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
    // Admin page is handled by admin.astro with proper server-side auth
    window.location.href = '/admin'
    return null
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
              <span className="ml-2 text-xs uppercase tracking-[0.3em] text-[#A78BFA]">Transformation & AI</span>
            </a>
            <div className="hidden lg:flex items-center gap-6 text-sm text-[#A1A1AA]">
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#how-i-work" className="hover:text-white transition-colors">How I work</a>
              <a href="#what-i-build" className="hover:text-white transition-colors">What I build</a>
              <a href="#assistant" className="hover:text-white transition-colors">AI Assistant</a>
              <a href="#thinking" className="hover:text-white transition-colors">Thinking</a>
              <a href="/blog" className="hover:text-white transition-colors">Blog</a>
            </div>
            <div className="hidden lg:flex items-center gap-3">
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
              className="lg:hidden text-[#F4F4F5]"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 space-y-2 text-sm text-[#A1A1AA]">
              <a href="#about" className="block hover:text-white">About</a>
              <a href="#how-i-work" className="block hover:text-white">How I work</a>
              <a href="#what-i-build" className="block hover:text-white">What I build</a>
              <a href="#assistant" className="block hover:text-white">AI Assistant</a>
              <a href="#thinking" className="block hover:text-white">Thinking</a>
              <a href="/blog" className="block hover:text-white">Blog</a>
              <a href="#contact" className="block hover:text-white">Contact</a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <header id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(124,58,237,0.18),_transparent_65%)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="max-w-3xl" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Tim Robinson &bull; UK</p>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              I fix how organisations work.
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-[#A1A1AA]">
              20+ years in organisational transformation. AI is the most powerful tool I&apos;ve ever had for doing it.
              I don&apos;t just advise on AI &mdash; I build it. If you&apos;re looking for someone who&apos;s been
              solving these problems since before the hype, let&apos;s talk.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                href="#how-i-work"
                className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FA] text-white text-base px-6 py-3"
              >
                How I work
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
                <Users className="h-4 w-4 text-[#A78BFA]" />
                Transformation
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#A78BFA]" />
                Diagnostics
              </div>
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[#A78BFA]" />
                AI
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-[#A78BFA]" />
                Systems Design
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* The Problem I Solve */}
      <section id="about" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] items-center" data-aos="fade-up">
            <div className="flex justify-center lg:hidden">
              <img
                src="/tim-robinson.jpg"
                alt="Tim Robinson"
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl object-cover border border-[#2A2A35]"
              />
            </div>
            <div className="border-l-4 border-[#7C3AED] pl-6 sm:pl-8">
              <p className="text-sm uppercase tracking-[0.35em] text-[#A78BFA] mb-4">The problem I solve</p>
              <blockquote className="text-lg sm:text-xl text-[#F4F4F5] leading-relaxed space-y-4">
                <p>
                  Progress has slowed &mdash; not because people aren&apos;t capable, but because the system
                  they&apos;re operating in has reached its limits.
                </p>
                <p>
                  Decisions take too long. Learning is slow. Effort doesn&apos;t translate cleanly into outcomes.
                  The friction is almost always structural, not personal &mdash; and working harder won&apos;t fix it.
                </p>
                <p>
                  I work where problems are messy, ownership is unclear, and simple answers have already
                  failed. I identify where the constraint actually sits, and I help redesign how work, decisions,
                  and learning flow.
                </p>
              </blockquote>
            </div>
            <div className="hidden lg:flex justify-end">
              <img
                src="/tim-robinson.jpg"
                alt="Tim Robinson"
                className="w-48 h-48 rounded-2xl object-cover border border-[#2A2A35]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Signals */}
      <section className="py-12 sm:py-16 bg-[#121216]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-aos="fade-up">
            {credibilitySignals.map((signal) => {
              const Icon = signal.icon
              return (
                <div
                  key={signal.label}
                  className="flex items-start gap-3 p-4 rounded-xl border border-[#2A2A35] bg-[#16161A]"
                >
                  <Icon className="h-5 w-5 text-[#A78BFA] mt-0.5 shrink-0" />
                  <p className="text-sm text-[#A1A1AA]">{signal.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Problem Patterns */}
      <section id="patterns" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Patterns I Recognise</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Does this sound familiar?</h2>
            <p className="text-[#A1A1AA] mt-4 max-w-2xl">
              These are the problems I see again and again. The details change, but the structural patterns
              underneath are remarkably consistent.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2" data-aos="fade-up" data-aos-delay="100">
            {problemPatterns.map((pattern) => (
              <Card
                key={pattern.title}
                className="bg-[#16161A] border border-[#2A2A35] hover:border-[#7C3AED]/60 transition-colors"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-white">{pattern.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-[#A1A1AA]">{pattern.description}</p>
                  <p className="text-sm text-[#F4F4F5] border-l-2 border-[#7C3AED] pl-4">{pattern.rootCause}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How I Work */}
      <section id="how-i-work" className="py-16 sm:py-20 bg-[#121216]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">How I Work</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Two ways to engage.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            {engagementModes.map((mode) => (
              <Card key={mode.title} className="bg-[#16161A] border border-[#2A2A35] !flex !flex-col h-full" data-aos="fade-up">
                <CardHeader>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#A78BFA]">{mode.subtitle}</p>
                  <CardTitle className="text-2xl text-white mt-2">{mode.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <p className="text-[#A1A1AA]">{mode.description}</p>
                  <ul className="space-y-2">
                    {mode.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                        <ChevronRight className="h-4 w-4 text-[#A78BFA] mt-0.5 shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm italic text-[#A1A1AA]">{mode.whoItsFor}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button
                    href={bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => analytics.bookingLinkClicked(`engagement-${mode.title}`)}
                    className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FA] text-white w-full"
                  >
                    {mode.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What I Build */}
      <section id="what-i-build" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">What I Build</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">I don&apos;t just advise on AI. I build it.</h2>
            <p className="text-[#A1A1AA] mt-4 max-w-3xl">
              These are products I&apos;ve built. They exist. You can use them. When I talk about AI,
              it comes from practice — not slides.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-aos="fade-up" data-aos-delay="100">
            {builtProjects.map((project) => (
              <Card
                key={project.title}
                className="bg-[#16161A] border border-[#2A2A35] hover:border-[#7C3AED]/60 transition-colors flex flex-col"
              >
                <CardHeader className="flex-1">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/40">{project.year}</Badge>
                  </div>
                  <CardTitle className="text-lg text-white mt-3">{project.title}</CardTitle>
                  <CardDescription className="text-[#A1A1AA] text-sm leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                {project.link && (
                  <CardContent>
                    <Button
                      href={project.link}
                      target={project.link.startsWith('/') ? undefined : '_blank'}
                      rel={project.link.startsWith('/') ? undefined : 'noopener noreferrer'}
                      onClick={() => analytics.projectClicked(project.title, 'what-i-build', project.link)}
                      variant="outline"
                      className="border-[#7C3AED] text-[#F4F4F5] w-full"
                    >
                      View project
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Book */}
      <section id="book" className="py-16 sm:py-20 bg-[#121216]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-center">
            <div className="flex justify-center lg:justify-start" data-aos="fade-right">
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
                Co-authored with Bryan Cassady. A field guide for leaders navigating organisational transformation
                with AI &mdash; not theory, but practical patterns from practitioners who&apos;ve done the work.
                Available free, because we care about people using the tools, not buying books they do nothing with.
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

      {/* AI Assistant */}
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

      {/* Where to Find Me */}
      <section id="find-me" className="py-16 sm:py-20 bg-[#121216]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Where to Find Me</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">In person and online.</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publicSignals.map((item) => (
              <Card key={item.title} className="bg-[#16161A] border border-[#2A2A35] flex flex-col" data-aos="fade-up">
                <CardHeader className="flex-1">
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

      {/* Thinking / Blog */}
      {latestPosts.length > 0 && (
        <section id="thinking" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12" data-aos="fade-up">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Thinking</p>
                <h2 className="text-3xl sm:text-4xl font-bold mt-4">From the blog</h2>
                <p className="text-[#A1A1AA] mt-4 max-w-2xl">
                  On transformation, organisational design, product operations, and applied AI.
                </p>
              </div>
              <Button href="/blog" variant="outline" className="border-[#7C3AED] text-white">
                View all posts
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post, index) => {
                const formattedDate = post.date ? dateFormatter.format(new Date(post.date)) : ''
                return (
                  <Card
                    key={post.slug}
                    className="bg-[#16161A] border border-[#2A2A35] hover:border-[#7C3AED]/60 transition-colors flex flex-col"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <CardHeader className="space-y-3 flex-1">
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

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-20 bg-[#121216]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10" data-aos="fade-up">
            <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4">Common questions.</h2>
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

      {/* Contact */}
      <section id="contact" className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8" data-aos="fade-up">
          <p className="text-xs uppercase tracking-[0.35em] text-[#A78BFA]">Start here</p>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4">
            If your transformation has stalled &mdash; or you&apos;re not sure where AI fits &mdash; let&apos;s talk.
          </h2>
          <p className="text-lg text-[#A1A1AA] mt-4">
            A short conversation is usually enough to know whether I can help.
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
          <div className="mt-6 text-sm text-[#A1A1AA]">Calendly booking &bull; 30 minutes &bull; UK time</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2A35] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-white">Tim Robinson</div>
              <p className="text-[#A1A1AA] mt-2">Transformation & AI</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <div className="space-y-2 text-[#A1A1AA]">
                <a href="#how-i-work" className="block hover:text-white">How I work</a>
                <a href="#what-i-build" className="block hover:text-white">What I build</a>
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
          <div className="border-t border-[#2A2A35] mt-8 pt-6 text-center text-[#A1A1AA] space-y-2">
            <p>&copy; 2026 Tim Robinson. All rights reserved.</p>
            <div className="flex justify-center gap-4 text-xs">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy policy</a>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('cookie_consent')
                  window.location.reload()
                }}
                className="hover:text-white transition-colors"
              >
                Manage cookies
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
