# UI/UX — SliceUI

## 1. Description

Design system and screen inventory for SliceUI. The UI is a **shadcn/ui (Radix)
+ Tailwind** app with HSL design tokens, dark-mode-first theming, and a 3D
accent logo. This document captures the implemented design language (Inferred
from `tailwind.config.ts`, `src/index.css`, and components).

## 2. Important

- **Dark mode is the default** (`ThemeProvider defaultTheme="dark"`,
  `attribute="class"`). Light tokens exist but dark is the product's primary
  surface.
- Some design tokens (`severity-critical/high/medium/low`, sidebar variants)
  are **leftovers from the bug-tracker template** the project was derived from
  (consistent with the stale Supabase types). They are harmless but unused by
  SliceUI's actual features.
- Fonts **Inter** and **Geist** are both imported; `fontFamily.sans` resolves to
  the Inter stack. Confirm which is canonical and drop the other.

## 3. Table of Contents

- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [Design Philosophy](#design-philosophy)
- [Design System](#design-system)
- [Wireframing](#wireframing)
- [Screen Layouts](#screen-layouts)
- [Component Library](#component-library)
- [Responsive](#responsive)
- [Accessibility (A11y)](#accessibility-a11y)
- [Design Handoff](#design-handoff)
- [Success Metrics](#success-metrics)
- [Related Documents](#related-documents)
- [Open Questions](#open-questions)

## 4. Scope

Design tokens, theming, layout, core screens, and the component library. Covers
the SliceUI app shell, not the generated output's styling (which is
framework-specific and model-authored).

## 5. Goals

- A consistent, themeable, dark-first interface.
- Reusable primitives via shadcn/ui so screens stay uniform.
- Accessible-by-default controls (Radix).

## 6. Non Goals

- Not a pixel-perfect design spec (no Figma source in-repo).
- Not designing the generated code's look (that mirrors the input screenshot).

## Design Philosophy

- **Utility-first + tokens:** Tailwind utilities for layout/spacing; HSL CSS
  variables for color so themes swap without recompiling utility classes.
- **Calm, focused tool UI:** the `/slice` workspace is the product; marketing
  (`/`) is secondary.
- **Dark-first:** dark surfaces with an indigo primary and neon/3D accents
  (`NeonToggle`, `Logo3D`, `NeonPatternDefs`).

## Design System

- **Base:** shadcn/ui, `style: default`, `baseColor: slate`, `cssVariables:
  true`, `rsc: false`, `tsx: true` (`components.json`).
- **Theming:** `darkMode: ["class"]`; tokens in `src/index.css` under `:root`
  (light) and `.dark`.
- **Key tokens (HSL):**
  - `--primary` `234 55% 58%` (light) / `234 55% 60%` (dark) — indigo.
  - `--ring` mirrors primary.
  - Semantic: `--success 142 70% 40%`, `--warning 38 92% 50%`, `--info 199 89%
    48%`, `--destructive 345 72% 51%`.
  - Surfaces: `--background`, `--card`, `--popover`, `--muted`, `--secondary`,
    with matching `-foreground`.
- **Radius:** `--radius: 0.375rem`; `lg/md/sm` derive from it.
- **Type:** Inter stack (`sans`); custom `text-2xs` (0.6875rem).
- **Layout:** centered container, `padding: 2rem`, max `2xl: 1400px`.
- **Motion:** `tailwindcss-animate`; accordion keyframes; spinner in loading
  states.

## Wireframing

No Figma/source wireframes in-repo (TBD). Current screens are the de-facto
reference; capture screenshots into this doc when formalizing handoff.

## Screen Layouts

| Route | Purpose | Key elements |
| :--- | :--- | :--- |
| `/` (Index/Landing) | Marketing + entry | Hero, CTA into product (`Landing.tsx`/`Index.tsx`) |
| `/auth` | Sign in / sign up | Email + password (react-hook-form + zod) |
| `/slice` | Core converter | Upload zone, framework picker, options bar, generate, CodeOutput (code/preview tabs) |
| `/dashboard` | History | List of past conversions (`getConversions`) |
| `/settings` | Profile/preferences | `Settings.tsx` |
| `*` | 404 | `NotFound.tsx` |

Shared chrome: `AppLayout`, `AppSidebar`, `NavLink`, `ThemeToggle`/`NeonToggle`,
`StackedLogo`/`Logo3D`.

## Component Library

- **App primitives (`src/components/ui/`):** full shadcn set — accordion,
  alert-dialog, avatar, button (via cva), card, dialog, dropdown, tabs, select,
  tooltip, toast/sonner, table, form, etc.
- **Feature components (`src/components/`):** `UploadZone`, `FrameworkPicker`,
  `OptionsBar`, `CodeOutput`, `LoadingState`, plus brand pieces
  (`Logo3D`, `NeonPatternDefs`, `StackedLogo`).
- **Code rendering:** `react-syntax-highlighter` (Prism, `oneDark` theme with
  transparent backgrounds) in `CodeOutput`.

## Responsive

- Tailwind mobile-first; option rule "responsive" instructs the **generated
  output** to add breakpoints (`sm:`/`md:`/`lg:`) — this is about output, not
  the app shell.
- App shell responsive behavior is inherited from shadcn/container defaults;
  TBD explicit breakpoint testing for `/slice` on narrow screens.

## Accessibility (A11y)

- **App shell:** built on Radix primitives (keyboard support, roles, focus
  management out of the box); `TooltipProvider` wraps the app.
- **Generated output:** the `a11y` option asks the model to emit `aria-label`,
  `role`, `alt`.
- **Gaps:** preview iframe relies on `sandbox="allow-scripts"` (no
  `allow-same-origin`) — verify it remains accessible/usable; color contrast of
  generated code is theme-dependent.

## Design Handoff

- Source of truth today: the code itself (`tailwind.config.ts`, `index.css`,
  `components/ui/*`). No design file is checked in.
- When adding a designer: export tokens from `src/index.css` and document the
  shadcn base (`slate`, `default` style) as the starting palette.

## Success Metrics

- All core screens render correctly in dark and light.
- No Radix a11y warnings in the app shell.
- Design tokens free of unused leftovers (drop `severity-*` if unneeded).

## Related Documents

- [architecture.md](../foundation/architecture.md) — component/module layout.
- [prd.md](../foundation/prd.md) — feature workflows per screen.
- [status.md](../foundation/status.md) — template-leftover tokens noted.

## Open Questions

- Canonical font: Inter or Geist? (Both imported today.)
- Keep the bug-tracker-derived `severity-*` and sidebar tokens, or prune them?
- Add a Figma/design source and formal wireframes?

## Cycle C1 — History, Dashboard-split, Entitlement

New/changed screens shipped in [Cycle C1](../foundation/phases/c1/c1-ui-ux.md):

- **Sidebar** — `Dashboard · Slice · History · Settings` (Dashboard is the
  post-login landing). Single source in `AppSidebar.navItems`.
- **History (`/history`)** — dedicated conversions list (extracted out of the
  Dashboard). Toolbar: search · framework `<Select>` · date-range `<Select>`
  (7d/30d/All) · Export-all. Per-row actions menu: Open · Regenerate · Copy ·
  Download · Export JSON · Delete (confirm-gated). States: empty CTA, skeleton
  rows, "filtered to 0" with Clear-filters.
- **Dashboard split** — analytics only now: stat cards (Total / This month /
  Frameworks / Success rate) + framework bar/pie charts + a top-5 **Recent
  activity** panel linking to `/slice?conversion=<id>` with a "View all →"
  link to History. Empty state CTA → `/slice`.
- **Entitlement indicator** — header chip (shared `AppHeader`): free
  `used / 5 today`, pro `N credits`. Tone: neutral → amber (near-limit/pro-low)
  → destructive (exhausted); full state in `aria-label`; tooltip explains reset.
- **Consolidated header** — one theme toggle (via `next-themes`) + avatar popover
  (Settings + Sign out) shared by Dashboard/Slice/History via `AppHeader`,
  replacing the per-page `toggleTheme` copies.
