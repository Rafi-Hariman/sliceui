import { describe, it, expect } from "vitest"
import { FRAMEWORKS, getFramework } from "./frameworks"
import type { Framework } from "./types"

describe("FRAMEWORKS", () => {
  it("ships all 8 frameworks including flutter", () => {
    expect(FRAMEWORKS.map((f) => f.id)).toEqual<Framework[]>([
      "tailwind", "react-tsx", "vue-sfc", "bootstrap5",
      "native-html", "nextjs", "svelte", "flutter",
    ])
  })
})

describe("getFramework", () => {
  it("returns matching metadata", () => {
    expect(getFramework("react-tsx").label).toBe("React TSX")
    expect(getFramework("flutter").ext).toBe("dart")
    expect(getFramework("flutter").lang).toBe("dart")
  })

  it("falls back to the first framework for an unknown id", () => {
    expect(getFramework("does-not-exist" as Framework).id).toBe("tailwind")
  })
})
