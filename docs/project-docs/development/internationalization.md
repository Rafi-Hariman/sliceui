# Internationalization — SliceUI

## 1. Description
Language support and localization approach for SliceUI.

## 2. Important
- **Inferred from codebase:** no i18n library is present. All UI strings are hardcoded English literals (e.g., "Convert UI to Code", "Select Framework", "Add instructions...").
- HTML `lang="en"` (`index.html`); the app has no locale detection or translation layer.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Supported Languages](#7-supported-languages)
- [8. Translation Workflow](#8-translation-workflow)
- [9. Fallback Locales](#9-fallback-locales)
- [10. Date & Currency](#10-date--currency)
- [11. Success Metrics](#11-success-metrics)
- [12. Related Documents](#12-related-documents)
- [13. Open Questions](#13-open-questions)

## 4. Scope
Documents the current (English-only) state and the recommended path to internationalization if it becomes a requirement.

## 5. Goals
Be explicit that i18n is **not implemented**, so no one assumes otherwise; define a lightweight path if multi-language support is adopted.

## 6. Non Goals
Does not introduce a translation framework now (out of scope until product decision).

## 7. Supported Languages
- **Currently:** English only. UI strings are inline literals.
- **Planned:** none (TBD).

## 8. Translation Workflow
If i18n is adopted, the recommended approach for this codebase:
1. Extract hardcoded strings from `src/pages/*` and `src/components/*` into a messages/keys file.
2. Use a lightweight solution consistent with the Vite stack (e.g., `react-i18next` or `lingui`).
3. Keep generated-code prompts (`src/lib/prompts.ts`) **English** — the model output contract is framework code, not localized copy; do not translate prompt text.
4. Add `lang` switching in `index.html`/root and persist preference.

## 9. Fallback Locales
- Not applicable yet. When added, default fallback should be `en`.

## 10. Date & Currency
- No dates are rendered as localized strings today (Supabase returns ISO `created_at`; no date formatting in the visible UI).
- No currency handling exists.
- When history dates are shown, use the user's locale via `Intl.DateTimeFormat`.

## 11. Success Metrics
- If/when adopted: all user-facing strings extracted, `en` fallback guaranteed, no untranslated leakage.

## 12. Related Documents
- [PRD](../foundation/prd.md)
- [UI/UX](ui-ux.md)

## 13. Open Questions
- Is multi-language support a product goal? If yes, target languages?
