import { useState } from "react";
import { AppSidebar, SidebarContent } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { StackedLogo } from "./StackedLogo";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarExpand = () => setSidebarCollapsed(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNavigate={handleSidebarExpand}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex md:hidden items-center justify-between h-14 border-b border-border bg-background px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar border-r border-sidebar-border">
              <div className="flex flex-col h-full">
                <SidebarContent onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
              <StackedLogo size={16} />
            </span>
            <span className="font-semibold tracking-[0.06em] text-[15px] text-foreground">SliceUI</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
