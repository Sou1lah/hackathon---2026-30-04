import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileCheck,
  History,
  Loader2,
  MoreVertical,
  Plus,
  Star,
  Upload,
} from "lucide-react"
import { useState } from "react"
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

  // 1. Fetch internships to get the active one (if no ID provided)
  const { data: internships, isLoading: isLoadingInternships } = useQuery({
    queryKey: ["internship-requests"],
    queryFn: () => InternshipsService.readInternshipRequests({ limit: 1 }),
    enabled: isViewingSelf,
  })

  const effectiveId = internshipId || internships?.data?.[0]?.id

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

  if (isLoadingInternships && isViewingSelf) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 col-span-2" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  if (!effectiveId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-full mb-6">
          <AlertCircle size={48} className="text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          No active internship found
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md">
          {isViewingSelf
            ? "You must have an approved internship request to access tracking."
            : "The provided internship ID is invalid."}
        </p>
        {isViewingSelf && (
          <Button className="mt-8 rounded-xl font-bold uppercase tracking-widest text-[10px] py-6 px-8">
            Create a request
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="p-[24px] space-y-[12px] bg-white dark:bg-zinc-950 min-h-screen">
      {/* ── Header Row ── */}
      <div className="flex flex-row justify-between items-start mb-6">
        <div className="space-y-1">
          <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Internship Log
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 max-w-[520px] leading-relaxed">
            {summary?.mission_title || "Tracking and activity history for your current internship."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isViewingSelf && (
            <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[13px] font-medium shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 gap-2 text-indigo-600 dark:text-indigo-400"
                >
                  <Plus size={14} /> Add activity
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
                  <Button onClick={handleAddLog} disabled={addLogMutation.isPending || !logContent} className="w-full rounded-xl font-bold uppercase tracking-widest text-[10px] py-6 bg-indigo-600 hover:bg-indigo-700 text-white border-none">
                    Save entry
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
        <div className="bg-zinc-900 dark:bg-indigo-950 text-white rounded-xl p-[14px_16px] flex items-center gap-4 h-[100px]">
          <div className="w-10 h-10 rounded-full bg-zinc-800 dark:bg-indigo-900 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-indigo-400" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-500">Current Status</span>
            <p className="text-[14px] font-bold uppercase tracking-tight text-white">{summary?.status || "Active"}</p>
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
                    <div key={entry.id} className="p-[16px] flex gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800 shrink-0">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{new Date(entry.date).getDate()}</span>
                        <span className="text-[7px] uppercase font-bold text-zinc-400">
                          {new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(entry.date)).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-snug">{entry.content}</p>
                          <span className="text-[10px] font-mono text-zinc-400">{entry.hours}h</span>
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
                    <div key={report.id} className="flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileCheck size={14} className="text-indigo-500" />
                        <span className="text-[13px] font-medium">{report.title}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase font-mono border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400">
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
    </div>
  )
}
