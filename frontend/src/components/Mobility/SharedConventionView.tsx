import {
  Activity,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Layers,
  ShieldCheck,
} from "lucide-react"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export const SIGNATURE_STEPS = [
  { label: "Student", role: "Signatory 1", level: "N0" },
  { label: "Academic Tutor", role: "Signatory 2", level: "N0" },
  { label: "Host Company", role: "Signatory 3", level: "N0" },
  { label: "Department Head", role: "Signatory 4", level: "N1" },
  { label: "Dean / Director", role: "Signatory 5", level: "N2" },
  { label: "Vice-Rectorate", role: "Signatory 6", level: "N3" },
  { label: "Rectorate (Final)", role: "Signatory 7", level: "N3" },
  { label: "PROGRES System", role: "Archiving", level: "N3" },
]

export function statusColor(status: string) {
  if (status === "completed")
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  if (status === "rejected") return "bg-red-500/10 text-red-600 border-red-500/20"
  return "bg-amber-500/10 text-amber-600 border-amber-500/20"
}

export function FakePDF({ convention }: { convention: any }) {
  return (
    <div className="w-full bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-sm p-16 min-h-[1100px] text-emerald-950 font-serif relative overflow-hidden border border-emerald-100/50 mx-auto max-w-[850px]">
      {/* Official Header */}
      <div className="flex justify-between items-start border-b-2 border-emerald-900 pb-10 mb-14">
        <div className="space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] font-sans text-emerald-800/80">People's Democratic Republic of Algeria</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] font-sans text-emerald-800/80">Ministry of Higher Education and Scientific Research</p>
          <p className="text-xs font-black uppercase tracking-[0.1em] font-sans mt-3 text-emerald-900">University of Badji Mokhtar - Annaba</p>
        </div>
        <div className="text-right">
          <div className="size-20 bg-emerald-900 rounded-xl flex items-center justify-center text-white font-sans font-black text-2xl mb-3 shadow-xl ring-8 ring-emerald-50/50">
            UBMA
          </div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600">REF: {convention.id?.split("-")[0].toUpperCase()}</p>
        </div>
      </div>

      {/* Title */}
      <div className="text-center space-y-6 mb-20">
        <div className="inline-block border-y-4 border-double border-emerald-900/20 py-4 px-12">
          <h2 className="text-4xl font-black uppercase tracking-tight">Internship Convention</h2>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] font-sans italic text-emerald-800/40">Professional Academic Training Agreement</p>
      </div>

      {/* Content */}
      <div className="space-y-12 text-[13px] leading-[1.8] text-justify px-4">
        <section className="space-y-5">
          <h3 className="font-bold border-l-4 border-emerald-900 pl-5 uppercase tracking-widest text-[11px] text-emerald-900">Article 1: The Parties</h3>
          <p>
            The present agreement is established to formalize the pedagogical relationship between <strong>University of Badji Mokhtar</strong>, 
            represented by the student <strong>{convention.internship_request?.student_name || "N/A"}</strong> (Reg: {convention.internship_request?.registration_number || "---"}), 
            and the hosting entity <strong>{convention.internship_request?.company_name || "N/A"}</strong>. Both parties commit to the pedagogical goals of the internship.
          </p>
        </section>

        <section className="space-y-5">
          <h3 className="font-bold border-l-4 border-emerald-900 pl-5 uppercase tracking-widest text-[11px] text-emerald-900">Article 2: Pedagogical Mission</h3>
          <p>
            The internship mission is officially designated as: <span className="italic font-bold text-emerald-900/80">"{convention.internship_request?.mission_title || "Untitled"}"</span>.
            The intern will be integrated into the professional environment to apply theoretical concepts and acquire industry-standard technical competencies.
          </p>
        </section>

        <section className="space-y-5">
          <h3 className="font-bold border-l-4 border-emerald-900 pl-5 uppercase tracking-widest text-[11px] text-emerald-900">Article 3: Logistics & Compliance</h3>
          <p>
            Scheduled from <strong>{convention.internship_request?.start_date || "TBD"}</strong> to <strong>{convention.internship_request?.end_date || "TBD"}</strong>. 
            The host organization guarantees compliance with national safety standards and provides the necessary resources for mission completion.
          </p>
        </section>

        <section className="mt-24 pt-24 border-t border-emerald-100/50">
          <div className="grid grid-cols-2 gap-16">
            <div className="space-y-10 h-44 border-2 border-emerald-100 border-dashed rounded-[2rem] p-8 flex flex-col justify-between bg-emerald-50/10 relative group transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/40">Digital Signature: Student</p>
              {convention.signature_step > 1 && (
                <div className="flex flex-col items-center animate-in zoom-in duration-500">
                   <div className="size-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <CheckCircle2 className="text-emerald-500 size-8" />
                   </div>
                   <p className="text-[8px] font-mono mt-3 uppercase tracking-[0.3em] text-emerald-600 font-bold">Secured & Verified</p>
                </div>
              )}
            </div>
            <div className="space-y-10 h-44 border-2 border-emerald-100 border-dashed rounded-[2rem] p-8 flex flex-col justify-between bg-emerald-50/10 relative transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/40">Institutional Seal: UBMA</p>
              {convention.status === "completed" && (
                <div className="size-28 rounded-full border-[6px] border-emerald-500/20 border-double flex items-center justify-center -rotate-12 opacity-90 self-center animate-in fade-in zoom-in duration-1000">
                   <div className="text-center">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">OFFICIALLY</p>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">CERTIFIED</p>
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-600/60 mt-1">UNIV-ANNABA</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none select-none">
        <p className="text-[140px] font-black text-emerald-50/30 uppercase tracking-[0.1em]">
          {convention.status === "completed" ? "OFFICIAL" : "DRAFT"}
        </p>
      </div>
    </div>
  )
}

export function WorkflowTracker({ convention }: { convention: any }) {
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
    <div className="p-10 rounded-[2.5rem] bg-white dark:bg-zinc-950 border border-emerald-100 dark:border-emerald-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2.5 text-emerald-900 dark:text-emerald-50">
            <Activity size={16} className="text-emerald-500 animate-pulse" /> Workflow State
          </h3>
          <Badge variant="outline" className={cn("rounded-full px-4 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors", statusColor(convention.status))}>
            {convention.status}
          </Badge>
        </div>
        <div className="space-y-3">
          <div className="h-3.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full overflow-hidden p-0.5 border border-emerald-100/50 dark:border-emerald-900/50 shadow-inner">
            <Progress value={progressValue} className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-1000 ease-in-out rounded-full" />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold">
            <span>{progressValue.toFixed(0)}% Completed</span>
            <span className="opacity-50">{completedSteps}/{SIGNATURE_STEPS.length} Steps</span>
          </div>
        </div>
      </div>

      <Separator className="bg-emerald-100/50 dark:bg-emerald-900/50" />

      <div className="space-y-7">
        {SIGNATURE_STEPS.map((step, i) => {
          const st = getStepStatus(i)
          return (
            <div key={i} className={cn("flex gap-5 transition-all duration-300 group", st === "pending" && "opacity-40")}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "size-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all duration-500 shadow-sm",
                    st === "completed"
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200"
                      : st === "current"
                        ? "bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-50 dark:ring-emerald-950 scale-110 shadow-emerald-200"
                        : "bg-white dark:bg-zinc-900 border-emerald-100 dark:border-emerald-800 text-emerald-200 dark:text-emerald-800",
                  )}
                >
                  {st === "completed" ? (
                    <CheckCircle2 size={14} strokeWidth={3} />
                  ) : (
                    <span className="text-[10px] font-mono font-bold tracking-tighter">{i + 1}</span>
                  )}
                </div>
                {i < SIGNATURE_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-[2px] flex-1 my-1.5 min-h-[24px] transition-colors duration-500",
                      st === "completed" ? "bg-emerald-500" : "bg-emerald-100 dark:bg-emerald-900/50",
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className={cn("text-xs font-black uppercase tracking-[0.15em] transition-colors", 
                  st === "current" ? "text-emerald-900 dark:text-white" : 
                  st === "completed" ? "text-emerald-700 dark:text-emerald-400" : 
                  "text-emerald-300 dark:text-emerald-800")}>
                  {step.label}
                </p>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-[10px] text-emerald-600/40 font-bold uppercase tracking-widest">{step.role}</p>
                   {st === "current" && (
                      <Badge variant="secondary" className="text-[8px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 py-0 h-4 border-none font-bold">ACTIVE</Badge>
                   )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
