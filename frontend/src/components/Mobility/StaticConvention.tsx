import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCode,
  FileText,
  Layers,
  ShieldCheck,
  Trash2,
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

const MOCK_CONVENTIONS = [
  {
    id: "conv-8821-x9",
    document_name: "Convention_Stage_Sonatrach_2026.pdf",
    mission_title: "Cloud Infrastructure Optimization",
    status: "pending",
    signature_step: 1,
    approval_level: "N0",
    created_at: "2026-04-12T10:00:00Z",
    company_name: "Sonatrach",
  },
  {
    id: "conv-4420-p2",
    document_name: "Convention_Stage_Ooredoo_IT.pdf",
    mission_title: "Full-stack Developer (Intern)",
    status: "pending",
    signature_step: 4,
    approval_level: "N1",
    created_at: "2026-03-25T14:30:00Z",
    company_name: "Ooredoo Algeria",
  },
  {
    id: "conv-1192-z4",
    document_name: "Convention_Stage_Cevital_PFE.pdf",
    mission_title: "AI-Driven Logistics Forecasting",
    status: "completed",
    signature_step: 8,
    approval_level: "N3",
    created_at: "2026-02-10T09:15:00Z",
    company_name: "Cevital Group",
  },
]

function statusColor(status: string) {
  if (status === "completed")
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  if (status === "rejected") return "bg-red-500/10 text-red-600 border-red-500/20"
  return "bg-amber-500/10 text-amber-600 border-amber-500/20"
}

function ConventionDetailsModal({
  convention,
  isOpen,
  onClose,
  onSign,
  onDelete,
}: {
  convention: any
  isOpen: boolean
  onClose: () => void
  onSign: (id: string) => void
  onDelete: (id: string) => void
}) {
  const getStepStatus = (index: number) => {
    if (convention.status === "completed") return "completed"
    const current = (convention.signature_step || 1) - 1
    if (index < current) return "completed"
    if (index === current) return "current"
    return "pending"
  }

  const completedSteps = convention.status === "completed" 
    ? SIGNATURE_STEPS.length 
    : (convention.signature_step - 1)
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
                  REF: {convention.id?.split("-")[0].toUpperCase()} — SYSTEM CLEARANCE GRANTED
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(convention.id)}
              className="h-10 w-10 rounded-xl border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-red-50"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[70vh]">
          <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 relative group overflow-hidden">
             <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 space-y-4 text-center p-12">
                <FileText size={64} className="opacity-20" />
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">PDF Document Preview</p>
                <Button variant="outline" className="rounded-full h-8 text-[10px] font-bold uppercase tracking-widest border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <Download size={14} className="mr-2" /> Download Document
                </Button>
             </div>
             <div className="absolute inset-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl opacity-50" />
          </div>

          <ScrollArea className="w-full md:w-[380px] border-l border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
            <div className="p-8 space-y-10">
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
                      <div className="flex-1 pb-4">
                        <p className={cn("text-xs font-bold uppercase tracking-widest", st === "pending" ? "text-zinc-400" : "text-zinc-900 dark:text-zinc-50")}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-zinc-500">{step.role}</p>
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
              <Separator className="bg-zinc-100 dark:bg-zinc-900" />
              
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} className="text-zinc-400" /> Final Document
                </h3>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group hover:border-blue-500/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center text-red-500 shadow-sm border border-zinc-100 dark:border-zinc-800">
                      <FileCode size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold truncate max-w-[150px]">{convention.document_name}</p>
                      <p className="text-[9px] text-zinc-400 uppercase font-mono">Digitally Signed PDF</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="size-8 rounded-lg text-muted-foreground hover:text-primary">
                    <Download size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
          <Button variant="ghost" onClick={onClose} className="rounded-xl h-12 px-6 text-xs font-bold uppercase tracking-widest">
             Dismiss
          </Button>
          <div className="flex items-center gap-4">
             {convention.status === "pending" && convention.signature_step === 1 && (
                <Button
                  onClick={() => onSign(convention.id)}
                  className="h-12 px-10 rounded-2xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl hover:opacity-90"
                >
                  Execute Signature
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

export default function StaticConvention() {
  const [conventions, setConventions] = useState(MOCK_CONVENTIONS)
  const [selected, setSelected] = useState<any>(null)

  const handleSign = (id: string) => {
    setConventions(prev => prev.map(c => {
      if (c.id === id && c.signature_step < 8) {
        const nextStep = c.signature_step + 1
        const updated = { 
          ...c, 
          signature_step: nextStep,
          status: nextStep === 8 ? "completed" : "pending"
        }
        if (selected?.id === id) setSelected(updated)
        return updated
      }
      return c
    }))
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this convention?")) {
      setConventions(prev => prev.filter(c => c.id !== id))
      setSelected(null)
    }
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto p-8 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-10 gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 font-mono">
            UBMA · STUDENT PORTAL
          </p>
          <h1 className="text-5xl font-serif tracking-tight font-bold text-foreground leading-tight">
            Internship <span className="italic text-primary">Agreements</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg font-light leading-relaxed max-w-2xl">
            Track and manage your PAdES electronic signature workflow and institutional approvals.
          </p>
        </div>
        <div className="flex items-center gap-4 px-6 py-4 bg-muted/50 border border-border rounded-3xl shadow-sm backdrop-blur">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-50 block">
              PAdES Certified
            </span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">LTV Version 2.1</span>
          </div>
        </div>
      </div>

      {conventions.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 px-4 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem] bg-zinc-50/30 dark:bg-zinc-950/20"
        >
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] text-zinc-200 dark:text-zinc-800 shadow-sm mb-8 ring-1 ring-zinc-100 dark:ring-zinc-800">
            <FileText size={64} className="opacity-20" />
          </div>
          <div className="space-y-3 max-w-sm">
            <h2 className="text-3xl font-serif font-bold text-foreground">
              No active <span className="italic text-primary">agreements</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light leading-relaxed">
              When you apply for an internship, your official conventions will appear here for electronic signature.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="overflow-x-auto border border-zinc-100 dark:border-zinc-900 rounded-[2rem] bg-white dark:bg-zinc-950 shadow-sm">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <TableRow className="border-zinc-100 dark:border-zinc-900 hover:bg-transparent">
                <TableHead className="pl-10 py-8 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Document Reference
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Internship Mission
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Workflow Progress
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Status
                </TableHead>
                <TableHead className="pr-10 text-right font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conventions.map((conv) => {
                const done = conv.status === "completed" ? 8 : (conv.signature_step - 1)
                const pct = Math.round((done / 8) * 100)

                return (
                  <TableRow
                    key={conv.id}
                    className="border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer group"
                    onClick={() => setSelected(conv)}
                  >
                    <TableCell className="pl-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all border border-border">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {conv.document_name}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5">
                            REF: {conv.id.split("-")[1].toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                        {conv.mission_title}
                      </p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">
                        {conv.company_name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2 min-w-[160px]">
                        <div className="flex justify-between text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                          <span>{done}/8 Signature Steps</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-50">{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-widest px-4 py-1 border rounded-full",
                          statusColor(conv.status),
                        )}
                      >
                        {conv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-10 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 px-6 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelected(conv)
                        }}
                      >
                        <Eye size={14} className="mr-2" /> View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AnimatePresence>
        <ConventionDetailsModal
          isOpen={!!selected}
          convention={selected || {}}
          onClose={() => setSelected(null)}
          onSign={handleSign}
          onDelete={handleDelete}
        />
      </AnimatePresence>

      {/* Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {[
          { icon: ShieldCheck, title: "Secure PAdES", desc: "Every signature is legally binding and cryptographically verified." },
          { icon: Clock, title: "SLA Tracking", desc: "Automated alerts if approvals take longer than the institutional 48h limit." },
          { icon: AlertCircle, title: "Compliance", desc: "Aligned with national decree 2026/42 on student internships." },
        ].map((item, i) => (
          <div key={i} className="p-8 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="size-10 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center text-zinc-400 border border-zinc-100 dark:border-zinc-800">
              <item.icon size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm uppercase tracking-widest text-zinc-900 dark:text-zinc-50">{item.title}</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
