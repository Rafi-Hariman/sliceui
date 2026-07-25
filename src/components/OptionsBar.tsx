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
      <h3 className="text-sm font-medium text-foreground">
        Options
      </h3>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            aria-pressed={!!options[opt.key]}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
              ${options[opt.key]
                ? "bg-primary/15 text-primary border-primary/40"
                : "bg-background text-muted-foreground border-border hover:border-muted-foreground/40 hover:text-foreground"
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
