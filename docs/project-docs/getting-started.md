# Getting Started — SliceUI

## 1. Description
How to set up and run the SliceUI application locally, verify it works, and troubleshoot common issues.

## 2. Important
- **This is a Vite + React 18 SPA**, not a Next.js app. The root `CLAUDE.md` is stale and describes an outdated architecture — trust `docs/project-docs/` over it.
- All backend integrations (auth, database, storage) go through **Supabase**. No API routes exist; the browser calls Supabase and the AI providers directly.
- AI API keys (`VITE_GEMINI_API_KEY`, `VITE_GROQ_API_KEY`) are **client-side and exposed in the browser** — see `operations/security-compliance.md` before shipping.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Prerequisites](#7-prerequisites)
- [8. First Steps](#8-first-steps)
- [9. Local Setup](#9-local-setup)
- [10. Verification](#10-verification)
- [11. Troubleshooting](#11-troubleshooting)
- [12. Success Metrics](#12-success-metrics)
- [13. Related Documents](#13-related-documents)
- [14. Open Questions](#14-open-questions)

## 4. Scope
Covers local development setup, environment configuration, and basic verification for contributors.

## 5. Goals
Get a new contributor from clone to a running app in under 10 minutes with correct environment variables.

## 6. Non Goals
Does not cover production deployment (see `operations/production-runbook.md`), CI/CD (see `operations/ci-cd.md`), or Supabase schema details (see `development/database.md`).

## 7. Prerequisites
- **Node.js** >= 18 (npm) or **Bun** (this repo ships both `package-lock.json` and `bun.lock`).
- A **Supabase project** — the app uses it for auth (email/password), Postgres (`profiles`, `conversions` tables), and storage (`sliceui-images` bucket). No live project is wired into the repo yet; see the bypass flag below.
- API keys for **Gemini** (https://aistudio.google.com) and **Groq** (https://console.groq.com) — both free tiers.

## 8. First Steps
1. Copy `.env.local.example` → `.env.local` and fill in values.
2. Install dependencies.
3. Start the dev server.
4. Verify the app loads and the Slice pipeline works.

## 9. Local Setup

### 9.1 Clone & install
```sh
git clone <repo-url> sliceui
cd sliceui
npm install        # or: bun install
```

### 9.2 Environment variables
```bash
# .env.local
VITE_SUPABASE_URL=<your supabase url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your publishable key>
VITE_GEMINI_API_KEY=<aistudio key>
VITE_GROQ_API_KEY=<groq key>
VITE_BYPASS_AUTH=false   # set "true" to skip Supabase auth for local dev
```

> **Bypass auth flag:** `src/contexts/AuthContext.tsx` reads `VITE_BYPASS_AUTH`. When `"true"`, the app injects a mock user + profile so the Slice/Dashboard routes work without a live Supabase project. Remove the flag and the mock block once a real project is wired up.

### 9.3 Run
```sh
npm run dev       # Vite dev server on http://localhost:8080
npm run build     # type-check + production build (uses `vite build`)
npm run test      # Vitest suite
npm run lint      # ESLint
```

## 10. Verification
- App loads at `http://localhost:8080` with no console errors.
- `npm run build` exits 0.
- `npm run test` passes (currently a single example test; see `development/testing.md`).
- Slice flow: upload a PNG/JPG/WebP (≤10MB) → pick a framework → **Generate** → code appears. ⚠ **Persistence is unprovisioned** — `useConvert` attempts `uploadSliceImage`/`createConversion`, but the `conversions` table + `sliceui-images` bucket don't exist yet, so save/history will fail until Phase P2 (see `development/database.md`).

## 11. Troubleshooting
| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| "GEMINI_API_KEY is not configured" | `VITE_GEMINI_API_KEY` missing/empty | Set it in `.env.local`, restart dev server. |
| "Daily limit reached. Please try again tomorrow." | Gemini returned 429 and no Groq key is set, or quota exhausted | Check Groq key; wait for reset. |
| All routes are public | Auth gating removed (local-first) | No action needed — every page is visitable without a session. |
| CORS / connection errors | Supabase URL or publishable key wrong | Verify keys in `.env.local`. |
| Persistence errors after generate | `conversions` table / `sliceui-images` bucket not provisioned | Provision them + regen types (Phase P2) — see `development/database.md`. |
| Image rejected | Wrong type or >10MB | Allowed: `image/png`, `image/jpeg`, `image/webp`, ≤10MB. |

## 12. Success Metrics
New contributor goes clone → running app with working conversion in under 10 minutes.

## 13. Related Documents
- [Architecture](foundation/architecture.md)
- [Security & Compliance](operations/security-compliance.md)
- [Database](development/database.md)

## 14. Open Questions
- In bypass-auth mode, `useConvert` still tries to persist to Supabase (upload + insert). Should persistence be skipped entirely when auth is bypassed? This currently risks console errors in local-only mode.
- When is the persistence layer (table + bucket + RLS + migrations) being provisioned? It's the top blocker for history/save features.
