# Phase P1 — Foundation & MVP

## Phase Goal
Stand up the app shell, design system, and the core slice pipeline so a user can upload an image and get generated code.

## Timeline
Start → End: **Complete via prior commits** (last activity 2026-05-11). Treat as the functional baseline.

## Feature Summary & Core Functions
- Vite + React 18 SPA scaffold (Lovable), react-router, Tailwind + shadcn/ui, next-themes.
- Slice pipeline: image upload (drag/picker/paste) → validation → Gemini → Groq fallback → syntax-highlighted output (Code | Preview tabs + download).
- 7 framework outputs in the picker (Tailwind, React TSX, Vue 3, Bootstrap 5, HTML+CSS, Next.js, Svelte 5).
- App chrome: `AppLayout` sidebar, theme toggle, protected routes, auth context (mock mode).

## Sub-Functions / Tasks
- [x] Vite + React SPA foundation
- [x] shadcn/ui design system + HSL tokens + dark/light
- [x] `useImageUpload` validation (PNG/JPG/WebP ≤10MB, paste support)
- [x] `aiService` Gemini → Groq fallback + `clean()` + `buildPrompt`
- [x] `CodeOutput` highlight + tabs + download
- [x] `AuthContext` + `ProtectedRoute` (bypass mock)
- [x] Supabase client scaffold + generated types (baseline)

## Sprint Tracker
| Sprint | Scope | Status |
| :--- | :--- | :--- |
| P1 (historical) | Foundation + MVP slice flow | ✅ Done |

## Acceptance Criteria
- [x] Upload → framework → generate returns highlighted code.
- [x] Gemini 429 transparently falls back to Groq.
- [x] Dark/light theme works.
- [x] App runs locally with `VITE_BYPASS_AUTH=true`.

## Dependencies & Blockers
- None blocking (this phase is complete).

## Status
**Complete** (baseline). Persistence/real auth intentionally deferred to P2.

## Deprecated Features
- None.
