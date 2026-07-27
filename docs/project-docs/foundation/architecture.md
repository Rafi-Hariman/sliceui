# Architecture - SliceUI

## 1. Description

SliceUI is a client-side-heavy **Vite + React 18 SPA**. The browser reads the
image, calls vision LLMs directly (Gemini primary, Groq fallback), renders the
returned code, and - when the user is signed in - persists the conversion to
Supabase. There is no SliceUI-owned server.

## 2. Important

- This document describes the **implemented architecture** (Inferred from
  codebase). It intentionally diverges from `CLAUDE.md`, which sketches a
  Next.js App Router app with a `/api/convert` server route, `sharp`
  normalization, and IP rate limiting - **none of which exist in the code**.
  That sketch is preserved as a future option in [Architecture Decision
  Records](#architecture-decision-records) and `status.md`.
- All AI calls happen in the browser (`dangerouslyAllowBrowser: true` for Groq;
  Gemini SDK client-side). This is the single most important architectural
  constraint and the main security risk.

## 3. Table of Contents

- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [Tech Stack Overview](#tech-stack-overview)
- [Architecture Pattern](#architecture-pattern)
- [System Flow](#system-flow)
- [Data Flow](#data-flow)
- [Tools Integration](#tools-integration)
- [Global Parameters and Constraints](#global-parameters-and-constraints)
- [Architecture Decision Records](#architecture-decision-records)
- [Success Metrics](#success-metrics)
- [Related Documents](#related-documents)
- [Open Questions](#open-questions)

## 4. Scope

Covers the runtime architecture of the SliceUI SPA: modules, call flow, data
movement, integrations, and cross-cutting constraints. Does not cover business
requirements (see `prd.md`) or deploy pipeline (see `operations/ci-cd.md`).

## 5. Goals

- Keep the pipeline simple: one multimodal model call per conversion.
- Isolate provider logic behind `aiService.ts` so primary/fallback can change.
- Keep UI concerns decoupled via hooks (`useConvert`, `useImageUpload`).

## 6. Non Goals

- No server-side rendering, no API routes, no server-side key vaulting (today).
- No multi-image or full-page orchestration.
- No streaming responses.

## Tech Stack Overview

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| Build | Vite 5 + SWC | `@vitejs/plugin-react-swc`, dev port 8080 |
| UI | React 18 + TypeScript | SPA, `src/main.tsx` entry |
| Routing | react-router-dom v6 | `/`, `/auth`, `/dashboard`, `/slice`, `/settings` |
| Components | shadcn/ui (Radix UI) | `src/components/ui/*` |
| Styling | Tailwind CSS 3 + `tailwindcss-animate` | HSL CSS vars, `@` alias |
| Data fetching | TanStack Query | `QueryClientProvider` in `App.tsx` |
| Theming | next-themes | `attribute="class"`, dark default |
| Forms | react-hook-form + zod | present in deps |
| Auth + DB | Supabase JS v2 | `src/integrations/supabase/*` |
| AI (primary) | `@google/generative-ai` | model `gemini-flash-latest` |
| AI (fallback) | `groq-sdk` | model `pixtral-12b-2409`, browser mode |
| Code display | react-syntax-highlighter (Prism) | `CodeOutput.tsx` |
| 3D accents | three + @react-three/fiber/drei | `Logo3D.tsx` |
| Tests | Vitest + Testing Library (+ Playwright dep, unused) | jsdom |

## Architecture Pattern

- **Layered client SPA:** pages (`src/pages`) → feature components/hooks
  (`src/components`, `src/hooks`) → services (`src/lib`) → integrations
  (`src/integrations`).
- **Provider facade:** `aiService.imageToCode()` is the single entry point for
  generation; callers never touch Gemini/Groq directly.
- **Auth context:** `AuthContext` wraps the router and exposes
  `user`/`session`/`profile`; consumed by `useConvert` to decide persistence.

## System Flow

```
[Browser /slice]
   │ drag-drop | picker | paste  (useImageUpload: validate + preview)
   ▼
[File → base64]  (useConvert)
   ▼
[aiService.imageToCode]  ──►  Gemini (gemini-flash-latest)  + image + prompt
   │                                     │
   │  on 429/quota & GROQ key set         │
   ▼                                     ▼
[Groq (pixtral-12b-2409)] ◄────────── fallback
   ▼
[clean() strips ``` fences]
   ▼
[CodeOutput: highlight | Preview iframe | copy/download]
   │ if user signed in
   ▼
[Supabase: upload image → sliceui-images bucket]
[Supabase: insert row → conversions]
```

## Data Flow

- **Image bytes** never leave the browser except to the AI provider (as base64
  inline data) and, when signed in, to Supabase Storage.
- **Generated code** flows: model → `clean()` → React state (`useConvert.code`)
  → `CodeOutput`. On persistence, it is stored as `generated_code` text in the
  `conversions` row.
- **Auth/session** flows from Supabase → `AuthContext` → consumers; session
  persisted in `localStorage` (`persistSession: true`).

## Tools Integration

- **Gemini:** `GoogleGenerativeAI(VITE_GEMINI_API_KEY)`, single
  `generateContent([prompt, inlineData])` call.
- **Groq:** `new Groq({ apiKey, dangerouslyAllowBrowser: true })`,
  `chat.completions.create` with text + `image_url` (data URL).
- **Supabase client:** `createClient<Database>(url, publishableKey,
  { auth: { storage: localStorage, persistSession, autoRefreshToken } })`.
- **Preview runtime:** `CodeOutput.getPreviewDoc` assembles a full HTML document
  per framework (Tailwind CDN, Bootstrap CDN, React UMD + Babel standalone, Vue
  global build) and renders it in `sandbox="allow-scripts"` iframe.

## Global Parameters and Constraints

- `VITE_*` env vars only (client-bundled): `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_GEMINI_API_KEY`, `VITE_GROQ_API_KEY`.
- Image constraints (client-validated): PNG/JPEG/WebP, ≤10 MB.
- Groq response cap: `max_tokens: 4096`.
- Path alias `@` → `src/` (configured in `vite.config.ts`, `tsconfig`,
  `vitest.config.ts`).

## Architecture Decision Records

- **ADR-1 - Vite SPA (not Next.js).** *Status: implemented.* The repo was
  scaffolded via Lovable, which emits a Vite/React SPA. The original build spec
  ([`reference/prompt.md`](../reference/prompt.md)) and `CLAUDE.md` describe a
  Next.js 14 App Router design that was **never built**. *Consequence:* no
  server route, no server-side rate limiting or normalization.
- **ADR-2 - Client-side AI calls.** *Status: implemented.* Gemini/Groq are
  called from the browser to avoid a backend. *Consequence:* API keys are
  exposed to users; free-tier abuse is bounded only by provider quotas, not by
  a SliceUI rate limiter. Revisit before any public launch.
- **ADR-3 - Single multimodal call.** *Status: implemented.* One request does
  vision + codegen, with automatic Groq fallback on 429/quota. No two-stage
  OCR→codegen pipeline.
- **ADR-4 - Guest mode (local dev).** *Status: implemented, guarded by comment.*
  The login check in `useConvert` is commented out so generation works without
  auth; persistence is conditional on `user`. Re-enable before production.

## Success Metrics

- Generate success rate (incl. fallback path).
- P50/P90 upload→code latency.
- Zero unplanned key rotations caused by leakage (aspirational).

## Related Documents

- [prd.md](./prd.md) - what the architecture delivers.
- [api-contract.md](../development/api-contract.md) - provider + Supabase APIs.
- [database.md](../development/database.md) - schema and storage.
- [status.md](./status.md) - implemented vs. planned (incl. CLAUDE.md delta).

## Open Questions

- Migrate AI calls behind a thin server/edge function to hide keys and add rate
  limiting (ADR-2 follow-up)?
- Replace `pixtral-12b-2409` / `gemini-flash-latest` with pinned model versions
  for reproducibility?
- Centralize the preview-CDN dependencies (currently inlined per framework in
  `CodeOutput`) into a shared module?
