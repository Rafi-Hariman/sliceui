# Workflow — SliceUI

## 1. Description
The development workflow for SliceUI: local dev loop, branching strategy, PR & code review, and issue tracking conventions.

## 2. Important
- **Inferred from codebase / git history:** the repository currently has a single remote `main` plus one feature branch (`feat/sliceui-mvp-cleanup`). Workflow rules below are the recommended baseline; confirm before treating as mandated.
- EHA agent rules in `.claude/rules/eha-agent-rules.md` govern how agents should operate on this repo (ask before material changes, keep cache integrity, docs sync).

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Local Dev Loop](#7-local-dev-loop)
- [8. Branching Strategy](#8-branching-strategy)
- [9. PR & Code Review](#9-pr--code-review)
- [10. Issue Tracking](#10-issue-tracking)
- [11. Success Metrics](#11-success-metrics)
- [12. Related Documents](#12-related-documents)
- [13. Open Questions](#13-open-questions)

## 4. Scope
Covers how developers and AI agents make changes to the SliceUI repository: local commands, branch naming, and review flow.

## 5. Goals
Establish a repeatable, low-friction loop for contributing changes with verification at each step.

## 6. Non Goals
Does not cover release cadence or versioning (see `operations/governance.md`) or CI/CD pipeline details (see `operations/ci-cd.md`).

## 7. Local Dev Loop
1. **Branch off `main`:**
   ```sh
   git checkout main && git pull
   git checkout -b feat/<description>   # or fix/<description>, chore/<description>
   ```
2. **Code + verify locally:**
   ```sh
   npm run dev        # app on :8080, HMR
   npm run lint       # ESLint
   npm run test       # Vitest
   npm run build      # type-check via vite build (tsc + bundling)
   ```
3. **Manual check:** exercise the Slice flow (upload → framework → generate) and theme toggle.
4. **Commit** with a conventional message (see below).
5. **Push + open PR** against `main`.

### Commit message style
Follow Conventional Commits, matching existing history:
```
feat: add AI-powered image-to-code conversion service with Gemini and Groq integration
feat: enhance prompt for UI screenshot analysis and component generation rules
```
Prefixes in use: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.

## 8. Branching Strategy
- **`main`** — the trunk; deployable. All PRs target `main`.
- **Feature branches** — `feat/<description>` (existing example: `feat/sliceui-mvp-cleanup`).
- **Fix branches** — `fix/<description>`.
- No long-lived release branches yet; single remote (`origin`).

## 9. PR & Code Review
- Open a PR from `feat/*` → `main`.
- Ensure CI checks pass before merge (Vitest + ESLint + build — see `operations/ci-cd.md`).
- Review focus: type safety, AI fallback correctness, error handling (user-safe messages), and keeping Supabase typed access consistent.
- **Docs sync rule (EHA):** if the PR changes architecture, API contracts, database schema, or design tokens, update the owning doc in `docs/project-docs/` in the same PR.

## 10. Issue Tracking
- No issue tracker or board configured in the repo (no `.github/ISSUE_TEMPLATE/`, no TODO.md/ROADMAP.md).
- Track product decisions in `foundation/prd.md` Open Questions and execution in `foundation/status.md`.
- Suggested (optional): link commits to issues with `fixes #123` / `closes #123` once a tracker is adopted.

## 11. Success Metrics
- Every change lands on `main` with lint + tests + build green.
- No unverified type changes merge (TS strict).
- Docs stay in sync with code on any cross-cutting change.

## 12. Related Documents
- [Status](status.md)
- [Testing](../development/testing.md)
- [CI/CD](../operations/ci-cd.md)
- [Governance](../operations/governance.md)

## 13. Open Questions
- Should a formal branch protection / review-approval policy be added to `main`? Currently none is configured.
- Is a project board or issue tracker planned? None exists today.
