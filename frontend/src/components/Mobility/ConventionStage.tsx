import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Printer,
  ShieldCheck,
  Share2,
  X,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const SIGNATURE_STEPS = [
  { label: "Student", role: "Signatory 1", level: "N0" },
  { label: "Academic Tutor", role: "Signatory 2", level: "N0" },
  { label: "Host Company", role: "Signatory 3", level: "N0" },
  { label: "Department Head", role: "Signatory 4", level: "N1" },
  { label: "Dean / Director", role: "Signatory 5", level: "N2" },
  { label: "Vice-Rectorate", role: "Signatory 6", level: "N3" },
  { label: "Rectorate (Final)", role: "Signatory 7", level: "N3" },
  { label: "PROGRES System", role: "Archiving", level: "N3" },
]

function statusColor(status: string) {
  if (status === "completed") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  if (status === "rejected") return "bg-red-500/10 text-red-600 border-red-500/20"
  return "bg-amber-500/10 text-amber-600 border-amber-500/20"
}

function approvalLabel(level: string) {
  const map: Record<string, string> = { N1: "Level 1", N2: "Level 2", N3: "Level 3" }
  return map[level] ?? level
}

function ConventionDetailModal({
  convention,
  onClose,
  onSign,
  isSigning,
}: {
  convention: any
  onClose: () => void
  onSign: (id: string) => void
  isSigning: boolean
}) {
  const getStepStatus = (index: number) => {
    if (convention.status === "completed") return "completed"
    if (convention.status === "rejected") return "failed"
    const levelMap: Record<string, number> = { N1: 3, N2: 4, N3: 5 }
    const current = levelMap[convention.approval_level] ?? 0
    if (index < current) return "completed"
    if (index === current) return "current"
    return "pending"
  }

  const completedSteps = SIGNATURE_STEPS.filter((_, i) => getStepStatus(i) === "completed").length
  const progressValue = (completedSteps / SIGNATURE_STEPS.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative bg-zinc-900 text-white p-8 overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <FileText size={26} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">Convention</p>
                <h2 className="text-xl font-bold text-white leading-tight max-w-sm line-clamp-2">
                  {convention.document_name}
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-1.5">
                  ID: {convention.id.split("-")[0].toUpperCase()} &bull; Submitted {new Date(convention.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="size-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-all shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Status + actions */}
          <div className="relative z-10 flex items-center gap-3 mt-6">
            <Badge variant="outline" className={cn("border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full", statusColor(convention.status))}>
              {convention.status}
            </Badge>
            <Badge variant="outline" className="border border-white/20 bg-white/10 text-zinc-300 text-[10px] font-mono px-3 py-1.5 rounded-full">
              {approvalLabel(convention.approval_level)}
            </Badge>
            <div className="ml-auto flex items-center gap-2">
              <button className="size-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 transition-all">
                <Download size={15} />
              </button>
              <button className="size-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 transition-all">
                <Printer size={15} />
              </button>
              <button className="size-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 transition-all">
                <Share2 size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-8 space-y-8">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest font-bold text-zinc-500">
              <span>Signature Progress</span>
              <span className="text-zinc-900 dark:text-zinc-50">{completedSteps} / {SIGNATURE_STEPS.length}</span>
            </div>
            <Progress value={progressValue} className="h-2 bg-zinc-100 dark:bg-zinc-900" />
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Internship info */}
            <div className="space-y-5">
              {/* Mission */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Building2 size={11} /> Mission
                </p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {convention.internship_request?.mission_title || "—"}
                </p>
                {convention.internship_request?.mission_description && (
                  <p className="text-xs text-zinc-500 leading-relaxed italic">
                    "{convention.internship_request.mission_description}"
                  </p>
                )}
              </div>

              {/* Company */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">Company</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {convention.internship_request?.company_name || "—"}
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">Period</p>
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Calendar size={11} />
                    {convention.internship_request?.start_date
                      ? new Date(convention.internship_request.start_date).toLocaleDateString()
                      : "—"}
                    {" → "}
                    {convention.internship_request?.end_date
                      ? new Date(convention.internship_request.end_date).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              {/* PAdES info */}
              <div className="p-4 bg-zinc-900 dark:bg-zinc-900 rounded-xl border border-zinc-800 flex items-center gap-3">
                <ShieldCheck size={20} className="text-zinc-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">PAdES Certificate</p>
                  <p className="text-[9px] font-mono text-zinc-500 mt-0.5">LTV Version — PDF/A-3</p>
                </div>
              </div>
            </div>

            {/* Right: Signature circuit */}
            <div className="space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <CheckCircle size={11} /> Signature Circuit
              </p>
              <div className="space-y-0">
                {SIGNATURE_STEPS.map((step, i) => {
                  const st = getStepStatus(i)
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "size-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all",
                          st === "completed" ? "bg-emerald-500 border-emerald-500 text-white"
                            : st === "current" ? "bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50 text-zinc-50 dark:text-zinc-900 ring-2 ring-zinc-200 dark:ring-zinc-700"
                              : st === "failed" ? "bg-red-500 border-red-500 text-white"
                                : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                        )}>
                          {st === "completed" ? <CheckCircle2 size={11} />
                            : st === "failed" ? <AlertCircle size={11} />
                              : <span className="text-[8px] font-mono font-bold">{i + 1}</span>}
                        </div>
                        {i < SIGNATURE_STEPS.length - 1 && (
                          <div className={cn("w-px flex-1 my-0.5 min-h-[20px]",
                            st === "completed" ? "bg-emerald-400" : "bg-zinc-100 dark:bg-zinc-800"
                          )} />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className={cn("text-xs font-bold leading-none mb-0.5",
                          st === "completed" || st === "current" ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400"
                        )}>{step.label}</p>
                        <p className="text-[9px] text-zinc-400 font-mono">{step.role}</p>
                        {st === "completed" && <p className="text-[8px] font-mono text-emerald-500 font-bold mt-1 uppercase">Validated</p>}
                        {st === "current" && <p className="text-[8px] font-mono text-amber-500 font-bold mt-1 uppercase animate-pulse">In Progress</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-900 p-6 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/30">
          <Button variant="ghost" onClick={onClose} className="text-zinc-500 font-bold text-xs uppercase tracking-wider">
            Close
          </Button>
          {convention.status === "pending" && (
            <Button
              onClick={() => onSign(convention.id)}
              disabled={isSigning}
              className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-bold uppercase tracking-widest text-xs px-8 hover:opacity-90 transition-all"
            >
              {isSigning ? "Processing…" : "Sign Now"}
            </Button>
          )}
          {convention.status === "completed" && (
            <Badge className="bg-emerald-500 text-white px-5 py-2 rounded-full font-bold uppercase text-[9px] tracking-widest">
              Signed & Validated
            </Badge>
          )}
          {convention.status === "rejected" && (
            <Badge variant="destructive" className="px-5 py-2 rounded-full font-bold uppercase text-[9px] tracking-widest">
              Rejected
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConventionStage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<any>(null)

  const { data: conventions, isLoading } = useQuery({
    queryKey: ["my-conventions"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!response.ok) throw new Error("Failed to fetch")
      return response.json()
    },
  })

  const signMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/${id}/sign`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      )
      if (!response.ok) throw new Error("Failed to sign")
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-conventions"] })
      // refresh selected convention in modal
      setSelected((prev: any) => prev ? { ...prev, ...data } : null)
    },
  })

  const rows: any[] = conventions?.data ?? []

  if (isLoading) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center">
        <Clock className="h-10 w-10 animate-spin text-zinc-300" />
      </div>
    )
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto p-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Internship Conventions
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Tracking of your PAdES electronic signatures and approval workflow.
          </p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm">
          <ShieldCheck size={18} className="text-zinc-400" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-50 block">PAdES Certificate</span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">LTV Version</span>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 gap-6">
          <div className="p-5 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400">
            <FileText size={40} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">No Convention Yet</h2>
            <p className="text-zinc-500 text-sm">Apply to an internship first to generate a convention.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-zinc-100 dark:border-zinc-900 rounded-2xl">
          <Table>
            <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/50">
              <TableRow className="border-zinc-100 dark:border-zinc-900 hover:bg-transparent">
                <TableHead className="pl-8 py-5 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Document</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Mission</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Approval Level</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Status</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Submitted</TableHead>
                <TableHead className="pr-8 text-right font-mono text-[10px] uppercase tracking-widest text-zinc-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((conv) => (
                <TableRow
                  key={conv.id}
                  className="border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer group"
                  onClick={() => setSelected(conv)}
                >
                  <TableCell className="pl-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors border border-zinc-200 dark:border-zinc-800">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50 max-w-[200px] truncate">
                          {conv.document_name}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-400 uppercase">
                          {conv.id.split("-")[0].toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 max-w-[180px] truncate font-medium">
                      {conv.internship_request?.mission_title || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] border-zinc-200 dark:border-zinc-800 text-zinc-500 px-3">
                      {approvalLabel(conv.approval_level)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-widest px-3 py-1 border rounded-full", statusColor(conv.status))}>
                      {conv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-zinc-500 font-medium">
                      {new Date(conv.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-xl transition-all"
                      onClick={(e) => { e.stopPropagation(); setSelected(conv) }}
                    >
                      <Eye size={14} /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selected && (
        <ConventionDetailModal
          convention={selected}
          onClose={() => setSelected(null)}
          onSign={(id) => signMutation.mutate(id)}
          isSigning={signMutation.isPending}
        />
      )}
    </div>
  )
}
