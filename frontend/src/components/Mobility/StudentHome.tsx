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
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
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
      className="space-y-20 p-8 md:p-12 max-w-6xl mx-auto"
    >
      {/* Claude-style Hero Section */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-16">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-1 text-[10px] font-medium tracking-widest uppercase border-zinc-200 dark:border-zinc-800">
            Student Portal
          </Badge>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            Welcome, <span className="italic text-zinc-400">{getFirstName()}</span>
          </h1>
          <p className="text-zinc-500 text-xl max-w-2xl font-light leading-relaxed">
            Synthesize your academic journey. Manage internships and mobility opportunities with refined precision.
          </p>
        </div>
      </motion.div>

      {/* Main Actions Grid */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-12 gap-10"
      >
        {/* Stages Card */}
        <motion.div variants={fadeInUp} className="md:col-span-4">
          <Link to="/stages" className="group block h-full">
            <Card className="h-full border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 transition-all hover:shadow-md overflow-hidden">
              <CardHeader className="p-8 space-y-6">
                <div className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                  <FileText size={24} />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-serif">
                    Internships & PFE
                  </CardTitle>
                  <CardDescription className="text-sm font-light leading-relaxed">
                    Initiate administrative workflows, generate conventions, and monitor validation progress.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardFooter className="px-8 pb-8 mt-auto">
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-all gap-2">
                  Explore offers <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
            <Card className="h-full border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 transition-all hover:shadow-md overflow-hidden">
              <CardHeader className="p-8 space-y-6">
                <div className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                  <Plane size={24} />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-serif">Mobility</CardTitle>
                  <CardDescription className="text-sm font-light leading-relaxed">
                    Identify national and international opportunities to expand your academic horizon.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardFooter className="px-8 pb-8 mt-auto">
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-all gap-2">
                  View destinations <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>

        {/* Status Card */}
        <motion.div variants={fadeInUp} className="md:col-span-4">
          <Card className="h-full border-none shadow-sm bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 overflow-hidden relative">
            <div className="absolute inset-0 dot-pattern opacity-10" />
            <CardHeader className="p-8 space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                 <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[9px] font-bold tracking-widest border-zinc-700 text-zinc-400">
                   Active Status
                 </Badge>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-serif">Current Tracking</CardTitle>
            </CardHeader>
            <CardContent className="px-8 space-y-4 relative z-10">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400" size={14} />
                  <span className="text-xs font-medium">Academic Dossier</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Verified</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Clock className="text-zinc-400" size={14} />
                  <span className="text-xs font-medium">Convention</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">In Progress</span>
              </div>
            </CardContent>
            <CardFooter className="p-8 mt-auto relative z-10">
              <Button variant="outline" className="w-full border-zinc-700 text-zinc-400 hover:bg-white hover:text-zinc-900 transition-all text-[10px] font-bold uppercase tracking-widest h-10">
                View Full Tracking
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      {/* News Feed */}
      <motion.div variants={fadeInUp} className="space-y-10">
        <div className="flex items-center gap-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            Announcements
          </h3>
          <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-900" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {newsItems.map((news, i) => (
            <motion.div variants={fadeInUp} key={i}>
              <div className="flex items-center gap-8 p-6 group cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 rounded-2xl transition-all border border-transparent hover:border-zinc-100 dark:hover:border-zinc-900">
                <div className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-full text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                  <Sparkles size={16} />
                </div>
                <p className="text-base text-zinc-600 dark:text-zinc-400 font-light flex-1 leading-relaxed">
                  {news}
                </p>
                <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
