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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-zinc-200 dark:border-zinc-800 rounded-[12px] p-0 shadow-2xl overflow-hidden bg-white dark:bg-zinc-950">
        <div className="p-[24px] border-b border-zinc-50 dark:border-zinc-800/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shrink-0">
            <UserIcon size={24} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[18px] font-semibold text-zinc-900 dark:text-zinc-50 truncate">
              {user?.full_name || "Student Details"}
            </h2>
            <p className="text-[12px] text-zinc-500 truncate">
              {user?.email} • {user?.role}
            </p>
          </div>
        </div>

        <div className="p-[24px] space-y-[24px]">
          {summaryData && !isLoadingSummary && !summaryData.detail && (
            <div className="space-y-[12px]">
               <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-zinc-400">Progress Overview</span>
                <Badge variant="outline" className="text-[9px] uppercase font-mono border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400">
                  {summaryData.status}
                </Badge>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-[16px] rounded-xl space-y-3">
                 <div className="flex justify-between text-[11px] font-medium text-zinc-500">
                    <span>Step {summaryData.current_step} of 8</span>
                    <span>{summaryData.progress}% Complete</span>
                 </div>
                 <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${summaryData.progress}%` }} className="h-full bg-indigo-600" />
                 </div>
              </div>
            </div>
          )}

          <div className="space-y-[12px]">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.06em] text-zinc-400 flex items-center gap-2">
              <History size={14} /> Activity Log
            </h3>

            {isLoading ? (
              <div className="p-10 text-center text-zinc-400 text-[13px]">
                Retrieving activities...
              </div>
            ) : logsData?.data?.length > 0 ? (
              <div className="space-y-[12px]">
                {logsData.data.map((log: any) => (
                  <Card key={log.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-none overflow-hidden">
                    <div className="p-[16px] flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex flex-col items-center justify-center border border-zinc-100 dark:border-zinc-800 shrink-0">
                        <span className="text-[12px] font-bold text-indigo-600 dark:text-indigo-400">{new Date(log.date).getDate()}</span>
                        <span className="text-[8px] uppercase font-bold text-zinc-400">
                          {new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(log.date)).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">{log.title}</h4>
                          {log.attachment_url && (
                            <a href={log.attachment_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700">
                              <Paperclip size={14} />
                            </a>
                          )}
                        </div>
                        <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{log.content}</p>
                        
                        {log.feedback && log.feedback.length > 0 && (
                          <div className="mt-3 p-3 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 rounded-lg space-y-1">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                  <CheckCircle2 size={12} /> Pedagogical Feedback
                                </span>
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} className={cn(i < log.feedback[0].rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800")} />
                                  ))}
                                </div>
                             </div>
                             <p className="text-[12px] text-zinc-700 dark:text-zinc-300 italic">"{log.feedback[0].comment}"</p>
                          </div>
                        )}

                        <div className="pt-2">
                          <AnimatePresence mode="wait">
                            {activeLogId === log.id ? (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pt-2">
                                <Textarea
                                  className="text-[13px] rounded-lg border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500 bg-white dark:bg-zinc-950"
                                  placeholder="Share your advice or corrections..."
                                  value={feedback.comment}
                                  onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                                />
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((i) => (
                                        <Star
                                          key={i}
                                          size={16}
                                          className={cn("cursor-pointer transition-all", i <= feedback.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800")}
                                          onClick={() => setFeedback({ ...feedback, rating: i })}
                                        />
                                      ))}
                                   </div>
                                   <div className="flex gap-2">
                                      <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-widest" onClick={() => setActiveLogId(null)}>Cancel</Button>
                                      <Button size="sm" className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold uppercase tracking-widest" onClick={() => handleAddFeedback(log.id)}>Save</Button>
                                   </div>
                                </div>
                              </motion.div>
                            ) : (
                              <Button variant="ghost" className="w-full h-8 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg justify-center gap-2" onClick={() => setActiveLogId(log.id)}>
                                <MessageSquare size={14} /> Add feedback
                              </Button>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-10 border-dashed border border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                <p className="text-zinc-400 text-[13px]">No activity log submitted yet.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
