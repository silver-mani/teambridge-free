# Teambridge Free Tier — Design Brief for Claude Code

## Context
This project is for **Arjun Vora, Co-Founder & CEO of Teambridge** (teambridge.com).

Teambridge is an AI-native, composable workforce management platform for hourly, contract, and frontline teams. Industries served: healthcare, staffing, events/venues, security, light industrial, construction.

---

## What We're Building
A **free tier / sandbox experience** ("the cupcake") with two goals:
1. **Top of funnel** — Let prospects "feel the silk" of the product. Show how AI-native Teambridge is before they ever talk to sales.
2. **Deal acceleration** — Give late-stage prospects a sandbox to build confidence and increase close rate + velocity.

This is NOT a traditional free tier with gated features. It is a **curated experience designed to create wow moments**, specifically around Teambridge AI.

---

## The User
**Operator persona** — Ops leads, HR leads, and business owners who manage larger hourly workforces. They are:
- Time-poor and skeptical of overhyped AI tools
- Deeply familiar with the pain of last-minute shift coverage, manual scheduling, and admin overhead
- Want to feel in control — they don't want a guided sales tour, they want to feel like they're driving

---

## The Experience Flow

### Act 1 — Watch AI Work (no interaction required)
The prospect lands on a dashboard. A shift cancellation just happened — they watch Teambridge AI resolve it in real time, unprompted.

**The scene:**
- A notification appears: *"Marcus T. cancelled his 7pm shift at Memorial North. 4 hours notice."*
- The AI agent visibly works through it, step by step:
  - 🔍 Searching qualified available staff...
  - ✅ Found 3 matches. Filtering by proximity, hours, past performance...
  - 📲 Sending offer to Janelle R. — closest match, hasn't hit overtime...
  - ✓ Janelle accepted. Shift covered. 4 minutes elapsed.
- A kicker line appears: *"Your team used to spend 45 minutes on this. Want to see how it works?"*

**Key principle:** The user does nothing in Act 1. They just witness. Trust is built before a single click.

**Industry personalization:** On entry, user selects their industry (1 click). Dummy data reflects their world — healthcare sees nursing shifts and credentialing; stadiums see event staff and surge scheduling, etc.

---

### Act 2 — Direct the AI (guided + freeform)
After Act 1 resolves, present **3 suggested scenario cards** tailored to their industry and what they haven't seen yet. Example:
- 📅 "Fill my weekend gaps automatically"
- 📋 "Onboard a new hire in under 5 minutes"
- 💬 "See how staff self-serve their own schedules"

Below the cards: an open chat input with placeholder text *"Or ask anything..."*

**Key principle:** Cards remove blank-page anxiety. Open input signals real intelligence, not a scripted demo. Operator feels in control.

The suggested cards should be dynamic — shift based on industry selected and what was shown in Act 1.

---

### Act 3 — Shape the AI (ownership moment)
Let the operator adjust one agent workflow. Simple, tactile, meaningful.

Example: *"The agent notifies workers 4 hours before a shift gap. Change that to 6?"* — one toggle or input. They adjust it. It feels like their system now.

**Key principle:** Moving from watching AI → directing AI → shaping AI creates progressive ownership and trust.

---

### Act 4 — See the System Underneath
Glimpses of the base product — schedule page, employee table — but always with the AI layer visible. Not a feature tour. Every screen shows what the AI is actively monitoring, flagging, or optimizing.

**Key principle:** The base product is the foundation you reveal, not the feature you demo. It should feel like "look how deep the AI goes" not "here's another SaaS grid."

---

## Screens to Build

1. **Industry selector** — Minimal, 1-click entry screen. Pick industry, enter the experience.
2. **Act 1 — Live agent dashboard** — Ops overview with real-time agent activity panel. Shift cancellation scenario plays out.
3. **Act 2 — Guided scenario screen** — 3 scenario cards + open chat input. Post-Act 1 state.
4. **Act 3 — Agent workflow editor** — Simple view of an agent's rules/settings. One adjustment interaction.
5. **Act 4 — Schedule page with AI layer** — Standard schedule grid but with active AI sidebar showing what it's monitoring.
6. **Act 4 — Employee table with AI layer** — Employee list with AI activity/flags visible inline.

---

## UX Principles

- **Watch before interact** — Let the AI prove itself before asking anything of the user
- **Guided but not scripted** — Cards give direction, open input gives freedom
- **AI layer always visible** — Never show a screen where AI is invisible or implied
- **Operator in control** — Every interaction should feel like the operator is driving, not being demoed to
- **Industry-native dummy data** — Pre-loaded realistic data that mirrors the prospect's actual world
- **No import friction** — Zero setup required. They land and it works.

---

## Design Notes for Claude Code
- Use the existing Teambridge design system in this repo for all components, tokens, colors, and typography
- The experience should feel like the real Teambridge product — not a marketing page
- Mobile considerations matter (operators are often on the floor) but desktop-first for this sandbox
- The Act 1 agent activity should feel alive — consider subtle animations for the step-by-step reasoning
- Tone: confident, clean, operator-grade. Not flashy. Not consumer. Not generic AI aesthetic.

---

## What Success Looks Like
A prospect spends 5-10 minutes in this experience and leaves thinking:
1. *"That AI actually works."*
2. *"This understands my industry."*
3. *"I want my whole team on this."*

Not: *"That was a cool demo."*
