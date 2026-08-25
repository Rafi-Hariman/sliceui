# Technical Guideline — UI/UX

## 1. Summary
Rules for SliceUI UI conventions: shadcn/ui component usage, HSL design tokens, dark-mode handling, and layout patterns (`tailwind.config.ts`, `src/index.css`, `src/components/ui/*`, `src/components/*`).

## 2. Scope
Applies to all UI code in `src/pages/`, `src/components/`, and styling config. Does not cover the AI-generated output components (model behavior) or copy/UX flow (see `development/ui-ux.md`).

## 3. Rules
- **R1 — Semantic tokens only:** use Tailwind token classes (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`, ...). **No raw hex colors in components** — all colors derive from `hsl(var(--x))`.
- **R2 — shadcn/ui primitives:** build on `src/components/ui/*` (Radix-based). Do not hand-roll accordions, dialogs, popovers, selects, toasts, etc.
- **R3 — Dark mode via `.dark`:** the app defaults to dark (`next-themes`). Use Tailwind dark-mode variant (`dark:`) or theme tokens — never a custom `[data-theme]` scheme. Persist preference in `localStorage` key `theme`.
- **R4 — Compact tool chrome:** on the Slice screen, match the established density (`text-[11px]`–`text-[13px]`, `h-7`/`h-9` controls) — do not inflate.
- **R5 — Icon set:** use `lucide-react` only; no icon libraries added.
- **R6 — A11y baseline:** use Radix accessibility; add `aria-label`/`alt` for custom interactive elements. Prefer Radix primitives (e.g. `Select` for the framework picker, `Switch` for option toggles) over bare buttons; decorative charts get `aria-hidden` + a text equivalent.
- **R7 — Theme toggle parity:** theme switching lives in the shared `AppHeader` (via `next-themes`), not per-page `toggleTheme`; `GeneralTab` uses `next-themes` too. Verify both themes per change.

## 4. Preferred Patterns
```tsx
// Preferred: token classes, no hex
<Button variant="ghost" size="sm" className="text-muted-foreground">…</Button>

// Preferred: Radix popover for user menu
<Popover><PopoverTrigger asChild>…</PopoverTrigger><PopoverContent>…</PopoverContent></Popover>

// Preferred: theme via documentElement + localStorage (Slice toggleTheme)
document.documentElement.classList.add("dark"); localStorage.setItem("theme", "dark")
```

## 5. Anti-Patterns
- ❌ `style={{ color: "#0f172a" }}` or arbitrary hex in component classes when a token exists.
- ❌ Reimplementing a Radix primitive (dropdown, modal) from scratch.
- ❌ Using a non-`lucide` icon package.
- ❌ Breaking the sidebar/header `AppLayout` contract (off-canvas on mobile via `use-mobile`).
- ❌ Ignoring the `dark:` variant and shipping a component that only works in one theme.

## 6. Related Docs
- [UI/UX](../development/ui-ux.md)
- [Architecture — ADR design tokens](../foundation/architecture.md)
- [Design tokens source](../development/ui-ux.md#8-design-system)

## 7. Open Questions
- Are the neon/3D decorative components (`Logo3D`, `NeonPatternDefs`, `NeonToggle`) governed by this guideline, or slated for removal?
- Should the bottom "Generations" bar chart be fed from real conversion counts (Dashboard data) instead of static bars?
