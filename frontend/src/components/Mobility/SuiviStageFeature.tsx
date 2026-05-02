import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2,
  Clock,
  FileText,
  History,
  Layout,
  MessageSquare,
  Paperclip,
  Plus,
  Star,
  TrendingUp,
  User as UserIcon,
  Globe,
  Edit,
  Trash2,
} from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { toast } from "sonner"
import { OpenAPI } from "@/client"
import UserDetailModal from "@/components/Admin/UserDetailModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import useAuth from "@/hooks/useAuth"
import TrackingLocked from "./TrackingLocked"

function ActivityCalendar({ logs }: { logs: any[] }) {
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  const loggedDays = new Set(
    logs.map(log => new Date(log.date).getDate())
  )

  return (
    <Card className="bg-white dark:bg-zinc-950 border border-border/50 rounded-[2.5rem] shadow-sm overflow-hidden mt-6">
      <div className="p-8 border-b border-border/40 flex justify-between items-center">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Attendance Tracker</h2>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {today.toLocaleString('default', { month: 'long' })}
        </span>
      </div>
      <CardContent className="p-8">
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const isFuture = day > today.getDate()
            const isLogged = loggedDays.has(day)
            const isPast = day < today.getDate()
            
            let colorClass = "bg-orange-400" // Future
            if (isLogged) colorClass = "bg-emerald-500" // Logged
            else if (isPast) colorClass = "bg-rose-500" // Missed
            
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <div className={`size-3 rounded-full ${colorClass} shadow-sm transition-all hover:scale-125 cursor-help`} title={`Day ${day}`} />
                <span className="text-[10px] font-bold text-muted-foreground">{day}</span>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Logged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-rose-500" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-orange-400" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Future</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
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

// Custom Fetch Wrapper
const fetchWithAuth = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("access_token")
  const response = await fetch(`${OpenAPI.BASE}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) throw new Error("API Error")
  return response.json()
}

export default function SuiviStageFeature() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isTutor = user?.can_review_applications || user?.is_superuser

  const [isLogOpen, setIsLogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [newLog, setNewLog] = useState({
    title: "",
    content: "",
    attachment_url: "",
  })

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["suivi-logs", isTutor],
    queryFn: () => fetchWithAuth(isTutor ? "/api/v1/suivi-stage/admin/logs" : "/api/v1/suivi-stage/my-internship/logs"),
  })

  const { data: feedbacks } = useQuery({
    queryKey: ["suivi-feedback"],
    queryFn: () => fetchWithAuth("/api/v1/suivi-stage/my-internship/feedback"),
    enabled: !isTutor,
  })

  const { data: summary } = useQuery({
    queryKey: ["internship-summary", "mine"],
    queryFn: () => fetchWithAuth("/api/v1/suivi-stage/my-internship/summary"),
    enabled: !isTutor,
  })

  const createLogMutation = useMutation({
    mutationFn: (data: any) =>
      fetchWithAuth("/api/v1/suivi-stage/my-internship/logs", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suivi-logs"] })
      toast.success("Logbook updated")
      setIsLogOpen(false)
      setNewLog({ title: "", content: "", attachment_url: "" })
    },
    onError: () => toast.error("Error creating log entry"),
  })

  const handleCreateLog = () => {
    if (!newLog.title || !newLog.content) {
      toast.error("Please fill in all fields")
      return
    }
    createLogMutation.mutate({
      ...newLog,
      internship_id: "00000000-0000-0000-0000-000000000000",
    })
  }

  const [editingLog, setEditingLog] = useState<any | null>(null)

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this log entry?")) return
    try {
      await fetchWithAuth(`/api/v1/suivi-stage/my-internship/logs/${logId}`, {
        method: "DELETE",
      })
      toast.success("Log entry deleted")
      queryClient.invalidateQueries({ queryKey: ["suivi-logs"] })
    } catch (error) {
      toast.error("Failed to delete log")
    }
  }

  const handleUpdateLog = async (data: any) => {
    try {
      await fetchWithAuth(`/api/v1/suivi-stage/my-internship/logs/${editingLog.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      toast.success("Log entry updated")
      setEditingLog(null)
      queryClient.invalidateQueries({ queryKey: ["suivi-logs"] })
    } catch (error) {
      toast.error("Failed to update log")
    }
  }

  const { data: internships, isLoading: internshipsLoading } = useQuery({
    queryKey: ["internship-requests", "mine"],
    queryFn: () => fetchWithAuth("/api/v1/internship-requests/?limit=100"),
    enabled: !isTutor,
  })

  const hasActiveInternship = isTutor || (internships?.data || []).some(
    (req: any) => 
      req.status === "active" || 
      req.status === "completed" || 
      req.status === "pending_signature" ||
      req.progress >= 50
  )

  if (!isTutor && (internshipsLoading || logsLoading)) {
    return (
      <div className="p-8 space-y-8 container max-w-[1400px] py-20">
        <div className="flex flex-col items-center gap-4">
           <Skeleton className="h-16 w-96 rounded-full" />
           <Skeleton className="h-24 w-[600px] rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
          <Skeleton className="h-48 rounded-[2rem]" />
          <Skeleton className="h-48 rounded-[2rem]" />
          <Skeleton className="h-48 rounded-[2rem]" />
        </div>
      </div>
    )
  }

  if (!isTutor && !hasActiveInternship) {
    return <TrackingLocked />
  }

  const getFeedbackForLog = (log: any) => {
    if (log.feedback && log.feedback.length > 0) return log.feedback[0]
    return feedbacks?.find((f: any) => f.log_id === log.id)
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger as any}
      className="container max-w-[1400px] py-20 space-y-24"
    >
      {/* Header Section */}
      <motion.div
        variants={fadeInUp as any}
        className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto"
      >
        <div className="space-y-6">
          <Badge variant="section" className="px-6 py-2 text-[12px] rounded-full mx-auto">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse mr-3" />
            Operational Tracking System
          </Badge>
          <h1 className="text-7xl md:text-8xl font-serif tracking-tight text-foreground leading-tight">
            {summary?.company_name || "Internship"} <span className="gradient-text">Logbook</span>
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-8 mt-6">
            <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-zinc-950 border border-border/50 rounded-2xl shadow-sm">
              <Globe size={18} className="text-accent" />
              <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {summary?.company_address?.split(',').pop()?.trim() || "National"}
              </span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-zinc-950 border border-border/50 rounded-2xl shadow-sm">
              <Clock size={18} className="text-accent" />
              <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {(() => {
                  if (!summary?.start_date || !summary?.end_date) return "Duration TBD"
                  const start = new Date(summary.start_date)
                  const end = new Date(summary.end_date)
                  const diffTime = Math.abs(end.getTime() - start.getTime())
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  const months = Math.floor(diffDays / 30)
                  return `${months > 0 ? months + ' months' : diffDays + ' days'}`
                })()}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-2xl leading-relaxed max-w-3xl mt-8">
            {summary?.mission_title || "Record your daily professional milestones and maintain high-fidelity communication with your academic mentorship team."}
          </p>
        </div>

        {!isTutor && (
          <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="h-20 rounded-full px-12 gap-4 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xl transition-all hover:scale-105 active:scale-95 border-8 border-white dark:border-zinc-950"
              >
                <Plus size={28} />
                <span className="font-bold uppercase tracking-[0.2em] text-[12px]">
                  Create New Activity Log
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-border/50 rounded-3xl overflow-hidden p-0">
              <div className="bg-foreground text-background p-8 relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-[0.05]" />
                <DialogHeader className="relative z-10">
                  <DialogTitle className="text-2xl font-serif text-white">
                    Record an activity
                  </DialogTitle>
                </DialogHeader>
              </div>
              <div className="space-y-6 p-8">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Mission Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Data flow analysis"
                    className="rounded-xl border-border focus:ring-accent"
                    value={newLog.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewLog({ ...newLog, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="content"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Detailed Description
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="What did you accomplish today?"
                    className="rounded-xl min-h-[120px] border-border focus:ring-accent"
                    value={newLog.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewLog({ ...newLog, content: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="attachment"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Document Link (Optional)
                  </Label>
                  <div className="relative">
                    <Input
                      id="attachment"
                      placeholder="https://docs.google.com/..."
                      className="rounded-xl pl-10 border-border"
                      value={newLog.attachment_url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewLog({ ...newLog, attachment_url: e.target.value })
                      }
                    />
                    <Paperclip
                      className="absolute left-3 top-2.5 text-muted-foreground"
                      size={16}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="p-8 pt-0">
                <Button
                  className="w-full rounded-xl py-6 font-bold uppercase tracking-widest text-[10px] bg-accent hover:bg-accent/90"
                  onClick={handleCreateLog}
                  disabled={createLogMutation.isPending}
                >
                  {createLogMutation.isPending
                    ? "Processing..."
                    : "Confirm Entry"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {/* Stats Quick Look */}
      <motion.div
        variants={fadeInUp as any}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <Card className="p-10 border-border/50 bg-white dark:bg-zinc-950 shadow-sm rounded-[2rem]">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-accent/10 rounded-2xl text-accent">
              <History size={28} />
            </div>
            <div>
              <p className="text-[12px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                Logged Activities
              </p>
              <p className="text-5xl font-serif text-foreground">
                {logsData?.count || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-10 border-border/50 bg-white dark:bg-zinc-950 shadow-sm rounded-[2rem]">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-[12px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                Mentorship Feedback
              </p>
              <p className="text-5xl font-serif text-foreground">
                {feedbacks?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-10 border-foreground text-background bg-foreground relative overflow-hidden rounded-[2rem] shadow-2xl">
          <div className="absolute inset-0 dot-pattern opacity-[0.05]" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-5 bg-white/10 rounded-2xl text-white">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-[12px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                Internship Phase
              </p>
              <p className="text-4xl font-serif text-white italic">Ongoing</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Timeline Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-8 mb-12">
            <h3 className="text-[14px] font-mono font-black uppercase tracking-[0.4em] text-muted-foreground">
              Activity History
            </h3>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="space-y-6">
            {logsLoading ? (
              [1, 2, 3].map((i) => (
                <Card key={i} className="h-32 animate-pulse border-border/40" />
              ))
            ) : logsData?.data?.length > 0 ? (
              logsData.data.map((log: any) => {
                const fb = getFeedbackForLog(log)
                return (
                  <motion.div key={log.id} variants={fadeInUp as any}>
                    <Card 
                      className={cn(
                        "group transition-all duration-500 border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-950 shadow-sm",
                        isTutor ? "cursor-pointer hover:border-accent/30 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1" : "hover:border-accent/30 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1"
                      )}
                      onClick={() => {
                        if (isTutor && log.owner) {
                          setSelectedUser({
                            id: log.owner.id,
                            full_name: log.owner.full_name,
                            email: log.owner.email,
                            role: "Student",
                          })
                          setIsUserModalOpen(true)
                        }
                      }}
                    >
                      <div className="flex flex-col md:flex-row items-stretch min-h-[280px]">
                        <div className="md:w-48 bg-zinc-50 dark:bg-zinc-900/50 p-10 pl-14 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-900 shrink-0">
                          <span className="text-6xl font-serif text-foreground group-hover:scale-110 transition-transform">
                            {new Date(log.date).getDate()}
                          </span>
                          <span className="text-[14px] font-mono uppercase font-black tracking-widest text-muted-foreground mt-2">
                            {new Intl.DateTimeFormat("en-US", {
                              month: "long",
                            }).format(new Date(log.date))}
                          </span>
                        </div>
                        <div className="flex-1 p-12 space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-serif text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight flex items-center gap-4 flex-wrap">
                              {log.title}
                              {isTutor && log.owner && (
                                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest bg-muted/50 mt-1">
                                  {log.owner.full_name || log.owner.email}
                                </Badge>
                              )}
                            </h3>
                            <div className="flex items-center gap-3">
                              {!isTutor && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-10 rounded-2xl text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingLog(log)
                                    }}
                                  >
                                    <Edit size={18} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-10 rounded-2xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteLog(log.id)
                                    }}
                                  >
                                    <Trash2 size={18} />
                                  </Button>
                                </div>
                              )}
                              {log.attachment_url && (
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl" asChild>
                                  <a
                                    href={log.attachment_url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <Paperclip
                                      size={20}
                                      className="text-muted-foreground hover:text-emerald-600"
                                    />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-lg text-muted-foreground leading-relaxed">
                            {log.content}
                          </p>

                          {fb && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="mt-6 p-6 rounded-2xl bg-foreground text-background relative overflow-hidden shadow-2xl"
                            >
                              <div className="absolute inset-0 dot-pattern opacity-[0.03]" />
                              <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare
                                      size={14}
                                      className="text-accent-secondary"
                                    />
                                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                      Tutor Feedback
                                    </span>
                                  </div>
                                  {fb.rating && (
                                    <div className="flex gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={10}
                                          className={cn(
                                            i < fb.rating
                                              ? "fill-amber-400 text-amber-400"
                                              : "text-zinc-800",
                                          )}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm font-medium italic text-zinc-100">
                                  "{fb.comment}"
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })
            ) : (
              <Card className="p-20 border-dashed border-2 border-border/50 bg-transparent text-center space-y-4">
                <div className="bg-muted w-fit p-4 rounded-full mx-auto">
                  <Layout size={32} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-serif text-lg">
                  No activity history available.
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-border/50 overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/40">
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CheckCircle2 size={14} /> Internship Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  {isTutor ? "System Overview" : "Host Organization"}
                </p>
                <p className="text-lg font-serif">{isTutor ? "Global Activity Feed" : "Academic Team"}</p>
              </div>
              <div className="pt-6 border-t border-border/40 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                  {isTutor ? <Globe size={18} className="text-emerald-600" /> : <UserIcon size={18} className="text-emerald-600" />}
                  <div>
                    <p className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      {isTutor ? "Scope" : "Assigned Tutor"}
                    </p>
                    <p className="text-sm font-bold">{isTutor ? "Multiple Host Organizations" : "National Manager"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {!isTutor && <ActivityCalendar logs={logsData?.data || []} />}

          <Card className="bg-zinc-900 dark:bg-zinc-950 text-white border-none p-12 space-y-8 shadow-2xl shadow-zinc-900/20 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute inset-0 dot-pattern opacity-[0.05]" />
            <div className="relative z-10 space-y-6">
              <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <FileText size={36} className="text-white" />
              </div>
              <h3 className="text-3xl font-serif leading-tight group-hover:text-zinc-200 transition-colors">Internship Final Report</h3>
              <p className="text-zinc-400 text-base leading-relaxed">
                Upon completion of your tenure, you are required to formalize your learnings into a comprehensive final report for academic validation.
              </p>
              <Button
                variant="secondary"
                className="w-full h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] bg-white text-zinc-900 hover:bg-zinc-200 shadow-xl transition-all hover:scale-[1.02] active:scale-95"
              >
                Submission Portal Opening Soon
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {isTutor && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
        />
      )}

      {editingLog && (
        <Dialog open={!!editingLog} onOpenChange={(open) => !open && setEditingLog(null)}>
          <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-zinc-950 p-12 text-white relative">
              <div className="absolute inset-0 dot-pattern opacity-10" />
              <div className="relative z-10">
                <h2 className="text-4xl font-serif tracking-tight">Edit Log Entry</h2>
                <p className="text-zinc-400 text-sm mt-2 uppercase font-bold tracking-[0.2em]">Refine your daily professional records</p>
              </div>
            </div>
            <div className="p-12 space-y-8 bg-white dark:bg-zinc-950">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Log Date</label>
                      <Input 
                        type="date" 
                        defaultValue={editingLog.date}
                        className="h-14 rounded-2xl border-border/50 bg-muted/30 font-bold px-6"
                        id="edit-feature-date"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Hours Worked</label>
                      <Input 
                        type="number" 
                        defaultValue={editingLog.hours}
                        className="h-14 rounded-2xl border-border/50 bg-muted/30 font-bold px-6"
                        id="edit-feature-hours"
                      />
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Activity Description</label>
                  <Textarea 
                    defaultValue={editingLog.content}
                    className="min-h-[150px] rounded-2xl border-border/50 bg-muted/30 font-medium px-6 py-4 resize-none"
                    id="edit-feature-content"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] border-border/50"
                  onClick={() => setEditingLog(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl transition-all"
                  onClick={() => {
                    const date = (document.getElementById('edit-feature-date') as HTMLInputElement).value
                    const hours = (document.getElementById('edit-feature-hours') as HTMLInputElement).value
                    const content = (document.getElementById('edit-feature-content') as HTMLTextAreaElement).value
                    handleUpdateLog({ date, hours: parseInt(hours), content })
                  }}
                >
                  Confirm Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  )
}
