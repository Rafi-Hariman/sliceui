# C1 — UI/UX execution brief

> **Role:** UI/UX designer (sub-agent). **Master plan:**
> [`../phase-C1-functional-production.md`](../phase-C1-functional-production.md).
> **FE partner:** [`c1-frontend.md`](./c1-frontend.md). **Gate:** [`c1-qa.md`](./c1-qa.md).
> **Carry forward:** the WCAG 2.2 AA bar from
> [`../../development/ui-ux-audit.md`](../../development/ui-ux-audit.md).

## Goal

Define the interaction + visual design for the three new C1 surfaces (History,
Dashboard-split, entitlement indicator), run a consistency/a11y pass, and update
the design docs. Frontend implements to these wireframes.

## Design system constraints (existing — do not invent new)

- One font, token-only colors (no raw hex in components), single on-brand indigo
  primary, dark-first with a light theme. Target sizes ≥ 24px. Focus rings on
  every interactive element (`focus-visible:ring-2 ring-ring`).
- shadcn/ui primitives + lucide-react icons. Tailwind utility classes only.
- Compact, dense aesthetic already established on Dashboard/Settings
  (text-[13px], h-8 controls, h-11 headers). Match it.

## History page — wireframe

```
┌─ AppLayout (sidebar: Dashboard · Slice · History · Settings) ──────────────┐
│ History                              [▦ theme] [▾ UsageIndicator] [◯ avatar]│
├────────────────────────────────────────────────────────────────────────────┤
│ [🔍 Search name/framework] [Framework ▾] [Range: 30d ▾]            [Export ⤓]│
├────────────┬──────────────┬────────┬────────┬───────────┬────────┬──────────┤
│ thumb      │ Name         │ Frame  │ Opts   │ Created   │ Status │ Actions ⋯│
│ [img]      │ login-page   │ React  │ R S    │ 2h ago    │ done   │ ⋯        │
│ [img]      │ navbar-dark  │ Tailw. │ R S D  │ yesterday │ done   │ ⋯        │
│ ...                                                                         │
│  (empty)   │ No conversions yet → [Start your first conversion →]           │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Actions menu (per row):** Open · Regenerate · Copy code · Download · Export
  JSON · Delete (with a confirm step for Delete).
- **Bulk export:** Export-all button dumps all *filtered* rows as a single
  `.json` (array of `{ name, framework, options, code, created_at }`).
- **Responsive:** table on `md+`; on mobile collapse each row to a card
  (thumb + name + framework badge + a `⋯` menu).
- **States:** loading skeletons (3–5 shimmer rows); "filtered to 0" (keep filters
  visible + a "Clear filters" action); error row with Retry.

## Dashboard-split — wireframe

```
┌─ AppLayout ────────────────────────────────────────────────────────────────┐
│ Dashboard                       [▦ theme] [▾ UsageIndicator] [◯ avatar]     │
├────────────────────────────────────────────────────────────────────────────┤
│ ┌Total────┐ ┌This month┐ ┌Frameworks┐ ┌Success rate┐                        │
│ │   42    │ │    7     │ │    4     │ │    98%     │                        │
│ └─────────┘ └──────────┘ └──────────┘ └────────────┘                        │
│ ┌Conversions by framework (bar)──┐ ┌Framework distribution (pie)──┐         │
│ │                                │ │                              │         │
│ └────────────────────────────────┘ └──────────────────────────────┘         │
│ ┌Recent activity ──────────────────────────────────┐  ┌View all → /history┐ │
│ │ [img] login-page · React · 2h ago                 │  │ (link button)     │ │
│ │ [img] navbar-dark · Tailwind · yesterday          │  │                   │ │
│ │ … (top 5)                                         │  │                   │ │
│ └───────────────────────────────────────────────────┘  └───────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

- The full table + search **move to History**. Dashboard keeps only stat cards,
  the two charts, and a top-5 Recent activity panel.
- Empty state: when there are zero conversions, replace charts with a friendly
  CTA → `/slice`.

## Entitlement indicator — design

Placement: a compact chip in the page header (primary) next to the theme toggle.
States:

| State | Copy | Color | Notes |
|---|---|---|---|
| Free, ok | `3 / 5 today` | muted/foreground | neutral |
| Free, near-limit | `4 / 5 today` | amber (`text-amber-500`) | ≥4 used |
| Free, exhausted | `5 / 5 today` | destructive + tooltip "Resets tomorrow" | at 5 |
| Pro, ok | `N credits` | foreground | neutral |
| Pro, low | `≤3 credits` | amber | nudge to top up (Stripe deferred → "Top up (soon)") |

- Keep it small (`h-8`, `text-[12px]`), icon-led (`Zap` for credits, `Gauge` for
  quota). `aria-label` must read the full state, e.g. `"3 of 5 free conversions
  used today"`.
- A hover/focus tooltip explains the plan and where it resets.

## Consistency & a11y checklist (this cycle)

- [ ] **Single theme control** — one header toggle driven by `next-themes`;
      remove the per-page `toggleTheme` copies.
- [ ] **Desktop sign-out** in the avatar popover on Slice + Dashboard.
- [ ] Every new History control has a visible `focus-visible` ring + `aria-label`.
- [ ] All icon-only buttons (actions menu, regenerate, export, delete) carry
      `aria-label` and `title`.
- [ ] Action menu is keyboard-navigable (Arrow / Enter / Esc), with `role="menu"`.
- [ ] Amber/red quota states meet 4.5:1 contrast on both themes.
- [ ] Target sizes ≥ 24×24px (44×44 ideal for primary actions).
- [ ] Delete is never one-click — confirm before destroying.

## Doc updates (when design is finalized)

- Append a **"C1 — History, Dashboard-split, Entitlement"** section to
  [`../../development/ui-ux.md`](../../development/ui-ux.md) with the wireframes
  above and the indicator state table.
- Append C1 remediation notes to
  [`../../development/ui-ux-audit.md`](../../development/ui-ux-audit.md).

## Done when

Wireframes + state table are written into `development/ui-ux.md`, the a11y
checklist is green on the implemented surfaces, and the frontend build matches
the spec.
