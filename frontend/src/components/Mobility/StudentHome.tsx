import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Plane,
} from "lucide-react"
import useAuth from "@/hooks/useAuth"

export default function StudentHome() {
  const { user } = useAuth()

  // Safe display name logic
  const getFirstName = () => {
    if (!user?.full_name) return "Etudiant"
    const parts = user.full_name.trim().split(/\s+/)
    return parts[0] || "Etudiant"
  }

  const newsItems = [
    "La campagne de mobilite Erasmus+ 2026 est ouverte jusqu'au 15 Mai.",
    "N'oubliez pas de soumettre votre rapport de stage de mi-parcours.",
    "Nouveaux partenariats entreprises disponibles pour les PFE.",
  ]

  return (
    <div className="space-y-8 p-1">
      {/* Header with safe loading check */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenue, {getFirstName()}
        </h1>
        <p className="text-muted-foreground text-lg italic">
          Pret pour votre prochaine etape academique ? Gerez vos stages et
          mobilites en toute simplicite.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stages Card */}
        <Link
          to="/stages"
          className="group relative overflow-hidden bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-xl"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <GraduationCap size={80} />
          </div>
          <div className="bg-blue-500/10 p-3 rounded-xl w-fit text-blue-600 mb-6">
            <FileText size={28} />
          </div>
          <h3 className="text-xl font-bold mb-2">Stages & PFE</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Deposez vos demandes de stage, genere de vos conventions et suivez
            vos validations.
          </p>
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            Gerer mes stages{" "}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </div>
        </Link>

        {/* Mobility Card */}
        <Link
          to="/mobilite"
          search={{ type: "nationale" }}
          className="group relative overflow-hidden bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-xl"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Plane size={80} />
          </div>
          <div className="bg-purple-500/10 p-3 rounded-xl w-fit text-purple-600 mb-6">
            <Plane size={28} />
          </div>
          <h3 className="text-xl font-bold mb-2">Mobilite</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Explorez les opportunites de mobilite nationale et internationale.
          </p>
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            Voir les opportunites{" "}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </div>
        </Link>

        {/* Status Card */}
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 italic">
              <Clock className="text-blue-400" size={24} /> Etat du Dossier
            </h3>
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-400" size={18} />
                <span className="text-sm text-slate-300 italic">
                  Dossier academique verifie
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-amber-400" size={18} />
                <span className="text-sm text-slate-300 italic">
                  Convention en attente
                </span>
              </div>
            </div>
          </div>
          <button className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-lg">
            Suivre l'avancement
          </button>
        </div>
      </div>

      {/* News Feed */}
      <div className="bg-accent/30 p-8 rounded-2xl border border-border/50">
        <h3 className="font-bold mb-4 italic">Actualites & Rappels</h3>
        <div className="space-y-4">
          {newsItems.map((news, i) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-1 bg-primary rounded-full shrink-0" />
              <p className="text-sm font-medium italic">{news}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
