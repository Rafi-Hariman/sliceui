# Guideline - Code Style & Conventions

## 1. Summary

SliceUI-specific style rules that go beyond the ESLint/Tailwind defaults:
naming, file layout, the `@` path alias, and import ordering. Inferred from
codebase conventions; ESLint flat config (`eslint.config.js`) is the enforcer.

## 2. Scope

Applies to all TypeScript/TSX under `src/`. Complements (does not replace) the
ESLint config, Prettier/editor settings, and shadcn defaults.

## 3. Rules

- **R1 - Path alias.** Import via `@/...` (resolves to `src/`), configured in
  `vite.config.ts`, `tsconfig*`, and `vitest.config.ts`. Avoid deep relative
  paths (`../../..`) when an alias exists.
- **R2 - File naming.**
  - Components: `PascalCase.tsx` (`CodeOutput.tsx`, `UploadZone.tsx`).
  - shadcn primitives: lowercase-hyphen (`alert-dialog.tsx`) under
    `src/components/ui/`.
  - Hooks: `use-thing.ts` or `useThing.ts` - **both exist today** (`use-mobile.tsx`,
    `useImageUpload.ts`); pick one and migrate (see Open Questions).
  - Services: `*Service.ts` (`conversionService.ts`, `storageService.ts`).
  - Pages: `PascalCase.tsx` under `src/pages/`.
- **R3 - Export style.** Feature components/hooks default-export; shadcn
  primitives use named exports; services use named exports.
- **R4 - Types live in `src/lib/types.ts`.** Domain types (`Framework`,
  `ConversionOptions`, `Conversion`) are centralized there, not scattered.
- **R5 - Strict TypeScript.** `tsconfig` is strict-ish; `npm run build` must
  stay green. Prefer `unknown` over `any` in `catch` (the codebase already
  uses `catch (err: unknown)` in `aiService`).
- **R6 - Styling.** Tailwind utilities + HSL CSS-variable tokens only; no
  inline color literals in the app shell (use tokens). `cn()` from
  `@/lib/utils` for conditional classes.
- **R7 - Keep the Lovable scaffolding intentional.** `lovable-tagger` is
  dev-only (gated on `mode === "development"`); do not enable it in production
  builds.

## 4. Preferred Patterns

- Group by feature: `pages` → `components` (feature) + `components/ui`
  (primitives) → `hooks` → `lib` (services/types/pure logic) →
  `integrations` (external clients).
- Co-locate a component's test beside it (`Foo.test.tsx`) per Vitest `include`.
- Default-export the page/component; import named helpers/types.

## 5. Anti-Patterns

- ❌ Mixing hook filename styles (`use-foo` vs `useFoo`).
- ❌ Relative imports where `@/` applies.
- ❌ `any` to silence type errors (fix the type or regenerate Supabase types).
- ❌ Hard-coded hex colors in the app shell (use design tokens).
- ❌ Leaving `console.*` in committed code beyond intentional warnings (e.g.
  the Groq-fallback `console.warn`).

## 6. Related Docs

- [workflow.md](../foundation/workflow.md) - lint/build gates.
- [ui-ux.md](../development/ui-ux.md) - token/color usage.
- [testing.md](../development/testing.md) - test file conventions.

## 7. Open Questions

- Standardize hook naming (`useFoo` vs `use-foo`)? (Both exist today.)
- Adopt a strict import-order rule / `eslint-plugin-import`?
- Enforce no-console / no-explicit-any as errors in ESLint?
