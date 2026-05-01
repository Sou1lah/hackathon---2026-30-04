import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  Building2,
  Edit2,
  Globe,
  Loader2,
  Plus,
  Save,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Offer {
  id: string
  title: string
  description: string | null
  source_url: string
  published_date: string | null
  target_audience: string
  mobility_type: string
  keywords: string[]
  specialty: string | null
  required_level: string | null
  required_language: string | null
  gpa_requirement: number | null
  university_name: string | null
  university_logo: string | null
  country: string | null
  country_flag: string | null
}

const API = import.meta.env.VITE_API_URL || ""
const token = () => localStorage.getItem("access_token")
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` })

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-1.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-zinc-50/20"

function EditModal({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<Offer>({ ...offer })
  const [kwInput, setKwInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof Offer, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const addKw = () => {
    const kw = kwInput.trim()
    if (kw && !form.keywords.includes(kw)) set("keywords", [...form.keywords, kw])
    setKwInput("")
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/api/v1/internships/${form.id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ ...form }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || "Update failed")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-internships"] })
      onClose()
    },
    onError: (e: any) => setError(e.message),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-900">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Edit Offer</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Title *</Label>
            <Input required value={form.title} onChange={(e) => set("title", e.target.value)} className="border-zinc-200 dark:border-zinc-800" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Source URL *</Label>
            <Input value={form.source_url} onChange={(e) => set("source_url", e.target.value)} className="border-zinc-200 dark:border-zinc-800 font-mono text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description</Label>
            <textarea rows={4} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)}
              className="flex w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-zinc-50/20 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Mobility Type</Label>
              <select className={SELECT_CLASS} value={form.mobility_type} onChange={(e) => set("mobility_type", e.target.value)}>
                <option value="national">National</option>
                <option value="international">International</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Audience</Label>
              <select className={SELECT_CLASS} value={form.target_audience} onChange={(e) => set("target_audience", e.target.value)}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Specialty</Label>
              <Input value={form.specialty ?? ""} onChange={(e) => set("specialty", e.target.value || null)} className="border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Required Level</Label>
              <select className={SELECT_CLASS} value={form.required_level ?? ""} onChange={(e) => set("required_level", e.target.value || null)}>
                <option value="">Any</option>
                {["L1", "L2", "L3", "M1", "M2", "PhD"].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Language</Label>
              <Input value={form.required_language ?? ""} onChange={(e) => set("required_language", e.target.value || null)} className="border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Min GPA</Label>
              <Input type="number" step="0.01" value={form.gpa_requirement ?? ""} onChange={(e) => set("gpa_requirement", e.target.value ? parseFloat(e.target.value) : null)} className="border-zinc-200 dark:border-zinc-800" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">University</Label>
              <Input value={form.university_name ?? ""} onChange={(e) => set("university_name", e.target.value)} className="border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Logo URL</Label>
              <Input value={form.university_logo ?? ""} onChange={(e) => set("university_logo", e.target.value)} className="border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Country</Label>
              <Input value={form.country ?? ""} onChange={(e) => set("country", e.target.value)} className="border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Flag</Label>
              <Input value={form.country_flag ?? ""} onChange={(e) => set("country_flag", e.target.value)} className="border-zinc-200 dark:border-zinc-800" />
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Keywords</Label>
            <div className="flex gap-2">
              <Input placeholder="Add keyword…" value={kwInput} onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKw() } }}
                className="border-zinc-200 dark:border-zinc-800" />
              <Button type="button" variant="outline" size="sm" onClick={addKw} className="border-zinc-200 dark:border-zinc-800">
                <Plus size={14} />
              </Button>
            </div>
            {form.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.keywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="gap-1 px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border-none text-xs">
                    {kw}
                    <button onClick={() => set("keywords", form.keywords.filter(k => k !== kw))} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-zinc-100 dark:border-zinc-900">
          <Button variant="ghost" onClick={onClose} className="text-zinc-500">Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:opacity-90 gap-2">
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function InternshipManagement() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<Offer | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "national" | "international">("all")

  const { data, isLoading, error } = useQuery<{ data: Offer[]; count: number }>({
    queryKey: ["all-internships"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/v1/internships/?limit=200`, { headers: headers() })
      if (!res.ok) throw new Error("Failed to load internships")
      return res.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API}/api/v1/internships/${id}`, { method: "DELETE", headers: headers() })
      if (!res.ok) throw new Error("Delete failed")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-internships"] })
      setDeletingId(null)
    },
  })

  const offers = (data?.data ?? []).filter((o) => {
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) ||
      (o.specialty ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (o.university_name ?? "").toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || (o.mobility_type ?? "").toLowerCase() === filter.toLowerCase()
    return matchSearch && matchFilter
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
      {/* Header */}
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-8">
        <Badge variant="outline" className="mb-4 gap-2 px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest border-zinc-200 dark:border-zinc-800">
          <Building2 size={12} /> Admin Panel
        </Badge>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Internship Offers</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">{data?.count ?? 0} offers in the database</p>
          </div>
          <a href="/stages">
            <Button className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:opacity-90 gap-2 rounded-xl">
              <Plus size={16} /> Add New Offer
            </Button>
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input placeholder="Search by title or specialty…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="flex gap-2">
          {(["all", "national", "international"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-4 py-2 rounded-lg border text-sm font-medium transition-all capitalize",
                filter === f
                  ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-50"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
              )}>{f}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          <AlertCircle size={20} /> Failed to load internship offers.
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-24 text-zinc-400">
          <Building2 size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">No offers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12">
          {offers.map((offer) => (
            <Card key={offer.id} className="border-zinc-200 dark:border-zinc-800 shadow-none hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row overflow-hidden min-h-[400px] rounded-[2.5rem] bg-white dark:bg-zinc-950 group">
              <div className="w-full md:w-[320px] shrink-0 bg-zinc-50 dark:bg-zinc-900/50 relative overflow-hidden flex items-center justify-center border-r border-zinc-100 dark:border-zinc-900">
                {offer.university_logo ? (
                  <img src={offer.university_logo} alt={offer.university_name ?? ""} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <span className="text-[120px] opacity-10 group-hover:opacity-30 transition-opacity transform group-hover:rotate-12">{offer.country_flag || "🏛️"}</span>
                )}
                <div className="absolute top-4 left-4">
                  <Badge variant={offer.mobility_type === "international" ? "default" : "secondary"}
                    className="text-[10px] uppercase tracking-[0.15em] rounded-full px-4 py-1.5 shadow-lg backdrop-blur-md">
                    <Globe size={11} className="mr-2" />{offer.mobility_type}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <CardHeader className="p-10 pb-4">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{offer.country_flag}</span>
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{offer.country || "Global"}</span>
                    </div>
                    {offer.target_audience && (
                      <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-zinc-200 dark:border-zinc-800 text-zinc-500 px-3">
                        {offer.target_audience}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-3xl text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {offer.title}
                  </h3>
                  {offer.university_name && (
                    <p className="text-sm font-medium text-zinc-400 mt-2 font-mono uppercase tracking-wider">{offer.university_name}</p>
                  )}
                </CardHeader>

                <CardContent className="flex-1 space-y-6 p-10 pt-0">
                  {offer.description && (
                    <p className="text-base text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed max-w-2xl">
                      {offer.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-[11px] font-mono text-zinc-500">
                    {offer.specialty && <span className="bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-lg">📚 {offer.specialty}</span>}
                    {offer.required_level && <span className="bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-lg">🎓 {offer.required_level}</span>}
                    {offer.required_language && <span className="bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-lg">🌐 {offer.required_language}</span>}
                    {offer.gpa_requirement && <span className="bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-lg">⭐ GPA ≥ {offer.gpa_requirement}</span>}
                  </div>
                  {offer.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {offer.keywords.slice(0, 6).map((kw) => (
                        <span key={kw} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-full px-4 py-1 text-zinc-400">
                          <Tag size={10} />{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-10 pt-6 border-t border-zinc-100 dark:border-zinc-900 gap-4">
                  <Button variant="outline" size="lg" onClick={() => setEditing(offer)}
                    className="flex-1 h-14 gap-3 border-zinc-200 dark:border-zinc-800 text-sm font-bold uppercase tracking-widest rounded-2xl">
                    <Edit2 size={16} /> Edit Details
                  </Button>
                  {deletingId === offer.id ? (
                    <div className="flex gap-2 flex-1">
                      <Button size="lg" variant="destructive" onClick={() => deleteMutation.mutate(offer.id)}
                        disabled={deleteMutation.isPending}
                        className="flex-1 h-14 text-sm font-bold uppercase tracking-widest gap-3 rounded-2xl">
                        {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Confirm
                      </Button>
                      <Button size="lg" variant="ghost" onClick={() => setDeletingId(null)} className="px-4 h-14 rounded-2xl">
                        <X size={20} />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="lg" onClick={() => setDeletingId(offer.id)}
                      className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all px-6 h-14 rounded-2xl">
                      <Trash2 size={20} />
                    </Button>
                  )}
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && <EditModal offer={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
