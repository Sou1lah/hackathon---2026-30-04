import { useMutation } from "@tanstack/react-query"
import {
  ArrowRight,
  Briefcase,
  Globe,
  Lock,
  Mail,
  Search,
  Sparkles,
  Tag,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type React from "react"
import { useState } from "react"
import { OpenAPI } from "@/client/core/OpenAPI"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

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
  breakdown?: Record<string, number>
  warnings?: string[]
}

interface RecommendationResponse {
  results: RecommendationResult[]
  is_fallback: boolean
  message: string | null
}

const INTEREST_OPTIONS = [
  "AI",
  "Networking",
  "Software",
  "Data Science",
  "Security",
  "Cloud",
  "Mobile",
  "UI/UX",
]

export default function RecommendationForm() {
  const { user } = useAuth()
  const [mobility, setMobility] = useState<string>("both")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [duration, setDuration] = useState<string>("")
  const [specialty, setSpecialty] = useState<string>("")
  const [level, setLevel] = useState<string>("")
  const [language, setLanguage] = useState<string>("")
  const [gpa, setGpa] = useState<string>("")
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [debugMode, setDebugMode] = useState(false)

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(
        `${OpenAPI.BASE}/api/v1/recommendations/stage-request?debug=${debugMode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(data),
        },
      )
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
      specialty: specialty || undefined,
      level: level || undefined,
      language: language || undefined,
      gpa: gpa ? parseFloat(gpa) : undefined,
    })
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    )
  }

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Demande de Stage & Recommandations
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Soumettez votre demande pour obtenir des opportunités
            personnalisées.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-bold animate-pulse">
            <Sparkles size={18} />
            <span>Moteur de Match v1.0</span>
          </div>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={debugMode}
                onChange={() => setDebugMode(!debugMode)}
              />
              <div
                className={`block w-10 h-6 rounded-full transition-colors ${debugMode ? "bg-amber-500" : "bg-accent border border-border"}`}
              />
              <div
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${debugMode ? "transform translate-x-4" : ""}`}
              />
            </div>
            <div className="ml-3 text-sm font-bold text-muted-foreground flex items-center gap-1">
              Debug Mode{" "}
              {debugMode && <span className="text-amber-500">ON</span>}
            </div>
          </label>
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
                  {user.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
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
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Email Académique
                  </label>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mail size={14} className="text-primary" /> {user.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Préférence Système
                  </label>
                  <p className="text-sm font-medium flex items-center gap-2 uppercase">
                    <Globe size={14} className="text-primary" />{" "}
                    {user.mobility_preference || "National"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Intérêts Inferred
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {user.interest_tags?.length ? (
                      user.interest_tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-accent rounded-md text-[10px] font-bold border border-border"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs italic text-muted-foreground">
                        Aucun tag détecté
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <p className="text-[10px] text-amber-600 font-bold leading-tight">
                  Note: Les données ci-dessus sont extraites de votre session
                  d'authentification et ne peuvent pas être modifiées
                  manuellement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Request Form */}
        <div className="lg:col-span-8 space-y-8">
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-3xl border border-border shadow-xl p-8 space-y-8"
          >
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-sm">
                2
              </span>
              Personnaliser ma recherche
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Globe size={16} className="text-primary" /> Type de Mobilité
                  Souhaitée
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {["national", "international", "both"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMobility(m)}
                      className={cn(
                        "px-4 py-3 rounded-xl border text-left text-sm font-bold transition-all",
                        mobility === m
                          ? "bg-primary text-primary-foreground border-primary shadow-lg"
                          : "bg-accent hover:border-primary/30",
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
                        selectedInterests.includes(interest)
                          ? "bg-primary/20 text-primary border-primary"
                          : "bg-accent border-border hover:border-primary/20",
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold">Spécialité *</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-accent border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <option value="" disabled>Sélectionnez une spécialité</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Management">Management</option>
                  <option value="Électronique">Électronique</option>
                  <option value="Mécanique">Mécanique</option>
                  <option value="Génie Civil">Génie Civil</option>
                  <option value="Biologie">Biologie</option>
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique">Physique</option>
                  <option value="Chimie">Chimie</option>
                  <option value="Lettres et Langues">Lettres et Langues</option>
                  <option value="Droit et Sciences Politiques">Droit et Sciences Politiques</option>
                  <option value="Sciences Économiques">Sciences Économiques</option>
                  <option value="Médecine">Médecine</option>
                  <option value="Pharmacie">Pharmacie</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold">Niveau d'études *</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-accent border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="" disabled>
                    Sélectionnez un niveau
                  </option>
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                  <option value="M1">M1</option>
                  <option value="M2">M2</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold">
                  Langue(s) souhaitée(s) *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 bg-accent border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="" disabled>
                    Sélectionnez une langue
                  </option>
                  <option value="Arabic">Arabic</option>
                  <option value="French">French</option>
                  <option value="English">English</option>
                  <option value="Mixed (Arabic/French)">
                    Mixed (Arabic/French)
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold">Moyenne (GPA/Note)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 14.5, 3.8..."
                  className="w-full px-4 py-3 bg-accent border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold">
                Préférence de durée (Optionnel)
              </label>
              <select
                className="w-full px-4 py-3 bg-accent border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="">Peu importe</option>
                <option value="1-3 mois">1 à 3 mois</option>
                <option value="4-6 mois">4 à 6 mois</option>
                <option value="> 6 mois">Plus de 6 mois</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitMutation.isPending
                ? "Calcul des scores..."
                : "Générer mes Recommandations"}
              {!submitMutation.isPending && <ArrowRight size={20} />}
            </button>
          </form>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {submitMutation.isPending ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center p-12 space-y-4"
              >
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground font-bold animate-pulse">
                  Analyse de votre profil en cours...
                </p>
              </motion.div>
            ) : isSubmitted && recommendations ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Sparkles className="text-primary" /> Résultats du Matching
                  </h2>
                  <span className="text-xs font-bold bg-accent px-3 py-1 rounded-full text-muted-foreground uppercase tracking-widest">
                    {recommendations.results.length} Matchs trouvés
                  </span>
                </div>
                
                {recommendations.is_fallback && (
                  <div className="bg-blue-500/10 border-l-4 border-blue-500 p-6 rounded-r-2xl space-y-2">
                    <h3 className="font-bold text-blue-600 text-lg">Aucun Stage Trouvé</h3>
                    <p className="text-sm text-blue-700/80 font-medium">
                      {recommendations.message}
                    </p>
                  </div>
                )}

                {debugMode && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 space-y-4 mb-8">
                    <h3 className="font-bold text-amber-600 flex items-center gap-2">
                      <Sparkles size={16} /> Panneau d'Évaluation (Ground Truth
                      Test)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                        <div className="text-xs font-bold text-muted-foreground uppercase">
                          Precision @ 5
                        </div>
                        <div className="text-2xl font-black mt-1">
                          {/* Simulated Ground Truth: match rate >= 50% */}
                          {(
                            (recommendations.results
                              .slice(0, 5)
                              .filter((r) => r.score >= 50).length /
                              Math.min(
                                5,
                                Math.max(1, recommendations.results.length),
                              )) *
                            100
                          ).toFixed(0)}
                          %
                        </div>
                      </div>
                      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                        <div className="text-xs font-bold text-muted-foreground uppercase">
                          Precision @ 10
                        </div>
                        <div className="text-2xl font-black mt-1">
                          {(
                            (recommendations.results
                              .slice(0, 10)
                              .filter((r) => r.score >= 50).length /
                              Math.min(
                                10,
                                Math.max(1, recommendations.results.length),
                              )) *
                            100
                          ).toFixed(0)}
                          %
                        </div>
                      </div>
                      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                        <div className="text-xs font-bold text-muted-foreground uppercase">
                          Input Snapshot
                        </div>
                        <div className="text-[10px] mt-1 font-mono text-muted-foreground leading-tight">
                          Spécialité: {specialty || "N/A"}
                          <br />
                          Level: {level || "N/A"}
                          <br />
                          Language: {language || "N/A"}
                          <br />
                          GPA: {gpa || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.results.map((rec, i) => (
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
                          <h4 className="font-bold leading-tight group-hover:text-primary transition-colors">
                            {rec.offer.title}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {rec.offer.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {rec.offer.keywords?.slice(0, 3).map((k) => (
                            <span
                              key={k}
                              className="px-2 py-0.5 bg-accent/50 rounded-md text-[9px] font-bold uppercase border border-border"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                        <div className="pt-4 border-t border-border flex items-center justify-between">
                          <span
                            className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              rec.offer.mobility_type === "international"
                                ? "text-blue-500"
                                : "text-green-500",
                            )}
                          >
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

                        {debugMode && rec.breakdown && (
                          <div className="mt-4 p-3 bg-accent/30 rounded-xl border border-border/50 text-xs font-mono space-y-1">
                            <div className="font-bold text-amber-500 mb-2 border-b border-border pb-1">
                              Debug Breakdown
                            </div>
                            {Object.entries(rec.breakdown).map(([k, v]) => (
                              <div key={k} className="flex justify-between">
                                <span>{k}:</span>
                                <span
                                  className={
                                    v > 0
                                      ? "text-green-500 font-bold"
                                      : "text-muted-foreground"
                                  }
                                >
                                  +{v}
                                </span>
                              </div>
                            ))}
                            {rec.warnings && rec.warnings.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-border/50">
                                <span className="text-red-400 font-bold">
                                  Warnings:
                                </span>
                                <ul className="list-disc pl-4 mt-1">
                                  {rec.warnings.map((w, idx) => (
                                    <li key={idx} className="text-red-400/80">
                                      {w}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
