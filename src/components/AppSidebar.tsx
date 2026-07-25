import { LayoutDashboard, Scissors, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
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

      // Navigate after animation completes (300ms matches transition duration)
      setTimeout(() => {
        setNavigatingTo(path);
      }, 300);
    } else if (onNavigate) {
      onNavigate();
    }
  };

  // Handle navigation after expansion animation
  useEffect(() => {
    if (navigatingTo) {
      navigate(navigatingTo);
      setNavigatingTo(null);
    }
  }, [navigatingTo, navigate]);

  return (
    <>
      {/* Workspace header */}
      <div className="flex items-center justify-between gap-2 px-3 h-11 border-b border-sidebar-border">
        <div className="flex items-center gap-2 min-w-0">
          <StackedLogo size={16} color="currentColor" />
          {!collapsed && (
            <span className="font-bold uppercase tracking-[0.08em] text-[14px] text-sidebar-accent-foreground">
              SliceUI
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-7 w-7 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-1.5 px-1.5 space-y-px">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={(e) => handleNavClick(e, item.path)}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2 px-1">
          <Avatar className="h-5 w-5 shrink-0">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[9px] leading-none">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="text-[12px] text-sidebar-foreground truncate flex-1">
              {profile?.full_name || "User"}
            </span>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              aria-label="Sign out"
              className="text-sidebar-foreground hover:bg-sidebar-accent h-7 w-7 shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
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
        "hidden md:flex flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 transition-all duration-300 ease-in-out",
        collapsed ? "w-[60px]" : "w-52"
      )}
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        <SidebarContent collapsed={collapsed} onToggle={onToggle} onNavigate={onNavigate} />
      </div>
    </aside>
  );
}
