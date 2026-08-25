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
- [x] Create `conversions` table migration + RLS (`auth.uid() = user_id`) *(file: `supabase/migrations/20260825000001_create_conversions.sql` — READY, menunggu live project)*
- [x] Create `sliceui-images` storage bucket + storage RLS policies *(file: `supabase/migrations/20260825000002_create_storage_bucket.sql` — READY, menunggu live project)*
- [ ] `supabase gen types` → update `src/integrations/supabase/types.ts` *(menunggu live project + migration di-apply)*
- [ ] Connect live Supabase project; verify email/password auth (signup/signin/session) *(BLOCKED: refs `eozcijxcimeqgobbtdvs` & `heaqfnzfxlrsxxckjsix` NXDOMAIN — tidak ada project live. User perlu buat project Supabase baru.)*
- [ ] Verify `createConversion`/`getConversions`/`deleteConversion` against the real backend *(menunggu live project)*
- [x] Gate `VITE_BYPASS_AUTH` to local dev only (or remove) *(2026-08-25: now `import.meta.env.DEV &&` — tidak bisa aktif di production build)*
- [x] Standardize conversion id-source to `user.id` (fix `Dashboard` `profile.id` mismatch) *(2026-08-25: Dashboard fetch by user.id)*
- [x] Implement history load in Slice via `?conversion=` param (or remove the dead link) *(2026-08-25: implemented — loads from history, clears param)*
- [x] Enable Svelte preview in `CodeOutput.tsx` `canPreview` *(2026-08-25: svelte@5 in-browser compile)*
- [x] Fix `index.html` `<title>` + OG tags → SliceUI *(2026-08-25: title + OG/twitter meta)*

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
**6/10 tasks done (2026-08-25).** Blocked on: a live Supabase project (all configured refs are NXDOMAIN — deleted/paused). Migration files ready in-repo; remaining 4 tasks (apply migrations, gen types, connect live auth, verify CRUD) are a single block once the user creates a project and shares its 20-char ref.

## Deprecated Features
- `VITE_BYPASS_AUTH` mock becomes dev-only (or removed) once live auth is verified.
