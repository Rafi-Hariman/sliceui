import { describe, it, expect } from "vitest"
import { FRAMEWORKS, getFramework } from "./frameworks"
import type { Framework } from "./types"

describe("FRAMEWORKS", () => {
  it("ships all 7 web frameworks", () => {
    expect(FRAMEWORKS.map((f) => f.id)).toEqual<Framework[]>([
      "tailwind", "react-tsx", "vue-sfc", "bootstrap5",
      "native-html", "nextjs", "svelte",
    ])
  })
})

describe("getFramework", () => {
  it("returns matching metadata", () => {
    expect(getFramework("react-tsx").label).toBe("React TSX")
    expect(getFramework("vue-sfc").ext).toBe("vue")
    expect(getFramework("vue-sfc").lang).toBe("html")
  })

  it("falls back to the first framework for an unknown id", () => {
    expect(getFramework("does-not-exist" as Framework).id).toBe("tailwind")
  })
})
