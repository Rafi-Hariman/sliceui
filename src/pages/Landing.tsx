import { Link } from "react-router-dom";
import { ArrowRight, Sun, Moon, Code2, Zap, Layers, Check } from "lucide-react";
import { HeroDemo } from "@/components/HeroDemo";
import { useTheme } from "next-themes";

import { StackedLogo } from "@/components/StackedLogo";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const Landing = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <nav className="fixed top-0 z-50 w-full bg-background border-b border-border px-6">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between">
          <Link to="/" className={`flex items-center gap-2 -ml-0.5 rounded ${FOCUS}`}>
            <StackedLogo size={16} />
            <span className="text-sm font-bold text-foreground tracking-[0.08em] uppercase">SliceUI</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`relative h-8 w-8 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors rounded ${FOCUS}`}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              aria-pressed={isDark}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
            <Link to="/auth" className={`text-[13px] text-foreground/70 hover:text-foreground transition-colors h-8 px-3 inline-flex items-center rounded ${FOCUS}`}>
              Log in
            </Link>
            <Link
              to="/auth"
              className={`text-[13px] h-8 px-3 border border-border text-foreground hover:bg-accent transition-colors inline-flex items-center rounded ${FOCUS}`}
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-16 px-6">
        <div className="mx-auto max-w-[1200px] grid md:grid-cols-2 gap-10 items-center">
          <div className="min-w-0">
            <p className="text-[13px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Screenshot → code, in your framework
            </p>
            <h1 className="text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.08] tracking-[-0.04em] text-foreground">
              Transform UI screenshots into production code
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground max-w-[460px]">
              Upload any UI screenshot and get a clean, self-contained component — in React, Vue, Tailwind, Next.js, Bootstrap, Svelte, or plain HTML. One tool, seven web frameworks.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className={`group inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-primary text-primary-foreground transition-colors hover:bg-primary/90 rounded ${FOCUS}`}
              >
                Start converting free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <span className="text-[13px] text-muted-foreground">No credit card required</span>
            </div>
          </div>

          <div className="min-w-0">
            <HeroDemo />
          </div>
        </div>
      </section>

      <div className="relative z-10 w-full border-t border-border" />

      {/* Features */}
      <section className="relative z-10 py-24 px-6">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[13px] uppercase tracking-[0.15em] text-muted-foreground mb-4">Powered by AI</p>
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-medium tracking-[-0.03em] text-foreground max-w-[520px] leading-[1.15]">
            Built for frontend engineers who ship across stacks.
          </h2>

          <div className="mt-16 border border-border rounded-xl overflow-hidden">
            <div className="grid md:grid-cols-3">
              {[
                { title: "Seven web frameworks", desc: "React, Vue, Tailwind, Next.js, Bootstrap, Svelte, and HTML — the stacks v0 and Lovable ignore. Pick what fits your project.", icon: <Code2 className="h-6 w-6" /> },
                { title: "Self-contained output", desc: "Every result is one component you can paste into an existing codebase. Not a full app, not a scaffold — just the slice you needed.", icon: <Layers className="h-6 w-6" /> },
                { title: "Live preview + copy", desc: "See the rendered output before you commit. Toggle responsive, semantic, dark mode, and a11y options. Copy or download in one click.", icon: <Zap className="h-6 w-6" /> },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className={`p-8 ${i < 2 ? "md:border-r border-border" : ""} ${i > 0 ? "border-t md:border-t-0 border-border" : ""}`}
                >
                  <div className="mb-6 h-12 w-12 rounded-lg border border-border bg-card flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-medium text-foreground mb-2">{feature.title}</h3>
                  <p className="text-[13px] leading-[1.6] text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 w-full border-t border-border" />

      {/* Pricing */}
      <section className="relative z-10 py-24 px-6">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="text-center text-[clamp(1.8rem,3vw,2.5rem)] font-medium tracking-[-0.03em] text-foreground">
            Simple pricing
          </h2>
          <p className="mt-3 text-center text-[15px] text-muted-foreground">Start free. Upgrade when you need more.</p>

          <div className="mt-12 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-8">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Free</h3>
              <p className="mt-3 text-4xl font-semibold">$0</p>
              <p className="mt-1 text-[13px] text-muted-foreground">For trying it out</p>
              <ul className="mt-6 space-y-2 text-[13px] text-foreground/90">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 5 conversions / day</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> All 7 web frameworks</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Live preview + copy</li>
              </ul>
              <Link to="/auth" className={`mt-8 inline-flex w-full justify-center items-center px-4 py-2.5 text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors rounded ${FOCUS}`}>
                Start free
              </Link>
            </div>

            <div className="rounded-xl border-2 border-primary bg-card p-8 relative">
              <span className="absolute -top-2.5 left-8 rounded-full bg-primary text-primary-foreground text-[11px] font-medium px-2 py-0.5">Pro</span>
              <h3 className="text-sm font-medium text-primary uppercase tracking-wide">Pro</h3>
              <p className="mt-3 text-4xl font-semibold">$19<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <p className="mt-1 text-[13px] text-muted-foreground">For daily freelance work</p>
              <ul className="mt-6 space-y-2 text-[13px] text-foreground/90">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 300 credits / month</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Higher-quality model (Claude)</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Conversion history</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Credit top-ups anytime</li>
              </ul>
              <Link to="/auth" className={`mt-8 inline-flex w-full justify-center items-center px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded ${FOCUS}`}>
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 w-full border-t border-border" />

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-6">
        <div className="mx-auto max-w-[1000px] text-center">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-medium tracking-[-0.035em] text-foreground leading-[1.1]">
            Stop coding from scratch.
          </h2>
          <p className="mt-4 text-[15px] text-muted-foreground">
            Upload a screenshot. Pick your framework. Get clean code.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/auth"
              className={`group inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 rounded ${FOCUS}`}
            >
              Start converting now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 -ml-0.5">
            <StackedLogo size={16} />
            <span className="text-xs font-bold text-foreground uppercase tracking-[0.08em]">SliceUI</span>
          </div>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
