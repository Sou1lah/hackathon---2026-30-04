import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Zap, Sparkles, FileText, ArrowLeft } from "lucide-react"
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
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-8">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to all offers
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-4">
            <Sparkles className="text-zinc-400" />
            Personalized Matches
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
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
            <Card className="h-full border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-md hover:shadow-xl group bg-white dark:bg-zinc-950 flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] px-2 py-0.5 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
                  >
                    {Math.round(rec.score)}% MATCH
                  </Badge>
                  <Badge
                    variant={rec.offer.mobility_type === "international" ? "default" : "secondary"}
                    className="text-[9px] uppercase tracking-wider rounded-full px-2"
                  >
                    {rec.offer.mobility_type}
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-tight font-bold group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                  {rec.offer.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 flex-1">
                <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
                  {rec.offer.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {rec.offer.keywords?.slice(0, 4).map((k) => (
                    <Badge
                      key={k}
                      variant="secondary"
                      className="bg-zinc-50 dark:bg-zinc-900 border-none text-[10px] font-medium text-zinc-500 dark:text-zinc-400 px-2 py-0"
                    >
                      #{k}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-zinc-50 dark:border-zinc-900 pt-6 mt-auto gap-3">
                <a
                  href={rec.offer.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-zinc-200 dark:border-zinc-800"
                >
                  Details
                </a>
                <Button
                  onClick={() => applyMutation.mutate(rec.offer)}
                  disabled={applyMutation.isPending}
                  className="flex-1 h-10 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-[10px] font-bold uppercase tracking-widest shadow-lg hover:opacity-90 transition-all"
                >
                  {applyMutation.isPending ? "Applying..." : "Apply"}
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

  // Admins and Teachers see the "Add Internship" creation form
  if (user?.is_superuser || user?.can_review_applications || user?.role?.startsWith("prof_")) {
    return <AddInternshipForm />
  }

  const handleResults = (data: RecommendationResponse) => {
    setResults(data)
    setSheetOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="relative min-h-screen">
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
            
            <div className="max-w-7xl mx-auto px-4 mt-20 border-t border-zinc-100 dark:border-zinc-900 pt-20">
               <div className="flex items-center gap-3 mb-10">
                 <FileText className="text-zinc-400" />
                 <h2 className="text-2xl font-bold">Submit Manual Request</h2>
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

