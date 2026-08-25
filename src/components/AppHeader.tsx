import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Sun, Moon, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppHeaderProps {
  title: string;
  /** Extra actions rendered to the left of the theme toggle (e.g. "New conversion"). */
  actions?: React.ReactNode;
}

/**
 * Shared page header for the AppLayout shell.
 * Centralizes the theme toggle and user menu so pages don't each re-implement it.
 */
export function AppHeader({ title, actions }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { profile, user, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex items-center justify-between gap-2 px-4 md:px-6 h-11 border-b border-border shrink-0 bg-background/80 backdrop-blur-xl">
      <h1 className="text-[13px] font-medium truncate">{title}</h1>

      <div className="flex items-center gap-2 shrink-0">
        {actions}

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* User menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Account menu">
              <Avatar className="h-6 w-6">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] leading-none">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align="end">
            <div className="p-3 border-b border-border">
              <p className="text-[13px] font-medium truncate">{profile?.full_name || "User"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email || "Not signed in"}</p>
            </div>
            <div className="p-1">
              <Link to="/settings">
                <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-[13px] gap-2">
                  <SettingsIcon className="h-3.5 w-3.5" />
                  Settings
                </Button>
              </Link>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start h-8 text-[13px] gap-2 text-destructive hover:text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
