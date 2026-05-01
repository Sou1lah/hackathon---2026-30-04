import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  CheckSquare,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  Server,
  ShieldAlert,
  Sparkles,
} from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import AdminSuiviStage from "@/components/Admin/AdminSuiviStage"
import { UserManagement } from "@/components/Admin/UserManagement"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
}

export default function OverviewDashboard() {
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
      <div className="flex h-[500px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-300" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[500px] w-full flex-col items-center justify-center gap-6 p-8">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            System Unavailable
          </h2>
          <p className="text-zinc-500 max-w-xs mx-auto text-sm">{error || "The system is currently unable to retrieve analytics."}</p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="rounded-full px-8"
        >
          Retry Connection
        </Button>
      </div>
    )
  }

  const slaData = [
    { name: "On Time", value: data.sla.on_time_count },
    { name: "Breached", value: data.sla.breached_count },
  ]
  const COLORS = ["#18181b", "#71717a"] // Zinc-900 and Zinc-500 for a clean Claude look

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-16 p-8 md:p-12 max-w-7xl mx-auto"
    >
      {/* Claude-style Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-100 dark:border-zinc-900 pb-12"
      >
        <div className="space-y-6">
          <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-medium tracking-widest uppercase border-zinc-200 dark:border-zinc-800">
            System Overview
          </Badge>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
              Administrative <span className="italic text-zinc-400">Intelligence</span>
            </h1>
            <p className="text-zinc-500 text-lg max-w-2xl font-light leading-relaxed">
              Synthesized insights into university internship workflows and system performance.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-[0.2em]">
            Sync Status
          </p>
          <p className="font-medium text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </motion.div>

      {/* Simplified High-Level Metrics */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-10"
      >
        <StatCard
          icon={<FileText size={20} />}
          label="Total Dossiers"
          value={data.dossiers.total_dossiers}
          subtext={`${data.dossiers.active_dossiers} currently active`}
        />
        <StatCard
          icon={<ShieldAlert size={20} />}
          label="Compliance Rate"
          value={`${100 - data.sla.breach_rate}%`}
          subtext={`${data.sla.breached_count} files flagged`}
          isWarning={data.sla.breach_rate > 10}
        />
        <StatCard
          icon={<CheckSquare size={20} />}
          label="Internships"
          value={data.internships.total_internships}
          subtext={`${data.internships.new_items_7d} new this week`}
        />
      </motion.div>

      {/* Active Workflows (Claude-style cards) */}
      {(currentUser?.can_review_applications || currentUser?.is_superuser) && (
        <motion.div variants={fadeInUp} className="space-y-6">
          <div className="flex items-center gap-4">
             <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">Active Workflows</h2>
             <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-900" />
          </div>
          <AdminSuiviStage compact />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-12">
          {/* Priority Alerts Feed */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl text-zinc-900 dark:text-zinc-50">Priority Alerts</h3>
              <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">
                {data.alerts.length} Action Items
              </span>
            </div>
            
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-950">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {data.alerts.length === 0 ? (
                  <div className="p-20 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300">
                      <Archive size={20} />
                    </div>
                    <p className="text-zinc-400 font-light italic">No urgent notifications at this time.</p>
                  </div>
                ) : (
                  data.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-8 flex items-start gap-8 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all group"
                    >
                      <div
                        className={cn(
                          "p-3 rounded-full shrink-0 transition-all",
                          alert.severity === "critical"
                            ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800",
                        )}
                      >
                        <ShieldAlert size={16} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                            {alert.type}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-light">
                            {new Date(alert.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-medium text-base text-zinc-900 dark:text-zinc-50 leading-relaxed max-w-lg">
                          {alert.message}
                        </p>
                        {alert.dossier_id && (
                          <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-50 hover:opacity-70 transition-opacity pt-2">
                            Review dossier <ArrowUpRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          {/* User Directory Management */}
          <motion.div variants={fadeInUp}>
            <UserManagement />
          </motion.div>
        </div>

        {/* Sidebar Analytics */}
        <div className="lg:col-span-4 space-y-12">
          {/* SLA Distribution */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <h3 className="font-serif text-xl text-zinc-900 dark:text-zinc-50">SLA Distribution</h3>
            <Card className="p-10 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {slaData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-serif text-zinc-900 dark:text-zinc-50">
                    {Math.round((data.sla.on_time_count / (data.sla.on_time_count + data.sla.breached_count)) * 100)}%
                  </span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    On Time
                  </span>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                 <div className="flex items-center justify-between text-xs border-b border-zinc-50 dark:border-zinc-900 pb-3">
                   <span className="text-zinc-500">Compliant Files</span>
                   <span className="font-semibold text-zinc-900 dark:text-zinc-50">{data.sla.on_time_count}</span>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                   <span className="text-zinc-500">Breached SLA</span>
                   <span className="font-semibold text-zinc-900 dark:text-zinc-50">{data.sla.breached_count}</span>
                 </div>
              </div>
            </Card>
          </motion.div>

          {/* New Registrations Feed */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <h3 className="font-serif text-xl text-zinc-900 dark:text-zinc-50">Recent Offers</h3>
            <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 shadow-none">
              <div className="p-2 space-y-1">
                {data.internships.latest_internships.slice(0, 4).map((offer) => (
                  <div
                    key={offer.id}
                    className="p-4 hover:bg-white dark:hover:bg-zinc-900 rounded-xl transition-all group flex flex-col gap-1"
                  >
                    <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-500 transition-colors line-clamp-1">
                      {offer.title}
                    </p>
                    <p className="text-[10px] font-medium text-zinc-400">
                      Detected {new Date(offer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
              <CardFooter className="p-4 border-t border-zinc-100 dark:border-zinc-900">
                <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                  Full Registry
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* System Integrity */}
          <motion.div variants={fadeInUp} className="space-y-6">
             <h3 className="font-serif text-xl text-zinc-900 dark:text-zinc-50">Integrity</h3>
             <div className="space-y-4">
                {data.system_health.map((sys) => (
                  <div key={sys.name} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{sys.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">{sys.latency}</span>
                  </div>
                ))}
             </div>
          </motion.div>
        </div>
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
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext: string
  isWarning?: boolean
}) {
  return (
    <Card
      className={cn(
        "p-8 relative overflow-hidden group border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 transition-all hover:shadow-md",
        isWarning && "border-zinc-900/10 dark:border-zinc-50/10 bg-zinc-50/50 dark:bg-zinc-900/50",
      )}
    >
      <div className="space-y-6">
        <div className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
          {icon}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            {label}
          </p>
          <p className="text-4xl font-serif text-zinc-900 dark:text-zinc-50 tracking-tighter">{value}</p>
          <p className="text-[11px] font-medium text-zinc-500 pt-2 border-t border-zinc-50 dark:border-zinc-900 inline-block">
            {subtext}
          </p>
        </div>
      </div>
    </Card>
  )
}
