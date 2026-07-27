# Testing - SliceUI

## 1. Description

Verification policy for SliceUI. A full **QA plan** exists (migrated to
[`docs/project-docs/reference/QA_TEST_DOCUMENT.md`](../reference/QA_TEST_DOCUMENT.md))
with 20 functional test cases, 8 Gherkin acceptance criteria, cross-browser and
security/performance checklists. This document is the SDD owner of that plan:
current implementation coverage is thin, and this file defines the target gates
and how the plan maps onto the real codebase.

## 2. Important

- **Current automated coverage is ~zero** beyond a placeholder test
  (`src/test/example.test.ts`). The QA plan below is the **target**, not what
  runs today.
- **No CI** yet; gates run only locally (see [operations/ci-cd.md](../operations/ci-cd.md)).
- **E2E framework decision (resolved):** standardize on **Playwright** (already
  installed). The QA plan's Cypress suite is superseded - do not adopt Cypress.
- **`data-testid` hooks do not exist yet.** The QA plan's selectors
  (`upload-zone`, `framework-{name}`, `generate-button`, `code-output`,
  `copy-button`, `preview-tab`, `preview-iframe`, `loading-state`,
  `error-message`, `warning-message`, `image-preview`) must be **added** to
  components before E2E can run.
- **Auth-gate decision (resolved):** login-required generation (QA TC-007 /
  AC-004) is the **target**. The current code has the guard disabled (guest
  mode) - treat those auth-gated test cases as blocked until Phase P1
  re-enables auth.

## 3. Table of Contents

- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [Verification Policy & Objectives](#verification-policy--objectives)
- [Verification Matrix & Coverage](#verification-matrix--coverage)
- [Test Layers & Environments](#test-layers--environments)
- [Commands & CI Gates](#commands--ci-gates)
- [Naming & File Conventions](#naming--file-conventions)
- [Manual Checks & Fallbacks](#manual-checks--fallbacks)
- [Success Metrics](#success-metrics)
- [Related Documents](#related-documents)
- [Open Questions](#open-questions)

## 4. Scope

Unit, component, E2E, cross-browser, security, and performance verification for
the SliceUI SPA. Source plan:
[`reference/QA_TEST_DOCUMENT.md`](../reference/QA_TEST_DOCUMENT.md).

## 5. Goals

- Turn the existing QA plan into executable, automated checks.
- Make `npm run build` (type-check) the first reliable safety net, then layer
  Vitest + Playwright on top.
- Cover the `/slice` happy path and the Gemini→Groq fallback end-to-end.

## 6. Non Goals

- Not testing third-party model output quality (non-deterministic).
- Not full visual regression (no tooling yet).
- Not load-testing a server (none exists; perf scenarios are aspirational -
  see [Manual Checks & Fallbacks](#manual-checks--fallbacks)).

## Verification Policy & Objectives

- **Type safety first:** `npm run build` runs `tsc` - keep it green; strongest
  current gate.
- **Lint next:** `npm run lint` (ESLint flat config).
- **Unit/component** for pure logic and presentational components (Vitest).
- **E2E** for the `/slice` happy path and fallback (Playwright).
- **Cross-browser / responsive / security** per the QA checklists (manual until
  automated).

## Verification Matrix & Coverage

Functional cases (full detail in
[`reference/QA_TEST_DOCUMENT.md`](../reference/QA_TEST_DOCUMENT.md) §1):

| ID | Case | Priority | Automation | Status |
| :--- | :--- | :--- | :--- | :--- |
| TC-001..003 | Upload via drag-drop / click / paste | P0 | High | ❌ none |
| TC-004/005 | Reject invalid type / >10 MB | P1 | High | ❌ none |
| TC-006 | Select framework | P0 | High | ❌ none |
| TC-007 | Generate **without login** (target: blocked) | P0 | High | ⛔ blocked on P1 auth |
| TC-008 | Generate happy path (logged in) | P0 | High | ❌ none |
| TC-009/010 | Copy / download code | P1 | Med | ❌ none |
| TC-011 | Preview tab renders | P1 | Med | ❌ none |
| TC-012 | Clear uploaded image | P1 | Med | ❌ none |
| TC-013 | All options enabled | P2 | Low | ❌ none |
| TC-014/015 | Empty image / no framework guard | P1 | High | ❌ none |
| TC-016 | Gemini 429 → Groq fallback | P1 | Med | ❌ none |
| TC-017 | Auth failure | P1 | Med | ❌ none |
| TC-018/019/020 | Timeout / corrupted / rapid uploads | P2 | Low-Med | ❌ none |

Acceptance criteria (Gherkin AC-001..008) are in the reference QA doc §2. Key
ones to wire into tests: AC-001 (upload→generate→copy), AC-002/003 (file
rejection), AC-005 (fallback), AC-006 (preview), AC-007 (copy feedback),
AC-008 (session expiry).

Unit/component coverage targets (not in QA doc, inferred from code):

| Area | Layer | Target |
| :--- | :--- | :--- |
| `lib/prompts.ts` `buildPrompt` | Unit | Snapshot per framework × options |
| `lib/frameworks.ts` `getFramework` | Unit | Lookup + default fallback |
| `lib/aiService.ts` `clean()` | Unit | Fence-stripping variants |
| `lib/conversionService.ts` | Integration (mocked Supabase) | CRUD + error paths |
| `hooks/useImageUpload` | Component (jsdom) | TC-001..005, paste |
| `hooks/useConvert` | Component (mocked services) | TC-008, TC-016 fallback, guest vs authed |
| `components/CodeOutput` | Component | Tabs, copy, `getPreviewDoc` per framework |

## Test Layers & Environments

- **Unit/Component:** Vitest + `@testing-library/react` + `jsdom`. Config:
  `vitest.config.ts`; setup `src/test/setup.ts`; globals enabled. Mock
  `import.meta.env.VITE_*`, the Supabase client, and `imageToCode`.
- **E2E (target = Playwright):** add `playwright.config.ts` + specs under
  `tests/e2e/` (or `e2e/`), pointed at `npm run preview`. Port the QA plan's
  happy-path and fallback scenarios from Cypress syntax to Playwright. Add
  `data-testid` attributes to components first.
- **Cross-browser/responsive:** Chrome, Firefox, Safari, Edge (latest 2);
  sizes 320 / 768 / 1024 / 1440 px (QA doc §3).
- **Envs:** tests must not hit real AI providers - stub Gemini/Groq responses
  (the QA doc's `cy.intercept` approach maps to Playwright `page.route`).

## Commands & CI Gates

| Command | What it does | Gate? |
| :--- | :--- | :--- |
| `npm run lint` | ESLint flat config | Local (should be CI) |
| `npm run test` | `vitest run` (one-shot) | Local (should be CI) |
| `npm run test:watch` | `vitest` watch mode | Dev only |
| `npm run build` | `tsc -b && vite build` | Local (should be CI) |
| `npm run preview` | serve `dist/` | Manual / Playwright target |
| (TBD) `npx playwright test` | E2E | Target, once configured |

> **CI gap:** none run automatically. See [operations/ci-cd.md](../operations/ci-cd.md).

## Naming & File Conventions

- Co-locate Vitest tests: `src/**/*.{test,spec}.{ts,tsx}` (matches `include`).
- Playwright specs: `tests/e2e/*.spec.ts` (TBD location).
- **`data-testid` convention (to adopt):** stable kebab-case ids matching the
  QA selectors - `upload-zone`, `framework-<id>`, `generate-button`,
  `code-output`, `copy-button`, `preview-tab`, `preview-iframe`,
  `loading-state`, `error-message`, `image-preview`.
- Use `describe`/`it` (Vitest globals enabled).

## Manual Checks & Fallbacks

Until E2E exists, verify by hand after pipeline/UI changes (mirrors QA ACs):

1. `npm run dev` → `/slice`.
2. Paste/upload a PNG → pick React TSX → Generate.
3. Confirm: first line `// Generated by SliceUI`, no fences, Copy works
   (checkmark 2 s), Preview renders, line-count footer shows.
4. (Authed) conversion appears in `/dashboard`.
5. Force fallback: break the Gemini key → confirm Groq path runs and a
   "backup service" notice appears (AC-005).

Security/perf checklists (QA doc §7, §8) are manual today; the performance
scenarios assume a server and are **aspirational** until `/api/convert` exists
(Phase P1). The security checklist (API-key exposure, iframe sandbox XSS,
token storage, IDOR) overlaps with `foundation/status.md` risks.

## Success Metrics

- Every QA TC-001..020 mapped to an automated or documented-manual check.
- `/slice` happy path + fallback covered by Playwright.
- `lint` + `test` + `build` run on every PR via CI.
- All `data-testid` hooks present; auth-gated cases unblocked after P1.

## Related Documents

- [reference/QA_TEST_DOCUMENT.md](../reference/QA_TEST_DOCUMENT.md) - full QA plan (source).
- [workflow.md](../foundation/workflow.md) - local loop + PR checks.
- [ci-cd.md](../operations/ci-cd.md) - where gates should run.
- [api-contract.md](./api-contract.md) - what to mock + planned `/api/convert`.

## Open Questions

- Add `data-testid` attributes now (enables future E2E) or as part of P2?
- Mock with `msw` (mapped from the QA doc's intercepts) for unit/component tests?
- Adopt a coverage threshold (e.g. `src/lib` ≥ 80%) once real tests exist?
- Where do performance scenarios belong once a server exists (P1)?
