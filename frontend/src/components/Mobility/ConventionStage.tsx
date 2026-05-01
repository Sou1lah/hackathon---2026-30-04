import {
  CheckCircle,
  Clock,
  Download,
  FileText,
  Printer,
  Share2,
  ShieldCheck,
  AlertCircle,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import useAuth from "@/hooks/useAuth"

const SIGNATURE_STEPS = [
  { label: "Etudiant", role: "Signataire 1", level: "N0" },
  { label: "Tuteur Academique", role: "Signataire 2", level: "N0" },
  { label: "Entreprise d'Accueil", role: "Signataire 3", level: "N0" },
  { label: "Departement (Chef)", role: "Signataire 4", level: "N1" },
  { label: "Doyen/Directeur", role: "Signataire 5", level: "N2" },
  { label: "Vice-Rectorat", role: "Signataire 6", level: "N3" },
  { label: "Rectorat (Final)", role: "Signataire 7", level: "N3" },
  { label: "Systeme PROGRES", role: "Archivage", level: "N3" },
]

export default function ConventionStage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: conventions, isLoading } = useQuery({
    queryKey: ["my-conventions"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!response.ok) throw new Error("Failed to fetch")
      return response.json()
    },
  })

  const signMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/${id}/sign`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!response.ok) throw new Error("Failed to sign")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-conventions"] })
    },
  })

  const currentConvention = conventions?.data?.[0]

  if (isLoading) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center">
        <Clock className="h-12 w-12 animate-spin text-accent" />
      </div>
    )
  }

  if (!currentConvention) {
    return (
      <div className="flex h-[500px] w-full flex-col items-center justify-center gap-6 p-8">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400">
          <FileText className="h-12 w-12" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-serif text-foreground mb-2">Aucune Convention</h2>
          <p className="text-muted-foreground">Vous n'avez pas encore de convention de stage générée.</p>
        </div>
        <Button size="lg" className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-bold uppercase tracking-widest px-8">
          Générer une Convention
        </Button>
      </div>
    )
  }

  const getStepStatus = (index: number) => {
    const step = SIGNATURE_STEPS[index]
    
    // Mapping backend levels to frontend steps
    // N1 is step 4, N2 is step 5, N3 is step 6/7/8
    if (currentConvention.status === 'completed') return 'completed'
    if (currentConvention.status === 'rejected') return 'failed'

    const levelMap: Record<string, number> = {
      'N1': 3,
      'N2': 4,
      'N3': 5,
    }

    const currentLevelIndex = levelMap[currentConvention.approval_level] || 0
    
    if (index < currentLevelIndex) return 'completed'
    if (index === currentLevelIndex) return 'current'
    return 'pending'
  }

  const progressValue = (currentConvention.status === 'completed' ? 8 : (SIGNATURE_STEPS.findIndex((_, i) => getStepStatus(i) === 'current')) || 0) / 8 * 100

  return (
    <div className="space-y-10 max-w-7xl mx-auto p-2">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Convention de Stage</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Gestion et suivi administratif des signatures electroniques PAdES.
          </p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm">
            <ShieldCheck size={18} className="text-zinc-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-900 dark:text-zinc-50 font-bold uppercase tracking-widest leading-none">Certificat PAdES</span>
              <span className="text-[9px] text-zinc-400 font-mono mt-1 uppercase">Version LTV</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* Document Preview */}
        <div className="xl:col-span-3">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-none overflow-hidden flex flex-col min-h-[850px]">
            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-900 p-4 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-4">
                <div className="size-10 bg-zinc-900 dark:bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-50 dark:text-zinc-900 shadow-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{currentConvention.document_name}</h3>
                  <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest mt-0.5">MODIFIE LE {new Date(currentConvention.updated_at).toLocaleDateString()} • PDF/A-3</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="size-9 text-zinc-400"><Download size={18} /></Button>
                <Button variant="ghost" size="icon" className="size-9 text-zinc-400"><Printer size={18} /></Button>
                <Button variant="ghost" size="icon" className="size-9 text-zinc-400"><Share2 size={18} /></Button>
                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-3" />
                {currentConvention.status === 'pending' && (
                  <Button 
                    onClick={() => signMutation.mutate(currentConvention.id)}
                    className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-[10px] font-bold uppercase tracking-widest h-9 px-6 hover:opacity-90 transition-all"
                    disabled={signMutation.isPending}
                  >
                    {signMutation.isPending ? "Traitement..." : "Signer Maintenant"}
                  </Button>
                )}
                {currentConvention.status === 'completed' && (
                   <Badge className="bg-emerald-500 text-white px-4 py-1.5 rounded-full font-bold uppercase text-[9px] tracking-widest">Signé & Validé</Badge>
                )}
                {currentConvention.status === 'rejected' && (
                   <Badge variant="destructive" className="px-4 py-1.5 rounded-full font-bold uppercase text-[9px] tracking-widest">Rejeté</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 bg-zinc-100/50 dark:bg-zinc-900/30 p-12 overflow-y-auto flex justify-center">
              <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 aspect-[1/1.414] shadow-2xl rounded p-16 space-y-8 relative group border border-zinc-200 dark:border-zinc-800">
                <div className="absolute inset-0 bg-zinc-900/5 dark:bg-zinc-50/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in rounded">
                  <Badge variant="secondary" className="px-5 py-2 rounded-full font-bold text-xs shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50">Double-cliquez pour agrandir</Badge>
                </div>
                <div className="flex justify-between border-b-2 border-zinc-900 dark:border-zinc-50 pb-6">
                  <div className="size-14 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800" />
                  <div className="text-right">
                    <h2 className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-zinc-900 dark:text-zinc-50">Republique Algerienne Democratique et Populaire</h2>
                    <p className="text-[8px] font-mono text-zinc-400 mt-1 uppercase tracking-tighter">Ministere de l'Enseignement Superieur et de la Recherche Scientifique</p>
                  </div>
                </div>
                <div className="text-center space-y-3 py-10">
                  <h1 className="text-2xl font-serif font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-50">CONVENTION DE STAGE</h1>
                  <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">ANNEE ACADEMIQUE 2023 / 2024</p>
                </div>
                <div className="space-y-6 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg mx-auto">
                  <p className="font-bold text-zinc-900 dark:text-zinc-50">ENTRE :</p>
                  <p>L'Institution denommee [NOM INSTITUTION], representee par M. le Recteur, ci-apres designee « L'Universite ».</p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-50">ET :</p>
                  <p>L'Entreprise [NOM ENTREPRISE], sise a [ADRESSE], representee par [REPRESENTANT].</p>
                </div>
                <div className="pt-10 border-t border-zinc-100 dark:border-zinc-900">
                   <h4 className="font-bold text-[10px] uppercase tracking-widest text-zinc-900 dark:text-zinc-50 mb-4">ARTICLE 1 : OBJET DE LA CONVENTION</h4>
                   <p className="text-xs text-zinc-500 italic leading-relaxed">La presente convention regle les rapports entre l'Universite, l'Entreprise et l'etudiant(e).</p>
                </div>
                <div className="grid grid-cols-2 gap-12 pt-24">
                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 text-[9px] font-mono uppercase tracking-widest text-zinc-300">Signature de l'Entreprise</div>
                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 text-[9px] font-mono uppercase tracking-widest text-zinc-300">Signature de l'Universite</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signature Tracker */}
        <div className="space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-none sticky top-8">
            <CardHeader className="pb-6">
              <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Clock className="text-zinc-400" size={16} /> Circuit de Signature
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {SIGNATURE_STEPS.map((step, i) => {
                const status = getStepStatus(i)
                return (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "size-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all",
                        status === "completed" ? "bg-emerald-500 border-emerald-500 text-white" : 
                        status === "current" ? "bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50 text-zinc-50 dark:text-zinc-900 ring-4 ring-zinc-50 dark:ring-zinc-900 shadow-xl" : 
                        status === "failed" ? "bg-destructive border-destructive text-white" :
                        "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-300"
                      )}>
                        {status === "completed" ? <CheckCircle size={14} /> : status === "failed" ? <AlertCircle size={14} /> : <span className="text-[10px] font-mono font-bold">{i + 1}</span>}
                      </div>
                      {i < SIGNATURE_STEPS.length - 1 && (
                        <div className={cn(
                          "w-[2px] h-full min-h-[35px] my-1",
                          status === "completed" ? "bg-emerald-500" : "bg-zinc-100 dark:bg-zinc-900"
                        )} />
                      )}
                    </div>
                    <div className="pb-6 min-w-0">
                      <p className={cn(
                        "text-xs font-bold leading-none mb-1.5",
                        status === "completed" ? "text-zinc-900 dark:text-zinc-50" : 
                        status === "current" ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400"
                      )}>
                        {step.label}
                      </p>
                      <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest font-semibold">{step.role}</p>
                      {status === "completed" && (
                         <p className="text-[8px] font-mono text-emerald-500 font-bold mt-2 uppercase tracking-tighter">VALIDÉ / SIGNÉ</p>
                      )}
                      {status === "current" && (
                         <div className="mt-3 flex gap-2">
                           <Button size="sm" className="h-6 text-[9px] font-bold uppercase tracking-widest bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-3 hover:opacity-90 transition-all">Action</Button>
                           <Button variant="outline" size="sm" className="h-6 text-[9px] font-bold uppercase tracking-widest px-3 border-zinc-200 dark:border-zinc-800">Details</Button>
                         </div>
                      )}
                    </div>
                  </div>
                )
              })}
              
              <div className="mt-6 pt-6 border-t border-zinc-50 dark:border-zinc-900 space-y-4">
                 <div className="flex items-center justify-between text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">
                    <span>Progression</span>
                    <span className="text-zinc-900 dark:text-zinc-50">{Math.round(progressValue/12.5)}/8 Termine</span>
                 </div>
                 <Progress value={progressValue} className="h-1.5 bg-zinc-100 dark:bg-zinc-900" />
                 <p className="text-[9px] text-zinc-400 italic text-center leading-relaxed font-medium">
                   Ce document nécessite l'authentification forte via Certificat National ou Clé USB Token.
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
