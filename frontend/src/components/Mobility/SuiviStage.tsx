import { useState } from "react"
import {
  History,
  Plus,
  MoreVertical,
  Clock,
  FileCheck,
  Upload,
  Star,
  MessageSquare,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const MOCK_ENTRIES = [
  { id: "1", date: "2024-04-29", content: "Initialisation de l'environnement de développement Cloud.", hours: 7 },
  { id: "2", date: "2024-04-28", content: "Analyse des besoins et rédaction du cahier des charges technique.", hours: 8 },
  { id: "3", date: "2024-04-27", content: "Réunion d'équipe sur l'architecture micro-services.", hours: 6 },
]

export default function SuiviStage() {
  const [entries] = useState(MOCK_ENTRIES)

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suivi de Stage</h1>
          <p className="text-muted-foreground">Journal d'activité et évaluation de performance.</p>
        </div>
        <div className="flex items-center gap-4 bg-card px-6 py-3 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-col items-center border-r border-border pr-6 mr-1">
            <span className="text-2xl font-bold text-primary">142</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Heures Validées</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-green-500">82%</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Progression Stage</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Activity Log */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <History size={20} className="text-primary" /> Journal de Bord
              </h3>
              <button className="bg-foreground text-background px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-80 transition-all">
                <Plus size={16} /> Nouvelle Entrée
              </button>
            </div>
            <div className="divide-y divide-border">
              {entries.map((entry) => (
                <div key={entry.id} className="p-6 hover:bg-accent/50 transition-colors group">
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex flex-col items-center justify-center border border-primary/20 shrink-0">
                        <span className="text-xs font-bold leading-none">{entry.date.split("-")[2]}</span>
                        <span className="text-[10px] uppercase font-black opacity-60">AVR.</span>
                      </div>
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold">{entry.hours}h</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Activité Technique</span>
                        <button className="text-muted-foreground/30 hover:text-muted-foreground transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                      <p className="leading-relaxed font-medium">{entry.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-4 text-muted-foreground text-sm font-bold bg-accent/50 hover:bg-accent transition-colors border-t border-border italic uppercase tracking-widest">
              Charger l'historique complet
            </button>
          </div>
        </div>

        {/* Deliverables & Evaluation */}
        <div className="space-y-8">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
            <h3 className="font-bold flex items-center gap-2">
              <FileCheck size={20} className="text-primary" /> Livrables Requis
            </h3>
            <div className="space-y-4">
              {[
                { label: "Rapport d'Escale 1", status: "validated", date: "Valide le 15/04" },
                { label: "Rapport d'Escale 2", status: "pending", date: "Échéance le 30/04" },
                { label: "Mémoire de Stage", status: "locked", date: "Déblocage le 15/06" },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-accent/50 border border-border rounded-xl group hover:border-primary/30 transition-all">
                  <div className="flex gap-4 items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                      doc.status === "validated" ? "bg-green-500/10 text-green-500" :
                      doc.status === "pending" ? "bg-amber-500/10 text-amber-500" : "bg-accent text-muted-foreground",
                    )}>
                      {doc.status === "validated" ? <CheckCircle size={20} /> : <Upload size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{doc.label}</p>
                      <p className="text-[10px] font-bold text-muted-foreground italic uppercase">{doc.date}</p>
                    </div>
                  </div>
                  {doc.status === "pending" && (
                    <button className="bg-card p-2 rounded-lg border border-border text-muted-foreground hover:bg-foreground hover:text-background transition-all">
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tutor Evaluation */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Star size={20} className="text-amber-400 fill-amber-400" /> Évaluation Tuteur
              </h3>
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded font-bold uppercase italic">V1.0</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-amber-400 p-0.5">
                  <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center font-bold text-xs uppercase">TS</div>
                </div>
                <div>
                  <p className="text-sm font-bold">Thomas Shelby</p>
                  <p className="text-[10px] text-slate-400 italic">Chef de Projet IT @ Shelby Co.</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 italic text-sm text-slate-300 leading-relaxed">
                "Étudiant très proactif. Capacité d'adaptation impressionnante et autonomie technique confirmée."
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} className={i <= 4 ? "text-amber-400 fill-amber-400" : "text-white/20"} />
                  ))}
                </div>
                <button className="text-[10px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 uppercase tracking-widest">
                  <MessageSquare size={12} /> Voir commentaires
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-amber-500 text-sm">
            <AlertCircle size={20} className="shrink-0" />
            <p className="italic">Prochaine visite de tuteur académique prévue pour le <b>12 Mai 2024</b> à 14h00.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
