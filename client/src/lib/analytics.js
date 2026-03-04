import posthog from 'posthog-js'

const POSTHOG_KEY = import.meta.env.PUBLIC_POSTHOG_KEY || import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

let initialized = false

export function initAnalytics() {
  if (initialized || !POSTHOG_KEY) {
    return
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          posthog.opt_out_capturing() // Disable tracking in development
        }
      }
    })
    initialized = true
    console.log('[Analytics] PostHog initialized')
  } catch (error) {
    console.warn('[Analytics] Failed to initialize PostHog:', error)
  }
}

export function trackEvent(eventName, properties = {}) {
  if (!initialized || !POSTHOG_KEY) {
    console.log('[Analytics] Event tracked (no-op):', eventName, properties)
    return
  }

  try {
    posthog.capture(eventName, properties)
  } catch (error) {
    console.warn('[Analytics] Failed to track event:', error)
  }
}

// Specific tracking functions for chatbot
export const analytics = {
  chatOpened: () => trackEvent('chat_opened'),

  chatClosed: () => trackEvent('chat_closed'),

  chatModeChanged: (mode) => trackEvent('chat_mode_changed', { mode }),

  messageSent: (messageLength, isStreaming = false) => trackEvent('chat_message_sent', {
    message_length: messageLength,
    is_streaming: isStreaming
  }),

  messageReceived: (messageLength, responseTime) => trackEvent('chat_message_received', {
    message_length: messageLength,
    response_time_ms: responseTime
  }),

  suggestedPromptClicked: (prompt) => trackEvent('chat_suggested_prompt_clicked', {
    prompt
  }),

  bookingLinkClicked: (source) => trackEvent('booking_link_clicked', {
    source // 'chat', 'hero', 'footer', etc.
  }),

  historyCleared: () => trackEvent('chat_history_cleared'),

  voiceStarted: () => trackEvent('voice_chat_started'),

  voiceStopped: (duration) => trackEvent('voice_chat_stopped', {
    duration_seconds: Math.round(duration / 1000)
  }),

  // Content engagement
  projectClicked: (projectName, source, url) => trackEvent('project_clicked', {
    project_name: projectName,
    source, // 'track-record' or 'featured-projects'
    url
  }),

  blogPostClicked: (postTitle, postSlug) => trackEvent('blog_post_clicked', {
    post_title: postTitle,
    post_slug: postSlug
  }),

  blogPageViewed: () => trackEvent('blog_page_viewed'),

  blogPostViewed: (postTitle, postSlug, tags) => trackEvent('blog_post_viewed', {
    post_title: postTitle,
    post_slug: postSlug,
    tags: tags?.join(', ')
  }),

  externalLinkClicked: (linkText, url, category) => trackEvent('external_link_clicked', {
    link_text: linkText,
    url,
    category // 'linkedin', 'github', 'social', 'resource', etc.
  })
}
