# Getting Started

## Prerequisites

- **Node.js 18+** and npm (the repo also ships `bun.lock`/`bun.lockb`, so Bun works too).
- A Supabase project (URL + anon/publishable key) - used for auth, the
  `conversions` table, and the `sliceui-images` storage bucket.
- A **Gemini API key** (free tier, https://aistudio.google.com/app/apikey).
- A **Groq API key** (free fallback, https://console.groq.com/keys).

> ⚠️ **Security:** this app calls the AI providers **from the browser**, so the
> Gemini/Groq keys are exposed to end users via the bundle. Use restricted/free
> keys and see `operations/ci-cd.md` → Secrets and `foundation/status.md` risks.

## First Steps

1. Install dependencies:
   ```sh
   npm install
   ```
2. Copy the env template and fill in values:
   ```sh
   cp .env.local.example .env.local
   ```
3. Configure `.env.local` (values are `VITE_`-prefixed because they are read client-side):
   ```env
   VITE_SUPABASE_URL=<your-supabase-url>
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
   VITE_GEMINI_API_KEY=<your-gemini-key>
   VITE_GROQ_API_KEY=<your-groq-key>
   ```
4. Start the dev server:
   ```sh
   npm run dev
   ```
   The app runs on **http://localhost:8080** (Vite config, `vite.config.ts`).

## Local Setup

- Core converter page: **`/slice`** - upload a screenshot, pick a target
  framework, toggle options (responsive / semantic HTML / dark mode / a11y),
  then Generate.
- Auth page: **`/auth`** (Supabase email/password). The login guard is currently
  **disabled for local dev**, so guests can generate code without signing in;
  conversion history is persisted to Supabase **only** when a user is logged in.
- Supabase schema is partially configured; see `development/database.md` for the
  known drift between generated types and actual table usage.

## Verification

- Lint: `npm run lint`
- Type-check / build: `npm run build`
- Unit tests: `npm run test`
- Smoke check: open `/slice`, upload a PNG, generate React-TSX code, confirm the
  Code tab renders highlighted output and the Copy button works.

## Troubleshooting

| Symptom | Likely cause / fix |
| :--- | :--- |
| `GEMINI_API_KEY is not configured` | `VITE_GEMINI_API_KEY` missing in `.env.local`; restart the dev server after editing env. |
| "Daily limit reached" message | Gemini returned a quota/429 error and Groq also failed or is unconfigured. Wait or add a Groq key. |
| Conversion not saved to history | You are not logged in (guest mode skips Supabase persistence), or RLS/storage policies are missing. See `development/database.md`. |
| Supabase type errors around `conversions` | The generated `types.ts` is stale (describes a different schema). Regenerate via `supabase gen types` or see `development/database.md`. |
| Port conflict | Vite is pinned to `8080`; free the port or edit `vite.config.ts`. |
