import { describe, it, expect } from "vitest";
import { FRAMEWORKS, getFramework } from "@/lib/frameworks";
import type { Framework } from "@/lib/types";

const ALL_FRAMEWORK_IDS: Framework[] = [
  "tailwind",
  "react-tsx",
  "vue-sfc",
  "bootstrap5",
  "native-html",
  "nextjs",
  "svelte",
];

describe("FRAMEWORKS", () => {
  it("contains all 7 web framework ids", () => {
    const ids = FRAMEWORKS.map((f) => f.id);
    expect(ids).toEqual(ALL_FRAMEWORK_IDS);
  });

  it("resolves an unknown id to the first framework (tailwind)", () => {
    const fallback = getFramework("not-a-real-framework" as Framework);
    expect(fallback.id).toBe("tailwind");
  });
});
