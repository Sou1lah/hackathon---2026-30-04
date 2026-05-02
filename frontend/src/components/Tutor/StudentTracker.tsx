import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TutorService } from "@/client"
import { Calendar, MessageSquare, Star, Loader2, Send, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { format } from "date-fns"

interface StudentTrackerProps {
  studentId: string
  studentName: string
}

export default function StudentTracker({ studentId, studentName }: StudentTrackerProps) {
  const [comment, setComment] = useState("")
  const [rating, setRating] = useState<number>(5)
  const [activeLogId, setActiveLogId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["student-logs", studentId],
    queryFn: () => TutorService.getStudentLogsApiV1TutorStudentStudentIdLogsGet({ studentId }),
  })

  const commentMutation = useMutation({
    mutationFn: (logId: string) => 
      TutorService.addLogCommentApiV1TutorLogLogIdCommentPost({ 
        logId, 
        requestBody: { comment, rating } 
      }),
    onSuccess: () => {
      toast.success("Comment added successfully")
      setComment("")
      setActiveLogId(null)
      queryClient.invalidateQueries({ queryKey: ["student-logs", studentId] })
    },
    onError: () => toast.error("Failed to add comment"),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Calendar className="text-primary" />
          {studentName}'s Activity Logs
        </h2>
        <Badge variant="outline" className="px-4 py-1.5 rounded-full font-mono text-[10px] tracking-widest uppercase bg-primary/5 border-primary/20 text-primary">
          {logsData?.count ?? 0} LOGS RECORDED
        </Badge>
      </div>

      <div className="space-y-6">
        {logsData?.data && logsData.data.length > 0 ? (
          logsData.data.map((log) => (
            <Card key={log.id} className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-8 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                      <Calendar size={16} />
                    </div>
                    <span className="text-sm font-bold text-zinc-500">
                      {format(new Date(log.date), "MMMM d, yyyy")}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{log.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 whitespace-pre-wrap">
                    {log.content}
                  </p>

                  {log.feedback && log.feedback.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                      <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                        <MessageSquare size={12} />
                        Your Feedback
                      </h4>
                      {log.feedback.map((f: any) => (
                        <div key={f.id} className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex gap-1">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={12} className={i < (f.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"} />
                               ))}
                             </div>
                             <span className="text-[10px] text-zinc-400 font-mono">
                               {format(new Date(f.created_at), "MMM d, HH:mm")}
                             </span>
                          </div>
                          <p className="text-sm font-medium text-foreground italic">"{f.comment}"</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeLogId === log.id ? (
                    <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button 
                              key={s} 
                              onClick={() => setRating(s)}
                              className="focus:outline-none transition-transform hover:scale-125"
                            >
                              <Star size={20} className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea 
                        placeholder="Type your comment here (e.g. 'Really good job today, very serious')..." 
                        className="bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl min-h-[100px] text-sm focus-visible:ring-primary/20"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button 
                          className="rounded-xl font-bold text-xs gap-2 px-6"
                          onClick={() => commentMutation.mutate(log.id)}
                          disabled={commentMutation.isPending || !comment.trim()}
                        >
                          {commentMutation.isPending ? <Loader2 className="animate-spin h-3 w-3" /> : <Send size={14} />}
                          Post Comment
                        </Button>
                        <Button variant="ghost" className="rounded-xl text-xs" onClick={() => setActiveLogId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="mt-6 rounded-xl text-xs font-bold gap-2 border-zinc-200 dark:border-zinc-800 hover:bg-primary hover:text-white hover:border-primary transition-all"
                      onClick={() => {
                        setActiveLogId(log.id)
                        setComment("")
                        setRating(5)
                      }}
                    >
                      <MessageSquare size={14} />
                      Add Comment
                    </Button>
                  )}
                </div>
                <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-900/50 p-6 flex flex-col justify-center border-l border-zinc-100 dark:border-zinc-800">
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Completion Status</span>
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-bold uppercase tracking-tight">Verified Entry</span>
                      </div>
                    </div>
                    {log.attachment_url && (
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Evidence Attachment</span>
                        <a href={log.attachment_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary underline underline-offset-4">
                          View Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-500">No logs found for this student.</p>
          </div>
        )}
      </div>
    </div>
  )
}
