import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2,
  History,
  MessageSquare,
  Paperclip,
  Star,
  User as UserIcon,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { toast } from "sonner"
import { OpenAPI } from "@/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const fetchWithAuth = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("access_token")
  const response = await fetch(`${OpenAPI.BASE}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) throw new Error("API Error")
  return response.json()
}

interface UserDetailModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
}

export default function UserDetailModal({
  user,
  isOpen,
  onClose,
}: UserDetailModalProps) {
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState({
    log_id: "",
    comment: "",
    rating: 5,
  })
  const [activeLogId, setActiveLogId] = useState<string | null>(null)

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["admin-user-logs", user?.id],
    queryFn: () =>
      fetchWithAuth(`/api/v1/suivi-stage/admin/users/${user.id}/logs`),
    enabled: !!user?.id && isOpen,
  })

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["admin-user-internship", user?.id],
    queryFn: () =>
      fetchWithAuth(`/api/v1/suivi-stage/admin/users/${user.id}/internship-summary`),
    enabled: !!user?.id && isOpen,
  })

  const feedbackMutation = useMutation({
    mutationFn: (data: any) =>
      fetchWithAuth("/api/v1/suivi-stage/admin/feedback", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-logs", user?.id] })
      toast.success("Feedback saved successfully")
      setActiveLogId(null)
      setFeedback({ log_id: "", comment: "", rating: 5 })
    },
  })

  const handleAddFeedback = (logId: string) => {
    if (!feedback.comment) {
      toast.error("Please enter a comment")
      return
    }
    feedbackMutation.mutate({ ...feedback, log_id: logId })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto border-border/50 rounded-[2.5rem] p-0 shadow-2xl overflow-hidden">
        <div className="bg-foreground text-background p-10 relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-[0.05]" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-6">
              <div className="size-16 rounded-3xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                <UserIcon size={32} className="text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-serif text-white">
                  {user?.full_name || "Student Details"}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    {user?.email}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-10 space-y-10">
          {summaryData && !isLoadingSummary && !summaryData.detail && (
            <Card className="p-6 border-border/50 bg-muted/20">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Progress Overview</span>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-border/60">
                    {summaryData.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span>Step {summaryData.current_step} of 8</span>
                    <span>{summaryData.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-border/50 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${summaryData.progress}%` }} className="h-full bg-accent" />
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <History size={16} /> Log History
              </h3>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            {isLoading ? (
              <div className="p-20 text-center animate-pulse text-muted-foreground font-serif text-lg">
                Retrieving activities...
              </div>
            ) : logsData?.data?.length > 0 ? (
              <div className="space-y-6">
                {logsData.data.map((log: any) => (
                  <Card
                    key={log.id}
                    className="group hover:border-accent/30 transition-all duration-300 border-border/50 overflow-hidden"
                  >
                    <div className="p-8 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-muted/40 p-3 rounded-xl border border-border/40 font-mono text-center min-w-[60px]">
                            <span className="block text-xl font-bold leading-none">
                              {new Date(log.date).getDate()}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground">
                              {new Intl.DateTimeFormat("en-US", {
                                month: "short",
                              }).format(new Date(log.date))}
                            </span>
                          </div>
                          <h4 className="text-xl font-serif text-foreground group-hover:text-accent transition-colors">
                            {log.title}
                          </h4>
                        </div>
                        {log.attachment_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full gap-2 border-border/60"
                            asChild
                          >
                            <a
                              href={log.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Paperclip size={14} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                Document
                              </span>
                            </a>
                          </Button>
                        )}
                      </div>

                      <p className="text-muted-foreground leading-relaxed">
                        {log.content}
                      </p>

                      {log.feedback && log.feedback.length > 0 && (
                        <div className="mt-4 p-5 bg-accent/5 border border-accent/20 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle2 size={14} /> Pedagogical Feedback
                            </span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={cn(
                                    "transition-all",
                                    i < log.feedback[0].rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-border",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-foreground/90 italic border-l-2 border-accent/40 pl-3 py-1">
                            "{log.feedback[0].comment}"
                          </p>
                        </div>
                      )}

                      <div className="pt-6 border-t border-border/40">
                        <AnimatePresence mode="wait">
                          {activeLogId === log.id ? (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-6 bg-muted/20 p-6 rounded-2xl border border-accent/10"
                            >
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <MessageSquare size={12} /> Your pedagogical
                                    evaluation
                                  </Label>
                                  <Textarea
                                    className="rounded-2xl min-h-[100px] border-border/60 focus:ring-accent bg-background"
                                    placeholder="Share your advice or corrections..."
                                    value={feedback.comment}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) =>
                                      setFeedback({
                                        ...feedback,
                                        comment: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-6">
                                  <div className="flex items-center gap-3 bg-background px-4 py-2 rounded-full border border-border/60">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-2">
                                      Rating
                                    </span>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <Star
                                        key={i}
                                        size={18}
                                        className={cn(
                                          "cursor-pointer transition-all hover:scale-125",
                                          i <= feedback.rating
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-border",
                                        )}
                                        onClick={() =>
                                          setFeedback({
                                            ...feedback,
                                            rating: i,
                                          })
                                        }
                                      />
                                    ))}
                                  </div>
                                  <div className="flex gap-3">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="rounded-full text-[10px] font-bold uppercase tracking-widest"
                                      onClick={() => setActiveLogId(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="rounded-full px-8 bg-accent text-white shadow-lg shadow-accent/20 text-[10px] font-bold uppercase tracking-widest"
                                      onClick={() => handleAddFeedback(log.id)}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <Button
                              variant="ghost"
                              className="w-full justify-center gap-3 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:bg-accent/5 rounded-2xl transition-all"
                              onClick={() => setActiveLogId(log.id)}
                            >
                              <MessageSquare size={16} />
                              Enter pedagogical feedback
                            </Button>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-20 border-dashed border-2 border-border/50 bg-transparent text-center space-y-4 rounded-3xl">
                <div className="bg-muted w-fit p-4 rounded-full mx-auto">
                  <CheckCircle2 size={32} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-serif text-lg">
                  No activity log submitted yet.
                </p>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
