import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"

/**
 * Landing hero: a real before/after — a visual UI on the left, the generated
 * component code on the right, cycling through a few frameworks.
 * Respects prefers-reduced-motion (no auto-cycle). Swap the CSS mocks for real
 * screenshot assets when available — the data shape is { framework, ui, code }.
 */

function PricingMock() {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Pro</div>
      <div className="mt-1 flex items-end gap-1">
        <span className="text-2xl font-semibold">$19</span>
        <span className="text-[11px] text-muted-foreground mb-0.5">/mo</span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-muted" />
      <div className="mt-1.5 h-2 w-2/3 rounded-full bg-muted" />
      <div className="mt-3 h-7 w-full rounded-md bg-primary" />
    </div>
  )
}

function NavMock() {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded bg-primary/40" />
        <div className="ml-auto flex gap-2">
          <div className="h-2 w-8 rounded-full bg-muted" />
          <div className="h-2 w-8 rounded-full bg-muted" />
          <div className="h-2 w-8 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  )
}

function ActionsMock() {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 shadow-sm flex gap-2">
      <div className="h-8 w-20 rounded-md bg-primary" />
      <div className="h-8 w-20 rounded-md border border-border" />
    </div>
  )
}

const EXAMPLES = [
  {
    framework: "Tailwind CSS",
    ui: <PricingMock />,
    code: `<div class="rounded-xl border p-5 bg-white shadow-sm">
  <p class="text-xs uppercase text-gray-500">Pro</p>
  <p class="mt-1 text-2xl font-semibold">$19
    <span class="text-sm text-gray-500">/mo</span></p>
  <button class="mt-3 w-full rounded-md
    bg-indigo-600 px-4 py-2 text-white">Choose</button>
</div>`,
  },
  {
    framework: "Vue 3 SFC",
    ui: <NavMock />,
    code: `<nav class="flex items-center gap-3">
  <Logo />
  <div class="ml-auto flex gap-2">
    <a v-for="l in links" :key="l"
       href="#" class="text-sm">{{ l }}</a>
  </div>
</nav>`,
  },
  {
    framework: "React TSX",
    ui: <ActionsMock />,
    code: `export default function Actions() {
  return (
    <div className="flex gap-2">
      <button className="h-8 w-20 rounded-md
        bg-primary text-primary-foreground">Save</button>
      <button className="h-8 w-20 rounded-md
        border border-border">Cancel</button>
    </div>
  )
}`,
  },
]

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export function HeroDemo() {
  const [i, setI] = useState(0)
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI((v) => (v + 1) % EXAMPLES.length), 4500)
    return () => clearInterval(t)
  }, [reduce])

  const ex = EXAMPLES[i]

  return (
    <div className="w-full rounded-xl border border-border bg-card/50 backdrop-blur p-4 sm:p-5">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1.1fr] gap-4 items-center">
        <figure aria-label={`Example UI screenshot — ${ex.framework}`} className="m-0">
          {ex.ui}
          <figcaption className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground text-center">Screenshot</figcaption>
        </figure>

        <ArrowRight className="mx-auto hidden sm:block h-5 w-5 text-muted-foreground" aria-hidden />

        <div className="min-w-0">
          <pre className="m-0 overflow-hidden rounded-lg border border-border bg-background p-3 text-[11px] leading-relaxed text-foreground/90">
            <code>{ex.code}</code>
          </pre>
          <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground text-center">{ex.framework} output</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5" role="tablist" aria-label="Example frameworks">
        {EXAMPLES.map((e, idx) => (
          <button
            key={e.framework}
            role="tab"
            aria-selected={idx === i}
            aria-label={`Show ${e.framework} example`}
            onClick={() => setI(idx)}
            className={`h-1.5 rounded-full transition-all ${FOCUS} ${idx === i ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"}`}
          />
        ))}
      </div>
    </div>
  )
}
