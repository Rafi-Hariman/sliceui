# SliceUI — Project Docs Index

> Spec-Driven Development (SDD) documentation hub for the SliceUI repository.
> This index is the catalog of all active project documents. It is **not** a
> template — each linked file contains project-specific truth.

## What is SliceUI?

SliceUI converts UI screenshots into clean, framework-specific frontend
**component** code (a self-contained component, never a full app scaffold).
Target users: frontend engineers who need a jump-start when slicing a new UI
feature into an existing project.

The app is a **Vite + React 18 + TypeScript** single-page application (exported
from Lovable) that calls vision-capable LLMs (Gemini primary, Groq fallback)
directly from the browser, with Supabase for auth and conversion history.

## Authority & conflict note

- **Authority order:** project docs → codebase → agent judgment.
- The repository's original planning material — top-level `CLAUDE.md`, the
  original Next.js build spec, and the QA plan — described an **intended
  Next.js 14 / server-side** architecture that the current code does **not**
  implement (the real app is Vite/React with client-side AI calls). Those
  artifacts have been migrated to
  [`reference/`](./reference/) as **non-authoritative migration source**.
  These project docs treat the **actual codebase** as authoritative and record
  the original design as future intent (`architecture.md` ADRs, `status.md`,
  and the planned `/api/convert` contract in `api-contract.md`).
- When code and docs conflict and authority is unclear, surface the conflict to
  the maintainer — do not guess.

## Document catalog

### Root
| Document | Purpose |
| :--- | :--- |
| [getting-started.md](./getting-started.md) | Local setup, first run, troubleshooting. |

### Foundation
| Document | Purpose |
| :--- | :--- |
| [foundation/prd.md](./foundation/prd.md) | Vision, personas, features, requirements. |
| [foundation/architecture.md](./foundation/architecture.md) | Stack, architecture, system/data flow, ADRs. |
| [foundation/workflow.md](./foundation/workflow.md) | Dev loop, branching, PR/review. |
| [foundation/status.md](./foundation/status.md) | Current state, recent wins, roadmap, risks. |
| [foundation/phases/](./foundation/phases/index.md) | Phase registry (P1–P4) + individual phase files. |
| [foundation/changelog.md](./foundation/changelog.md) | Change log ([Unreleased]). |

### Development
| Document | Purpose |
| :--- | :--- |
| [development/testing.md](./development/testing.md) | QA policy, matrix, commands, gates. |
| [development/api-contract.md](./development/api-contract.md) | External AI + Supabase contracts + planned `/api/convert`. |
| [development/database.md](./development/database.md) | Supabase schema, storage, drift notes. |
| [development/ui-ux.md](./development/ui-ux.md) | Design system, screens, responsive, a11y. |
| [development/ui-ux-audit.md](./development/ui-ux-audit.md) | WCAG 2.2 AA audit + engineer fix-list (both themes). |

### Operations
| Document | Purpose |
| :--- | :--- |
| [operations/ci-cd.md](./operations/ci-cd.md) | Build, test gates, deploy, secrets. |
| [operations/deploy-metered-convert.md](./operations/deploy-metered-convert.md) | Phase 0 runbook: deploy the metered `/convert` edge function. |

### Technical Guidelines
| Document | Purpose |
| :--- | :--- |
| [technical-guidelines/index.md](./technical-guidelines/index.md) | Guidelines registry. |
| [technical-guidelines/ai-providers.md](./technical-guidelines/ai-providers.md) | Gemini→Groq fallback, prompt rules, model pinning. |
| [technical-guidelines/data-access.md](./technical-guidelines/data-access.md) | Supabase service pattern + error mapping. |
| [technical-guidelines/code-style.md](./technical-guidelines/code-style.md) | Naming, layout, `@` alias. |

### Reference (migration source — non-authoritative)
| Document | Origin | Why kept |
| :--- | :--- | :--- |
| [reference/prompt.md](./reference/prompt.md) | Original Next.js build spec (committed) | Source of `CLAUDE.md`; documents intended server-side design. |
| [reference/QA_TEST_DOCUMENT.md](./reference/QA_TEST_DOCUMENT.md) | QA plan | Full test matrix, ACs, checklists; mined into `development/testing.md`. |

> Per EHA rules, `reference/` is secondary migration input only — never treated
> as authoritative active truth. When this content conflicts with the SDD docs
> or codebase, the SDD docs + codebase win.

## How to use these docs

- **Before implementing:** read `prd.md` (what) and `architecture.md` (how).
- **Before opening a PR:** read `workflow.md` and `development/testing.md`.
- **SDD rule:** specifications dictate implementation. Update the relevant doc
  **first**, then write tests from the spec, then code to pass the tests.

## Open Questions

- Should the project migrate to the Next.js/server-side design in the reference
  docs, or is the current Vite/client-side architecture the intended long-term
  form? (Phase P1 assumes moving keys server-side.)
- See per-document "Open Questions" sections for finer-grained unknowns.
