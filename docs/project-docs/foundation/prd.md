# PRD — SliceUI

## 1. Description
Product requirements for SliceUI: the vision, target users, core value, feature workflows, functional and non-functional requirements, and acceptance criteria.

## 2. Important
- The product name in the codebase is **SliceUI** ("Convert UI to Code"); the HTML `<title>` and social metadata still say **"Triage"** — a leftover that should be fixed.
- **Inferred from codebase:** this PRD is reverse-engineered from `src/pages/Slice.tsx`, `src/lib/*`, and the UI text. Confirm/amend before treating as the source of truth.
- **Persistence + live auth are NOT implemented (confirmed 2026-08-24):** the `conversions` table and `sliceui-images` bucket referenced by the service layer do not exist in the repo. Auth runs in `VITE_BYPASS_AUTH` mock mode. FR-5/FR-6/FR-8 below are **intended** but blocked.
- **Business direction superseded (2026-08-25):** the vision/personas in §7–§9 below describe the original "tool for developers" build. The current direction ("corrected C": a Webmu service brand + a SliceUI tool brand) lives in `foundation/product-spec.md`, which is authoritative for business model, brands, monetization, and decision gates. Treat §7–§9 here as historical context, not active direction.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Vision Statement](#7-vision-statement)
- [8. Target Personas](#8-target-personas)
- [9. Core Business Value](#9-core-business-value)
- [10. User Journeys & App Flow](#10-user-journeys--app-flow)
- [11. Feature Workflows](#11-feature-workflows)
- [12. Functional Requirements](#12-functional-requirements)
- [13. Non-Functional Requirements](#13-non-functional-requirements)
- [14. Acceptance Criteria](#14-acceptance-criteria)
- [15. External Dependencies & Partners](#15-external-dependencies--partners)
- [16. Success Metrics](#16-success-metrics)
- [17. Related Documents](#17-related-documents)
- [18. Open Questions](#18-open-questions)

## 4. Scope
Covers the SliceUI single-page application: image upload, framework selection, AI code generation, history persistence, and account management. Multi-page/multi-image slicing is out of scope.

## 5. Goals
Let a frontend engineer upload a UI screenshot and receive production-ready component code in a chosen framework in seconds, with the output persisted to their account for reuse.

## 6. Non Goals
- Full-app scaffolding (output is always a self-contained component).
- Figma plugin / URL-based image input.
- Streaming output.
- Multi-image or full-page slicing in v1.
- On-premises model hosting (uses hosted Gemini/Groq).

## 7. Vision Statement
Frontend engineers waste time slicing UI screenshots into code. SliceUI turns any screenshot into framework-specific, production-ready component code in one call, so engineers can jump-start new features instead of rebuilding what a designer already drew.

## 8. Target Personas
| Persona | Description | Primary need |
| :--- | :--- | :--- |
| **Frontend engineer** | Works in React/Next/Vue/Svelte/Tailwind; fast-moving feature work. | Instant starting code for a UI they can see but haven't built. |
| **Freelance/agency dev** | Slices client designs across many stacks. | One tool that outputs many frameworks. |
| **Hobbyist / student** | Learning frameworks; wants readable examples. | Clear, self-contained reference components. |

## 9. Core Business Value
Reduce the time from "UI screenshot" to "working component" from hours to seconds, and centralize the user's conversion history in one account.

## 10. User Journeys & App Flow
### 10.1 Entry (all pages public)
```
/ (landing) · /auth · /dashboard · /slice · /settings — all directly visitable without login
```
### 10.2 Core slice journey
```
/slice
  → upload image (drag, click, or Ctrl+V paste)
  → select framework (dropdown: Tailwind, React TSX, Vue 3, Bootstrap 5, HTML+CSS, Next.js, Svelte 5)
  → optional instructions prompt
  → Generate
  → loading: "Analyzing UI layout..." → "Generating <framework> code..."
  → code shown in CodeOutput with copy support
  → image + generated code persisted to Supabase (only when logged in)
```
### 10.3 Account
### 10.3 Account
```
/dashboard (history of conversions)
/settings (profile / sign out)
```

## 11. Feature Workflows
- **Image upload:** drag-and-drop (`handleDrop`), file picker (`handleFileChange`), and clipboard paste (`paste` event) → validated (PNG/JPG/WebP, ≤10MB) → object-URL preview.
- **Framework selection:** dropdown (`FrameworkDropdown`, shadcn Select) in the top control bar listing 7 frameworks (`FRAMEWORKS`).
- **Code generation:** `useConvert` → `imageToCode` (Gemini, fallback Groq) → `CodeOutput` with syntax highlighting.
- **Persistence:** `uploadSliceImage` (storage) → `createConversion` (DB) keyed by `user.id`.
- **History:** `getConversions` (Dashboard), `getConversionById`, `deleteConversion`.

## 12. Functional Requirements
| ID | Requirement | Status |
| :--- | :--- | :--- |
| FR-1 | Accept PNG/JPG/WebP images up to 10MB. | ✅ Implemented (`useImageUpload`) |
| FR-2 | Accept image via drag-drop, file picker, and clipboard paste. | ✅ Implemented |
| FR-3 | Generate code for 7 frameworks. | ✅ Implemented (Tailwind, React TSX, Vue 3, Bootstrap 5, HTML+CSS, Next.js, Svelte 5; `flutter` defined in types but not exposed) |
| FR-4 | Fall back Gemini → Groq on rate limit/quota. | ✅ Implemented (`aiService.ts`) |
| FR-5 | Persist conversion (image + code + framework + options) per user. | 🔴 **Blocked** — service layer targets `conversions` table + `sliceui-images` bucket that don't exist yet (no migration/RLS). Phase P2. |
| FR-6 | View conversion history on Dashboard. | 🔴 **Blocked** — Dashboard fetches via `getConversions` (absent table); also uses `profile.id` while writes use `user.id`. |
| FR-7 | Delete a conversion. | 🔴 **Blocked** — `deleteConversion`/`deleteSliceImage` target unprovisioned resources; no UI hookup. |
| FR-8 | Email/password auth with profile. | 🟡 **Optional/local** — `AuthContext` exists and all routes are public (local-first); persistence requires a session. Live Supabase auth is bypassed via `VITE_BYPASS_AUTH` mock. |
| FR-9 | Optional text prompt ("Add instructions...") sent with the image. | 🟡 UI field exists; not yet passed to `imageToCode` (`handleGenerate` uses `DEFAULT_OPTIONS` only) |

## 13. Non-Functional Requirements
| ID | Requirement | Notes |
| :--- | :--- | :--- |
| NFR-1 | Rate limits on AI usage | Handled client-side via provider 429 → Groq fallback. No server-side quota gate. |
| NFR-2 | Dark/light theme | `next-themes` + `.dark` class; persisted in `localStorage`. |
| NFR-3 | Responsive layout | Mobile-first Tailwind breakpoints; `AppLayout` sidebar collapses via `use-mobile`. |
| NFR-4 | Accessibility | shadcn/ui primitives provide baseline; custom a11y (aria labels on generation) not yet enforced. |
| NFR-5 | Type safety | TypeScript strict; Supabase generated types. |
| NFR-6 | Performance | Images normalized client-side only at upload preview; no server-side sharp normalization in the SPA. |

## 14. Acceptance Criteria
- **AC-1:** A logged-in user can upload an image, pick a framework, and see generated code within ~10s (provider latency dependent).
- **AC-2:** When Gemini returns 429/quota, the app transparently uses Groq without user action.
- **AC-3:** Each completed conversion appears in the user's Dashboard history. ⚠ **Not met today** — persistence unprovisioned (Phase P2).
- **AC-4:** The app works in both light and dark themes without layout breakage.
- **AC-5:** Uploading a non-image or a file >10MB shows a clear validation error, no crash.

## 15. External Dependencies & Partners
- **Google Gemini** (primary AI, vision+codegen, free tier).
- **Groq** (fallback AI vision).
- **Supabase** (auth, Postgres, storage).
- **Vite / React ecosystem** (build, UI).
- **Lovable** (upstream project generator; Lovable Cloud Auth package present).

## 16. Success Metrics
- Time from screenshot upload to usable code.
- % of conversions that complete without manual retry (fallback efficacy).
- % of users who revisit Dashboard to reuse history.

## 17. Related Documents
- [Architecture](architecture.md)
- [Database](../development/database.md)
- [API Contract](../development/api-contract.md)
- [UI/UX](../development/ui-ux.md)

## 18. Open Questions
- Is `flutter` a supported output? It's in `Framework` types and `prompts.ts` rules but **not** in the `FRAMEWORKS` picker array.
- Should the optional instruction prompt (FR-9) actually be sent to the model? Currently it is collected but ignored by `handleGenerate`.
- Should conversions persist in bypass-auth mode? (See getting-started Open Questions.)
- Product name: SliceUI vs leftover "Triage" metadata.
- **Persistence blocker:** who provisions the `conversions` table + `sliceui-images` bucket + RLS, and when? AC-3 depends on it.
