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
import { useTranslation } from "react-i18next"
import useAuth from "@/hooks/useAuth"

const fadeInUp: any = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger: any = {
  visible: { transition: { staggerChildren: 0.05 } },
}

export default function StudentHome() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const getFirstName = () => {
    if (!user?.full_name) return t("welcome")
    const parts = user.full_name.trim().split(/\s+/)
    return parts[0] || t("welcome")
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
      className="space-y-20 p-8 md:p-12 max-w-full mx-auto"
    >
      {/* Claude-style Hero Section */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-16">
        <div className="flex items-center gap-3">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Badge className="px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700">
              {t("student_portal")}
            </Badge>
          </motion.div>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
            {t("welcome")}, <span className="italic text-blue-600 dark:text-blue-400">{getFirstName()}</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl font-light leading-relaxed">
            {t("student_home_subtitle")}
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
            <Card className="h-full border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 transition-all hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-800 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="p-8 space-y-6 relative z-10">
                <div className="p-3 rounded-lg w-fit bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
                    {t("internships_pfe")}
                  </CardTitle>
                  <CardDescription className="text-sm font-light leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {t("internships_desc")}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardFooter className="px-8 pb-8 mt-auto relative z-10">
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-all gap-2">
                  {t("explore_offers")} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
            <Card className="h-full border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 transition-all hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-800 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="p-8 space-y-6 relative z-10">
                <div className="p-3 rounded-lg w-fit bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Plane size={24} />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50">{t("mobility")}</CardTitle>
                  <CardDescription className="text-sm font-light leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {t("mobility_desc")}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardFooter className="px-8 pb-8 mt-auto relative z-10">
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-all gap-2">
                  {t("view_destinations")} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>

        {/* Status Card */}
        <motion.div variants={fadeInUp} className="md:col-span-4">
          <Card className="h-full border-none shadow-lg dark:shadow-purple-950/30 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-zinc-50 dark:from-purple-950 dark:via-purple-900 dark:to-purple-950 overflow-hidden relative hover:shadow-xl transition-all group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-white/10 blur-3xl group-hover:bg-white/20 transition-all" />
            
            <CardHeader className="p-8 space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                   <Badge className="rounded-full px-3 py-0.5 text-[9px] font-bold tracking-widest border-purple-400/50 bg-purple-500/30 text-purple-100">
                     {t("active_status")}
                   </Badge>
                 </motion.div>
                 <motion.div 
                   className="w-2 h-2 rounded-full bg-emerald-400" 
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                 />
              </div>
              <CardTitle className="text-2xl font-serif font-bold">{t("current_tracking")}</CardTitle>
            </CardHeader>
            
            <CardContent className="px-8 space-y-4 relative z-10">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-center justify-between p-4 rounded-lg bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-300" size={16} />
                  <span className="text-xs font-semibold">{t("academic_dossier")}</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-300">{t("verified")}</span>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-between p-4 rounded-lg bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-3">
                  <Clock className="text-orange-300" size={16} />
                  <span className="text-xs font-semibold">{t("convention")}</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-orange-300">{t("in_progress")}</span>
              </motion.div>
            </CardContent>
            
            <CardFooter className="p-8 mt-auto relative z-10">
              <Button className="w-full bg-white text-purple-900 hover:bg-purple-50 transition-all text-[10px] font-bold uppercase tracking-widest h-10 shadow-lg">
                {t("view_full_tracking")}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      {/* News Feed */}
      <motion.div variants={fadeInUp} className="space-y-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
            {t("announcements")}
          </h2>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {newsItems.map((news, i) => (
            <motion.div variants={fadeInUp} key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center gap-6 p-6 group cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20 rounded-xl transition-all border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0">
                  <Sparkles size={18} />
                </div>
                <p className="text-base text-zinc-700 dark:text-zinc-300 font-light flex-1 leading-relaxed group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                  {news}
                </p>
                <ArrowRight size={18} className="text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
