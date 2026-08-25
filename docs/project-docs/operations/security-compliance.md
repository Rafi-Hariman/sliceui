# Security & Compliance — SliceUI

## 1. Description
Security posture and compliance considerations for SliceUI: threats, access control, key handling, data privacy/retention, and audit logging.

## 2. Important
- **Known critical issue:** live API keys are committed in files — the root `CLAUDE.md` hardcodes Gemini/Groq/Supabase keys, and `.env` (with `VITE_*` keys) is modified/untracked. **Rotate all keys and remove them from source control before any release.**
- AI keys are `VITE_*` → **browser-exposed by design** (ADR-001). This is a fundamental architectural constraint.
- **Inferred from codebase:** many rules below are the target posture; some are not yet implemented (no RLS policies in-repo, no audit logging).

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Security Objectives & Threats](#7-security-objectives--threats)
- [8. Access Control & RBAC](#8-access-control--rbac)
- [9. Data Encryption & Privacy](#9-data-encryption--privacy)
- [10. Data Retention](#10-data-retention)
- [11. Audit Logging](#11-audit-logging)
- [12. Compliance Audits & Legal Disclaimers](#12-compliance-audits--legal-disclaimers)
- [13. Success Metrics](#13-success-metrics)
- [14. Related Documents](#14-related-documents)
- [15. Open Questions](#15-open-questions)

## 4. Scope
Covers app-level security: API key handling, Supabase access control, user data handling, and AI-content considerations.

## 5. Goals
Ship without committed secrets, scope data to the owning user, and document the client-side-key tradeoff honestly.

## 6. Non Goals
Does not cover infrastructure hardening of Supabase/Vercel themselves (managed providers), nor a full compliance certification program.

## 7. Security Objectives & Threats
### Objectives
1. No secrets in source control.
2. Users can only read/write their own `conversions` + `profiles`.
3. AI provider keys are identifiable/rotatable and scoped where possible.
4. User-uploaded images don't leak between users.

### Threat model
| Threat | Vector | Mitigation |
| :--- | :--- | :--- |
| Secret leakage | Committed `CLAUDE.md`/`.env`, logs | Rotate keys; gitignore `.env*`; scrub docs |
| Key abuse / cost | Public `VITE_*` keys | Provider key restrictions (allowed origins/referrers), quotas, rotation; consider proxy (ADR-001) |
| IDOR on conversions | Guess/iterate `user_id`/id | RLS policy `user_id = auth.uid()` on `conversions` + `profiles` |
| Cross-user image access | Public storage bucket | Private bucket + signed URLs, or RLS storage policy scoping to owner |
| Prompt injection from image | AI vision input | Treat model output as untrusted; never auto-execute generated code |
| Malicious upload | SVG/HTML disguised as image | Client validation (PNG/JPG/WebP, ≤10MB) + server-side MIME sniffing if a proxy is added |

## 8. Access Control & RBAC
- **Auth:** Supabase email/password. **All routes are public (local-first)** — there is no client-side route guard; real access control is delegated to Supabase RLS (below). Persistence (`useConvert`) runs only when a session exists.
- **RLS (target — not yet in repo):**
  - `profiles`: select/update where `user_id = auth.uid()`.
  - `conversions`: select/insert/update/delete where `user_id = auth.uid()`.
  - `sliceui-images`: private bucket, access via signed URLs owned by `auth.uid()`.
- **Roles:** no custom roles used by the app (scaffold has `user_roles` table but it's unused).

## 9. Data Encryption & Privacy
- **In transit:** HTTPS (Supabase + AI providers + host).
- **At rest:** managed by Supabase/Vercel.
- **AI content:** images + prompts are sent to **third-party AI providers** (Google/Groq) — users must consent; provider privacy policies apply.
- **Generated code** may contain data from screenshots (e.g., text/design) — stored in `conversions.generated_code`. Treat as user content.
- **Personal data:** email, name (`profiles`). Minimal collection; no analytics events found in code.

## 10. Data Retention
- No explicit retention/expiry policy in code. `conversions` grow unbounded per user.
- **Recommended:** document retention (e.g., keep history while account active; offer delete); provide user-facing "delete conversion" (service exists) and full account deletion.
- Storage objects should be deleted when a conversion is deleted (`deleteSliceImage` exists).

## 11. Audit Logging
- None implemented. Client-side only.
- **Recommended:** Supabase RLS + server-side row timestamps (`created_at`) give basic audit; add edge-function logging or a lightweight `activity_log` (table already exists in scaffold) if needed for compliance.

## 12. Compliance Audits & Legal Disclaimers
- **Not** under a compliance regime (no SOC2/HIPAA/etc. scope identified).
- **Needed before public launch:**
  - Privacy policy covering third-party AI data processing.
  - Terms of service for AI-generated content.
  - Clear indication in-app that generated code is AI output and should be reviewed by an engineer.
- Confirm compliance needs with project owner.

## 13. Success Metrics
- `grep -r` for keys in tracked files returns nothing; `.env*` gitignored.
- RLS policies committed for `profiles`, `conversions`, storage.
- Key rotation + provider restrictions documented and applied.

## 14. Related Documents
- [Architecture](../foundation/architecture.md)
- [Database](../development/database.md)
- [Production Runbook](production-runbook.md)
- [Status](../foundation/status.md)

## 15. Open Questions
- Will AI calls move behind a server proxy (fixes key exposure + rate limiting)? See ADR-001.
- Who authorizes rotation of the leaked Gemini/Groq/Supabase keys?
- Privacy policy / ToS owner?
