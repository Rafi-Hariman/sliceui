# Database — SliceUI

## 1. Description

SliceUI persists auth profiles, conversion history, and uploaded images in
**Supabase** (managed Postgres + Storage). This document records the schema the
**application code actually uses**, and flags a significant drift in the
generated TypeScript types.

## 2. Important

- **Type drift (high priority):** `src/integrations/supabase/types.ts` is an
  auto-generated file describing an **unrelated bug-tracker schema**
  (`bugs`, `attachments`, `comments`, `projects`, `activity_log`,
  `company_settings`, `invitations`, `notification_preferences`, `user_roles`).
  It does **not** contain the `conversions` table that the app writes to. The
  file appears copied from another project and must be regenerated from the
  live SliceUI Supabase project.
- Because `conversions` is not typed, `conversionService.ts` inserts/select it
  without compile-time safety (`options: options as any`).
- No migrations are checked into the repo (`supabase/` contains only
  `config.toml`). Schema lives in the Supabase dashboard — TBD whether to adopt
  `supabase/migrations`.

## 3. Table of Contents

- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [DB Architecture](#db-architecture)
- [Schema Definitions](#schema-definitions)
- [Indexes](#indexes)
- [Migration Strategy](#migration-strategy)
- [Data Dictionary](#data-dictionary)
- [Success Metrics](#success-metrics)
- [Related Documents](#related-documents)
- [Open Questions](#open-questions)

## 4. Scope

Supabase tables, storage bucket, and types as used by SliceUI. Excludes
provider AI APIs (`api-contract.md`) and auth UX (`prd.md`).

## 5. Goals

- Document the real schema so contributors don't trust the stale types file.
- Define the target: typed, migrated, RLS-protected schema.

## 6. Non Goals

- Not redesigning the schema — only documenting current + drift.
- Not covering Supabase Auth internals (managed).

## DB Architecture

- **Engine:** Supabase (Postgres 14.5 per generated types' `PostgrestVersion`).
- **Access pattern:** PostgREST via `@supabase/supabase-js` from the browser,
  using the **publishable/anon** key (`VITE_SUPABASE_PUBLISHABLE_KEY`).
- **Security model:** Row Level Security is assumed to be enabled (standard
  Supabase), but policies are **not defined in-repo** — verify in the dashboard.
- **Auth:** Supabase Auth, email/password; session persisted in `localStorage`.

## Schema Definitions

### `conversions` (used by code; NOT in generated types — Inferred from `types.ts` + `conversionService.ts`)

| Column | Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| `id` | uuid (pk) | no | |
| `user_id` | uuid / text | no | FK → auth users (policy-enforced) |
| `original_image_url` | text | no | public URL from Storage |
| `original_image_name` | text | no | uploaded file name |
| `framework` | enum/text | no | one of `Framework` |
| `options` | jsonb | yes | `ConversionOptions` (cast `as any`) |
| `generated_code` | text | no | model output |
| `status` | enum | yes | `pending` \| `completed` \| `failed` |
| `error_message` | text | yes | nullable |
| `created_at` | timestamptz | yes | default now() |

### `profiles` (used by `AuthContext`; present in generated types)

`id`, `user_id`, `full_name`, `job_title`, `avatar_url`, `created_at`,
`updated_at`. Fetched via `.eq("user_id", userId).single()`.

### Other generated tables (from stale types — verify whether they exist in this project)

`bugs`, `attachments`, `comments`, `projects`, `activity_log`,
`company_settings`, `invitations`, `notification_preferences`, `user_roles`.
Enums: `app_role` (admin/moderator/user), `bug_severity`, `bug_status`. These
are **almost certainly leftovers** from the source project the types were copied
from; do not rely on them.

### Storage

- **Bucket:** `sliceui-images` (hard-coded in `storageService.ts`).
- **Path layout:** `{user_id}/{timestamp}-{random}.{ext}`.
- **Public URL** retrieved via `getPublicUrl`. `cacheControl: "3600"`,
  `upsert: false`.

## Indexes

- TBD (not in repo). Expected: index on `conversions(user_id, created_at desc)`
  to support the dashboard list query (`getConversions` orders by `created_at`
  desc filtered by `user_id`).

## Migration Strategy

- **Current:** schema managed manually in the Supabase dashboard; no migrations
  in-repo (`supabase/migrations` does not exist).
- **Target:** adopt Supabase CLI migrations so schema is version-controlled;
  regenerate types via `supabase gen types typescript` after each change and
  commit them.
- **Immediate fix:** regenerate `types.ts` from the real project to include
  `conversions`, then remove the `as any` casts in `conversionService.ts`.

## Data Dictionary

- `ConversionOptions` (jsonb `options`): `{ responsive, semanticHtml,
  darkMode, a11y }` — all booleans. See `src/lib/types.ts`.
- `Framework` enum domain: `tailwind | react-tsx | vue-sfc | bootstrap5 |
  native-html | nextjs | svelte | flutter`.

## Success Metrics

- `types.ts` regenerated and includes `conversions`; no `as any` in
  `conversionService.ts`.
- Migrations checked in; RLS policies documented.
- Dashboard list query backed by an index.

## Related Documents

- [api-contract.md](./api-contract.md) — Supabase + AI provider access.
- [architecture.md](../foundation/architecture.md) — data flow.
- [status.md](../foundation/status.md) — drift listed as a risk.

## Open Questions

- Are RLS policies actually enabled for `conversions` and `sliceui-images`?
  (Guest mode inserts nothing, but authed users write directly from the browser.)
- Should image storage use signed URLs instead of public URLs?
- Drop the unrelated bug-tracker tables from the live project, or are they
  intentionally shared?
