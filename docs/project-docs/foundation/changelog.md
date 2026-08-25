# Changelog — SliceUI

## 1. Description
Historical release and change tracking for SliceUI, following the Keep a Changelog format.

## 2. Important
- **No tagged releases exist yet.** All changes to date are tracked under `[Unreleased]`.
- Entries are derived from git history (`git log`) and codebase inspection; dates reflect last-known commit activity.
- **Persistence is unprovisioned (confirmed 2026-08-24):** the `conversions` table and `sliceui-images` bucket do not exist in generated types or committed migrations — the persistence layer is intent only.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Unreleased](#7-unreleased)
- [8. Success Metrics](#8-success-metrics)
- [9. Related Documents](#9-related-documents)
- [10. Open Questions](#10-open-questions)

## 4. Scope
Tracks user- and developer-visible changes to the SliceUI app over time.

## 5. Goals
Maintain a readable history of Added/Changed/Deprecated/Removed/Fixed/Security entries so releases are auditable.

## 6. Non Goals
Does not document internal code details not visible at the feature level (see commit history for that).

## 7. Unreleased

### Added
- Vite + React 18 SPA scaffold (Lovable) with react-router, shadcn/ui, Tailwind, next-themes.
- AI-powered image-to-code conversion with Gemini (primary) and Groq (fallback) — `c52383a`.
- Prompt builder for UI screenshot analysis and framework-specific generation rules — `d4246cc`.
- Image upload (drag-drop, file picker, clipboard paste) with validation (PNG/JPG/WebP ≤10MB).
- 7 framework outputs in the picker (Tailwind, React TSX, Vue 3, Bootstrap 5, HTML+CSS, Next.js, Svelte 5).
- Dark/light theme toggle with localStorage persistence.
- Syntax-highlighted code output (`CodeOutput`).
- **Instruction prompt + design-system input** wired through the pipeline (2026-08-25).
- **3 Webmu demo pages** (bakery, clinic, wedding vendor) + one-pager sales site (`/webmu/`, `/demos/*`) — 2026-08-25.
- **Backend AI proxy** (`api/convert.ts`): production routes AI calls through a Vercel serverless function so keys stay server-side — 2026-08-25.
- **CI workflow** (`.github/workflows/ci.yml`): lint + test + build on push/PR to main — 2026-08-25.
- **Pull-measurement tracking** (`operations/pull-measurement.md`) for the Week-12 gate.
- **Migrations in-repo** (`supabase/migrations/`): `conversions` table + RLS and `sliceui-images` bucket + RLS.

### Changed
- Conversion pipeline evolved from a (documented) Next.js API-route design to a fully client-side SPA flow.
- **Auth:** `VITE_BYPASS_AUTH` mock mode gated to `import.meta.env.DEV` (2026-08-25) — cannot leak into production.
- **Dashboard id-source:** standardized to `user.id` (was `profile.id`, which never matched the writer) — 2026-08-25.
- **`/slice?conversion=<id>`** now loads a saved conversion from history (was a dead link) — 2026-08-25.
- **App metadata:** `<title>` + OG/twitter → SliceUI (was "Triage") — 2026-08-25.

### Deprecated
- **Client-side AI keys** (`VITE_GEMINI_API_KEY`/`VITE_GROQ_API_KEY` in the browser) — superseded by the backend proxy in production (ADR-001).

### Removed
- **Flutter** output (project is web-only) — 2026-08-25.

### Fixed
- Groq timeout/abort (was unbounded); mimeType no longer hardcoded to PNG — 2026-08-25.

### Known gap (not yet fixed)
- `conversions` table and `sliceui-images` bucket are **not provisioned** — persistence, Dashboard history, and delete are blocked. Migrations are ready in-repo; needs a live Supabase project (all configured refs are NXDOMAIN).

### Security
- **Keys scrubbed from tracked files** (2026-08-25): root `CLAUDE.md` rewritten, `.env` untracked/deleted, keys moved to gitignored `.env.local`. Old keys remain in git history → rotation done for Gemini; repo is private.
- **AI keys no longer ship to the browser in production** (backend proxy, ADR-001 resolution).

## 8. Success Metrics
Every user-visible change lands in this file, and each release is tagged.

## 9. Related Documents
- [Status](status.md)
- [Governance](../operations/governance.md)

## 10. Open Questions
- When is the first tagged release? Until then everything lives under `[Unreleased]`.
