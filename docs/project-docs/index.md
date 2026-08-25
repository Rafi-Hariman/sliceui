# Project Docs Index — SliceUI

## 1. Description
Master registry and entry point for all SliceUI project documentation under `docs/project-docs/`. This index lists every active document, its layer, and its purpose.

## 2. Important
- The root `CLAUDE.md` in this repository is **stale** — it describes a Next.js 14 App Router architecture that no longer matches the code. The authoritative architecture is now `foundation/architecture.md`.
- All docs follow the EHA 4-layer taxonomy and the Universal Stable Headings schema.
- When code and docs conflict, the owning doc wins; when authority is unclear, surface the conflict rather than guessing.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Document Registry](#7-document-registry)
- [8. How to Add a Document](#8-how-to-add-a-document)
- [9. Success Metrics](#9-success-metrics)
- [10. Related Documents](#10-related-documents)
- [11. Open Questions](#11-open-questions)

## 4. Scope
Covers the inventory of project docs for SliceUI, organized by the EHA layers: `foundation/`, `development/`, `operations/`, `technical-guidelines/`.

## 5. Goals
Provide a single entry point to find any project doc, keep the doc set in sync with the codebase, and avoid duplication across documents.

## 6. Non Goals
Does not define technical guideline rules (refer to `technical-guidelines/index.md`). Does not hold document content — only registry entries and links.

## 7. Document Registry

### Root
| Doc | Purpose |
| :--- | :--- |
| [Getting Started](getting-started.md) | Orientation and local setup instructions. |
| [Index](index.md) | This registry. |

### Foundation
| Doc | Purpose |
| :--- | :--- |
| [PRD](foundation/prd.md) | Technical functional/non-functional requirements, acceptance criteria. |
| [Product Spec](foundation/product-spec.md) | Business model, brands, business processes, monetization, decision gates. |
| [Architecture](foundation/architecture.md) | Stack, system flows, data flow, ADRs. |
| [Workflow](foundation/workflow.md) | Branching, local dev loop, PR & code review. |
| [Status](foundation/status.md) | Current state, roadmap, risks, open threads. |
| [Changelog](foundation/changelog.md) | Historical release tracking. |
| [Phases](foundation/phases/index.md) | Phase registry (P1–P4) + individual phase files. |

### Development
| Doc | Purpose |
| :--- | :--- |
| [Testing](development/testing.md) | Verification policy, matrices, commands, quality gates. |
| [API Contract](development/api-contract.md) | AI service contract, Supabase interface, request/response shapes. |
| [Database](development/database.md) | Supabase schema, entities, migrations, storage. |
| [UI/UX](development/ui-ux.md) | Design tokens, components, responsive, a11y. |
| [Internationalization](development/internationalization.md) | Language support and localization approach. |

### Operations
| Doc | Purpose |
| :--- | :--- |
| [CI/CD](operations/ci-cd.md) | Pipelines, build, test gates, deploy. |
| [Production Runbook](operations/production-runbook.md) | Release procedure, smoke checks, rollback, env config. |
| [Governance](operations/governance.md) | Versioning, release cadence, code ownership. |
| [Security & Compliance](operations/security-compliance.md) | Threat model, access control, key handling, data retention. |
| [Observability & Error Handling](operations/observability-error-handling.md) | Logging, error payloads, client fallbacks, alerts. |

### Technical Guidelines
| Doc | Purpose |
| :--- | :--- |
| [Guidelines Index](technical-guidelines/index.md) | Active cross-cutting rule registry. |
| [AI Service](technical-guidelines/ai-service.md) | Gemini/Groq fallback chain, prompt building, client-side keys. |
| [Data Access](technical-guidelines/data-access.md) | Supabase typed access, storage patterns, error propagation. |
| [Error Handling](technical-guidelines/error-handling.md) | User-safe error taxonomy, loading messages. |
| [UI/UX](technical-guidelines/ui-ux.md) | shadcn/ui usage, HSL design tokens, dark mode. |

## 8. How to Add a Document
1. Place the file in the correct layer subfolder (`foundation/`, `development/`, `operations/`, `technical-guidelines/`).
2. Follow the Universal Stable Headings schema (see the EHA master registry).
3. Add a row to the relevant table above.
4. For technical guidelines, also add a row to `technical-guidelines/index.md`.
5. For new phases, add a row to the [Phase Registry](foundation/phases/index.md).

## 9. Success Metrics
Every doc is discoverable from this index, follows the stable headings schema, and matches the current codebase.

## 10. Related Documents
- [EHA Master Registry](https://github.com/) — Universal Stable Headings schema (authoritative).
- [Technical Guidelines Index](technical-guidelines/index.md).

## 11. Open Questions
- None.
