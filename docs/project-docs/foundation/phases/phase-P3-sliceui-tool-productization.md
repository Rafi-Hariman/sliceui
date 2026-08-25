# Phase P3 — SliceUI Tool Productization

## Phase Goal
Make the SliceUI tool ready for public (free-launch) use: provision persistence, wire live auth, and close the functional gaps so the tool can be handed to agencies/freelancers with a coherent experience.

## Timeline
Start → End: **After P2.** Persistence and live auth are deliberately deferred here — the cash engine (P2) does not need them, but a public tool does.

## Feature Summary & Core Functions
- Provision `public.conversions` table + `sliceui-images` storage bucket + RLS + migrations.
- Regenerate Supabase types (`src/integrations/supabase/types.ts`).
- Wire a live Supabase project; remove/gate `VITE_BYPASS_AUTH`.
- Standardize the conversion id-source (resolve `profile.id` vs `user.id`).
- Resolve the dead `/slice?conversion=<id>` path.
- Enable Svelte preview in `CodeOutput.tsx` (still excluded from `canPreview`).
- Fix product naming: `index.html` title/OG metadata → SliceUI (not "Triage").

## Sub-Functions / Tasks
- [ ] Create `conversions` table migration + RLS (`auth.uid() = user_id`)
- [ ] Create `sliceui-images` storage bucket + storage RLS policies
- [ ] `supabase gen types` → update `src/integrations/supabase/types.ts`
- [ ] Connect live Supabase project; verify email/password auth (signup/signin/session)
- [ ] Verify `createConversion`/`getConversions`/`deleteConversion` against the real backend
- [ ] Gate `VITE_BYPASS_AUTH` to local dev only (or remove)
- [ ] Standardize conversion id-source to `user.id` (fix `Dashboard` `profile.id` mismatch)
- [ ] Implement history load in Slice via `?conversion=` param (or remove the dead link)
- [ ] Enable Svelte preview in `CodeOutput.tsx` `canPreview`
- [ ] Fix `index.html` `<title>` + OG tags → SliceUI

## Sprint Tracker
| Sprint | Scope | Status |
| :--- | :--- | :--- |
| — | (not started) | ⏳ |

## Acceptance Criteria
- [ ] A signup → slice → save flow persists a conversion row to Supabase.
- [ ] Dashboard history lists only the owning user's conversions.
- [ ] Uploaded images resolve via a storage URL.
- [ ] `npm run build` passes with regenerated types.
- [ ] Preview renders for all 7 supported frameworks (including Svelte).
- [ ] App metadata (`<title>`/OG) says SliceUI.

## Dependencies & Blockers
- **Blocked by:** P2 (live URL + key rotation must land first so the tool isn't deployed with committed secrets).
- Live Supabase project owner (TBD).

## Status
**Not Started.**

## Deprecated Features
- `VITE_BYPASS_AUTH` mock becomes dev-only (or removed) once live auth is verified.
