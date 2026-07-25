# Guidelines Registry — SliceUI

## 1. Description

Authoritative catalog of SliceUI's durable, cross-cutting technical
guidelines — the codebase-level rules developers and AI agents must follow
during implementation. Each entry below links to a guideline file with real,
inferred-from-code rules (never placeholders).

## 2. Important

- A guideline is active only if it has a row in the **Active Guidelines
  Registry** below **and** a matching file under `technical-guidelines/`.
- When a guideline's owner, scope, or review trigger changes, update its row.
- Cross-reference owning project docs (`architecture.md`, `api-contract.md`,
  `database.md`) where a guideline depends on them.

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

Active guideline categories, ownership tracking, review triggers, and the
standard heading schema for technical guidelines in this repo.

## 5. Goals

Standardize the recurring coding conventions (AI provider handling, data
access/errors, naming/layout) so changes stay consistent and reviewable.

## 6. Non Goals

Not general project setup, business logic, or operations (see the master
`index.md` and project docs).

## 7. Active Guidelines Registry

| Guideline | Domain | Purpose | Owner | Review Trigger |
| :--- | :--- | :--- | :--- | :--- |
| [ai-providers.md](./ai-providers.md) | AI providers | Gemini→Groq fallback contract, `clean()` rules, prompt-building conventions, model pinning | TBD | AI call, model, or prompt changes |
| [data-access.md](./data-access.md) | Data access / errors | `*Service.ts` Supabase wrapper pattern, error envelope, user-facing error mapping | TBD | Supabase schema, service, or error-handling changes |
| [code-style.md](./code-style.md) | Code style | Naming, file layout, `@` alias, conventions beyond ESLint defaults | TBD | Tooling or structural conventions change |

> Inactive/removed domains (not generated): api, database (covered by
> `data-access.md`), logging, error-handling (covered by `data-access.md`),
> json, design-patterns, internationalization, testing (see
> `development/testing.md`), ui-ux (see `development/ui-ux.md`).

## 8. Registry Rules & Ownership

- Keep this index aligned with the files that actually exist under
  `technical-guidelines/`.
- Add a row (and create the file with real rules) when a new durable
  cross-cutting pattern is identified.
- Owners are `TBD` until assigned — assign before relying on a guideline.

## 9. Guideline Stable Headings

New guideline files must include: **1. Summary**, **2. Scope**, **3. Rules**,
**4. Preferred Patterns**, **5. Anti-Patterns**, **6. Related Docs**,
**7. Open Questions**. Append custom subheadings as needed.

## 10. Success Metrics

Contributors and agents can reference, follow, and validate these rules during
any change to the affected domains.

## 11. Related Documents

- [Master Project Registry](../index.md)
- [architecture.md](../foundation/architecture.md) — ADRs these rules support.
- [api-contract.md](../development/api-contract.md) and
  [database.md](../development/database.md) — the contracts these rules operate on.

## 12. Open Questions

- Assign owners to each guideline.
- Promote `development/testing.md` conventions into a `testing.md` guideline?
