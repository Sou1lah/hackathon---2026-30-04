import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  Clock,
  Share2,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

const SIGNATURE_STEPS = [
  { label: "Étudiant", role: "Signataire 1", status: "completed" },
  { label: "Tuteur Académique", role: "Signataire 2", status: "completed" },
  { label: "Entreprise d'Accueil", role: "Signataire 3", status: "current" },
  { label: "Département (Chef)", role: "Signataire 4", status: "pending" },
  { label: "Doyen/Directeur", role: "Signataire 5", status: "pending" },
  { label: "Vice-Rectorat", role: "Signataire 6", status: "pending" },
  { label: "Rectorat (Final)", role: "Signataire 7", status: "pending" },
  { label: "Système PROGRES", role: "Archivage", status: "pending" },
]

export default function ConventionStage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Convention de Stage</h1>
          <p className="text-muted-foreground">Gestion et suivi administratif des signatures électroniques PAdES.</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl px-4 py-2 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center"><ShieldCheck size={18} /></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Certificat PAdES</span>
            <span className="text-xs font-semibold text-blue-400 italic">Version Multi-Signatures LTV</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Document Preview */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col min-h-[800px]">
            <div className="bg-accent/50 border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground"><FileText size={20} /></div>
                <div>
                  <h3 className="font-bold text-sm">Convention_ElBouni_2024.pdf</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">MODIFIÉ IL Y A 2 HEURES • PDF/A-3</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors"><Download size={18} /></button>
                <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors"><Printer size={18} /></button>
                <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors"><Share2 size={18} /></button>
                <div className="w-px h-6 bg-border mx-2" />
                <button className="bg-foreground text-background px-4 py-2 rounded-lg text-xs font-bold hover:opacity-80 transition-all">Signer Maintenant</button>
              </div>
            </div>

            {/* Mock PDF Viewer */}
            <div className="flex-1 bg-accent/30 p-12 overflow-y-auto flex justify-center">
              <div className="w-full max-w-2xl bg-card aspect-[1/1.414] shadow-2xl rounded p-16 space-y-8 relative group border border-border">
                <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in rounded">
                  <span className="bg-card px-4 py-2 rounded-full font-bold text-sm shadow-xl border border-border">Double-cliquez pour agrandir</span>
                </div>
                <div className="flex justify-between border-b-2 border-foreground pb-4">
                  <div className="w-12 h-12 bg-accent rounded" />
                  <div className="text-right">
                    <h2 className="text-sm font-bold uppercase">République Algérienne Démocratique et Populaire</h2>
                    <p className="text-[10px] italic text-muted-foreground">Ministère de l'Enseignement Supérieur et de la Recherche Scientifique</p>
                  </div>
                </div>
                <div className="text-center space-y-2 py-4">
                  <h1 className="text-xl font-serif font-bold uppercase tracking-widest">CONVENTION DE STAGE</h1>
                  <p className="text-xs font-medium text-muted-foreground uppercase">ANNEE ACADEMIQUE 2023 / 2024</p>
                </div>
                <div className="space-y-4 text-[13px] leading-relaxed">
                  <p className="font-bold">ENTRE :</p>
                  <p>L'Institution dénommée [NOM INSTITUTION], représentée par M. le Recteur, ci-après désignée « L'Université ».</p>
                  <p className="font-bold">ET :</p>
                  <p>L'Entreprise [NOM ENTREPRISE], sise à [ADRESSE], représentée par [REPRÉSENTANT].</p>
                </div>
                <div className="pt-8 border-t border-border">
                  <h4 className="font-bold text-xs mb-4">ARTICLE 1 : OBJET DE LA CONVENTION</h4>
                  <p className="text-[12px] text-muted-foreground italic">La présente convention règle les rapports entre l'Université, l'Entreprise et l'étudiant(e).</p>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-20">
                  <div className="border-t border-muted-foreground/30 pt-2 opacity-40 italic text-[10px]">Signature de l'Entreprise</div>
                  <div className="border-t border-muted-foreground/30 pt-2 opacity-40 italic text-[10px]">Signature de l'Université</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Tracker */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm sticky top-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Clock className="text-primary" size={20} /> Circuit de Signature
            </h3>
            <div className="space-y-4">
              {SIGNATURE_STEPS.map((step, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all",
                      step.status === "completed" ? "bg-green-500 border-green-500 text-white" :
                      step.status === "current" ? "bg-primary border-primary text-primary-foreground animate-pulse" :
                      "bg-card border-border text-muted-foreground",
                    )}>
                      {step.status === "completed" ? <CheckCircle size={14} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                    </div>
                    {i < SIGNATURE_STEPS.length - 1 && (
                      <div className={cn("w-px h-full min-h-[30px] my-1 transition-colors", step.status === "completed" ? "bg-green-500" : "bg-border")} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={cn(
                      "text-sm font-bold leading-none mb-1",
                      step.status === "completed" ? "text-foreground" :
                      step.status === "current" ? "text-primary" : "text-muted-foreground",
                    )}>{step.label}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{step.role}</p>
                    {step.status === "completed" && <p className="text-[9px] text-green-500 font-bold mt-1 italic uppercase">SIGNÉ LE 29/04 14:20</p>}
                    {step.status === "current" && (
                      <div className="mt-2 flex gap-2">
                        <button className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded hover:opacity-80">Rappeler</button>
                        <button className="bg-accent text-muted-foreground text-[10px] font-bold px-3 py-1 rounded hover:bg-accent/80">Détails</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-accent/50 rounded-xl border border-border">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2 uppercase tracking-tighter">
                <span>Progression Signature</span>
                <span>2/8 Terminé</span>
              </div>
              <div className="w-full bg-accent h-2 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[25%] transition-all" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 italic text-center leading-relaxed">
                Ce document nécessite l'authentification forte via Certificat National ou Clé USB Token.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
