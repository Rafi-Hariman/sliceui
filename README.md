# SliceUI

Convert UI screenshots into clean, framework-specific frontend components — paste-ready code for 7 frameworks.

> **Live:** https://sliceui-rafi-harimans-projects.vercel.app

## What it does

Upload a screenshot of a UI → pick a framework → get a self-contained component you can paste straight into your project. Built for frontend engineers and slicing freelancers who need a jump-start on a new feature.

**7 frameworks:** Tailwind CSS, React TSX, Vue 3 SFC, Bootstrap 5, plain HTML+CSS, Next.js, Svelte 5.

## Tech stack

- **Vite 5 + React 18 + TypeScript** SPA
- **Tailwind CSS + shadcn/ui** (Radix primitives, HSL design tokens)
- **react-router v6**, TanStack Query
- **AI:** Gemini (primary) with Groq fallback
- **Supabase** for auth + persistence (provisioning deferred — see status)
- **Vercel** static deploy + serverless AI proxy

## Quick start

```bash
npm install
cp .env.local.example .env.local   # add your Gemini key
npm run dev                        # localhost:8080
```

> **Dev-only auth bypass:** `VITE_BYPASS_AUTH=true` mocks auth locally. Gated to `import.meta.env.DEV` — cannot activate in production.

## Scripts

```bash
npm run dev     # dev server
npm run test    # Vitest
npm run lint    # ESLint
npm run build   # Vite production build
```

## Architecture

- **Client SPA** orchestrates upload → AI → output. AI keys are client-side in dev (ADR-001), but production routes through a **Vercel serverless proxy** (`api/convert.ts`) so keys stay server-side.
- **Supabase** auth/persistence is the target backend (ADR-003); provisioning is a tracked phase — see `docs/project-docs/`.

## Where things live

- Product/business docs: `docs/project-docs/` (product-spec, prd, architecture, phases)
- Execution workflow: `EXECUTE-PHASES.md`
- Demo portfolio pages: `demos/` (bakery, clinic, wedding vendor — for the Webmu service)

## License

Private. Not open-source.
