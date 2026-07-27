# Phase Registry - SliceUI

## Project Type

**Brownfield.** SliceUI is an implemented MVP (Vite/React client-side AI
converter with Supabase auth + history). These phases track hardening,
quality, schema-integrity, and polish work inferred from the current codebase
and the roadmap in `foundation/status.md`.

## Overall Timeline

- **Planning baseline:** 2026-07-24.
- **Active cycle:** **C1 - Functional Production (Local)** (2026-07-26). C1 is a
  delivery cycle that stands up the backend (subsuming much of P1's scope), adds
  the History page + entitlement UX, and tightens quality. Its execution briefs
  live in [`c1/`](./c1/).
- **Sequencing:** C1 (active) → P2/P3/P4 detail items remaining after C1.

## Phase Registry

| Phase | Title | Status | File |
| :--- | :--- | :--- | :--- |
| **C1** | **Functional Production (Local)** | **In Progress** | [phase-C1-functional-production.md](./phase-C1-functional-production.md) |
| P1 | Security & Production Hardening | Largely covered by C1.1 | [phase-P1-security-hardening.md](./phase-P1-security-hardening.md) |
| P2 | Reliability & QA (tests + CI) | Partially covered by C1.4 | [phase-P2-reliability-qa.md](./phase-P2-reliability-qa.md) |
| P3 | Schema Integrity | Not Started | [phase-P3-schema-integrity.md](./phase-P3-schema-integrity.md) |
| P4 | Polish & Framework Parity | Not Started | [phase-P4-polish-parity.md](./phase-P4-polish-parity.md) |

## How to Add New Phases

1. Copy the nearest existing `phase-P{N}-*.md` as a template.
2. Use brownfield naming: `phase-P{N}-short-description.md`.
3. Fill the phase stable headings (Phase Goal → Deprecated Features).
4. Add a row to the **Phase Registry** table above.
5. Link any new epics/risks back to `foundation/status.md`.

> Status values: `Not Started` · `In Progress` · `Complete`. Update the row and
> the phase file's Status heading together.
