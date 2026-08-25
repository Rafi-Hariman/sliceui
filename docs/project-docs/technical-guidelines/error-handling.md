# Technical Guideline — Error Handling

## 1. Summary
Rules for how SliceUI surfaces errors to users and developers: the user-safe message taxonomy, loading-message progression, and provider fallback behavior (`src/hooks/useConvert.ts`, `src/lib/aiService.ts`).

## 2. Scope
Applies to the conversion pipeline's error path and any new user-facing async operations. Does not cover Supabase-specific error propagation (see `data-access.md`).

## 3. Rules
- **R1 — User-safe messages:** users must never see raw stack traces. Map known failures to friendly copy; fall back to the error `message` only as a last resort.
- **R2 — Known error mapping (keep in sync with code):**
  | Detected | User message |
  | :--- | :--- |
  | `quota` / `limit` | "Daily limit reached. Please try again tomorrow." |
  | `API key` | "API configuration error. Please check your settings." |
  | else | `error.message` |
- **R3 — Fallback transparency:** provider fallback (Gemini → Groq) is automatic and silent to the user — do not show an error when fallback succeeds.
- **R4 — Loading progression:** drive the UI with `loadingMessage`: `"Analyzing UI layout..."` immediately, then `"Generating <framework> code..."` after a delay (~1.8s). Always clear timers and `isLoading` in `finally`.
- **R5 — Persistence only when a session exists (local-first):** `useConvert.convert` runs the AI call regardless of login state; Supabase persistence (`uploadSliceImage`/`createConversion`) runs only when `user` is present. Without a session, generate + show but skip saving.
- **R6 — State reset:** `reset()` clears `code`, `error`, and `loadingMessage` before each conversion; errors render a retry affordance (not a dead screen).
- **R7 — Log for developers, message for users:** always `console.error` the underlying error for debugging; the UI message is separate.

## 4. Preferred Patterns
```ts
// Preferred: map errors at one boundary, keep UI dumb
} catch (err: any) {
  console.error("Conversion error:", err)
  const m = err?.message ?? "Conversion failed. Please try again."
  if (m.includes("quota") || m.includes("limit")) setError("Daily limit reached. Please try again tomorrow.")
  else if (m.includes("API key")) setError("API configuration error. Please check your settings.")
  else setError(m)
} finally {
  clearTimeout(loadingTimer)
  setIsLoading(false)
}
```

## 5. Anti-Patterns
- ❌ Showing `err.stack` or technical Supabase/Groq messages to the user.
- ❌ Rendering an error *and* a success path at the same time (reset before retry).
- ❌ Surfacing the Groq fallback to the user as an error.
- ❌ Forgetting to clear the loading timer → stuck spinner.
- ❌ Attempting Supabase persistence without a session (`user` null) instead of skipping it (R5).

## 6. Related Docs
- [AI Service](ai-service.md)
- [Observability & Error Handling](../operations/observability-error-handling.md)
- [PRD — FR/NFR](../foundation/prd.md)

## 7. Open Questions
- Should a stable error-code enum replace message-matching (R2)? Current matching is string-based and brittle.
- Are there other known user-facing failures to map (e.g., storage quota, network offline)?
