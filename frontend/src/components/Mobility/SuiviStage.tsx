import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  FileCheck,
  Globe,
  History,
  Loader2,
  Lock,
  MoreVertical,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  ActivityLogService,
  InternshipsService,
  MobilityService,
} from "@/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import TrackingLocked from "./TrackingLocked"

function ActivityCalendar({ logs }: { logs: any[] }) {
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  const loggedDays = new Set(
    logs.map(log => new Date(log.date).getDate())
  )

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[12px] shadow-none overflow-hidden mt-4">
      <div className="p-[16px] border-b border-zinc-50 dark:border-zinc-800/50 flex justify-between items-center">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.06em] text-zinc-400">Attendance Tracker</h2>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {today.toLocaleString('default', { month: 'long' })}
        </span>
      </div>
      <CardContent className="p-[16px]">
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
                <div className={`size-2.5 rounded-full ${colorClass} shadow-sm animate-in fade-in zoom-in duration-500`} />
                <span className="text-[9px] font-bold text-zinc-400">{day}</span>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Logged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-rose-500" />
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-orange-400" />
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Future</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SuiviStage({
  internshipId,
}: {
  internshipId?: string
}) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [isEvalDialogOpen, setIsEvalDialogOpen] = useState(false)

  // Form states
  const [logContent, setLogContent] = useState("")
  const [logHours, setLogHours] = useState(8)
  const [reportTitle, setReportTitle] = useState("")
  const [evalRating, setEvalRating] = useState(5)
  const [evalComment, setEvalComment] = useState("")

  const isTutor = user?.can_review_applications || user?.is_superuser
  const isViewingSelf = !internshipId

  // 1. Fetch all internship requests to find the ones that are trackable (active or completed)
  const { data: allInternships, isLoading: isLoadingAll } = useQuery({
    queryKey: ["internship-requests", "all"],
    queryFn: () => InternshipsService.readInternshipRequests({ limit: 100 }),
  })

  const trackableInternships = (allInternships?.data || []).filter(
    (req: any) => 
      req.status === "active" || 
      req.status === "completed" || 
      req.status === "pending_signature" ||
      req.progress >= 50
  )

  const [activeId, setActiveId] = useState<string | null>(internshipId || null)

  // Auto-select if only one internship is trackable
  useEffect(() => {
    if (!activeId && trackableInternships.length === 1) {
      setActiveId(trackableInternships[0].id)
    }
  }, [trackableInternships, activeId])

  const effectiveId = internshipId || activeId

  // 2. Fetch summary for the active internship
  const { data: summary } = useQuery({
    queryKey: ["internship-summary", effectiveId],
    queryFn: () => MobilityService.readInternshipSummary({ id: effectiveId! }),
    enabled: !!effectiveId,
  })

  // 3. Fetch full activity log
  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["activity-logs", effectiveId],
    queryFn: () =>
      ActivityLogService.readActivityLog({ internshipRequestId: effectiveId! }),
    enabled: !!effectiveId,
  })

  // Mutations
  const addLogMutation = useMutation({
    mutationFn: (data: { content: string; hours: number; date: string }) =>
      ActivityLogService.createLogEntry({
        requestBody: {
          ...data,
          internship_request_id: effectiveId!,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["activity-logs", effectiveId],
      })
      toast.success("Entry added to the logbook.")
      setIsLogDialogOpen(false)
      setLogContent("")
    },
  })

  const addReportMutation = useMutation({
    mutationFn: (title: string) =>
      MobilityService.createReport({
        requestBody: {
          title,
          internship_request_id: effectiveId!,
          status: "pending" as any,
        },
      }),
    onSuccess: () => {
      toast.success("Report submitted successfully.")
      setIsReportDialogOpen(false)
      setReportTitle("")
    },
  })

  const addEvalMutation = useMutation({
    mutationFn: () =>
      MobilityService.createEvaluation({
        requestBody: {
          rating: evalRating,
          comment: evalComment,
          internship_request_id: effectiveId!,
        },
      }),
    onSuccess: () => {
      toast.success("Evaluation saved.")
      setIsEvalDialogOpen(false)
    },
  })

  const handleAddLog = () => {
    if (!logContent) return
    addLogMutation.mutate({
      content: logContent,
      hours: logHours,
      date: new Date().toISOString().split("T")[0],
    })
  }

  const handleAddReport = () => {
    if (!reportTitle) return
    addReportMutation.mutate(reportTitle)
  }

  const handleAddEval = () => {
    if (!evalComment) return
    addEvalMutation.mutate()
  }

  const [editingLog, setEditingLog] = useState<any | null>(null)

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this log entry?")) return
    try {
      await ActivityLogService.deleteLog({ id: logId })
      toast.success("Log entry deleted")
      logs.refetch()
    } catch (error) {
      toast.error("Failed to delete log")
    }
  }

  const handleUpdateLog = async (data: any) => {
    try {
      await ActivityLogService.updateLog({
        id: editingLog.id,
        requestBody: {
          ...data,
          internship_request_id: effectiveId
        }
      })
      toast.success("Log entry updated")
      setEditingLog(null)
      logs.refetch()
    } catch (error) {
      toast.error("Failed to update log")
    }
  }

  if (isLoadingAll) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-2">
           <Skeleton className="h-10 w-64" />
           <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-[2rem]" />
          <Skeleton className="h-64 rounded-[2rem]" />
          <Skeleton className="h-64 rounded-[2rem]" />
        </div>
      </div>
    )
  }

  // If no effective ID and multiple or zero trackable ones, show the list
  if (!effectiveId) {
    return (
      <div className="p-10 space-y-12 animate-in fade-in duration-1000">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-50">
            Internship Tracking
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            Select an active internship to manage your logbook and reports.
          </p>
        </div>

        {trackableInternships.length === 0 ? (
          <TrackingLocked />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trackableInternships.map((req: any) => (
              <Card 
                key={req.id} 
                className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all duration-500 group rounded-[2.5rem] bg-white dark:bg-zinc-950 flex flex-col"
              >
                <div className="h-32 bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                   <Building2 className="size-12 text-emerald-500/20 group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute top-4 right-4">
                      <Badge className="bg-emerald-500 text-white border-none text-[8px] font-bold tracking-widest uppercase">
                        {req.status}
                      </Badge>
                   </div>
                </div>
                <CardContent className="p-8 flex-1">
                   <h3 className="font-bold text-xl mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">{req.company_name}</h3>
                   <p className="text-xs text-muted-foreground mb-4 font-medium line-clamp-1 italic">"{req.mission_title}"</p>
                   
                   <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      <div className="flex items-center gap-1.5">
                         <Calendar size={12} className="text-emerald-500" />
                         {new Date(req.start_date).toLocaleDateString()}
                      </div>
                      <div className="size-1 rounded-full bg-zinc-200" />
                      <div className="flex items-center gap-1.5">
                         <Clock size={12} className="text-emerald-500" />
                         {req.current_step}/8 Steps
                      </div>
                   </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                   <Button 
                     onClick={() => setActiveId(req.id)}
                     className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-lg"
                   >
                     Track Progress
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          {isViewingSelf && (
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setActiveId(null)}
               className="mb-4 -ml-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]"
             >
               <ArrowLeft size={14} /> Back to Overview
             </Button>
          )}
          <h1 className="text-5xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-50 flex items-center gap-4">
            <span className="size-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
               <History size={28} />
            </span>
            {summary?.company_name || "Internship Tracking"}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-none font-bold text-[10px] uppercase tracking-widest px-3">
              {summary?.mission_title || "Generic Mission"}
            </Badge>
            <div className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Globe size={12} className="text-emerald-500" />
              {summary?.company_address?.split(',').pop()?.trim() || "National"}
            </span>
            <div className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar size={12} className="text-emerald-500" />
              {(() => {
                if (!summary?.start_date || !summary?.end_date) return "Duration TBD"
                const start = new Date(summary.start_date)
                const end = new Date(summary.end_date)
                const diffTime = Math.abs(end.getTime() - start.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                const months = Math.floor(diffDays / 30)
                const weeks = Math.floor((diffDays % 30) / 7)
                return `${months > 0 ? `${months}m ` : ""}${weeks > 0 ? `${weeks}w` : diffDays + "d"}`
              })()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isViewingSelf && (
            <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-10 px-6 rounded-xl border border-border bg-white dark:bg-zinc-900 text-[11px] font-bold uppercase tracking-widest shadow-sm hover:bg-muted/50 dark:hover:bg-muted/20 gap-2 text-emerald-600 dark:text-emerald-400 transition-all"
                >
                  <Plus size={14} /> Add Log Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-2xl border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">New Activity</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="content" className="text-[11px] uppercase font-bold text-zinc-400 tracking-[0.06em]">
                      Activity Description
                    </Label>
                    <Input
                      id="content"
                      placeholder="What did you accomplish?"
                      className="rounded-xl border-zinc-200 dark:border-zinc-800"
                      value={logContent}
                      onChange={(e) => setLogContent(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hours" className="text-[11px] uppercase font-bold text-zinc-400 tracking-[0.06em]">
                      Hours completed
                    </Label>
                    <Input
                      id="hours"
                      type="number"
                      className="rounded-xl border-zinc-200 dark:border-zinc-800"
                      value={logHours}
                      onChange={(e) => setLogHours(parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddLog} disabled={addLogMutation.isPending || !logContent} className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-500/20">
                    Save entry to logbook
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* ── Top Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px] mb-[12px]">
        {/* Col 1: Activities */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-[14px_16px] flex flex-col justify-between h-[100px]">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-400">Activities</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-zinc-900 dark:text-zinc-50">{logs?.count || 0}</span>
            <span className="text-[11px] text-zinc-400 font-medium">Logged</span>
          </div>
        </div>

        {/* Col 2: Feedback */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-[14px_16px] flex flex-col justify-between h-[100px]">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-400">Feedback</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-zinc-900 dark:text-zinc-50">{summary?.reports?.filter((r:any)=>r.status === 'approved').length || 0}</span>
            <span className="text-[11px] text-zinc-400 font-medium">Approved Reports</span>
          </div>
        </div>

        {/* Col 3: Status */}
        <div className="bg-emerald-900 dark:bg-emerald-950 text-white rounded-2xl p-[20px] flex items-center gap-4 h-[110px] shadow-xl shadow-emerald-500/10">
          <div className="size-12 rounded-full bg-emerald-800 dark:bg-emerald-900 flex items-center justify-center shrink-0 border border-emerald-700/50">
            <Clock size={20} className="text-emerald-300" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">Current Status</span>
            <p className="text-[16px] font-black uppercase tracking-tight text-white">{summary?.status || "Active"}</p>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-[12px]">
        
        {/* Left: Timeline Card */}
        <div className="space-y-[12px]">
          <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[12px] shadow-none overflow-hidden">
            <div className="p-[16px] border-b border-zinc-50 dark:border-zinc-800/50">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.06em] text-zinc-400">Activity History</h2>
            </div>
            <CardContent className="p-0">
              {isLoadingLogs ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : logs?.data && logs.data.length > 0 ? (
                <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {logs.data.map((entry) => (
                    <div key={entry.id} className="group flex gap-0 hover:bg-muted/40 dark:hover:bg-muted/20 transition-colors border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                      <div className="w-14 self-stretch bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center border-r border-zinc-100 dark:border-zinc-800 shrink-0 py-4">
                        <span className="text-[14px] font-black text-indigo-600 dark:text-indigo-400 leading-none">{new Date(entry.date).getDate()}</span>
                        <span className="text-[8px] uppercase font-black text-zinc-400 tracking-tighter">
                          {new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(entry.date)).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 p-[16px_20px] space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed max-w-[80%]">{entry.content}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono font-bold text-indigo-600/50 dark:text-indigo-400/50">{entry.hours}h</span>
                            {isViewingSelf && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg"
                                  onClick={() => setEditingLog(entry)}
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                                  onClick={() => handleDeleteLog(entry.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-[40px] text-center flex flex-col items-center justify-center">
                  <History size={36} className="text-zinc-200 dark:text-zinc-800 mb-2 opacity-25" />
                  <p className="text-[13px] text-zinc-400 font-medium">No activity history available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[12px] shadow-none">
             <div className="p-[16px] border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.06em] text-zinc-400">Deliverables</h2>
                {isViewingSelf && (
                   <Button variant="ghost" size="icon" onClick={()=>setIsReportDialogOpen(true)} className="size-6 text-zinc-400 hover:text-indigo-600">
                     <Plus size={14} />
                   </Button>
                )}
             </div>
             <CardContent className="p-[16px] space-y-2">
                {summary?.reports && summary.reports.length > 0 ? (
                  summary.reports.map((report: any) => (
                  <div className="flex items-center justify-between p-3 bg-muted/40 dark:bg-muted/20 border border-border dark:border-zinc-800 rounded-xl transition-all hover:border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <FileCheck size={14} className="text-emerald-500" />
                      <span className="text-[13px] font-bold text-emerald-900 dark:text-emerald-50">{report.title}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-mono border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold">
                      {report.status}
                    </Badge>
                  </div>
                  ))
                ) : (
                  <p className="text-[12px] text-zinc-400 italic">No reports submitted yet.</p>
                )}
             </CardContent>
          </Card>
        </div>

        {/* Right: Sidebar Stack */}
        <div className="space-y-[12px]">
          <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[12px] shadow-none overflow-hidden">
            <div className="p-[16px] border-b border-zinc-50 dark:border-zinc-800/50">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.06em] text-zinc-400">Internship Information</h2>
            </div>
            <CardContent className="p-[16px] space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-400">Host organization</span>
                <p className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50">{summary?.company_name || "Not specified"}</p>
              </div>
              <div className="h-[0.5px] bg-zinc-100 dark:bg-zinc-800" />
              <div className="space-y-1">
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-400">Supervisor</span>
                <p className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50">{summary?.supervisor_name || "National Manager"}</p>
              </div>
            </CardContent>
          </Card>
          <ActivityCalendar logs={logs?.data || []} />

          <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[12px] shadow-none overflow-hidden">
             <div className="p-[16px] border-b border-zinc-50 dark:border-zinc-800/50">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.06em] text-zinc-400">Internship Team</h2>
            </div>
            <CardContent className="p-[16px]">
              <div className="flex items-center gap-3">
                <div className="w-[28px] h-[28px] rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                  {summary?.supervisor_name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2) || "IM"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 truncate">{summary?.supervisor_name || "Internship Manager"}</p>
                  <p className="text-[12px] text-zinc-500 truncate">Academic Tutor</p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                className="w-full mt-[10px] h-8 text-[12px] font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-none hover:bg-zinc-50 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400"
              >
                Contact team
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-[12px] border-none shadow-none p-[16px]">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.06em] text-zinc-500">Evaluation</h2>
                <Badge variant="outline" className="text-[8px] border-zinc-800 text-zinc-500 font-mono">
                  {summary?.evaluation ? "FINALIZED" : "PENDING"}
                </Badge>
             </div>
             {summary?.evaluation ? (
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-800/50 text-[12px] text-zinc-400 italic">
                    "{summary.evaluation.comment}"
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= summary.evaluation.rating ? "text-amber-500 fill-amber-500" : "text-zinc-800 fill-zinc-800"} />)}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">SCORE: {summary.evaluation.rating}/5</span>
                  </div>
                </div>
             ) : (
                <p className="text-[11px] text-zinc-500 leading-relaxed text-center py-4 border border-dashed border-zinc-800 rounded-lg">
                  Evaluation available once completed by your tutor.
                </p>
             )}
          </Card>
        </div>
      </div>
      {editingLog && (
        <Dialog open={!!editingLog} onOpenChange={(open) => !open && setEditingLog(null)}>
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-zinc-900 p-8 text-white">
              <h2 className="text-2xl font-black italic tracking-tight">Edit Log Entry</h2>
              <p className="text-zinc-400 text-sm mt-1 uppercase font-bold tracking-widest">Update your professional activities</p>
            </div>
            <div className="p-8 space-y-6 bg-white dark:bg-zinc-950">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Date</label>
                      <Input 
                        type="date" 
                        defaultValue={editingLog.date}
                        className="h-12 rounded-2xl border-zinc-100 bg-zinc-50 font-bold"
                        id="edit-date"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Hours</label>
                      <Input 
                        type="number" 
                        defaultValue={editingLog.hours}
                        className="h-12 rounded-2xl border-zinc-100 bg-zinc-50 font-bold"
                        id="edit-hours"
                      />
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Activity Content</label>
                  <Textarea 
                    defaultValue={editingLog.content}
                    className="min-h-[120px] rounded-2xl border-zinc-100 bg-zinc-50 font-medium resize-none"
                    id="edit-content"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                  onClick={() => setEditingLog(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg"
                  onClick={() => {
                    const date = (document.getElementById('edit-date') as HTMLInputElement).value
                    const hours = (document.getElementById('edit-hours') as HTMLInputElement).value
                    const content = (document.getElementById('edit-content') as HTMLTextAreaElement).value
                    handleUpdateLog({ date, hours: parseInt(hours), content })
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
