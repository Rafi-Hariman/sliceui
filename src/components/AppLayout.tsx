import { useState } from "react";
import { AppSidebar, SidebarContent } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { StackedLogo } from "./StackedLogo";

interface AppLayoutProps {
  children: React.ReactNode;
  /** Page title shown in the header (desktop + mobile). */
  title?: string;
  /** Optional actions rendered in the header (e.g. "New conversion" button). */
  actions?: React.ReactNode;
}

export function AppLayout({ children, title = "", actions }: AppLayoutProps) {
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNavigate={() => setSidebarCollapsed(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header — shared across pages, shown on all breakpoints */}
        <header className="sticky top-0 z-40 flex items-center gap-1 bg-background pl-3 md:pl-0">
          {/* Mobile menu */}
          <div className="flex md:hidden items-center shrink-0">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open navigation menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-60 bg-sidebar">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 px-3 h-11 border-b border-sidebar-border">
                    <StackedLogo size={16} color="currentColor" />
                    <span className="font-bold uppercase tracking-[0.08em] text-[14px] text-sidebar-accent-foreground">
                      SliceUI
                    </span>
                  </div>
                  <SidebarContent onNavigate={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Shared header: title + actions + theme + user */}
          <div className="flex-1 min-w-0">
            <AppHeader title={title} actions={actions} />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
