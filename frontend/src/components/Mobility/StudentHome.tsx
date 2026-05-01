import { Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Plane,
  Sparkles,
} from "lucide-react"
import useAuth from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function StudentHome() {
  const { user } = useAuth()

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
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-16 p-6 max-w-6xl mx-auto"
    >
      {/* Hero Section */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="section" className="px-4 py-1.5 text-[10px]">
            <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse mr-2" />
            Portail Etudiant
          </Badge>
        </div>
        <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-foreground leading-[1.1]">
          Bienvenue, <span className="gradient-text">{getFirstName()}</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl leading-relaxed">
          Pret pour votre prochaine etape academique ? Gerez vos stages et
          mobilites avec une precision moderne.
        </p>
      </motion.div>

      {/* Main Actions Grid */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Stages Card */}
        <motion.div variants={fadeInUp} className="md:col-span-4">
          <Link to="/stages" className="group block h-full">
            <Card className="h-full overflow-hidden border-border/50">
              <CardHeader className="relative z-10">
                <div className="bg-accent/10 w-fit p-3 rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <FileText size={24} />
                </div>
                <CardTitle className="text-2xl mt-6">Stages & PFE</CardTitle>
                <CardDescription className="text-base mt-2">
                  Deposez vos demandes, genere vos conventions et suivez vos validations en temps reel.
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <div className="flex items-center text-accent font-medium gap-2 group-hover:translate-x-2 transition-transform duration-300">
                  Explorer les offres <ArrowRight size={18} />
                </div>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>

        {/* Mobility Card */}
        <motion.div variants={fadeInUp} className="md:col-span-4">
          <Link to="/mobilite" search={{ type: "nationale" }} className="group block h-full">
            <Card className="h-full overflow-hidden border-border/50">
              <CardHeader className="relative z-10">
                <div className="bg-accent/10 w-fit p-3 rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <Plane size={24} />
                </div>
                <CardTitle className="text-2xl mt-6">Mobilite</CardTitle>
                <CardDescription className="text-base mt-2">
                  Explorez les opportunites de mobilite nationale et internationale pour enrichir votre parcours.
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <div className="flex items-center text-accent font-medium gap-2 group-hover:translate-x-2 transition-transform duration-300">
                  Voir les destinations <ArrowRight size={18} />
                </div>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>

        {/* Status Card (Inverted/Bold) */}
        <motion.div variants={fadeInUp} className="md:col-span-4">
          <Card className="bg-foreground text-background border-none h-full relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern opacity-[0.03]" />
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="text-accent-secondary" size={20} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Etat du Dossier</span>
                </div>
                <div className="size-2 rounded-full bg-accent-secondary animate-pulse" />
              </div>
              <CardTitle className="text-2xl text-white mt-4">Suivi Actuel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400" size={18} />
                  <span className="text-sm font-medium">Dossier acad.</span>
                </div>
                <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 text-[9px] px-2 py-0">VALIDE</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Clock className="text-amber-400" size={18} />
                  <span className="text-sm font-medium">Convention</span>
                </div>
                <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 text-[9px] px-2 py-0">EN COURS</Badge>
              </div>
            </CardContent>
            <CardFooter className="relative z-10">
              <Button variant="default" size="lg" className="w-full">
                Voir les details
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      {/* News Feed */}
      <motion.div variants={fadeInUp} className="space-y-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Actualites & Rappels</h3>
          <div className="h-px flex-1 bg-border/50" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {newsItems.map((news, i) => (
            <motion.div
              variants={fadeInUp}
              key={i}
            >
              <Card className="hover:bg-white dark:hover:bg-card/80 transition-all border-border/40">
                <CardContent className="py-5 flex items-center gap-6">
                  <div className="bg-accent/10 p-2.5 rounded-xl text-accent">
                    <Sparkles size={18} />
                  </div>
                  <p className="text-base text-foreground font-medium flex-1">{news}</p>
                  <Button variant="ghost" size="icon-sm" className="rounded-full">
                    <ArrowRight size={16} />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
