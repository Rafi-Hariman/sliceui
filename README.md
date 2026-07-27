# SliceUI

SliceUI turns a UI screenshot into a self-contained frontend component, in the
framework your project already uses: React, Vue, Tailwind, Next.js, Bootstrap,
Svelte, or plain HTML. Paste the result into an existing codebase. It returns
one component, not a full app scaffold.

## Stack

- Vite 5, React 18, TypeScript (strict)
- Tailwind CSS, shadcn/ui (Radix primitives)
- Supabase (auth, Postgres, storage, edge functions)
- AI: Gemini (free tier) with a Groq fallback, Claude on the paid tier

## Local setup

Requirements: Node 20+ and npm.

```sh
npm install
npm run dev      # app on http://localhost:8080
```

Copy `.env.local.example` to `.env.local` and fill in:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (Supabase project)
- `VITE_GEMINI_API_KEY` (Gemini, for the client-side dev path)
- `VITE_GROQ_API_KEY` (Groq, optional fallback)
- `VITE_CONVERT_PROXY_URL` (the metered `/convert` edge function, for production mode)

## Scripts

```sh
npm run dev        # dev server
npm run build      # production build (runs tsc)
npm run test       # vitest
npm run lint       # eslint
```

## Backend (metered `/convert`)

The Supabase edge function in `supabase/functions/convert` hides the AI keys,
meters usage, and routes free tier to Gemini (with Groq fallback) and paid tier
to Claude. Schema, RLS, and the deploy runbook live under `supabase/migrations`
and `docs/project-docs/operations/deploy-metered-convert.md`.

## Project docs

Source of truth for design and scope is under `docs/project-docs/`, not the
top-level `CLAUDE.md` (which is a stale Next.js spec kept for history).

## Status

Functional end to end locally against a local Supabase stack. Public deploy,
Stripe billing, and the Chrome extension are not built yet.
