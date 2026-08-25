import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FRAMEWORKS, getFramework } from "@/lib/frameworks"
import type { Framework } from "@/lib/types"

interface FrameworkDropdownProps {
  value: Framework
  onChange: (framework: Framework) => void
  disabled?: boolean
}

// Compact icon badge per framework, kept in sync with the previous grid.
const FRAMEWORK_ICONS: Record<string, { label: string; className: string }> = {
  tailwind:   { label: "TW", className: "text-cyan-500" },
  "react-tsx":{ label: "Re", className: "text-blue-500" },
  "vue-sfc":  { label: "Vu", className: "text-green-500" },
  bootstrap5: { label: "BS", className: "text-purple-500" },
  "native-html": { label: "HT", className: "text-orange-500" },
  nextjs:     { label: "Nx", className: "text-gray-900 dark:text-gray-100" },
  svelte:     { label: "Sv", className: "text-red-500" },
}

export default function FrameworkDropdown({
  value,
  onChange,
  disabled,
}: FrameworkDropdownProps) {
  const current = getFramework(value)

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as Framework)}
      disabled={disabled}
    >
      <SelectTrigger
        className="w-full sm:w-56 h-10 gap-2 bg-background"
        aria-label="Select output framework"
      >
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-sidebar text-[10px] font-bold ${FRAMEWORK_ICONS[value]?.className ?? ""}`}
        >
          {FRAMEWORK_ICONS[value]?.label ?? value.slice(0, 2).toUpperCase()}
        </span>
        <SelectValue asChild>
          <span className="text-sm font-medium truncate">{current.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {FRAMEWORKS.map((fw) => (
          <SelectItem key={fw.id} value={fw.id}>
            <span className="flex items-center gap-2">
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded border border-border bg-sidebar text-[9px] font-bold ${FRAMEWORK_ICONS[fw.id]?.className ?? ""}`}
              >
                {FRAMEWORK_ICONS[fw.id]?.label ?? fw.id.slice(0, 2).toUpperCase()}
              </span>
              <span className="flex flex-col leading-tight">
                <span>{fw.label}</span>
                <span className="text-[10px] text-muted-foreground">{fw.desc}</span>
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
