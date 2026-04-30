import { useQuery } from "@tanstack/react-query"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { motion } from "motion/react"
import {
  FolderIcon,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileSearch,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import useAuth from "@/hooks/useAuth"
import StudentHome from "./StudentHome"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request as __request } from "@/client/core/request"

const chartData = [
  { name: "Jan", demande: 400, convention: 240 },
  { name: "Feb", demande: 300, convention: 139 },
  { name: "Mar", demande: 200, convention: 980 },
  { name: "Apr", demande: 278, convention: 390 },
  { name: "May", demande: 189, convention: 480 },
  { name: "Jun", demande: 239, convention: 380 },
]

const statusData = [
  { name: "Validation N1", value: 400 },
  { name: "Signature Entreprise", value: 300 },
  { name: "Signature Rectorat", value: 300 },
  { name: "Terminé", value: 200 },
]

const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#6366F1"]

export default function Dashboard() {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () =>
      __request(OpenAPI, {
        method: "GET",
        url: "/api/v1/dashboard/stats",
      }),
    enabled: !!user && (user.role === "admin" || user.is_superuser),
  })

  if (!user) return null

  // If not admin, show Student Home
  if (user.role !== "admin" && !user.is_superuser) {
    return <StudentHome />
  }

  const statsCards = [
    {
      label: "Dossiers Actifs",
      value: stats?.active_internships ?? "...",
      icon: FolderIcon,
      color: "bg-blue-500",
      trend: "+12%",
    },
    {
      label: "Demandes en Attente",
      value: stats?.pending_requests ?? "...",
      icon: Clock,
      color: "bg-amber-500",
      trend: "-2%",
    },
    {
      label: "Validés ce Mois",
      value: stats?.validated_this_month ?? "...",
      icon: CheckCircle,
      color: "bg-green-500",
      trend: "+18%",
    },
    {
      label: "Alertes Critiques",
      value: stats?.critical_alerts ?? "...",
      icon: AlertTriangle,
      color: "bg-red-500",
      trend: "+5%",
    },
  ]

  return (
    <div className={cn("space-y-8", isLoading && "opacity-50 pointer-events-none transition-opacity")}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold italic tracking-tight">Tableau de Bord - Admin</h1>
          <p className="text-muted-foreground">
            Aperçu en temps réel de l'activité académique et de mobilité.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-card border border-border px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-accent shadow-sm transition-all text-muted-foreground">
            <FileSearch size={16} /> Rapport Complet
          </button>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 shadow-lg transition-all">
            Nouvelle Campagne
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(stat.color, "p-3 rounded-xl text-white shadow-lg")}
              >
                <stat.icon size={24} />
              </div>
              <div
                className={
                  stat.trend.startsWith("+")
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                <span className="text-xs font-bold px-2 py-1 bg-current/10 rounded-full flex items-center gap-1 text-slate-400">
                  <TrendingUp size={12} /> {stat.trend}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-muted-foreground text-sm font-medium italic">
                {stat.label}
              </h3>
              <p className="text-3xl font-bold mt-1 tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <div className="lg:col-span-2 bg-card p-8 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold mb-6 italic tracking-tight">Activité Mensuelle</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--accent))" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    backgroundColor: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar
                  dataKey="demande"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  name="Demandes"
                />
                <Bar
                  dataKey="convention"
                  fill="#94A3B8"
                  radius={[4, 4, 0, 0]}
                  name="Conventions"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Monitor & Alerts */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2 italic">
                <Clock className="text-blue-400" size={20} /> SLA Monitor
              </h3>
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded tracking-wider font-bold">
                TEMPS RÉEL
              </span>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400 italic">
                    Délai Traitement Moyen
                  </span>
                  <span className="font-bold text-blue-400 italic">14 Jours</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[65%]" />
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                La moyenne actuelle de traitement des conventions est de 9.2
                jours.
              </p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold italic">Dernières Alertes</h3>
              <button className="text-primary text-xs font-bold hover:underline">
                Tout voir
              </button>
            </div>
            <div className="space-y-4">
              {[
                {
                  type: "critical",
                  msg: "Signature Tuteur en retard (+3j)",
                  folder: "S-77241",
                  time: "12h",
                },
                {
                  type: "warning",
                  msg: "Document manquant: Bourse d'excellence",
                  folder: "M-1120",
                  time: "14h",
                },
                {
                  type: "info",
                  msg: "Nouvelle demande à valider",
                  folder: "S-8821",
                  time: "1j",
                },
              ].map((alert, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-3 rounded-xl hover:bg-accent transition-colors cursor-pointer group"
                >
                  <div
                    className={cn(
                      "w-2 h-10 rounded-full shrink-0 mt-0.5",
                      alert.type === "critical"
                        ? "bg-red-500"
                        : alert.type === "warning"
                          ? "bg-amber-500"
                          : "bg-blue-500",
                    )}
                  />
                  <div>
                    <p className="text-sm font-bold line-clamp-1 italic">
                      {alert.msg}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-accent px-1.5 py-0.5 rounded font-mono text-muted-foreground italic">
                        {alert.folder}
                      </span>
                      <span className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                        <Clock size={10} /> {alert.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold mb-6 italic tracking-tight">Répartition par État</h3>
          <div className="flex items-center justify-between">
            <div className="h-[250px] w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-4 pr-4">
              {statusData.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between group cursor-default"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
                    />
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors italic">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold tracking-tighter">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold italic tracking-tight">Équipe de Gestion</h3>
            <Users size={20} className="text-muted-foreground" />
          </div>
          <div className="space-y-6">
            {["Sarah Dridi", "Ahmed Ben Ali", "Leila Mansour"].map((user) => (
              <div key={user} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-muted-foreground border border-border uppercase">
                    {user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{user}</p>
                    <p className="text-xs text-muted-foreground italic">
                      Gestionnaire Qualité N2
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                    Disponible
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1 italic">
                    Dernier accès: il y a 5 min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
