import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Building2, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AddPartnershipModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [partnerName, setPartnerName] = useState("")
  const [partnerType, setPartnerType] = useState("company")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/partnerships/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create partnership")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerships"] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      partner_name: partnerName,
      partner_type: partnerType,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      start_date: startDate,
      end_date: endDate,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="relative bg-zinc-900 text-white p-8 overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">New Contract</h2>
                <p className="text-xs text-zinc-400 font-mono mt-1">Institutional Convention</p>
              </div>
            </div>
            <button onClick={onClose} className="size-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[70vh]">
          <form id="add-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Partner Organization</label>
                <Input required value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Company or University Name" className="h-11 rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Type</label>
                <select 
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={partnerType} 
                  onChange={(e) => setPartnerType(e.target.value)}
                >
                  <option value="company">Company</option>
                  <option value="university">University</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Contact Email</label>
                  <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@example.com" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Contact Phone</label>
                  <Input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+213..." className="h-11 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Start Date</label>
                  <Input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">End Date</label>
                  <Input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 rounded-xl" />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-900 p-6 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/30">
          <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-500 font-bold text-xs uppercase tracking-wider">
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-form"
            disabled={mutation.isPending}
            className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-bold uppercase tracking-widest text-xs px-8 hover:opacity-90 transition-all rounded-xl h-11"
          >
            {mutation.isPending ? "Creating..." : "Create Contract"}
          </Button>
        </div>
      </div>
    </div>
  )
}
