import { supabase } from "@/integrations/supabase/client"

// Mirrors the server-side FREE_DAILY_LIMIT in supabase/functions/convert/index.ts.
// Kept client-side only for the usage indicator; the edge function is the real
// authority (it counts successes and returns 429 on the 6th).
export const FREE_DAILY_LIMIT = 5

export interface EntitlementData {
  plan: "free" | "pro"
  balance: number
  usedToday: number
}

/**
 * Reads entitlement from existing tables (no new RPC):
 *  - `credits` (owner-readable via RLS) → plan + balance
 *  - `usage_log` (owner-readable via RLS) → today's successful conversions
 *
 * `usedToday` counts successes gte today, matching the edge function's quota
 * math exactly so the indicator never disagrees with enforcement.
 */
export async function getEntitlement(userId: string): Promise<EntitlementData> {
  const today = new Date().toISOString().slice(0, 10)

  const [creditsRes, usageRes] = await Promise.all([
    supabase
      .from("credits")
      .select("balance, plan")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("usage_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "success")
      .gte("created_at", today),
  ])

  return {
    plan: creditsRes.data?.plan === "pro" ? "pro" : "free",
    balance: creditsRes.data?.balance ?? 0,
    usedToday: usageRes.count ?? 0,
  }
}
