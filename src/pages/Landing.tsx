import { Link } from "react-router-dom";
import { ArrowRight, Moon, Sun, Code2, Zap, Layers } from "lucide-react";
import { Logo3D } from "@/components/Logo3D";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { StackedLogo } from "@/components/StackedLogo";

const SLATE_HSL = "215 16% 47%";
const SLATE_DARK = "215 14% 55%";

const LOGO_VARIANT = 1;
const CUBE_SIZE = 840;
const CUBE_OFFSET_X = -140;
const CUBE_OFFSET_Y = -80;

const Landing = () => {
  const { theme, setTheme } = useTheme();
  const [cubeZoom, setCubeZoom] = useState(() => {
    const w = window.innerWidth;
    return w < 1024 ? 270 : 360;
  });

  useEffect(() => {
    const handleResize = () => {
      setCubeZoom(window.innerWidth < 1024 ? 270 : 360);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDark = theme === "dark";
  const diagonalLineColor = isDark ? "hsl(240 4% 26%" : "hsl(240 4% 80%";

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";
    const hsl = isDark ? SLATE_DARK : SLATE_HSL;
    root.style.setProperty("--primary", hsl);
    root.style.setProperty("--ring", hsl);
    root.style.setProperty("--sidebar-primary", hsl);
    root.style.setProperty("--sidebar-ring", hsl);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <nav className="fixed top-0 z-50 w-full bg-background border-b border-border px-6">
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2 -ml-0.5">
            <StackedLogo size={16} />
            <span className="text-[14px] font-bold text-foreground tracking-[0.08em] uppercase">SliceUI</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
              title="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
            <Link to="/auth">
              <button className="text-[13px] text-foreground/70 hover:text-foreground transition-colors h-8 px-3">
                Log in
              </button>
            </Link>
            <Link to="/auth">
              <button className="text-[13px] h-8 px-3 border border-foreground/40 text-foreground hover:bg-foreground hover:text-background transition-colors">
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 pt-16 pb-0 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1200px] relative">
          <div className="pt-[52px] pb-16 relative flex">
            <div className="relative z-[3] flex-1 min-w-0 max-w-[540px]">
              <h1 className="text-[clamp(2rem,4vw,3.2rem)] font-[500] leading-[1.08] tracking-[-0.04em] text-foreground max-w-[540px]">
                Transform UI screenshots into production code
              </h1>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-[420px]">
                AI-powered image-to-code converter. Upload any UI screenshot, get clean React, Vue, Tailwind, and more. Instant results.
              </p>
              <div className="mt-10 flex items-center gap-4">
                <Link to="/auth">
                  <button className="group relative inline-flex items-center gap-2 px-6 py-3 text-[14px] font-medium bg-foreground text-background transition-all duration-200 hover:bg-foreground/90">
                    Start converting free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </Link>
              </div>
            </div>

            <div className="hidden md:block flex-1 relative z-[1] pointer-events-none" style={{ minWidth: 0 }}>
              <div className="absolute top-1/2 right-0 -translate-y-1/2" style={{ width: CUBE_SIZE, height: CUBE_SIZE, transform: `translate(${-CUBE_OFFSET_X}px, calc(-50% + ${CUBE_OFFSET_Y}px))` }}>
                <Logo3D variant={LOGO_VARIANT} size={CUBE_SIZE} zoom={cubeZoom} bgHex={theme === "dark" ? "#0e0e10" : "#ffffff"} lineHex={theme === "dark" ? "#58585e" : "#c0c0c8"} />
              </div>
            </div>
          </div>

          <div className="relative" style={{ overflow: "visible" }}>
            <div className="relative z-10 rounded-t-xl border border-b-0 border-border bg-card overflow-hidden">
              <div className="flex min-h-[420px]">
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
                  {["Bootstrap", "Svelte", "Flutter"].map((fw, i) => (
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
                        <div key={i} className={`h-6 rounded-full text-center text-[10px] flex items-center justify-center ${i < 2 ? "bg-primary/20 text-primary" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                          {opt}
                        </div>
                      ))}
                    </div>
                    <div className="h-10 rounded-lg bg-foreground text-background flex items-center justify-center">
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
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 w-full border-t border-border" />

      <section className="relative z-10 pt-24 pb-24 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1200px] relative">
          <p className="text-[13px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
            Powered by AI
          </p>
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-[500] tracking-[-0.03em] text-foreground max-w-[500px] leading-[1.15]">
            Screenshot today.<br />Code tomorrow.
          </h2>

          <div className="mt-16 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {[
                {
                  title: "Multi-framework",
                  desc: "React, Vue, Tailwind, Next.js, Bootstrap, Svelte, Flutter — one tool, eight output formats. Pick what fits your stack.",
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
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className={`p-8 ${i < 2 ? "md:border-r border-border" : ""} ${i > 0 ? "border-t md:border-t-0 border-border" : ""}`}
                >
                  <div className="mb-6 h-32 rounded-lg border border-border bg-card/30 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-[15px] font-medium text-foreground mb-2">{feature.title}</h3>
                  <p className="text-[13px] leading-[1.6] text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 w-full border-t border-border" />

      <section className="relative z-10 pt-32 pb-40 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1200px] text-center relative">
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-[500] tracking-[-0.035em] text-foreground leading-[1.1] mx-auto max-w-[560px]">
            Stop coding from scratch.
          </h2>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-[400px] mx-auto">
            Free tier: 5 conversions per day.<br />No credit card required.<br />Powered by Gemini 2.0 Flash.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/auth">
              <button
                className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] font-medium transition-all duration-200 border border-foreground/40 text-foreground hover:bg-foreground hover:text-background hover:border-foreground"
              >
                Start converting now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Get API key
            </a>
          </div>
        </div>
      </section>

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

export default Landing;
