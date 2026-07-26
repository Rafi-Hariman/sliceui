import { useMemo } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts"
import { ArrowRight, Loader2 } from "lucide-react"

import { AppLayout } from "@/components/AppLayout"
import { AppHeader } from "@/components/AppHeader"
import { NeonPatternDefs } from "@/components/NeonPatternDefs"
import { useNeonCharts } from "@/hooks/use-neon-charts"
import { useConversions } from "@/hooks/useConversions"
import { FRAMEWORKS, getFramework } from "@/lib/frameworks"
import type { Framework } from "@/lib/types"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const FRAMEWORK_COLORS: Record<string, string> = {
  tailwind: "hsl(217, 91%, 60%)",
  "react-tsx": "hsl(0, 84%, 60%)",
  "vue-sfc": "hsl(152, 66%, 50%)",
  bootstrap5: "hsl(25, 95%, 53%)",
  "native-html": "hsl(220, 13%, 46%)",
  nextjs: "hsl(0, 0%, 0%)",
  svelte: "hsl(347, 66%, 60%)",
}

export default function Dashboard() {
  const { data: conversions = [], isLoading } = useConversions()
  const { getFill } = useNeonCharts()

  const counts = useMemo(() => {
    const thisMonth = conversions.filter((c) => {
      const createdAt = new Date(c.created_at)
      const now = new Date()
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
    }).length
    const completed = conversions.filter((c) => c.status === "completed").length
    return {
      total: conversions.length,
      thisMonth,
      completed,
    }
  }, [conversions])

  const successRate = counts.total === 0 ? "—" : `${Math.round((counts.completed / counts.total) * 100)}%`

  const frameworkData = useMemo(() => {
    const c: Record<string, number> = {}
    conversions.forEach((conv) => {
      c[conv.framework] = (c[conv.framework] || 0) + 1
    })
    return FRAMEWORKS.map((fw) => ({
      framework: fw.label,
      count: c[fw.id] || 0,
      fill: FRAMEWORK_COLORS[fw.id],
    })).filter((d) => d.count > 0)
  }, [conversions])

  const frameworkChartConfig: ChartConfig = Object.fromEntries(
    FRAMEWORKS.map((fw) => [fw.id, { label: fw.label, color: FRAMEWORK_COLORS[fw.id] }]),
  )

  const recent = conversions.slice(0, 5)

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <AppHeader title="Dashboard" />

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">
            <NeonPatternDefs colors={Object.values(FRAMEWORK_COLORS)} />

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-md overflow-hidden">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-background p-4">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-7 w-12" />
                  </div>
                ))
              ) : (
                [
                  { label: "Total conversions", value: counts.total },
                  { label: "This month", value: counts.thisMonth },
                  { label: "Frameworks used", value: frameworkData.length },
                  { label: "Success rate", value: successRate },
                ].map((stat) => (
                  <div key={stat.label} className="bg-background p-4">
                    <p className="text-[12px] text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-medium mt-1">{stat.value}</p>
                  </div>
                ))
              )}
            </div>

            {conversions.length === 0 && !isLoading ? (
              <div className="border border-dashed border-border rounded-md p-10 text-center">
                <p className="text-[13px] text-muted-foreground mb-3">No conversions yet</p>
                <Button asChild size="sm">
                  <Link to="/slice">Start your first conversion</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Charts */}
                {frameworkData.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border rounded-md overflow-hidden">
                    <div className="bg-background p-4">
                      <p className="text-[13px] font-medium mb-1">Conversions by framework</p>
                      <p className="text-[12px] text-muted-foreground mb-4">Most used frameworks</p>
                      <ChartContainer config={frameworkChartConfig} className="h-[200px] w-full">
                        <BarChart data={frameworkData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="framework" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" radius={0}>
                            {frameworkData.map((entry, i) => <Cell key={i} {...getFill(entry.fill)} />)}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </div>
                    <div className="bg-background p-4">
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

                {/* Recent activity */}
                <div className="border border-border rounded-md overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                    <p className="text-[13px] font-medium">Recent activity</p>
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-[12px] gap-1">
                      <Link to="/history">
                        View all <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                  <div className="divide-y divide-border">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                          <Skeleton className="h-8 w-8 rounded" />
                          <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3 w-40" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-5 w-20" />
                        </div>
                      ))
                    ) : recent.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto" />}
                      </div>
                    ) : (
                      recent.map((conv) => (
                        <Link
                          key={conv.id}
                          to={`/slice?conversion=${conv.id}`}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                        >
                          <div className="w-8 h-8 rounded bg-muted overflow-hidden shrink-0">
                            <img src={conv.original_image_url} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium truncate">{conv.original_image_name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {getFramework(conv.framework as Framework).label}
                          </Badge>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
