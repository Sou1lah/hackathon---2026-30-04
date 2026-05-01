import {
  AlertTriangle,
  ArrowUpRight,
  CheckSquare,
  FileText,
  LayoutDashboard,
  ShieldAlert,
  Users,
} from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import AdminSuiviStage from "@/components/Admin/AdminSuiviStage"
import { UserManagement } from "@/components/Admin/UserManagement"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "react-i18next"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

// Interfaces matching backend models
interface InternshipOffer {
  id: string
  title: string
  source_url: string
  created_at: string
  university_name?: string | null
  country?: string | null
  country_flag?: string | null
  university_logo?: string | null
}

interface AlertItem {
  id: string
  type: string
  severity: "info" | "warning" | "critical"
  message: string
  dossier_id: string | null
  created_at: string
}

interface SystemHealthItem {
  name: string
  status: "ok" | "degraded" | "down"
  latency: string
}

interface OverviewStats {
  internships: {
    total_internships: number
    latest_internships: InternshipOffer[]
    new_items_7d: number
  }
  dossiers: {
    total_dossiers: number
    active_dossiers: number
    completed_dossiers: number
    pending_dossiers: number
  }
  sla: {
    total_dossiers: number
    on_time_count: number
    breached_count: number
    breach_rate: number
  }
  signature: {
    average_progress: number
    stalled_dossiers: number
    completed_signatures: number
  }
  alerts: AlertItem[]
  system_health: SystemHealthItem[]
  timestamp: string
}

const chartData = [
  { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "May", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Aug", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Sep", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Oct", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Nov", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Dec", total: Math.floor(Math.random() * 5000) + 1000 },
]

const visitorData = [
  { month: "Jan", visitors: 1500 },
  { month: "Feb", visitors: 2200 },
  { month: "Mar", visitors: 1800 },
  { month: "Apr", visitors: 2400 },
  { month: "May", visitors: 2100 },
  { month: "Jun", visitors: 2800 },
]

export default function OverviewDashboard() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const [data, setData] = useState<OverviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
        const token = localStorage.getItem("access_token")

        const response = await fetch(`${apiUrl}/api/v1/overview/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch overview data")
        }
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err: any) {
        setError(err.message || "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[600px] w-full flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">{t("system_unavailable")}</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>{t("retry")}</Button>
      </div>
    )
  }

  const slaPieData = [
    { name: t("on_time"), value: data.sla.on_time_count },
    { name: t("breached"), value: data.sla.breached_count },
  ]
  const PIE_COLORS = ["#10b981", "#f43f5e"]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Download
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics" disabled>
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Reports
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("total_dossiers")}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.dossiers.total_dossiers}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("active_dossiers")}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.dossiers.active_dossiers}</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("internships_count")}</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.internships.total_internships}</div>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compliance Rate
                </CardTitle>
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{100 - data.sla.breach_rate}%</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-none shadow-none bg-transparent">
              <CardHeader className="px-0">
                <CardTitle className="text-xl">Workflow Overview</CardTitle>
                <CardDescription>Statistical breakdown of dossiers across the platform.</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pt-4">
                 <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Bar
                        dataKey="total"
                        fill="currentColor"
                        radius={[4, 4, 0, 0]}
                        className="fill-primary"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                 </div>
              </CardContent>
            </Card>
            
            <div className="col-span-3 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-semibold text-lg">Latest Internships</h3>
                <Button variant="link" className="text-xs text-muted-foreground" asChild>
                  <a href="/stages">View All</a>
                </Button>
              </div>
              <div className="space-y-4">
                {data.internships.latest_internships.slice(0, 3).map((offer) => (
                  <motion.div
                    key={offer.id}
                    whileHover={{ scale: 1.02 }}
                    className="group cursor-pointer"
                  >
                    <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all rounded-2xl">
                      <CardContent className="p-0">
                        <div className="flex gap-4 p-4">
                          <div className="h-16 w-16 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 overflow-hidden">
                             {offer.university_logo ? (
                               <img src={offer.university_logo} alt={offer.university_name || ""} className="w-full h-full object-cover" />
                             ) : (
                               <span className="text-2xl">{offer.country_flag || "🏢"}</span>
                             )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                              {offer.title}
                            </h4>
                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                              {offer.university_name || offer.country || "Global Opportunity"}
                            </p>
                            <div className="flex gap-2 pt-1">
                               <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 border-zinc-200 dark:border-zinc-800">
                                 {new Date(offer.created_at).toLocaleDateString()}
                               </Badge>
                               <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4 bg-zinc-100 dark:bg-zinc-900">
                                 {offer.country_flag} {offer.country}
                               </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
             <Card className="col-span-4 border-none shadow-none bg-transparent">
              <CardHeader className="px-0">
                <CardTitle className="text-xl">Visitor Activity</CardTitle>
                <CardDescription>
                  Real-time activity tracking over the last 6 months.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pt-4">
                <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={visitorData}>
                      <defs>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="month" 
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="visitors" 
                        stroke="var(--primary)" 
                        fillOpacity={1} 
                        fill="url(#colorVisitors)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3 border-none shadow-none bg-transparent">
              <CardHeader className="px-0">
                <CardTitle className="text-xl">System Alerts</CardTitle>
                <CardDescription>
                  You have {data.alerts.length} active priority alerts.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pt-4">
                <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-6">
                  {data.alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center gap-4 group/alert">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover/alert:scale-110",
                        alert.severity === "critical" ? "bg-red-100 dark:bg-red-950/30 text-red-600" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600"
                      )}>
                        {alert.severity === "critical" ? <AlertTriangle size={18} /> : <ShieldAlert size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{alert.message}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{alert.type}</p>
                      </div>
                      <Badge variant={alert.severity === "critical" ? "destructive" : "outline"} className="text-[8px] h-4">
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                  {data.alerts.length === 0 && (
                    <div className="text-center py-10">
                      <CheckSquare className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                      <p className="text-sm text-muted-foreground">All systems nominal</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-7">
             <Card className="col-span-3 border-none shadow-none bg-transparent">
               <CardHeader className="px-0">
                 <CardTitle className="text-xl">Compliance Score</CardTitle>
                 <CardDescription>Dossier processing SLA status.</CardDescription>
               </CardHeader>
               <CardContent className="px-0 pt-4">
                 <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={slaPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {slaPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                      {slaPieData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: PIE_COLORS[index] }} />
                          <span className="text-xs font-medium text-muted-foreground">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                 </div>
               </CardContent>
             </Card>

             <Card className="col-span-4 border-none shadow-none bg-transparent">
                {/* Empty space or maybe some other metric could go here, or just let the tables take over below */}
             </Card>
          </div>

          {/* Existing Workflows & User Management integrated into Overview for now */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Active Workflows</h3>
            </div>
            <AdminSuiviStage compact={false} />
            <UserManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
