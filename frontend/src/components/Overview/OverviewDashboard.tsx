import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  BarChart3,
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
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
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[500px] w-full flex-col items-center justify-center gap-6 p-8">
        <div className="p-4 bg-destructive/10 rounded-full text-destructive">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-serif text-foreground mb-2">
            System Error
          </h2>
          <p className="text-muted-foreground">{error || "Data unavailable"}</p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="destructive"
          size="lg"
        >
          Retry
        </Button>
      </div>
    )
  }

  const slaData = [
    { name: "On Time", value: data.sla.on_time_count },
    { name: "Breached", value: data.sla.breached_count },
  ]
  const COLORS = ["#0052FF", "#EF4444"]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-12 p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-4">
          <Badge variant="section">Overview</Badge>
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-foreground">
            Decision <span className="gradient-text">Engine</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Real-time system metrics and key performance indicators.
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
            Last updated
          </p>
          <p className="font-mono text-sm text-foreground">
            {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
      </motion.div>

      {/* Primary Stats Grid */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatCard
          icon={<FileText size={24} />}
          label="Total Files"
          value={data.dossiers.total_dossiers}
          subtext={`${data.dossiers.active_dossiers} active`}
          accent="blue"
        />
        <StatCard
          icon={<ShieldAlert size={24} />}
          label="Breach Rate"
          value={`${data.sla.breach_rate}%`}
          subtext={`${data.sla.breached_count} overdue`}
          accent="red"
          alert={data.sla.breach_rate > 10}
        />
        <StatCard
          icon={<CheckSquare size={24} />}
          label="Detected Internships"
          value={data.internships.total_internships}
          subtext={`+${data.internships.new_items_7d} (7d)`}
          accent="blue"
        />
      </motion.div>

      {/* Student Tracking Section (Admin Only) */}
      {(currentUser?.can_review_applications || currentUser?.is_superuser) && (
        <motion.div variants={fadeInUp}>
          <AdminSuiviStage compact />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">


          {/* Critical Alerts */}
          <motion.div variants={fadeInUp}>
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className="p-6 border-b border-border/40 bg-destructive/[0.02] flex flex-row items-center justify-between">
                <h3 className="font-serif text-2xl flex items-center gap-3">
                  <AlertTriangle className="text-destructive" size={24} />
                  Priority Alerts
                </h3>
                <Badge variant="destructive" className="font-mono px-3">
                  {data.alerts.length} ALERTS
                </Badge>
              </CardHeader>
              <div className="divide-y divide-border/40">
                {data.alerts.length === 0 ? (
                  <div className="p-16 text-center text-muted-foreground font-medium">
                    No critical alerts detected. System nominal.
                  </div>
                ) : (
                  data.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-6 flex items-start gap-5 hover:bg-muted/30 transition-all group"
                    >
                      <div
                        className={cn(
                          "p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110",
                          alert.severity === "critical"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-500",
                        )}
                      >
                        <ShieldAlert size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {alert.type}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {new Date(alert.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium text-base text-foreground leading-relaxed">
                          {alert.message}
                        </p>
                        {alert.dossier_id && (
                          <Button
                            variant="link"
                            className="px-0 h-auto mt-2 text-xs"
                          >
                            View file{" "}
                            <ArrowUpRight size={14} className="ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          {/* User Management Section */}
          <motion.div variants={fadeInUp}>
            <UserManagement />
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* SLA Stats */}
          <motion.div variants={fadeInUp}>
            <Card className="p-8 border-border/50">
              <h3 className="font-serif text-xl mb-8 flex items-center gap-3">
                <Clock className="text-accent" size={20} />
                SLA Compliance
              </h3>
              <div className="h-56 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={8}
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
                  <span className="text-3xl font-serif text-foreground">
                    {data.sla.on_time_count + data.sla.breached_count}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    Total
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-muted/30 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                    On Time
                  </p>
                  <p className="text-2xl font-serif text-accent">
                    {data.sla.on_time_count}
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                    Breached
                  </p>
                  <p className="text-2xl font-serif text-destructive">
                    {data.sla.breached_count}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Latest Internships */}
          <motion.div variants={fadeInUp}>
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className="p-6 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-lg font-serif">
                  New Internships
                </CardTitle>
              </CardHeader>
              <div className="p-4 space-y-2">
                {data.internships.latest_internships.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-4 hover:bg-muted/40 rounded-xl transition-all group flex items-start gap-4"
                  >
                    <div className="bg-accent/10 p-2 rounded-lg text-accent mt-1 shrink-0">
                      <Sparkles size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground group-hover:text-accent transition-colors line-clamp-1">
                        {offer.title}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-1">
                        {new Date(offer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <CardFooter className="p-4 bg-muted/20 border-t border-border/40">
                <Button variant="ghost" className="w-full text-xs font-mono">
                  View all <ArrowUpRight size={14} className="ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* System Health */}
          <motion.div variants={fadeInUp}>
            <Card className="p-8 border-border/50">
              <h3 className="font-serif text-xl mb-8 flex items-center gap-3">
                <Server className="text-accent" size={20} />
                System Health
              </h3>
              <div className="space-y-6">
                {data.system_health.map((sys) => (
                  <div
                    key={sys.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-muted p-2 rounded-lg text-muted-foreground">
                        {sys.name.includes("Payment") ? (
                          <CreditCard size={16} />
                        ) : sys.name.includes("Archive") ? (
                          <Archive size={16} />
                        ) : (
                          <Server size={16} />
                        )}
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {sys.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {sys.latency}
                      </span>
                      <div
                        className={cn(
                          "size-2.5 rounded-full",
                          sys.status === "ok"
                            ? "bg-accent shadow-[0_0_8px_rgba(0,82,255,0.4)]"
                            : sys.status === "degraded"
                              ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                              : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]",
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
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
  accent,
  alert = false,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext: string
  accent: "blue" | "red"
  alert?: boolean
}) {
  return (
    <Card
      className={cn(
        "p-6 relative overflow-hidden group border-border/50",
        alert && "border-destructive/30 bg-destructive/[0.02]",
      )}
    >
      <div
        className={cn(
          "p-4 w-fit rounded-2xl mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
          accent === "blue"
            ? "bg-accent/10 text-accent"
            : "bg-destructive/10 text-destructive",
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">
          {label}
        </p>
        <p className="text-3xl font-serif text-foreground">{value}</p>
        <p className="text-xs font-medium text-muted-foreground mt-2">
          {subtext}
        </p>
      </div>
      {alert && (
        <div className="absolute top-4 right-4 size-2 rounded-full bg-destructive animate-ping" />
      )}
    </Card>
  )
}
