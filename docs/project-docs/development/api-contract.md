# API Contract - SliceUI

## 1. Description

SliceUI has **no API of its own** (no backend). This document captures the
**external** contracts the app depends on: the in-browser Gemini + Groq vision
calls and the Supabase client APIs (auth, PostgREST, storage). It also records
the env variables that configure them.

## 2. Important

- Calls to Gemini and Groq are made **from the browser**; the keys are
  client-visible. Treat the "auth" below as API-key auth, not user-scoped.
- All keys are `VITE_*` env vars (bundled into the client). Never assume secrecy.
- Model identifiers are **aliases** (`gemini-flash-latest`) or specific
  (`pixtral-12b-2409`); aliases can change upstream - pin for reproducibility.

## 3. Table of Contents

- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [Base URL & Auth](#base-url--auth)
- [Request/Response Format](#requestresponse-format)
- [Endpoints](#endpoints)
- [Webhooks](#webhooks)
- [Rate Limiting](#rate-limiting)
- [Success Metrics](#success-metrics)
- [Related Documents](#related-documents)
- [Open Questions](#open-questions)

## 4. Scope

External integrations (Gemini, Groq, Supabase) and their request/response
shapes as invoked by `src/lib/aiService.ts`, `src/lib/storageService.ts`,
`src/lib/conversionService.ts`, and `src/contexts/AuthContext.tsx`.

## 5. Goals

- Document the exact calls so they can be mocked in tests and migrated to a
  server later without surprise.
- Make key/secret handling explicit.

## 6. Non Goals

- Not documenting the third-party providers' full APIs (link to their docs).
- Not defining a SliceUI REST API (none exists).

## Base URL & Auth

| Integration | Base URL | Auth |
| :--- | :--- | :--- |
| Gemini | `https://generativelanguage.googleapis.com` (via SDK) | API key `VITE_GEMINI_API_KEY` |
| Groq | `https://api.groq.com/openai/v1` (OpenAI-compatible, via SDK) | Bearer `VITE_GROQ_API_KEY` (`dangerouslyAllowBrowser`) |
| Supabase | `VITE_SUPABASE_URL` (PostgREST + Storage + Auth) | Publishable/anon key `VITE_SUPABASE_PUBLISHABLE_KEY` (+ user JWT after sign-in) |

## Request/Response Format

### Gemini - `generateContent` (multimodal)

- **Request parts:** `[ promptString, { inlineData: { mimeType: "image/png",
  data: <base64> } } ]`.
- **Model:** `gemini-flash-latest`.
- **Response:** `result.response.text()` → raw string (may include code fences,
  stripped by `clean()`).

### Groq - `chat.completions.create` (OpenAI shape)

- **Messages:** single `user` message with `content: [ {type:"text", text:
  prompt}, {type:"image_url", image_url:{ url: "data:image/png;base64,<b64>" }} ]`.
- **Model:** `pixtral-12b-2409`; **`max_tokens`: 4096**.
- **Response:** `res.choices[0].message.content` → string → `clean()`.

### Supabase (selected, used by code)

- **Auth:** `supabase.auth.signUp({ email, password, options:{ data:{ full_name
  } } })`, `signInWithPassword`, `signOut`, `onAuthStateChange`, `getSession`.
- **PostgREST:** `conversions` insert/select (`conversionService.ts`);
  `profiles` select (`AuthContext`).
- **Storage:** `storage.from("sliceui-images").upload(path, file, {cacheControl,
  upsert:false})` + `getPublicUrl(path)`; `.remove([path])`.

## Endpoints

N/A as REST routes - all access is via SDKs. The only "endpoint" the app exposes
is the SPA route `/slice` (UI), not an API.

## Webhooks

None. The app is purely request/response and pull-based (no inbound webhooks).

## Rate Limiting

- **SliceUI-side:** none (no server). The `CLAUDE.md` "5/day per IP" limiter was
  never implemented.
- **Provider-side (free tiers):**
  - Gemini 2.0 Flash free: ~15 RPM, ~1,500 req/day (per CLAUDE.md; verify
    current quotas).
  - Groq free: ~30 RPM, ~14,400 req/day (per CLAUDE.md; verify).
- **Fallback rule:** on Gemini `status === 429` or message includes
  `quota`/`rate`/`limit`, and a Groq key is set, switch to Groq for that call.

## Planned: `/api/convert` (Not Implemented)

> ⚠️ This endpoint **does not exist** in the current codebase (the app is a
> Vite SPA with client-side AI calls). It is the intended server-side contract
> from the original Next.js build spec
> ([`reference/prompt.md`](../reference/prompt.md) PROMPT 4), `CLAUDE.md`, and
> the QA plan ([`reference/QA_TEST_DOCUMENT.md`](../reference/QA_TEST_DOCUMENT.md)
> §6). It is the target for **Phase P1** (see
> [`foundation/phases/phase-P1-security-hardening.md`](../foundation/phases/phase-P1-security-hardening.md)).

- **Route:** `POST /api/convert` - Next.js App Router, `runtime = "nodejs"`,
  `maxDuration = 60`.
- **Auth (target):** user JWT required - `401 unauthorized` /
  `401 token_expired` (QA API-006/007). Aligns with the resolved auth-gate
  decision (login required).
- **Request:** multipart form - `image` (File), `framework` (Framework),
  `options` (JSON string of `ConversionOptions`).
- **Server-side normalization:** `sharp` resize ≤1600px (fit inside, no
  enlargement) → PNG → base64, before calling the AI provider.
- **Rate limiting (target):** in-memory (Redis later) - 5 free conversions/day
  per IP via `x-forwarded-for` / `x-real-ip`; over limit →
  `429 daily_limit_reached`.
- **Error responses:** `400 missing_image` / `missing_framework` /
  `invalid_framework` / `invalid_image_format` / `invalid_image_data`;
  `429 daily_limit_reached`; `500 generation_failed` (provider timeout/failure).
- **Success response:** `200 { code }` (QA also shows `{ code, success: true }`
  - pick one when implementing).

Adopting this moves AI keys server-side (fixes the client-side key exposure
risk) and reintroduces the rate limiter the CLAUDE.md plan specified.

## Success Metrics

- Fallback path triggers reliably on 429.
- Clear user-facing messages for quota/config errors (implemented in
  `useConvert`: "Daily limit reached...", "API configuration error...").

## Related Documents

- [architecture.md](../foundation/architecture.md) - system flow + ADR-2.
- [database.md](./database.md) - Supabase schema/storage.
- [testing.md](./testing.md) - what to mock.

## Open Questions

- Move keys behind an edge function (recommended) - what shape should that
  thin proxy take (single `/api/convert` + rate limit)?
- Pin Gemini/Groq model versions instead of aliases?
- Enforce a SliceUI-side rate limit once a server exists?
