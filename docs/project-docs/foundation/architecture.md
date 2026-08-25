# Architecture — SliceUI

## 1. Description
System architecture for SliceUI: the tech stack, architecture pattern, system and data flows, tool integrations, global constraints, and architecture decision records.

## 2. Important
- **Inferred from codebase:** this supersedes the stale root `CLAUDE.md`, which describes a Next.js 14 App Router architecture. The actual app is a **Vite + React 18 SPA** with client-side AI calls and Supabase integrations.
- All AI provider calls run **in the browser** (client-side API keys). There is no backend/API route layer.
- **Supabase persistence is intent, not reality (confirmed 2026-08-24):** the app queries a `conversions` table and `sliceui-images` bucket that are **absent from the generated types and any committed migration/RLS**. Auth runs via `VITE_BYPASS_AUTH` mock. See ADR-003.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Tech Stack Overview](#7-tech-stack-overview)
- [8. Architecture Pattern](#8-architecture-pattern)
- [9. System Flow](#9-system-flow)
- [10. Data Flow](#10-data-flow)
- [11. Tools Integration](#11-tools-integration)
- [12. Global Parameters and Constraints](#12-global-parameters-and-constraints)
- [13. Architecture Decision Records](#13-architecture-decision-records)
- [14. Success Metrics](#14-success-metrics)
- [15. Related Documents](#15-related-documents)
- [16. Open Questions](#16-open-questions)

## 4. Scope
Describes the frontend application architecture, its external integrations (AI providers, Supabase), data flow, and the key decisions behind the current design.

## 5. Goals
Give contributors an accurate mental model of how the app is structured and how data moves through the slice pipeline.

## 6. Non Goals
Does not describe a backend server (there is none), production deployment topology (see `operations/production-runbook.md`), or CI/CD (see `operations/ci-cd.md`).

## 7. Tech Stack Overview
| Layer | Choice | Notes |
| :--- | :--- | :--- |
| Build tool | Vite 5 | `vite.config.ts`, dev server on `:8080` |
| UI framework | React 18 | SPA via `react-router-dom` v6 |
| Language | TypeScript strict | `tsconfig.app.json` |
| Styling | Tailwind CSS 3 + shadcn/ui | Radix primitives, HSL design tokens |
| State | React Query (TanStack) + Context | `QueryClientProvider`, `AuthContext` |
| Auth | Supabase Auth (email/password) | `@supabase/supabase-js`, generated types |
| Database | Supabase Postgres | `profiles`, `conversions` tables |
| Storage | Supabase Storage | `sliceui-images` bucket |
| AI (primary) | Google Gemini | `gemini-flash-latest` via `@google/generative-ai` |
| AI (fallback) | Groq | `pixtral-12b-2409` via `groq-sdk` (browser) |
| Syntax highlight | react-syntax-highlighter | `CodeOutput` |
| Theming | next-themes | dark/light, `.dark` class |
| Tests | Vitest + Testing Library | `jsdom`, `vitest.config.ts` |
| E2E | Playwright | dependency present; no specs found |
| Upstream | Lovable | project scaffold + `lovable-tagger` |

## 8. Architecture Pattern
**Client-heavy single-page application** (CSR) with the browser acting as the integration hub:
- React SPA owns all UI + orchestration (upload → AI → persist).
- Supabase provides auth session, database, and storage via the JS client.
- AI providers are called directly from the browser with a Gemini → Groq fallback chain.

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser (SPA)                        │
│                                                              │
│  Pages: Landing · Auth · Dashboard · Slice · Settings       │
│   └─ AppLayout (sidebar, header)                             │
│                                                              │
│  Slice pipeline                                              │
│   useImageUpload ──► useConvert ──► aiService                │
│                          │               └─ Gemini ─┐        │
│                          ▼                    (429) fallback │
│   conversionService ── uploadSliceImage      Groq  ─┘        │
│        │                                     └─ buildPrompt  │
│        ▼                                                        │
│   CodeOutput (syntax highlighted)                            │
└───────────┬──────────────────────────┬───────────────────────┘
            │ Supabase JS client       │ AI provider keys (browser)
            ▼                          ▼
   ┌────────────────┐         ┌──────────────────┐
   │    Supabase    │         │ Gemini / Groq    │
   │  Auth · PG ·   │         │ (HTTPS, direct)  │
   │  Storage       │         └──────────────────┘
   └────────────────┘
```

## 9. System Flow
### 9.1 Slice conversion flow
1. User uploads an image (drag / picker / paste) → `useImageUpload` validates (PNG/JPG/WebP ≤10MB) and shows a preview.
2. User selects a framework and (optionally) types instructions (instructions not yet passed to the model — see PRD FR-9).
3. `useConvert.convert(file, framework, options)`:
   - reads file to base64 via `FileReader`;
   - calls `imageToCode(base64, framework, options)` (Gemini → Groq fallback);
   - **on success, persists only when a session exists** — uploads the image to Supabase storage and inserts a `conversions` row (`if (user)`); **⚠️ these targets do not exist yet** (see ADR-003), so persistence currently fails/needs provisioning. Without a session, the code is generated + shown but not saved.
4. `CodeOutput` renders the generated code with syntax highlighting and Code | Preview tabs + download.

### 9.2 Auth flow
- `AuthProvider` listens to `supabase.auth.onAuthStateChange` and `getSession`.
- **All routes are public (local-first)** — `/dashboard`, `/slice`, `/settings` render regardless of session; no `ProtectedRoute` redirect.
- `VITE_BYPASS_AUTH=true` injects a mock user + profile, skipping Supabase entirely.

## 10. Data Flow
```
Image file ──► FileReader(base64) ──► imageToCode()
                                         │
                                         ├─► Gemini.generateContent([prompt, image])
                                         │        └─► clean(raw) ──► code string
                                         └─► (429) Groq.chat.completions ──► clean() ──► code
code string ──► setCode ──► CodeOutput (UI, Code|Preview tabs + download)
image file ──► uploadSliceImage(userId) ──► storage: sliceui-images/{userId}/{ts}-{rand}.ext   ⚠ NOT PROVISIONED
code + imageUrl ──► createConversion(userId, ...) ──► table: conversions                        ⚠ NOT PROVISIONED
```

### 10.1 Entities
| Entity | Source | Fields | Status |
| :--- | :--- | :--- | :--- |
| `profiles` | Supabase table (in generated types) | `id`, `user_id`, `full_name`, `job_title`, `avatar_url`, `created_at`, `updated_at` | ✅ in types |
| `conversions` | **Intended** table (from `conversionService` usage) | `id`, `user_id`, `original_image_url`, `original_image_name`, `framework`, `options`, `generated_code`, `status`, `error_message`, `created_at` | ⚠ **absent from types + no migration** |
| `Conversion` | `src/lib/types.ts` | mirrors the intended `conversions` row | — |
| `sliceui-images` | **Intended** storage bucket | `{userId}/{timestamp}-{random}.{ext}` | ⚠ **not provisioned** |

> **Confirmed gap (2026-08-24):** `src/integrations/supabase/types.ts` contains **no `conversions` table** (only `activity_log`, `attachments`, `bugs`, `comments`, `company_settings`, `invitations`, `notification_preferences`, `profiles`, `projects`, `user_roles` + functions). The `sliceui-images` bucket is not provisioned in `supabase/`. `conversionService.ts`/`storageService.ts` reference both — this will fail against a real project until the schema + bucket are created and types regenerated.
>
> Note: the `projects`, `user_roles`, `activity_log`, etc. tables are scaffold leftovers not used by the slice feature.

## 11. Tools Integration
| Tool | Integration point |
| :--- | :--- |
| Gemini | `src/lib/aiService.ts` — `getGenerativeModel("gemini-flash-latest")` |
| Groq | `src/lib/aiService.ts` — `groq.chat.completions.create`, model `pixtral-12b-2409`, `dangerouslyAllowBrowser: true` |
| Supabase | `src/integrations/supabase/client.ts` — `createClient<Database>` | Auth bypassed in dev (`VITE_BYPASS_AUTH`); `conversions`/`sliceui-images` not provisioned (ADR-003) |
| React Query | `src/App.tsx` — global `QueryClient` |
| next-themes | `src/App.tsx` — `ThemeProvider defaultTheme="dark"` |

## 12. Global Parameters and Constraints
- **Client-side API keys:** Gemini/Groq keys are shipped to the browser via `import.meta.env.VITE_*`. This is a conscious tradeoff (no backend) but exposes keys publicly — see `operations/security-compliance.md`.
- **No server-side rate limiting:** quota control relies on provider 429 responses and the Groq fallback. There is no in-memory/Redis limiter (the stale `CLAUDE.md` described one; the codebase does not implement it).
- **No image normalization server-side:** the SPA does not resize/normalize images before sending; only client-side type/size validation happens.
- **Dark mode default:** `defaultTheme="dark"`; theme persisted to `localStorage`.
- **Alias:** `@/` → `src/` (Vite + Vitest + tsconfig).
- **Auth bypass:** `VITE_BYPASS_AUTH` mock (in `AuthContext`) is the current dev default; production must not set it.

## 13. Architecture Decision Records
### ADR-001: Client-side AI calls instead of a backend proxy
- **Status:** Accepted (current code).
- **Context:** The original design (stale `CLAUDE.md`) described a Next.js API route with server-side keys and sharp normalization. The current code calls Gemini/Groq directly from the browser.
- **Decision:** Keep AI calls in the browser using `VITE_*` keys.
- **Consequences:** Simplest deploy (static SPA, no server), but keys are public, no server-side rate limiting, and no server-side image normalization. If abuse or cost becomes an issue, revisit with a proxy route.

### ADR-002: Gemini → Groq fallback in one call
- **Status:** Accepted.
- **Context:** Single-stage vision+codegen (send image, get code). Gemini free tier rate-limits at 15 RPM / 1500 req/day.
- **Decision:** Call Gemini first; on 429/quota/rate-limit, transparently retry with Groq (`pixtral-12b-2409`).
- **Consequences:** Better uptime for users; two vendor keys to maintain; output quality differs between providers.

### ADR-003: Supabase as the persistence + auth backend — **intent, not yet provisioned**
- **Status:** Accepted (direction) — **partially implemented** (confirmed 2026-08-24).
- **Context:** Need auth, per-user conversion history, and image storage without running a server.
- **Decision:** Use Supabase Auth + Postgres (`profiles`, `conversions`) + Storage (`sliceui-images`).
- **Reality check:** `profiles` exists in generated types; **`conversions` and `sliceui-images` do not** — no migration/RLS committed, only `supabase/config.toml`. Auth is bypassed in dev via `VITE_BYPASS_AUTH`.
- **Consequences:** Fast to ship once provisioned; **blocker**: the service layer and Dashboard depend on the missing table/bucket. Provisioning is Phase P2 (see `foundation/phases/`).

### ADR-004: Keep conversion pipeline entirely client-side (React SPA)
- **Status:** Accepted.
- **Context:** Lovable scaffold produced a Vite SPA; the slice feature was layered on top.
- **Decision:** No server; SPA orchestrates upload → AI → persistence.
- **Consequences:** Simple deploy to static hosts (Vercel/Lovable); all orchestration is visible in the browser; large images are base64'd in memory client-side.

## 14. Success Metrics
- Number of successful conversions without manual retry.
- Time-to-first-code for the Slice flow.
- Consistency between the docs here and the actual `src/` tree.

## 15. Related Documents
- [PRD](prd.md)
- [API Contract](../development/api-contract.md)
- [Database](../development/database.md)
- [Security & Compliance](../operations/security-compliance.md)
- [Technical Guidelines — AI Service](../technical-guidelines/ai-service.md)

## 16. Open Questions
- Should a backend proxy be introduced for AI calls (server-side keys, rate limiting, image normalization)? See ADR-001 — currently no.
- What is the final deploy target? Lovable publish is the documented path; Vercel is mentioned in the stale docs only.
- Are the unused Supabase tables (`projects`, `user_roles`, etc.) safe to remove from the schema/types, or are they planned?
- **Persistence:** when provisioning `conversions` + `sliceui-images`, should RLS policies be committed as migrations in-repo? (Recommended — see `development/database.md`.)
- Should the Dashboard/Slice **id-source** inconsistency (`profile.id` vs `user.id`) be standardized on one id?
