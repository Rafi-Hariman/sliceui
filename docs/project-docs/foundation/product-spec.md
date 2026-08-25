# Product Spec — SliceUI

## 1. Description
The business and product specification for SliceUI: the operating model, brand architecture, target audiences, business processes, monetization, decision gates, business rules, and product positioning. This document is the authoritative source for *what the business is and how it works*; technical implementation remains in `foundation/prd.md` and `foundation/architecture.md`.

## 2. Important
- **This document supersedes the stale vision/personas in `foundation/prd.md` (§7–§9).** The PRD was reverse-engineered from the old "tool for developers" build; the direction changed to "corrected C" (below) on 2026-08-25 after three LLM councils (see `council-transcript-2026-08-25-*.md` at the repo root).
- **Two brands, one founder.** There is no shared umbrella brand. "Webmu" (service) and "SliceUI" (tool) are deliberately separate — they serve audiences that never overlap in language, purchase intent, or discovery channel.
- **QRIS is a legal seam, not a UI button.** Accepting QRIS payments requires a registered Indonesian merchant entity (NPWP/UMKM). This is a business-formation task on the critical path to revenue, tracked separately from naming or UI.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Business Model](#7-business-model)
- [8. Brand Architecture](#8-brand-architecture)
- [9. Target Segments & Audiences](#9-target-segments--audiences)
- [10. Business Processes](#10-business-processes)
- [11. Monetization & Unit Economics](#11-monetization--unit-economics)
- [12. Decision Gates](#12-decision-gates)
- [13. Business Rules](#13-business-rules)
- [14. Product Positioning](#14-product-positioning)
- [15. Success Metrics](#15-success-metrics)
- [16. Related Documents](#16-related-documents)
- [17. Open Questions](#17-open-questions)

## 4. Scope
Covers the business model, brands, audiences, delivery/distribution processes, revenue model, kill/continue gates, and product positioning for the solo-operator business that owns SliceUI. Does not cover engineering detail (see `architecture.md`), feature requirements (see `prd.md`), or execution plans (see `foundation/phases/`).

## 5. Goals
Give an AI agent — or a human — a single authoritative read of *how this business makes money and what to build toward*, so that code is written for the correct product and not the stale vision. Remove ambiguity about which brand faces which customer.

## 6. Non Goals
Not a marketing copy doc, not a legal/tax guide (QRIS entity formation is flagged but its details live elsewhere), not a technical spec, and not a substitute for the phase execution plans.

## 7. Business Model
**"Corrected C" — two bets on one asset.**

The solo operator runs two revenue-bets that share one asset (the SliceUI screenshot-to-code engine):

1. **Cash engine (now):** a landing-page *service* for Indonesian non-coders, sold under the **Webmu** brand. Revenue via QRIS/WhatsApp. The tool is invisible to these customers — never pitch "AI" or "screenshot-to-code" to them.
2. **Product hypothesis (later):** the **SliceUI** tool itself, tested separately via a free launch to agencies/slicing freelancers. Monetized only if it earns pull.

The tool is the same underlying asset in both; the difference is which side of the business funds and validates it. Service revenue is the survival line; tool revenue is optional upside contingent on validation.

## 8. Brand Architecture
Two brands, no shared umbrella. The founder's own name/portfolio is the only shared surface.

| Brand | Audience | Language | What's sold |
| :--- | :--- | :--- | :--- |
| **Webmu** | Indonesian non-coder SMBs (bakery, clinic, vendor) | Bahasa | A live landing page, done-for-you, fast |
| **SliceUI** | Agencies & slicing freelancers (global) | English | Idiomatic component code from a screenshot |

Rules:
- Never surface "SliceUI" to a Webmu customer, and never surface "Webmu" to a SliceUI user.
- "SliceUI" is a dev-tool name ("slice" = slicing a design); "Webmu" is a plain, typeable, Bahasa-friendly name ("web kamu").
- No umbrella brand exists and none should be created until one brand demonstrably compounds (the service is the natural candidate).

## 9. Target Segments & Audiences
| Segment | Who | Need | Language | Discovery | Pays? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Non-coder SMB (Webmu)** | Bakery/clinic/wedding-vendor owners | "A website for my business that's live" | Bahasa | WhatsApp, Instagram, Google Maps, referral | Yes — per page, QRIS |
| **Agencies & slicing freelancers (SliceUI)** | Devs/agencies that slice client designs into code | "Paste-ready component code in my framework + design system" | English | Show HN, r/webdev, X, dev communities | Only if the free launch earns pull |

Note: these two segments never overlap in language, intent, or channel — this is why a single brand serves neither.

## 10. Business Processes

### 10.1 Webmu service delivery (per client)
1. Inbound (DM/WhatsApp) → qualify need (one landing page, business type, logo/design).
2. Show a before/after example (built with the tool).
3. Agree price + deliverable ("live in 48 hours, I handle everything").
4. Build the page with SliceUI as the internal engine; hand-fix until production-quality.
5. Client pays via QRIS; page goes live.
6. Optionally offer retainers / "website + WhatsApp + QRIS" bundle (future).

### 10.2 SliceUI tool distribution (free launch)
1. Port the 3 cheap MIT techniques (design-system block is the priority; self-check/asset-extraction are deferred — see §14).
2. Launch free to dev communities targeting agencies/freelancers.
3. Measure pull: stars, shares, usage, "I'd pay for this" DMs.
4. If pull is real → roadmap + paid tier. If not → kill cheaply, keep the service.

## 11. Monetization & Unit Economics
- **Service price:** Rp 400k–1.2jt per landing page (≈ $25–75), paid via QRIS/WhatsApp. Priced against the local floor (freelancers on Sribulancer/Fiverr, Wix/Canva DIY) — win on speed ("48h live") and trust, not on being cheapest.
- **Survival target:** ~8 pages/month ≈ 2 clients/week (illustrative: Rp 5jt monthly ÷ ~Rp 700k average ticket).
- **Tool price:** none until validated. No subscription, no credit packs until the free launch produces demand signal.
- **COGS rule:** free-tier Gemini at ~15 RPM cannot carry a paying client. Price AI cost into every service job before quoting; build provider margin from day one.

## 12. Decision Gates
| Gate | When | Question | If fail |
| :--- | :--- | :--- | :--- |
| **Sales-motion gate** | Day 30 | Are paid service clients materializing? | Fix offer/channel/price — this diagnoses the *sales motion*, not the tool |
| **Revenue-survival gate** | Day 90 | Is service revenue at survival level? | Reprice, or kill the service |
| **Free-launch pull gate** | Week 12 (2–4 wks after launch) | Do devs/agencies use it / ask to pay? | The "idiomatic component code" thesis was wrong — kill cheaply, exit with a running studio |

Two failures must not be conflated: tool failure ≠ sales failure. The 30-day gate is about the service; the 12-week gate is about the tool.

## 13. Business Rules
- **BR-01** — Webmu never pitches "AI", "screenshot-to-code", "automatic", or "slice". The deliverable is a live page; the method is invisible.
- **BR-02** — The deliverable to a Webmu customer is a working website, never a code file.
- **BR-03** — SliceUI's target is agencies/slicing freelancers with real codebases — not café owners and not v0.dev's consumer audience.
- **BR-04** — QRIS acceptance requires a registered Indonesian merchant entity; do not hard-code a payment button until that exists.
- **BR-05** — Service clients are not a route to tool users (they never demand TSX/tokens). The only bridge from service to product is dogfooding the tool on paid jobs + the agency-facing free launch.
- **BR-06** — Tool time (1 day/week) is spent on features that measurably cut the operator's own delivery time, not on speculative features.

## 14. Product Positioning
**SliceUI's differentiator = idiomatic component code, not preview fidelity.**

| | abi/screenshot-to-code & v0 | SliceUI |
| :--- | :--- | :--- |
| Output | Standalone HTML via CDN (preview-able) | Idiomatic component code (React TSX, Vue 3 SFC, Svelte 5 runes, Next.js, Flutter) |
| Goal | Visual fidelity ("looks like the screenshot") | Integrability ("paste into my project") |
| Consumer | Wants to see a finished preview | Wants code that drops into a real codebase |

Consequences:
- The one abi technique that ports cleanly is the **design-system block** (paste tokens → output conforms) — it serves "paste into my project with my design system."
- Deferred: self-check loop, asset extraction, image generation, variants — these serve preview fidelity, cost 3–5× the API calls, and risk the free-tier rate limit.
- Placeholder images ("gray div + alt text") are acceptable: a dev slicing into their codebase replaces images anyway.

## 15. Success Metrics
- Webmu: paying clients by Day 30; ~8 pages/month revenue by Day 90.
- SliceUI: free-launch pull (stars/shares/usage/pay-intent DMs) within 2–4 weeks.
- Operator efficiency: hours saved per page via the tool (evidence the tool is a real asset).

## 16. Related Documents
- [PRD](prd.md) — technical functional/non-functional requirements (vision §7–§9 superseded here).
- [Architecture](architecture.md) — stack, flows, ADRs.
- [Status](status.md) — current state, roadmap, risks.
- [Phases](phases/index.md) — execution plans (P1–P4), re-sequenced to corrected-C (P2 = Webmu cash engine, P3 = tool productization, P4 = quality/release).
- Council transcripts (repo root): `council-transcript-2026-08-25-1055.md`, `-1241.md`, `-1316.md`.

## 17. Open Questions
- Registered merchant entity / QRIS provider: not yet chosen (TBD).
- Webmu service pricing: Rp 400k–1.2jt range is a hypothesis to test against the local floor.
- Whether SliceUI earns a paid tier post-launch: contingent on the Week-12 pull gate.
