# CLAUDE.md — SliceUI

> **⚠️ This file is intentionally minimal.** The authoritative project docs live in `docs/project-docs/` — read those first. This file is a thin pointer to keep the prefix cache small (see `.claude/CLAUDE.md` rule 2.1).

## What this project is

SliceUI converts UI screenshots into clean, framework-specific frontend code.
The repo is a **Vite 5 + React 18 + TypeScript strict SPA** (Tailwind + shadcn/ui, react-router v6, Supabase client, Gemini primary + Groq fallback AI).

> **Stale note:** earlier versions of this file described a Next.js 14 App Router plan. That was never built — the app is a Vite SPA. See `docs/project-docs/`.

## Where to look

| Need | Doc |
|---|---|
| Business direction, corrected-C, brands | `docs/project-docs/foundation/product-spec.md` |
| Product requirements | `docs/project-docs/foundation/prd.md` |
| Architecture + ADRs (incl. ADR-001 client-side AI keys) | `docs/project-docs/foundation/architecture.md` |
| Current state, risks, roadmap | `docs/project-docs/foundation/status.md` |
| Phase registry + active phase files | `docs/project-docs/foundation/phases/index.md` |
| Execution workflow (how to work, STOP gates) | `EXECUTE-PHASES.md` (repo root) |

## Environment variables — READ FIRST

**Never put API keys in code, docs, commits, or output. Keys live only in gitignored `.env.local`.**
There is no tracked `.env` in this repo.

Required variables (see `.env.local.example` for the template):

```bash
# .env.local  (gitignored — never commit this)

# Gemini (primary) — FREE, get at aistudio.google.com
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Groq (fallback) — FREE, get at console.groq.com
VITE_GROQ_API_KEY=your_groq_api_key_here

# Supabase (auth/persistence — not provisioned until P3; URL + publishable key are public by design)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
```

> **Dev-only flag:** `VITE_BYPASS_AUTH` mocks auth in dev. Never set it in production.
> **Security note:** the AI keys are client-side by design (ADR-001) until the P4 backend proxy lands. Gemini/Groq keys must stay out of version control.

## Verification

```bash
npm run test        # Vitest — all passing (8 tests as of 2026-08-25)
npx tsc --noEmit    # Expected: 8 known errors in src/lib/conversionService.ts until P3 persistence types regen
npm run build       # Vite build — success
npm run dev         # Serves at localhost:8081
```

## Out of scope (decided — do not build)

Full abi self-check/asset-extraction loop, Flutter/mobile output, paid tier/billing, ads spend, umbrella branding. See `docs/project-docs/` for the authoritative list.
