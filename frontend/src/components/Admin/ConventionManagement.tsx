import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Forward,
  GraduationCap,
  Mail,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Trash2,
  Trophy,
  User,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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

export function ConventionManagement() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConvention, setSelectedConvention] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-conventions"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/admin/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!response.ok) throw new Error("Failed to fetch")
      return response.json()
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/${id}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!response.ok) throw new Error("Failed to approve")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-conventions"] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/${id}/reject?reason=${reason}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!response.ok) throw new Error("Failed to reject")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-conventions"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!response.ok) throw new Error("Failed to delete")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-conventions"] })
    },
  })

  const filteredData = data?.data?.filter(
    (c: any) =>
      c.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = (conv: any) => {
    setSelectedConvention(conv)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif tracking-tight">
                Application Management
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Hierarchical approval pipeline and signature circuit.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Search by document or student..."
              className="pl-9 w-[320px] h-11 bg-background border-border/40 focus:ring-accent/20 transition-all rounded-xl shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 border-border/40 hover:bg-muted rounded-xl"
          >
            <Filter size={18} />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="w-[350px] font-mono text-[10px] uppercase tracking-widest py-6 px-8 text-muted-foreground">
                Document / Student
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Approval
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Submission
              </TableHead>
              <TableHead className="text-right px-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex items-center justify-center gap-3 text-muted-foreground font-medium">
                    <Clock className="animate-spin size-5 text-accent" />{" "}
                    Loading files...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="size-10 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">
                      No files found.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData?.map((conv: any) => (
                <TableRow
                  key={conv.id}
                  className="border-border/40 group hover:bg-muted/20 transition-colors"
                >
                  <TableCell className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-accent/10 group-hover:text-accent transition-all shadow-sm">
                        <FileText size={22} />
                      </div>
                      <div className="flex flex-col max-w-[200px] sm:max-w-[300px]">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-bold text-sm text-foreground tracking-tight truncate text-left">
                                {conv.document_name}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{conv.document_name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground font-medium truncate">
                            {conv.owner?.full_name || "Unknown Student"}
                          </span>
                          <span className="text-[10px] text-muted-foreground/40 font-mono shrink-0">
                            •
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest shrink-0">
                            ID: {conv.id.split("-")[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="px-3 py-1 font-mono text-[10px] border-accent/20 text-accent bg-accent/5 rounded-lg"
                    >
                      Level {conv.approval_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "px-3 py-1 font-mono text-[10px] uppercase tracking-widest rounded-lg",
                        conv.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : conv.status === "rejected"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20",
                      )}
                      variant="outline"
                    >
                      {conv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(conv.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(conv)}
                        className="h-9 px-3 rounded-xl border border-transparent hover:border-border/40 hover:bg-white dark:hover:bg-zinc-900 group/btn shadow-sm transition-all"
                      >
                        <ExternalLink
                          size={14}
                          className="mr-2 text-muted-foreground group-hover/btn:text-accent"
                        />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover/btn:text-foreground">
                          Details
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this application?",
                            )
                          ) {
                            deleteMutation.mutate(conv.id)
                          }
                        }}
                        className="h-9 w-9 rounded-xl border border-border/20 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive group-hover:border-border/40 transition-colors"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-white dark:bg-zinc-950 flex items-center justify-center text-accent shadow-sm ring-1 ring-border/40">
                <FileText size={28} />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-serif break-all pr-6">
                  {selectedConvention?.document_name}
                </DialogTitle>
                <DialogDescription className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Complete details of the approval file
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh]">
            <div className="p-8 pt-4 space-y-8">
              {/* Student Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <User size={18} />
                  <h3 className="text-xs font-bold uppercase tracking-widest">
                    Student Information
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-6 bg-muted/30 p-6 rounded-2xl border border-border/40">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Full Name
                    </p>
                    <p className="text-sm font-bold">
                      {selectedConvention?.owner?.full_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Email
                    </p>
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {selectedConvention?.owner?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Specialty
                    </p>
                    <div className="flex items-center gap-2">
                      <GraduationCap
                        size={12}
                        className="text-muted-foreground"
                      />
                      <p className="text-sm font-medium">
                        {selectedConvention?.owner?.specialty || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Average (GPA)
                    </p>
                    <div className="flex items-center gap-2">
                      <Trophy size={12} className="text-muted-foreground" />
                      <Badge variant="secondary" className="font-mono text-xs">
                        {selectedConvention?.owner?.gpa || "0.00"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Internship Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <Building2 size={18} />
                  <h3 className="text-xs font-bold uppercase tracking-widest">
                    Internship Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-6 bg-muted/30 p-6 rounded-2xl border border-border/40">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Company
                      </p>
                      <p className="text-sm font-bold">
                        {selectedConvention?.internship_request?.company_name ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Period
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-muted-foreground" />
                        <p className="text-xs font-medium">
                          {selectedConvention?.internship_request?.start_date
                            ? new Date(
                                selectedConvention.internship_request
                                  .start_date,
                              ).toLocaleDateString()
                            : "..."}
                          {" - "}
                          {selectedConvention?.internship_request?.end_date
                            ? new Date(
                                selectedConvention.internship_request.end_date,
                              ).toLocaleDateString()
                            : "..."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-border/40" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Mission
                    </p>
                    <p className="text-sm font-bold leading-tight break-words">
                      {selectedConvention?.internship_request?.mission_title ||
                        "Untitled"}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed italic break-words">
                      "
                      {selectedConvention?.internship_request
                        ?.mission_description || "No description provided."}
                      "
                    </p>
                  </div>
                </div>
              </div>

              {/* Workflow Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <Clock size={18} />
                  <h3 className="text-xs font-bold uppercase tracking-widest">
                    Workflow State
                  </h3>
                </div>
                <div className="flex items-center justify-between p-6 bg-zinc-900 text-zinc-100 rounded-2xl shadow-xl">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                      Approval Level
                    </p>
                    <p className="text-lg font-serif italic">
                      Level {selectedConvention?.approval_level}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-10 px-6 font-mono text-xs uppercase tracking-[0.2em] text-zinc-300",
                      selectedConvention?.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : selectedConvention?.status === "rejected"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-zinc-800 border-zinc-700 text-zinc-300",
                    )}
                  >
                    {selectedConvention?.status}
                  </Badge>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-3 pt-4 pb-8">
                <Button
                  className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20"
                  onClick={() => {
                    approveMutation.mutate(selectedConvention.id)
                    setIsDetailsOpen(false)
                  }}
                >
                  <CheckCircle2 className="mr-2 size-4" /> Approve file
                </Button>
                <Button
                  variant="destructive"
                  className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-destructive/20"
                  onClick={() => {
                    rejectMutation.mutate({
                      id: selectedConvention.id,
                      reason: "Non conforme",
                    })
                    setIsDetailsOpen(false)
                  }}
                >
                  <XCircle className="mr-2 size-4" /> Reject
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
