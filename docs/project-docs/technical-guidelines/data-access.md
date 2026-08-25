# Technical Guideline — Data Access

## 1. Summary
Rules for how SliceUI reads/writes data through Supabase: typed client access, storage patterns, and error propagation (`src/lib/conversionService.ts`, `src/lib/storageService.ts`, `src/contexts/AuthContext.tsx`).

## 2. Scope
Applies to all Supabase interactions in the app (database, storage, auth session). Does not cover the AI pipeline (see `ai-service.md`) or UI error messaging (see `error-handling.md`).

## 3. Rules
- **R1 — Single typed client:** use the shared `supabase` instance from `@/integrations/supabase/client` (`createClient<Database>` with generated types). Never instantiate a new client or cast away the `Database` type.
- **R2 — Typed tables:** use `Tables<"profiles">`, `Tables<"conversions">` where table shapes are referenced (e.g., `AuthContext` `Profile`).
- **R3 — Thin service wrappers:** database/storage operations live in service functions (`conversionService.ts`, `storageService.ts`). Pages/hooks call services, not raw `supabase.from(...)` chains.
- **R4 — Throw `Error` with descriptive messages:** service failures throw `Error("Failed to <verb> <resource>: <message>")`. Do not return `null`/`undefined` for genuine failures (exception: `getConversionById` returns `null` for not-found `PGRST116`).
- **R5 — Storage path convention:** uploads go to `{userId}/{timestamp}-{random}.{ext}` in the `sliceui-images` bucket; never store the raw file in a DB column.
- **R6 — Auth ownership:** operations key on `user.id` from `useAuth()`; the UI must not guess a user id.
- **R7 — Delete both DB row and storage object:** when removing a conversion, remove the storage object too (`deleteSliceImage`) — do not orphan images.

## 4. Preferred Patterns
```ts
// Preferred: service function, typed insert, single row back
const { data, error } = await supabase
  .from("conversions")
  .insert({ user_id: userId, ... })
  .select()
  .single()
if (error) throw new Error(`Failed to create conversion: ${error.message}`)
return data

// Preferred: typed table helper for entity shapes
type Profile = Tables<"profiles">

// Preferred: not-found is a distinct case
if (error?.code === "PGRST116") return null
```

## 5. Anti-Patterns
- ❌ Creating a second `createClient` in a hook or page.
- ❌ Calling `supabase.from("...")` directly in a component (bypasses services).
- ❌ Silently swallowing Supabase errors in a service (return `[]`/`undefined` on failure).
- ❌ Using `as any` on inserts/options — keep the `Database` types (the app already does `options as any` in one spot; tighten it if possible).
- ❌ Storing images in the `conversions` table as base64/blob.

## 6. Related Docs
- [Database](../development/database.md)
- [API Contract](../development/api-contract.md)
- [Architecture — ADR-003](../foundation/architecture.md)
- [Security & Compliance](../operations/security-compliance.md)

## 7. Open Questions
- **Provisioning:** the `conversions` table + `sliceui-images` bucket don't exist yet (confirmed 2026-08-24). R4/R5 assume they will; until provisioned, persistence calls fail. Phase P2.
- RLS policies are not committed in-repo; should they be added to `supabase/migrations/`?
- The scaffold-leftover tables (`projects`, `user_roles`, ...) are unused — remove from schema/types?
- Should `conversions.user_id` standardize on `user.id` or `profile.id`? Dashboard reads by `profile.id`, `useConvert` writes `user.id`.
