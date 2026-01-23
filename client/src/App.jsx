import { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
  Target,
  Star,
  Calendar,
  MessageCircle,
  Quote,
  Workflow,
  TrendingUp,
  Sparkles,
  Menu,
  X,
  PhoneCall,
  ShieldCheck,
  Home
} from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './App.css'
const bookCover = 'https://assets.lulu.com/cover_thumbs/v/8/v8mqjq4-front-shortedge-384.jpg'
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
})

function App({ latestPosts = [] }) {
  const bookingLink = 'https://tanagra.youcanbook.me'
  const bookFreeLink = 'https://books.genorg.ai'
  const bookReasoningLink = 'https://books.genorg.ai/pr'
  const bookReviewsLink = 'https://www.amazon.co.uk/dp/B0FJG7BRG2#averageCustomerReviewsAnchor'

  const bookReviews = [
    {
      quote:
        '“This is a truly value packed book. With my disclaimer - I helped in some part contribute to 1 of the chapters. I don\'t think that should stop me from writing a review of the book because I (just like you) am getting to know the rest of the authors. The breadth of experience and view points is phenomenal and I have been in awe of some of the experts involved. Is it perfect - of course not. Here\'s the 1 thing i really think you should know. All of the authors had a style and a way they wanted to get their GPTs working within the standardized prompt framework and it wasn\'t always perfect. If you enjoy an authors contribution then engage them in conversation somewhere and find out how they have progressed their GPT\'s, prompts and models because as we all know the models are changing daily!”',
      reviewer: "Peter O'Donoghue"
    },
    {
      quote:
        '“I’ve read a few beginner\'s books on AI, which were great for my initial understanding; however, I was looking for something more in-depth this time. Rather than focusing on the theory of AI, this book is about actually using AI in the business world and has been written by 34 experts in the field. The book is full of practical exercises and guides you on how to get the best out of AI without feeling overwhelmed. It is a long book, but I loved just how packed it was with useful prompts. Not all of it will be relevant for everyone, but there is so much good content here that I will certainly be going back for another read.”',
      reviewer: 'Jose Saavedra'
    },
    {
      quote: '“I love the combination of tips and practical tools and how I can read this as a book or reference library, loving the tools and can\'t wait to use them more”',
      reviewer: 'Tim Robinson'
    },
    {
      quote:
        '“A Timely, Practical and Insightful Guide for the AI Age The Generative Organization is a refreshingly practical and wide-ranging guide to navigating the complex, fast-moving landscape of AI in the workplace. Spearheaded by Bryan Cassady and co-authored by 34 experts across innovation, systems thinking, design and leadership, this book offers a rich diversity of perspectives and disciplines... What sets The Generative Organization apart is its hopeful pragmatism. It acknowledges the risks of AI, but places even greater emphasis on its creative, empowering potential — if used wisely and with intention. This is not just a book; it’s a toolkit, a learning journey and a strategy retreat rolled into one.”',
      reviewer: 'Eu Too'
    },
    {
      quote:
        '“What a genuinely useful, thought-provoking book... It’s one of the book’s key strengths that each chapter brings different knowledge and perspectives to the broader topic of harnessing AI to create truly generative organisations... It’s a fantastic resource. I can see myself going back to this book time and time again, dipping into it for specific guidance when I need it. Highly recommended.”',
      reviewer: 'DC'
    },
    {
      quote:
        '“If you\'re drowning in AI tools but starved of results, *The Generative Organization* shows how to transform GenAI into a disciplined innovation engine... This book is ideal for executives, product leads, and transformation managers seeking quick outcomes—and for teams who appreciated Bryan\'s previous book, *Cycles*, but now need an AI-accelerated approach.”',
      reviewer: 'Robin (London)'
    },
    {
      quote:
        '“I wasn’t sure what to expect at first, but this book really surprised me in the best way. It’s not full of buzzwords or complex tech talk—just straight, practical advice for anyone curious about using AI in a real-world setting... Definitely worth the read especially at this price.”',
      reviewer: 'Ergi Mira'
    },
    {
      quote:
        '“As someone who often finds business and innovation books overly dense, The Generative Organization was a refreshing surprise... Overall, this is a valuable guide for leaders and innovators looking to understand how AI can become a true teammate rather than just a tool.”',
      reviewer: 'Neha'
    },
    {
      quote:
        '“This book has so much valuable information for anyone in business or looking to launch a new venture... The information is presented in a very detailed and honest format, providing checks and balances for a business idea... The use of AI is also very helpful as it guides the reader through the developmental process.”',
      reviewer: 'Amazon Customer'
    },
    {
      quote:
        '“Being one of the 35 co-authors of The Generative Organization has been a truly transformative experience... For me, this isn’t just another AI book, it’s a playbook I actually keep next to me when working with startups and innovation teams.”',
      reviewer: 'Urs Rothmayr'
    },
    {
      quote:
        '“Das Buch ist das, was man benötigt, wenn man in Unternehmensführung oder Strategie arbeitet. Ein Top Playbook für KMUs ... Zum Glück nicht zu technisch, sonst wäre es vermutlich schon wieder veraltet :D”',
      reviewer: 'friedrich von symbion'
    },
    {
      quote:
        '“Super practical and straight forward! Leverage GenAI, thanks to the provided prompts in the book, to get your team and you to results. Partnering with AI made easy and accessible! Go for it!”',
      reviewer: 'Kindle-Kunde'
    },
    {
      quote:
        '“The Generative Organization is a must-have playbook for anyone serious about leading, managing, or innovating with artificial intelligence at speed and scale... This book is a vital companion on the AI-powered innovation journey.”',
      reviewer: 'Dennis van der Spoel'
    },
    {
      quote:
        '“Full disclosure: I wrote Chapter 24 on accelerating physical prototyping with AI. That said, this review is about the rest of the book, and as a reader, I was impressed... Particularly strong are the sections on alignment, systematizing innovation, and integrating AI into your team\'s daily workflow.”',
      reviewer: 'RWB'
    },
    {
      quote:
        '“Practical, Inspiring, and Action-Oriented This isn’t just another AI book filled with buzzwords. It combines expert perspectives, ready-to-use prompts, and tested frameworks that help you turn ideas into results.”',
      reviewer: 'svr'
    },
    {
      quote:
        '“I love the content and the many useful tools in this book. The ideas are practical, well-explained, and clearly come from real experience. That said, the sheer number of concepts and tools can feel overwhelming... Still, a valuable resource for anyone serious about AI and innovation.”',
      reviewer: 'Nicole Luyten'
    },
    {
      quote:
        '“What I like most about this book is the range of expert perspectives. Instead of just one author’s view, you get insights from people who actually work with AI every day... Highly recomended.”',
      reviewer: 'Hari Acharya'
    },
    {
      quote:
        '“This book provides practical guidance on building a generative organization... I appreciate that the book clearly shows AI is a tool and not a replacement for human judgment and expertise.”',
      reviewer: 'Fancy Girl'
    },
    {
      quote:
        '“What I loved most about this book is how practical it is. Instead of just talking about AI in theory, it gives you real tools, prompts, and frameworks you can apply right away... Highly recommended for anyone serious about innovation.”',
      reviewer: 'Padma'
    },
    {
      quote:
        '“This is the only book that informs and teaches how to stop using AI and start working with it! This opens up infinite possibilities for organizations to innovate faster with less risk.”',
      reviewer: 'Tom Gerace'
    },
    {
      quote:
        '“What makes this book special is that it brings together 36 AI and business experts, all sharing their experience in one place... PS: I’ve already tried some of the prompts at work, and they really helped me come up with better, more workable ideas.”',
      reviewer: 'Vaishali S.'
    },
    {
      quote:
        '“The Generative Organization is a working reference guide and playbook for serious folks wishing to harness AI for innovation... If you want a playbook you can actually use tomorrow, not just another AI think piece, this is it.”',
      reviewer: 'Sunil Malhotra'
    },
    {
      quote:
        '“A book with actual tools and tips, that you can use to make a difference in business development or to scale a start up!”',
      reviewer: 'Arjan'
    },
    {
      quote:
        '“Some books you read once and forget, but this one feels like a long-term companion... If you want a structured approach to using AI for exponential growth, this is the book to get.”',
      reviewer: 'Krishna Vamshi'
    },
    {
      quote:
        '“The Generative Organization blends CYCLES and AI4Innovation tool into a comprehensive, future-facing framework... makes this book an invaluable guide for the years ahead.”',
      reviewer: 'Umesh'
    },
    {
      quote:
        '“What makes this book stand out is the mix of expert voices and practical prompts... Highly recommended.”',
      reviewer: 'Mohammed Nabi Adnan Ahmed'
    }
  ]

  const linkedinTestimonials = [
    {
      quote:
        'Working with Tim has been a great experience. His expertise is matched by his creativity and endless great ideas. Tim knows how to get things done, and done the right way. He is a true team player who understands both technical and business needs, delivering solutions that hit the mark.',
      author: 'Rick Kristalijn',
      role: 'AI Automation Leader',
      relationship: 'Former teammate, 2024'
    },
    {
      quote:
        'Tim brought data, insights, and stories that made our ChatGPT session exceptional. He kept the group engaged, shared generous resources, and left us with concrete takeaways and follow-ups. I am looking forward to collaborating with Tim more regularly—well done!',
      author: 'Joseph Batts',
      role: 'Business Systems Analyst, Adobe',
      relationship: 'Knowledge share host, 2024'
    },
    {
      quote:
        "Tim is an immensely knowledgeable agile practitioner. He's deeply introspective, able to get underneath the hood and sort out what's really going on. He's a pleasure to work with, an asset to any team, and I'd highly recommend him to anyone in need of sustainable change.",
      author: 'Ceri Newton-Sargunar',
      role: 'Organisational Development Advisor',
      relationship: 'Former teammate, 2023'
    },
    {
      quote:
        "Tim is a fantastic Agile Coach who helped me raise the bar for my team. He taught us agile principles, behaviours, and continuous improvement in a way that delivered real value for our customers. Tim figures out the problems to solve and finds the most pragmatic path forward—thank you for sharing your experience, Tim!",
      author: 'Nicola Bennett',
      role: 'Technology & Transformation Leader, NatWest',
      relationship: 'Client partnership, 2023'
    },
    {
      quote:
        'Whilst at RBS, Tim consistently gave his time to mentor me. He listened, reflected, and helped me see the questions I was missing. Tim knows when to coach and when to consult, and I would happily work with him again in the future.',
      author: 'Matt Evans',
      role: 'Agile Consultant & Trainer',
      relationship: 'Mentorship, 2020'
    },
    {
      quote:
        'Tim’s expert, clear, and enthusiastic way of explaining agile concepts helped me secure my first Scrum Master role. He was immediately open to helping, scheduled time, and guided my learning path. I would recommend Tim to anyone seeking a clearer understanding of agile.',
      author: 'Natasha Morshead',
      role: 'Agile Practice Manager',
      relationship: 'Coaching client, 2018'
    }
  ]

  const evacaresHighlights = [
    'Phone-based AI companion for extra needs support',
    'Automated wellbeing reports for carers and families',
    'Accessible check-ins that reduce isolation'
  ]

  const evacaresFeatures = [
    {
      title: 'Cost-effective daily contact',
      description:
        'Eva calls cost pennies compared to the £28 per hour average for in-home visits, giving teams real-time insight without increasing budgets.',
      icon: <PhoneCall className="h-5 w-5 text-cyan-300" />
    },
    {
      title: 'Escalates when something changes',
      description:
        'Structured conversations surface mood, medication adherence, and wellbeing shifts—alerting carers or family automatically when support is needed.',
      icon: <ShieldCheck className="h-5 w-5 text-cyan-300" />
    },
    {
      title: 'Supports independent living',
      description:
        'Phone-first interactions help people stay in their homes longer with a friendly safety net that never requires new devices or apps.',
      icon: <Home className="h-5 w-5 text-cyan-300" />
    }
  ]

  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [expandedReview, setExpandedReview] = useState(false)
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)
  const [expandedTestimonial, setExpandedTestimonial] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    posthog.init('phc_Wc0iXC2dmeghsETmIbxnT7Z960ZwEK8N4FcVAcaz6nf', {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
    })
  }, [])

  const trackEvent = (eventName, properties = {}) => {
    posthog.capture(eventName, properties)
  }

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    })

    let cancelled = false

    const initParticles = () => {
      if (cancelled || !window.particlesJS) return

      window.particlesJS('particles-js', {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: '#64FFDA' },
          shape: { type: 'circle' },
          opacity: { value: 0.5, random: false },
          size: { value: 3, random: true },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#64FFDA',
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 6,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: true, mode: 'repulse' },
            onclick: { enable: true, mode: 'push' },
            resize: true
          },
          modes: {
            grab: { distance: 400, line_linked: { opacity: 1 } },
            bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
            repulse: { distance: 200, duration: 0.4 },
            push: { particles_nb: 4 },
            remove: { particles_nb: 2 }
          }
        },
        retina_detect: true
      })
    }

    if (window.particlesJS) {
      initParticles()
    } else {
      const scriptId = 'particles-js-script'
      let script = document.getElementById(scriptId)

      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js'
        script.async = true
        script.onload = () => initParticles()
        script.onerror = (error) => console.error('Failed to load particles.js', error)
        document.body.appendChild(script)
      } else {
        script.addEventListener('load', initParticles, { once: true })
      }
    }

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (bookReviews.length <= 1) return undefined
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % bookReviews.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [bookReviews.length])

  useEffect(() => {
    setExpandedReview(false)
  }, [currentReviewIndex])

  useEffect(() => {
    if (linkedinTestimonials.length <= 1) return undefined
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % linkedinTestimonials.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [linkedinTestimonials.length])

  useEffect(() => {
    setExpandedTestimonial(false)
  }, [currentTestimonialIndex])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const services = [
    {
      icon: <Zap className="h-8 w-8 text-cyan-400" />,
      title: "AI for Automation & Efficiency",
      description: "Automate internal processes, reduce manual work, and cut operational costs with intelligent solutions tailored to your business."
    },
    {
      icon: <Target className="h-8 w-8 text-cyan-400" />,
      title: "AI for Speed to Market",
      description: "Rapidly build AI Proofs of Concept to validate ideas quickly and gain a competitive edge in your industry."
    },
    {
      icon: <Users className="h-8 w-8 text-cyan-400" />,
      title: "AI for Customer Experience",
      description: "Use AI to better understand and serve your customers, leading to increased loyalty, satisfaction, and sales."
    }
  ]

  const caseStudies = [
    {
      client: "Professional Services Firm",
      challenge:
        "Manual lead follow-up was slow and inconsistent, causing valuable enquiries to be lost despite significant marketing spend.",
      solution:
        "Implemented an AI-powered, multi-channel system that engaged leads instantly via web and WhatsApp, qualified them automatically, and handled routine admin tasks.",
      result: "Lead capture grew by 458%, sales increased by 30%, and ROI reached 1,733% within months.",
      roi: "1,733% ROI in 6 months"
    },
    {
      client: "Innovation Partner",
      challenge:
        "Organisations often face complex, high-level problems but lack clarity on the right solution. Traditional delivery approaches risk wasted investment and slow validation.",
      solution:
        "Applied a rapid prototyping approach—working closely with stakeholders to define the problem, refine assumptions, and deliver testable AI-powered solutions quickly.",
      result:
        "Clients reduced build risk, validated hypotheses early, and unlocked clear insight into what to scale—all without committing to lengthy or costly development cycles.",
      roi: "Fast validation without costly long-term commitments"
    },
    {
      client: "Organisational Transformation",
      challenge:
        "Teams and leaders often struggle to adapt to modern delivery practices, slowing progress and limiting business impact.",
      solution:
        "Delivered training and upskilling to hundreds of individuals, supported teams in embedding agile ways of working, and coached leadership to unlock faster, more effective delivery. In recent years, this has expanded to include leveraging AI to further enhance team efficiency and decision-making.",
      result:
        "Organisations achieved stronger alignment, improved delivery capability, and measurable gains in efficiency by combining agile practices with AI-driven augmentation.",
      roi: "Accelerated delivery and measurable efficiency gains"
    }
  ]

  const activeLinkedInTestimonial = linkedinTestimonials[currentTestimonialIndex]

  const projects = [
    {
      title: 'AI Podcast Producer',
      description:
        'End-to-end AI podcast automation pipeline covering ideation, script writing, synthetic voices, mastering, and publishing.',
      link: 'https://aipodcast-j91oecfb9-agilisttims-projects.vercel.app',
      technologies: ['GPT-4.1', 'ElevenLabs', 'Next.js', 'Whisper'],
      highlights: [
        'Dynamic topic discovery with market gap analysis',
        'Multi-voice narration with emotion controls',
        'Automated RSS feed + social clip generation',
        'Analytics overlays for episode performance'
      ]
    },
    {
      title: 'Delphi Decision Co-Pilot',
      description:
        'Interactive strategic planning assistant that combines scenario modelling, priority scoring, and AI-guided facilitation.',
      link: 'https://github.com/AgilistTim/Delphi',
      technologies: ['TypeScript', 'LangGraph', 'ShadCN', 'PostgreSQL'],
      highlights: [
        'Guided decision workshops with collaborative inputs',
        'AI-generated executive summaries & action plans',
        'Scenario stress-testing with probabilistic scoring',
        'Pluggable architecture for custom organisational data'
      ]
    },
    {
      title: 'EHCP Plan Reviewer',
      description:
        'Special educational needs teams upload Education, Health and Care Plans to benchmark quality, surface gaps, and interrogate every section with natural language questions.',
      link: 'https://silly-conkies-99132c.netlify.app',
      technologies: ['React', 'LangChain', 'Pinecone', 'Azure OpenAI'],
      highlights: [
        'Uploads PDF plans and automatically extracts statutory sections',
        'Gap analysis with compliance scoring mapped to SEND guidelines',
        'Conversational assistant to query any paragraph in plain English',
        'Action tracker that collates next steps for case managers'
      ]
    },
    {
      title: 'ISF Funding Checker',
      description:
        'Supports Individual Service Fund reviews by validating care plans, comparing requested support against outcomes, and accelerating panel decisions.',
      link: 'https://tiny-souffle-01cb35.netlify.app',
      technologies: ['Vue', 'Supabase', 'OpenAI Assistants', 'Tailwind'],
      highlights: [
        'Automated compliance checklist against local authority policy',
        'Budget modelling with “what if” scenarios for finance teams',
        'Document chat to clarify missing evidence or contradictory details',
        'Exports structured summaries ready for approval meetings'
      ]
    },
    {
      title: 'Project Bias – Investment Decision Coach',
      description:
        'An AI co-pilot for investment committees that surfaces cognitive and emotional biases hidden in decks, memos, and due diligence packs before they skew capital allocation.',
      link: 'https://www.mybias.co.uk',
      technologies: ['Next.js', 'OpenAI', 'Chart.js', 'Auth0'],
      highlights: [
        'Uploads investment proposals and diligence reports for bias fingerprinting',
        'Interactive dashboards quantify confidence, loss aversion, anchoring, and more',
        'Risk-scored insights with recommended mitigation actions per bias',
        'Blind-spot detection engine that compares historical decisions to current rationale'
      ]
    },
    {
      title: 'Comic Strip Creator GPT',
      description:
        'Popular GPT that turns meeting notes or story prompts into ready-to-share comic strips—with scene design, dialogue, and layout suggestions.',
      link: 'https://chatgpt.com/g/g-oS7vIDRnD-comic-strip-creator',
      technologies: ['OpenAI GPTs', 'Prompt Engineering', 'Midjourney / DALL·E Hooks'],
      highlights: [
        'Trusted by 1K+ users for rapid visual storytelling',
        'Guides users through character, setting, and punchline ideation',
        'Generates panel scripts plus image prompts for art tools',
        'Includes export-ready storyboard format for teams'
      ]
    },
    {
      title: 'Resume Review GPT',
      description:
        'AI hiring coach that diagnoses CV gaps, rewrites bullet points, and tailor fits resumes to specific job descriptions in minutes.',
      link: 'https://chatgpt.com/g/g-MOBE05uLE-resume-review',
      technologies: ['OpenAI GPTs', 'Resume Libraries', 'Career Benchmarks'],
      highlights: [
        'Used by 1K+ professionals to accelerate job search prep',
        'Benchmarks experience against role-specific competency models',
        'Produces quantified bullet rewrites and cover letter talking points',
        'Flags missing keywords and recommends measurable achievements'
      ]
    },
    {
      title: 'Website Optimizer GPT',
      description:
        'Conversion-focused GPT that audits landing pages, proposes UX/copy experiments, and delivers A/B testing ideas tailored to AI products.',
      link: 'https://chatgpt.com/g/g-6zkJViM5o-website-optimizer-for-ai',
      technologies: ['OpenAI GPTs', 'CRO Frameworks', 'Prompt Orchestration'],
      highlights: [
        'Diagnoses messaging gaps, friction, and proof needs in seconds',
        'Maps recommendations to funnel stages with expected uplift',
        'Generates variant copy, hero structures, and CTA tests',
        'Exports prioritised experiment backlog ready for product teams'
      ]
    }
  ]

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="global-gradient pointer-events-none fixed inset-0 -z-30" />
      <div id="particles-js" className="particles-overlay" />
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="text-2xl font-bold text-cyan-400">Tim Robinson</div>
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-8">
                <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
                <a href="#services" className="hover:text-cyan-400 transition-colors">Services</a>
                <a href="#success-stories" className="hover:text-cyan-400 transition-colors">Success Stories</a>
                <a href="/blog" className="hover:text-cyan-400 transition-colors">Blog</a>
                <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
              </div>
              <Button
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-400 hover:bg-cyan-500 text-slate-900"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book a Call
              </Button>
            </div>

            <div className="md:hidden flex items-center gap-3">
              <Button
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-3 py-2 text-sm font-semibold"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Call
              </Button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-800/70 p-2 text-slate-100 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label="Toggle navigation"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/95 p-6">
                {[
                  { href: '#about', label: 'About' },
                  { href: '#services', label: 'Services' },
                  { href: '#success-stories', label: 'Success Stories' },
                  { href: '/blog', label: 'Blog' },
                  { href: '#contact', label: 'Contact' }
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-base font-medium text-slate-200 hover:text-cyan-400 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <Button
                  href={bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-cyan-400 hover:bg-cyan-500 text-slate-900"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book a Call
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 sm:pt-32">
        <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-5 sm:px-6 lg:px-8">
          <Badge className="inline-flex items-center justify-center mb-6 bg-cyan-400/20 text-cyan-400 border-cyan-400/30 text-[0.65rem] sm:text-xs px-4 py-1" data-aos="fade-up">
            20+ Years Experience • 3+ Years AI Expertise
          </Badge>
          <h1 className="mx-auto max-w-[22rem] sm:max-w-[36rem] text-3xl sm:text-5xl md:text-7xl font-bold leading-snug sm:leading-tight mb-6 bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent" data-aos="fade-up" data-aos-delay="100">
            Unlock Your Business Potential with Practical AI
          </h1>
          <p className="mx-auto max-w-[24rem] sm:max-w-[40rem] text-sm sm:text-lg md:text-2xl text-slate-300 mb-8" data-aos="fade-up" data-aos-delay="200">
            I help small and medium-sized businesses drive growth, automate processes, and delight customers through strategic AI solutions that deliver measurable ROI.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center" data-aos="fade-up" data-aos-delay="300">
               <Button
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('clicked_book_call', { location: 'hero' })}
              size="lg"
              className="w-full sm:w-auto bg-cyan-400 hover:bg-cyan-500 text-slate-900 text-sm sm:text-base md:text-lg px-5 sm:px-6 md:px-8 py-3 md:py-4"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book a Strategy Call
            </Button>
            <Button
              href="https://survey.agilist.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('clicked_take_assessment', { location: 'hero' })}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 text-sm sm:text-base md:text-lg px-5 sm:px-6 md:px-8 py-3 md:py-4"
            >
              Take the AI Readiness Assessment
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          <div
            className="mt-16 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-sm p-8 md:p-10"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 text-left">
              <div className="w-full md:w-1/3 max-w-sm mx-auto">
                <img
                  src={bookCover}
                  alt="The Generative Organization book cover"
                  className="w-full rounded-2xl border border-slate-700 shadow-lg"
                />
              </div>
              <div className="w-full md:w-2/3 space-y-4">
                <Badge className="bg-cyan-400/20 text-cyan-300 border-cyan-400/40 w-fit">
                  Free Book Release
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-semibold">
                  Co-author of <span className="text-cyan-300">The Generative Organization</span>
                </h3>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                  Following the success of the award-winning book <em>CYCLES</em>, this playbook shows leaders how to make AI their
                  ultimate competitive advantage. It's now free because only 1% of business book ideas get used. We're using an
                  AI-augmented model to change the math and help teams turn insight into action.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    href={bookFreeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-cyan-400 hover:bg-cyan-500 text-slate-900"
                  >
                    Get the free book
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    href={bookReasoningLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost"
                    className="w-full sm:w-auto text-cyan-200 hover:text-cyan-100"
                  >
                    Why it's free
                  </Button>
                </div>
                <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-[260px] sm:h-[280px] md:h-[320px]">
                  <div className="flex items-start gap-3 text-slate-200 h-full">
                    <Quote className="h-6 w-6 text-cyan-300 mt-1 shrink-0" />
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="overflow-y-auto pr-2 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                        {expandedReview || bookReviews[currentReviewIndex].quote.length <= 320
                          ? bookReviews[currentReviewIndex].quote
                          : `${bookReviews[currentReviewIndex].quote.slice(0, 320)}…`}
                        {bookReviews[currentReviewIndex].quote.length > 320 && (
                          <button
                            type="button"
                            onClick={() => setExpandedReview((prev) => !prev)}
                            className="block mt-3 text-sm text-cyan-200 hover:text-cyan-100 underline underline-offset-4"
                          >
                            {expandedReview ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-slate-400 uppercase tracking-wide shrink-0">
                        {bookReviews[currentReviewIndex].reviewer}
                      </p>
                      <div className="mt-4 flex items-center gap-2 shrink-0">
                        {bookReviews.map((_, idx) => (
                          <span
                            key={idx}
                            className={`h-2 w-2 rounded-full transition-colors ${
                              idx === currentReviewIndex ? 'bg-cyan-300' : 'bg-slate-600'
                            }`}
                          />
                        ))}
                        <a
                          href={bookReviewsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-xs text-cyan-200 hover:text-cyan-100 underline underline-offset-4"
                        >
                          More reviews on Amazon
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Is This You Section */}
      <section className="py-16 sm:py-20 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Is This You?</h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
              Many leaders face these common challenges when considering AI implementation
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Workflow className="h-12 w-12 text-cyan-300 mx-auto" />,
                text: 'Struggling with manual processes that slow you down?'
              },
              {
                icon: <TrendingUp className="h-12 w-12 text-cyan-300 mx-auto" />,
                text: "Feeling you're falling behind competitors using new tech?"
              },
              {
                icon: <Sparkles className="h-12 w-12 text-cyan-300 mx-auto" />,
                text: 'Unsure how to start with AI without a massive budget?'
              }
            ].map((item, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700" data-aos="fade-up" data-aos-delay={index * 100}>
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">{item.icon}</div>
                  <p className="text-base sm:text-lg text-slate-300">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">How I Help</h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
              Three core pillars of AI transformation designed specifically for SMBs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 hover:border-cyan-400/50 transition-all duration-300" data-aos="fade-up" data-aos-delay={index * 100}>
                <CardHeader>
                  <div className="mb-4">{service.icon}</div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="success-stories" className="py-16 sm:py-20 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Real-World Results</h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
              Some examples of how I have supported teams and organisations like yours to improve
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700" data-aos="fade-up" data-aos-delay={index * 100}>
                <CardHeader>
                  <Badge className="w-fit bg-cyan-400/20 text-cyan-400 border-cyan-400/30 mb-2">
                    {study.client}
                  </Badge>
                  <CardTitle className="text-lg">The Challenge</CardTitle>
                  <CardDescription className="text-slate-300">
                    {study.challenge}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">The AI Solution</h4>
                      <p className="text-slate-300 text-sm">{study.solution}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">The Result</h4>
                      <p className="text-slate-300 text-sm">{study.result}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                      <div className="text-2xl font-bold text-green-400">{study.roi}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {latestPosts.length > 0 && (
        <section id="latest-insights" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12" data-aos="fade-up">
              <div>
                <Badge className="bg-cyan-400/20 text-cyan-300 border-cyan-400/40">Latest Insights</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold mt-6 mb-4">From the blog</h2>
                <p className="text-base sm:text-lg text-slate-300 max-w-2xl">
                  Thoughtful, practical guidance on AI-native product operations and building momentum that lasts.
                </p>
              </div>
              <Button
                href="/blog"
                variant="outline"
                className="border-cyan-400 text-cyan-200 w-full md:w-auto"
              >
                View all posts
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {latestPosts.map((post, index) => {
                const formattedDate = post.date ? dateFormatter.format(new Date(post.date)) : ''
                return (
                  <Card
                    key={post.slug}
                    className="bg-slate-800/80 border-slate-700 hover:border-cyan-400/50 transition-all duration-300"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                        <span>{formattedDate}</span>
                        {post.tags?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <Badge key={tag} className="bg-slate-900/60 text-cyan-200 border-slate-700">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <CardTitle className="text-xl text-white">{post.title}</CardTitle>
                      <CardDescription className="text-slate-300 text-sm leading-relaxed">
                        {post.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        href={`/blog/${post.slug}`}
                        variant="outline"
                        className="border-cyan-400 text-cyan-200 w-full"
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

      {/* Featured Projects */}
      <section className="py-16 sm:py-20 bg-slate-900/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12" data-aos="fade-up">
            <Badge className="bg-cyan-400/20 text-cyan-300 border-cyan-400/40">Featured Projects</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mt-6 mb-4">AI Experiences in the Wild</h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl">
              These are living products that blend AI strategy with execution. Explore them to see how I bring
              automation, customer experience, and data storytelling to life.
            </p>
          </div>

          <div className="grid gap-8">
            {projects.map((project, index) => (
              <Card
                key={project.title}
                className="bg-slate-800/80 border-slate-700 backdrop-blur-sm"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="grid gap-6 sm:gap-8 lg:grid-cols-[2fr_3fr] p-6 sm:p-8">
                  <div className="space-y-4">
                    <Badge className="bg-cyan-400/20 text-cyan-300 border-cyan-400/40">
                      {project.technologies.join(' • ')}
                    </Badge>
                    <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
                    <p className="text-slate-300 text-base sm:text-lg">{project.description}</p>
                    <Button
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outline"
                      className="w-full sm:w-auto border-cyan-400 text-cyan-200"
                    >
                      View Live Project
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-200">
                    {project.highlights.map((highlight, highlightIndex) => (
                      <div key={highlightIndex} className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div data-aos="fade-right">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">From Business Transformation to AI Innovation</h2>
              <p className="text-base sm:text-lg text-slate-300 mb-6">
                With over 20 years of experience in organizational transformation and 3+ years of hands-on AI product development, 
                I bridge the gap between strategic business needs and practical AI implementation.
              </p>
              <p className="text-base sm:text-lg text-slate-300 mb-6">
                I understand that successful AI adoption isn't just about the technology—it's about understanding your business, 
                your team, and your customers. My unique combination of transformation expertise and AI technical knowledge 
                ensures that every solution delivers real, measurable value.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {[
                  "20+ Years Transformation Experience",
                  "3+ Years AI Product Development",
                  "Agile Methodologies Expert",
                  "SMB-Focused Approach"
                ].map((skill, index) => (
                  <Badge key={index} className="bg-cyan-400/20 text-cyan-400 border-cyan-400/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {skill}
                  </Badge>
                ))}
              </div>
              <Button
                href="https://www.linkedin.com/in/tim-robinson-agilist/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-cyan-400 hover:bg-cyan-500 text-slate-900"
              >
                View LinkedIn Profile
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="relative" data-aos="fade-left">
              <div className="bg-gradient-to-br from-cyan-400/20 to-purple-600/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-cyan-400/30">
                <div className="text-center">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl sm:text-4xl font-bold text-slate-900">
                    TR
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Tim Robinson</h3>
                  <p className="text-cyan-400 mb-4 text-sm sm:text-base">AI Consultant & Transformation Expert</p>
                  <div className="flex justify-center space-x-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 mt-2">Trusted by multiple teams and organisations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EvaCares Section */}
      <section id="evacares" className="py-16 sm:py-20 bg-slate-900/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div data-aos="fade-right">
              <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/40">Founder Venture</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-6 text-white">
                EvaCares: Compassionate AI Support for Extra Needs
              </h2>
              <p className="text-base sm:text-lg text-slate-300 mb-5">
                I founded EvaCares to tackle isolation and medication challenges experienced by my own family. Eva is a
                phone-first AI companion that holds natural conversations, captures wellbeing signals, and keeps everyone in the
                care circle informed.
              </p>
              <p className="text-base sm:text-lg text-slate-300 mb-6">
                By combining friendly check-ins with automated reporting, EvaCares gives carers back valuable time while helping
                people live independently for longer—without needing new devices or technical know-how.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {evacaresHighlights.map((highlight, index) => (
                  <Badge key={index} className="bg-cyan-400/15 text-cyan-200 border-cyan-400/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {highlight}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  href="https://www.evacares.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-cyan-400 hover:bg-cyan-500 text-slate-900"
                >
                  Explore EvaCares
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
            <div data-aos="fade-left">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="h-6 w-6 text-cyan-300" />
                  <div>
                    <p className="text-sm uppercase tracking-wider text-cyan-200">Care Innovation Challenge Finalist</p>
                    <p className="text-xs text-slate-400">The Care Show, Birmingham NEC • 9-10 October</p>
                  </div>
                </div>
                <div className="space-y-5">
                  {evacaresFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3"
                    >
                      <div className="mt-1">{feature.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Clients Say</h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto">
              Authentic recommendations sourced directly from leaders and teams I have partnered with on LinkedIn.
            </p>
          </div>
          <div
            className="relative max-w-4xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl backdrop-blur-sm shadow-xl p-6 sm:p-8 md:p-10">
              <Badge className="bg-cyan-400/20 text-cyan-300 border-cyan-400/40">LinkedIn Recommendations</Badge>
              <div className="mt-6 flex items-start gap-4 text-slate-200">
                <Quote className="h-6 w-6 text-cyan-300 mt-1 shrink-0" />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="text-sm sm:text-base md:text-lg leading-relaxed text-slate-200 whitespace-pre-wrap">
                    {expandedTestimonial || activeLinkedInTestimonial.quote.length <= 360
                      ? activeLinkedInTestimonial.quote
                      : `${activeLinkedInTestimonial.quote.slice(0, 360)}…`}
                    {activeLinkedInTestimonial.quote.length > 360 && (
                      <button
                        type="button"
                        onClick={() => setExpandedTestimonial((prev) => !prev)}
                        className="block mt-3 text-sm text-cyan-200 hover:text-cyan-100 underline underline-offset-4"
                      >
                        {expandedTestimonial ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                  <div className="mt-6">
                    <p className="text-lg sm:text-xl font-semibold text-white">{activeLinkedInTestimonial.author}</p>
                    <p className="text-sm sm:text-base text-slate-400">{activeLinkedInTestimonial.role}</p>
                    <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wide mt-2">
                      {activeLinkedInTestimonial.relationship}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  {linkedinTestimonials.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentTestimonialIndex(idx)}
                      className={`h-2.5 w-2.5 rounded-full transition-colors ${
                        idx === currentTestimonialIndex
                          ? 'bg-cyan-300'
                          : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                      aria-label={`Show testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
                <a
                  href="https://www.linkedin.com/in/tim-robinson-agilist/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-2 text-sm sm:text-base text-cyan-200 hover:text-cyan-100 underline underline-offset-4"
                >
                  View more on LinkedIn
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Unlock Your AI Potential?</h2>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Let's discuss how AI can transform your business. Book a free 30-minute strategy call to explore the possibilities.
            </p>
            <Button
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="w-full sm:w-auto bg-cyan-400 hover:bg-cyan-500 text-slate-900 text-base md:text-lg px-6 md:px-8 py-3 md:py-4 mb-8"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book Your Free AI Strategy Call
            </Button>
            <p className="text-sm text-slate-400">
              No obligation • 30 minutes • Tailored to your business
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-cyan-400 mb-4">Tim Robinson</div>
              <p className="text-slate-300">
                AI Consulting & Business Transformation for SMBs
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#about" className="block text-slate-300 hover:text-cyan-400 transition-colors">About</a>
                <a href="#services" className="block text-slate-300 hover:text-cyan-400 transition-colors">Services</a>
                <a href="#success-stories" className="block text-slate-300 hover:text-cyan-400 transition-colors">Success Stories</a>
                <a href="/blog" className="block text-slate-300 hover:text-cyan-400 transition-colors">Blog</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Get in Touch</h3>
              <Button
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('clicked_start_conversation', { location: 'footer' })}
                className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Start a Conversation
              </Button>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Tim Robinson AI Consulting. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App
