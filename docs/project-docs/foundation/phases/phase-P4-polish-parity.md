# Phase P4 - Polish & Framework Parity

## Phase Goal

Close output-quality and UX gaps: framework picker/type parity, working
previews for every listed framework, pinned model versions, and a cleaner
design-token set.

## Timeline (Start → End)

- **Start:** TBD (after P3)
- **End:** TBD

## Feature Summary & Core Functions

- Resolve `flutter` drift (add to picker or drop from the type).
- Fix the `native-html` preview path (tab shows but no renderer exists).
- Pin Gemini/Groq model versions for reproducibility.
- Unify the per-framework preview-CDN assembly in `CodeOutput`.
- Design hygiene: pick one font, prune unused tokens.

## Sub-Functions / Tasks

- [ ] Add `flutter` to `FRAMEWORKS` (with prompt rules already present) **or**
      remove it from the `Framework` union.
- [ ] Implement `native-html` preview renderer in `getPreviewDoc` (or remove
      it from `canPreview`).
- [ ] Replace `gemini-flash-latest` / `pixtral-12b-2409` aliases with pinned
      versions (or document the alias policy).
- [ ] Extract shared preview-document builder from `CodeOutput`.
- [ ] Decide canonical font (Inter vs Geist); remove the other import.
- [ ] Prune unused `severity-*` tokens + sidebar leftovers if confirmed dead.
- [ ] A11y pass on `/slice` (labels, focus, iframe usability).

## Sprint Tracker

| Sprint | Scope | Status |
| :--- | :--- | :--- |
| P4.1 | Framework parity + preview fixes | Not Started |
| P4.2 | Token/font cleanup + a11y | Not Started |

## Acceptance Criteria

- AC: every framework in the picker has a defined prompt rule **and** a working
  or explicitly-unsupported preview state (no misleading tabs).
- AC: model identifiers are pinned or their alias policy is documented.
- AC: only one font is imported; no unused design tokens remain.
- AC: `/slice` passes an a11y checklist.

## Dependencies & Blockers

- **Depends on:** P3 (clean types); P2 (tests) to guard preview changes.

## Status

**Not Started.**

## Deprecated Features

- Inconsistent preview behavior for `native-html` and the absent `flutter`
  picker entry (to be resolved, not kept).
