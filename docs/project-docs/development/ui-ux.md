# UI/UX — SliceUI

## 1. Description
Design rules and conventions for SliceUI: design system, tokens, layout patterns, component usage, responsive behavior, and accessibility baseline.

## 2. Important
- **Inferred from codebase:** tokens and patterns below come from `tailwind.config.ts`, `src/index.css`, and `src/components/ui/*` (shadcn/ui).
- Design system is **shadcn/ui + Tailwind** with HSL CSS variables; dark mode via `.dark` class + `next-themes`.
- Several scaffold pages (Dashboard, Landing) include decorative 3D/neon components (`Logo3D`, `NeonPatternDefs`, `NeonToggle`) that are **not part of the core slice UX** — treat as leftover styling.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Design Philosophy](#7-design-philosophy)
- [8. Design System](#8-design-system)
- [9. Wireframing](#9-wireframing)
- [10. Screen Layouts](#10-screen-layouts)
- [11. Component Library](#11-component-library)
- [12. Responsive](#12-responsive)
- [13. Accessibility (A11y)](#13-accessibility-a11y)
- [14. Design Handoff](#14-design-handoff)
- [15. Success Metrics](#15-success-metrics)
- [16. Related Documents](#16-related-documents)
- [17. Open Questions](#17-open-questions)

## 4. Scope
Covers the visual language and component conventions for the SliceUI app, plus the layout of the core screens.

## 5. Goals
Keep UI consistent, accessible, and easy to extend by documenting the token system and component usage rules.

## 6. Non Goals
Does not define the AI-generated *output* component aesthetics (that's model behavior), nor marketing/brand collateral.

## 7. Design Philosophy
- **Utility-first with semantic tokens** — no hardcoded colors in components; use `hsl(var(--x))` tokens via Tailwind classes (`bg-background`, `text-muted-foreground`, `border-border`, etc.).
- **Dark-first** — `defaultTheme="dark"`, both themes fully supported.
- **Dense, tool-like** — the Slice screen favors compact controls (small text `text-[11px]`, `h-7`/`h-9` buttons) over marketing spacing.
- **Clean workspace** — top control bar (input) + full-height code canvas (output) + thin bottom usage bar, minimal chrome. Mirrors the layout of vibe-coding app builders.

## 8. Design System
### 8.1 Tokens (HSL CSS variables, `src/index.css`)
| Token | Light | Notes |
| :--- | :--- | :--- |
| `--background` | `0 0% 100%` | Page bg |
| `--foreground` | `0 0% 9%` | Text |
| `--primary` | `234 55% 58%` | Indigo-ish brand; also `--ring` |
| `--secondary` | `0 0% 96%` | |
| `--muted` / `--muted-foreground` | `0 0% 96%` / `0 0% 45%` | |
| `--destructive` | `345 72% 51%` | Errors |
| `--success` | `142 70% 40%` | Success |
| `--warning` | `38 92% 50%` | Warning |
| `--info` | `199 89% 48%` | Info |
| `--border` / `--input` | `0 0% 90%` | |
| `--radius` | `0.375rem` | Border radius |
| `--sidebar-*` | various | Sidebar surface |
| `--severity-*` | critical/high/medium | Triage-style severity tokens (scaffold leftover) |

### 8.2 Exposed Tailwind colors
`border`, `input`, `ring`, `background`, `foreground`, `primary`(+fg), `secondary`(+fg), `destructive`(+fg), `success`(+fg), `warning`(+fg), `info`(+fg), `muted`(+fg), `accent`(+fg), `sidebar-*`, `card`, `popover`.

### 8.3 Typography
- Fonts: **Geist** + **Inter** (Google Fonts, imported in `index.css`).
- Compact sizes used on Slice: `text-[13px]` headings, `text-[11px]`/`text-[10px]` labels.

## 9. Wireframing
The Slice screen follows a **vibe-coding app-builder layout**: a compact top control bar, a full-bleed code canvas, and a thin usage bar at the bottom.
```
┌────────────────────────────────────────────────────────────┐
│ Header: [Slice · Screenshot→code]       [theme] [avatar▾]  │
├────────────────────────────────────────────────────────────┤
│ Top bar: [＋][img] [ prompt…            ][⟳ Generate]      │
│          [Framework ▾] [☐Responsive ☐Semantic ☐Dark ☐A11y] │
├────────────────────────────────────────────────────────────┤
│  Main canvas:  Empty state / Loading spinner               │
│                CodeOutput (Code | Preview tabs)            │
│                Error + retry                                │
├────────────────────────────────────────────────────────────┤
│ Bottom bar: [✦ Generations] [ ▁▂▄▆ bar chart ]  [5/1500]  │
└────────────────────────────────────────────────────────────┘
```
The image upload, prompt, framework dropdown, and options all live in the top bar (stacking to a vertical column on small screens); the previous left panel with framework cards and thumbnail is removed.

## 10. Screen Layouts
| Screen | Route | Layout |
| :--- | :--- | :--- |
| Index / Landing | `/` | Marketing/landing — hero + product mockup (Logo3D), social-proof strip, features, testimonials, final CTA |
| Auth | `/auth` | Split-screen: brand/feature panel (lg+) + centered form card; Google OAuth + email tabs |
| Dashboard | `/dashboard` | AppLayout + stat cards + framework charts (bar/pie) + conversions table; skeleton loading; "New conversion" CTA |
| **Slice** | `/slice` | AppLayout; top control bar + full canvas + bottom usage bar (see §9) |
| Settings | `/settings` | AppLayout + vertical tab nav (Profile/Company/Team/Notifications/General) + card-based content |
| NotFound | `*` | Fallback |

**AppLayout:** shared shell — `AppSidebar` (collapsible desktop, Sheet on mobile) + `AppHeader` (title, page actions, theme toggle, user menu) + `<main>`. Pages pass `title`/`actions` props instead of re-implementing the header.

## 11. Component Library
- **shadcn/ui** components in `src/components/ui/*` (Radix-based): button, card, dialog, dropdown-menu, select, popover, avatar, textarea, tabs, switch, sidebar, toaster, tooltip, etc.
- **Domain components:**
  - `UploadZone` — image drop target
  - `FrameworkDropdown` — framework selector (shadcn Select) with per-framework icon badges + description
  - `OptionsBar` — conversion toggles (shadcn Switch: Responsive / Semantic / Dark mode / A11y)
  - `CodeOutput` — syntax-highlighted code with Code | Preview tabs, copy, download, and line count
  - `LoadingState` — progress feedback
  - `GenerateButton` — trigger
  - `AppLayout` (shell), `AppHeader` (shared title/theme/user menu), `AppSidebar` — app chrome
- **Icons:** `lucide-react`.

## 12. Responsive
- **Mobile-first** Tailwind breakpoints (`sm:`, `md:`, `lg:`).
- Sidebar collapses (off-canvas) below breakpoint via `use-mobile`.
- Slice screen uses `flex` + `min-h-0` overflow handling for panels.
- Verify at 375px and desktop before merge (manual check).

## 13. Accessibility (A11y)
- Baseline provided by shadcn/ui/Radix primitives (focus rings, ARIA roles, keyboard nav).
- Theme toggle buttons carry `title` tooltips; avatar popover uses accessible Radix `Popover`.
- **Gaps to close:** generation error uses color-only styling (`text-destructive`); confirm labels/`alt` on image preview. The framework picker is a Radix `Select` (accessible by default), and the bottom usage chart is `aria-hidden` decoration with a text equivalent.
- Generated-code output should strive for the `a11y` conversion option where enabled.

## 14. Design Handoff
- No Figma/Sketch link documented. Design tokens live in `tailwind.config.ts` + `src/index.css`; component inventory in `src/components/ui/`.
- For a formal design system audit, the `ui-styling` / `ui-ux-pro-max` skills can be applied on request.

## 15. Success Metrics
- New screens reuse existing tokens and `ui/*` components (no ad-hoc color hex).
- Dark/light parity and mobile layout verified per PR.
- Accessibility gaps tracked and closed.

## 16. Related Documents
- [Architecture](../foundation/architecture.md)
- [PRD](../foundation/prd.md)
- [Technical Guidelines — UI/UX](../technical-guidelines/ui-ux.md)

## 17. Open Questions
- Are the neon/3D decorative components (`Logo3D`, `NeonPatternDefs`, `NeonToggle`) to be kept or removed?
- Should the `flutter` framework card be added to the picker for UI parity with `types.ts`?
