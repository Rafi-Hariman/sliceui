# Status — SliceUI

## 1. Description
Current state of the SliceUI project: where it stands, recent wins, upcoming focus, roadmap, and known risks.

## 2. Important
- **Inferred from codebase / git history (as of 2026-08-24).** Last commit: `2026-05-11` (`feat: enhance prompt...`). Development appears paused ~3.5 months.
- Root `CLAUDE.md` is stale (describes Next.js); the real app is a Vite React SPA — see `foundation/architecture.md`.
- **Persistence and live auth are NOT wired** (user-confirmed 2026-08-24): the `conversions` table and `sliceui-images` bucket do not exist in the repo's generated Supabase types or any committed migration/RLS. Local dev relies on `VITE_BYPASS_AUTH` mock mode.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Current State](#7-current-state)
- [8. Recent Accomplishments](#8-recent-accomplishments)
- [9. Upcoming Focus](#9-upcoming-focus)
- [10. Key Metrics](#10-key-metrics)
- [11. Roadmap](#11-roadmap)
- [12. Epics](#12-epics)
- [13. Risks/Blockers](#13-risksblockers)
- [14. Success Metrics](#14-success-metrics)
- [15. Related Documents](#15-related-documents)
- [16. Open Questions](#16-open-questions)

## 4. Scope
High-level project health and direction. Tactical execution belongs in PRs and the workflow doc.

## 5. Goals
Give anyone (human or agent) a 60-second picture of where the project is and what's next.

## 6. Non Goals
Does not track daily tasks (use git issues/PRs) or release history (see `foundation/changelog.md`).

## 7. Current State
**Functional slice pipeline; corrected-C business direction set.** The core convert flow works end-to-end: upload → validate → Gemini/Groq → highlighted output. The business now runs two bets on one asset (see `foundation/product-spec.md`): a **Webmu landing-page service** (cash engine) and the **SliceUI tool** (separately-tested product hypothesis). Notable gaps:
- **Persistence gap (confirmed 2026-08-24):** `conversionService.ts`/`storageService.ts` target a `conversions` table and `sliceui-images` bucket absent from `src/integrations/supabase/types.ts` and `supabase/` (only `config.toml`). This is **not** the launch blocker anymore — it is deferred to P3 (tool productization).
- **Auth:** `VITE_BYPASS_AUTH` mock is the current reality; no live Supabase project wired. **Optional-Supabase guard added (2026-08-25):** `supabase` is `null` when env vars are unset → the SPA boots in guest mode (no crash), generation works, persistence skipped. Production deploy unblocked.
- **Instruction prompt:** now wired through to the model (was previously captured but dropped). ✅
- **Design-system input:** added (`ConversionOptions.designSystem` + prompt block + collapsible textarea). ✅
- **Frameworks:** 7 web-only frameworks; `flutter` removed (project is web-focused). ✅
- Dashboard links to `/slice?conversion=<id>` but Slice never reads that param — dead UI path (P3).
- `Dashboard` fetches conversions by `profile.id`, while `useConvert` writes by `user.id` — id-source inconsistency (P3).
- Svelte preview still excluded from `CodeOutput.tsx` `canPreview` (P3).
- `index.html` `<title>`/OG still say "Triage" (P3).
- No automated tests beyond a small prompt/framework suite.

## 8. Recent Accomplishments
- `c52383a` — AI-powered image-to-code conversion service (Gemini + Groq integration, `aiService.ts`).
- `d4246cc` — enhanced prompt for UI screenshot analysis + component generation rules (`prompts.ts`).
- Auth + profile scaffolding via Supabase (`AuthContext`), protected routes.
- Persistence **intent** (service layer targeting `conversions` + `sliceui-images`) — targets not yet provisioned (P3).
- shadcn/ui design system wired (Radix + HSL tokens), dark/light theme.
- `CodeOutput` with Code | Preview tabs + download.
- Local dev bypass mode (`VITE_BYPASS_AUTH`).
- **Business direction formalized** (2026-08-25): `foundation/product-spec.md` + 3 council transcripts; corrected-C re-sequence of phases.
- **AI pipeline enhancements** (2026-08-25): wired instruction prompt, added design-system input, fixed mimeType (no longer hardcoded PNG), Groq timeout/abort, removed `flutter` (web-only).

## 9. Upcoming Focus
1. **P3 — provision Supabase persistence + live auth** — single remaining block: a live Supabase project (all refs NXDOMAIN). Migrations ready in-repo.
2. **P2 — QRIS entity + real WhatsApp number** (user-owned).
3. **P4 — free launch** (channel + timing approval) + first release tag.

## 10. Key Metrics
- **Tests passing:** 8 (prompt + framework + example suites).
- **Lint/build/CI:** lint 0 errors, build green, tsc 0. CI workflow added (`.github/workflows/ci.yml`) — gating lint+test+build on push/PR.
- **Framework outputs:** 7 web-only (flutter removed).
- **AI providers:** 2 (Gemini primary, Groq fallback); production routes through serverless proxy (keys server-side).
- **Persistence:** 0 of 2 targets provisioned (`conversions` table, `sliceui-images` bucket) — migrations ready in-repo, blocked on a live Supabase project.

## 11. Roadmap
- **Phase P1 — Foundation & MVP:** 🟢 done.
- **Phase P2 — Deploy & Webmu Cash Engine:** 🟡 8/9 — deploy ✅, 3 demos ✅, one-pager ✅, sales templates ✅. Remaining: QRIS entity (user) + real WA number.
- **Phase P3 — SliceUI Tool Productization:** 🟢 **Complete 10/10** — live Supabase project `eozcijxcimeqgobbtdvs`: conversions + RLS, sliceui-images bucket + storage policies, types regenerated, auth + persistence + RLS isolation verified via REST.
- **Phase P4 — Quality, Security & Release:** 🟡 6/8 — backend proxy ✅, CI ✅, security scrub ✅ (git grep clean), i18n defer ✅, README + measurement ✅, changelog ✅. Remaining: free launch (STOP) + first release tag (STOP).

## 12. Epics
| Epic | Status | Notes |
| :--- | :--- | :--- |
| Slice pipeline (upload → AI → code) | 🟢 Functional | Core path works; prompt + design-system wired |
| Webmu cash engine (deploy + demo + one-pager) | 🔴 Pending | P2 — revenue-critical |
| Auth + profile | 🟡 Partial | Bypass mock; live Supabase not wired (P3) |
| Persistence (storage + conversions) | 🔴 Not provisioned | Deferred to P3 |
| Dashboard / history | 🔴 Blocked | Depends on persistence; `profile.id` vs `user.id` (P3) |
| Settings | 🟡 Partial | Exists; depends on live auth/profile |
| Quality (tests, CI, a11y) | 🟡 Sparse | 8 tests; CI not wired (P4) |
| Productization (naming, keys security, deploy) | 🟡 Partial | Design-system + prompt done; keys/deploy pending (P2/P4) |

## 13. Risks/Blockers
| Risk | Severity | Notes |
| :--- | :--- | :--- |
| **Live API keys in committed files** | 🟠 Medium | Scrub done 2026-08-25: keys removed from `CLAUDE.md` + tracked `.env` → gitignored `.env.local` only. **Remaining:** old keys still in git history (local-only repo → low; purge if ever pushed) + Gemini rotation pending user action. |
| **Client-side AI keys** | 🟠 Medium | Keys ship to browser; abuse/cost risk (ADR-001). |
| **No live Supabase project** | 🟠 Medium | Auth/persistence untested against real backend; persistence targets absent. |
| **Unprovisioned persistence** | 🟠 Medium | `conversions`/`sliceui-images` missing → history + save will fail against a real project. Deferred to P3 (does not block the P2 cash engine). |
| **Stale root CLAUDE.md + prompt.md** | 🟡 Low | Both describe the Next.js App Router plan; `prompt.md` is the legacy build prompt. Recommend rewrite or pointer to `docs/project-docs/`. |
| **No CI or real tests** | 🟡 Low | Regressions risk as feature surface grows. |

## 14. Success Metrics
- `conversions` table + `sliceui-images` bucket provisioned with migrations + RLS; generated types updated.
- Live Supabase project connected and bypass flag removed safely.
- Zero committed secrets; keys only in gitignored `.env.local`.
- Green lint + tests + build in CI.
- Docs in `docs/project-docs/` match the code.

## 15. Related Documents
- [PRD](prd.md)
- [Workflow](workflow.md)
- [Changelog](changelog.md)
- [Phases](phases/index.md)
- [Security & Compliance](../operations/security-compliance.md)

## 16. Open Questions
- Is the project actively being resumed, or archived/paused? (This drives whether roadmap items are "now" or "later".)
- Who owns the Supabase project and key rotation?
- Should `prompt.md` (legacy build prompt) be preserved as a historical spec, or removed once the Next.js plan is fully superseded?
