import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { AppLayout } from "@/components/AppLayout"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Loader2, Trash2, Sun, Moon, Settings as SettingsIcon } from "lucide-react"
import { getConversions, deleteConversion } from "@/lib/conversionService"
import { deleteSliceImage } from "@/lib/storageService"
import { toast } from "sonner"
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
  svelte: "hsl(347, 66%, 60%)",
  flutter: "hsl(182, 72%, 45%)"
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [theme, setThemeState] = useState<string>(() => {
    if (typeof window !== "undefined") return document.documentElement.classList.contains("dark") ? "dark" : "light"
    return "dark"
  })
  const { getFill } = useNeonCharts()

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  const toggleTheme = (value: string) => {
    setThemeState(value)
    if (value === "dark") {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

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

  const handleDelete = async (e: React.MouseEvent, id: string, imageUrl: string) => {
    e.stopPropagation()
    try {
      // Best-effort storage cleanup: derive object path from the public URL.
      const path = imageUrl.split("/object/public/sliceui-images/")[1]
      if (path) await deleteSliceImage(path)
      await deleteConversion(id)
      setConversions(prev => prev.filter(c => c.id !== id))
      toast.success("Conversion deleted")
    } catch (err) {
      console.error("Failed to delete conversion:", err)
      toast.error("Failed to delete conversion")
    }
  }

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
    }).length,
    completed: conversions.filter(c => c.status === "completed").length
  }

  const successRate = counts.total === 0 ? "—" : `${Math.round((counts.completed / counts.total) * 100)}%`

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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 md:px-6 h-11 border-b border-border shrink-0">
          <h1 className="text-[13px] font-medium">Dashboard</h1>
          <div className="flex items-center gap-2">
            {/* Theme Toggle - Single Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleTheme(theme === "dark" ? "light" : "dark")}
              className="h-7 w-7"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </Button>

            {/* Avatar with Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[9px] leading-none">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0" align="end">
                <div className="p-3 border-b border-border">
                  <p className="text-[13px] font-medium">{profile?.full_name || "User"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email || ""}</p>
                </div>
                <div className="p-1">
                  <Link to="/settings">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-7 text-[12px] gap-1.5">
                      <SettingsIcon className="h-3 w-3" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">
            <NeonPatternDefs colors={Object.values(FRAMEWORK_COLORS)} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-md overflow-hidden">
              {[
                { label: "Total conversions", value: counts.total },
                { label: "This month", value: counts.thisMonth },
                { label: "Frameworks used", value: frameworkData.length },
                { label: "Success rate", value: successRate }
              ].map((stat) => (
                <div key={stat.label} className="bg-background p-4">
                  <p className="text-[12px] text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-medium mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

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

            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search conversions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-[13px] bg-transparent"
                />
              </div>
            </div>

            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-[13px]">
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground text-[13px]">
                        {conversions.length === 0 ? (
                          <div className="space-y-2">
                            <p>No conversions yet</p>
                            <Button asChild variant="link" size="sm" className="h-auto p-0">
                              <Link to="/slice">Start your first conversion →</Link>
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
                        className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/slice?conversion=${conv.id}`)}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <img src={conv.original_image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium truncate max-w-[150px]">{conv.original_image_name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-xs">
                            {FRAMEWORKS.find(f => f.id === conv.framework)?.label || conv.framework}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1 flex-wrap">
                            {conv.options.responsive && <Badge variant="secondary" className="text-[10px] px-1.5">R</Badge>}
                            {conv.options.semanticHtml && <Badge variant="secondary" className="text-[10px] px-1.5">S</Badge>}
                            {conv.options.darkMode && <Badge variant="secondary" className="text-[10px] px-1.5">D</Badge>}
                            {conv.options.a11y && <Badge variant="secondary" className="text-[10px] px-1.5">A</Badge>}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground text-[12px] whitespace-nowrap">
                          {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={conv.status === "completed" ? "default" : "destructive"} className="text-xs">
                            {conv.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handleDelete(e, conv.id, conv.original_image_url)}
                            title="Delete conversion"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
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
