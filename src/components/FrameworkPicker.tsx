import { FRAMEWORKS } from "@/lib/frameworks"
import type { Framework } from "@/lib/types"

interface FrameworkPickerProps {
  selected: Framework
  onChange: (framework: Framework) => void
}

export default function FrameworkPicker({ selected, onChange }: FrameworkPickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Framework
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {FRAMEWORKS.map((fw) => (
          <button
            key={fw.id}
            type="button"
            onClick={() => onChange(fw.id)}
            className={`
              p-3 rounded-xl border text-left transition-all
              ${selected === fw.id
                ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20 ring-2 ring-violet-500"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }
            `}
          >
            <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {fw.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {fw.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
