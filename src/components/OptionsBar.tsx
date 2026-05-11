import type { ConversionOptions } from "@/lib/types"

interface OptionsBarProps {
  options: ConversionOptions
  onChange: (options: ConversionOptions) => void
}

interface OptionConfig {
  key: keyof ConversionOptions
  label: string
}

const OPTIONS: OptionConfig[] = [
  { key: "responsive", label: "Responsive" },
  { key: "semanticHtml", label: "Semantic HTML" },
  { key: "darkMode", label: "Dark mode" },
  { key: "a11y", label: "A11y" }
]

export default function OptionsBar({ options, onChange }: OptionsBarProps) {
  const toggle = (key: keyof ConversionOptions) => {
    onChange({
      ...options,
      [key]: !options[key]
    })
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Options
      </h3>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium border transition-all
              ${options[opt.key]
                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
