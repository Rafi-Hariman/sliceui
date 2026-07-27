import { Link } from "react-router-dom";
import { ArrowRight, Sun, Moon, Upload, MousePointerClick, ClipboardPaste, Check } from "lucide-react";
import { HeroDemo } from "@/components/HeroDemo";
import { useTheme } from "next-themes";

import { StackedLogo } from "@/components/StackedLogo";
import { FRAMEWORKS } from "@/lib/frameworks";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const STEPS = [
  { n: "01", icon: Upload, title: "Upload a screenshot", body: "Drag in or paste any UI screenshot. PNG, JPG, or WebP up to 10 MB." },
  { n: "02", icon: MousePointerClick, title: "Pick your framework", body: "Choose the stack your project uses. Toggle responsive, semantic, dark mode, or a11y." },
  { n: "03", icon: ClipboardPaste, title: "Paste the component", body: "Copy or download one self-contained component. Drop it straight into your codebase." },
];

const Landing = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
          <Link to="/" className={`flex items-center gap-2 -ml-0.5 rounded-md ${FOCUS}`}>
            <StackedLogo size={16} />
            <span className="text-sm font-semibold tracking-[0.06em] uppercase">SliceUI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#how" className={`text-[13px] text-muted-foreground hover:text-foreground transition-colors rounded-md ${FOCUS}`}>How it works</a>
            <a href="#pricing" className={`text-[13px] text-muted-foreground hover:text-foreground transition-colors rounded-md ${FOCUS}`}>Pricing</a>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`relative h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-full ${FOCUS}`}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              aria-pressed={isDark}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
            <Link to="/auth" className={`text-[13px] text-muted-foreground hover:text-foreground transition-colors h-9 px-3 inline-flex items-center rounded-full ${FOCUS}`}>
              Log in
            </Link>
            <Link
              to="/auth"
              className={`text-[13px] h-9 px-4 inline-flex items-center rounded-full font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors ${FOCUS}`}
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16">
        <div className="mx-auto max-w-[1200px] grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
          <div className="min-w-0">
            <p className="font-mono text-[12px] text-muted-foreground mb-4">// screenshot to component</p>
            <h1 className="text-[clamp(2.1rem,4.6vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-balance">
              Paste a UI screenshot. Get a component in your framework.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground max-w-[520px] text-pretty">
              SliceUI reads a screenshot and returns one self-contained component, in React, Vue, Tailwind, Next.js, Bootstrap, Svelte, or HTML. Paste it into your codebase. No full-app scaffold, no rewrite.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className={`group inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors ${FOCUS}`}
              >
                Start converting free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how"
                className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-full border border-border text-foreground hover:bg-accent transition-colors ${FOCUS}`}
              >
                See how it works
              </a>
            </div>
            <p className="mt-3 text-[12.5px] text-muted-foreground">5 free conversions a day. No card required.</p>

            <div className="mt-9">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70 mb-3">Works with</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {FRAMEWORKS.map((fw) => (
                  <li key={fw.id} className="text-[13px] text-muted-foreground">{fw.label}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="min-w-0">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-[1200px]">
          <p className="font-mono text-[12px] text-muted-foreground mb-3">// how it works</p>
          <h2 className="text-[clamp(1.7rem,2.8vw,2.3rem)] font-semibold tracking-[-0.03em] max-w-[560px] leading-[1.18] text-balance">
            Three steps. About ten seconds.
          </h2>

          <div className="mt-12 grid md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {STEPS.map((step) => (
              <div key={step.n} className="bg-card p-7">
                <div className="flex items-center justify-between mb-5">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-foreground ring-1 ring-border">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[13px] font-medium text-muted-foreground/60 tabular-nums">{step.n}</span>
                </div>
                <h3 className="text-base font-medium mb-2">{step.title}</h3>
                <p className="text-[13px] leading-[1.65] text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frameworks */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[640px]">
            <h2 className="text-[clamp(1.7rem,2.8vw,2.3rem)] font-semibold tracking-[-0.03em] leading-[1.18] text-balance">
              The frameworks generic site-builders skip.
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground text-pretty">
              v0 and Lovable build whole apps in one stack. SliceUI gives you one component in any of seven, so it fits the project in front of you.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {FRAMEWORKS.map((fw) => (
              <div key={fw.id} className="rounded-lg border border-border bg-card px-4 py-3.5 flex items-center justify-between gap-3 transition-colors hover:border-foreground/30">
                <span className="text-[13.5px] font-medium">{fw.label}</span>
                <code className="font-mono text-[11.5px] text-muted-foreground">.{fw.ext}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="text-center text-[clamp(1.7rem,2.8vw,2.3rem)] font-semibold tracking-[-0.03em]">
            Pricing
          </h2>
          <p className="mt-3 text-center text-[15px] text-muted-foreground">Start free. Move to Pro when you slice daily.</p>

          <div className="mt-12 grid md:grid-cols-2 gap-4 items-start">
            <div className="rounded-xl border border-border bg-card p-8">
              <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-[0.12em]">Free</h3>
              <p className="mt-4 text-4xl font-semibold tabular-nums">$0</p>
              <p className="mt-1.5 text-[13px] text-muted-foreground">For trying it out</p>
              <ul className="mt-6 space-y-2.5 text-[13px] text-foreground/90">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-foreground" /> 5 conversions a day</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-foreground" /> All 7 web frameworks</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-foreground" /> Live preview and copy</li>
              </ul>
              <Link to="/auth" className={`mt-8 inline-flex w-full justify-center items-center px-4 py-2.5 text-sm font-medium rounded-full border border-border text-foreground hover:bg-accent transition-colors ${FOCUS}`}>
                Start free
              </Link>
            </div>

            <div className="rounded-xl border border-foreground/20 bg-card p-8">
              <h3 className="text-[13px] font-medium text-foreground uppercase tracking-[0.12em]">Pro</h3>
              <p className="mt-4 text-4xl font-semibold tabular-nums">$19<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <p className="mt-1.5 text-[13px] text-muted-foreground">For daily freelance work</p>
              <ul className="mt-6 space-y-2.5 text-[13px] text-foreground/90">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-foreground" /> 300 credits a month</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-foreground" /> Higher-quality model (Claude)</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-foreground" /> Conversion history</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-foreground" /> Credit top-ups anytime</li>
              </ul>
              <Link to="/auth" className={`mt-8 inline-flex w-full justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors ${FOCUS}`}>
                Upgrade to Pro <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">Billing connects at launch.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-[1000px] text-center">
          <h2 className="text-[clamp(1.9rem,3.8vw,2.8rem)] font-semibold tracking-[-0.035em] leading-[1.12] text-balance">
            Stop retyping screenshots by hand.
          </h2>
          <p className="mt-4 text-[15px] text-muted-foreground">
            Upload, pick a framework, paste the result.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/auth"
              className={`group inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 rounded-full ${FOCUS}`}
            >
              Start converting now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 -ml-0.5">
            <StackedLogo size={16} />
            <span className="text-xs font-semibold uppercase tracking-[0.08em]">SliceUI</span>
          </div>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} SliceUI</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
