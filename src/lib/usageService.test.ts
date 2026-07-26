import { describe, it, expect, vi, beforeEach } from "vitest"

// Mutable state shared between the mocked supabase factory and the tests.
// vi.hoisted keeps it in scope for the hoisted vi.mock factory.
const state = vi.hoisted(() => ({
  creditsData: { data: null as { balance: number; plan: string } | null },
  usageCount: 0,
}))

vi.mock("@/integrations/supabase/client", () => {
  // A thenable builder: every chain method returns the chain; awaiting the
  // chain resolves to `getTerminal()`. This mirrors supabase-js where the
  // builder itself is a Promise.
  const makeChain = (getTerminal: () => unknown) => {
    const c: Record<string, unknown> = {}
    c.select = vi.fn(() => c)
    c.eq = vi.fn(() => c)
    c.gte = vi.fn(() => c)
    c.maybeSingle = vi.fn(() => c)
    c.then = (resolve: (v: unknown) => void) =>
      Promise.resolve(getTerminal()).then(resolve)
    return c
  }
  return {
    supabase: {
      from: vi.fn((table: string) =>
        table === "credits"
          ? makeChain(() => state.creditsData)
          : makeChain(() => ({ count: state.usageCount })),
      ),
    },
  }
})

import { getEntitlement, FREE_DAILY_LIMIT } from "./usageService"

describe("getEntitlement", () => {
  beforeEach(() => {
    state.creditsData = { data: null }
    state.usageCount = 0
    vi.clearAllMocks()
  })

  it("reads a free plan with today's success count", async () => {
    state.creditsData = { data: { balance: 0, plan: "free" } }
    state.usageCount = 3
    const e = await getEntitlement("u1")
    expect(e).toEqual({ plan: "free", balance: 0, usedToday: 3 })
  })

  it("reads a pro plan with its credit balance", async () => {
    state.creditsData = { data: { balance: 42, plan: "pro" } }
    state.usageCount = 99
    const e = await getEntitlement("u1")
    expect(e).toEqual({ plan: "pro", balance: 42, usedToday: 99 })
  })

  it("defaults to free + zero when there is no credits row", async () => {
    state.creditsData = { data: null }
    const e = await getEntitlement("u1")
    expect(e).toEqual({ plan: "free", balance: 0, usedToday: 0 })
  })

  it("exports the free daily limit constant", () => {
    expect(FREE_DAILY_LIMIT).toBe(5)
  })
})
