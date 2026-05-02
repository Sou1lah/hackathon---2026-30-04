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
import {
  statusColor,
  FakePDF,
  WorkflowTracker,
} from "../Mobility/SharedConventionView"
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

import { ConventionsService } from "@/client/sdk.gen"

export function ConventionManagement() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConvention, setSelectedConvention] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-conventions"],
    queryFn: () => ConventionsService.readAllConventionsAdmin({ limit: 100 }),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => ConventionsService.approveConventionEndpoint({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-conventions"] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ConventionsService.rejectConventionEndpoint({ id, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-conventions"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ConventionsService.deleteConventionEndpoint({ id }),
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
      <div className="rounded-[2.5rem] border border-border/50 overflow-hidden shadow-2xl bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="w-[350px] font-mono text-[11px] uppercase tracking-widest py-8 px-10 text-muted-foreground">
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
                  <TableCell className="py-8 px-10">
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-accent/10 group-hover:text-accent transition-all shadow-sm">
                        <FileText size={26} />
                      </div>
                      <div className="flex flex-col max-w-[200px] sm:max-w-[300px]">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-bold text-base text-foreground tracking-tight truncate text-left">
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
                  <TableCell className="text-right px-10">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(conv)}
                        className="h-11 px-5 rounded-xl border border-transparent hover:border-border/40 hover:bg-white dark:hover:bg-zinc-900 group/btn shadow-sm transition-all"
                      >
                        <ExternalLink
                          size={16}
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
                        className="h-11 w-11 rounded-xl border border-border/20 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive group-hover:border-border/40 transition-colors"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[1200px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-zinc-50 dark:bg-zinc-950">
          <div className="flex h-[85vh]">
            {/* Left: PDF Preview */}
            <div className="flex-1 overflow-y-auto p-12 bg-emerald-50/30 dark:bg-emerald-950/20 border-r border-emerald-100 dark:border-emerald-900">
               <FakePDF convention={selectedConvention} />
            </div>

            {/* Right: Sidebar Actions */}
            <div className="w-[400px] flex flex-col bg-white dark:bg-zinc-950">
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-900">
                 <h3 className="text-xl font-serif font-bold">Review Application</h3>
                 <p className="text-xs text-muted-foreground mt-1">Verification and approval pipeline</p>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-8 space-y-8">
                   <WorkflowTracker convention={selectedConvention} />
                   
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Student Info</h4>
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 space-y-2">
                         <p className="text-sm font-bold">{selectedConvention?.owner?.full_name}</p>
                         <p className="text-xs text-muted-foreground font-mono truncate">{selectedConvention?.owner?.email}</p>
                      </div>
                   </div>
                </div>
              </ScrollArea>

              <div className="p-8 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
                 <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-12 rounded-xl border-emerald-100 dark:border-emerald-900 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => setIsDetailsOpen(false)}
                    >
                      Keep Pending
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12 rounded-xl border-red-100 dark:border-red-900 text-red-500 hover:bg-red-50"
                      onClick={() => {
                        rejectMutation.mutate({ id: selectedConvention.id, reason: "Rejected by admin" })
                        setIsDetailsOpen(false)
                      }}
                    >
                      Reject
                    </Button>
                 </div>
                 <Button 
                   className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20"
                   onClick={() => {
                     approveMutation.mutate(selectedConvention.id)
                     setIsDetailsOpen(false)
                   }}
                 >
                    <CheckCircle2 className="mr-2 size-4" /> Approve & Advance Step
                 </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
