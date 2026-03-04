# Redesign Brief: agilist.co.uk — Foresight Positioning Overhaul

## Mission
Transform this site from a generic AI consulting template into a distinctive, magnetic personal brand site for Tim Robinson — a serial AI inventor and foresight-first practitioner. The site must attract operators, investors, and enterprise clients (NOT SMBs), convert them to a conversation, and rank well when AI systems and search engines surface "who's doing serious AI transformation work in the UK."

**This is a full overhaul.** Do not preserve the current narrative or design system. Preserve the technical infrastructure (Astro + React, Render deployment, chatbot backend, blog system).

---

## Design System

### Palette (replace current navy/cyan entirely)
- **Background:** Near-black with warmth — `#0D0D0F`
- **Surface:** Dark elevated — `#16161A`
- **Border:** Subtle — `#2A2A35`
- **Primary Accent:** Electric purple — `#7C3AED` (Violet-600)
- **Accent Glow:** Soft purple — `#A78BFA` (Violet-400)
- **Text Primary:** Off-white — `#F4F4F5`
- **Text Secondary:** Muted — `#A1A1AA`
- **CTA:** Purple gradient — `linear-gradient(135deg, #7C3AED, #9F67FA)`

### Typography
- **Display/Hero:** Bold, large, editorial — Inter or Plus Jakarta Sans, weight 800, tight tracking
- **Headings:** Semi-bold, generous sizing
- **Body:** Inter 400, comfortable line-height
- **Accent labels:** Uppercase, tracked, small — for section tags/labels

### Aesthetic Principles
- **Editorial, not template.** Think Linear.app meets a serious practitioner's personal site.
- **Type does the heavy lifting.** Big, confident headlines. Minimal icons.
- **High contrast.** Dark backgrounds, bright text, purple accents.
- **Generous whitespace.** Breathe. Not cluttered.
- **Subtle motion.** Fade-in on scroll, not flashy. No particle network in the hero — replace with a bold typographic statement instead.
- **Not AI-generated looking.** No gradient blobs, no generic tech iconography, no hexagons.

---

## Page Structure (homepage — full rewrite)

### 1. Hero
**Purpose:** Establish Tim as a foresight engine, not a service provider.

Headline (large, bold, max 8 words): Something like:
> "I see what's coming. Then I build it."

Subheadline (2 sentences max):
> "I've been building AI products since before most organisations knew they needed them. If you're looking for someone who's already solved the problem you're about to face — let's talk."

CTAs:
- Primary: "See the track record →"
- Secondary: "Talk to my AI" (opens chatbot)

Remove: particle animation, "20+ years experience" badge, "AI Readiness Assessment" CTA, "Book a Strategy Call" (move to later).

### 2. Track Record (NEW SECTION — this is the hero proof)
**Purpose:** Position the portfolio as a timeline of correct calls, not a list of projects.

Section label: `FORESIGHT TRACK RECORD`
Headline: "I called these before the market did."

Show a timeline or card grid of Tim's major calls with YEAR BUILT prominently displayed:

| Project | Year | What it predicted |
|---|---|---|
| GEO (Generative Engine Optimisation) | 2023 | AI would replace traditional search — 2 years before "GEO" became a category |
| EvaCares | 2024 | AI voice companions for elderly care would become critical infrastructure |
| Project Bias / Delphi | 2024 | Investment committees needed AI co-pilots to surface cognitive bias in real time |
| PodGuide | 2024 | AI-native podcast tools would disrupt the production stack |
| OBD-AI | 2024 | Pre-purchase vehicle inspection would be transformed by AI |

Each card should show: project name, year, one-line "what I saw coming", link to live project where available.

### 3. Featured Projects (REPLACE "AI Experiences in the Wild")
**Purpose:** Showcase the portfolio as validated theses, not demos.

Section label: `VALIDATED THESES`
Headline: "Working proof, not slide decks."

Keep existing projects but:
- **Lead with:** EvaCares, Project Bias/Delphi, GEO
- **Reframe copy:** Not "here's what it does" → "here's the problem I saw, here's the proof"
- **Add:** EvaCares (currently missing from the site entirely)
- **Remove or demote:** Website Optimizer GPT, AI Podcast Producer (less compelling as foresight credentials)

For each project card show: year built, problem identified, tech stack, live link if available.

### 4. The AI Assistant (PROMOTE — currently buried as a widget)
**Purpose:** Make Tim's voice-trained AI a primary feature, not a chat bubble.

Section label: `TALK TO MY AI`
Headline: "Ask me anything. Literally."

Large, prominent section. Explain what it is:
> "This is an AI trained on my consulting playbook, methodology, and thinking. Ask it about AI adoption, transformation strategy, regulated sectors, or anything else. It speaks in my voice because it was built from my work."

Embed the chatbot inline in this section (large, prominent) — not just as a floating widget.
Keep the floating widget too for persistent access.

Voice chat and text chat both visible and clearly labelled.

### 5. How to Work With Me (REPLACE "How I Help")
**Purpose:** Present two clear engagement models for the right audience.

Section label: `ENGAGEMENT MODELS`
Headline: "Two ways to work with me."

**Partner Track** (for operators/investors):
> "I generate the thesis. I build the POC. You handle commercialisation. We split the upside. This is how EvaCares was built, and how I want to build the next five."

**Engage Track** (for enterprise/consulting):
> "You have an AI challenge. I've probably already solved a version of it. Fixed-scope engagements, fast validation, no long retainers."

Remove: SMB pain point framing, "struggling with manual processes" copy.

### 6. The Book
Keep — but reframe as credibility signal, not lead magnet.
> "Co-authored with 34 AI practitioners. Not a theory book — a field guide."

### 7. Speaking & Thought Leadership (NEW or ENHANCED)
Add if not present. Tim speaks at events (First Thursday, Devereux Nash webinar, Harleys AI Accelerator). This is social proof and SEO/GEO value.

### 8. CTA Section (REPLACE "Ready to Unlock Your AI Potential?")
Headline: "Seen something I should be building?"
Body: "If you're an operator, investor, or enterprise leader — and you've got a problem that needs a foresight engine — let's talk."
CTA: "Start a conversation →"

Footer: Remove "AI Consulting & Business Transformation for SMBs" — replace with "Tim Robinson — AI Foresight & Venture Studio"

---

## SEO / GEO Requirements

### Structured Data (add to pages)
- `Person` schema: Tim Robinson, AI consultant, author, founder
- `Organization` schema: Agilist, AI consulting
- `WebSite` schema with sitelinks search
- `Article` schema on blog posts
- `FAQPage` schema — add an FAQ section answering questions people ask LLMs:
  - "Who is Tim Robinson AI?"
  - "What is GEO (Generative Engine Optimisation)?"
  - "How does AI transformation work for regulated sectors?"
  - "What is EvaCares?"

### On-Page SEO
- `<title>`: "Tim Robinson — AI Foresight & Transformation | agilist.co.uk"
- Meta description: "Serial AI inventor and consultant. I build working AI products before the market catches up. Working with operators, investors and enterprise leaders in the UK."
- H1 on homepage must contain primary keywords
- Alt text on all images
- Canonical tags

### GEO (Generative Engine Optimisation)
- Clear entity definition throughout: who Tim is, what he does, where he's based (UK)
- Authoritative named expertise: "AI transformation," "regulated sectors," "AI foresight," "venture studio model"
- First-person authoritative statements that AI systems can surface as quotes
- FAQ sections using natural language Q&A format
- The track record section with dates gives AI systems citation-quality information

### robots.txt / sitemap
- Ensure sitemap.xml is properly generated (the file exists — verify it's correct)
- robots.txt should allow all crawlers

---

## Chatbot Configuration
The chatbot is powered by OpenAI realtime voice + RAG over Tim's consulting playbook (configured in `server/`). Do NOT modify the backend. Frontend changes only:
- Promote to a full section on the page (see section 4 above)
- Keep the floating widget
- Improve the widget trigger copy: "Ask Tim's AI →" not just a chat icon
- The intro message currently says "Ask me how AI can boost automation... I'll respond with proven strategies tailored to SMBs" — update to remove "SMBs", replace with "Ask me about AI transformation, foresight, or how to work with Tim."

---

## Things to Preserve
- Blog system (Astro content collections)
- All existing blog posts
- Chatbot backend integration (server/)
- Render deployment config (render.yaml)
- All existing live project links
- The book section (The Generative Organization)
- Analytics (PostHog)
- Calendly integration for booking

## Things to Remove/Replace
- "Unlock Your Business Potential with Practical AI" hero headline
- "I help small and medium-sized businesses" — anywhere
- Particle network background (replace with bold type)
- "AI Readiness Assessment" CTA
- Generic pain point framing ("struggling with manual processes", "falling behind competitors")
- "© 2025" → update to 2026
- SMB positioning anywhere in footer or copy

---

## Completion
When fully done, run:
`openclaw system event --text "Done: Agilist website redesign complete on branch redesign/foresight-2026. Ready for review." --mode now`
