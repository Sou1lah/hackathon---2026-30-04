import { useState, useEffect } from "react"
import { Activity, Users, FileText, CheckSquare, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// New completely isolated interface
interface ActivityItem {
  id: string
  description: string
  date: string
}

interface OverviewStats {
  total_users: number
  total_requests: number
  pending_items: number
  recent_activity: ActivityItem[]
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
            "Authorization": `Bearer ${token}`
          }
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[500px] w-full flex-col items-center justify-center gap-4 bg-red-500/5 rounded-3xl p-8 border border-red-500/20">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold italic text-destructive">Erreur système</h2>
        <p className="text-muted-foreground italic">{error || "Data unavailable"}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-6 py-2 bg-destructive text-white rounded-full font-bold hover:bg-destructive/80 transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-2 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Activity className="text-primary" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-primary">Vue d'ensemble</h1>
          <p className="text-muted-foreground italic font-medium">Statistiques globales du système.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest italic">Utilisateurs</p>
            <p className="text-3xl font-black">{data.total_users}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest italic">Demandes</p>
            <p className="text-3xl font-black">{data.total_requests}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
            <CheckSquare size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest italic">En Attente</p>
            <p className="text-3xl font-black">{data.pending_items}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden mt-8 min-h-[250px]">
        <div className="p-6 border-b border-border bg-accent/5">
          <h3 className="font-bold text-lg italic">Activité Récente</h3>
        </div>
        <div className="divide-y divide-border">
          {data.recent_activity.map((item) => (
            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-medium">{item.description}</span>
              </div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider bg-accent px-3 py-1 rounded-full">
                {item.date}
              </span>
            </div>
          ))}
          {data.recent_activity.length === 0 && (
            <div className="p-8 text-center text-muted-foreground italic">Aucune activité récente.</div>
          )}
        </div>
      </div>
    </div>
  )
}
