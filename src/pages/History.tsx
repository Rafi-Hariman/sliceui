import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import {
  Search,
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
  Copy,
  Download,
  FileJson,
  Trash2,
} from "lucide-react"

import { AppLayout } from "@/components/AppLayout"
import { AppHeader } from "@/components/AppHeader"
import {
  useConversions,
  useInvalidateConversions,
} from "@/hooks/useConversions"
import { deleteConversion } from "@/lib/conversionService"
import { deleteSliceImage } from "@/lib/storageService"
import { FRAMEWORKS, getFramework } from "@/lib/frameworks"
import type { Conversion, Framework } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const RANGES = [
  { value: "all", label: "All time", days: 0 },
  { value: "30", label: "Last 30 days", days: 30 },
  { value: "7", label: "Last 7 days", days: 7 },
] as const

type RangeValue = (typeof RANGES)[number]["value"]

const DAY_MS = 86_400_000

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "sliceui"
}

export default function History() {
  const { data: conversions = [], isLoading, isError } = useConversions()
  const invalidateConversions = useInvalidateConversions()

  const [q, setQ] = useState("")
  const [frameworkFilter, setFrameworkFilter] = useState<Framework | "all">("all")
  const [range, setRange] = useState<RangeValue>("all")
  const [pendingDelete, setPendingDelete] = useState<Conversion | null>(null)

  const rangeDays = RANGES.find((r) => r.value === range)?.days ?? 0

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return conversions.filter((c) => {
      if (frameworkFilter !== "all" && c.framework !== frameworkFilter) return false
      if (needle && !`${c.original_image_name} ${c.framework}`.toLowerCase().includes(needle))
        return false
      if (rangeDays > 0 && Date.now() - new Date(c.created_at).getTime() > rangeDays * DAY_MS)
        return false
      return true
    })
  }, [conversions, q, frameworkFilter, rangeDays])

  async function copyCode(conv: Conversion) {
    try {
      await navigator.clipboard.writeText(conv.generated_code)
      toast.success("Code copied")
    } catch {
      toast.error("Failed to copy code")
    }
  }

  function downloadCode(conv: Conversion) {
    const ext = getFramework(conv.framework as Framework).ext
    downloadBlob(`${baseName(conv.original_image_name)}.${ext}`, conv.generated_code, "text/plain")
  }

  function exportJson(conv: Conversion) {
    const payload = {
      id: conv.id,
      name: conv.original_image_name,
      framework: conv.framework,
      options: conv.options,
      created_at: conv.created_at,
      code: conv.generated_code,
    }
    downloadBlob(
      `${baseName(conv.original_image_name)}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    )
  }

  function exportAll(items: Conversion[]) {
    if (items.length === 0) {
      toast.error("Nothing to export")
      return
    }
    const payload = items.map((c) => ({
      name: c.original_image_name,
      framework: c.framework,
      options: c.options,
      created_at: c.created_at,
      code: c.generated_code,
    }))
    downloadBlob(
      `sliceui-history-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    )
    toast.success(`Exported ${items.length} conversion${items.length === 1 ? "" : "s"}`)
  }

  async function confirmDelete() {
    const conv = pendingDelete
    setPendingDelete(null)
    if (!conv) return
    try {
      // Best-effort storage cleanup (same path-derivation as Dashboard used).
      const path = conv.original_image_url.split("/object/public/sliceui-images/")[1]
      if (path) await deleteSliceImage(path)
      await deleteConversion(conv.id)
      invalidateConversions()
      toast.success("Conversion deleted")
    } catch (err) {
      console.error("Failed to delete conversion:", err)
      toast.error("Failed to delete conversion")
    }
  }

  const hasAny = conversions.length > 0

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <AppHeader title="History" />

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-4 max-w-[1400px]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or framework…"
                  aria-label="Search conversions"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-8 h-8 text-[13px] bg-transparent"
                  data-testid="history-search"
                />
              </div>

              <Select
                value={frameworkFilter}
                onValueChange={(v) => setFrameworkFilter(v as Framework | "all")}
              >
                <SelectTrigger
                  className="h-8 w-[170px] text-[13px]"
                  aria-label="Filter by framework"
                  data-testid="history-filter-framework"
                >
                  <SelectValue placeholder="Framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All frameworks</SelectItem>
                  {FRAMEWORKS.map((fw) => (
                    <SelectItem key={fw.id} value={fw.id}>
                      {fw.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={range} onValueChange={(v) => setRange(v as RangeValue)}>
                <SelectTrigger
                  className="h-8 w-[150px] text-[13px]"
                  aria-label="Filter by date range"
                  data-testid="history-filter-range"
                >
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  {RANGES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[13px] gap-1.5 ml-auto"
                onClick={() => exportAll(filtered)}
                disabled={filtered.length === 0}
                data-testid="history-export"
              >
                <Download className="h-3.5 w-3.5" />
                Export {filtered.length > 0 ? `(${filtered.length})` : ""}
              </Button>
            </div>

            {/* Table */}
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-[13px]" data-testid="history-table">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left font-medium text-muted-foreground px-3 py-2">Image</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2">Framework</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2">Options</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2">Created</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2">Status</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2 w-10">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-3 py-2"><Skeleton className="h-8 w-40" /></td>
                        <td className="px-3 py-2"><Skeleton className="h-5 w-20" /></td>
                        <td className="px-3 py-2"><Skeleton className="h-5 w-16" /></td>
                        <td className="px-3 py-2"><Skeleton className="h-5 w-20" /></td>
                        <td className="px-3 py-2"><Skeleton className="h-5 w-16" /></td>
                        <td className="px-3 py-2"><Skeleton className="h-8 w-8" /></td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-muted-foreground">
                        {!hasAny ? (
                          <div className="space-y-2">
                            <p>No conversions yet</p>
                            <Button asChild variant="link" size="sm" className="h-auto p-0">
                              <Link to="/slice">Start your first conversion →</Link>
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p>No conversions match your filters</p>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0"
                              onClick={() => {
                                setQ("")
                                setFrameworkFilter("all")
                                setRange("all")
                              }}
                            >
                              Clear filters
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-destructive">
                        Failed to load history.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((conv) => (
                      <tr
                        key={conv.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                        data-testid={`history-row-${conv.id}`}
                      >
                        <td className="px-3 py-2">
                          <Link
                            to={`/slice?conversion=${conv.id}`}
                            className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            <div className="w-8 h-8 rounded bg-muted overflow-hidden shrink-0">
                              <img
                                src={conv.original_image_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium truncate max-w-[180px] hover:text-primary">
                              {conv.original_image_name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-xs">
                            {getFramework(conv.framework as Framework).label}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1 flex-wrap">
                            {conv.options.responsive && (
                              <Badge variant="secondary" className="text-[10px] px-1.5" title="Responsive">R</Badge>
                            )}
                            {conv.options.semanticHtml && (
                              <Badge variant="secondary" className="text-[10px] px-1.5" title="Semantic HTML">S</Badge>
                            )}
                            {conv.options.darkMode && (
                              <Badge variant="secondary" className="text-[10px] px-1.5" title="Dark mode">D</Badge>
                            )}
                            {conv.options.a11y && (
                              <Badge variant="secondary" className="text-[10px] px-1.5" title="Accessibility">A</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground text-[12px] whitespace-nowrap">
                          {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={conv.status === "completed" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {conv.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label={`Actions for ${conv.original_image_name}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/slice?conversion=${conv.id}`} className="flex items-center gap-2">
                                  <ExternalLink className="h-3.5 w-3.5" /> Open
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/slice?conversion=${conv.id}&rerun=1`} className="flex items-center gap-2" data-testid={`history-regenerate-${conv.id}`}>
                                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => copyCode(conv)} className="flex items-center gap-2">
                                <Copy className="h-3.5 w-3.5" /> Copy code
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadCode(conv)} className="flex items-center gap-2">
                                <Download className="h-3.5 w-3.5" /> Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => exportJson(conv)} className="flex items-center gap-2">
                                <FileJson className="h-3.5 w-3.5" /> Export JSON
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setPendingDelete(conv)}
                                className="flex items-center gap-2 text-destructive focus:text-destructive"
                                data-testid={`history-delete-${conv.id}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversion?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.original_image_name} will be permanently removed from your
              history. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
