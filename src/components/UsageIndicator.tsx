import { Gauge, Zap } from "lucide-react"
import { useEntitlement } from "@/hooks/useEntitlement"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Compact entitlement chip for the app header. Mirrors server-side enforcement:
 * free = `used / 5 today`, pro = credit balance. Color states: ok / near-limit
 * (amber) / exhausted (destructive). The full state is exposed via aria-label.
 */
export function UsageIndicator() {
  const { plan, balance, usedToday, freeLimit, remainingToday, isLoading } =
    useEntitlement()

  const isFree = plan !== "pro"
  const exhausted = isFree && remainingToday === 0
  const nearLimit = isFree && !exhausted && remainingToday <= 1
  const proLow = !isFree && balance <= 3

  const tone = exhausted
    ? "text-destructive border-destructive/40"
    : nearLimit || proLow
      ? "text-amber-500 dark:text-amber-400 border-amber-500/40"
      : "text-muted-foreground"

  const label = isFree ? `${usedToday} / ${freeLimit} today` : `${balance} credits`
  const ariaLabel = isFree
    ? `${usedToday} of ${freeLimit} free conversions used today${exhausted ? ", daily limit reached" : ""}`
    : `${balance} credits remaining`
  const Icon = isFree ? Gauge : Zap

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-1.5 h-8 px-2.5 rounded-md border bg-background text-[12px] font-medium tabular-nums",
            tone,
          )}
          role="status"
          aria-label={ariaLabel}
          data-testid="usage-indicator"
        >
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{isLoading ? "…" : label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {isFree
          ? `Free plan — ${remainingToday} of ${freeLimit} conversions left today (resets tomorrow).`
          : `Pro plan — ${balance} credits remaining.`}
      </TooltipContent>
    </Tooltip>
  )
}
