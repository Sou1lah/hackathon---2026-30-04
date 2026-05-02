import { createFileRoute } from "@tanstack/react-router"
import { 
  Award, 
  BookOpen, 
  GraduationCap, 
  Layers, 
  ShieldCheck, 
  Star,
  FileText,
  BadgeCheck,
  Briefcase,
  Mail,
  User as UserIcon,
  MapPin,
  Calendar
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import useAuth from "@/hooks/useAuth"
import UserDocuments from "@/components/UserSettings/UserDocuments"

export const Route = createFileRoute("/_layout/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      {
        title: "Academic Profile - UBMA",
      },
    ],
  }),
})

function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const stats = [
    { label: "GPA", value: user.gpa || "N/A", icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
    { label: "Level", value: user.level || "N/A", icon: GraduationCap, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
    { label: "Specialty", value: user.specialty || "N/A", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  ]

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-12 pb-24">
      {/* Header Profile Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-zinc-900 text-white p-8 md:p-12 shadow-2xl">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="size-32 rounded-[2.5rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-3 transition-transform hover:rotate-0 duration-500 shrink-0">
               <GraduationCap size={64} />
            </div>
            <div className="text-center md:text-left space-y-4">
               <div>
                  <h1 className="text-4xl font-black tracking-tighter mb-1">{user.full_name}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-zinc-400 font-medium">
                     <span className="flex items-center gap-2 text-sm"><Mail size={14} /> {user.email}</span>
                     <span className="flex items-center gap-2 text-sm"><MapPin size={14} /> Annaba, Algeria</span>
                     <span className="flex items-center gap-2 text-sm"><Calendar size={14} /> Joined {new Date(user.created_at).getFullYear()}</span>
                  </div>
               </div>
               <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <Badge className="rounded-full px-6 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] bg-white/10 hover:bg-white/20 border-none backdrop-blur-md">
                     {user.role || "Student"}
                  </Badge>
                  {user.level?.includes("PhD") && (
                    <Badge className="rounded-full px-6 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] bg-emerald-500 text-white border-none shadow-lg shadow-emerald-500/20">
                       PhD Candidate
                    </Badge>
                  )}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Column: Stats & Info */}
         <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4">
               {stats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-4 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 shadow-sm group hover:border-primary/20 transition-all">
                     <div className={cn("p-4 rounded-2xl shrink-0 group-hover:scale-110 transition-transform", stat.bg)}>
                        <stat.icon size={24} className={stat.color} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">{stat.label}</p>
                        <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                     </div>
                  </div>
               ))}
            </div>

            {/* Academic Status */}
            <div className="p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-900">
                     <Layers size={20} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Academic Status</h3>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-3">
                     <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                        <span>Course Completion</span>
                        <span className="text-zinc-900 dark:text-zinc-50">85%</span>
                     </div>
                     <Progress value={85} className="h-2 bg-zinc-100 dark:bg-zinc-900" />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                     <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Language Proficiency</p>
                        <div className="flex items-center gap-2">
                           <BadgeCheck size={16} className="text-emerald-500" />
                           <span className="text-sm font-bold">{user.language || "English / French"}</span>
                        </div>
                     </div>
                     <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Thesis Tracking</p>
                        <div className="flex items-center gap-2">
                           <FileText size={16} className="text-indigo-500" />
                           <span className="text-sm font-bold">{user.level?.includes("PhD") ? "Active Research" : "Not Started"}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column: Documents & Certificates */}
         <div className="lg:col-span-2 space-y-8">
            {/* Document Management Section */}
            <div className="p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 shadow-xl shadow-zinc-200/20 dark:shadow-none">
               <UserDocuments />
            </div>

            {/* Admin Advice / Recommendation */}
            <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                  <Award size={120} />
               </div>
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Briefcase size={24} />
                     </div>
                     <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Career & Mobility Guidance</h4>
                  </div>
                  <p className="text-lg font-medium leading-relaxed max-w-xl">
                     "Your current academic standing and uploaded certifications place you in the <span className="font-black underline decoration-emerald-400 underline-offset-4">Top 10%</span> of eligible candidates for international mobility. Keep your dossier updated for upcoming internship opportunities."
                  </p>
                  <div className="flex gap-4">
                     <Badge variant="outline" className="border-white/30 text-white hover:bg-white/10 cursor-pointer">View Opportunities</Badge>
                     <Badge variant="outline" className="border-white/30 text-white hover:bg-white/10 cursor-pointer">Contact Supervisor</Badge>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
