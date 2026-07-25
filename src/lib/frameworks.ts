import type { Framework, FrameworkMeta } from "./types"

export const FRAMEWORKS: FrameworkMeta[] = [
  { id: "tailwind", label: "Tailwind CSS", desc: "Utility-first HTML", ext: "html", lang: "html" },
  { id: "react-tsx", label: "React TSX", desc: "TypeScript + JSX", ext: "tsx", lang: "tsx" },
  { id: "vue-sfc", label: "Vue 3 SFC", desc: "Composition API", ext: "vue", lang: "html" },
  { id: "bootstrap5", label: "Bootstrap 5", desc: "Grid + components", ext: "html", lang: "html" },
  { id: "native-html", label: "HTML + CSS", desc: "Semantic & vanilla", ext: "html", lang: "html" },
  { id: "nextjs", label: "Next.js", desc: "App Router ready", ext: "tsx", lang: "tsx" },
  { id: "svelte", label: "Svelte 5", desc: "Runes syntax", ext: "svelte", lang: "html" },
  { id: "flutter", label: "Flutter", desc: "Dart widget tree", ext: "dart", lang: "dart" },
]

export function getFramework(id: Framework): FrameworkMeta {
  return FRAMEWORKS.find((fw) => fw.id === id) || FRAMEWORKS[0]
}
