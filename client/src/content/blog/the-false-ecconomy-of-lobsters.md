---
title: "the false ecconomy of lobsters"
date: 2026-03-09
summary: "why a middleware can be a hinderance"
tags: ["AI", "Agents", "ROI"]
draft: false
---

# $250 a Week on API Costs. Still Got a Dumb Agent. So I Removed the Middleware Entirely.

I run a solo AI transformation consultancy. For months, I used an agent framework to act as my virtual COO — managing my CRM, monitoring LinkedIn, preparing daily briefings, and keeping my pipeline honest.

It cost me roughly $250 a week in API spend. And it was still bad.

That's the dirty secret of AI agent frameworks: you either pay for a smart agent that's expensive, or you optimise costs and get a dumb one. I tried every middle ground — tiered model routing (Haiku for ingestion, Sonnet for reasoning), prompt caching, budget models for triage with premium models for the hard stuff. Nothing worked. The middleware layer between the model and my tools burned tokens on every heartbeat, every tool call, every retry loop.

$1,000 a month for an assistant that classified an active project as "going cold" and couldn't tell the difference between an investor and a cold lead.

So I ran an experiment. I ripped out the agent framework entirely and replaced it with three things most people already have access to: **Claude**, **MCP server connections**, and **Cowork scheduled tasks**. No API keys for the core loop. No custom orchestration code. Just a thinner stack where the model talks directly to my tools.

Anthropic's Model Context Protocol (MCP), released as an open standard in late 2024, enables AI models to connect directly to external data sources and tools through a universal interface. It eliminates the custom integration code that agent frameworks typically require — and with it, the token overhead of middleware decision-making.

This is an ongoing experiment — I'm a couple of weeks in and still refining. But the economics have already flipped, and the output quality is better. Here's exactly what I've built and how you can replicate it.

---

## The Problem with Agent Middleware (It's the Economics)

Most AI agent frameworks follow the same pattern: you write a system prompt describing what you want, then the framework handles tool-calling, error recovery, state management, and scheduling. The framework is the brain's hands.

The issue is twofold. First, those hands are clumsy — general-purpose frameworks hallucinate tool calls, lose context across sessions, and take the path of least resistance when they hit ambiguity. Kanjun Qiu, CEO of Imbue (an AI research company focused on agents), noted in a 2024 interview that most agent failures stem not from model limitations but from brittle tool-calling abstractions layered on top of capable models. Second, and less discussed: **every operation costs tokens.** The framework's own decision-making about which tool to call, its retry logic when things fail, its state serialisation between turns — all of that is inference you're paying for that isn't actually doing your work.

I tried to optimise my way out of it. Haiku for ingestion and classification, Sonnet for relationship reasoning, Opus only for strategic synthesis. Prompt caching on the system prompt. Daily budget caps. The spend came down, but so did the quality — proportionally. There was no sweet spot where I got a competent agent at a reasonable price. The middleware layer imposed a floor on both cost and unreliability.

My old stack looked like this:

```
OpenClaw (agent framework on OpenAI Codex)
  → Twenty CRM (self-hosted, Tailscale)
  → Rowboat (markdown knowledge base)
  → LinkedIn (browser automation)
  → Telegram (human-in-the-loop approval)
```

OpenClaw was essentially an API gateway with a Telegram interface and connector layer. It wasn't doing much that Claude couldn't do directly — it was just adding a brittle middleware layer between the reasoning and the tools.

## The Replacement Architecture

The key move: eliminate the middleware and let the model access tools directly. The new stack:

```
Claude (via claude.ai + Desktop app)
  → Gmail (MCP server — read/write)
  → Google Calendar (MCP server — read/write)
  → Granola (MCP server — meeting transcripts)
  → HubSpot (MCP server — CRM)
  → Basic Memory (MCP server — Obsidian knowledge store)
  → LinkedIn feed digest (MCP tool)
  → Cowork (scheduled autonomous tasks)
```

No middleware. No API keys for the core loop. No custom orchestration code. Claude *is* the reasoning layer, and the MCP servers give it direct access to the tools.

## Step 1: Connect Your Tools via MCP

MCP (Model Context Protocol) is what makes this work. It's a standard that lets Claude talk directly to external services — read your email, check your calendar, query your CRM — without you building API integrations.

**What I connected:**

- **Gmail** — Claude reads threads, searches by sender/subject, and drafts responses. I review before anything sends.
- **Google Calendar** — Claude checks my schedule, finds free time, creates events. Essential for the pre-meeting briefing system.
- **Granola** — Meeting transcript tool. Claude queries past meetings to pull context before upcoming ones. This is the memory layer that most setups miss.
- **HubSpot** (free tier) — Replaced my self-hosted Twenty CRM. The key reason: HubSpot has an official remote MCP server that works directly in claude.ai. Twenty's community MCP server is local-only, which means it needs Claude Desktop or Code on a Tailscale-connected machine. For a solo operator, the hosted option wins on convenience.
- **Basic Memory** — An Obsidian-based MCP server that gives Claude persistent memory across sessions. Contact notes, project context, relationship history, pipeline status. This is where institutional knowledge lives.

**How to set it up:**

In claude.ai, go to the integrations/tools menu. Most of the above are available as toggleable MCP connections — Gmail, Calendar, and HubSpot connect via OAuth. Basic Memory and Granola require the Claude Desktop app and a local MCP server (both are straightforward npm installs).

The critical insight: **you don't need all of these on day one.** Start with Gmail + Calendar + one knowledge store. That's enough for a functioning EA. Add CRM and meeting transcripts when you want the COO layer.

## Step 2: Define the COO Role

This isn't about a single system prompt. It's about giving Claude enough operational context to make good decisions across your tools.

What Claude needs to know:

- **Who your active clients are** and what stage they're at (delivery, pipeline, dormant)
- **How to classify contacts** — not every name in your CRM is a prospect. Investors, collaborators, co-authors, and suppliers all need different treatment
- **What "done" looks like** for recurring tasks — a daily briefing has a specific format, a pre-meeting brief has required sections
- **Your decision rules** — when to flag something as urgent vs. informational, when to ask you rather than assume

I maintain this context in Basic Memory as structured markdown files. Claude reads them before generating briefings or making recommendations. When context changes — a new client signs, a deal closes — I update the file and Claude adapts immediately. No retraining, no prompt engineering sessions.

**One hard-learned lesson:** Be explicit about what Claude should *not* do. My early briefings classified an active £28k project as "going cold" because the contact hadn't emailed in 74 days — ignoring that the work was actively in progress. The fix was a clear taxonomy: check CRM stage before flagging anyone, distinguish between delivery clients and prospects, and ask rather than assume when classification is uncertain.

## Step 3: Build Scheduled Tasks in Cowork

Cowork is the feature that turns Claude from an on-demand assistant into an autonomous operator. It's built into the Claude Desktop app (macOS and Windows) and lets you create tasks that run on a schedule — while your machine is awake and the app is open.

**My three core scheduled tasks:**

### 1. Pre-Meeting Briefing (runs every 45 minutes)

This is the highest-value automation in the system. It:

- Scans my calendar for meetings starting in the next 45 minutes
- Skips all-day events and meetings with no other attendees
- Checks Basic Memory for whether a brief has already been sent (deduplication)
- For each un-briefed meeting: queries Granola for past meetings with the same attendees, searches Gmail for recent threads, pulls relationship context from Basic Memory
- Sends the brief via iMessage — attendees, context, last decisions, prep actions — under 200 words

The dedup pattern matters. Without it, you get the same brief every 45 minutes. The task writes a "Brief Sent — [meeting] — [date]" note to Basic Memory after each delivery, and checks for it before sending again.

### 2. Daily Operational Briefing (runs at 08:00)

A morning snapshot structured around five sections:

- 🔴 **Needs Action Today** — only items where I must act today or something breaks
- 📋 **Delivery Pulse** — active client status, blockers (typed: dependency, action needed, external, admin), invoice readiness
- 📈 **Pipeline & BD** — pre-contract prospects, relationship temperature, next steps
- 📅 **Upcoming Deadlines** — 7-day lookahead
- 💡 **Strategic Nudge** — pattern-level observations from cross-referencing all sources

### 3. LinkedIn Feed Monitor

Scans my LinkedIn feed via the digest tool, scores posts by relevance to my ICP (senior decision-makers in AI transformation), and surfaces engagement opportunities. Drafts are generated but never posted without my review.

## Step 4: Close the Loop with Human-in-the-Loop

This is non-negotiable. Claude drafts, I approve. Nothing goes out — no emails, no LinkedIn comments, no calendar invites — without my explicit sign-off.

The architecture is designed to augment my natural workflow, not replace my judgement. Claude surfaces the signal, prepares the response, and puts it in front of me. I decide whether it ships.

For messages, I use a compose-review-approve pattern. Claude drafts in the chat, I edit if needed, then confirm. For scheduled outputs like briefings, they arrive via iMessage where I can read them passively — no action required unless something needs attention.

## What This Actually Costs (The Whole Point)

**Before:** ~$250/week in API spend through the agent framework, plus hosting, plus debugging time. That's roughly $1,000/month for a mediocre assistant. And every attempt to reduce that spend made the assistant dumber.

**Now:** Claude Max subscription at $100/month (~£80). That covers:

- Unlimited claude.ai chat for ad-hoc COO queries
- 5x the usage capacity of the Pro plan — essential for running multiple Cowork scheduled tasks daily
- Cowork scheduled tasks drawing from the daily usage allowance
- All MCP connections included
- No per-token API charges for the core loop

From ~$1,000/month to $100/month. And the output quality is better.

The API spend on the COO function has gone to zero. Not reduced — gone. The model is doing better work because it's reasoning directly over my data through MCP, not through a middleware layer that loses context and burns tokens on its own decision-making overhead.

I still use the Anthropic API for other projects (development work via Claude Code, for instance), but the operational COO system runs entirely within the Max subscription. Claude Code is also included in Max, so even the development tooling is covered.

That's the economic insight: **subscription-based access to a frontier model with native tool integration is categorically cheaper than API-based access through an agent framework** — and it's also better, because the model sees your data directly rather than through a middleware translation layer. Even at $100/month for Max, I'm saving 90% compared to the agent framework approach.

A16z's 2024 analysis of AI application economics found that for many AI-powered workflows, infrastructure and API costs consume 20–40% of revenue — a ratio that threatens viability at scale. Subscription-based model access with native integrations sidesteps this entirely for individual operators and small teams.

## Where I Am Now (This Is Still an Experiment)

I want to be honest: this isn't a finished system. I'm a couple of weeks in and actively iterating on:

- **Contact classification** — getting Claude to reliably distinguish between clients, prospects, investors, and collaborators required explicit taxonomy files in Basic Memory. It's working now but I'm still catching edge cases.
- **Briefing format** — the daily ops briefing went through several iterations before the current five-section structure landed. The pre-meeting briefing was more immediately useful.
- **Scheduled task reliability** — Cowork tasks only run while the Mac is awake and the Desktop app is open. That's a real constraint compared to always-on server-based agents. I'm designing around it rather than fighting it.
- **CRM migration** — I moved from a self-hosted CRM (Twenty) to HubSpot specifically because HubSpot has a remote MCP server that works in claude.ai. That trade-off (convenience vs control) is still being evaluated.

The economics, though, are settled. The API spend is gone and the output quality is better. Everything else is refinement.

## What I've Learned So Far

**Start with the pre-meeting briefing, not the daily ops briefing.** The pre-meeting brief delivers immediate, tangible value — you walk into every meeting prepared. The daily briefing requires more context setup (CRM data, contact classification rules) and is harder to get right on day one.

**Get contact classification right early.** The single biggest source of bad briefings was Claude misclassifying contacts. Define your taxonomy explicitly: client, prospect, investor, collaborator, supplier, dormant. Store it in your knowledge base. Don't let Claude infer it.

**Use Basic Memory from the start.** Claude's built-in memory across sessions is good but limited. A proper knowledge store — even just a folder of markdown files — gives you institutional memory that compounds over time. Every meeting note, every client interaction, every decision feeds the system.

**Don't over-automate.** The temptation is to build a fully autonomous system. Resist it. The value is in Claude handling the 80% of operational work that's repetitive and context-dependent, while you focus on the 20% that requires human judgement, relationship nuance, and strategic thinking.

---

## The Bigger Picture

What I'm building isn't a product. It's a pattern — one that any solo consultant, freelancer, or small team operator can replicate with tools that already exist.

The insight isn't "use AI to automate your business." It's that the middleware layer most people think they need — the agent frameworks, the orchestration tools, the custom integrations — is often the thing making the system worse *and* more expensive. Claude with direct tool access via MCP is more reliable, more capable, and dramatically cheaper than Claude mediated through an agent framework.

I'll keep updating this article as the experiment evolves. The architecture is solid; the refinement is ongoing. If you build something similar, I'd genuinely like to hear what you find.

The future of AI-augmented work isn't about building more complex systems. It's about making the stack thinner until the AI can just do the work.

---

*Tim Robinson is an AI transformation consultant and serial inventor at [Agilist Limited](https://agilist.co.uk). He helps organisations adopt AI that actually works — not just AI that demos well. If you're building something similar or want to talk through your own AI operations setup, connect on LinkedIn or visit agilist.co.uk.*