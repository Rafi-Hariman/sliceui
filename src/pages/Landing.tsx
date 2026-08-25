import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  ArrowUpRight,
  Braces,
  Code2,
  Image as ImageIcon,
  Layers,
  Moon,
  Sparkles,
  Sun,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StackedLogo } from "@/components/StackedLogo";
import { cn } from "@/lib/utils";
import { lazy, Suspense } from "react";

// The R3F/three bundle is large (~700 kB gzip) — load it only when the
// landing hero actually mounts, so other routes never pay for WebGL.
const HeroScene = lazy(() =>
  import("@/components/landing/HeroScene").then((m) => ({ default: m.HeroScene })),
);
import { Reveal } from "@/components/landing/Reveal";
import { CountUp } from "@/components/landing/CountUp";
import { TiltCard } from "@/components/landing/TiltCard";

const FRAMEWORKS = ["React", "Vue", "Tailwind", "Next.js", "Bootstrap", "Svelte", "TypeScript"];

const FEATURES = [
  {
    title: "Multi-framework",
    desc: "React, Vue, Tailwind, Next.js, Bootstrap, Svelte — one tool, seven output formats. Pick what fits your stack.",
    icon: <Code2 className="h-6 w-6" />,
  },
  {
    title: "Lightning fast",
    desc: "Upload screenshot. Click generate. Done. No setup, no config, no waiting. Get production-ready code in seconds.",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    title: "Smart options",
    desc: "Responsive breakpoints. Semantic HTML. Dark mode. Accessibility. Toggle what you need, we handle the rest.",
    icon: <Layers className="h-6 w-6" />,
  },
];

const STEPS = [
  { title: "Drop your screenshot", desc: "Drag & drop, click to upload, or Ctrl+V right in the browser.", icon: <ImageIcon className="h-5 w-5" /> },
  { title: "Pick your stack", desc: "Choose the framework and flip the options you care about.", icon: <Braces className="h-5 w-5" /> },
  { title: "Get clean code", desc: "Copy production-ready output with syntax highlighting.", icon: <Wand2 className="h-5 w-5" /> },
];

const TESTIMONIALS = [
  {
    quote: "Sliced a whole dashboard mockup into Tailwind in under a minute. Huge time-saver.",
    name: "Rina",
    role: "Frontend Engineer",
  },
  {
    quote: "The Bootstrap output was clean enough to drop straight into our design system.",
    name: "Andre",
    role: "Freelance Developer",
  },
  {
    quote: "Finally a screenshot-to-code tool that gets the spacing and colors right.",
    name: "Maya",
    role: "Product Designer",
  },
];

const Landing = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = mounted && theme === "dark";

  // Fraction (0..1) across the screen where the 3D object should sit.
  // Desktop: right-of-center, behind the accent labels (~76-86%).
  // Mobile: centered under the text.
  const sceneTargetX = useMemo(
    () => (typeof window !== "undefined" && window.innerWidth < 1024 ? 0.5 : 0.78),
    [],
  );

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ── */}
      <nav
        className={cn(
          "fixed top-0 z-50 w-full px-6 transition-all duration-300",
          scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2 -ml-0.5">
            <StackedLogo size={16} />
            <span className="text-[14px] font-bold text-foreground tracking-[0.08em] uppercase">SliceUI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-[13px] text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">Sign up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero (full-bleed 3D background) ── */}
      <section className="relative isolate overflow-hidden pt-[72px] px-6">
        {/* Full-bleed 3D scene behind everything */}
        <div className="absolute inset-0 z-0" aria-hidden>
          <Suspense fallback={<HeroFallback />}>
            <HeroScene targetX={sceneTargetX} isDark={isDark} />
          </Suspense>
        </div>

        {/* Left scrim so copy stays readable over the scene */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-full lg:w-3/5 bg-gradient-to-r from-background via-background/85 to-transparent"
        />

        {/* Floating accent chips over the scene (right side) */}
        <div className="pointer-events-none absolute right-[8%] top-[16%] z-[2] hidden lg:flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur float-slow">
          <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px] shadow-success/70" />
          Screenshot → analyzed
        </div>
        <div className="pointer-events-none absolute right-[14%] bottom-[18%] z-[2] hidden lg:flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur float-slower">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary/70" />
          code generated in 3.2s
        </div>

        <div className="relative mx-auto max-w-[1200px]">
          <div className="min-h-[560px] flex items-center py-10 lg:py-20">
            {/* Copy */}
            <div className="relative z-10 max-w-[540px]">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-[12px] text-muted-foreground mb-6 backdrop-blur">
                <Sparkles className="h-3 w-3 text-success" />
                AI-powered screenshot → code
              </div>
              <h1 className="text-[clamp(2.4rem,4.5vw,3.6rem)] font-[500] leading-[1.05] tracking-[-0.04em] text-foreground">
                Transform UI screenshots into{" "}
                <span className="bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent">
                  production code
                </span>
              </h1>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-[420px]">
                Upload any UI screenshot, get clean React, Vue, Tailwind, and more.
                Instant results — no setup, no config, no credit card.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/auth">
                    Start converting free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="gap-2 text-muted-foreground">
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                    Get API key
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product mockup (3D tilt) ── */}
      <section className="relative z-10 -mt-4 pb-4 px-6">
        <div className="mx-auto max-w-[1200px]">
          <TiltCard max={5} className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden shadow-[0_40px_120px_-30px_rgba(0,0,0,0.55)]">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
              <div className="absolute -top-24 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full blur-[100px] bg-primary/25" />
            </div>
            <div className="relative z-10 flex min-h-[420px]">
              {/* Top gradient hairline */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent pointer-events-none" />

              <div className="w-[200px] border-r border-border p-3 flex flex-col gap-1 shrink-0">
                <div className="flex items-center gap-2 px-2 h-8 mb-2">
                  <div className="h-4 w-4 rounded bg-primary/30" />
                  <div className="h-2 w-16 rounded-full bg-foreground/15" />
                </div>
                <div className="h-px bg-border" />
                {["Tailwind", "React", "Vue", "Next.js"].map((fw, i) => (
                  <div key={i} className={`flex items-center gap-2 px-2 h-7 rounded ${i === 1 ? "bg-accent" : ""}`}>
                    <Code2 className="h-3 w-3 text-muted-foreground/15" />
                    <div className={`h-1.5 ${i === 1 ? "w-16" : i === 0 ? "w-12" : "w-14"} rounded-full ${i === 1 ? "bg-foreground/25" : "bg-muted-foreground/15"}`} />
                  </div>
                ))}
                <div className="h-px bg-border my-1" />
                <div className="px-2 mb-1">
                  <div className="h-1.5 w-14 rounded-full bg-muted-foreground/10" />
                </div>
                {["Bootstrap", "Svelte"].map((fw, i) => (
                  <div key={`f-${i}`} className="flex items-center gap-2 px-2 h-7">
                    <Code2 className="h-2 w-2 text-muted-foreground/12" />
                    <div className={`h-1.5 ${i === 0 ? "w-16" : "w-12"} rounded-full bg-muted-foreground/12`} />
                  </div>
                ))}
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center gap-3 px-4 h-10 border-b border-border">
                  <div className="h-2 w-10 rounded-full bg-muted-foreground/15" />
                  <div className="h-2 w-8 rounded-full bg-muted-foreground/10" />
                  <div className="ml-auto flex gap-2">
                    <div className="h-5 w-5 rounded bg-muted-foreground/8" />
                    <div className="h-5 w-5 rounded bg-muted-foreground/8" />
                  </div>
                </div>
                <div className="flex-1 p-6 space-y-3">
                  <div className="h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-muted-foreground/10 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-muted-foreground/30" />
                      </div>
                      <div className="h-2 w-24 mx-auto rounded-full bg-muted-foreground/10" />
                      <div className="h-1.5 w-32 mx-auto rounded-full bg-muted-foreground/8" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["Responsive", "Semantic", "Dark", "A11y"].map((opt, i) => (
                      <div key={i} className={`h-6 rounded-full text-center text-[10px] flex items-center justify-center ${i < 2 ? "bg-success/15 text-success" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="h-10 rounded-lg bg-success text-success-foreground flex items-center justify-center">
                    <span className="text-[13px] font-medium">Generate code</span>
                  </div>
                </div>
              </div>

              <div className="w-[280px] border-l border-border shrink-0 hidden lg:flex flex-col">
                <div className="flex items-center justify-between px-4 h-10 border-b border-border">
                  <div className="h-2 w-12 rounded-full bg-foreground/15" />
                  <div className="flex gap-1.5">
                    <div className="h-4 w-4 rounded bg-muted-foreground/10" />
                    <div className="h-4 w-4 rounded bg-muted-foreground/10" />
                  </div>
                </div>
                <div className="flex-1 bg-muted/30 p-4">
                  <div className="space-y-2">
                    <div className="h-2 w-20 rounded-full bg-muted-foreground/15" />
                    <div className="h-1.5 w-full rounded-full bg-muted-foreground/8" />
                    <div className="h-1.5 w-3/4 rounded-full bg-muted-foreground/8" />
                    <div className="h-1.5 w-5/6 rounded-full bg-muted-foreground/8" />
                    <div className="h-1.5 w-2/3 rounded-full bg-muted-foreground/8" />
                    <div className="h-1.5 w-4/5 rounded-full bg-muted-foreground/8" />
                    <div className="h-1.5 w-3/4 rounded-full bg-muted-foreground/8" />
                    <div className="h-1.5 w-full rounded-full bg-muted-foreground/8" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
            {/* Glare sweep */}
            <div aria-hidden className="glare-sweep pointer-events-none absolute inset-0 z-30" />
          </TiltCard>
        </div>
      </section>

      <div className="relative z-10 w-full border-t border-border" />

      {/* ── Social proof strip (marquee) ── */}
      <section className="relative z-10 py-10 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-center uppercase tracking-[0.15em] text-[12px] text-muted-foreground mb-6">
            Built for teams using
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="marquee-track flex w-max gap-12 items-center">
              {[...FRAMEWORKS, ...FRAMEWORKS].map((fw, i) => (
                <span key={i} className="flex items-center gap-2 text-[15px] font-medium text-foreground/55 whitespace-nowrap">
                  <CheckMark />
                  {fw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 w-full border-t border-border" />

      {/* ── Stats ── */}
      <section className="relative z-10 py-16 px-6">
        <div className="mx-auto max-w-[1200px] grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <StatCard value={12000} suffix="+" label="Components generated" />
          <StatCard value={7} suffix="" label="Frameworks supported" />
          <StatCard value={3.2} decimals={1} suffix="s" label="Average generation" />
          <StatCard value={5} suffix="/day" label="Free conversions" />
        </div>
      </section>

      <div className="relative z-10 w-full border-t border-border" />

      {/* ── Features ── */}
      <section id="features" className="relative z-10 pt-20 pb-28 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1200px] relative">
          <div className="max-w-[540px]">
            <p className="flex items-center gap-2 text-[13px] uppercase tracking-[0.15em] text-success mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px] shadow-success/60" />
              Powered by AI
            </p>
            <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-[500] tracking-[-0.03em] text-foreground leading-[1.15]">
              Screenshot today. Code tomorrow.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-[420px]">
              One screenshot, every framework. Clean, typed, production-ready output — generated in seconds.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 100}>
                <div className="group relative h-full p-8 rounded-2xl border border-border bg-card/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.5)]">
                  <ArrowRight className="absolute right-6 top-8 h-4 w-4 text-foreground/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <div className="mb-6 h-32 rounded-xl border border-border bg-card/50 flex items-center justify-center text-foreground/80 transition-colors duration-200 group-hover:text-success group-hover:border-success/30 group-hover:shadow-[0_0_24px_-6px] group-hover:shadow-success/40">
                    {feature.icon}
                  </div>
                  <h3 className="text-[15px] font-medium text-foreground mb-2">{feature.title}</h3>
                  <p className="text-[13px] leading-[1.6] text-muted-foreground">{feature.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10 w-full border-t border-border" />

      {/* ── How it works ── */}
      <section id="how-it-works" className="relative z-10 pt-20 pb-28 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center max-w-[560px] mx-auto mb-14">
            <p className="flex items-center justify-center gap-2 text-[13px] uppercase tracking-[0.15em] text-success mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px] shadow-success/60" />
              How it works
            </p>
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-[500] tracking-[-0.03em] text-foreground">
              From pixel to component in three steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 100}>
                <div className="relative p-8 rounded-2xl border border-border bg-card/40 backdrop-blur-sm">
                  <span className="absolute top-6 right-6 text-[44px] font-[600] leading-none text-foreground/8 select-none">
                    {i + 1}
                  </span>
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card/60 text-primary shadow-[0_0_20px_-4px] shadow-primary/30">
                    {step.icon}
                  </div>
                  <h3 className="text-[15px] font-medium text-foreground mb-2">{step.title}</h3>
                  <p className="text-[13px] leading-[1.6] text-muted-foreground">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10 w-full border-t border-border" />

      {/* ── Testimonials ── */}
      <section id="testimonials" className="relative z-10 pt-20 pb-28 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center max-w-[560px] mx-auto mb-14">
            <p className="flex items-center justify-center gap-2 text-[13px] uppercase tracking-[0.15em] text-success mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px] shadow-success/60" />
              Testimonials
            </p>
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-[500] tracking-[-0.03em] text-foreground">
              Loved by developers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <figure className="border border-border rounded-2xl p-6 bg-card/40 backdrop-blur-sm shadow-[0_0_0_0_rgba(0,0,0,0)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)]">
                  <div className="flex gap-0.5 text-primary mb-4" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <svg key={s} className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed text-foreground mb-5">“{t.quote}”</blockquote>
                  <figcaption className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-semibold text-primary">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-foreground">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10 w-full border-t border-border" />

      {/* ── Final CTA ── */}
      <section className="relative z-10 pt-32 pb-40 px-6 overflow-hidden">
        {/* Ambient green glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-25 blur-[120px] dark:opacity-20"
          style={{
            background:
              "radial-gradient(closest-side, hsl(var(--success) / 0.55), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-[1200px] text-center relative">
          <Reveal>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-[500] tracking-[-0.035em] text-foreground leading-[1.1] mx-auto max-w-[560px]">
              Stop coding from scratch.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent" />
            <p className="mt-5 text-[15px] text-muted-foreground max-w-[400px] mx-auto">
              Free tier: 5 conversions per day.<br />No credit card required.<br />Powered by Gemini 2.0 Flash.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button asChild size="lg" className="gap-2.5">
                <Link to="/auth">
                  Start converting now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2.5">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                  Get API key
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <div className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 -ml-0.5">
            <StackedLogo size={16} />
            <span className="text-[12px] font-bold text-foreground uppercase tracking-[0.08em]">SliceUI</span>
          </div>
          <span className="text-[12px] text-muted-foreground">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
};

function HeroFallback() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 rounded-full blur-[100px] opacity-40"
        style={{ background: "radial-gradient(closest-side, hsl(var(--primary) / 0.4), transparent 70%)" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-14 w-14 animate-pulse rounded-2xl border border-border bg-card/60" />
      </div>
    </div>
  );
}

function CheckMark() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success/15 text-success">
      <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.5 5.5l2.5 2.5 4.5-5" />
      </svg>
    </span>
  );
}

function StatCard({
  value,
  label,
  decimals = 0,
  suffix = "",
}: {
  value: number;
  label: string;
  decimals?: number;
  suffix?: string;
}) {
  return (
    <Reveal>
      <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm px-4 py-8">
        <div className="text-[clamp(1.6rem,3vw,2.2rem)] font-[500] tracking-[-0.02em] text-foreground">
          <CountUp to={value} decimals={decimals} suffix={suffix} />
        </div>
        <div className="mt-2 text-[12px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      </div>
    </Reveal>
  );
}

export default Landing;
