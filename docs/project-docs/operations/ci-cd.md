# CI/CD — SliceUI

## 1. Description
Continuous integration and deployment strategy for SliceUI.

## 2. Important
- **Inferred from codebase / repo state:** there is **no CI/CD configuration** in the repo — no `.github/workflows/`, no `.gitlab-ci.yml`, no Vercel config. `package.json` defines `dev`, `build`, `lint`, `test`, `preview`.
- Deployment path today is **Lovable publish** (per README), which is out-of-band of this repo's automation.
- This doc defines the recommended pipeline; it is a target, not current reality.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Pipeline Architecture](#7-pipeline-architecture)
- [8. Build Steps](#8-build-steps)
- [9. Testing & Quality Gates](#9-testing--quality-gates)
- [10. Deployment Environments](#10-deployment-environments)
- [11. Secrets](#11-secrets)
- [12. Success Metrics](#12-success-metrics)
- [13. Related Documents](#13-related-documents)
- [14. Open Questions](#14-open-questions)

## 4. Scope
Covers the automated build, test, and deploy pipeline for the SPA (recommended target) and the current manual reality.

## 5. Goals
Get to a state where every PR is automatically linted, tested, and built, and merges to `main` deploy predictably.

## 6. Non Goals
Does not cover production operational runbooks (see `production-runbook.md`) or release/version policy (see `governance.md`).

## 7. Pipeline Architecture
**Current:** no pipeline — local `npm run` only + manual Lovable publish.
**Recommended:** GitHub Actions (repo is on GitHub) with one workflow:
```
[push PR]  →  lint → test → build (type-check)   → gate on PR
[push main] →  lint → test → build               → deploy (static host)
```

## 8. Build Steps
```sh
npm ci                # deterministic install (package-lock.json present)
npm run lint          # ESLint
npm run test          # Vitest
npm run build         # vite build (type-check + bundle → dist/)
```

## 9. Testing & Quality Gates
| Gate | Command | Enforced |
| :--- | :--- | :--- |
| Lint | `npm run lint` | Recommended (not yet in CI) |
| Unit tests | `npm run test` | Recommended (not yet in CI) |
| Build/type-check | `npm run build` | Recommended (not yet in CI) |
| E2E | Playwright (dep present) | Not configured |

**Merge policy:** require all three gates green on PRs to `main`.

## 10. Deployment Environments
| Env | Target | Trigger | Notes |
| :--- | :--- | :--- | :--- |
| Preview | Vercel preview / Lovable | PR | Not configured |
| Production | Lovable publish / Vercel | `main` / manual | README documents Lovable Share → Publish |

## 11. Secrets
| Variable | Class | Used by |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Build-time (browser-exposed) | Supabase client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Build-time (browser-exposed) | Supabase client |
| `VITE_GEMINI_API_KEY` | Build-time (browser-exposed) | AI service |
| `VITE_GROQ_API_KEY` | Build-time (browser-exposed) | AI service |
| `VITE_BYPASS_AUTH` | Build-time dev flag | AuthContext |

> ⚠️ **Critical:** these are `VITE_*` keys — Vite inlines them into the client bundle. They are **public by design** and must be treated as non-secret (rotation, restricted permissions). Any CI that sets them should use masked env vars, but they are not server-side secrets. See `security-compliance.md`.

## 12. Success Metrics
- CI runs `lint` → `test` → `build` on every PR and blocks merge on failure.
- Production deploys are repeatable and reversible.

## 13. Related Documents
- [Workflow](../foundation/workflow.md)
- [Testing](../development/testing.md)
- [Production Runbook](production-runbook.md)
- [Governance](governance.md)

## 14. Open Questions
- Which static host is canonical: **Lovable publish** (README) or **Vercel** (stale docs)? This determines the deploy step.
- Should CI be added via GitHub Actions, and are preview deployments wanted?
