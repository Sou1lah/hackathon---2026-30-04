import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Globe,
  Layers,
  Link,
  Map as MapIcon,
  Plane,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface MobilityViewProps {
  type: "nationale" | "internationale"
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

// Animation component for "Dots Transferring"
const TransferAnimation = ({
  type,
}: {
  type: "nationale" | "internationale"
}) => {
  return (
    <div className="relative h-32 w-full flex items-center justify-between px-12 md:px-24 mb-12">
      <div className="absolute inset-0 dot-pattern opacity-10" />

      {/* Start Node */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 flex flex-col items-center gap-2"
      >
        <div className="size-16 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-xl border border-white/10">
          <Building2 size={28} />
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
          Origin Univ.
        </span>
      </motion.div>

      {/* Path & Moving Dots */}
      <div className="flex-1 relative h-px bg-gradient-to-r from-border/10 via-accent/40 to-border/10 mx-6">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ left: "0%", opacity: 0 }}
            animate={{
              left: "100%",
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "linear",
            }}
            className="absolute -top-1 size-2 rounded-full bg-accent shadow-[0_0_10px_rgba(var(--accent),0.5)]"
          />
        ))}
      </div>

      {/* End Node */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex flex-col items-center gap-2"
      >
        <div className="size-16 rounded-2xl bg-accent text-white flex items-center justify-center shadow-2xl shadow-accent/20">
          {type === "nationale" ? <Building2 size={28} /> : <Globe size={28} />}
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent">
          {type === "nationale" ? "Host Univ." : "International"}
        </span>
      </motion.div>
    </div>
  )
}

export default function MobilityView({ type }: MobilityViewProps) {
  const isNational = type === "nationale"
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  const content = isNational
    ? {
        badge: "Inter-University Mobility",
        title: "National Track",
        desc: "Optimize your academic career by taking advantage of exchanges between the best universities in Algeria.",
        steps: [
          {
            id: "01",
            title: "Dossier",
            icon: FileText,
            detail:
              "Preparation of the application file (Transcripts, CV, ML).",
          },
          {
            id: "02",
            title: "Process N1→N2",
            icon: Layers,
            detail: "Department validation then External Relations.",
          },
          {
            id: "03",
            title: "Convention",
            icon: Link,
            detail: "Tripartite agreement for study mobility.",
          },
          {
            id: "04",
            title: "Scholarship",
            icon: CreditCard,
            detail: "Financial aid and excellence scholarships.",
          },
        ],
      }
    : {
        badge: "International Programs",
        title: "Global Reach",
        desc: "Explore new academic horizons through our strategic partnerships around the world.",
        steps: [
          {
            id: "01",
            title: "Erasmus+ / Bilateral",
            icon: Sparkles,
            detail: "European exchanges and global agreements.",
          },
          {
            id: "02",
            title: "Process N3",
            icon: CheckCircle2,
            detail: "Rectorate validation and partner approval.",
          },
          {
            id: "03",
            title: "Visa & Travel",
            icon: Plane,
            detail: "Consular procedures and logistics.",
          },
          {
            id: "04",
            title: "Insurance & Health",
            icon: ShieldCheck,
            detail: "Mandatory international health coverage.",
          },
        ],
      }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger as any}
      className="container max-w-6xl py-12 space-y-16"
    >
      {/* Hero Section */}
      <motion.div
        variants={fadeInUp as any}
        className="flex flex-col md:flex-row items-center gap-12"
      >
        <div className="flex-1 space-y-6 text-center md:text-left">
          <Badge variant="section" className="px-4 py-1.5">
            {content.badge}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight leading-[1.1]">
            {isNational ? "National" : "Global"}{" "}
            <span className="gradient-text">
              {isNational ? "Mobility" : "Horizons"}
            </span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl leading-relaxed">
            {content.desc}
          </p>
        </div>

        <div className="md:w-1/3 flex justify-center">
          <div className="size-32 md:size-48 bg-accent/5 rounded-[2.5rem] border border-accent/10 flex items-center justify-center relative">
            <div className="absolute inset-0 dot-pattern opacity-20" />
            {isNational ? (
              <MapIcon size={64} className="text-accent" />
            ) : (
              <Globe size={64} className="text-accent" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Transfer Animation */}
      <motion.div variants={fadeInUp as any}>
        <TransferAnimation type={type} />
      </motion.div>

      {/* Student Registry */}
      <motion.div variants={fadeInUp as any} className="space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-serif">Student Registry</h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="pl-8 font-mono text-[10px] uppercase tracking-widest py-6">
                  Student
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">
                  Destination
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">
                  Dossier Status
                </TableHead>
                <TableHead className="text-right font-mono text-[10px] uppercase tracking-widest pr-8">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_STUDENTS.filter((s) => s.type === type).map((student) => (
                <TableRow
                  key={student.id}
                  className="group hover:bg-muted/10 border-border/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <TableCell className="pl-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-serif font-bold border border-accent/20">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {student.name}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                          {student.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground truncate max-w-[250px]">
                            <Building2
                              size={14}
                              className="text-accent/60 shrink-0"
                            />
                            <span className="truncate">
                              {student.destination}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{student.destination}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-3 py-1",
                        student.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20",
                      )}
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl hover:text-accent"
                    >
                      <ArrowRight size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Student Details Modal */}
      <Dialog
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
      >
        <DialogContent className="sm:max-w-[600px] border-border/50 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          {selectedStudent && (
            <>
              <div className="bg-foreground text-background p-10 relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-[0.05]" />
                <DialogHeader className="relative z-10">
                  <DialogTitle className="text-3xl font-serif text-white">
                    {selectedStudent.name}
                  </DialogTitle>
                  <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.2em] mt-2">
                    Dossier #{selectedStudent.id} •{" "}
                    {selectedStudent.destination}
                  </p>
                </DialogHeader>
              </div>
              <div className="p-10 space-y-8">
                <div className="grid grid-cols-1 gap-4">
                  {selectedStudent.requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-5 bg-muted/30 rounded-2xl border border-border/40 group hover:border-accent/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "size-10 rounded-xl flex items-center justify-center",
                            req.status === "Valid"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600",
                          )}
                        >
                          {req.status === "Valid" ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <Sparkles size={20} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {req.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                            {req.status}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-[10px] font-bold uppercase tracking-widest text-accent"
                      >
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border/40 flex justify-end">
                  <Button
                    onClick={() => setSelectedStudent(null)}
                    className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

const MOCK_STUDENTS = [
  {
    id: "ST-001",
    name: "Amine Kerroum",
    destination: "Univ. Science Tech (USTHB)",
    type: "nationale",
    status: "Completed",
    requirements: [
      { label: "Academic Dossier", status: "Valid" },
      { label: "Signed Convention", status: "Valid" },
      { label: "Scholarship Certificate", status: "Valid" },
    ],
  },
  {
    id: "ST-002",
    name: "Sofia Red",
    destination: "Sorbonne University, FR",
    type: "internationale",
    status: "Pending",
    requirements: [
      { label: "Erasmus+ Dossier", status: "Valid" },
      { label: "Consular Visa", status: "Pending" },
      { label: "Health Insurance", status: "Pending" },
      { label: "Mobility Contract", status: "Valid" },
    ],
  },
  {
    id: "ST-003",
    name: "Malik Sahli",
    destination: "Ecole Polytechnique (ENP)",
    type: "nationale",
    status: "Pending",
    requirements: [
      { label: "Academic Dossier", status: "Valid" },
      { label: "Signed Convention", status: "Pending" },
      { label: "Registration Form", status: "Valid" },
    ],
  },
  {
    id: "ST-004",
    name: "Kenzy Ben",
    destination: "MIT, USA",
    type: "internationale",
    status: "Completed",
    requirements: [
      { label: "Visa F-1", status: "Valid" },
      { label: "Health Insurance", status: "Valid" },
      { label: "Invitation Letter", status: "Valid" },
      { label: "Fulbright Scholarship", status: "Valid" },
    ],
  },
]
