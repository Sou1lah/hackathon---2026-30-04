import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  FileText,
  Globe,
  Info,
  Sparkles,
  Tag,
  Upload,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRef, useState } from "react"
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
import useAuth from "@/hooks/useAuth"
import { useApplyInternship } from "@/hooks/useApplyInternship"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const STORAGE_KEY = "rec_form_prefs"

export interface InternshipOffer {
  id: string
  title: string
  description: string
  source_url: string
  target_audience: string
  mobility_type: string
  keywords: string[]
}

export interface RecommendationResult {
  offer: InternshipOffer
  score: number
  breakdown?: Record<string, number>
  warnings?: string[]
}

export interface RecommendationResponse {
  results: RecommendationResult[]
  is_fallback: boolean
  message: string | null
}

const INTEREST_OPTIONS = [
  "AI",
  "Machine Learning",
  "Data Science",
  "Software Engineering",
  "Web Development",
  "Mobile Dev",
  "UI/UX Design",
  "Cybersecurity",
  "Cloud Computing",
  "DevOps",
  "Embedded Systems",
  "IoT",
  "Networking",
  "Medicine",
  "Pharmacy",
  "Biology",
  "Marketing",
  "Management",
  "Finance",
  "Mechanical Engineering",
  "Electronics",
]

interface RecommendationFormProps {
  onResults?: (data: RecommendationResponse) => void
}

export default function RecommendationForm({ onResults }: RecommendationFormProps = {}) {
  const { user } = useAuth()

  // ── Load saved preferences ──────────────────────────────────────────────
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") } catch { return null }
  })()

  const [mobility, setMobility] = useState<string>(saved?.mobility ?? user?.mobility_preference ?? "both")
  const [selectedInterests, setSelectedInterests] = useState<string[]>(() => {
    if (saved?.selectedInterests) return saved.selectedInterests
    if (user?.interest_tags) {
      return user.interest_tags.filter(tag => INTEREST_OPTIONS.includes(tag))
    }
    return []
  })
  const [duration, setDuration] = useState<string>(saved?.duration ?? "")
  const [specialty, setSpecialty] = useState<string>(saved?.specialty ?? user?.specialty ?? "")
  const [level, setLevel] = useState<string>(saved?.level ?? user?.level ?? "")
  const [language, setLanguage] = useState<string>(saved?.language ?? user?.language ?? "")
  const [gpa, setGpa] = useState<string>(saved?.gpa ?? (user?.gpa ? String(user.gpa) : ""))
  const [rememberMe, setRememberMe] = useState<boolean>(!!saved)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [autoFilled, setAutoFilled] = useState<string[]>([])
  const [pendingExtraction, setPendingExtraction] = useState<Record<string, any> | null>(null)
  const [showExtractionModal, setShowExtractionModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [recommendations, setRecommendations] =
    useState<RecommendationResponse | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [isFakingLoading, setIsFakingLoading] = useState(false)

  // ── File helpers ────────────────────────────────────────────────────────
  const addFiles = async (files: FileList | null) => {
    if (!files) return
    const pdfs = Array.from(files).filter(f => f.type === "application/pdf")
    if (!pdfs.length) return

    setUploadedFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...pdfs.filter(f => !existing.has(f.name))]
    })

    // ── Auto-extract from PDFs ──────────────────────────────────────────
    setIsExtracting(true)
    try {
      const form = new FormData()
      pdfs.forEach(f => form.append("files", f))
      const resp = await fetch(
        `${OpenAPI.BASE}/api/v1/pdf/extract`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
          body: form,
        },
      )
      if (resp.ok) {
        const { extracted } = await resp.json() as { extracted: Record<string, any> }
        if (Object.keys(extracted).length > 0) {
          setPendingExtraction(extracted)
          setShowExtractionModal(true)
        }
      }
    } catch (e) {
      // silent — extraction is best-effort
    } finally {
      setIsExtracting(false)
    }
  }

  const confirmExtraction = () => {
    if (!pendingExtraction) return
    const filled: string[] = []

    if (pendingExtraction.specialty) {
      setSpecialty(pendingExtraction.specialty); filled.push("Specialty")
    }
    if (pendingExtraction.level) {
      setLevel(pendingExtraction.level); filled.push("Level")
    }
    if (pendingExtraction.language) {
      setLanguage(pendingExtraction.language); filled.push("Language")
    }
    if (pendingExtraction.gpa) {
      setGpa(String(pendingExtraction.gpa)); filled.push("GPA")
    }
    if (pendingExtraction.mobility_preference) {
      setMobility(pendingExtraction.mobility_preference); filled.push("Mobility")
    }
    if (pendingExtraction.selected_interests?.length) {
      setSelectedInterests(prev => {
        const merged = new Set([...prev, ...pendingExtraction.selected_interests])
        return [...merged]
      })
      filled.push("Interests")
    }
    setAutoFilled(filled)
    setShowExtractionModal(false)
    setPendingExtraction(null)
  }
  const removeFile = (name: string) =>
    setUploadedFiles(prev => prev.filter(f => f.name !== name))

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }
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

  const applyMutation = useApplyInternship()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Persist preferences if "Remember Me" is checked
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        mobility, selectedInterests, duration, specialty, level, language, gpa
      }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }

    setRecommendations(null)
    setIsSubmitted(false)
    setIsFakingLoading(true)

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
        onSuccess: (data) => {
          const elapsedTime = Date.now() - startTime
          const remainingTime = Math.max(0, 2000 - elapsedTime)
          setTimeout(() => {
            setIsFakingLoading(false)
            if (onResults) {
              onResults(data)
            } else {
              setIsSubmitted(true)
            }
          }, remainingTime)
        },
        onError: () => { setIsFakingLoading(false) },
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

      <div className="max-w-4xl mx-auto">
        {/* Step 2: Request Form */}
        <div className="w-full">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-none">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Tailor my results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Globe size={16} className="text-zinc-400" /> Desired
                      Mobility Type
                      <Info size={12} className="text-zinc-300 dark:text-zinc-700 cursor-help" />
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
                      <Info size={12} className="text-zinc-300 dark:text-zinc-700 cursor-help" />
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
            </Card>

            {/* ── PDF Upload Card ───────────────────────────────────────── */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-none">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Supporting Documents
                </CardTitle>
                <p className="text-xs text-zinc-400 mt-1">
                  Attach your CV and certificates (PDF only) to improve match accuracy.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all select-none",
                    isDragging
                      ? "border-zinc-900 dark:border-zinc-50 bg-zinc-50 dark:bg-zinc-900"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600",
                    isExtracting && "opacity-60 cursor-wait pointer-events-none"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    {isExtracting ? (
                      <Clock className="h-5 w-5 text-zinc-400 animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {isExtracting ? "Analyzing documents..." : isDragging ? "Drop files here" : "Click or drag & drop"}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400 mt-0.5 uppercase tracking-wider">
                      {isExtracting ? "Extracting profile data..." : "PDF files only · CV, Certificates, Transcripts"}
                    </p>
                  </div>
                </div>

                {/* Auto-filled status badge */}
                <AnimatePresence>
                  {autoFilled.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl flex items-center gap-3"
                    >
                      <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <Sparkles size={12} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                          AI Auto-fill Active
                        </p>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80">
                          Detected: {autoFilled.join(", ")}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* File list */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => {
                      const isCV = file.name.toLowerCase().includes("cv")
                      return (
                        <div
                          key={file.name}
                          className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl"
                        >
                          <div className="size-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            {isCV ? <BookOpen size={14} className="text-zinc-500" /> : <FileText size={14} className="text-zinc-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate">{file.name}</p>
                            <p className="text-[9px] font-mono text-zinc-400">
                              {(file.size / 1024).toFixed(1)} KB · {isCV ? "CV" : "Certificate"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.name)}
                            className="size-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Footer: Remember Me + Submit ─────────────────────────── */}
            <div className="space-y-4">
              {/* Remember Me toggle */}
              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={rememberMe}
                    onChange={() => {
                      if (rememberMe) localStorage.removeItem(STORAGE_KEY)
                      setRememberMe(!rememberMe)
                    }}
                  />
                  <div className="w-10 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-50 transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white dark:bg-zinc-900 rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                </div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                  Remember my preferences
                </span>
                {saved && (
                  <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-wider">● Saved</span>
                )}
              </label>

              <Button
                type="submit"
                disabled={isFakingLoading}
                className="w-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:opacity-90 py-6 rounded-xl text-md font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                {isFakingLoading ? "Calculating scores..." : "Generate my Recommendations"}
                {!isFakingLoading && <ArrowRight size={18} className="ml-2" />}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Dedicated Results Area - only shown when no onResults callback (standalone mode) */}
      {!onResults && (
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
      )}

      <Dialog open={showExtractionModal} onOpenChange={setShowExtractionModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Sparkles className="text-emerald-500" />
              AI Data Extraction
            </DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400">
              We've analyzed your documents. Please review the extracted information before applying it to the form.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-xl border border-zinc-100 dark:border-zinc-900 overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                  <TableRow>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Field</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Extracted Value</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingExtraction && (
                    <>
                      {pendingExtraction.full_name && (
                        <TableRow>
                          <TableCell className="text-xs font-medium text-zinc-500">Full Name</TableCell>
                          <TableCell className="text-sm font-bold">{pendingExtraction.full_name}</TableCell>
                          <TableCell><Check size={14} className="text-emerald-500" /></TableCell>
                        </TableRow>
                      )}
                      {pendingExtraction.specialty && (
                        <TableRow>
                          <TableCell className="text-xs font-medium text-zinc-500">Specialty</TableCell>
                          <TableCell className="text-sm font-bold">{pendingExtraction.specialty}</TableCell>
                          <TableCell><Check size={14} className="text-emerald-500" /></TableCell>
                        </TableRow>
                      )}
                      {pendingExtraction.level && (
                        <TableRow>
                          <TableCell className="text-xs font-medium text-zinc-500">Level</TableCell>
                          <TableCell className="text-sm font-bold">{pendingExtraction.level}</TableCell>
                          <TableCell><Check size={14} className="text-emerald-500" /></TableCell>
                        </TableRow>
                      )}
                      {pendingExtraction.language && (
                        <TableRow>
                          <TableCell className="text-xs font-medium text-zinc-500">Language</TableCell>
                          <TableCell className="text-sm font-bold">{pendingExtraction.language}</TableCell>
                          <TableCell><Check size={14} className="text-emerald-500" /></TableCell>
                        </TableRow>
                      )}
                      {pendingExtraction.gpa && (
                        <TableRow>
                          <TableCell className="text-xs font-medium text-zinc-500">GPA / Average</TableCell>
                          <TableCell className="text-sm font-bold">{pendingExtraction.gpa}</TableCell>
                          <TableCell><Check size={14} className="text-emerald-500" /></TableCell>
                        </TableRow>
                      )}
                      {pendingExtraction.mobility_preference && (
                        <TableRow>
                          <TableCell className="text-xs font-medium text-zinc-500">Mobility</TableCell>
                          <TableCell className="text-sm font-bold capitalize">{pendingExtraction.mobility_preference}</TableCell>
                          <TableCell><Check size={14} className="text-emerald-500" /></TableCell>
                        </TableRow>
                      )}
                      {pendingExtraction.selected_interests?.length > 0 && (
                        <TableRow>
                          <TableCell className="text-xs font-medium text-zinc-500">Interests</TableCell>
                          <TableCell className="text-sm font-bold">
                            <div className="flex flex-wrap gap-1">
                              {pendingExtraction.selected_interests.map((it: string) => (
                                <Badge key={it} variant="outline" className="text-[9px] border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400">
                                  {it}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell><Check size={14} className="text-emerald-500" /></TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowExtractionModal(false)
                setPendingExtraction(null)
              }}
              className="rounded-xl border-zinc-200 dark:border-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmExtraction}
              className="rounded-xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:opacity-90"
            >
              Apply to Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
