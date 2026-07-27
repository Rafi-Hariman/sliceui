import { Link } from "react-router-dom"
import { useTheme } from "next-themes"
import { Sun, Moon, LogOut, Settings as SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UsageIndicator } from "@/components/UsageIndicator"
import { useAuth } from "@/contexts/AuthContext"

interface AppHeaderProps {
  title: string
}

function initialsOf(name?: string | null) {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"
}

/**
 * Shared page header: title + entitlement indicator + theme toggle (single
 * source via next-themes) + avatar popover with Settings and Sign out.
 * Used by Dashboard, Slice, and History so theme/account controls are singular.
 */
export function AppHeader({ title }: AppHeaderProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { profile, user, signOut } = useAuth()
  const current = (theme === "system" ? resolvedTheme : theme) ?? "dark"
  const initials = initialsOf(profile?.full_name)

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8 h-14 border-b border-border bg-background shrink-0">
      <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">
        <UsageIndicator />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(current === "dark" ? "light" : "dark")}
          className="h-9 w-9"
          aria-label={`Switch to ${current === "dark" ? "light" : "dark"} mode`}
          aria-pressed={current === "dark"}
          title={`Switch to ${current === "dark" ? "light" : "dark"} mode`}
        >
          {current === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              aria-label={
                profile?.full_name ? `Account: ${profile.full_name}` : "Account"
              }
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] leading-none">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="end">
            <div className="p-3 border-b border-border">
              <p className="text-[13px] font-medium">{profile?.full_name || "User"}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
            <div className="p-1">
              <Link to="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs gap-1.5"
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                  Settings
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="w-full justify-start h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
