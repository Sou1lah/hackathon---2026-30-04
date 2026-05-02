import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Zap, Sparkles, FileText, ArrowLeft, Globe, Plus } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import AddInternshipForm from "@/components/Admin/AddInternshipForm"
import RecommendationForm, { RecommendationResponse } from "@/components/Mobility/RecommendationForm"
import DemandeStage from "@/components/Mobility/DemandeStage"
import InternshipOffers from "@/components/Internships/InternshipOffers"
import useAuth from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useApplyInternship } from "@/hooks/useApplyInternship"

export const Route = createFileRoute("/_layout/stages")({
  component: StagesPage,
  head: () => ({
    meta: [{ title: "Internship Hub – UBMA" }],
  }),
})

function ResultsPanel({ data, onBack }: { data: RecommendationResponse; onBack: () => void }) {
  const applyMutation = useApplyInternship()

  return (
    <div className="w-full px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-8">
        <div className="space-y-2">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-500 hover:text-indigo-600 transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to all offers
          </button>
          <h1 className="text-[42px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-4 leading-[1.1]">
            <Sparkles className="text-indigo-500 h-8 w-8" />
            Personalized Matches
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-[600px] leading-relaxed">
            Based on your profile and preferences, we found these opportunities for you.
          </p>
        </div>
        <Badge variant="secondary" className="px-6 py-2 rounded-full font-mono text-xs tracking-widest">
          {data.results.length} MATCHES FOUND
        </Badge>
      </div>

      {data.is_fallback && (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shadow-none">
          <CardContent className="py-6">
            <p className="text-zinc-600 dark:text-zinc-400 italic text-center">
              {data.message || "We couldn't find exact matches for all your criteria, but here are the closest results."}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.results.map((rec, i) => (
          <motion.div
            key={rec.offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-md hover:shadow-xl group bg-white dark:bg-zinc-950 flex flex-col overflow-hidden rounded-[1.5rem]">
              <div className="relative w-full h-[180px] shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={`/flags/${(() => {
                    const emojiToCode: Record<string, string> = {
                      "🇩🇿": "dz", "🇫🇷": "fr", "🇩🇪": "de", "🇺🇸": "us", "🇮🇩": "id",
                      "🇪🇸": "es", "🇬🇧": "gb", "🇨🇦": "ca", "🇮🇹": "it", "🇨🇭": "ch",
                      "🇧🇪": "be", "🇳🇱": "nl", "🇨🇳": "cn", "🇯🇵": "jp", "🇮🇳": "in",
                      "🇹🇷": "tr", "🇧🇷": "br", "🇦🇺": "au", "🇸🇦": "sa", "🇦🇪": "ae",
                      "🇲🇦": "ma", "🇹🇳": "tn", "🇪🇬": "eg", "🌎": "un"
                    }
                    return emojiToCode[rec.offer.country_flag || ""] || rec.offer.country_code?.toLowerCase() || "dz"
                  })()}.png`}
                  alt={rec.offer.country ?? "Flag"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 via-transparent to-transparent z-10" />
                
                <div className="absolute top-4 left-4 z-20">
                  <Badge
                    variant="outline"
                    className="font-mono text-[9px] px-2 py-0.5 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-full"
                  >
                    {Math.round(rec.score)}% MATCH
                  </Badge>
                </div>

                {rec.offer.university_logo && (
                  <div className="absolute bottom-4 right-4 z-20 h-10 w-10 rounded-lg bg-white dark:bg-zinc-800 p-1 shadow-lg border border-zinc-100 dark:border-zinc-900">
                    <img 
                      src={rec.offer.university_logo} 
                      alt={rec.offer.university_name ?? ""} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              <CardHeader className="pb-2 pt-4 px-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant={rec.offer.mobility_type === "international" ? "default" : "secondary"}
                    className="text-[8px] uppercase tracking-wider rounded-full px-2"
                  >
                    {rec.offer.mobility_type}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <Globe size={10} />
                    {rec.offer.country}
                  </div>
                </div>
                <CardTitle className="text-xl leading-tight font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {rec.offer.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 px-6">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {rec.offer.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {rec.offer.keywords?.slice(0, 3).map((k) => (
                    <Badge
                      key={k}
                      variant="secondary"
                      className="bg-zinc-50 dark:bg-zinc-900 border-none text-[8px] font-medium text-zinc-400 px-2 py-0"
                    >
                      #{k}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-zinc-50 dark:border-zinc-900 p-6 pt-4 mt-auto gap-2">
                <a
                  href={rec.offer.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-9 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-zinc-200 dark:border-zinc-800"
                >
                  Details
                </a>
                <Button
                  onClick={() => applyMutation.mutate(rec.offer)}
                  disabled={applyMutation.isPending}
                  className="flex-1 h-9 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-widest shadow-lg hover:opacity-90 transition-all"
                >
                  {applyMutation.isPending ? "..." : "Apply"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function StagesPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<RecommendationResponse | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const [showAdminForm, setShowAdminForm] = useState(
    user?.is_superuser || user?.can_review_applications || user?.role?.startsWith("prof_")
  )

  const handleResults = (data: RecommendationResponse) => {
    setResults(data)
    setSheetOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Toggle for Admins
  const isAdmin = user?.is_superuser || user?.can_review_applications || user?.role?.startsWith("prof_")

  if (isAdmin && showAdminForm) {
    return (
      <div className="relative">
        <div className="max-w-5xl mx-auto px-4 pt-8 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => setShowAdminForm(false)}
            className="rounded-full gap-2 font-bold text-[10px] uppercase tracking-widest border-zinc-200 dark:border-zinc-800"
          >
            <Sparkles size={14} /> Switch to Student View
          </Button>
        </div>
        <AddInternshipForm />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {isAdmin && !showAdminForm && (
        <div className="max-w-7xl mx-auto px-4 pt-8 flex justify-end absolute top-0 right-0 z-10">
          <Button 
            onClick={() => setShowAdminForm(true)}
            className="rounded-full gap-2 font-bold text-[10px] uppercase tracking-widest bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 shadow-xl"
          >
            <Plus size={14} /> Back to Admin Console
          </Button>
        </div>
      )}
      <AnimatePresence mode="wait">
        {results ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ResultsPanel data={results} onBack={() => setResults(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="offers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pb-24"
          >
            <InternshipOffers />
            
            <div className="w-full px-6 mt-20 border-t border-zinc-100 dark:border-zinc-900 pt-20">
               <div className="flex items-center gap-4 mb-10">
                 <FileText className="text-indigo-500 h-8 w-8" />
                 <h2 className="text-[32px] font-extrabold tracking-tight">Submit Manual Request</h2>
               </div>
               <DemandeStage />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Action Button ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <div className="fixed bottom-8 right-8 z-50">
            {!results && (
              <span className="absolute inset-0 rounded-full bg-zinc-900 dark:bg-zinc-50 opacity-20 animate-ping" />
            )}
            <Button
              size="lg"
              className="relative h-16 w-16 rounded-full shadow-2xl bg-zinc-900 hover:bg-zinc-800 text-white border-4 border-white dark:border-zinc-950 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-transform hover:scale-110 flex items-center justify-center p-0"
              title="Smart Match Recommendations"
            >
              <Zap className="h-7 w-7" fill="currentColor" />
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[95vw] sm:max-w-4xl overflow-y-auto p-0 border-l border-zinc-200 dark:border-zinc-800"
        >
          <div className="p-8 pb-32">
            <RecommendationForm onResults={handleResults} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

