import { useEffect, useState, type ReactNode } from "react"
import { ArrowRight } from "lucide-react"

// Kiro-style terminal hero: monochrome window, monochrome UI mocks on the left
// (inside a dashed selection border), syntax-colored code on the right. Color
// appears only in the code (lilac tags, cyan attributes), matching the Kiro
// developer-terminal look. Everything else is black / white / neutral.

type Tok = [cls: "k" | "a" | "t" | "m", v: string]
const C: Record<Tok[0], string> = {
  k: "text-violet-300", // tags / keywords
  a: "text-cyan-300",   // attributes / flags / strings
  t: "text-neutral-300", // text content
  m: "text-neutral-500", // punctuation / muted
}

function Code({ toks }: { toks: Tok[] }) {
  return (
    <code className="font-mono text-[11px] leading-relaxed">
      {toks.map((tk, i) => (
        <span key={i} className={C[tk[0]]}>{tk[1]}</span>
      ))}
    </code>
  )
}

function Bar({ w, cls = "bg-neutral-700" }: { w: string; cls?: string }) {
  return <div className={`h-2 rounded-full ${cls}`} style={{ width: w }} />
}

function PricingMock() {
  return (
    <div className="w-full rounded-lg border border-white/10 bg-neutral-900 p-4">
      <Bar w="36px" cls="bg-neutral-600" />
      <div className="mt-2 flex items-end gap-1">
        <span className="text-base font-semibold text-white">$19</span>
        <span className="text-[10px] text-neutral-500 mb-0.5">/mo</span>
      </div>
      <div className="mt-2.5 space-y-1.5">
        <Bar w="100%" />
        <Bar w="64%" />
      </div>
      <div className="mt-3 h-6 rounded-md bg-white" />
    </div>
  )
}

function NavMock() {
  return (
    <div className="w-full rounded-lg border border-white/10 bg-neutral-900 p-3">
      <div className="flex items-center gap-3">
        <div className="h-3.5 w-3.5 rounded bg-white" />
        <div className="ml-auto flex gap-2">
          <Bar w="28px" />
          <Bar w="28px" />
          <Bar w="28px" />
        </div>
      </div>
    </div>
  )
}

function ActionsMock() {
  return (
    <div className="w-full rounded-lg border border-white/10 bg-neutral-900 p-3 flex gap-2">
      <div className="h-7 w-16 rounded-md bg-white" />
      <div className="h-7 w-16 rounded-md border border-white/15" />
    </div>
  )
}

const EXAMPLES: { framework: string; file: string; ui: ReactNode; code: Tok[] }[] = [
  {
    framework: "Tailwind CSS",
    file: "pricing.html",
    ui: <PricingMock />,
    code: [
      ["k", "<div"], ["a", ` class="rounded-xl border p-5"`], ["m", ">"], ["t", "\n  "],
      ["k", "<p"], ["a", ` class="text-xs uppercase"`], ["m", ">"], ["t", "Pro"], ["k", "</p>"], ["t", "\n  "],
      ["k", "<p"], ["a", ` class="text-2xl font-semibold"`], ["m", ">"], ["t", "$19"], ["k", "</p>"], ["t", "\n  "],
      ["k", "<button"], ["a", ` class="mt-3 w-full rounded-md\n    bg-black text-white"`], ["m", ">"], ["t", "Choose"], ["k", "</button>"], ["t", "\n"],
      ["k", "</div>"],
    ],
  },
  {
    framework: "Vue 3 SFC",
    file: "nav.vue",
    ui: <NavMock />,
    code: [
      ["k", "<nav"], ["a", ` class="flex items-center gap-3"`], ["m", ">"], ["t", "\n  "],
      ["k", "<Logo"], ["a", " />"], ["t", "\n  "],
      ["k", "<a"], ["a", " v-for=\"l in links\" :key=\"l\""], ["t", "\n    "], ["a", ` href="#"`], ["m", ">"], ["t", "{{ l }}"], ["k", "</a>"], ["t", "\n"],
      ["k", "</nav>"],
    ],
  },
  {
    framework: "React TSX",
    file: "actions.tsx",
    ui: <ActionsMock />,
    code: [
      ["k", "export default function"], ["t", " Actions"], ["m", "() {"], ["t", "\n  "],
      ["k", "return"], ["m", " ("], ["t", "\n    "],
      ["k", "<button"], ["a", " className=\"rounded-md bg-white\n      text-black\""], ["m", ">"], ["t", "Save"], ["k", "</button>"], ["t", "\n  "],
      ["m", ")"], ["t", "\n"],
      ["m", "}"],
    ],
  },
]

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
    <div className="w-full rounded-xl border border-white/10 bg-neutral-900 overflow-hidden shadow-[0_24px_60px_-24px_rgb(0_0_0)]">
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 border-b border-white/10 px-3.5 h-9">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-2 font-mono text-[11px] text-neutral-500">{ex.file}</span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1.1fr] gap-4 items-center">
          <figure aria-label={`Example UI screenshot: ${ex.framework}`} className="m-0 rounded-lg border border-dashed border-white/25 p-2">
            {ex.ui}
            <figcaption className="mt-2 text-[10px] uppercase tracking-wide text-neutral-500 text-center">Screenshot</figcaption>
          </figure>

          <ArrowRight className="mx-auto hidden sm:block h-5 w-5 text-neutral-600" aria-hidden />

          <div className="min-w-0">
            <pre className="m-0 overflow-hidden rounded-lg border border-white/10 bg-black p-3">
              <Code toks={ex.code} />
            </pre>
            <p className="mt-2 text-[10px] uppercase tracking-wide text-neutral-500 text-center">{ex.framework} output</p>
          </div>
        </div>

        {/* Selector */}
        <div className="mt-4 flex items-center justify-center gap-1.5" role="tablist" aria-label="Example frameworks">
          {EXAMPLES.map((e, idx) => (
            <button
              key={e.framework}
              role="tab"
              aria-selected={idx === i}
              aria-label={`Show ${e.framework} example`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${idx === i ? "w-6 bg-white" : "w-1.5 bg-white/25 hover:bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
