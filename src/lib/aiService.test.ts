import { describe, it, expect } from "vitest"
import { clean } from "./aiService"

describe("clean", () => {
  it("strips a leading ```lang fence and trailing ```", () => {
    expect(clean("```tsx\nexport default function X() {}\n```")).toBe(
      "export default function X() {}"
    )
  })

  it("leaves code without fences untouched (apart from trim)", () => {
    expect(clean("const a = 1")).toBe("const a = 1")
  })

  it("trims surrounding whitespace", () => {
    expect(clean("\n\n  code here  \n")).toBe("code here")
  })
})
