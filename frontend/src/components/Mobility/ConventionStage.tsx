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
  Trash2,
  X,
  FileCode,
  Layers,
} from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

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
  if (status === "completed")
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  if (status === "rejected") return "bg-red-500/10 text-red-600 border-red-500/20"
  return "bg-amber-500/10 text-amber-600 border-amber-500/20"
}

function approvalLabel(level: string) {
  const map: Record<string, string> = { N1: "Level 1", N2: "Level 2", N3: "Level 3" }
  return map[level] ?? level
}

// ──── Bottom Sheet Drawer ───────────────
function ConventionDetailsModal({
  convention,
  isOpen,
  onClose,
  onSign,
  onDelete,
  isSigning,
}: {
  convention: any
  isOpen: boolean
  onClose: () => void
  onSign: (id: string) => void
  onDelete: (id: string) => void
  isSigning: boolean
}) {
  const getStepStatus = (index: number) => {
    if (convention.status === "completed") return "completed"
    if (convention.status === "rejected") return "failed"
    const current = (convention.signature_step || 1) - 1
    if (index < current) return "completed"
    if (index === current) return "current"
    return "pending"
  }

  const completedSteps = SIGNATURE_STEPS.filter(
    (_, i) => getStepStatus(i) === "completed",
  ).length
  const progressValue = (completedSteps / SIGNATURE_STEPS.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-950">
        <DialogHeader className="p-8 pb-4 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-white dark:bg-zinc-950 flex items-center justify-center text-zinc-900 dark:text-zinc-50 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                <FileCode size={28} />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  {convention.document_name}
                </DialogTitle>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  REF: {convention.id.split("-")[0].toUpperCase()} — SYSTEM CLEARANCE GRANTED
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (confirm("Delete this convention?")) onDelete(convention.id)
                }}
                className="h-10 w-10 rounded-xl border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[70vh]">
          {/* Left: PDF Preview Placeholder */}
          <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 relative group overflow-hidden">
             <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 space-y-4">
                <FileText size={64} className="opacity-20" />
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">PDF Document Preview</p>
                <Button variant="outline" className="rounded-full h-8 text-[10px] font-bold uppercase tracking-widest border-zinc-200 dark:border-zinc-800">
                  <Download size={14} className="mr-2" /> Download Document
                </Button>
             </div>
             {/* Imagine an iframe here */}
             <div className="absolute inset-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl opacity-50" />
          </div>

          {/* Right: Sidebar Progress */}
          <ScrollArea className="w-full md:w-[380px] border-l border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
            <div className="p-8 space-y-10">
              {/* Overall Progress */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} className="text-zinc-400" /> System Progress
                  </h3>
                  <Badge variant="outline" className={cn("rounded-full px-3 py-0.5 text-[9px] font-bold tracking-widest uppercase", statusColor(convention.status))}>
                    {convention.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Progress value={progressValue} className="h-3 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    <span>{progressValue.toFixed(0)}% Completed</span>
                    <span>{completedSteps}/{SIGNATURE_STEPS.length} Steps</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-zinc-100 dark:bg-zinc-900" />

              {/* Steps Timeline */}
              <div className="space-y-6">
                {SIGNATURE_STEPS.map((step, i) => {
                  const st = getStepStatus(i)
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "size-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all",
                            st === "completed"
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : st === "current"
                                ? "bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50 text-zinc-50 dark:text-zinc-900 ring-4 ring-zinc-100 dark:ring-zinc-900"
                                : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800",
                          )}
                        >
                          {st === "completed" ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <span className="text-[10px] font-mono font-bold">{i + 1}</span>
                          )}
                        </div>
                        {i < SIGNATURE_STEPS.length - 1 && (
                          <div
                            className={cn(
                              "w-px flex-1 my-1 min-h-[24px]",
                              st === "completed" ? "bg-emerald-500" : "bg-zinc-100 dark:bg-zinc-800",
                            )}
                          />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className={cn("text-xs font-bold mb-0.5", st === "pending" ? "text-zinc-400" : "text-zinc-900 dark:text-zinc-50")}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono tracking-tight">{step.role}</p>
                        {st === "current" && (
                          <div className="mt-2 flex items-center gap-2">
                             <div className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                             <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Awaiting Action</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
          <Button variant="ghost" onClick={onClose} className="rounded-xl h-12 px-6 text-xs font-bold uppercase tracking-widest">
             Dismiss
          </Button>
          <div className="flex items-center gap-4">
             {convention.status === "pending" && convention.signature_step === 1 && (
                <Button
                  onClick={() => onSign(convention.id)}
                  disabled={isSigning}
                  className="h-12 px-10 rounded-2xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl hover:opacity-90"
                >
                  {isSigning ? "Signing..." : "Execute Signature"}
                </Button>
             )}
             {convention.status === "completed" && (
                <Badge className="bg-emerald-500 text-white px-6 py-2 rounded-full font-bold uppercase text-[9px] tracking-widest">
                   Finalized & Verified
                </Badge>
             )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ──── Main Component ──────────────────────────────────────────────────────────
export default function ConventionStage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

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
      setSelected((prev: any) => (prev ? { ...prev, ...data } : null))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      )
      if (!response.ok) throw new Error("Failed to delete")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-conventions"] })
      setSelected(null)
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
    <div className="space-y-10 max-w-6xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 font-mono">
            UBMA · APPLICATIONS
          </p>
          <h1 className="text-5xl font-serif tracking-tight font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
            Internship Conventions
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Tracking of your PAdES electronic signatures and approval workflow.
          </p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm">
          <ShieldCheck size={18} className="text-zinc-400" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-50 block">
              PAdES Certificate
            </span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">LTV Version</span>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 px-4 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem] bg-zinc-50/30 dark:bg-zinc-950/20"
        >
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] text-zinc-200 dark:text-zinc-800 shadow-sm mb-8 ring-1 ring-zinc-100 dark:ring-zinc-800">
            <FileText size={64} className="opacity-20" />
          </div>
          <div className="space-y-3 max-w-sm">
            <h2 className="text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
              No active <span className="italic text-blue-600 dark:text-blue-400">agreements</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light leading-relaxed">
              When you apply for an internship, your official conventions will appear here for electronic signature.
            </p>
          </div>
          <Button variant="outline" className="mt-10 rounded-full h-12 px-8 text-[10px] font-bold uppercase tracking-[0.2em] border-zinc-200 dark:border-zinc-800 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all">
            Explore Opportunities
          </Button>
        </motion.div>
      ) : (
        <div className="overflow-x-auto border border-zinc-100 dark:border-zinc-900 rounded-2xl">
          <Table>
            <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/50">
              <TableRow className="border-zinc-100 dark:border-zinc-900 hover:bg-transparent">
                <TableHead className="pl-8 py-5 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Document
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Mission
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Progress
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Status
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Submitted
                </TableHead>
                <TableHead className="pr-8 text-right font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((conv) => {
                // compute progress inline for table
                const done = conv.status === 'completed' ? SIGNATURE_STEPS.length : (conv.signature_step - 1)
                const pct = Math.round((done / SIGNATURE_STEPS.length) * 100)

                return (
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
                      <div className="space-y-1 min-w-[120px]">
                        <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                          <span>{done}/{SIGNATURE_STEPS.length} steps</span>
                          <span>{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-1.5 bg-zinc-100 dark:bg-zinc-800" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest px-3 py-1 border rounded-full",
                          statusColor(conv.status),
                        )}
                      >
                        {conv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-zinc-500 font-medium">
                        {new Date(conv.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-xl transition-all"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelected(conv)
                        }}
                      >
                        <Eye size={14} /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Bottom sheet drawer */}
      <AnimatePresence>
      <ConventionDetailsModal
        isOpen={!!selected}
        convention={selected || {}}
        onClose={() => setSelected(null)}
        onSign={(id) => signMutation.mutate(id)}
        onDelete={(id) => deleteMutation.mutate(id)}
        isSigning={signMutation.isPending}
      />
      </AnimatePresence>
    </div>
  )
}
