// SliceUI-specific types

export type Framework =
  | "tailwind"
  | "react-tsx"
  | "vue-sfc"
  | "bootstrap5"
  | "native-html"
  | "nextjs"
  | "svelte"

export interface ConversionOptions {
  responsive: boolean
  semanticHtml: boolean
  darkMode: boolean
  a11y: boolean
}

export interface Conversion {
  id: string
  user_id: string
  original_image_url: string
  original_image_name: string
  framework: Framework
  options: ConversionOptions
  generated_code: string
  status: "pending" | "completed" | "failed"
  error_message: string | null
  created_at: string
}

export interface FrameworkMeta {
  id: Framework
  label: string
  desc: string
  ext: string
  lang: string
}

export interface ConvertResponse {
  code: string
  error?: string
}
