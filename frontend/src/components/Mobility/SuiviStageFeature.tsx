import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2,
  Clock,
  FileText,
  History,
  Layout,
  MessageSquare,
  Paperclip,
  Plus,
  Star,
  TrendingUp,
  User as UserIcon,
} from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { toast } from "sonner"
import { OpenAPI } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

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

// Custom Fetch Wrapper
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

export default function SuiviStageFeature() {
  const queryClient = useQueryClient()
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [newLog, setNewLog] = useState({
    title: "",
    content: "",
    attachment_url: "",
  })

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["suivi-logs"],
    queryFn: () => fetchWithAuth("/api/v1/suivi-stage/my-internship/logs"),
  })

  const { data: feedbacks } = useQuery({
    queryKey: ["suivi-feedback"],
    queryFn: () => fetchWithAuth("/api/v1/suivi-stage/my-internship/feedback"),
  })

  const createLogMutation = useMutation({
    mutationFn: (data: any) =>
      fetchWithAuth("/api/v1/suivi-stage/my-internship/logs", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suivi-logs"] })
      toast.success("Logbook updated")
      setIsLogOpen(false)
      setNewLog({ title: "", content: "", attachment_url: "" })
    },
    onError: () => toast.error("Error creating log entry"),
  })

  const handleCreateLog = () => {
    if (!newLog.title || !newLog.content) {
      toast.error("Please fill in all fields")
      return
    }
    createLogMutation.mutate({
      ...newLog,
      internship_id: "00000000-0000-0000-0000-000000000000",
    })
  }

  const getFeedbackForLog = (logId: string) => {
    return feedbacks?.find((f: any) => f.log_id === logId)
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger as any}
      className="container max-w-[1400px] py-20 space-y-24"
    >
      {/* Header Section */}
      <motion.div
        variants={fadeInUp as any}
        className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto"
      >
        <div className="space-y-6">
          <Badge variant="section" className="px-6 py-2 text-[12px] rounded-full mx-auto">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse mr-3" />
            Operational Tracking System
          </Badge>
          <h1 className="text-7xl md:text-8xl font-serif tracking-tight text-foreground leading-tight">
            Internship <span className="gradient-text">Logbook</span>
          </h1>
          <p className="text-muted-foreground text-2xl leading-relaxed max-w-3xl">
            Record your daily professional milestones and maintain high-fidelity communication with your academic mentorship team.
          </p>
        </div>

        <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="h-20 rounded-full px-12 gap-4 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xl transition-all hover:scale-105 active:scale-95 border-8 border-white dark:border-zinc-950"
            >
              <Plus size={28} />
              <span className="font-bold uppercase tracking-[0.2em] text-[12px]">
                Create New Activity Log
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-border/50 rounded-3xl overflow-hidden p-0">
            <div className="bg-foreground text-background p-8 relative overflow-hidden">
              <div className="absolute inset-0 dot-pattern opacity-[0.05]" />
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-2xl font-serif text-white">
                  Record an activity
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="space-y-6 p-8">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Mission Title
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Data flow analysis"
                  className="rounded-xl border-border focus:ring-accent"
                  value={newLog.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewLog({ ...newLog, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="content"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Detailed Description
                </Label>
                <Textarea
                  id="content"
                  placeholder="What did you accomplish today?"
                  className="rounded-xl min-h-[120px] border-border focus:ring-accent"
                  value={newLog.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewLog({ ...newLog, content: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="attachment"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Document Link (Optional)
                </Label>
                <div className="relative">
                  <Input
                    id="attachment"
                    placeholder="https://docs.google.com/..."
                    className="rounded-xl pl-10 border-border"
                    value={newLog.attachment_url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewLog({ ...newLog, attachment_url: e.target.value })
                    }
                  />
                  <Paperclip
                    className="absolute left-3 top-2.5 text-muted-foreground"
                    size={16}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="p-8 pt-0">
              <Button
                className="w-full rounded-xl py-6 font-bold uppercase tracking-widest text-[10px] bg-accent hover:bg-accent/90"
                onClick={handleCreateLog}
                disabled={createLogMutation.isPending}
              >
                {createLogMutation.isPending
                  ? "Processing..."
                  : "Confirm Entry"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Quick Look */}
      <motion.div
        variants={fadeInUp as any}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <Card className="p-10 border-border/50 bg-white dark:bg-zinc-950 shadow-sm rounded-[2rem]">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-accent/10 rounded-2xl text-accent">
              <History size={28} />
            </div>
            <div>
              <p className="text-[12px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                Logged Activities
              </p>
              <p className="text-5xl font-serif text-foreground">
                {logsData?.count || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-10 border-border/50 bg-white dark:bg-zinc-950 shadow-sm rounded-[2rem]">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-[12px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                Mentorship Feedback
              </p>
              <p className="text-5xl font-serif text-foreground">
                {feedbacks?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-10 border-foreground text-background bg-foreground relative overflow-hidden rounded-[2rem] shadow-2xl">
          <div className="absolute inset-0 dot-pattern opacity-[0.05]" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-5 bg-white/10 rounded-2xl text-white">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-[12px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                Internship Phase
              </p>
              <p className="text-4xl font-serif text-white italic">Ongoing</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Timeline Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-8 mb-12">
            <h3 className="text-[14px] font-mono font-black uppercase tracking-[0.4em] text-muted-foreground">
              Activity History
            </h3>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="space-y-6">
            {logsLoading ? (
              [1, 2, 3].map((i) => (
                <Card key={i} className="h-32 animate-pulse border-border/40" />
              ))
            ) : logsData?.data?.length > 0 ? (
              logsData.data.map((log: any) => {
                const fb = getFeedbackForLog(log.id)
                return (
                  <motion.div key={log.id} variants={fadeInUp as any}>
                    <Card className="group hover:border-accent/30 transition-all duration-500 border-border/50 overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-950 shadow-sm hover:shadow-2xl">
                      <div className="flex flex-col md:flex-row min-h-[280px]">
                        <div className="md:w-48 bg-zinc-50 dark:bg-zinc-900/50 p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-900">
                          <span className="text-6xl font-serif text-foreground group-hover:scale-110 transition-transform">
                            {new Date(log.date).getDate()}
                          </span>
                          <span className="text-[14px] font-mono uppercase font-black tracking-widest text-muted-foreground mt-2">
                            {new Intl.DateTimeFormat("en-US", {
                              month: "long",
                            }).format(new Date(log.date))}
                          </span>
                        </div>
                        <div className="flex-1 p-12 space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-serif text-foreground group-hover:text-accent transition-colors leading-tight">
                              {log.title}
                            </h3>
                            {log.attachment_url && (
                              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl" asChild>
                                <a
                                  href={log.attachment_url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Paperclip
                                    size={20}
                                    className="text-muted-foreground hover:text-accent"
                                  />
                                </a>
                              </Button>
                            )}
                          </div>
                          <p className="text-lg text-muted-foreground leading-relaxed">
                            {log.content}
                          </p>

                          {fb && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="mt-6 p-6 rounded-2xl bg-foreground text-background relative overflow-hidden shadow-2xl"
                            >
                              <div className="absolute inset-0 dot-pattern opacity-[0.03]" />
                              <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare
                                      size={14}
                                      className="text-accent-secondary"
                                    />
                                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                      Tutor Feedback
                                    </span>
                                  </div>
                                  {fb.rating && (
                                    <div className="flex gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={10}
                                          className={cn(
                                            i < fb.rating
                                              ? "fill-amber-400 text-amber-400"
                                              : "text-zinc-800",
                                          )}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm font-medium italic text-zinc-100">
                                  "{fb.comment}"
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })
            ) : (
              <Card className="p-20 border-dashed border-2 border-border/50 bg-transparent text-center space-y-4">
                <div className="bg-muted w-fit p-4 rounded-full mx-auto">
                  <Layout size={32} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-serif text-lg">
                  No activity history available.
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-border/50 overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/40">
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CheckCircle2 size={14} /> Internship Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  Host Organization
                </p>
                <p className="text-lg font-serif">Academic Team</p>
              </div>
              <div className="pt-6 border-t border-border/40 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-accent/5 border border-accent/10">
                  <UserIcon size={18} className="text-accent" />
                  <div>
                    <p className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest">
                      Assigned Tutor
                    </p>
                    <p className="text-sm font-bold">National Manager</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent text-white border-none p-12 space-y-8 shadow-2xl shadow-accent/30 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern opacity-[0.1]" />
            <div className="relative z-10 space-y-6">
              <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <FileText size={36} className="text-white" />
              </div>
              <h3 className="text-3xl font-serif leading-tight">Internship Final Report</h3>
              <p className="text-white/80 text-base leading-relaxed">
                Upon completion of your tenure, you are required to formalize your learnings into a comprehensive final report for academic validation.
              </p>
              <Button
                variant="secondary"
                className="w-full h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] bg-white text-accent hover:bg-white/95 shadow-xl transition-all"
              >
                Submission Portal Opening Soon
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
