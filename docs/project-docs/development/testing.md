# Testing — SliceUI

## 1. Description
Testing and verification policy for SliceUI: objectives, coverage, test layers, commands & CI gates, naming conventions, and manual checks.

## 2. Important
- **Inferred from codebase:** current coverage is minimal — one example test (`src/test/example.test.ts`) and Vitest config. There is **no CI pipeline** enforcing tests yet (see `operations/ci-cd.md`).
- Playwright is a dependency but no E2E specs are present.
- `npm run build` runs `vite build` which type-checks via the TypeScript toolchain (no separate `tsc` script exists in `package.json`).

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Verification Policy & Objectives](#7-verification-policy--objectives)
- [8. Verification Matrix & Coverage](#8-verification-matrix--coverage)
- [9. Test Layers & Environments](#9-test-layers--environments)
- [10. Commands & CI Gates](#10-commands--ci-gates)
- [11. Naming & File Conventions](#11-naming--file-conventions)
- [12. Manual Checks & Fallbacks](#12-manual-checks--fallbacks)
- [13. Success Metrics](#13-success-metrics)
- [14. Related Documents](#14-related-documents)
- [15. Open Questions](#15-open-questions)

## 4. Scope
Covers unit/component testing via Vitest + Testing Library, plus manual verification for the Slice pipeline. E2E (Playwright) is noted but not yet active.

## 5. Goals
Make sure changes don't regress the core conversion pipeline, auth gating, or design-system usage — with the smallest test surface that gives confidence today.

## 6. Non Goals
Does not cover load/performance testing, visual regression suites, or exhaustive E2E coverage in the near term.

## 7. Verification Policy & Objectives
- **Verify the core logic** that can be tested without a browser: `buildPrompt` output for each framework/option combination; `clean()` markdown stripping; validation rules in `useImageUpload`.
- **Verify user-safe error mapping** in `useConvert` (quota → "Daily limit", key → "configuration", else generic).
- **Verify logged-out slice flow** works: no session → generation still succeeds (persistence skipped); a session → conversion is saved.
- **Guard against regressions** in design tokens / theme switching.
- Current policy is **manual-first** until the automated suite covers the above.

## 8. Verification Matrix & Coverage

### Automated (Vitest) — planned/desired
| Area | Target | File convention |
| :--- | :--- | :--- |
| Prompt builder | Output contains framework rules + option lines | `src/lib/__tests__/prompts.test.ts` |
| AI response cleaning | Markdown fences stripped | `src/lib/__tests__/aiService.test.ts` |
| Image validation | Rejects bad type/size, accepts valid | `src/hooks/__tests__/useImageUpload.test.ts` |
| Error mapping | Quota/key/generic → user message | `src/hooks/__tests__/useConvert.test.ts` |
| Logged-out generation | AI call succeeds without user; persistence skipped | `src/hooks/__tests__/useConvert.test.ts` |

### Manual (always) — see §12

### Current actual state
| Check | Status |
| :--- | :--- |
| `src/test/example.test.ts` | ✅ passes (placeholder) |
| Real feature tests | ❌ none |
| E2E (Playwright) | ❌ no specs |
| CI enforcement | ❌ none |

## 9. Test Layers & Environments
| Layer | Tool | Environment |
| :--- | :--- | :--- |
| Unit / component | Vitest + Testing Library + jest-dom | `jsdom` (see `vitest.config.ts`) |
| E2E | Playwright (dependency present) | Not configured yet |
| Type-check | `vite build` (bundler) | CI/build |
| Lint | ESLint | CI/build |

## 10. Commands & CI Gates
```sh
npm run test        # Vitest run (jsdom, setup ./src/test/setup.ts)
npm run test:watch  # watch mode
npm run lint        # ESLint (typescript-eslint, react-hooks, react-refresh)
npm run build       # vite build — type-checks + bundles
```
**Quality gates (recommended, enforce in CI):** `lint` → `test` → `build` must all pass before merge. None of these are wired to CI yet — see `operations/ci-cd.md`.

## 11. Naming & File Conventions
- Test files: `src/**/*.{test,spec}.{ts,tsx}` (per `vitest.config.ts` include).
- Co-locate beside source: `src/lib/prompts.test.ts` or a `__tests__/` sibling.
- Component tests: `*.test.tsx` using Testing Library.
- Use `describe`/`it`/`expect` globals (Vitest `globals: true`).

## 12. Manual Checks & Fallbacks
Before merge, run the app and verify:
1. **Slice flow:** upload PNG + JPG + WebP; too-large (>10MB) shows validation error; non-image rejected.
2. **Framework generation:** generate for ≥2 frameworks; output renders highlighted; copy works.
3. **Fallback:** temporarily set an invalid Gemini key → confirm Groq fallback kicks in (or a clean error, not a crash).
4. **Auth/open access:** all routes render logged-out (no redirects); generate works without a session; with a session, conversions persist to history.
5. **Theme:** toggle dark/light; no layout breakage; preference persists on reload.
6. **Responsive:** narrow viewport collapses sidebar (mobile-first).

## 13. Success Metrics
- Core pipeline (prompt build, clean, validation, error mapping) has automated tests.
- `lint` + `test` + `build` green locally and in CI.
- Manual checklist above is executed for any PR touching the Slice flow.

## 14. Related Documents
- [Workflow](../foundation/workflow.md)
- [CI/CD](../operations/ci-cd.md)
- [Technical Guidelines — Testing](../technical-guidelines/index.md)

## 15. Open Questions
- Is E2E (Playwright) in scope soon? Dependency is present but unused.
- Should `npm run build` be split to add an explicit `tsc --noEmit` step for stricter CI gating?
