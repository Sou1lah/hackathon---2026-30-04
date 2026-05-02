import {
  Activity,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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

import {
  SIGNATURE_STEPS,
  statusColor,
  FakePDF,
  WorkflowTracker,
} from "./SharedConventionView"

const API = import.meta.env.VITE_API_URL || ""
const token = () => localStorage.getItem("access_token")
const headers = () => ({ Authorization: `Bearer ${token()}` })

function ConventionView({
  convention,
  onClose,
  onSign,
  onDelete,
  isSigning,
}: {
  convention: any
  onClose: () => void
  onSign: (id: string) => void
  onDelete: (id: string) => void
  isSigning: boolean
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onClose} className="rounded-xl h-10 px-4 text-xs font-bold uppercase tracking-widest gap-2 text-emerald-600 hover:bg-emerald-50">
           <Layers className="size-4 rotate-180" /> Back to Agreements
        </Button>
        <div className="flex items-center gap-3">
           <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(convention.id)}
              className="h-10 px-4 rounded-xl border-emerald-100 dark:border-emerald-900 text-red-500 hover:bg-red-50"
            >
              <Trash2 size={16} className="mr-2" /> Delete Dossier
            </Button>
            {convention.status === "pending" && convention.signature_step === 1 && (
                <Button
                  onClick={() => onSign(convention.id)}
                  disabled={isSigning}
                  className="h-10 px-8 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 transition-all"
                >
                  {isSigning ? "Signing..." : "Execute Signature"}
                </Button>
             )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 bg-emerald-50/30 dark:bg-emerald-950/20 p-12 rounded-[3rem] border border-emerald-100 dark:border-emerald-900 shadow-inner">
           <FakePDF convention={convention} />
        </div>

        <div className="lg:col-span-4 space-y-10">
          <WorkflowTracker convention={convention} />

          <div className="p-8 rounded-[2.5rem] bg-emerald-900 text-white space-y-6 shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheck size={120} className="-mr-12 -mt-12" />
             </div>
             <div className="flex items-center gap-3 relative z-10">
                <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                   <ShieldCheck size={20} />
                </div>
                <div>
                   <h4 className="text-xs font-bold uppercase tracking-widest">Certification Details</h4>
                   <p className="text-[10px] text-emerald-300 font-mono">PAdES-LTV Compliant</p>
                </div>
             </div>
             <p className="text-[11px] text-emerald-100/70 leading-relaxed italic relative z-10">
                This document is secured with a university-issued digital certificate. 
                Any modification to the file after signature will invalidate the cryptographic seal.
             </p>
             <Button variant="outline" className="w-full h-11 rounded-xl border-white/20 hover:bg-white/10 hover:text-white text-[10px] font-bold uppercase tracking-widest relative z-10 transition-all">
                <Download size={14} className="mr-2" /> Download Source PDF
             </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function StaticConvention() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["my-conventions"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/v1/conventions/`, { headers: headers() })
      if (!res.ok) throw new Error("Failed to load")
      return res.json()
    }
  })

  const signMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/api/v1/conventions/${id}/sign`, {
        method: "POST",
        headers: headers()
      })
      if (!res.ok) throw new Error("Failed to sign")
      return res.json()
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["my-conventions"] })
      if (selected?.id === updated.id) setSelected(updated)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/api/v1/conventions/${id}`, {
        method: "DELETE",
        headers: headers()
      })
      if (!res.ok) throw new Error("Failed to delete")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-conventions"] })
      setSelected(null)
    }
  })

  const handleSign = (id: string) => signMutation.mutate(id)
  const handleDelete = (id: string) => {
    if (confirm("Delete this convention?")) {
      deleteMutation.mutate(id)
    }
  }

  const conventions = data?.data || []

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

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Clock className="animate-spin text-zinc-400" size={32} />
        </div>
      ) : conventions.length === 0 ? (
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
      <AnimatePresence mode="wait">
        {selected ? (
          <ConventionView
            key="details"
            convention={selected}
            onClose={() => setSelected(null)}
            onSign={handleSign}
            onDelete={handleDelete}
            isSigning={signMutation.isPending}
          />
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="overflow-x-auto border border-zinc-100 dark:border-zinc-900 rounded-[2rem] bg-white dark:bg-zinc-950 shadow-sm"
          >
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
                {conventions.map((conv: any) => {
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
                              REF: {conv.id.split("-")[0].toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                          {conv.internship_request?.mission_title || "Untitled Mission"}
                        </p>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">
                          {conv.internship_request?.company_name || "N/A"}
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
          </motion.div>
        )}
      </AnimatePresence>
    )}

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
