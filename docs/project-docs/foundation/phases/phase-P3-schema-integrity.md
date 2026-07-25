# Phase P3 — Schema Integrity

## Phase Goal

Reconcile the live Supabase schema with the code: regenerate TypeScript types
to include the `conversions` table, remove unsafe casts, version-control
migrations, and resolve the leftover bug-tracker schema drift.

## Timeline (Start → End)

- **Start:** TBD (can run in parallel with P2)
- **End:** TBD

## Feature Summary & Core Functions

- Regenerate `src/integrations/supabase/types.ts` from the real project.
- Remove `as any` casts in `conversionService.ts`; gain compile-time safety.
- Adopt `supabase/migrations` for version-controlled schema.
- Add supporting indexes for the dashboard query.
- Decide the fate of unrelated tables (`bugs`, `projects`, etc.) and storage
  URL strategy.

## Sub-Functions / Tasks

- [ ] Run `supabase gen types typescript` against the live project; commit
      updated `types.ts`.
- [ ] Type `options` as `ConversionOptions`; remove `as any`.
- [ ] Add `conversions(user_id, created_at desc)` index.
- [ ] Create `supabase/migrations/` baseline from current schema.
- [ ] Confirm/drop unused bug-tracker tables and `severity-*` tokens.
- [ ] Evaluate signed URLs vs current public URLs for `sliceui-images`.
- [ ] Update `database.md` once the schema is authoritative.

## Sprint Tracker

| Sprint | Scope | Status |
| :--- | :--- | :--- |
| P3.1 | Regenerate types + remove casts + index | Not Started |
| P3.2 | Migrations baseline + cleanup | Not Started |

## Acceptance Criteria

- AC: `types.ts` includes `conversions` matching runtime usage.
- AC: `tsc` passes with no `as any` in `conversionService.ts`.
- AC: `supabase/migrations/` exists and reflects live schema.
- AC: dashboard list query is index-backed.

## Dependencies & Blockers

- **Depends on:** Supabase CLI + dashboard owner access; RLS work from P1.
- **Blocks:** P4 polish (clean types needed for framework-parity changes).

## Status

**Not Started.**

## Deprecated Features

- The stale bug-tracker `types.ts` content (to be replaced, not preserved).
