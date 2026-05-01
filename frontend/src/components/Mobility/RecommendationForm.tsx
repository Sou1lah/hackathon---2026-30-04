import React, { useState } from "react"
import {
  Globe,
  Tag,
  Search,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Briefcase,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import useAuth from "@/hooks/useAuth"
import { useMutation } from "@tanstack/react-query"
import { OpenAPI } from "@/client/core/OpenAPI"

interface InternshipOffer {
  id: string
  title: string
  description: string
  source_url: string
  target_audience: string
  mobility_type: string
  keywords: string[]
}

interface RecommendationResult {
  offer: InternshipOffer
  score: number
}

const INTEREST_OPTIONS = ["AI", "Networking", "Software", "Data Science", "Security", "Cloud", "Mobile", "UI/UX"]

export default function RecommendationForm() {
  const { user } = useAuth()
  const [mobility, setMobility] = useState<string>("both")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [duration, setDuration] = useState<string>("")
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${OpenAPI.BASE}/api/v1/recommendations/stage-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to fetch recommendations")
      return response.json()
    },
    onSuccess: (data) => {
      setRecommendations(data)
      setIsSubmitted(true)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitMutation.mutate({
      selected_mobility_type: mobility,
      selected_interests: selectedInterests,
      duration_preference: duration,
    })
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    )
  }

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Système de Recommandation de Stage
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Connectez votre profil académique aux meilleures opportunités de mobilité.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-bold animate-pulse">
          <Sparkles size={18} />
          <span>Moteur de Match v1.0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Step 1: Read-Only Profile */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4">
               <Lock className="text-muted-foreground/30" size={20} />
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center font-black text-2xl border border-border group-hover:scale-105 transition-transform">
                  {user.full_name?.split(" ").map(n => n[0]).join("") || "U"}
                </div>
                <div>
                  <h3 className="font-bold text-xl">{user.full_name}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
                    <Briefcase size={12} /> {user.role?.replace("_", " ")}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Email Académique</label>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mail size={14} className="text-primary" /> {user.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Préférence Système</label>
                  <p className="text-sm font-medium flex items-center gap-2 uppercase">
                    <Globe size={14} className="text-primary" /> {user.mobility_preference || "National"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Intérêts Inferred</label>
                  <div className="flex flex-wrap gap-2">
                    {user.interest_tags?.length ? user.interest_tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-accent rounded-md text-[10px] font-bold border border-border">
                        {tag}
                      </span>
                    )) : <span className="text-xs italic text-muted-foreground">Aucun tag détecté</span>}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <p className="text-[10px] text-amber-600 font-bold leading-tight">
                  Note: Les données ci-dessus sont extraites de votre session d'authentification et ne peuvent pas être modifiées manuellement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Request Form */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleSubmit} className="bg-card rounded-3xl border border-border shadow-xl p-8 space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-sm">2</span>
              Personnaliser ma recherche
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Globe size={16} className="text-primary" /> Type de Mobilité Souhaitée
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {["national", "international", "both"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMobility(m)}
                      className={cn(
                        "px-4 py-3 rounded-xl border text-left text-sm font-bold transition-all",
                        mobility === m ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-accent hover:border-primary/30"
                      )}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Tag size={16} className="text-primary" /> Domaines d'Intérêt
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        "px-3 py-2 rounded-xl border text-xs font-bold transition-all",
                        selectedInterests.includes(interest) ? "bg-primary/20 text-primary border-primary" : "bg-accent border-border hover:border-primary/20"
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold">Préférence de durée (Optionnel)</label>
              <input
                type="text"
                placeholder="Ex: 4-6 mois, Été 2026..."
                className="w-full px-4 py-3 bg-accent border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitMutation.isPending ? "Calcul des scores..." : "Générer mes Recommandations"}
              {!submitMutation.isPending && <ArrowRight size={20} />}
            </button>
          </form>

          {/* Results Area */}
          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Sparkles className="text-primary" /> Résultats du Matching
                  </h2>
                  <span className="text-xs font-bold bg-accent px-3 py-1 rounded-full text-muted-foreground uppercase tracking-widest">
                    {recommendations.length} Matchs trouvés
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((rec, i) => (
                    <motion.div
                      key={rec.offer.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card rounded-3xl border border-border shadow-lg p-6 hover:border-primary transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-2xl font-black text-xs">
                        {Math.round(rec.score)}% Match
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-accent rounded-lg text-primary">
                             <Search size={20} />
                           </div>
                           <h4 className="font-bold leading-tight group-hover:text-primary transition-colors">{rec.offer.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{rec.offer.description}</p>
                        <div className="flex flex-wrap gap-2">
                           {rec.offer.keywords?.slice(0, 3).map(k => (
                             <span key={k} className="px-2 py-0.5 bg-accent/50 rounded-md text-[9px] font-bold uppercase border border-border">
                               {k}
                             </span>
                           ))}
                        </div>
                        <div className="pt-4 border-t border-border flex items-center justify-between">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            rec.offer.mobility_type === "international" ? "text-blue-500" : "text-green-500"
                          )}>
                            {rec.offer.mobility_type}
                          </span>
                          <a
                            href={rec.offer.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold flex items-center gap-1 hover:underline text-primary"
                          >
                            Détails <ArrowRight size={14} />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
