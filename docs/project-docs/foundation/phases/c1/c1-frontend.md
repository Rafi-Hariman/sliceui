# C1 - Frontend execution brief

> **Role:** Frontend engineer (sub-agent). **Master plan:**
> [`../phase-C1-functional-production.md`](../phase-C1-functional-production.md).
> **Design ref:** [`c1-ui-ux.md`](./c1-ui-ux.md). **Gate:** [`c1-qa.md`](./c1-qa.md).
> **Blocked by:** [`c1-backend.md`](./c1-backend.md) (the proxy must be live).

## Goal

Ship the authenticated app shell, a dedicated rich History page, entitlement
visibility, and the regenerate flow - at production standard, reusing existing
services. Do **not** duplicate logic that already exists.

## Reuse first (do not re-implement)

- `src/lib/conversionService.ts` → `getConversions`, `getConversionById`,
  `createConversion`, `deleteConversion`.
- `src/lib/storageService.ts` → `uploadSliceImage`, `deleteSliceImage`.
- `src/hooks/useConvert.ts` → the generate flow (request-id guard, loading,
  error, persist). Already proxies via `aiService` when
  `VITE_CONVERT_PROXY_URL` is set.
- `src/components/ProtectedRoute.tsx`, `src/components/AppLayout.tsx`,
  `src/components/AppSidebar.tsx` (the `navItems` array is the single nav source).
- `src/lib/frameworks.ts` → `FRAMEWORKS` for the filter dropdown + badges.
- `@tanstack/react-query` (`QueryClient` already instantiated in `src/App.tsx`)
  for the shared conversions cache.

## Ordered tasks

1. **Route + nav** (small, do first so wiring is testable):
   - `src/App.tsx`: add `<Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />` and `import History from "./pages/History"`.
   - `src/components/AppSidebar.tsx`: change `navItems` to
     `[ Dashboard /dashboard, Scissors /slice, History /history, Settings /settings ]`
     (import `History` from `lucide-react`). Dashboard remains the landing page.

2. **Shared conversions hook** - add `src/hooks/useConversions.ts` (react-query):
   - key `["conversions"]`; calls `getConversions(user.id)`; `useQuery`.
   - expose `useInvalidateConversions()` so `useConvert` and History's
     delete/regenerate can refetch one shared cache (Dashboard + History).

3. **History page** - `src/pages/History.tsx` (extract the table currently inside
   `src/pages/Dashboard.tsx` and enrich):
   - Wrap in `AppLayout`; copy the page header pattern (title + theme toggle +
     avatar popover + `UsageIndicator`).
   - **Toolbar:** search `<Input>` (name/framework), framework `<Select>` (All +
     `FRAMEWORKS`), date-range `<Select>` (7d / 30d / All), and an Export-all
     button. Each control needs a `data-testid` + `aria-label`.
   - **Table columns:** thumbnail · name (links to `/slice?conversion=<id>`) ·
     framework badge · options badges (R/S/D/A - copy the Dashboard pattern) ·
     created (`formatDistanceToNow`) · status badge · **actions menu**:
     Open · Regenerate (`/slice?conversion=<id>&rerun=1`) · Copy code · Download
     · Export (`.json`) · Delete.
   - Delete: reuse `deleteConversion` + `deleteSliceImage` (derive path from the
     public URL exactly as Dashboard does today), then invalidate
     `["conversions"]`.
   - States: empty ("No conversions yet" → CTA `/slice`), loading skeletons,
     error, "filtered to 0".
   - `data-testid`: `history-table`, `history-filter-framework`,
     `history-filter-range`, `history-search`, `history-export`,
     `history-row-<id>`, `history-regenerate-<id>`, `history-delete-<id>`.
   - Responsive: table on `md+`, cards on mobile.

4. **Dashboard refactor** - `src/pages/Dashboard.tsx`:
   - Keep stat cards (Total / This month / Frameworks / Success rate) + the bar +
     pie charts (recharts).
   - Replace the full table + search with a **"Recent activity"** panel: top 5
     conversions (thumbnail + name + framework + relative time) from the shared
     `["conversions"]` cache, each linking to `/slice?conversion=<id>`, plus a
     "View all →" `<Link to="/history">`.
   - Add the `UsageIndicator` to the header.

5. **Entitlement** - three small files, reading existing tables (no new RPC):
   - `src/lib/usageService.ts`:
     - `getCredits()` → `supabase.from('credits').select('*').maybeSingle()`.
     - `getTodayUsageCount()` →
       `supabase.from('usage_log').select('id', { count:'exact', head:true }).eq('status','success').gte('created_at', new Date().toISOString().slice(0,10))`.
   - `src/hooks/useEntitlement.ts` - react-query hook returning
     `{ plan, balance, usedToday, freeLimit: 5, remainingToday }`.
   - `src/components/UsageIndicator.tsx` - compact chip (see `c1-ui-ux.md` for
     states/colors). Free: `used/5 today` (amber ≥4, red at 5). Pro: `N credits`.
   - Invalidate `["entitlement"]` from `useConvert` after each generate so the
     chip increments immediately.

6. **Regenerate** - extend the existing deep-link in `src/pages/Slice.tsx`:
   - The page already loads `/slice?conversion=<id>` via `getConversionById`.
   - Add `rerun` handling: when `params.get('rerun') === '1'` and the conversion
     loads, `fetch(loaded.original_image_url)` → `blob()` →
     `new File([blob], loaded.original_image_name, { type: blob.type })` → call
     `convert(file, loaded.framework, loaded.options)` once. Guard against
     double-fire with a ref (mirror `useConvert`'s request-id pattern).
   - Note: the stored image is in a public bucket, so a browser `fetch` works.

7. **Polish pass** (consistency):
   - Consolidate the duplicated `toggleTheme` (Slice.tsx + Dashboard.tsx) into
     one header control driven by `next-themes` (`useTheme`), so theme is
     single-source.
   - Add **Sign out** to the avatar `Popover` on `Slice.tsx` + `Dashboard.tsx`
     (today only Settings is there on desktop; the sidebar footer already signs
     out).
   - Fix the double-redirect: in `Auth.tsx` send an already-authed user straight
     to `/dashboard` instead of `/` (which then redirects again).
   - Keep all WCAG 2.2 AA work from the prior branch (focus rings, ≥24px
     targets, contrast) intact on every new control.

## Files touched

New: `src/pages/History.tsx`, `src/hooks/useConversions.ts`, `src/lib/usageService.ts`,
`src/hooks/useEntitlement.ts`, `src/components/UsageIndicator.tsx`.
Modified: `src/App.tsx`, `src/components/AppSidebar.tsx`, `src/pages/Dashboard.tsx`,
`src/pages/Slice.tsx`, `src/pages/Auth.tsx`, `src/hooks/useConvert.ts`
(invalidate entitlement cache on success).
Untouched (do not edit): `src/lib/aiService.ts`, `src/lib/conversionService.ts`,
`src/lib/storageService.ts`, `src/lib/prompts.ts`, `src/components/ProtectedRoute.tsx`.

## Done when

- `/history` renders, filters/search/regenerate/export/delete all work, and the
  list stays in sync with Dashboard via the shared cache.
- Dashboard shows analytics + Recent activity (+ View-all link), no full table.
- `UsageIndicator` shows correct free/pro values and increments after a convert.
- `/slice?conversion=<id>&rerun=1` auto-regenerates.
- Theme control is singular; desktop avatar popover can sign out; authed users
  land on `/dashboard` without a double hop.
- `npx tsc --noEmit -p tsconfig.app.json` + `npm run lint` + `npm run build` green.
