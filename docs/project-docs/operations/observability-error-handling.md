# Observability & Error Handling — SliceUI

## 1. Description
How SliceUI observes its runtime behavior and handles errors: logging strategy, error payloads, client-side rules and server fallbacks, metrics, and alerting.

## 2. Important
- **Inferred from codebase:** observability is minimal — `console.warn`/`console.error` in a few places, no metrics/alerts infrastructure.
- All logic runs client-side; "observability" is therefore browser/developer-tools oriented unless a backend or third-party telemetry is added.
- Error handling **is** meaningfully structured in `useConvert` (user-safe taxonomy) and `aiService` (fallback). That's the real contract — codified in `technical-guidelines/error-handling.md`.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Logging Strategy](#7-logging-strategy)
- [8. Standard Error Payloads](#8-standard-error-payloads)
- [9. Global Error Codes](#9-global-error-codes)
- [10. Client-Side Rules & Server Fallbacks](#10-client-side-rules--server-fallbacks)
- [11. Metrics & Dashboards](#11-metrics--dashboards)
- [12. Alerting Rules](#12-alerting-rules)
- [13. Distributed Tracing](#13-distributed-tracing)
- [14. Success Metrics](#14-success-metrics)
- [15. Related Documents](#15-related-documents)
- [16. Open Questions](#16-open-questions)

## 4. Scope
Covers the current error-handling behavior of the conversion pipeline and the recommended observability posture.

## 5. Goals
Ensure every failure in the conversion pipeline is user-understandable and developer-debuggable, and define what telemetry to add.

## 6. Non Goals
Does not set up specific SaaS (Sentry/Datadog) integrations now — this is the contract, not the vendor config.

## 7. Logging Strategy
**Current behavior:**
| Location | Log |
| :--- | :--- |
| `aiService.ts` | `console.warn("Gemini rate limit hit, switching to Groq")` |
| `useConvert.ts` catch | `console.error("Conversion error:", err)` |
| `storageService.ts` | `console.error("Failed to delete image:", error)` |

**Recommended:** a small `logger` util (dev → console; prod → silent or forwarded) so third-party telemetry can be dropped in later. Never log API keys, raw base64 image data, or full generated code at `error` level.

## 8. Standard Error Payloads
There is no formal API error envelope (no HTTP layer). The de-facto contract is **thrown `Error` objects with a user-safe `message`**, mapped at the UI boundary.

Service functions (`conversionService`, `storageService`) throw `Error` with messages like:
```
Failed to create conversion: <supabase message>
Failed to fetch conversions: ...
Failed to upload image: ...
```

## 9. Global Error Codes
No numeric/string error codes exist. Error identity is derived from message matching in `useConvert`:
| Trigger | Matched on |
| :--- | :--- |
| Rate limit / quota | `quota`, `limit` (from `useConvert`); `status === 429`, `quota`, `rate`, `limit` (in `aiService`) |
| API key problem | `API key` |

**Recommended:** introduce stable codes (e.g., `RATE_LIMITED`, `API_CONFIG`, `GENERATION_FAILED`, `STORAGE_FAILED`) if error handling grows.

## 10. Client-Side Rules & Server Fallbacks
### Conversion pipeline (client-side)
```
imageToCode()
  └─ Gemini (primary)
       ├─ ok ─────────────────────────────► return code
       └─ 429 / quota / rate / limit ────► Groq (fallback)
                                             ├─ ok ────────────► return code
                                             └─ error ──────────► rethrow
```
- `useConvert.convert` maps thrown errors → user message; `isLoading`/`loadingMessage` drive the UI ("Analyzing UI layout..." → "Generating <framework> code..." after 1.8s).
- **No server fallback** exists (no backend). If a backend proxy is added later, that becomes the layer for server-side retries, queueing, and rate limiting (per original `CLAUDE.md` design).

### User-safe message mapping (`useConvert`)
| Detected | Shown to user |
| :--- | :--- |
| `quota` / `limit` | "Daily limit reached. Please try again tomorrow." |
| `API key` | "API configuration error. Please check your settings." |
| anything else | raw `error.message` |

## 11. Metrics & Dashboards
**Current:** none.
**Recommended (when a backend/analytics exists):**
- Conversion success rate (completed / attempted) per provider (Gemini vs Groq).
- Fallback rate (how often Groq saves a conversion).
- Latency p50/p95 for `imageToCode`.
- Upload size distribution.
- Error rate by mapped code (§9).

## 12. Alerting Rules
**Current:** none.
**Recommended triggers:**
- Sustained fallback-to-Groq rate > threshold (Gemini unhealthy or over quota).
- Conversion failure rate above baseline.
- Provider 429 bursts.

## 13. Distributed Tracing
- **Not applicable** in a purely client-side app (no distributed system). If a backend proxy + edge functions are introduced, add `x-request-id` propagation and correlate across browser → proxy → provider.

## 14. Success Metrics
- Every user-facing conversion error is a known, mapped message (no raw stack traces in the UI).
- Fallback (Gemini → Groq) is observable via logs/metrics.
- No PII/keys logged.

## 15. Related Documents
- [Technical Guidelines — Error Handling](../technical-guidelines/error-handling.md)
- [Technical Guidelines — AI Service](../technical-guidelines/ai-service.md)
- [API Contract](../development/api-contract.md)

## 16. Open Questions
- Is a third-party observability/error-tracking tool (e.g., Sentry) planned?
- Will a backend proxy be introduced (enabling server-side logging/metrics)?
