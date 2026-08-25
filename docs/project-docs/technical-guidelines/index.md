# Technical Guidelines Index — SliceUI

## 1. Description
Registry of active cross-cutting technical guidelines for SliceUI. Each entry documents durable, codebase-level rules agents and developers must follow.

## 2. Important
- A guideline is "active" only when it has a row in the Active Guidelines Registry below (per the EHA Guidelines Registry).
- Guidelines are **derived from the codebase** — never placeholders.
- When code and a guideline conflict, surface the conflict rather than silently choosing (EHA rule 5.3).

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Active Guidelines Registry](#7-active-guidelines-registry)
- [8. Registry Rules & Ownership](#8-registry-rules--ownership)
- [9. Guideline Stable Headings](#9-guideline-stable-headings)
- [10. Success Metrics](#10-success-metrics)
- [11. Related Documents](#11-related-documents)
- [12. Open Questions](#12-open-questions)

## 4. Scope
Covers the active guideline categories for SliceUI and the rules for maintaining them.

## 5. Goals
Keep cross-cutting conventions (AI fallback, data access, error handling, UI tokens) consistent across the codebase.

## 6. Non Goals
Does not restate the content of the guidelines — only registers them.

## 7. Active Guidelines Registry
| Guideline | Domain | Purpose | Owner | Review Trigger |
| :--- | :--- | :--- | :--- | :--- |
| [ai-service.md](ai-service.md) | AI | Gemini/Groq fallback chain, prompt building, client-side key handling | TBD | AI provider/model or fallback changes |
| [data-access.md](data-access.md) | Data access | Supabase typed access, storage patterns, error propagation; persistence unprovisioned (P2) | TBD | Supabase schema/service changes |
| [error-handling.md](error-handling.md) | Error handling | User-safe error taxonomy, loading messages, fallback rules | TBD | Error model or conversion-flow changes |
| [ui-ux.md](ui-ux.md) | UI/UX | shadcn/ui usage, HSL design tokens, dark-mode conventions | TBD | Design system or component changes |

## 8. Registry Rules & Ownership
- Keep this index aligned with the actual files under `technical-guidelines/`.
- Update a row when a guideline changes owner, scope, or review trigger.
- Cross-reference owning project docs (e.g., `foundation/architecture.md`, `development/ui-ux.md`).

## 9. Guideline Stable Headings
Every guideline file follows: `1. Summary`, `2. Scope`, `3. Rules`, `4. Preferred Patterns`, `5. Anti-Patterns`, `6. Related Docs`, `7. Open Questions`.

## 10. Success Metrics
Agents and developers can reference and validate cross-cutting standards during changes without re-deriving them from code.

## 11. Related Documents
- [Master Project Registry](../index.md)

## 12. Open Questions
- None.
