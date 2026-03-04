# PostHog Analytics Setup

PostHog analytics has been integrated into your website. To activate tracking, you need to add your PostHog API key.

## Quick Setup

### 1. Get Your PostHog Key

1. Log into your PostHog account at https://app.posthog.com
2. Go to **Project Settings** → **Project API Key**
3. Copy your **Project API Key** (starts with `phc_...`)

### 2. Add to Environment Variables

Create or update `.env` file in the `client` directory:

```bash
# client/.env
PUBLIC_POSTHOG_KEY=phc_your_key_here
PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

Or if using Vite directly:

```bash
VITE_POSTHOG_KEY=phc_your_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
```

### 3. Restart Dev Server

```bash
npm run dev
```

## What Gets Tracked

The integration automatically tracks:

### Chatbot Events
- `chat_opened` - When user opens the chat widget
- `chat_closed` - When user closes the chat widget
- `chat_mode_changed` - When switching between text/voice (properties: `mode`)
- `chat_message_sent` - When user sends a message (properties: `message_length`, `is_streaming`)
- `chat_message_received` - When assistant responds (properties: `message_length`, `response_time_ms`)
- `chat_suggested_prompt_clicked` - When user clicks a suggested question (properties: `prompt`)
- `chat_history_cleared` - When user clears conversation history

### Voice Chat Events
- `voice_chat_started` - When user starts voice conversation
- `voice_chat_stopped` - When voice ends (properties: `duration_seconds`)

### Conversion Events
- `booking_link_clicked` - When user clicks "Start a conversation" button (properties: `source` - 'nav', 'contact-section', 'footer', or 'chat')

## Viewing Analytics

1. Go to https://app.posthog.com
2. Select your project
3. Navigate to **Insights** or **Events**
4. Filter by event names above

### Useful Dashboards to Create

**Lead Generation Funnel:**
1. Page views
2. `chat_opened`
3. `chat_message_sent`
4. `booking_link_clicked`

**Engagement Metrics:**
- Messages per session
- Average response time
- Most clicked suggested prompts
- Voice vs text usage

**Conversion Sources:**
- Which booking link location converts best? (nav, footer, contact section)
- Do suggested prompts lead to more bookings?

## Privacy & Development

**Development Mode:**
- Analytics are automatically disabled in development (`npm run dev`)
- No events are sent to PostHog when running locally

**Production:**
- Events only track when `PUBLIC_POSTHOG_KEY` is set
- No tracking if key is missing (graceful fallback)
- All tracking is anonymous unless you add identify() calls

## Advanced Configuration

### Custom Events

Add custom tracking in your code:

```javascript
import { analytics } from '@/lib/analytics.js'

// Track custom event
analytics.trackEvent('custom_event_name', {
  property1: 'value1',
  property2: 123
})
```

### Identify Users

If you want to track logged-in users:

```javascript
import posthog from 'posthog-js'

posthog.identify('user_id', {
  email: 'user@example.com',
  name: 'User Name'
})
```

## Troubleshooting

**Events not showing up?**
1. Check browser console for `[Analytics] PostHog initialized` message
2. Verify your API key starts with `phc_`
3. Make sure you're not in development mode
4. Check PostHog debugger: Add `?__posthog_debug=true` to URL

**Analytics disabled in dev?**
This is intentional! Remove the opt-out in `src/lib/analytics.js` if you want to test in development.

## Cost

PostHog pricing is based on events:
- **Free tier**: 1M events/month
- **Paid**: $0.00031 per event after free tier

With typical usage:
- ~10 events per chat session
- ~100-200 sessions/day = 1,000-2,000 events/day
- ~30,000-60,000 events/month (well within free tier)
