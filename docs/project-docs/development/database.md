# Database — SliceUI

## 1. Description
The data layer for SliceUI: the Supabase schema used by the app, entities, storage, and migration approach.

## 2. Important
- **Inferred from codebase:** table shapes are reconstructed from `src/lib/conversionService.ts`, `src/contexts/AuthContext.tsx`, and the generated types at `src/integrations/supabase/types.ts`.
- **Confirmed gap (2026-08-24):** the `conversions` table and `sliceui-images` bucket **do not exist** in the generated types or any committed migration/RLS. `conversionService.ts`/`storageService.ts` reference them, but they are **unprovisioned intent**. See §7 (current) vs §8 (target).
- `src/integrations/supabase/types.ts` also contains scaffold-leftover tables (`projects`, `user_roles`, `activity_log`, `company_settings`, `invitations`, `comments`, `attachments`, `bugs`, `notification_preferences`) **not used** by the app. Only `profiles` exists today; `conversions` is targeted but missing.
- No live Supabase project is wired; `supabase/config.toml` only sets `project_id`. No migrations directory exists in the repo.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. DB Architecture](#7-db-architecture)
- [8. Schema Definitions](#8-schema-definitions)
- [9. Indexes](#9-indexes)
- [10. Migration Strategy](#10-migration-strategy)
- [11. Data Dictionary](#11-data-dictionary)
- [12. Success Metrics](#12-success-metrics)
- [13. Related Documents](#13-related-documents)
- [14. Open Questions](#14-open-questions)

## 4. Scope
Covers the tables and storage the SliceUI app reads/writes today (`profiles`) and intends to write (`conversions`, `sliceui-images`), plus the target provisioning path.

## 5. Goals
Document the current data shape precisely (what exists vs what's intended), so agents/developers know exactly what to provision before the persistence layer works.

## 6. Non Goals
Does not document the unused Lovable-scaffold tables, nor the auth/storage internal Supabase schemas.

## 7. DB Architecture
- **Provider:** Supabase Postgres (managed).
- **Auth:** Supabase Auth stores users in `auth.users`; app profiles live in `public.profiles`. **Live auth not wired — dev uses `VITE_BYPASS_AUTH` mock.**
- **App tables (current):** `public.profiles` — exists in generated types.
- **App tables (target):** `public.conversions` — **absent** from generated types, no migration. This is a confirmed gap (2026-08-24).
- **Storage (target):** `sliceui-images` bucket — **not provisioned**; `storageService.ts` references it.
- **Access:** client-side via generated `Database` types (RLS expected but not committed in-repo).

## 8. Schema Definitions

### 8.1 `public.profiles` — ✅ exists in generated types
Stores per-user public profile data.
```sql
create table public.profiles (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id),
  full_name  text,
  job_title  text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```
> `user_id` appears twice in the generated types output (a known Lovable codegen quirk). Confirm the live schema before relying on it.

### 8.2 `public.conversions` — ⚠ TARGET, not yet created
Stores each image-to-code conversion result. Shape inferred from `conversionService.ts` usage. **This table is absent from `src/integrations/supabase/types.ts` and no migration exists — it must be created (with RLS) for persistence to work.**
```sql
create table public.conversions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id),
  original_image_url  text not null,
  original_image_name text not null,
  framework           text not null,           -- one of 7 picker frameworks
  options             jsonb not null,          -- { responsive, semanticHtml, darkMode, a11y }
  generated_code      text not null,
  status              text not null default 'pending',  -- pending | completed | failed
  error_message       text,
  created_at          timestamptz not null default now()
);
-- Suggested RLS (must be applied + committed):
alter table public.conversions enable row level security;
create policy "own conversions" on public.conversions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

## 9. Indexes
| Table | Index | Reason |
| :--- | :--- | :--- |
| `conversions` | `conversions_user_id_created_at_idx` on `(user_id, created_at desc)` | Dashboard lists a user's history newest-first (`getConversions`) |
| `profiles` | Unique on `user_id` | One profile per auth user; fetched via `.eq("user_id", userId)` |

## 10. Migration Strategy
- **Current:** no `supabase/migrations/` directory; the repo has only `supabase/config.toml`. `profiles` exists only in the generated types (scaffold), `conversions`/`sliceui-images` are unprovisioned.
- **Recommended (Phase P2):** adopt SQL migrations (e.g., `supabase migration new`) so `profiles` + `conversions` are versioned, plus RLS policies and storage policies committed alongside.
- Regenerate `src/integrations/supabase/types.ts` (`supabase gen types`) after schema changes so `conversions` becomes part of the typed `Database`.

## 11. Data Dictionary
| Field | Type | Null | Notes |
| :--- | :--- | :--- | :--- |
| `profiles.id` | uuid | no | PK |
| `profiles.user_id` | uuid | no | FK → auth.users |
| `profiles.full_name` | text | yes | Display name (avatar initials) |
| `profiles.job_title` | text | yes | Unused in UI currently |
| `profiles.avatar_url` | text | yes | Unused in UI currently |
| `profiles.created_at` | timestamptz | no | |
| `profiles.updated_at` | timestamptz | no | |
| `conversions.id` | uuid | no | PK |
| `conversions.user_id` | uuid | no | FK → auth.users |
| `conversions.original_image_url` | text | no | Public storage URL |
| `conversions.original_image_name` | text | no | e.g. `mockup.png` |
| `conversions.framework` | text | no | `tailwind` \| `react-tsx` \| `vue-sfc` \| `bootstrap5` \| `native-html` \| `nextjs` \| `svelte` |
| `conversions.options` | jsonb | no | `{ responsive, semanticHtml, darkMode, a11y }` |
| `conversions.generated_code` | text | no | The component code |
| `conversions.status` | text | no | `pending` \| `completed` \| `failed` (app inserts `completed`) |
| `conversions.error_message` | text | yes | Set when failed |
| `conversions.created_at` | timestamptz | no | Order key for history |

## 12. Success Metrics
- Queries match documented shapes and generated types.
- Schema changes are tracked via migrations + regenerated types.

## 13. Related Documents
- [API Contract](api-contract.md)
- [Architecture](../foundation/architecture.md)
- [Technical Guidelines — Data Access](../technical-guidelines/data-access.md)
- [Security & Compliance](../operations/security-compliance.md)

## 14. Open Questions
- **Provisioning owner:** who creates the live Supabase project and runs the migration for `conversions` + `sliceui-images`? This is the current blocker.
- Should RLS policies be written/committed for `profiles` and `conversions` (ownership = `auth.uid()`)? (Recommended — included above.)
- Should unused scaffold tables (`projects`, `user_roles`, etc.) be dropped to reduce attack surface and type noise?
- Should the app standardize on `user.id` or `profile.id` for `conversions.user_id` (Dashboard uses `profile.id`; `useConvert` writes `user.id`)?
