import { useMutation } from "@tanstack/react-query"
import {
  AlertCircle,
  BookOpen,
  Building2,
  CheckCircle2,
  Globe,
  Languages,
  Loader2,
  Plus,
  Star,
  Tag,
  X,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface OfferPayload {
  title: string
  description: string | null
  source_url: string
  published_date: string | null
  target_audience: string
  mobility_type: string
  keywords: string[]
  translated_description: string | null
  specialty: string | null
  required_level: string | null
  required_language: string | null
  gpa_requirement: number | null
  university_name: string | null
  university_logo: string | null
  country: string | null
  country_flag: string | null
}

const SPECIALTY_OPTIONS = [
  "Informatique",
  "Management",
  "Electronique",
  "Mecanique",
  "Genie Civil",
  "Biologie",
  "Mathematiques",
  "Physique",
  "Chimie",
  "Lettres et Langues",
  "Droit et Sciences Politiques",
  "Sciences Economiques",
  "Medecine",
  "Pharmacie",
  "Architecture",
  "Autre",
]

const LEVEL_OPTIONS = ["L1", "L2", "L3", "M1", "M2", "PhD", "Any"]
const LANGUAGE_OPTIONS = ["Arabic", "French", "English", "Mixed (Arabic/French)", "Other"]

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-zinc-50/20"

export default function AddInternshipForm() {
  const [form, setForm] = useState<OfferPayload>({
    title: "",
    description: "",
    source_url: "",
    published_date: "",
    target_audience: "both",
    mobility_type: "national",
    keywords: [],
    translated_description: "",
    specialty: null,
    required_level: null,
    required_language: null,
    gpa_requirement: null,
    university_name: "",
    university_logo: "",
    country: "",
    country_flag: "",
  })
  const [keywordInput, setKeywordInput] = useState("")
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async (payload: OfferPayload) => {
      const token = localStorage.getItem("access_token")
      const apiUrl = import.meta.env.VITE_API_URL || ""
      const res = await fetch(`${apiUrl}/api/v1/internships/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payload,
          published_date: payload.published_date || null,
          gpa_requirement: payload.gpa_requirement ?? null,
          specialty: payload.specialty || null,
          required_level: payload.required_level || null,
          required_language: payload.required_language || null,
          description: payload.description || null,
          translated_description: payload.translated_description || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || "Failed to create internship offer.")
      }
      return res.json()
    },
    onSuccess: () => {
      setSuccess(true)
      setServerError(null)
      setForm({
        title: "",
        description: "",
        source_url: "",
        published_date: "",
        target_audience: "both",
        mobility_type: "national",
        keywords: [],
        translated_description: "",
        specialty: null,
        required_level: null,
        required_language: null,
        gpa_requirement: null,
        university_name: "",
        university_logo: "",
        country: "",
        country_flag: "",
      })
      setTimeout(() => setSuccess(false), 5000)
    },
    onError: (err: any) => {
      setServerError(err.message)
    },
  })

  const set = (key: keyof OfferPayload, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const addKeyword = () => {
    const kw = keywordInput.trim()
    if (kw && !form.keywords.includes(kw)) {
      set("keywords", [...form.keywords, kw])
    }
    setKeywordInput("")
  }

  const removeKeyword = (kw: string) =>
    set("keywords", form.keywords.filter((k) => k !== kw))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    mutation.mutate(form)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 px-4 pt-10">
      {/* Header */}
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-12 text-center">
        <Badge
          variant="outline"
          className="mb-6 gap-2 px-6 py-2 text-[11px] font-mono uppercase tracking-[0.2em] border-zinc-200 dark:border-zinc-800 rounded-full"
        >
          <Building2 size={14} /> Administrative Terminal
        </Badge>
        <h1 className="text-6xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50 leading-tight">
          Publish <span className="text-zinc-400">New</span> Internship
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-4 text-xl max-w-2xl mx-auto leading-relaxed">
          Create and broadcast professional opportunities directly to the global student registry.
        </p>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">Internship offer created successfully!</p>
        </div>
      )}

      {/* Error Banner */}
      {serverError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ─── Section 1: Core Information ─── */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-none">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-2xl flex items-center gap-4 font-bold tracking-tight">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-sm font-mono font-black">
                01
              </span>
              Core Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-4 space-y-8">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Offer Title *
              </Label>
              <Input
                required
                placeholder="e.g. Software Engineering Internship – Sonatrach"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="border-zinc-200 dark:border-zinc-800 h-14 text-base px-6 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Source URL *
              </Label>
              <Input
                required
                type="url"
                placeholder="https://company.com/internship/2024"
                value={form.source_url}
                onChange={(e) => set("source_url", e.target.value)}
                className="border-zinc-200 dark:border-zinc-800 font-mono text-base h-14 px-6 rounded-2xl"
              />
              <p className="text-[10px] text-zinc-400">
                Must be unique. Used as the canonical identifier for this offer.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Description
              </Label>
              <textarea
                rows={5}
                placeholder="Describe the internship role, responsibilities and requirements…"
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                className="flex w-full rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 bg-transparent px-6 py-4 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-zinc-50/20 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Translated Description (French / Arabic)
              </Label>
              <textarea
                rows={3}
                placeholder="Optional translated version of the description…"
                value={form.translated_description ?? ""}
                onChange={(e) => set("translated_description", e.target.value)}
                className="flex w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-zinc-50/20 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Published Date
              </Label>
              <Input
                type="date"
                value={form.published_date ?? ""}
                onChange={(e) => set("published_date", e.target.value)}
                className="border-zinc-200 dark:border-zinc-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── Section 2: Targeting ─── */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-none">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-2xl flex items-center gap-4 font-bold tracking-tight">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-sm font-mono font-black">
                02
              </span>
              Targeting & Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mobility Type */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Globe size={14} /> Mobility Type
                </Label>
                <div className="flex flex-col gap-2">
                  {["national", "international"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set("mobility_type", m)}
                      className={cn(
                        "px-4 py-2.5 rounded-lg border text-left text-sm font-medium transition-all capitalize",
                        form.mobility_type === m
                          ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-50 shadow-sm"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <BookOpen size={14} /> Target Audience
                </Label>
                <div className="flex flex-col gap-2">
                  {["student", "teacher", "both"].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => set("target_audience", a)}
                      className={cn(
                        "px-4 py-2.5 rounded-lg border text-left text-sm font-medium transition-all capitalize",
                        form.target_audience === a
                          ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-50 shadow-sm"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600",
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Specialty */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Specialty
                </Label>
                <select
                  className={SELECT_CLASS}
                  value={form.specialty ?? ""}
                  onChange={(e) => set("specialty", e.target.value || null)}
                >
                  <option value="">Any</option>
                  {SPECIALTY_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Required Level */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Star size={12} /> Required Level
                </Label>
                <select
                  className={SELECT_CLASS}
                  value={form.required_level ?? ""}
                  onChange={(e) => set("required_level", e.target.value || null)}
                >
                  <option value="">Any</option>
                  {LEVEL_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Required Language */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Languages size={12} /> Required Language
                </Label>
                <select
                  className={SELECT_CLASS}
                  value={form.required_language ?? ""}
                  onChange={(e) => set("required_language", e.target.value || null)}
                >
                  <option value="">Any</option>
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* GPA Requirement */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Minimum GPA / Average (optional)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="20"
                placeholder="e.g. 12.5 — leave blank for no requirement"
                value={form.gpa_requirement ?? ""}
                onChange={(e) =>
                  set("gpa_requirement", e.target.value ? parseFloat(e.target.value) : null)
                }
                className="border-zinc-200 dark:border-zinc-800 max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── Section 3: Branding ─── */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-none">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-2xl flex items-center gap-4 font-bold tracking-tight">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-sm font-mono font-black">
                03
              </span>
              Branding & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  University / Institution Name
                </Label>
                <Input
                  placeholder="e.g. Université de Annaba"
                  value={form.university_name ?? ""}
                  onChange={(e) => set("university_name", e.target.value)}
                  className="border-zinc-200 dark:border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Institution Logo URL
                </Label>
                <Input
                  placeholder="https://univ-annaba.dz/logo.png"
                  value={form.university_logo ?? ""}
                  onChange={(e) => set("university_logo", e.target.value)}
                  className="border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Country Name
                </Label>
                <Input
                  placeholder="e.g. Algeria, France, Spain"
                  value={form.country ?? ""}
                  onChange={(e) => set("country", e.target.value)}
                  className="border-zinc-200 dark:border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Country Flag Emoji
                </Label>
                <Input
                  placeholder="e.g. 🇩🇿, 🇫🇷, 🇪🇸"
                  value={form.country_flag ?? ""}
                  onChange={(e) => set("country_flag", e.target.value)}
                  className="border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Section 4: Keywords ─── */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-xs font-mono font-bold">
                04
              </span>
              Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Add a keyword (e.g. Python, IoT, Finance)…"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addKeyword()
                    }
                  }}
                  className="border-zinc-200 dark:border-zinc-800 pl-9"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addKeyword}
                className="border-zinc-200 dark:border-zinc-800 gap-2"
              >
                <Plus size={16} /> Add
              </Button>
            </div>

            {form.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {form.keywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="secondary"
                    className="gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-none"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full h-20 text-sm font-bold uppercase tracking-[0.3em] bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:opacity-90 transition-all shadow-2xl hover:shadow-zinc-900/20 active:scale-[0.98] rounded-[2rem] border-8 border-white dark:border-zinc-950"
        >
          {mutation.isPending ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Publishing Offer…
            </>
          ) : (
            "Publish Internship Offer"
          )}
        </Button>
      </form>
    </div>
  )
}
