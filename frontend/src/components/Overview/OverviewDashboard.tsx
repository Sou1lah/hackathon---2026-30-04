import { motion } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowUpRight,
  BarChart3,
  CheckSquare,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
  Server,
  ShieldAlert,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
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

export default function OverviewDashboard() {
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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[500px] w-full flex-col items-center justify-center gap-4 bg-red-500/5 rounded-3xl p-8 border border-red-500/20">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold italic text-destructive">
          Erreur système
        </h2>
        <p className="text-muted-foreground italic">
          {error || "Data unavailable"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-destructive text-white rounded-full font-bold hover:bg-destructive/80 transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  const slaData = [
    { name: "On Time", value: data.sla.on_time_count },
    { name: "Breached", value: data.sla.breached_count },
  ]
  const COLORS = ["#10b981", "#ef4444"]

  return (
    <div className="space-y-8 p-2 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Activity className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-primary">
              Dashboard
            </h1>
            <p className="text-muted-foreground italic font-medium">
              Moteur de décision & Métriques système.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">
            Dernière mise à jour
          </p>
          <p className="font-mono text-sm">
            {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FileText size={24} />}
          label="Total Dossiers"
          value={data.dossiers.total_dossiers}
          subtext={`${data.dossiers.active_dossiers} actifs en ce moment`}
          color="blue"
        />
        <StatCard
          icon={<ShieldAlert size={24} />}
          label="Taux de Breach SLA"
          value={`${data.sla.breach_rate}%`}
          subtext={`${data.sla.breached_count} dossiers hors délai`}
          color="red"
          alert={data.sla.breach_rate > 10}
        />
        <StatCard
          icon={<CheckSquare size={24} />}
          label="Stages Détectés"
          value={data.internships.total_internships}
          subtext={`+${data.internships.new_items_7d} ces 7 derniers jours`}
          color="emerald"
        />
        <StatCard
          icon={<Clock size={24} />}
          label="Progression Moyenne"
          value={`${data.signature.average_progress.toFixed(0)}%`}
          subtext={`${data.signature.stalled_dossiers} dossiers bloqués`}
          color="purple"
          alert={data.signature.stalled_dossiers > 5}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Alerts & Signature Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Signature Workflow Section */}
          <div className="bg-card border border-border rounded-[32px] shadow-sm overflow-hidden p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xl italic flex items-center gap-2">
                <BarChart3 className="text-purple-500" size={24} />
                Flux de Signatures (8 Étapes)
              </h3>
              <span className="px-4 py-1 bg-purple-500/10 text-purple-600 rounded-full text-sm font-bold italic">
                {data.signature.completed_signatures} finalisés
              </span>
            </div>

            <div className="space-y-6">
              <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.signature.average_progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase italic tracking-tighter">
                <span>Étudiant</span>
                <span>Tuteur</span>
                <span>Département</span>
                <span>Faculté</span>
                <span>Rectorat</span>
                <span>Externe</span>
                <span>Final</span>
                <span>Archive</span>
              </div>
            </div>
          </div>

          {/* Critical Alerts Section */}
          <div className="bg-card border border-border rounded-[32px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-destructive/5 flex items-center justify-between">
              <h3 className="font-black text-xl italic flex items-center gap-2">
                <AlertTriangle className="text-destructive" size={24} />
                Alertes Prioritaires
              </h3>
              <span className="px-3 py-1 bg-destructive text-white rounded-full text-xs font-black italic">
                {data.alerts.length} ALERTES
              </span>
            </div>
            <div className="divide-y divide-border">
              {data.alerts.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground italic">
                  Aucune alerte critique détectée. Système nominal.
                </div>
              ) : (
                data.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-6 flex items-start gap-4 hover:bg-accent/30 transition-colors group"
                  >
                    <div
                      className={cn(
                        "p-2 rounded-xl mt-1",
                        alert.severity === "critical"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-amber-500/10 text-amber-500",
                      )}
                    >
                      <ShieldAlert size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-xs uppercase tracking-widest">
                          {alert.type}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground italic">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-medium text-sm text-foreground/80">
                        {alert.message}
                      </p>
                      {alert.dossier_id && (
                        <button className="mt-2 text-xs font-bold text-primary flex items-center gap-1 hover:underline underline-offset-4">
                          Voir le dossier <ArrowUpRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: SLA Stats & System Health */}
        <div className="space-y-8">
          {/* SLA Visualization */}
          <div className="bg-card border border-border rounded-[32px] shadow-sm p-8 flex flex-col items-center">
            <h3 className="font-black text-xl italic mb-6 self-start flex items-center gap-2">
              <Clock className="text-emerald-500" size={24} />
              Respect du SLA (14j)
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slaData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
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
            </div>
            <div className="flex justify-center gap-6 mt-4 w-full">
              <div className="text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase italic tracking-widest mb-1">
                  On Time
                </p>
                <p className="text-xl font-black text-emerald-500">
                  {data.sla.on_time_count}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase italic tracking-widest mb-1">
                  Breached
                </p>
                <p className="text-xl font-black text-destructive">
                  {data.sla.breached_count}
                </p>
              </div>
            </div>
          </div>

          {/* Latest Internships */}
          <div className="bg-card border border-border rounded-[32px] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-black text-lg italic">Nouveaux Stages</h3>
              <ExternalLink size={18} className="text-muted-foreground" />
            </div>
            <div className="p-4 space-y-3">
              {data.internships.latest_internships.map((offer) => (
                <div
                  key={offer.id}
                  className="p-3 bg-accent/20 rounded-2xl hover:bg-accent/40 transition-colors cursor-pointer group"
                >
                  <p className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {offer.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase italic tracking-tighter">
                    {new Date(offer.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* System Health Section */}
          <div className="bg-card border border-border rounded-[32px] shadow-sm p-8">
            <h3 className="font-black text-xl italic mb-6 flex items-center gap-2">
              <Server className="text-blue-500" size={24} />
              État du Système
            </h3>
            <div className="space-y-6">
              {data.system_health.map((sys) => (
                <div
                  key={sys.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {sys.name.includes("Payment") ? (
                      <CreditCard size={18} className="text-muted-foreground" />
                    ) : sys.name.includes("Archive") ? (
                      <Archive size={18} className="text-muted-foreground" />
                    ) : (
                      <Server size={18} className="text-muted-foreground" />
                    )}
                    <span className="text-sm font-bold italic">{sys.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {sys.latency}
                    </span>
                    <span
                      className={cn(
                        "w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px]",
                        sys.status === "ok"
                          ? "bg-emerald-500 shadow-emerald-500/50"
                          : sys.status === "degraded"
                            ? "bg-amber-500 shadow-amber-500/50"
                            : "bg-red-500 shadow-red-500/50",
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
  alert = false,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext: string
  color: "blue" | "emerald" | "purple" | "red"
  alert?: boolean
}) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-500 shadow-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20",
    purple: "bg-purple-500/10 text-purple-500 shadow-purple-500/20",
    red: "bg-red-500/10 text-red-500 shadow-red-500/20",
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "bg-card p-6 rounded-[32px] border border-border shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all duration-300",
        alert && "border-destructive/30 bg-destructive/[0.02]",
      )}
    >
      <div
        className={cn("p-4 w-fit rounded-2xl shadow-inner", colorMap[color])}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic mb-1">
          {label}
        </p>
        <p className="text-3xl font-black tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground italic mt-1 font-medium">
          {subtext}
        </p>
      </div>
      {alert && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-destructive animate-ping" />
      )}
    </motion.div>
  )
}
