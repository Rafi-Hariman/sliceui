import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { getConversions } from "@/lib/conversionService"
import type { Conversion } from "@/lib/types"

/**
 * Shared conversions cache. Dashboard (charts + recent activity) and History
 * (full list) both read from the same `["conversions", userId]` query so a
 * generate / delete / regenerate anywhere refreshes both views.
 */
export function useConversions() {
  const { user } = useAuth()
  const userId = user?.id ?? ""

  return useQuery<Conversion[]>({
    queryKey: ["conversions", userId],
    queryFn: () => getConversions(userId),
    enabled: !!userId,
  })
}

export function useInvalidateConversions() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ["conversions"] })
}
