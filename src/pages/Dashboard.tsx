import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { AppLayout } from "@/components/AppLayout"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Loader2, Code2, ArrowUpRight, Sparkles } from "lucide-react"
import { getConversions } from "@/lib/conversionService"
import type { Conversion } from "@/lib/types"
import { FRAMEWORKS } from "@/lib/frameworks"
import { formatDistanceToNow } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts"
import { NeonPatternDefs } from "@/components/NeonPatternDefs"
import { useNeonCharts } from "@/hooks/use-neon-charts"

const FRAMEWORK_COLORS: Record<string, string> = {
  tailwind: "hsl(217, 91%, 60%)",
  "react-tsx": "hsl(0, 84%, 60%)",
  "vue-sfc": "hsl(152, 66%, 50%)",
  bootstrap5: "hsl(25, 95%, 53%)",
  "native-html": "hsl(220, 13%, 46%)",
  nextjs: "hsl(0, 0%, 0%)",
  svelte: "hsl(347, 66%, 60%)"
}

export default function Dashboard() {
  // Conversions are keyed by user.id — the same id useConvert writes with.
  // (Previously fetched by profile.id, which never matched; standardized in P3.)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const { getFill } = useNeonCharts()

  useEffect(() => {
    const fetchConversions = async () => {
      if (!user?.id) return
      try {
        const data = await getConversions(user.id)
        setConversions(data)
      } catch (err) {
        console.error("Failed to fetch conversions:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchConversions()
  }, [user])

  const filtered = conversions.filter(c =>
    c.original_image_name.toLowerCase().includes(search.toLowerCase()) ||
    c.framework.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    total: conversions.length,
    thisMonth: conversions.filter(c => {
      const createdAt = new Date(c.created_at)
      const now = new Date()
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
    }).length
  }

  const frameworkData = useMemo(() => {
    const c: Record<string, number> = {}
    conversions.forEach(conv => {
      c[conv.framework] = (c[conv.framework] || 0) + 1
    })
    return FRAMEWORKS.map(fw => ({
      framework: fw.label,
      count: c[fw.id] || 0,
      fill: FRAMEWORK_COLORS[fw.id]
    })).filter(d => d.count > 0)
  }, [conversions])

  const frameworkChartConfig: ChartConfig = Object.fromEntries(
    FRAMEWORKS.map(fw => [fw.id, { label: fw.label, color: FRAMEWORK_COLORS[fw.id] }])
  )

  const headerActions = (
    <Button asChild size="sm" className="h-8 gap-1.5">
      <Link to="/slice">
        <Plus className="h-3.5 w-3.5" />
        New conversion
      </Link>
    </Button>
  )

  if (loading) {
    return (
      <AppLayout title="Dashboard" actions={headerActions}>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[92px] rounded-md" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton className="h-[280px] rounded-md" />
                <Skeleton className="h-[280px] rounded-md" />
              </div>
              <Skeleton className="h-64 rounded-md" />
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Dashboard" actions={headerActions}>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">
            <NeonPatternDefs colors={Object.values(FRAMEWORK_COLORS)} />

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total conversions", value: counts.total, sub: "All time" },
                { label: "This month", value: counts.thisMonth, sub: "Current month" },
                { label: "Frameworks used", value: frameworkData.length, sub: "Active stacks" },
                { label: "Success rate", value: "100%", sub: "Completed" }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_40px_-18px_rgba(0,0,0,0.35)]"
                >
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-medium mt-1.5 tabular-nums">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>

            {frameworkData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/25">
                  <p className="text-[13px] font-medium mb-1">Conversions by framework</p>
                  <p className="text-[12px] text-muted-foreground mb-4">Most used frameworks</p>
                  <ChartContainer config={frameworkChartConfig} className="h-[200px] w-full">
                    <BarChart data={frameworkData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="framework" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {frameworkData.map((entry, i) => <Cell key={i} {...getFill(entry.fill)} />)}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/25">
                  <p className="text-[13px] font-medium mb-1">Framework distribution</p>
                  <p className="text-[12px] text-muted-foreground mb-4">Breakdown by framework</p>
                  <ChartContainer config={frameworkChartConfig} className="h-[200px] w-full">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie data={frameworkData} dataKey="count" nameKey="framework" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                        {frameworkData.map((entry, i) => <Cell key={i} {...getFill(entry.fill)} />)}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search conversions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 text-[13px] bg-background"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Image</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Framework</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Options</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Created</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-muted-foreground text-[13px]">
                        {conversions.length === 0 ? (
                          <div className="space-y-2">
                            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <p className="font-medium text-foreground">No conversions yet</p>
                            <p className="text-[12px] text-muted-foreground">Upload a screenshot and generate your first component.</p>
                            <Button asChild variant="outline" size="sm" className="gap-1.5 mt-1">
                              <Link to="/slice">
                                <Plus className="h-3.5 w-3.5" />
                                Start your first conversion
                              </Link>
                            </Button>
                          </div>
                        ) : (
                          "No conversions found"
                        )}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((conv) => (
                      <tr
                        key={conv.id}
                        className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors group"
                        onClick={() => navigate(`/slice?conversion=${conv.id}`)}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg border border-border bg-muted/50 overflow-hidden shrink-0">
                              <img src={conv.original_image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium truncate block max-w-[150px]">{conv.original_image_name}</span>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                Open <ArrowUpRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className="text-xs">
                            {FRAMEWORKS.find(f => f.id === conv.framework)?.label || conv.framework}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1 flex-wrap">
                            {conv.options.responsive && <Badge variant="secondary" className="text-[10px] px-1.5">R</Badge>}
                            {conv.options.semanticHtml && <Badge variant="secondary" className="text-[10px] px-1.5">S</Badge>}
                            {conv.options.darkMode && <Badge variant="secondary" className="text-[10px] px-1.5">D</Badge>}
                            {conv.options.a11y && <Badge variant="secondary" className="text-[10px] px-1.5">A</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground text-[12px] whitespace-nowrap">
                          {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              conv.status === "completed"
                                ? "bg-success/15 text-success"
                                : "bg-destructive/15 text-destructive"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${conv.status === "completed" ? "bg-success" : "bg-destructive"}`} />
                            {conv.status}
                          </span>
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
    </AppLayout>
  )
}
