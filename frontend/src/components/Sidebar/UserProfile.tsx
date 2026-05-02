import { 
  Award, 
  BookOpen, 
  Certificate, 
  GraduationCap, 
  Layers, 
  ShieldCheck, 
  Star,
  FileText,
  BadgeCheck,
  Briefcase
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function UserProfile({ user }: { user: any }) {
  if (!user) return null

  const stats = [
    { label: "GPA", value: user.gpa || "N/A", icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
    { label: "Level", value: user.level || "N/A", icon: GraduationCap, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
    { label: "Specialty", value: user.specialty || "N/A", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  ]

  const certificates = [
    { title: "English Proficiency (C1)", date: "2024", issuer: "UBMA Language Center" },
    { title: "Digital Literacy Cert", date: "2023", issuer: "National IT Board" },
  ]

  return (
    <div className="space-y-8 py-4">
      {/* Header Info */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="size-20 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
           <GraduationCap size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{user.full_name}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
             {user.role_type || "Student"}
          </Badge>
          {user.level?.includes("PhD") && (
            <Badge className="rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 text-white border-none">
               PhD Candidate
            </Badge>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 shadow-sm space-y-2">
            <div className={cn("p-2 rounded-xl", stat.bg)}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{stat.label}</p>
              <p className="text-sm font-black text-zinc-900 dark:text-zinc-50">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="bg-zinc-100 dark:bg-zinc-900" />

      {/* Background & Academic Details */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-900">
            <Layers size={16} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50">Academic Dossier</h3>
        </div>

        <div className="space-y-4">
           <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                 <span>Course Completion</span>
                 <span className="text-zinc-900 dark:text-zinc-50">85%</span>
              </div>
              <Progress value={85} className="h-1.5 bg-zinc-100 dark:bg-zinc-900" />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Language</p>
                 <div className="flex items-center gap-2">
                    <BadgeCheck size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold">{user.language || "English / French"}</span>
                 </div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">PhD Thesis</p>
                 <div className="flex items-center gap-2">
                    <FileText size={14} className="text-indigo-500" />
                    <span className="text-xs font-bold">{user.level?.includes("PhD") ? "In Progress" : "N/A"}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Certificates */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Award size={16} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50">Certificates & Awards</h3>
        </div>

        <div className="space-y-3">
          {certificates.map((cert, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 hover:border-emerald-500/30 transition-colors group">
              <div className="flex items-center gap-4">
                 <div className="size-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20 group-hover:text-emerald-500 transition-colors">
                    <ShieldCheck size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{cert.title}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">{cert.issuer}</p>
                 </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-300">{cert.date}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-zinc-100 dark:bg-zinc-900" />

      {/* Quick Summary for Admin */}
      <div className="p-6 rounded-[2rem] bg-indigo-900 text-white space-y-4 shadow-xl">
         <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
               <Briefcase size={20} />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-widest">Admin Quick Review</h4>
         </div>
         <p className="text-[11px] text-indigo-100/70 leading-relaxed italic">
            This student has maintained a GPA above 3.5 and holds international language certifications. 
            Recommended for Tier-1 internship mobility programs.
         </p>
      </div>
    </div>
  )
}
