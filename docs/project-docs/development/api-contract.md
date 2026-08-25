# API Contract — SliceUI

## 1. Description
The external and internal API surface of SliceUI: the AI conversion call (Gemini/Groq), the Supabase client interface (auth, database, storage), request/response shapes, and error behavior.

## 2. Important
- **There are no HTTP API routes** in this app — the SPA talks directly to Supabase and the AI providers. "Contract" here means the function signatures and external-service contracts the code depends on.
- **Inferred from codebase:** shapes below come from `src/lib/*`, `src/hooks/*`, and Supabase generated types.
- **Persistence endpoints are intent-only (confirmed 2026-08-24):** the `conversions` table and `sliceui-images` bucket referenced by the service layer do not exist in the generated types or any committed migration/RLS. These calls will fail against a real project until provisioned.
- Client-side keys mean these integrations are directly reachable from any browser that loads the app.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Base URLs & Auth](#7-base-urls--auth)
- [8. Request/Response Format](#8-requestresponse-format)
- [9. Endpoints](#9-endpoints)
- [10. Webhooks](#10-webhooks)
- [11. Rate Limiting](#11-rate-limiting)
- [12. Success Metrics](#12-success-metrics)
- [13. Related Documents](#13-related-documents)
- [14. Open Questions](#14-open-questions)

## 7. Base URLs & Auth
| Service | Base | Auth |
| :--- | :--- | :--- |
| Supabase | `VITE_SUPABASE_URL` | Publishable key (`VITE_SUPABASE_PUBLISHABLE_KEY`) + user session |
| Gemini | `generativelanguage.googleapis.com` (SDK-managed) | `VITE_GEMINI_API_KEY` (query/key) |
| Groq | `api.groq.com` (SDK-managed) | `VITE_GROQ_API_KEY` (Bearer) |

## 8. Request/Response Format
### 8.1 `imageToCode(base64Image, framework, options): Promise<string>`
- **Input:** base64 PNG string, `Framework`, `ConversionOptions` (`{ responsive, semanticHtml, darkMode, a11y }`).
- **Output:** raw code string (markdown fences stripped by `clean()`).
- **Behavior:** Gemini first; on `status === 429` or message matching `quota|rate|limit`, retry with Groq; else rethrow.
- **Errors:** throws `Error`; callers map to user-safe messages (see `technical-guidelines/error-handling.md`).

### 8.2 `Conversion` (domain object, `src/lib/types.ts`)
```ts
interface Conversion {
  id: string
  user_id: string
  original_image_url: string
  original_image_name: string
  framework: Framework
  options: ConversionOptions
  generated_code: string
  status: "pending" | "completed" | "failed"
  error_message: string | null
  created_at: string
}
```

## 9. Endpoints
### 9.1 AI — no endpoint; function call
| Function | Input | Output |
| :--- | :--- | :--- |
| `imageToCode(base64, framework, options)` | base64 PNG, framework, options | code string |

### 9.2 Supabase Auth
| Operation | Function | Notes |
| :--- | :--- | :--- |
| Sign up | `supabase.auth.signUp({ email, password, options: { data: { full_name } } })` | emailRedirectTo = origin |
| Sign in | `supabase.auth.signInWithPassword({ email, password })` | |
| Sign out | `supabase.auth.signOut()` | |
| Session | `onAuthStateChange` + `getSession()` | persisted to localStorage |

### 9.3 Supabase Database (`conversions`) — ⚠ target, not provisioned
> The `conversions` table does not exist in `src/integrations/supabase/types.ts` or any migration. These functions are implemented against an absent table and will error against a real project until it's created (Phase P2).
| Operation | Function |
| :--- | :--- |
| Create | `createConversion(userId, imageUrl, imageName, framework, options, code)` → `.insert(...).select().single()` |
| List | `getConversions(userId)` → `.select("*").eq("user_id").order("created_at", desc)` |
| Get one | `getConversionById(id)` → `.eq("id").single()`; returns `null` on `PGRST116` |
| Delete | `deleteConversion(id)` → `.delete().eq("id")` |

### 9.4 Supabase Storage (`sliceui-images`) — ⚠ target, not provisioned
> The `sliceui-images` bucket is not provisioned in `supabase/`. `uploadSliceImage` will fail until it exists (with public-read or signed URLs).
| Operation | Function | Path |
| :--- | :--- | :--- |
| Upload | `uploadSliceImage(file, userId)` | `{userId}/{timestamp}-{random}.{ext}` |
| Public URL | `getPublicUrl(data.path)` | returns public URL |
| Delete | `deleteSliceImage(imagePath)` | `.remove([path])` |

### 9.5 Profile
| Operation | Function |
| :--- | :--- |
| Fetch | `supabase.from("profiles").select("*").eq("user_id", userId).single()` |

## 10. Webhooks
None configured. Supabase triggers/edge functions are not used by the app.

## 11. Rate Limiting
| Layer | Limit source | Behavior |
| :--- | :--- | :--- |
| Gemini | Free tier ~15 RPM / 1500 req/day | 429 → Groq fallback |
| Groq | Free tier ~30 RPM / 14400 req/day | 429 → surfaces error (no third fallback) |
| App | None (no server-side limiter) | The stale `CLAUDE.md`/`prompt.md` described a 5/day in-memory limiter — **not implemented** in code |

## 12. Success Metrics
- Function signatures stay stable so UI, hooks, and services don't drift.
- Fallback behavior (Gemini → Groq) keeps conversion success high under rate limits.

## 13. Related Documents
- [Architecture](../foundation/architecture.md)
- [Database](database.md)
- [Technical Guidelines — AI Service](../technical-guidelines/ai-service.md)
- [Technical Guidelines — Data Access](../technical-guidelines/data-access.md)

## 14. Open Questions
- Should a real server-side rate limiter be added (as originally described in `prompt.md`)? Currently none.
- Are webhooks / Supabase Edge Functions planned (e.g., for server-side codegen or image normalization)?
- **Provisioning:** when is the `conversions` table + `sliceui-images` bucket going to be created? Persistence endpoints are currently intent-only.
