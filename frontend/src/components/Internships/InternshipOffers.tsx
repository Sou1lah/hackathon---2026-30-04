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
import { useTranslation } from "react-i18next"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
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
  university_name?: string | null
  university_logo?: string | null
  country_flag?: string | null
  country?: string | null
  country_code?: string | null
  specialty?: string | null
}

interface InternshipOffersResponse {
  data: InternshipOffer[]
  count: number
}

const fetchOffers = async (): Promise<InternshipOffersResponse> => {
  const apiUrl = import.meta.env.VITE_API_URL || ""
  const response = await fetch(`${apiUrl}/api/v1/internships/`)
  if (!response.ok) throw new Error("Failed to fetch internship offers")
  return response.json()
}

function OfferSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map((i) => (
        <Card
          key={i}
          className="border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 overflow-hidden flex flex-col md:flex-row h-full min-h-[320px]"
        >
          <div className="w-full md:w-1/2 bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
          <div className="w-full md:w-1/2 p-6 space-y-4">
            <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
            <div className="h-8 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
              <div className="h-3 w-5/6 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
              <div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
            </div>
          </div>
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
  const { user } = useAuth()
  const isAdmin = user?.is_superuser || user?.can_review_applications || false
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "national" | "international">("all")

  const filtered = (data?.data ?? []).filter((o) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      o.title.toLowerCase().includes(q) ||
      (o.description ?? "").toLowerCase().includes(q) ||
      (o.keywords ?? []).some((k) => k.toLowerCase().includes(q)) ||
      (o.university_name ?? "").toLowerCase().includes(q)
    const matchesFilter =
      filter === "all" ||
      (o.mobility_type ?? "").toLowerCase() === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="w-full px-6 space-y-[12px] bg-background min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-row justify-between items-start mb-6">
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-2 font-mono">
            UBMA · GLOBAL MOBILITY
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Internship Hub
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-[600px] leading-relaxed font-medium">
            Discover and track internships from top Algerian and international universities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-9 px-4 rounded-lg bg-background text-[13px] font-medium shadow-sm gap-2"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh List
          </Button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px] mb-[24px]">
        <div className="bg-card border border-border rounded-xl p-[14px_16px] flex flex-col justify-between h-[100px]">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-400">Total Offers</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-foreground">{data?.count ?? 0}</span>
            <span className="text-[11px] text-zinc-400 font-medium">Available</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-[14px_16px] flex flex-col justify-between h-[100px]">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-400">International</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-primary">
              {data?.data.filter(o => o.mobility_type === 'international').length ?? 0}
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">Global Scope</span>
          </div>
        </div>

        <div className="bg-primary text-primary-foreground rounded-xl p-[14px_16px] flex items-center gap-4 h-[100px]">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-primary-foreground" fill="currentColor" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-500">Quick Match</span>
            <p className="text-[13px] font-medium text-white leading-tight">Use AI to find your fit</p>
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col items-center gap-8 py-8">
        {/* Navigation Filters */}
        <div className="flex bg-muted p-1.5 rounded-[1.25rem] w-fit shadow-inner border border-border">
          {(["all", "national", "international"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${filter === f
                ? "bg-background text-foreground shadow-lg scale-[1.02]"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        {/* Big Middle Search Bar */}
        <div className="relative w-full max-w-3xl group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] opacity-20 blur transition duration-1000 group-hover:opacity-40 group-hover:duration-200"></div>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search by title, university, or keywords..."
              className="pl-16 h-20 text-xl border-border rounded-[2rem] bg-card shadow-2xl focus-visible:ring-offset-0 focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1 text-[10px] uppercase font-mono tracking-tighter opacity-50">
                ESC TO CLEAR
              </Badge>
            </div>
          </div>
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
              <h3 className="text-lg font-semibold text-foreground">No offers found</h3>
              <p className="text-sm text-zinc-400 mt-1">
                {search ? "Try adjusting your search terms." : "New opportunities are added daily."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filtered.map((offer, i) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="h-full"
                >
                  <Card className="h-full flex flex-col border-border hover:border-primary/50 shadow-none hover:shadow-2xl transition-all duration-500 group bg-card overflow-hidden min-h-[550px] rounded-[2rem]">
                    {/* ── Top Photo with Fade ── */}
                    <div className="relative w-full h-[240px] shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                      <img
                        src={`/flags/${(() => {
                          const emojiToCode: Record<string, string> = {
                            "🇩🇿": "dz", "🇫🇷": "fr", "🇩🇪": "de", "🇺🇸": "us", "🇮🇩": "id",
                            "🇪🇸": "es", "🇬🇧": "gb", "🇨🇦": "ca", "🇮🇹": "it", "🇨🇭": "ch",
                            "🇧🇪": "be", "🇳🇱": "nl", "🇨🇳": "cn", "🇯🇵": "jp", "🇮🇳": "in",
                            "🇹🇷": "tr", "🇧🇷": "br", "🇦🇺": "au", "🇸🇦": "sa", "🇦🇪": "ae",
                            "🇲🇦": "ma", "🇹🇳": "tn", "🇪🇬": "eg", "🌎": "un"
                          }
                          return emojiToCode[offer.country_flag || ""] || offer.country_code?.toLowerCase() || "dz"
                        })()}.png`}
                        alt={offer.country ?? "Flag"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />

                      {/* The Fade Below */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />

                      {/* Overlays */}
                      <div className="absolute top-4 left-4 z-20">
                        <div className="flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border rounded-full px-3 py-1.5 shadow-xl">
                          <span className="text-lg">{offer.country_flag}</span>
                          <span className="text-[9px] font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em]">{offer.mobility_type}</span>
                        </div>
                      </div>

                      {offer.university_logo && (
                        <div className="absolute bottom-4 right-4 z-20 h-12 w-12 rounded-xl bg-white dark:bg-zinc-800 p-1.5 shadow-xl border border-zinc-200 dark:border-zinc-800">
                          <img
                            src={offer.university_logo}
                            alt={offer.university_name ?? ""}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* ── Card Content ── */}
                    <div className="flex-1 p-8 pt-2 flex flex-col relative z-20">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {offer.published_date
                            ? new Date(offer.published_date).toLocaleDateString("en-US", { day: 'numeric', month: 'short' })
                            : "New"}
                        </span>
                        <div className="flex items-center gap-2">
                          <Globe size={12} className="text-muted-foreground" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{offer.country}</span>
                        </div>
                      </div>

                      <CardTitle className="text-xl leading-tight font-bold group-hover:text-primary transition-colors line-clamp-2">
                        {offer.title}
                      </CardTitle>

                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-6 leading-relaxed flex-grow">
                        {offer.description}
                      </p>

                      <div className="flex flex-col gap-4 mt-auto">
                        {offer.keywords && offer.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {offer.keywords.slice(0, 3).map((k) => (
                              <Badge key={k} variant="secondary" className="bg-muted text-muted-foreground border-none text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                                #{k}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 pt-6 border-t border-border">
                          <Button
                            onClick={() => applyMutation.mutate(offer)}
                            disabled={applyMutation.isPending || isAdmin}
                            className={cn(
                              "h-12 flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all",
                              isAdmin 
                                ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none border border-border" 
                                : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg"
                            )}
                          >
                            {isAdmin ? "Admin View" : applyMutation.isPending ? "..." : "Apply"}
                          </Button>
                          <a
                            href={offer.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-12 px-4 rounded-xl bg-muted hover:bg-accent/10 text-foreground flex items-center justify-center transition-all border border-border"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      </div>
                    </div>
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

