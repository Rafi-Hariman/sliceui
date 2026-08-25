# Production Runbook — SliceUI

## 1. Description
Operational procedures for running SliceUI in production: environment, prerequisites, release procedure, smoke checks, rollback, and operational notes.

## 2. Important
- **Inferred from codebase / repo state:** this app has **not shipped to production yet**. No live Supabase project is wired, no CI/CD exists, and the dev path relies on `VITE_BYPASS_AUTH`.
- The AI keys are client-side (`VITE_*`), which has real production implications — read `security-compliance.md` before going live.
- Until first release, treat this runbook as the target procedure.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Environment Overview](#7-environment-overview)
- [8. Prerequisites & Access](#8-prerequisites--access)
- [9. Release Procedure](#9-release-procedure)
- [10. Smoke Checks](#10-smoke-checks)
- [11. Rollback](#11-rollback)
- [12. Operational Notes](#12-operational-notes)
- [13. Success Metrics](#13-success-metrics)
- [14. Related Documents](#14-related-documents)
- [15. Open Questions](#15-open-questions)

## 4. Scope
Covers everything needed to take SliceUI from "works locally" to "running in production" and keep it running.

## 5. Goals
Provide a repeatable, checklist-driven path to a safe production launch and operations.

## 6. Non Goals
Does not cover CI pipeline mechanics (see `ci-cd.md`) or versioning policy (see `governance.md`).

## 7. Environment Overview
| Env | Purpose | Host | Supabase | Auth |
| :--- | :--- | :--- | :--- | :--- |
| Local | Dev | Vite `:8080` | Bypass (`VITE_BYPASS_AUTH=true`) or live | Mock or live |
| Preview (target) | Pre-prod | Vercel/Lovable preview | Staging project | Live |
| Production | Users | Lovable publish / Vercel | **Live project** | Live |

## 8. Prerequisites & Access
- **Supabase project** with:
  - Auth enabled (email/password).
  - `profiles` and `conversions` tables (see `development/database.md`).
  - `sliceui-images` storage bucket with public-read or signed URLs.
  - RLS policies scoping rows to `auth.uid()`.
- **AI keys:** Gemini + Groq (free tiers; monitor quotas).
- **Who can release:** currently anyone with repo access (no governance yet) — recommend restricting.

## 9. Release Procedure
1. **Pre-launch checklist (do once):**
   - [ ] Rotate all API keys; remove hardcoded keys from `CLAUDE.md`/repo; keep only in gitignored `.env`/`.env.local`.
   - [ ] Create live Supabase project; run migrations; regenerate `src/integrations/supabase/types.ts`.
   - [ ] Remove/bypass `VITE_BYPASS_AUTH` mock path for production (keep flag for local only).
   - [ ] Add RLS + storage policies.
   - [ ] Set production env vars on the host (all `VITE_*`).
   - [ ] Decide host: Lovable vs Vercel.
2. **Per release:**
   - [ ] `git log` review; bump version + changelog entry (`foundation/changelog.md`).
   - [ ] CI green (lint → test → build).
   - [ ] Deploy via the host (publish/commit trigger).
   - [ ] Run smoke checks (§10).
3. **Post-release:**
   - [ ] Tag git release.
   - [ ] Update `foundation/status.md` + changelog `[Unreleased]` → versioned section.

## 10. Smoke Checks
After deploy, verify in a fresh browser:
1. Load home → auth page; sign up a throwaway account; land on dashboard.
2. **Slice:** upload a test PNG → generate for Tailwind → code appears with syntax highlighting.
3. **Persistence:** confirm the conversion appears in Dashboard history.
4. **Fallback:** temporarily point `VITE_GEMINI_API_KEY` at a bad key → confirm Groq fallback or clean error (no white-screen).
5. **Theme:** dark/light toggle persists.
6. **Mobile:** narrow viewport — sidebar collapses, slice panels usable.
7. **Storage:** uploaded image URL resolves (public bucket or signed URL works).

## 11. Rollback
- **Static SPA:** re-deploy the previous build/tag (host rollback). No DB migrations on rollback unless schema changed.
- **Schema change during release:** if the release included a migration, rollback requires either a revert migration or a forward-fix. Prefer additive/backward-compatible migrations.
- **Data:** `conversions`/`profiles` are user data — never truncate on rollback.

## 12. Operational Notes
- **Rate limits:** Gemini free tier ~15 RPM. Sustained usage will hit 429s → Groq fallback absorbs some, but heavy traffic needs either a proxy + paid tier or a queue.
- **Client-side keys:** exposed to anyone. Restrict each provider key's allowed origins if the provider supports it; rotate regularly; expect abuse/cost risk (ADR-001).
- **Bypass flag:** ensure `VITE_BYPASS_AUTH` is **not** set in production.
- **No image normalization:** uploads are sent as-is (base64) to AI; large images consume memory client-side (10MB cap helps).

## 13. Success Metrics
- Production launch checklist fully green.
- Releases follow the procedure with smoke checks + rollback available.

## 14. Related Documents
- [CI/CD](ci-cd.md)
- [Security & Compliance](security-compliance.md)
- [Governance](governance.md)
- [Status](../foundation/status.md)

## 15. Open Questions
- Live Supabase project: who owns it, and is it already provisioned?
- Production host decision (Lovable vs Vercel) — blocking for the release procedure.
