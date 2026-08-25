import { Switch } from "@/components/ui/switch"
import type { ConversionOptions } from "@/lib/types"

interface OptionsBarProps {
  options: ConversionOptions
  onChange: (options: ConversionOptions) => void
}

const OPTION_ITEMS: { key: keyof ConversionOptions; label: string; hint: string }[] = [
  { key: "responsive", label: "Responsive", hint: "Mobile-first breakpoints" },
  { key: "semanticHtml", label: "Semantic", hint: "Semantic HTML5" },
  { key: "darkMode", label: "Dark mode", hint: "Dark variant" },
  { key: "a11y", label: "A11y", hint: "ARIA + labels" },
]

export default function OptionsBar({ options, onChange }: OptionsBarProps) {
  const toggle = (key: keyof ConversionOptions) => {
    onChange({ ...options, [key]: !options[key] })
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {OPTION_ITEMS.map((item) => (
        <label
          key={item.key}
          className="flex cursor-pointer items-center gap-2 select-none"
          title={item.hint}
        >
          <Switch
            checked={options[item.key]}
            onCheckedChange={() => toggle(item.key)}
            aria-label={item.label}
          />
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </label>
      ))}
    </div>
  )
}
