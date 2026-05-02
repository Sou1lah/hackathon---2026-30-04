import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { MobilityService, MobilityType, MobilityFilePublic } from "@/client"
import {
  ArrowRight,
  Building2,
  Globe,
  Map as MapIcon,
  Loader2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import useCustomToast from "@/hooks/useCustomToast"

interface MobilityViewProps {
  type: "national" | "international"
}

const fadeInUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger: any = {
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ---------- Status badge helper ---------- */
function StatusBadge({ value }: { value: string }) {
  const colorMap: Record<string, string> = {
    // File transfer
    pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    requested: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
    transferred: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    // Visa
    in_progress: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
    approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    rejected: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",
    // Overall
    active: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
    completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  }
  const label = value.replace(/_/g, " ")
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[9px] font-bold uppercase tracking-widest px-3 py-1 capitalize",
        colorMap[value] || colorMap.pending,
      )}
    >
      {label}
    </Badge>
  )
}

/* ---------- Transfer animation ---------- */
const TransferAnimation = ({ type }: { type: "national" | "international" }) => {
  return (
    <div className="relative h-28 w-full flex items-center justify-between px-8 md:px-20">
      <div className="absolute inset-0 dot-pattern opacity-[0.06] dark:opacity-[0.12]" />

      {/* Origin node */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 flex flex-col items-center gap-2"
      >
        <div className="size-14 rounded-2xl bg-muted border border-border flex items-center justify-center shadow-sm">
          <Building2 size={24} className="text-foreground" />
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
          Origin
        </span>
      </motion.div>

      {/* Animated path */}
      <div className="flex-1 relative h-10 mx-6 flex items-center">
        {/* Outgoing dots (Primary color) */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`outgoing-${i}`}
            initial={{ left: "0%", opacity: 0 }}
            animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "linear" }}
            className="absolute top-1/2 -translate-y-1/2 size-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
          />
        ))}

        {/* Return dots (Slow Blue) */}
        {[0, 1].map((i) => (
          <motion.div
            key={`return-${i}`}
            initial={{ left: "100%", opacity: 0 }}
            animate={{ left: "0%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay: i * 3 + 1, ease: "linear" }}
            className="absolute top-1/2 -translate-y-1/2 size-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
          />
        ))}
        
        {/* Central line */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-border via-primary/20 to-border -translate-y-1/2" />
      </div>

      {/* Destination node */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex flex-col items-center gap-2"
      >
        <div className="size-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
          {type === "national" ? <Building2 size={24} /> : <Globe size={24} />}
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
          {type === "national" ? "Destination" : "International"}
        </span>
      </motion.div>
    </div>
  )
}

/* ---------- Main component ---------- */
export default function MobilityView({ type }: MobilityViewProps) {
  const isNational = type === "national"
  const backendType = isNational ? "nationale" : "internationale"
  const [selectedStudent, setSelectedStudent] = useState<MobilityFilePublic | null>(null)

  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const { data, isLoading } = useQuery({
    queryKey: ["mobility", backendType],
    queryFn: () => MobilityService.readMobilityFiles({ mobilityType: backendType as MobilityType }),
  })

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: any }) =>
      MobilityService.updateMobility({ id: variables.id, requestBody: variables.data }),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ["mobility", backendType] })
      setSelectedStudent(updatedData)
      showSuccessToast("The mobility record has been updated.")
    },
    onError: () => {
      showErrorToast("There was an error updating the record.")
    },
  })

  const content = isNational
    ? {
        badge: "Inter-University Mobility",
        desc: "Manage student exchanges between Algerian universities — track dossiers and file transfers across wilayas.",
      }
    : {
        badge: "International Programs",
        desc: "Manage international student mobility — track visa status, partner universities, and dossier transfers.",
      }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger as any}
      className="w-full space-y-10 py-8 px-6 md:px-10"
    >
      {/* ── Hero ── */}
      <motion.div variants={fadeInUp as any} className="flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-4">
          <Badge variant="outline" className="px-3 py-1 text-xs font-semibold border-primary/30 text-primary">
            {content.badge}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-[1.15] text-foreground">
            {isNational ? "National" : "Global"}{" "}
            <span className="text-primary">{isNational ? "Mobility" : "Horizons"}</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
            {content.desc}
          </p>
        </div>

        <div className="shrink-0 flex justify-center">
          <div className="size-28 md:size-36 bg-primary/5 dark:bg-primary/10 rounded-3xl border border-primary/15 flex items-center justify-center">
            {isNational ? (
              <MapIcon size={52} className="text-primary" />
            ) : (
              <Globe size={52} className="text-primary" />
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Transfer animation ── */}
      <motion.div variants={fadeInUp as any}>
        <TransferAnimation type={type} />
      </motion.div>

      {/* ── Student registry table ── */}
      <motion.div variants={fadeInUp as any} className="space-y-6">
        <div className="flex items-center gap-4 px-1">
          <h2 className="text-xl font-serif font-semibold text-foreground">Student Registry</h2>
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-mono text-muted-foreground">
            {data?.count ?? 0} records
          </span>
        </div>

        <div className="w-full rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 dark:bg-muted/20 hover:bg-muted/50 dark:hover:bg-muted/20 border-b border-border">
                <TableHead className="pl-6 font-mono text-[10px] uppercase tracking-widest py-4 text-muted-foreground">
                  Student
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {isNational ? "Origin → Destination" : "Destination"}
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {isNational ? "File Transfer" : "Visa Status"}
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-right font-mono text-[10px] uppercase tracking-widest pr-6 text-muted-foreground">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-muted-foreground" size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-sm">
                    No mobility records found.
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((student) => (
                <TableRow
                  key={student.id}
                  className="group hover:bg-muted/40 dark:hover:bg-muted/15 border-b border-border/60 transition-colors cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  {/* Student name + avatar */}
                  <TableCell className="pl-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border border-primary/20">
                        {student.student_name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {student.student_name}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                          {student.reference_code}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Destination */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col gap-0.5 max-w-[280px]">
                            {isNational && student.origin_university && (
                              <span className="truncate text-xs text-muted-foreground">
                                From: {student.origin_university}
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              <Building2 size={13} className="text-muted-foreground shrink-0" />
                              <span className="truncate text-sm text-foreground">
                                {student.destination}
                              </span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover text-popover-foreground border border-border shadow-lg">
                          {isNational && <p className="text-xs">Origin: {student.origin_university || "Not set"}</p>}
                          <p className="text-xs">Destination: {student.destination}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* Transfer / Visa status */}
                  <TableCell>
                    <StatusBadge
                      value={isNational ? (student.file_transfer_status || "pending") : (student.visa_status || "pending")}
                    />
                  </TableCell>

                  {/* Overall status */}
                  <TableCell>
                    <StatusBadge value={student.status || "pending"} />
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right pr-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <ArrowRight size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* ── Detail modal ── */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-[580px] border-border rounded-2xl p-0 overflow-hidden shadow-xl bg-card">
          {selectedStudent && (
            <>
              {/* Modal header */}
              <div className="bg-muted/60 dark:bg-muted/30 border-b border-border p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-serif text-foreground">
                    {selectedStudent.student_name}
                  </DialogTitle>
                  <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.2em] mt-1">
                    {selectedStudent.reference_code} • {selectedStudent.destination}
                  </p>
                </DialogHeader>
              </div>

              {/* Modal body */}
              <div className="p-8 space-y-6">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                  Tracking Details
                </h3>

                {isNational ? (
                  <div className="space-y-5">
                    {/* Origin university */}
                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Origin University / Wilaya</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {selectedStudent.origin_university || "Not set"}
                        </p>
                      </div>
                    </div>

                    {/* File transfer */}
                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border">
                      <div>
                        <p className="text-sm font-semibold text-foreground">File Transfer Status</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Track student dossier transfer</p>
                      </div>
                      <Select
                        value={selectedStudent.file_transfer_status || "pending"}
                        onValueChange={(val) =>
                          updateMutation.mutate({ id: selectedStudent.id, data: { file_transfer_status: val } })
                        }
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs bg-background border-border">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="requested">Requested</SelectItem>
                          <SelectItem value="transferred">Transferred</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Visa status */}
                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Visa Status</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Consular procedure status</p>
                      </div>
                      <Select
                        value={selectedStudent.visa_status || "pending"}
                        onValueChange={(val) =>
                          updateMutation.mutate({ id: selectedStudent.id, data: { visa_status: val } })
                        }
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs bg-background border-border">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Overall status */}
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Overall File Status</p>
                  </div>
                  <Select
                    value={selectedStudent.status || "pending"}
                    onValueChange={(val) =>
                      updateMutation.mutate({ id: selectedStudent.id, data: { status: val } })
                    }
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-background border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Close button */}
                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    onClick={() => setSelectedStudent(null)}
                    variant="outline"
                    className="rounded-full px-8"
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
