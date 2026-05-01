import {
  Building2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Filter,
  Globe,
  Handshake,
  Mail,
  Map as MapIcon,
  MoreHorizontal,
  Plane,
  Search,
} from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface MobilityViewProps {
  type: "nationale" | "internationale"
}

const MOCK_FILES = [
  {
    id: "F-2401",
    student: "Amine Kerroum",
    dest: "Univ. Science Tech (USTHB)",
    status: "N2",
    priority: "High",
    tags: ["Bourse", "Dortoir"],
  },
  {
    id: "F-2405",
    student: "Kenzy Ben",
    dest: "Ecole Polytechnique (ENP)",
    status: "N1",
    priority: "Medium",
    tags: ["Convention"],
  },
  {
    id: "I-8821",
    student: "Sofia Red",
    dest: "Sorbonne University, FR",
    status: "N3",
    priority: "High",
    tags: ["Visa", "Erasmus+"],
  },
  {
    id: "I-9012",
    student: "Malik Sahli",
    dest: "MIT, USA",
    status: "N2",
    priority: "Critical",
    tags: ["Visa Support", "Partenariat"],
  },
]

const APPROVAL_LEVELS = [
  {
    id: "N1",
    label: "Département / Faculté",
    desc: "Validation académique & pédagogique",
    color: "bg-indigo-500",
  },
  {
    id: "N2",
    label: "Relations Extérieures",
    desc: "Conformité partenariats & logistique",
    color: "bg-blue-500",
  },
  {
    id: "N3",
    label: "Rectorat / Ministère",
    desc: "Homologation finale & visas de sortie",
    color: "bg-green-500",
  },
]

export default function MobilityView({ type }: MobilityViewProps) {
  const filteredFiles = MOCK_FILES.filter((f) =>
    type === "nationale" ? f.id.startsWith("F") : f.id.startsWith("I"),
  )

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg">
            {type === "nationale" ? <MapIcon size={24} /> : <Globe size={24} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Mobilité {type === "nationale" ? "Nationale" : "Internationale"}
            </h1>
            <p className="text-muted-foreground italic flex items-center gap-2">
              <Building2 size={14} /> Gestion des flux inter-établissements •{" "}
              {type === "nationale" ? "Réseau National" : "Zone EMEA / Global"}
            </p>
          </div>
        </div>
        <div className="bg-card p-1 rounded-xl border border-border flex shadow-sm">
          <button className="px-4 py-2 text-xs font-bold uppercase rounded-lg bg-foreground text-background shadow-md">
            Vue Liste
          </button>
          <button className="px-4 py-2 text-xs font-bold uppercase rounded-lg text-muted-foreground hover:text-foreground">
            Vue Kanban
          </button>
        </div>
      </div>

      {/* Approval Workflow */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold flex items-center gap-2 uppercase tracking-widest text-xs text-muted-foreground">
            Flux d'Approbation Administratif
          </h3>
          <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
            MODE TEMPORISÉ
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2 hidden md:block" />
          {APPROVAL_LEVELS.map((level) => (
            <div
              key={level.id}
              className="relative z-10 flex flex-col items-center text-center space-y-4"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ring-8 ring-card",
                  level.color,
                )}
              >
                {level.id}
              </div>
              <div>
                <h4 className="font-bold">{level.label}</h4>
                <p className="text-[11px] text-muted-foreground leading-tight mt-1">
                  {level.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <input
                type="text"
                placeholder="Référence ou Étudiant..."
                className="pl-9 pr-4 py-2 bg-accent border border-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary w-64"
              />
            </div>
            <button className="p-2 border border-border rounded-xl hover:bg-accent transition-colors">
              <Filter size={18} className="text-muted-foreground" />
            </button>
          </div>
          <div className="flex gap-2">
            <button className="bg-accent text-foreground px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent/80 transition-all flex items-center gap-2">
              <Mail size={14} /> Relancer Tous
            </button>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 shadow-lg transition-all flex items-center gap-2">
              Exporter (XLSX)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-accent/50 text-[10px] uppercase tracking-widest font-black text-muted-foreground border-b border-border">
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Étudiant</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">État Flux</th>
                <th className="px-6 py-4">Support & Bourses</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFiles.map((file, i) => (
                <motion.tr
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={file.id}
                  className="hover:bg-accent/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded">
                      #{file.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center font-bold text-[10px] border border-border">
                        {file.student
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{file.student}</p>
                        <p className="text-[10px] text-muted-foreground">
                          MI-M2 SIC
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Building2 size={12} className="text-muted-foreground" />{" "}
                      {file.dest}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-black uppercase shadow-sm",
                          file.status === "N1"
                            ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                            : file.status === "N2"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : "bg-green-500/10 text-green-500 border border-green-500/20",
                        )}
                      >
                        Phase {file.status}
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-muted-foreground"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {file.tags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 border",
                            tag.includes("Visa")
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : tag.includes("Bourse")
                                ? "bg-green-500/10 text-green-600 border-green-500/20"
                                : "bg-accent text-muted-foreground border-border",
                          )}
                        >
                          {tag.includes("Visa") && <Plane size={10} />}
                          {tag.includes("Bourse") && <CreditCard size={10} />}
                          {tag.includes("Partenariat") && (
                            <Handshake size={10} />
                          )}
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 hover:bg-card hover:shadow-md hover:text-primary transition-all rounded-lg text-muted-foreground">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-card hover:shadow-md text-muted-foreground transition-all rounded-lg">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-accent/30 border-t border-border flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest italic">
            Affichage de {filteredFiles.length} dossiers • Mis à jour il y a 2m
          </p>
          <div className="flex gap-2">
            <button
              className="p-2 bg-card border border-border rounded-lg text-muted-foreground disabled:opacity-30"
              disabled
            >
              1
            </button>
            <button className="p-2 hover:bg-card hover:border-border rounded-lg text-muted-foreground font-bold transition-all text-xs">
              Page Suivante
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
