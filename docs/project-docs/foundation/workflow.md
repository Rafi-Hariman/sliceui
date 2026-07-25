# Workflow — SliceUI

## 1. Description

How contributors run, change, branch, and review SliceUI locally. The repo
originated on **Lovable**, so two valid edit paths exist: in-browser Lovable
prompting, and local IDE + git.

## 2. Important

- The Lovable project URL in `README.md` is still a placeholder
  (`REPLACE_WITH_PROJECT_ID`). Confirm whether Lovable is still the canonical
  editor before relying on it.
- `bun.lock`, `bun.lockb`, and `package-lock.json` all exist. Pick **one**
  package manager and delete the stale lockfiles to avoid drift (Inferred from
  codebase — current de facto choice appears to be npm).

## 3. Table of Contents

- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [Local Dev Loop](#local-dev-loop)
- [Branching Strategy](#branching-strategy)
- [PR & Code Review](#pr--code-review)
- [Issue Tracking](#issue-tracking)
- [Success Metrics](#success-metrics)
- [Related Documents](#related-documents)
- [Open Questions](#open-questions)

## 4. Scope

Covers the day-to-day development loop: install, run, test, lint, branch, PR.
Excludes release/deploy mechanics (see `operations/ci-cd.md`).

## 5. Goals

- Make a clean local run reproducible in <5 minutes.
- Enforce type-safety + lint + tests before merge.
- Keep the SDD loop honest: spec/doc first, then tests, then code.

## 6. Non Goals

- Not defining CI pipeline steps (see `operations/ci-cd.md`).
- Not formalizing release/versioning policy yet (no tags/releases exist).

## Local Dev Loop

```sh
npm install            # install deps
cp .env.local.example .env.local   # then fill VITE_* values
npm run dev            # Vite dev server on :8080 (HMR overlay off)
```

Quality gates (run before committing):

```sh
npm run lint           # ESLint (eslint.config.js, flat config)
npm run test           # Vitest (jsdom, src/**/*.{test,spec})
npm run build          # tsc + vite build (type-check + bundle)
```

Other scripts: `npm run build:dev`, `npm run preview`, `npm run test:watch`.

> Dev-only plugin: `lovable-tagger` (`componentTagger`) is enabled in
> `vite.config.ts` during development — it injects Lovable component tagging.
> Harmless for local dev; ensure it is excluded from production builds (it is
> gated on `mode === "development"`).

## Branching Strategy

- Current state: a single `main` branch; no `feature/`, `sprint/`, or
  `release/` branches in use (Inferred from `git branch -a`).
- **Recommended minimal strategy:** branch off `main` as
  `feat/<short>`, `fix/<short>`, or `docs/<short>`; keep branches short-lived;
  rebase before merge; squash-merge into `main`.
- Keep `main` always deployable.

## PR & Code Review

- Open a PR against `main` with: what changed, why, how to verify, and any
  screenshot/recording for UI changes.
- Required reviewer checks:
  - `npm run lint`, `npm run test`, `npm run build` pass locally.
  - No secrets/keys committed (watch `.env*` — they are gitignored via
    `*.local`, but `CLAUDE.md` currently contains live keys; do not add more).
  - Generated Supabase types regenerated if schema changed (see
    `development/database.md`).
- Follow the SDD rule: link the PR to the doc/spec it implements; update docs
  in the same PR when behavior changes.

## Issue Tracking

- No issue tracker is currently referenced in commits or config (no
  `.github/ISSUE_TEMPLATE/`, no `#NNN` references in git log).
- Planning artifacts in-repo today: `QA_TEST_DOCUMENT.md`, `prompt.md`,
  `CLAUDE.md` (legacy scope). TBD: adopt GitHub Issues or another tracker.

## Success Metrics

- Mean time from clone to running dev server.
- PRs merged with all local gates green.
- Zero secrets introduced in diffs.

## Related Documents

- [getting-started.md](../getting-started.md) — environment setup.
- [testing.md](../development/testing.md) — verification commands and policy.
- [ci-cd.md](../operations/ci-cd.md) — build/deploy pipeline (to be added).
- [status.md](./status.md) — current branch/commit state.

## Open Questions

- Which package manager is canonical (npm vs Bun)? Remove the other lockfiles.
- Should we adopt GitHub Issues + PR templates + branch protections on `main`?
- Is Lovable still an active edit path, or is local IDE the only workflow now?
