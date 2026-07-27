# CI/CD - SliceUI

## 1. Description

Build, test, and deployment picture for SliceUI. **Current state: no CI/CD
pipeline exists.** Build/test commands are defined but run only locally. Deploy
is assumed via Lovable Publish or a manual static host. This document records
the gap and the target.

## 2. Important

- There is **no `.github/workflows/`** and no other CI config in the repo.
  Nothing runs automatically on push or PR.
- **Live secrets are committed in `CLAUDE.md`** (Gemini/Groq/Supabase keys).
  Rotate them immediately and ensure no pipeline ever echoes them.
- All real secrets are `VITE_*` client env vars - anything in a build is
  embedded in the static bundle and therefore public.

## 3. Table of Contents

- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [Pipeline Architecture](#pipeline-architecture)
- [Build Steps](#build-steps)
- [Testing & Quality Gates](#testing--quality-gates)
- [Deployment Environments](#deployment-environments)
- [Secrets](#secrets)
- [Success Metrics](#success-metrics)
- [Related Documents](#related-documents)
- [Open Questions](#open-questions)

## 4. Scope

How SliceUI is built, gated, and deployed, plus the secrets involved. Covers
the gap between current (manual) and target (automated) pipelines.

## 5. Goals

- Define the canonical build + quality-gate sequence.
- Establish a minimal CI that prevents regressions on `main`.
- Make secret handling safe and explicit.

## 6. Non Goals

- Not choosing a host definitively (Lovable vs Vercel/Netlify TBD).
- Not implementing the server-side proxy yet (see `api-contract.md`).

## Pipeline Architecture

- **Current (manual):** developer runs `npm run lint`, `npm run test`,
  `npm run build` locally, then commits to `main`. No automation.
- **Target (proposed):** GitHub Actions on PR → install → lint → test → build;
  block merge on failure; auto-deploy `main` to the chosen host.

## Build Steps

1. `npm ci` (or chosen lockfile install).
2. `npm run lint` - ESLint flat config (`eslint.config.js`).
3. `npm run test` - Vitest (`vitest run`, jsdom).
4. `npm run build` - TypeScript build + Vite production bundle to `dist/`.
   - Dev variant: `npm run build:dev` (`vite build --mode development`).
5. `npm run preview` - serve `dist/` for smoke checks.

## Testing & Quality Gates

- Gates to enforce in CI: **lint**, **test**, **build** (type-check).
- Coverage tooling: not configured (`vitest --coverage` TBD).
- E2E: Playwright dependency present but unconfigured - not a gate yet.
- See `development/testing.md` for the verification matrix.

## Deployment Environments

- **Production (assumed):** Lovable Publish (per `README.md`) or a static host
  (Vercel/Netlify/Cloudflare Pages) serving the Vite SPA.
- **Preview/PR environments:** none today. Target: per-PR preview deploy.
- **Supabase:** single project supplies auth + DB + storage for all
  environments (no separate staging project confirmed - TBD).

## Secrets

| Variable | Purpose | Exposure |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase project URL | Public (in bundle) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key | Public (designed to be) |
| `VITE_GEMINI_API_KEY` | Gemini API key | **Public (in bundle)** - rotate, ideally move server-side |
| `VITE_GROQ_API_KEY` | Groq API key | **Public (in bundle)** - same caveat |

Rules:

- Never commit `.env*` with real values (`.gitignore` covers `*.local`).
- **Action required:** remove live keys from `CLAUDE.md` and rotate all four.
- Provide secrets via the host's env/secret store, not the repo.
- Long-term: proxy AI calls through an edge function so keys never reach the
  client (see `foundation/architecture.md` ADR-2 follow-up).

## Success Metrics

- CI runs on every PR and blocks merges on red lint/test/build.
- Zero secrets in the repository (after rotation + CLAUDE.md cleanup).
- `main` is always deployable; deploys are reproducible.

## Related Documents

- [workflow.md](../foundation/workflow.md) - local loop + PR checks.
- [testing.md](../development/testing.md) - verification policy.
- [api-contract.md](../development/api-contract.md) - keys + rate limits.
- [status.md](../foundation/status.md) - CI gap listed as a risk.

## Open Questions

- Host: keep Lovable Publish, or move to Vercel/Netlify with CI?
- Stand up GitHub Actions now (lint+test+build) as the first real gate?
- Migrate AI keys to an edge function in this phase or later?
