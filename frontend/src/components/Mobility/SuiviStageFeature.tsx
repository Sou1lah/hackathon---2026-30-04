import {
  CheckCircle2,
  FileText,
  History,
  Layout,
  Plus,
  Star,
  User as UserIcon,
  MessageSquare,
  Paperclip,
  Clock,
  TrendingUp,
} from "lucide-react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "motion/react"
import { OpenAPI } from "@/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
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
  const [newLog, setNewLog] = useState({ title: "", content: "", attachment_url: "" })

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
      toast.success("Journal de bord mis à jour")
      setIsLogOpen(false)
      setNewLog({ title: "", content: "", attachment_url: "" })
    },
    onError: () => toast.error("Erreur lors de la création du log"),
  })

  const handleCreateLog = () => {
    if (!newLog.title || !newLog.content) {
      toast.error("Veuillez remplir tous les champs")
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
      className="container max-w-6xl py-12 space-y-12"
    >
      {/* Header Section */}
      <motion.div variants={fadeInUp as any} className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge variant="section" className="px-4 py-1.5 text-[10px]">
            <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse mr-2" />
            Suivi Opérationnel
          </Badge>
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-foreground leading-[1.1]">
            Journal de <span className="gradient-text">Stage</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl leading-relaxed">
            Consignez vos activités quotidiennes et maintenez une communication fluide avec votre tuteur pédagogique.
          </p>
        </div>
        
        <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full px-8 gap-3 bg-accent hover:bg-accent/90 text-white shadow-xl shadow-accent/20 transition-all hover:scale-105 active:scale-95">
              <Plus size={20} />
              <span className="font-bold uppercase tracking-widest text-[10px]">Nouvelle Activité</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-border/50 rounded-3xl overflow-hidden p-0">
            <div className="bg-foreground text-background p-8 relative overflow-hidden">
               <div className="absolute inset-0 dot-pattern opacity-[0.05]" />
               <DialogHeader className="relative z-10">
                 <DialogTitle className="text-2xl font-serif text-white">Consigner une activité</DialogTitle>
               </DialogHeader>
            </div>
            <div className="space-y-6 p-8">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Titre de la mission</Label>
                <Input
                  id="title"
                  placeholder="Ex: Analyse des flux de données"
                  className="rounded-xl border-border focus:ring-accent"
                  value={newLog.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLog({ ...newLog, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description détaillée</Label>
                <Textarea
                  id="content"
                  placeholder="Qu'avez-vous accompli aujourd'hui ?"
                  className="rounded-xl min-h-[120px] border-border focus:ring-accent"
                  value={newLog.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewLog({ ...newLog, content: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attachment" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lien Documentaire (Optionnel)</Label>
                <div className="relative">
                  <Input
                    id="attachment"
                    placeholder="https://docs.google.com/..."
                    className="rounded-xl pl-10 border-border"
                    value={newLog.attachment_url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLog({ ...newLog, attachment_url: e.target.value })}
                  />
                  <Paperclip className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                </div>
              </div>
            </div>
            <DialogFooter className="p-8 pt-0">
              <Button
                className="w-full rounded-xl py-6 font-bold uppercase tracking-widest text-[10px] bg-accent hover:bg-accent/90"
                onClick={handleCreateLog}
                disabled={createLogMutation.isPending}
              >
                {createLogMutation.isPending ? "Traitement..." : "Confirmer l'entrée"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Quick Look */}
      <motion.div variants={fadeInUp as any} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-border/50 bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent">
              <History size={20} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Activités</p>
              <p className="text-2xl font-serif text-foreground">{logsData?.count || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 border-border/50 bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Feedback</p>
              <p className="text-2xl font-serif text-foreground">{feedbacks?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 border-foreground text-background bg-foreground relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-[0.03]" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl text-white">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Progression</p>
              <p className="text-2xl font-serif text-white">En cours</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Timeline Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Chronologie des activités</h3>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <div className="space-y-6">
            {logsLoading ? (
              [1, 2, 3].map((i) => <Card key={i} className="h-32 animate-pulse border-border/40" />)
            ) : logsData?.data?.length > 0 ? (
              logsData.data.map((log: any) => {
                const fb = getFeedbackForLog(log.id)
                return (
                  <motion.div key={log.id} variants={fadeInUp as any}>
                    <Card className="group hover:border-accent/30 transition-all duration-300 border-border/50 overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-32 bg-muted/30 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/40">
                          <span className="text-3xl font-serif text-foreground">{new Date(log.date).getDate()}</span>
                          <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
                            {new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(new Date(log.date))}
                          </span>
                        </div>
                        <div className="flex-1 p-6 md:p-8 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-serif text-foreground group-hover:text-accent transition-colors">{log.title}</h3>
                            {log.attachment_url && (
                              <Button variant="ghost" size="icon-sm" asChild>
                                <a href={log.attachment_url} target="_blank" rel="noreferrer">
                                  <Paperclip size={16} className="text-muted-foreground hover:text-accent" />
                                </a>
                              </Button>
                            )}
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
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
                                    <MessageSquare size={14} className="text-accent-secondary" />
                                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Retour Tuteur</span>
                                  </div>
                                  {fb.rating && (
                                    <div className="flex gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} className={cn(i < fb.rating ? "fill-amber-400 text-amber-400" : "text-zinc-800")} />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm font-medium italic text-zinc-100">"{fb.comment}"</p>
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
                <p className="text-muted-foreground font-serif text-lg">Aucun historique d'activité disponible.</p>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-border/50 overflow-hidden shadow-sm">
             <CardHeader className="bg-muted/30 border-b border-border/40">
               <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <CheckCircle2 size={14} /> Information Stage
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
               <div className="space-y-1">
                 <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Structure d'accueil</p>
                 <p className="text-lg font-serif">Equipe Pédagogique</p>
               </div>
               <div className="pt-6 border-t border-border/40 space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-accent/5 border border-accent/10">
                    <UserIcon size={18} className="text-accent" />
                    <div>
                      <p className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest">Tuteur Assigné</p>
                      <p className="text-sm font-bold">Responsable National</p>
                    </div>
                  </div>
               </div>
             </CardContent>
           </Card>

           <Card className="bg-accent text-white border-none p-8 space-y-6 shadow-2xl shadow-accent/20 relative overflow-hidden">
             <div className="absolute inset-0 dot-pattern opacity-[0.1]" />
             <div className="relative z-10 space-y-4">
               <FileText size={32} className="text-white/80" />
               <h3 className="text-2xl font-serif">Rapport de Stage</h3>
               <p className="text-white/70 text-sm leading-relaxed">
                 Une fois votre stage terminé, vous devrez soumettre votre rapport final pour validation par le jury.
               </p>
               <Button variant="secondary" className="w-full rounded-xl py-6 font-bold uppercase tracking-widest text-[10px] bg-white text-accent hover:bg-white/90">
                 Bientôt disponible
               </Button>
             </div>
           </Card>
        </div>
      </div>
    </motion.div>
  )
}
