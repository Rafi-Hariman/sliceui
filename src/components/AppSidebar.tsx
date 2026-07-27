import { LayoutDashboard, Scissors, History, Settings, LogOut, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { StackedLogo } from "./StackedLogo";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Scissors, label: "Slice", path: "/slice" },
  { icon: History, label: "History", path: "/history" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarContentProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggle?: () => void;
}

export function SidebarContent({ collapsed = false, onNavigate, onToggle }: SidebarContentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // If sidebar is collapsed and clicking different path, expand first then navigate
    if (collapsed && location.pathname !== path && onNavigate) {
      e.preventDefault();
      onNavigate();
      setTimeout(() => setNavigatingTo(path), 300);
    } else if (onNavigate) {
      onNavigate();
    }
  };

  useEffect(() => {
    if (navigatingTo) {
      navigate(navigatingTo);
      setNavigatingTo(null);
    }
  }, [navigatingTo, navigate]);

  return (
    <>
      {/* Workspace header */}
      <div className={cn("flex items-center gap-2 border-b border-sidebar-border", collapsed ? "justify-center px-2 h-14" : "justify-between px-4 h-14")}>
        <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
            <StackedLogo size={16} color="currentColor" />
          </span>
          {!collapsed && (
            <span className="font-semibold tracking-[0.06em] text-[15px] text-sidebar-accent-foreground">
              SliceUI
            </span>
          )}
        </Link>
        {!collapsed && onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="h-7 w-7 shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {collapsed && onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="absolute top-3.5 -right-3 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground hover:text-sidebar-accent-foreground shadow-elev-1"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {/* Primary CTA */}
        <Link
          to="/slice"
          onClick={(e) => handleNavClick(e, "/slice")}
          className={cn(
            "group mb-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-[13px] font-medium text-primary-foreground transition-all hover:shadow-elev-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
            collapsed && "px-0"
          )}
          title={collapsed ? "New conversion" : undefined}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span>New conversion</span>}
        </Link>

        {/* Section label */}
        {!collapsed && (
          <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/50 font-mono">
            Menu
          </p>
        )}

        {/* Nav */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                    style={{ boxShadow: "0 0 10px hsl(var(--primary) / 0.7)" }}
                  />
                )}
                <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-primary" : "text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground")} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / account */}
      <div className="border-t border-sidebar-border p-3">
        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <Avatar className="h-9 w-9 shrink-0 ring-1 ring-sidebar-border">
            <AvatarFallback className="bg-primary/15 text-primary text-[12px] font-semibold leading-none">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-sidebar-accent-foreground">
                {profile?.full_name || "User"}
              </p>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1 text-[11.5px] text-sidebar-foreground/60 hover:text-sidebar-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                <LogOut className="h-3 w-3" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

export function AppSidebar({ collapsed = false, onToggle, onNavigate }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "relative hidden md:flex flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        <SidebarContent collapsed={collapsed} onToggle={onToggle} onNavigate={onNavigate} />
      </div>
    </aside>
  );
}
