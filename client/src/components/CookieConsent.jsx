import { useState, useEffect } from 'react'
import { initAnalytics } from '@/lib/analytics.js'

const CONSENT_KEY = 'cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
    initAnalytics()
  }

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#16161A] border-t border-[#2A2A35] p-4 sm:p-5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-[#A1A1AA] flex-1">
          We use cookies for analytics (PostHog) to understand how visitors use this site.
          Chat data is processed by OpenAI.{' '}
          <a href="/privacy" className="text-[#A78BFA] underline underline-offset-2">
            Privacy policy
          </a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-[#A1A1AA] hover:text-white border border-[#2A2A35] rounded-md transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm text-white bg-gradient-to-r from-[#7C3AED] to-[#9F67FA] rounded-md hover:opacity-90 transition-opacity"
          >
            Accept cookies
          </button>
        </div>
      </div>
    </div>
  )
}
