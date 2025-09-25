import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { 
  MessageCircle, 
  X, 
  Send, 
  Calendar, 
  User, 
  Building, 
  Target,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState('greeting')
  const [userResponses, setUserResponses] = useState({})
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm Tim's AI assistant. I'm here to help you explore how AI can transform your business. What brings you here today?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')

  const conversationFlow = {
    greeting: {
      options: [
        { text: "I'm curious about AI for my business", next: 'business_info' },
        { text: "I want to automate processes", next: 'automation_focus' },
        { text: "I need help with customer experience", next: 'customer_focus' },
        { text: "I'm not sure where to start", next: 'general_guidance' }
      ]
    },
    business_info: {
      question: "Great! What industry is your business in?",
      type: 'input',
      next: 'company_size'
    },
    company_size: {
      question: "How many employees does your company have?",
      options: [
        { text: "1-10 employees", next: 'pain_points' },
        { text: "11-50 employees", next: 'pain_points' },
        { text: "51-200 employees", next: 'pain_points' },
        { text: "200+ employees", next: 'pain_points' }
      ]
    },
    automation_focus: {
      question: "What processes are currently taking up too much of your team's time?",
      type: 'input',
      next: 'roi_expectations'
    },
    customer_focus: {
      question: "What's your biggest challenge with customer experience right now?",
      type: 'input',
      next: 'roi_expectations'
    },
    general_guidance: {
      question: "No problem! What's your biggest business challenge right now?",
      type: 'input',
      next: 'business_info'
    },
    pain_points: {
      question: "What's your biggest operational challenge?",
      options: [
        { text: "Manual processes slow us down", next: 'roi_expectations' },
        { text: "Customer support is overwhelming", next: 'roi_expectations' },
        { text: "Data analysis takes too long", next: 'roi_expectations' },
        { text: "Lead qualification is inconsistent", next: 'roi_expectations' }
      ]
    },
    roi_expectations: {
      question: "If we could solve this challenge, what would success look like for you?",
      type: 'input',
      next: 'timeline'
    },
    timeline: {
      question: "When would you like to see results?",
      options: [
        { text: "Within 3 months", next: 'budget_range' },
        { text: "3-6 months", next: 'budget_range' },
        { text: "6-12 months", next: 'budget_range' },
        { text: "I'm flexible", next: 'budget_range' }
      ]
    },
    budget_range: {
      question: "What's your approximate budget range for an AI solution?",
      options: [
        { text: "Under $10k", next: 'contact_info' },
        { text: "$10k - $25k", next: 'contact_info' },
        { text: "$25k - $50k", next: 'contact_info' },
        { text: "Over $50k", next: 'contact_info' }
      ]
    },
    contact_info: {
      question: "Perfect! I'd love to connect you with Tim for a personalized strategy session. What's your name?",
      type: 'input',
      next: 'email_capture'
    },
    email_capture: {
      question: "And your email address?",
      type: 'input',
      next: 'booking'
    },
    booking: {
      question: "Excellent! Based on our conversation, I think Tim can definitely help you achieve your goals. Would you like to book a free 30-minute AI strategy call?",
      type: 'booking'
    }
  }

  const addMessage = (content, type = 'bot') => {
    const newMessage = {
      id: messages.length + 1,
      type,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleOptionClick = (option) => {
    // Add user's choice as a message
    addMessage(option.text, 'user')
    
    // Store the response
    setUserResponses(prev => ({
      ...prev,
      [currentStep]: option.text
    }))

    // Move to next step
    setTimeout(() => {
      setCurrentStep(option.next)
      const nextStep = conversationFlow[option.next]
      
      if (nextStep.question) {
        addMessage(nextStep.question)
      }
    }, 500)
  }

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return

    // Add user's input as a message
    addMessage(inputValue, 'user')
    
    // Store the response
    setUserResponses(prev => ({
      ...prev,
      [currentStep]: inputValue
    }))

    const nextStepKey = conversationFlow[currentStep].next
    
    setTimeout(() => {
      setCurrentStep(nextStepKey)
      const nextStep = conversationFlow[nextStepKey]
      
      if (nextStep.question) {
        addMessage(nextStep.question)
      }
    }, 500)

    setInputValue('')
  }

  const handleBookingClick = () => {
    addMessage("Perfect! I'm opening Tim's calendar for you. You can select a time that works best for your schedule.", 'bot')
    // In a real implementation, this would open Calendly
    setTimeout(() => {
      addMessage("📅 Calendar booking widget would open here (Calendly integration)", 'bot')
    }, 1000)
  }

  const currentStepData = conversationFlow[currentStep]

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 rounded-full w-14 h-14 shadow-lg pulse-cyan"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] z-50">
          <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
            <CardHeader className="bg-gradient-to-r from-cyan-400 to-purple-600 text-slate-900 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-cyan-400 font-bold text-sm">
                  AI
                </div>
                Tim's AI Assistant
              </CardTitle>
              <p className="text-sm text-slate-800">
                Powered by 20+ years of transformation expertise
              </p>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-cyan-400 text-slate-900'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}

                {/* Current Step Options */}
                {currentStepData && currentStepData.options && (
                  <div className="space-y-2">
                    {currentStepData.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full text-left justify-start border-slate-600 hover:border-cyan-400 hover:bg-cyan-400/10"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option.text}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Booking Step */}
                {currentStep === 'booking' && (
                  <div className="space-y-4">
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-cyan-400 mb-2">Your AI Strategy Session Will Include:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Personalized AI opportunity assessment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>ROI projections for your specific use case</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Implementation roadmap and timeline</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>No obligation, completely free</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleBookingClick}
                      className="w-full bg-cyan-400 hover:bg-cyan-500 text-slate-900"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book My Free Strategy Call
                    </Button>
                  </div>
                )}
              </div>

              {/* Input Area */}
              {currentStepData && currentStepData.type === 'input' && (
                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your response..."
                      className="bg-slate-700 border-slate-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
                    />
                    <Button
                      onClick={handleInputSubmit}
                      size="sm"
                      className="bg-cyan-400 hover:bg-cyan-500 text-slate-900"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-2 border-t border-slate-700 text-center">
                <p className="text-xs text-slate-400">
                  Powered by Tim Robinson AI Consulting
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export default ChatBot
