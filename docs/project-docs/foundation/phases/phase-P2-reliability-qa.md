# Phase P2 - Reliability & QA (tests + CI)

## Phase Goal

Replace the placeholder-only test suite and missing CI with real coverage and
automated gates, so regressions in the conversion pipeline and UI are caught
before merge.

## Timeline (Start → End)

- **Start:** TBD (after P1.1 stabilizes the AI contract)
- **End:** TBD

## Feature Summary & Core Functions

- Unit tests for `src/lib/*` (prompts, frameworks, `aiService.clean`,
  `conversionService` with mocked Supabase).
- Component tests for hooks/components (`useImageUpload`, `useConvert`,
  `CodeOutput`).
- E2E for the `/slice` happy path.
- A CI pipeline running lint + test + build on every PR.

## Sub-Functions / Tasks

- [ ] Add `lib/prompts.test.ts` (snapshot per framework × options).
- [ ] Add `lib/aiService` tests for `clean()` fence stripping.
- [ ] Add `lib/conversionService` tests (mock Supabase; cover error paths).
- [ ] Add `useImageUpload` tests (type/size validation, paste).
- [ ] Add `useConvert` tests (generate, Gemini→Groq fallback, guest vs authed).
- [ ] Add `CodeOutput` tests (tabs, copy, `getPreviewDoc` per framework).
- [ ] Configure Playwright (`playwright.config.ts` + `/slice` spec) **or**
      remove the unused `@playwright/test` dependency.
- [ ] Add GitHub Actions workflow: install → lint → test → build.
- [ ] Optional: `vitest --coverage` with a `src/lib` threshold.

## Sprint Tracker

| Sprint | Scope | Status |
| :--- | :--- | :--- |
| P2.1 | lib + hook/component unit tests | Not Started |
| P2.2 | E2E + CI workflow | Not Started |

## Acceptance Criteria

- AC: every `src/lib/*` module has at least one meaningful test.
- AC: CI runs lint + test + build and blocks merge on failure.
- AC: `/slice` happy path passes E2E (upload → generate → copy).
- AC: Playwright is either configured or removed (no dead dependency).

## Dependencies & Blockers

- **Depends on:** P1.1 (proxy) for a stable AI target, **or** consistent
  mocking of `imageToCode` in component tests.
- **Blocks:** confident refactors in P3/P4.

## Status

**Not Started.**

## Deprecated Features

- None (the trivial `example.test.ts` becomes real tests or is deleted).
