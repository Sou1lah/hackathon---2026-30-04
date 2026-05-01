import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { ArrowRight, Globe, Lock, Mail, Sparkles, Tag } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type React from "react"
import { useState } from "react"
import { OpenAPI } from "@/client/core/OpenAPI"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const [recommendations, setRecommendations] =
    useState<RecommendationResponse | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [isFakingLoading, setIsFakingLoading] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
    },
  })

  const applyMutation = useMutation({
    mutationFn: async (offer: InternshipOffer) => {
      const token = localStorage.getItem("access_token")

      // 1. Create Internship Request
      const irResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/internship-requests/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            student_name: user?.full_name || "Etudiant",
            registration_number: "AUTO-GEN",
            mission_title: offer.title,
            mission_description: offer.description,
            status: "pending_signature",
            verification_status: "verified",
            progress: 25,
            current_step: 1,
          }),
        },
      )
      if (!irResponse.ok) throw new Error("Failed to create internship request")
      const ir = await irResponse.json()

      // 2. Create Convention
      const convResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            document_name: `Convention_${offer.title.replace(/\s+/g, "_")}.pdf`,
            internship_request_id: ir.id,
            status: "pending",
          }),
        },
      )
      if (!convResponse.ok) throw new Error("Failed to create convention")
      return await convResponse.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-conventions"] })
      navigate({ to: "/convention" })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Hide old results immediately
    setRecommendations(null)
    setIsSubmitted(false)
    setIsFakingLoading(true)

    // Simulate minimum 2 seconds loading
    const startTime = Date.now()

    submitMutation.mutate(
      {
        selected_mobility_type: mobility,
        selected_interests: selectedInterests,
        duration_preference: duration,
        specialty: specialty || undefined,
        level: level || undefined,
        language: language || undefined,
        gpa: gpa ? parseFloat(gpa) : undefined,
      },
      {
        onSuccess: () => {
          const elapsedTime = Date.now() - startTime
          const remainingTime = Math.max(0, 2000 - elapsedTime)

          setTimeout(() => {
            setIsFakingLoading(false)
            setIsSubmitted(true)
          }, remainingTime)
        },
        onError: () => {
          setIsFakingLoading(false)
        },
      },
    )
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    )
  }

  const RecommendationSkeleton = () => (
    <div className="mt-12 space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4">
        <div className="h-8 w-64 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-lg" />
        <div className="h-6 w-20 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card
            key={i}
            className="h-64 border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 overflow-hidden"
          >
            <CardHeader className="pb-2 space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
                <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
              </div>
              <div className="h-6 w-3/4 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
              <div className="h-3 w-5/6 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="h-4 w-12 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
                <div className="h-4 w-12 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4">
      {/* Header - Geist Aesthetic */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Internship Request & Recommendations
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">
            Submit your request to get personalized opportunities.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 font-mono text-[10px] tracking-widest"
          >
            <Sparkles size={14} className="text-zinc-400" />
            MATCHING ENGINE V1.0
          </Badge>

          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={debugMode}
                onChange={() => setDebugMode(!debugMode)}
              />
              <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-50" />
              <span className="ml-3 text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                Debug
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Step 1: Read-Only Profile */}
        <div className="lg:col-span-4">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-none sticky top-8">
            <CardHeader className="relative">
              <div className="absolute top-4 right-4">
                <Lock className="text-zinc-300 dark:text-zinc-700" size={16} />
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 font-bold text-xl">
                    {user.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{user.full_name}</CardTitle>
                  <CardDescription className="font-mono text-[10px] uppercase tracking-widest mt-1">
                    {user.role?.replace("_", " ")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                    Academic Email
                  </Label>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <Mail size={14} className="text-zinc-400" /> {user.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                    System Preference
                  </Label>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 flex items-center gap-2 uppercase">
                    <Globe size={14} className="text-zinc-400" />{" "}
                    {user.mobility_preference || "National"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                    Inferred Interests
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {user.interest_tags?.length ? (
                      user.interest_tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-none text-[9px] font-bold"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs italic text-zinc-400">
                        No tags detected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg">
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                  Note: The data above is extracted from your authentication
                  session and cannot be changed manually.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step 2: Request Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-none">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-sm font-mono font-bold">
                    01
                  </span>
                  Customize my search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Globe size={16} className="text-zinc-400" /> Desired
                      Mobility Type
                    </Label>
                    <div className="flex flex-col gap-2">
                      {["national", "international", "both"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMobility(m)}
                          className={cn(
                            "px-4 py-2.5 rounded-lg border text-left text-sm font-medium transition-all",
                            mobility === m
                              ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-50 shadow-sm"
                              : "bg-transparent border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600",
                          )}
                        >
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Tag size={16} className="text-zinc-400" /> Areas of
                      Interest
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                            selectedInterests.includes(interest)
                              ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-50 shadow-sm"
                              : "bg-transparent border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600",
                          )}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Specialty *
                    </Label>
                    <select
                      required
                      className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-zinc-900/10 dark:focus-visible:ring-zinc-50/10"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                    >
                      <option value="" disabled>
                        Select a specialty
                      </option>
                      <option value="Informatique">Computer Science</option>
                      <option value="Management">Management</option>
                      <option value="Electronique">Electronics</option>
                      <option value="Mecanique">Mechanical Engineering</option>
                      <option value="Genie Civil">Civil Engineering</option>
                      <option value="Biologie">Biology</option>
                      <option value="Mathematiques">Mathematics</option>
                      <option value="Physique">Physics</option>
                      <option value="Chimie">Chemistry</option>
                      <option value="Lettres et Langues">
                        Letters and Languages
                      </option>
                      <option value="Droit et Sciences Politiques">
                        Law and Political Science
                      </option>
                      <option value="Sciences Economiques">Economics</option>
                      <option value="Medecine">Medicine</option>
                      <option value="Pharmacie">Pharmacy</option>
                      <option value="Architecture">Architecture</option>
                      <option value="Autre">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Academic Level *
                    </Label>
                    <select
                      required
                      className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-zinc-900/10 dark:focus-visible:ring-zinc-50/10"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      <option value="" disabled>
                        Select a level
                      </option>
                      <option value="L1">L1</option>
                      <option value="L2">L2</option>
                      <option value="L3">L3</option>
                      <option value="M1">M1</option>
                      <option value="M2">M2</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Desired Language(s) *
                    </Label>
                    <select
                      required
                      className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-zinc-900/10 dark:focus-visible:ring-zinc-50/10"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="" disabled>
                        Select a language
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

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Grade (GPA/Average)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 14.5, 3.8..."
                      className="border-zinc-200 dark:border-zinc-800"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Duration Preference (Optional)
                  </Label>
                  <select
                    className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-zinc-900/10 dark:focus-visible:ring-zinc-50/10"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="1-3 mois">1 to 3 months</option>
                    <option value="4-6 mois">4 to 6 months</option>
                    <option value="> 6 mois">Over 6 months</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter className="pt-6">
                <Button
                  type="submit"
                  disabled={isFakingLoading}
                  className="w-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:opacity-90 py-6 rounded-xl text-md font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  {isFakingLoading
                    ? "Calculating scores..."
                    : "Generate my Recommendations"}
                  {!isFakingLoading && (
                    <ArrowRight size={18} className="ml-2" />
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>

      {/* Dedicated Results Area - Full Width */}
      <AnimatePresence mode="wait">
        {isFakingLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-8"
          >
            <RecommendationSkeleton />
          </motion.div>
        ) : isSubmitted && recommendations ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 100 }}
            className="pt-8 space-y-10"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-6">
              <h2 className="text-3xl font-bold flex items-center gap-3 text-zinc-900 dark:text-zinc-50">
                <Sparkles className="text-zinc-400" size={24} /> Matching
                Results
              </h2>
              <Badge
                variant="secondary"
                className="px-4 py-1 font-mono text-xs tracking-widest bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-none"
              >
                {recommendations.results.length} MATCHES FOUND
              </Badge>
            </div>

            {recommendations.is_fallback && (
              <Card className="border-l-4 border-l-zinc-900 dark:border-l-zinc-50 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-none">
                <CardContent className="py-6">
                  <h3 className="font-bold text-lg mb-1">
                    No Internship Found
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {recommendations.message}
                  </p>
                </CardContent>
              </Card>
            )}

            {debugMode && (
              <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20 shadow-none">
                <CardHeader>
                  <CardTitle className="text-sm font-mono uppercase tracking-widest text-amber-700 dark:text-amber-500 flex items-center gap-2">
                    <Sparkles size={14} /> Ground Truth Evaluation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-amber-200 dark:border-amber-900/50">
                      <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        Precision @ 5
                      </div>
                      <div className="text-2xl font-mono font-bold mt-1 text-zinc-900 dark:text-zinc-50">
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
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-amber-200 dark:border-amber-900/50">
                      <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        Precision @ 10
                      </div>
                      <div className="text-2xl font-mono font-bold mt-1 text-zinc-900 dark:text-zinc-50">
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
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-amber-200 dark:border-amber-900/50">
                      <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        Input Snapshot
                      </div>
                      <div className="text-[9px] mt-1 font-mono text-zinc-500 leading-tight">
                        SPEC: {specialty || "N/A"} | LVL: {level || "N/A"}
                        <br />
                        LANG: {language || "N/A"} | GPA: {gpa || "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.results.map((rec, i) => (
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
                          variant={
                            rec.offer.mobility_type === "international"
                              ? "default"
                              : "secondary"
                          }
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

                      {debugMode && rec.breakdown && (
                        <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 text-[10px] font-mono space-y-1">
                          <div className="font-bold text-zinc-400 mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-1 uppercase tracking-widest">
                            Score Breakdown
                          </div>
                          {Object.entries(rec.breakdown).map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="text-zinc-500">{k}:</span>
                              <span
                                className={
                                  v > 0
                                    ? "text-emerald-500 font-bold"
                                    : "text-zinc-400"
                                }
                              >
                                +{v}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t border-zinc-50 dark:border-zinc-900 pt-6 mt-auto gap-3">
                      <a
                        href={rec.offer.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-zinc-200 dark:border-zinc-800"
                      >
                        Details <ArrowRight size={12} />
                      </a>
                      <Button
                        onClick={() => applyMutation.mutate(rec.offer)}
                        disabled={applyMutation.isPending}
                        className="flex-1 h-10 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-[10px] font-bold uppercase tracking-widest shadow-lg hover:opacity-90 transition-all"
                      >
                        {applyMutation.isPending ? "Processing..." : "Apply"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
