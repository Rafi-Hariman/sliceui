# UI/UX & WCAG 2.2 AA Audit — SliceUI

## 1. Description
A developer-facing accessibility and UX audit of the SliceUI interface, against
**WCAG 2.2 AA**, covering **both light and dark mode**. Each finding lists the
criterion, the files, the problem, and the concrete fix — ordered P0 → P3 so an
engineer can work top-to-bottom. Direction: keep the dark-first + indigo
identity; make it consistent and accessible.

## 2. Important
- **Work P0 → P1 → P2 → P3.** P0 are functional bugs that hurt users now; P1 is
  the WCAG spine; P2 is conversion; P3 is system hygiene.
- **Verify in both themes.** Several issues (contrast, focus-offset visibility,
  token collisions) only show in one mode.
- Evidence gathered from the current code: **0** custom focus styles; **21**
  `text-[9–11px]` spots; **5** `<button>` nested in `<Link>`; **11** icon buttons
  with `title` only; **12** hardcoded-color usages.
- Acceptance is an **axe DevTools** pass (0 WCAG-AA issues) **plus** a manual
  keyboard-only pass at 200% zoom, in light and dark (see Verification).

## 3. Table of Contents
- [1. Description](#1-description) · [2. Important](#2-important) · [3. TOC](#3-table-of-contents)
- [4. Scope](#4-scope) · [5. Goals](#5-goals) · [6. Non Goals](#6-non-goals)
- [At-a-glance](#at-a-glance)
- [P0 — Functional UX bugs](#p0--functional-ux-bugs-do-first)
- [P1 — Accessibility (WCAG AA, both themes)](#p1--accessibility-wcag-22-aa--both-themes)
- [P2 — Conversion / UX](#p2--conversion--ux-keep-dark--indigo)
- [P3 — System consistency](#p3--system-consistency)
- [Verification (acceptance)](#verification-acceptance)
- Success Metrics · Related Documents · Open Questions

## 4. Scope
All user-facing pages (`/`, `/auth`, `/slice`, `/dashboard`, `/settings`) and the
shared shell (`AppLayout`, `AppSidebar`), feature components (`CodeOutput`,
`OptionsBar`), and the design-token layer (`index.css`, `tailwind.config.ts`).

## 5. Goals
- Conformance to WCAG 2.2 AA in both themes (focus, names, contrast, targets, structure).
- Fix the functional UX bugs that break trust (Try-again, dead deep-link, stale copy).
- Raise conversion quality of the landing (real before/after hero, pricing) without
  changing the dark+indigo identity.

## 6. Non Goals
- Not a visual rebrand (keep dark + indigo).
- Not AAA conformance (AA only, except where a 44px CTA is trivial to add).
- Not new product features beyond the landing hero/pricing already in the roadmap.

---

## At-a-glance
| ID | Issue | Sev | WCAG | Files |
|----|-------|-----|------|-------|
| P0-1 | "Try again" clears the upload instead of retrying | 🔴 | 3.3.1 | `pages/Slice.tsx` |
| P0-2 | Dashboard row → `/slice?conversion=` deep link is unread (dead nav) | 🔴 | — | `pages/Dashboard.tsx`, `pages/Slice.tsx` |
| P0-3 | Landing copy stale: Flutter, "eight formats", "Gemini Flash", "Get API key" | 🔴 | — | `pages/Landing.tsx` |
| P0-4 | Landing overrides `--primary`→slate (brand flips indigo→gray) | 🔴 | brand | `pages/Landing.tsx` |
| P1-1 | No visible focus indicator on any custom control | 🔴 | 2.4.7 | all pages/components |
| P1-2 | Icon-only buttons have `title` but no `aria-label` (×11) | 🔴 | 4.1.2 | theme/copy/+/trash/avatar |
| P1-3 | `<button>` nested in `<Link>` (×5) — invalid HTML | 🟠 | 1.3.1 / 4.1.2 | `pages/Landing.tsx` |
| P1-4 | Contrast: tiny muted text borderline in both themes | 🟠 | 1.4.3 | 21 spots |
| P1-5 | Targets < 24×24px | 🟠 | 2.5.8 | sidebar avatar `h-5`, some icon btns |
| P1-6 | `Logo3D` canvas has no text alternative | 🟡 | 1.1.1 | `pages/Landing.tsx` |
| P1-7 | Theme toggle not `aria-pressed`; Sun/Moon `absolute` w/o `relative` parent | 🟡 | 4.1.2 | all headers |
| P2-1 | Hero = 3D cube over wireframe mock → replace w/ real before/after | 🟠 | conv. | `pages/Landing.tsx` |
| P2-2 | No pricing on landing (Pro tier exists) | 🟠 | conv. | `pages/Landing.tsx` |
| P2-3 | "R/S/D/A" option badges cryptic, no title | 🟡 | 1.3.1 | `pages/Dashboard.tsx` |
| P2-4 | Loading state thin (no staged progress / output skeleton) | 🟡 | UX | `pages/Slice.tsx` |
| P2-5 | No "Forgot password" link | 🟡 | UX | `pages/Auth.tsx` |
| P3-1 | Two fonts loaded (Geist + Inter) | 🟡 | perf | `index.css`, `tailwind.config.ts` |
| P3-2 | Hardcoded colors bypass tokens (×12) | 🟡 | consistency | `OptionsBar`, `Slice`, `Dashboard`, `CodeOutput` |
| P3-3 | Arbitrary type scale (`text-[9–15px]`) not tokenized | 🟡 | consistency | global |
| P3-4 | Dead `severity-*` tokens (bug-tracker leftover) | ⚪ | hygiene | `index.css`, `tailwind.config.ts` |

---

## P0 — Functional UX bugs (do first)
**P0-1 · "Try again" wipes the upload** — `Slice.tsx` error block: `<Button onClick={clearFile}>Try again</Button>`.
*Fix:* add a `retry()` that calls `convert(file, framework, options)` again (keep `file`); reserve `clearFile` for an explicit "Clear/X" control.

**P0-2 · Dead history deep-link** — Dashboard navigates to `/slice?conversion=<id>`; Slice never reads the query string.
*Fix:* in `Slice.tsx`, `useSearchParams()` → on mount, if `conversion` present, fetch via `getConversionById` (`lib/conversionService.ts`), set `framework`/`code` from it, and load the image preview from `original_image_url`. (Reuses the existing service — no new API.)

**P0-3 · Stale landing copy** — `Landing.tsx`: drop "Flutter"; "eight output formats" → "seven web frameworks"; remove "Powered by Gemini 2.0 Flash"; **delete the "Get API key" CTA** (metered users don't supply keys). Feature grid lists the 7 frameworks.

**P0-4 · Landing re-themes the brand** — `Landing.tsx` `useEffect` sets `--primary`/`--ring`/sidebar vars to `SLATE_HSL`.
*Fix:* remove that effect entirely so the indigo tokens from `index.css` apply consistently. Drop the now-unused `SLATE_*` constants.

---

## P1 — Accessibility (WCAG 2.2 AA) — both themes
**P1-1 · Focus Visible (2.4.7) — CRITICAL, repo-wide.** Zero `focus-visible` styles on custom controls.
*Fix pattern (every raw `<button>`/`<a>`/`[role=button]`):*
`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`.
*Both themes:* `--ring` is indigo (234 55% 58% light / 60% dark) — visible on white and on `#0e0e10`. Prefer the shadcn `Button` (already has focus rings) over raw `<button>`.

**P1-2 · Name, Role, Value (4.1.2).** 11 icon-only buttons expose `title` only.
*Fix:* add `aria-label` — theme toggle ("Switch to dark/light mode" + `aria-pressed={theme==='dark'}`), upload "+" ("Upload image"), copy ("Copy code"), download ("Download code"), trash ("Delete conversion"), avatars (`aria-label={profile?.full_name ?? 'Account'}`). Keep `title` as a tooltip, not the accessible name.

**P1-3 · Nested interactives (1.3.1 / 4.1.2).** `<button>` inside `<Link>` (×5, Landing nav + CTAs) is invalid HTML and double-focusable.
*Fix:* drop the inner `<button>`; style the `<Link>` as the button, or use shadcn `Button asChild` wrapping `<Link>`.

**P1-4 · Contrast (1.4.3) — borderline in both themes.** `muted-foreground` ≈ 4.6:1 (light) / 4.8:1 (dark) — passes AA normal-text but risky at 9–11px.

| Token | Light (now → rec) | Dark (now → rec) | Why |
|-------|-------------------|------------------|-----|
| `--muted-foreground` | 0 0% **45%** → **42%** | 0 0% **50%** → **62%** | small text needs ≥5:1 |
| `--primary` (as text) | 234 55% **58%** → **50%** (`text-primary`) | 234 55% 60% (ok) | indigo on white borderline |
| copy "check" icon | `text-green-600` → `text-success` | `text-green-400` → `text-success` | token guarantees both themes |

*Fix:* bump those tokens; move the 21 `text-[9–11px]` meaningful texts up to a `text-2xs` token (≥12px); keep decorative skeletons as-is. Verify with axe.

**P1-5 · Target Size (2.5.8 min 24×24).** Sidebar avatar `h-5 w-5` (20px) and some `h-6` icon buttons fail.
*Fix:* interactive icons ≥ `h-6 w-6` (24px) minimum; `h-8 w-8` for primary actions. (AAA 2.5.5 = 44px — apply to CTAs where trivial.)

**P1-6 · Logo3D canvas (1.1.1).** No text alternative.
*Fix:* wrap with `role="img" aria-label="SliceUI 3D logo"`, or mark `aria-hidden="true"` once P2-1 removes it.

**P1-7 · Theme toggle semantics.** Add `aria-pressed={theme === 'dark'}`; make the button `relative` so the absolutely-positioned Moon icon anchors to it (currently anchors to the nav). Apply in all three headers (`Slice`, `Dashboard`, `Settings`).

---

## P2 — Conversion / UX (keep dark + indigo)
**P2-1 · Real before/after hero** (replaces 3D cube). A compact looping demo: real screenshot → arrow → generated component (code or live preview); cycle 2–3 real examples (Tailwind card, Vue navbar). Removes P0-4 and P1-6 by construction. Keep the indigo CTA ("Start converting free →").
**P2-2 · Pricing block.** Free vs Pro ($19/mo, 300 credits, Claude) above the footer; "Pro" CTA → `/auth`.
**P2-3 · Option badges.** Replace `R/S/D/A` letters (`Dashboard.tsx`) with short labels/icon row, each with `title`/`aria-label` ("Responsive on").
**P2-4 · Loading state.** In `/slice`, staged copy ("Analyzing layout… → Selecting tokens… → Writing {framework}…") + an output-panel skeleton while generating.
**P2-5 · Forgot password.** Add "Forgot password?" on `Auth.tsx` → Supabase `resetPasswordForEmail`.

---

## P3 — System consistency
**P3-1 · One font.** `index.css` loads Geist **and** Inter; body=Geist, `tailwind font-sans`=Inter. Pick one (recommend **Inter** — already the `sans` stack); remove the other `@import`; align `body` `font-family`.
**P3-2 · Token-only colors.** Replace the 12 hardcoded usages: `OptionsBar` violet → `primary`; framework icons `text-cyan/blue/…` → `text-primary` or `text-muted-foreground` (2-letter glyph carries identity); `Dashboard` `bg-gray-100/dark:bg-gray-800` → `bg-muted`; `CodeOutput` `text-green-600` → `text-success`.
**P3-3 · Type scale.** Define `text-2xs`/`xs`/`sm` tokens; replace arbitrary `text-[Npx]` (the 9–11px meaningful text from P1-4 must move up).
**P3-4 · Prune dead tokens.** Remove `--severity-*` (`index.css`) and the matching `severity.*` map (`tailwind.config.ts`) — bug-tracker leftovers.

---

## Verification (acceptance)
- `npm run dev` → **axe DevTools** on `/`, `/auth`, `/slice`, `/dashboard`, `/settings` in **light and dark** → 0 WCAG-AA / best-practice issues.
- Keyboard-only pass: every action reachable & operable; visible focus ring on every control; no traps; 200% zoom, no horizontal scroll.
- Functional: "Try again" retries without losing the image; Dashboard row opens the conversion in `/slice`; landing shows 7 frameworks, no "Get API key", indigo brand stable across route changes.
- `npm run lint && npx tsc --noEmit -p tsconfig.app.json && npm run test && npm run build` green.

## Success Metrics
- axe: 0 WCAG-AA issues across all pages, both themes.
- Lighthouse Accessibility ≥ 95 on `/` and `/slice`.
- "Try again" and history deep-link functional in a manual smoke test.

## Related Documents
- [ui-ux.md](./ui-ux.md) — design system & screen inventory.
- [prd.md](../foundation/prd.md) — product scope.
- [status.md](../foundation/status.md) — roadmap/risks.

## Open Questions
- AAA target size (44px) on primary CTAs only, or broadly? (Recommended: CTAs only.)
- Should the before/after hero cycle real examples statically, or fetch live from the product? (Static first.)

## Cycle C1 remediation notes

Carried the WCAG 2.2 AA bar onto the new C1 surfaces (History, Dashboard-split,
entitlement indicator, shared `AppHeader`):

- Every new History control (search, framework/range selects, actions menu,
  export) has a visible `focus-visible` ring and an `aria-label`/`title`.
- Icon-only buttons carry `aria-label`; the row actions menu is a Radix
  `DropdownMenu` (keyboard-navigable).
- Delete is confirm-gated (`AlertDialog`), never one-click.
- The entitlement chip is a `role="status"` region with a full-state
  `aria-label`; amber/destructive tones chosen for contrast on both themes.
- `tabular-nums` on the chip so the count doesn't reflow as it increments.
- Theme control is now singular (`next-themes`), removing the duplicated
  per-page toggles that previously drifted from the system theme.
- Open: AAA 44px target on the primary Generate CTA (currently 36px) — parked.
