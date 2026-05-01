import { useQuery } from "@tanstack/react-query"
import {
  Briefcase,
  Calendar,
  ExternalLink,
  Globe,
  RefreshCcw,
  Search,
  Tag,
  Zap,
} from "lucide-react"
import { useState } from "react"
import { OpenAPI } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "motion/react"

import { useApplyInternship } from "@/hooks/useApplyInternship"
import { Sparkles } from "lucide-react"

interface InternshipOffer {
  id: string
  title: string
  description: string | null
  source_url: string
  published_date: string | null
  mobility_type?: string | null
  keywords?: string[] | null
  target_audience?: string | null
}

interface InternshipOffersResponse {
  data: InternshipOffer[]
  count: number
}

const fetchOffers = async (): Promise<InternshipOffersResponse> => {
  const response = await fetch(`${OpenAPI.BASE}/api/v1/internships/`)
  if (!response.ok) throw new Error("Failed to fetch internship offers")
  return response.json()
}

function OfferSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card
          key={i}
          className="border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 overflow-hidden"
        >
          <CardHeader className="pb-2 space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
              <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
            </div>
            <div className="h-6 w-3/4 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
            <div className="h-3 w-5/6 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function InternshipOffers() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["internship-offers"],
    queryFn: fetchOffers,
  })

  const applyMutation = useApplyInternship()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "national" | "international">("all")

  const filtered = (data?.data ?? []).filter((o) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      o.title.toLowerCase().includes(q) ||
      (o.description ?? "").toLowerCase().includes(q) ||
      (o.keywords ?? []).some((k) => k.toLowerCase().includes(q))
    const matchesFilter =
      filter === "all" ||
      (o.mobility_type ?? "").toLowerCase() === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2 font-mono">
            UBMA · INTERNSHIP PORTAL
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Available Internships
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-base">
            Browse all current cooperation and internship opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Badge
            variant="outline"
            className="px-4 py-1.5 font-mono text-[10px] tracking-widest bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
          >
            {data?.count ?? 0} OFFERS
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-zinc-500 gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── AI Hint Banner ── */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="h-10 w-10 rounded-full bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center shrink-0">
          <Zap className="h-5 w-5 text-white dark:text-zinc-900" fill="currentColor" />
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">Looking for the perfect match?</span>{" "}
          Use our{" "}
          <span className="inline-flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-50">
            <Sparkles className="h-3.5 w-3.5" /> Smart Match
          </span>{" "}
          tab to get personalized recommendations based on your CV and preferences.
        </p>
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search internships..."
            className="pl-9 border-zinc-200 dark:border-zinc-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl w-fit">
          {(["all", "national", "international"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                filter === f
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm"
                  : "bg-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              {f === "all" ? "All Offers" : f === "national" ? "National" : "International"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Offers Grid ── */}
      {error ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <p className="text-zinc-500 text-sm">Failed to load internship offers.</p>
          <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : isLoading ? (
        <OfferSkeleton />
      ) : (
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl"
            >
              <Briefcase className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">No offers found</h3>
              <p className="text-sm text-zinc-400 mt-1">
                {search ? "Try adjusting your search." : "Check back later for new opportunities."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((offer, i) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="h-full flex flex-col border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-none hover:shadow-lg transition-all group bg-white dark:bg-zinc-950">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        {offer.mobility_type ? (
                          <Badge
                            variant={offer.mobility_type === "international" ? "default" : "secondary"}
                            className="text-[9px] uppercase tracking-widest rounded-full px-2"
                          >
                            <Globe className="h-2.5 w-2.5 mr-1" />
                            {offer.mobility_type}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase tracking-widest rounded-full px-2 text-zinc-400 border-zinc-200 dark:border-zinc-800"
                          >
                            <Briefcase className="h-2.5 w-2.5 mr-1" />
                            Cooperation
                          </Badge>
                        )}

                        {offer.published_date && (
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3" />
                            {new Date(offer.published_date).toLocaleDateString("fr-DZ", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      <CardTitle
                        className="text-base font-bold leading-snug line-clamp-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors"
                        dir="rtl"
                        lang="ar"
                      >
                        {offer.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-3">
                      {offer.description && (
                        <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
                          {offer.description}
                        </p>
                      )}
                      {offer.keywords && offer.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          <Tag className="h-3 w-3 text-zinc-400 mt-0.5" />
                          {offer.keywords.slice(0, 4).map((k) => (
                            <Badge
                              key={k}
                              variant="secondary"
                              className="bg-zinc-50 dark:bg-zinc-900 border-none text-[9px] font-medium text-zinc-500 px-1.5 py-0"
                            >
                              {k}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-4 border-t border-zinc-50 dark:border-zinc-900 mt-auto flex gap-2">
                      <a
                        href={offer.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-9 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50 transition-all border border-zinc-200 dark:border-zinc-800"
                      >
                        Details <ExternalLink className="h-3 w-3" />
                      </a>
                      <Button
                        onClick={() => applyMutation.mutate(offer)}
                        disabled={applyMutation.isPending}
                        className="flex-1 h-9 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-[10px] font-bold uppercase tracking-widest shadow-sm hover:opacity-90 transition-all"
                      >
                        {applyMutation.isPending ? "Applying..." : "Apply"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

