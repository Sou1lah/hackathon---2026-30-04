import {
  AlertTriangle,
  CheckSquare,
  FileText,
  Loader2,
  ShieldAlert,
  TrendingUp,
  Zap,
} from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import AdminSuiviStage from "@/components/Admin/AdminSuiviStage"
import { UserManagement } from "@/components/Admin/UserManagement"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { useTranslation } from "react-i18next"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

// Interfaces matching backend models
interface InternshipOffer {
  id: string
  title: string
  source_url: string
  created_at: string
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

const fadeInUp: any = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger: any = {
  visible: { transition: { staggerChildren: 0.05 } },
}

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
        const apiUrl = import.meta.env.VITE_API_URL || ""
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
        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="h-12 w-12 rounded-full border-2 border-zinc-200 dark:border-zinc-800"></div>
            <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-zinc-900 dark:border-t-zinc-50"></div>
          </motion.div>
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {t("loading") || "Loading dashboard..."}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {t("please_wait") || "Please wait while we fetch your data"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[600px] w-full flex-col items-center justify-center gap-8 p-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-900/50"
        >
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center space-y-3 max-w-md"
        >
          <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
            {t("system_unavailable") || "System Unavailable"}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {error || t("system_unavailable_desc") || "We're having trouble connecting to the server. Please try again in a moment."}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            onClick={() => window.location.reload()}
            className="rounded-full px-8 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:shadow-lg hover:scale-105 transition-all"
          >
            {t("retry_connection") || "Retry Connection"}
          </Button>
        </motion.div>
      </div>
    )
  }

  const slaData = [
    { name: t("on_time"), value: data.sla.on_time_count },
    { name: t("breached"), value: data.sla.breached_count },
  ]
  // Enhanced color palette: emerald (success) and rose (warning)
  const COLORS = ["#10b981", "#f43f5e"]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-16 p-8 md:p-12 max-w-full mx-auto relative"
    >
      {/* Live Directional Guide */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-zinc-200 via-zinc-200 to-transparent dark:from-zinc-800 dark:via-zinc-800 hidden md:block">
        <motion.div
          className="absolute left-[-2px] w-1 h-12 bg-zinc-900 dark:bg-zinc-50 rounded-full"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="md:pl-10 space-y-20">
        {/* Claude-style Header */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-200 dark:border-zinc-800 pb-12"
        >
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <Badge className="rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700">
                {t("system_overview")}
              </Badge>
            </motion.div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                {t("admin_intelligence").split(" ")[0]}{" "}
                {t("admin_intelligence").includes(" ") && (
                  <span className="italic text-emerald-600 dark:text-emerald-400">
                    {t("admin_intelligence").split(" ").slice(1).join(" ")}
                  </span>
                )}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-base max-w-2xl font-light leading-relaxed">
                {t("dashboard_subtitle")}
              </p>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-start md:items-end gap-2">
            <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">
              {t("sync_status")}
            </p>
            <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </motion.div>
        </motion.div>

        {/* High-Level Metrics & Recent Offers Grouped */}
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            icon={<FileText size={24} />}
            label={t("total_dossiers")}
            value={data.dossiers.total_dossiers}
            subtext={`${data.dossiers.active_dossiers} ${t("active_now")}`}
            accent="blue"
          />
          <StatCard
            icon={<ShieldAlert size={24} />}
            label={t("compliance_rate")}
            value={`${100 - data.sla.breach_rate}%`}
            subtext={`${data.sla.breached_count} ${t("files_flagged")}`}
            isWarning={data.sla.breach_rate > 10}
            accent={data.sla.breach_rate > 10 ? "red" : "green"}
          />
          <StatCard
            icon={<CheckSquare size={24} />}
            label={t("internships_count")}
            value={data.internships.total_internships}
            subtext={`${data.internships.new_items_7d} ${t("new_this_week")}`}
            accent="purple"
          />
          
          {/* Recent Offers moved up - Live Flow Style */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden group">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest">{t("recent_offers")}</h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Live</span>
              </div>
            </div>
            
            <div className="p-4 space-y-4 flex-1 relative">
              {/* Vertical Animated Line */}
              <div className="absolute left-6 top-6 bottom-6 w-px bg-zinc-100 dark:bg-zinc-800">
                <motion.div
                  className="absolute left-[-2px] w-1 h-8 bg-blue-500 dark:bg-blue-400 rounded-full"
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </div>

              <div className="pl-8 space-y-6">
                {data.internships.latest_internships.slice(0, 3).map((offer, i) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="group/offer cursor-pointer"
                  >
                    <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-50 group-hover/offer:text-blue-600 dark:group-hover/offer:text-blue-400 transition-colors truncate">
                      {offer.title}
                    </p>
                    <p className="text-[8px] text-zinc-400 font-mono font-bold mt-1.5">
                      {new Date(offer.created_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Priority Alerts & SLA Distribution - Same Dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div variants={fadeInUp} className="space-y-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-serif text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">{t("priority_alerts")}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {data.alerts.length > 0 ? `${data.alerts.length} active ${data.alerts.length === 1 ? 'alert' : 'alerts'}` : 'All systems nominal'}
                </p>
              </div>
              <Badge className="font-mono text-[9px] tracking-widest uppercase bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-700">
                {data.alerts.length} {t("active_workflows")}
              </Badge>
            </div>
            
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all flex-1 bg-white dark:bg-zinc-950 overflow-hidden">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {data.alerts.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/30">
                        <CheckSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-400 font-medium">{t("no_alerts") || "No active alerts"}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">Everything is running smoothly</p>
                  </motion.div>
                ) : (
                  data.alerts.slice(0, 3).map((alert, i) => (
                    <motion.div key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-6 flex items-start gap-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-all group">
                      <div className={cn(
                        "p-2.5 rounded-full shrink-0 shadow-sm",
                        alert.severity === "critical" 
                          ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" 
                          : alert.severity === "warning"
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      )}>
                        <ShieldAlert size={16} />
                      </div>
                      <div className="space-y-2 flex-1">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">{alert.message}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-widest">{alert.type}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-6 flex flex-col">
            <div className="space-y-1">
              <h3 className="font-serif text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">{t("sla_distribution")}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                SLA compliance overview
              </p>
            </div>
            <Card className="p-8 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-lg transition-all flex-1 flex flex-col justify-center">
              <div className="h-56 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {slaData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(24, 24, 27, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fafafa'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-5xl font-serif text-zinc-900 dark:text-zinc-50 font-bold">
                    {Math.round((data.sla.on_time_count / (data.sla.on_time_count + data.sla.breached_count)) * 100)}%
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-2">
                    {t("on_time")} Completion
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Full-Width Active Workflows */}
        {(currentUser?.can_review_applications || currentUser?.is_superuser) && (
          <motion.div variants={fadeInUp} className="space-y-8">
            <div className="flex items-center gap-6">
               <h2 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-900 dark:text-zinc-50">{t("active_workflows")}</h2>
               <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
            </div>
            <AdminSuiviStage compact={false} />
          </motion.div>
        )}

        {/* Full-Width User Management */}
        <motion.div variants={fadeInUp} className="pt-10">
          <UserManagement />
        </motion.div>

        {/* System Integrity (Footer-style) */}
        <motion.div variants={fadeInUp} className="space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-50">System Health</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Infrastructure status and latency</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            {data.system_health.map((sys) => (
              <motion.div
                key={sys.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:shadow-md hover:shadow-emerald-100 dark:hover:shadow-emerald-950/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full shadow-lg",
                    sys.status === "ok" ? "bg-emerald-500 shadow-emerald-500/50" :
                    sys.status === "degraded" ? "bg-orange-500 shadow-orange-500/50" :
                    "bg-red-500 shadow-red-500/50"
                  )} />
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">{sys.name}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">{sys.latency}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  isWarning = false,
  accent = "blue",
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext: string
  isWarning?: boolean
  accent?: "blue" | "green" | "red" | "purple"
}) {
  const accentColors = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    green: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "p-6 relative overflow-hidden group border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 transition-all hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700",
          isWarning && "border-orange-200 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-950/20",
        )}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-zinc-100 to-transparent dark:from-zinc-800 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="space-y-6 relative z-10">
          <div className={cn(
            "p-3 rounded-lg w-fit border transition-all group-hover:scale-110",
            accentColors[accent]
          )}>
            {icon}
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
              {label}
            </p>
            <p className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-tighter leading-none">
              {value}
            </p>
            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-900">
              <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                {subtext}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
