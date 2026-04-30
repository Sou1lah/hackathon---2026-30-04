import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
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
import { motion } from "framer-motion"
import {
  Folder,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileSearch,
  Users,
  Plane,
} from "lucide-react"
import { cn } from "@/lib/utils"
import useAuth from "@/hooks/useAuth"
import StudentHome from "./StudentHome"
import { OpenAPI } from "@/client/core/OpenAPI"
import { request as __request } from "@/client/core/request"
import { type UserPublic, UsersService } from "@/client"
import AddUser from "@/components/Admin/AddUser"
import { columns, type UserTableData } from "@/components/Admin/columns"
import { DataTable } from "@/components/Common/DataTable"
import PendingUsers from "@/components/Pending/PendingUsers"
import { Suspense } from "react"

interface DashboardStats {
  active_internships: number
  pending_requests: number
  validated_this_month: number
  critical_alerts: number
  avg_processing_days: number
  overdue_tasks_count: number
  national_mobility_count: number
  international_mobility_count: number
}

interface ExtendedUser extends UserPublic {
  role?: string
}

const chartData = [
  { name: "Jan", demande: 400, convention: 240 },
  { name: "Feb", demande: 300, convention: 139 },
  { name: "Mar", demande: 200, convention: 980 },
  { name: "Apr", demande: 278, convention: 390 },
  { name: "May", demande: 189, convention: 480 },
  { name: "Jun", demande: 239, convention: 380 },
]

const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#6366F1"]

function getUsersQueryOptions() {
  return {
    queryFn: () => UsersService.readUsers({ skip: 0, limit: 100 }),
    queryKey: ["users"],
  }
}

function UsersTableContent() {
  const { user: currentUser } = useAuth()
  const { data: users } = useSuspenseQuery(getUsersQueryOptions())

  const tableData: UserTableData[] = users.data.map((user: UserPublic) => ({
    ...user,
    isCurrentUser: currentUser?.id === user.id,
  }))

  return <DataTable columns={columns} data={tableData} />
}

export default function Dashboard() {
  const { user: baseUser } = useAuth()
  const user = baseUser as ExtendedUser

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: () =>
      __request(OpenAPI, {
        method: "GET",
        url: "/api/v1/dashboard/stats",
      }),
    enabled: !!user && (user.role === "admin" || user.is_superuser),
  })

  if (!user) return null

  if (user.role !== "admin" && !user.is_superuser) {
    return <StudentHome />
  }

  const statsCards = [
    {
      label: "Alertes",
      value: stats?.critical_alerts ?? "...",
      icon: AlertTriangle,
      color: "bg-red-500",
      trend: stats?.overdue_tasks_count ? `+${stats.overdue_tasks_count}` : "0",
    },
    {
      label: "Dossiers Actifs",
      value: stats?.active_internships ?? "...",
      icon: Folder,
      color: "bg-blue-500",
      trend: "+12%",
    },
    {
      label: "Mobilité Nationale",
      value: stats?.national_mobility_count ?? "...",
      icon: Users,
      color: "bg-purple-500",
      trend: "+5%",
    },
    {
      label: "Mobilité Internationale",
      value: stats?.international_mobility_count ?? "...",
      icon: Plane,
      color: "bg-indigo-500",
      trend: "+8%",
    },
  ]

  const statusData = [
    { name: "Mobilité Nationale", value: stats?.national_mobility_count || 0 },
    { name: "Mobilité Internationale", value: stats?.international_mobility_count || 0 },
    { name: "Stages Actifs", value: stats?.active_internships || 0 },
    { name: "Validés", value: stats?.validated_this_month || 0 },
  ]

  return (
    <div className={cn("space-y-12 p-2", isLoading && "opacity-50")}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold italic tracking-tight text-primary">Dashboard</h1>
          <p className="text-muted-foreground italic">Pilotage stratégique et administration des comptes.</p>
        </div>
        <div className="flex gap-3">
          <AddUser />
          <button className="bg-card border border-border px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-accent shadow-sm transition-all text-muted-foreground">
            <FileSearch size={16} /> Rapport
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-card p-6 rounded-3xl border border-border shadow-sm group"
          >
            <div className="flex items-start justify-between">
              <div className={cn(stat.color, "p-4 rounded-2xl text-white shadow-lg")}>
                <stat.icon size={28} />
              </div>
              <div className="text-green-500 font-bold text-xs bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={12} /> {stat.trend}
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-muted-foreground text-sm font-bold uppercase tracking-widest italic">{stat.label}</h3>
              <p className="text-4xl font-black mt-2 tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
          <h3 className="font-bold text-xl flex items-center gap-2 italic text-blue-400 mb-6">
            <Clock size={24} /> SLA Compliance
          </h3>
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-400 italic">Délai Moyen</span>
                <span className="font-black text-blue-400 text-lg">{stats?.avg_processing_days || 0} Jours</span>
              </div>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", (stats?.avg_processing_days || 0) <= 14 ? "bg-blue-500" : "bg-red-500")} 
                  style={{ width: `${Math.min(((stats?.avg_processing_days || 0) / 14) * 100, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card p-8 rounded-3xl border border-border shadow-sm">
           <h3 className="text-xl font-bold mb-8 italic tracking-tight flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} /> Évolution
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "hsl(var(--accent))" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", backgroundColor: "hsl(var(--card))" }} />
                <Bar dataKey="demande" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Demandes" />
                <Bar dataKey="convention" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Conventions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card p-8 rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h3 className="text-2xl font-black italic tracking-tight">Utilisateurs</h3>
             <p className="text-muted-foreground text-sm italic">Gestion des comptes et des permissions institutionnelles.</p>
           </div>
           <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">
             {stats?.active_internships || 0} Actifs
           </div>
        </div>
        <Suspense fallback={<PendingUsers />}>
          <UsersTableContent />
        </Suspense>
      </div>
    </div>
  )
}
