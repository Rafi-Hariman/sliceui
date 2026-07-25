# Phase Registry — SliceUI

## Project Type

**Brownfield.** SliceUI is an implemented MVP (Vite/React client-side AI
converter with Supabase auth + history). These phases track hardening,
quality, schema-integrity, and polish work inferred from the current codebase
and the roadmap in `foundation/status.md`.

## Overall Timeline

- **Planning baseline:** 2026-07-24.
- **Sequencing:** P1 (security) → P2 (QA/CI) and P3 (schema) can run in
  parallel → P4 (polish) after P3.
- **End dates:** TBD (no committed schedule yet).

## Phase Registry

| Phase | Title | Status | File |
| :--- | :--- | :--- | :--- |
| P1 | Security & Production Hardening | Not Started | [phase-P1-security-hardening.md](./phase-P1-security-hardening.md) |
| P2 | Reliability & QA (tests + CI) | Not Started | [phase-P2-reliability-qa.md](./phase-P2-reliability-qa.md) |
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
