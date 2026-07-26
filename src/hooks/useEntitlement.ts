import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { getEntitlement, FREE_DAILY_LIMIT } from "@/lib/usageService"

/**
 * Owner entitlement for the usage indicator (plan, balance, today's quota use).
 * `useInvalidateEntitlement` is called after each conversion so the chip
 * increments immediately.
 */
export function useEntitlement() {
  const { user } = useAuth()
  const userId = user?.id ?? ""

  const query = useQuery({
    queryKey: ["entitlement", userId],
    queryFn: () => getEntitlement(userId),
    enabled: !!userId,
    staleTime: 30_000,
  })

  const data = query.data
  const plan = data?.plan ?? "free"
  const usedToday = data?.usedToday ?? 0
  const balance = data?.balance ?? 0

  return {
    plan,
    balance,
    usedToday,
    freeLimit: FREE_DAILY_LIMIT,
    remainingToday: Math.max(0, FREE_DAILY_LIMIT - usedToday),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}

export function useInvalidateEntitlement() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ["entitlement"] })
}
