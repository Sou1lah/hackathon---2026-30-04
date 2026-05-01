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
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
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
    <div className="space-y-10 pb-20 p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Internship Tracking
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {summary?.mission_title || "Loading..."} @ {summary?.company_name}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge
              variant="outline"
              className="text-[10px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            >
              {summary?.status}
            </Badge>
            <span className="text-[10px] font-mono text-zinc-400 uppercase">
              Step {summary?.current_step}/8
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm self-start md:self-center">
          <div className="flex flex-col items-center px-6 py-3 border-r border-zinc-200 dark:border-zinc-800">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50 tracking-tighter">
              {summary?.total_hours || 0}
            </span>
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
              Hours
            </span>
          </div>
          <div className="flex flex-col items-center px-6 py-3 bg-zinc-50 dark:bg-zinc-900/30">
            <span className="text-2xl font-bold font-mono text-emerald-500 tracking-tighter">
              {summary?.progress || 0}%
            </span>
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
              Progress
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Activity Log */}
        <div className="xl:col-span-2">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-none h-full flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 dark:border-zinc-900 py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <History size={18} className="text-zinc-400" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Logbook
                </span>
              </CardTitle>
              {isViewingSelf && (
                <Dialog
                  open={isLogDialogOpen}
                  onOpenChange={setIsLogDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="h-8 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-bold text-[10px] tracking-wider uppercase gap-2"
                    >
                      <Plus size={14} /> New Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-2xl border-zinc-200 dark:border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">
                        New Entry
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="content"
                          className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest"
                        >
                          Activity Description
                        </Label>
                        <Input
                          id="content"
                          placeholder="What did you accomplish today?"
                          className="rounded-xl border-zinc-200 dark:border-zinc-800"
                          value={logContent}
                          onChange={(e) => setLogContent(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label
                          htmlFor="hours"
                          className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest"
                        >
                          Hours completed
                        </Label>
                        <Input
                          id="hours"
                          type="number"
                          min="1"
                          max="24"
                          className="rounded-xl border-zinc-200 dark:border-zinc-800"
                          value={logHours}
                          onChange={(e) =>
                            setLogHours(parseInt(e.target.value, 10))
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAddLog}
                        disabled={addLogMutation.isPending || !logContent}
                        className="w-full rounded-xl font-bold uppercase tracking-widest text-[10px] py-6"
                      >
                        {addLogMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {isLoadingLogs ? (
                <div className="p-8 space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : logs?.data && logs.data.length > 0 ? (
                <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
                  {logs.data.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group"
                    >
                      <div className="flex gap-6">
                        <div className="flex flex-col items-center gap-3 w-12 shrink-0">
                          <div className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 w-12 h-12 rounded-xl flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800 font-mono">
                            <span className="text-sm font-bold leading-none">
                              {new Date(entry.date).getDate()}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-zinc-400">
                              {new Intl.DateTimeFormat("en-US", {
                                month: "short",
                              })
                                .format(new Date(entry.date))
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-zinc-400 font-mono text-[10px] font-bold">
                            <Clock size={10} />
                            <span>{entry.hours}H</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant="outline"
                              className="text-[9px] font-mono tracking-widest bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 uppercase"
                            >
                              Activity
                            </Badge>
                            {isViewingSelf && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical size={14} />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                            {entry.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center flex flex-col items-center opacity-50">
                  <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-full mb-4">
                    <History size={32} />
                  </div>
                  <p className="text-sm font-medium">No entry in the log.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-0 border-t border-zinc-50 dark:border-zinc-900">
              <Button
                variant="ghost"
                className="w-full py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-none"
              >
                Load full history
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Deliverables & Evaluation */}
        <div className="space-y-8">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <FileCheck size={16} className="text-zinc-400" /> Required
                Deliverables
              </CardTitle>
              {isViewingSelf && (
                <Dialog
                  open={isReportDialogOpen}
                  onOpenChange={setIsReportDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                    >
                      <Plus size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-2xl border-zinc-200 dark:border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">
                        Submit a Report
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="reportTitle"
                          className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest"
                        >
                          Report Title
                        </Label>
                        <Input
                          id="reportTitle"
                          placeholder="Ex: First Milestone Report"
                          className="rounded-xl border-zinc-200 dark:border-zinc-800"
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                        />
                      </div>
                      <div className="p-8 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl text-center">
                        <Upload
                          size={24}
                          className="mx-auto text-zinc-300 mb-2"
                        />
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          Click to upload PDF
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAddReport}
                        disabled={addReportMutation.isPending || !reportTitle}
                        className="w-full rounded-xl font-bold uppercase tracking-widest text-[10px] py-6"
                      >
                        {addReportMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Submit
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {summary?.reports && summary.reports.length > 0 ? (
                summary.reports.map((report: any) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3.5 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900 rounded-xl group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                  >
                    <div className="flex gap-4 items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center border transition-all",
                          report.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : report.status === "pending"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800",
                        )}
                      >
                        {report.status === "approved" ? (
                          <CheckCircle size={18} />
                        ) : (
                          <Upload size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                          {report.title}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter mt-0.5">
                          {report.status === "approved"
                            ? "Approved"
                            : "Under review"}{" "}
                          • {new Date(report.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    No documents submitted.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tutor Evaluation - Vercel Style */}
          <Card className="bg-zinc-950 text-zinc-50 border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <Badge
                variant="outline"
                className="text-[8px] border-zinc-800 text-zinc-500 font-mono tracking-widest bg-zinc-900/50 uppercase"
              >
                Status: {summary?.evaluation ? "Finalized" : "Pending"}
              </Badge>
            </div>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <Star size={14} className="text-amber-500 fill-amber-500" />{" "}
                Tutor Evaluation
              </CardTitle>
              {isTutor && !isViewingSelf && (
                <Dialog
                  open={isEvalDialogOpen}
                  onOpenChange={setIsEvalDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-zinc-400 hover:text-zinc-50"
                    >
                      <Plus size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-2xl border-zinc-200 dark:border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">
                        Evaluate the trainee
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="grid gap-2">
                        <Label className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
                          Rating (1 to 5)
                        </Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={24}
                              className={cn(
                                "cursor-pointer transition-all",
                                i <= evalRating
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-zinc-200 dark:text-zinc-800",
                              )}
                              onClick={() => setEvalRating(i)}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label
                          htmlFor="comment"
                          className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest"
                        >
                          Comments
                        </Label>
                        <Input
                          id="comment"
                          placeholder="Strengths, areas for improvement..."
                          className="rounded-xl border-zinc-200 dark:border-zinc-800"
                          value={evalComment}
                          onChange={(e) => setEvalComment(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAddEval}
                        disabled={addEvalMutation.isPending || !evalComment}
                        className="w-full rounded-xl font-bold uppercase tracking-widest text-[10px] py-6"
                      >
                        {addEvalMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save evaluation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 rounded-lg border border-zinc-800">
                  <AvatarFallback className="bg-zinc-900 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    TS
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">Internship Manager</p>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">
                    Professional Evaluation
                  </p>
                </div>
              </div>
              {summary?.evaluation ? (
                <>
                  <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50 text-sm text-zinc-300 leading-relaxed font-medium italic">
                    "{summary.evaluation.comment}"
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i <= summary.evaluation.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-zinc-800 fill-zinc-800"
                          }
                        />
                      ))}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[8px] border-zinc-800 text-zinc-500 font-mono tracking-widest"
                    >
                      SCORE: {summary.evaluation.rating}/5
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="p-10 text-center bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
                    The evaluation will be available once completed by your
                    tutor.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {summary?.alerts && summary.alerts.length > 0 && (
            <div className="space-y-3">
              {summary.alerts.map((alert: any, i: number) => (
                <div
                  key={i}
                  className={cn(
                    "p-4 rounded-xl flex gap-3 text-[11px] font-medium leading-relaxed border",
                    alert.type === "critical"
                      ? "bg-red-500/10 border-red-500/20 text-red-500"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500",
                  )}
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
