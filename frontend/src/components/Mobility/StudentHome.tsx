import { Link } from "@tanstack/react-router"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Plane,
  Sparkles,
} from "lucide-react"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"

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

export default function StudentHome() {
  const { user } = useAuth()

  const getFirstName = () => {
    if (!user?.full_name) return "Student"
    const parts = user.full_name.trim().split(/\s+/)
    return parts[0] || "Student"
  }

  const newsItems = [
    "The Erasmus+ 2026 mobility campaign is open until May 15th.",
    "Don't forget to submit your mid-term internship report.",
    "New corporate partnerships available for graduation projects (PFE).",
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
            Student Portal
          </Badge>
        </div>
        <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-foreground leading-[1.1]">
          Welcome, <span className="gradient-text">{getFirstName()}</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl leading-relaxed">
          Ready for your next academic step? Manage your internships and
          mobilities with modern precision.
        </p>
      </motion.div>

      {/* Main Actions Grid */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        {/* Stages Card */}
        <motion.div variants={fadeInUp} className="md:col-span-4">
          <Link to="/stages" className="group block h-full">
            <Card className="h-full overflow-hidden border-border/50">
              <CardHeader className="relative z-10">
                <div className="bg-accent/10 w-fit p-3 rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <FileText size={24} />
                </div>
                <CardTitle className="text-2xl mt-6">
                  Internships & PFE
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Submit your requests, generate your conventions and track your
                  validations in real-time.
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <div className="flex items-center text-accent font-medium gap-2 group-hover:translate-x-2 transition-transform duration-300">
                  Explore offers <ArrowRight size={18} />
                </div>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>

        {/* Mobility Card */}
        <motion.div variants={fadeInUp} className="md:col-span-4">
          <Link
            to="/mobilite"
            search={{ type: "nationale" }}
            className="group block h-full"
          >
            <Card className="h-full overflow-hidden border-border/50">
              <CardHeader className="relative z-10">
                <div className="bg-accent/10 w-fit p-3 rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <Plane size={24} />
                </div>
                <CardTitle className="text-2xl mt-6">Mobility</CardTitle>
                <CardDescription className="text-base mt-2">
                  Explore national and international mobility opportunities to
                  enrich your journey.
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <div className="flex items-center text-accent font-medium gap-2 group-hover:translate-x-2 transition-transform duration-300">
                  View destinations <ArrowRight size={18} />
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
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Dossier Status
                  </span>
                </div>
                <div className="size-2 rounded-full bg-accent-secondary animate-pulse" />
              </div>
              <CardTitle className="text-2xl text-white mt-4">
                Current Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400" size={18} />
                  <span className="text-sm font-medium">Academic dossier</span>
                </div>
                <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 text-[9px] px-2 py-0">
                  VALID
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Clock className="text-amber-400" size={18} />
                  <span className="text-sm font-medium">Convention</span>
                </div>
                <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 text-[9px] px-2 py-0">
                  IN PROGRESS
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="relative z-10">
              <Button variant="default" size="lg" className="w-full">
                View details
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      {/* News Feed */}
      <motion.div variants={fadeInUp} className="space-y-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
            News & Reminders
          </h3>
          <div className="h-px flex-1 bg-border/50" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {newsItems.map((news, i) => (
            <motion.div variants={fadeInUp} key={i}>
              <Card className="hover:bg-white dark:hover:bg-card/80 transition-all border-border/40">
                <CardContent className="py-5 flex items-center gap-6">
                  <div className="bg-accent/10 p-2.5 rounded-xl text-accent">
                    <Sparkles size={18} />
                  </div>
                  <p className="text-base text-foreground font-medium flex-1">
                    {news}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full"
                  >
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
