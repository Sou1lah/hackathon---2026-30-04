import { Lock, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"

export default function TrackingLocked() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute -inset-8 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative bg-white dark:bg-zinc-900 size-40 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-zinc-100 dark:border-zinc-800">
          <Lock size={64} className="text-zinc-300 dark:text-zinc-600" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-3 rounded-2xl shadow-lg border-4 border-white dark:border-zinc-900">
          <ShieldCheck size={28} />
        </div>
      </motion.div>
      
      <div className="space-y-4">
        <Badge variant="outline" className="px-6 py-1.5 text-[10px] uppercase font-black tracking-[0.2em] border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-full">
          Tracking Module Locked
        </Badge>
        <h2 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 italic">
          Access Restricted
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-md mx-auto text-lg">
          The tracking portal is automatically unlocked once your internship application is <span className="text-emerald-600 dark:text-emerald-400 font-bold">accepted</span> and your convention is signed.
        </p>
      </div>

      <div className="pt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Button 
          variant="outline"
          className="h-14 px-10 rounded-2xl font-bold uppercase tracking-widest text-[11px] border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-sm"
          onClick={() => window.location.href = '/dashboard'}
        >
          Return to Dashboard
        </Button>
        <Button 
          className="h-14 px-10 rounded-2xl font-bold uppercase tracking-widest text-[11px] bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:opacity-90 shadow-xl"
          onClick={() => window.location.href = '/stages'}
        >
          View Applications
        </Button>
      </div>
      
      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] pt-12">
        University of Badji Mokhtar — Annaba
      </p>
    </div>
  )
}
