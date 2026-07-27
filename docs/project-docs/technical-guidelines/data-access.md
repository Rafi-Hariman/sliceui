# Guideline - Data Access & Error Mapping

## 1. Summary

Rules for Supabase data-access services (`src/lib/*Service.ts`) and how their
errors become user-facing messages in hooks. Establishes the wrapper pattern,
the error envelope, and the translation layer. Inferred from codebase.

## 2. Scope

Covers `conversionService.ts`, `storageService.ts`, the Supabase client
(`src/integrations/supabase/client.ts`), `AuthContext`, and error mapping in
`useConvert`. Does not cover AI calls (see [ai-providers.md](./ai-providers.md))
or schema design (see [database.md](../development/database.md)).

## 3. Rules

- **R1 - Services wrap Supabase.** All PostgREST/Storage/Auth access goes
  through a `*Service.ts` function (e.g. `createConversion`,
  `uploadSliceImage`). Components/hooks must not call `supabase.from(...)`
  directly.
- **R2 - One operation per function.** Each service function does one thing
  (create / list / get / delete / upload) and returns typed data or throws.
- **R3 - Error envelope via thrown `Error`.** On `{ error }`, throw
  `new Error("Failed to <action>: ${error.message}")`. Keep the
  `"Failed to <verb> ..."` prefix consistent - hooks rely on it.
- **R4 - User-owned rows are filtered by `user_id`.** List/get queries must
  scope by the authenticated user's id; rely on RLS as the backstop, not the
  only control.
- **R5 - Translate errors at the hook layer.** Map provider/service messages to
  user-safe strings in hooks (e.g. `useConvert`): `quota`/`limit` → "Daily
  limit reached…", `API key` → "API configuration error…". Never surface raw
  internals to end users.
- **R6 - No `as any` for typed payloads.** Type Supabase payloads with the
  generated `Database` types. (Known violation: `options: options as any` -
  fix blocked on regenerating `types.ts`; see P3.)
- **R7 - Storage paths are user-scoped.** Upload under `{userId}/...` and clean
  up with `deleteSliceImage` when deleting the parent conversion.
- **R8 - Auth gating is explicit.** Persistence must be conditional on a
  present `user`. Guest paths must not write to Supabase. (Today the login
  guard is disabled - see P1.)

## 4. Preferred Patterns

```ts
// service: typed, single concern, consistent envelope
export async function getThing(id: string): Promise<Thing | null> {
  const { data, error } = await supabase.from("things").select("*").eq("id", id).single()
  if (error) {
    if (error.code === "PGRST116") return null   // not found is not an error
    throw new Error(`Failed to fetch thing: ${error.message}`)
  }
  return data
}

// hook: catch, classify, show user-safe message
try { /* ... */ } catch (err: any) {
  const m = err?.message ?? "Something went wrong."
  setError(/quota|limit/.test(m) ? "Daily limit reached…" : m)
}
```

## 5. Anti-Patterns

- ❌ Calling `supabase.from(...)` or `supabase.storage...` inside a component.
- ❌ Swallowing errors silently (`if (error) return null` for non-"not found").
- ❌ Returning raw Supabase error objects to the UI.
- ❌ Casting payloads with `as any` to bypass missing types (regenerate types
  instead).
- ❌ Writing to Supabase without confirming an authenticated `user`.

## 6. Related Docs

- [database.md](../development/database.md) - schema, RLS, storage bucket.
- [api-contract.md](../development/api-contract.md) - Supabase client usage.
- [code-style.md](./code-style.md) - `*Service.ts` naming.

## 7. Open Questions

- Standardize a single error type/class instead of plain `Error` strings?
- Add an error-code map so the hook layer switches on codes, not regex?
- Confirm RLS is actually enabled before relying on R4's backstop.
