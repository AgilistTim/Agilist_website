import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ArrowRight, CheckCircle, Users, Zap, Target, Star, Calendar, MessageCircle, Quote } from 'lucide-react'
import ChatBot from '@/components/ChatBot.jsx'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './App.css'
const bookCover = 'https://assets.lulu.com/cover_thumbs/v/8/v8mqjq4-front-shortedge-384.jpg'

function App() {
  const bookingLink = 'https://tanagra.youcanbook.me'
  const bookOrderLink = 'http://t.ly/GenOrg_order'
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

  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [expandedReview, setExpandedReview] = useState(false)

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
      client: "Mid-sized E-commerce Business",
      challenge: "Manual customer support was overwhelming the team and response times were too slow.",
      solution: "Implemented an AI-powered customer service chatbot with intelligent routing.",
      result: "Reduced response time by 85% and freed up 30 hours per week for strategic work.",
      roi: "300% ROI in 6 months"
    },
    {
      client: "Regional Manufacturing Company",
      challenge: "Inventory management was inefficient, leading to stockouts and overstock situations.",
      solution: "Developed AI-driven demand forecasting and inventory optimization system.",
      result: "Reduced inventory costs by 25% while improving product availability by 40%.",
      roi: "250% ROI in 8 months"
    },
    {
      client: "Professional Services Firm",
      challenge: "Lead qualification process was manual and inconsistent, missing opportunities.",
      solution: "Created AI-powered lead scoring and automated qualification system.",
      result: "Increased qualified leads by 60% and improved conversion rates by 35%.",
      roi: "400% ROI in 4 months"
    }
  ]

  const testimonials = [
    {
      quote: "Tim's unique combination of business transformation expertise and AI knowledge helped us implement solutions that actually work for our business, not just impressive technology demos.",
      author: "Sarah Chen",
      role: "CEO, TechStart Solutions",
      rating: 5
    },
    {
      quote: "The ROI was immediate and measurable. Tim understood our challenges and delivered practical AI solutions that transformed our operations.",
      author: "Michael Rodriguez",
      role: "Operations Director, GrowthCorp",
      rating: 5
    }
  ]

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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-cyan-400">Tim Robinson</div>
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
              <a href="#services" className="hover:text-cyan-400 transition-colors">Services</a>
              <a href="#success-stories" className="hover:text-cyan-400 transition-colors">Success Stories</a>
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28">
        <div id="particles-js" className="absolute inset-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Badge className="mb-6 bg-cyan-400/20 text-cyan-400 border-cyan-400/30" data-aos="fade-up">
            20+ Years Experience • 3+ Years AI Expertise
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent" data-aos="fade-up" data-aos-delay="100">
            Unlock Your Business Potential with Practical AI
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            I help small and medium-sized businesses drive growth, automate processes, and delight customers through strategic AI solutions that deliver measurable ROI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" data-aos="fade-up" data-aos-delay="300">
            <Button
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 text-lg px-8 py-4"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book a Free AI Strategy Call
            </Button>
            <Button size="lg" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 text-lg px-8 py-4">
              Learn More
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          <div
            className="mt-16 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-sm p-8 md:p-10"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 text-left">
              <div className="w-full md:w-1/3">
                <img
                  src={bookCover}
                  alt="The Generative Organization book cover"
                  className="w-full rounded-2xl border border-slate-700 shadow-lg"
                />
              </div>
              <div className="w-full md:w-2/3 space-y-4">
                <Badge className="bg-cyan-400/20 text-cyan-300 border-cyan-400/40 w-fit">
                  New Book Release
                </Badge>
                <h3 className="text-3xl font-semibold">
                  Co-author of <span className="text-cyan-300">The Generative Organization</span>
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Building on our award-winning book <em>CYCLES</em>, this playbook shows leaders how to make “working with AI” their
                  team’s greatest competitive advantage. It blends strategy, governance, and day-to-day AI workflows drawn from
                  35+ experts—including my own transformation projects.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    href={bookOrderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-cyan-400 hover:bg-cyan-500 text-slate-900"
                  >
                    Order a Copy
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    href={bookReviewsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost"
                    className="text-cyan-200 hover:text-cyan-100"
                  >
                    Read Reviews
                  </Button>
                </div>
                <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 min-h-[180px]">
                  <div className="flex items-start gap-3 text-slate-200">
                    <Quote className="h-6 w-6 text-cyan-300 mt-1" />
                    <div>
                      <p className="text-lg leading-relaxed whitespace-pre-wrap">
                        {expandedReview || bookReviews[currentReviewIndex].quote.length <= 320
                          ? bookReviews[currentReviewIndex].quote
                          : `${bookReviews[currentReviewIndex].quote.slice(0, 320)}…`}
                      </p>
                      {bookReviews[currentReviewIndex].quote.length > 320 && (
                        <button
                          type="button"
                          onClick={() => setExpandedReview((prev) => !prev)}
                          className="mt-3 text-sm text-cyan-200 hover:text-cyan-100 underline underline-offset-4"
                        >
                          {expandedReview ? 'Show less' : 'Read more'}
                        </button>
                      )}
                      <p className="mt-3 text-sm text-slate-400 uppercase tracking-wide">
                        {bookReviews[currentReviewIndex].reviewer}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
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
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold mb-6">Is This You?</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Many SMB leaders face these common challenges when considering AI implementation
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              "Struggling with manual processes that slow you down?",
              "Feeling you're falling behind competitors using new tech?",
              "Unsure how to start with AI without a massive budget?"
            ].map((question, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700" data-aos="fade-up" data-aos-delay={index * 100}>
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-4">❓</div>
                  <p className="text-lg text-slate-300">{question}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold mb-6">How I Help</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
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
      <section id="success-stories" className="py-20 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold mb-6">Real-World Results</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              See how AI transformation has delivered measurable ROI for businesses like yours
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

      {/* Featured Projects */}
      <section className="py-20 bg-slate-900/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12" data-aos="fade-up">
            <Badge className="bg-cyan-400/20 text-cyan-300 border-cyan-400/40">Featured Projects</Badge>
            <h2 className="text-4xl font-bold mt-6 mb-4">AI Experiences in the Wild</h2>
            <p className="text-lg text-slate-300 max-w-3xl">
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
                <div className="grid lg:grid-cols-[2fr_3fr] gap-10 p-8">
                  <div className="space-y-4">
                    <Badge className="bg-cyan-400/20 text-cyan-300 border-cyan-400/40">
                      {project.technologies.join(' • ')}
                    </Badge>
                    <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
                    <p className="text-slate-300">{project.description}</p>
                    <Button
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outline"
                      className="border-cyan-400 text-cyan-200"
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
      <section id="about" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <h2 className="text-4xl font-bold mb-6">From Business Transformation to AI Innovation</h2>
              <p className="text-lg text-slate-300 mb-6">
                With over 20 years of experience in organizational transformation and 3+ years of hands-on AI product development, 
                I bridge the gap between strategic business needs and practical AI implementation.
              </p>
              <p className="text-lg text-slate-300 mb-6">
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
              <Button className="bg-cyan-400 hover:bg-cyan-500 text-slate-900">
                View LinkedIn Profile
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="relative" data-aos="fade-left">
              <div className="bg-gradient-to-br from-cyan-400/20 to-purple-600/20 rounded-2xl p-8 backdrop-blur-sm border border-cyan-400/30">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-slate-900">
                    TR
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Tim Robinson</h3>
                  <p className="text-cyan-400 mb-4">AI Consultant & Transformation Expert</p>
                  <div className="flex justify-center space-x-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 mt-2">Trusted by 50+ SMBs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold mb-6">What Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700" data-aos="fade-up" data-aos-delay={index * 100}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-slate-300 mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div data-aos="fade-up">
            <h2 className="text-4xl font-bold mb-6">Ready to Unlock Your AI Potential?</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Let's discuss how AI can transform your business. Book a free 30-minute strategy call to explore the possibilities.
            </p>
            <Button
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 text-lg px-8 py-4 mb-8"
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
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Get in Touch</h3>
              <Button
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
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

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  )
}

export default App
