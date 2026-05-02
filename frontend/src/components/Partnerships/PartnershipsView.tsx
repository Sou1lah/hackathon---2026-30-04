import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Building2,
  Calendar,
  Clock,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  University,
} from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

// A simple AddPartnershipModal component inside this file for simplicity
import AddPartnershipModal from "./AddPartnershipModal"

export default function PartnershipsView() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["partnerships"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/partnerships/`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) throw new Error("Failed to fetch")
      return response.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/partnerships/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!response.ok) throw new Error("Failed to delete")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerships"] })
    },
  })

  const filteredData = data?.data?.filter((p: any) =>
    p.partner_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isAdmin = user?.is_superuser || user?.can_review_applications

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-serif tracking-tight">
                Institutional <span className="gradient-text">Conventions</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage contracts and partnerships with companies and universities.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Search partnerships..."
              className="pl-9 w-[300px] h-11 bg-background border-border/40 focus:ring-accent/20 transition-all rounded-xl shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <Button
              className="h-11 px-5 rounded-xl font-bold uppercase tracking-widest text-xs gap-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} /> New Contract
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/40 shadow-sm bg-card/50 backdrop-blur-xl">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="w-[300px] font-mono text-[10px] uppercase tracking-widest py-5 px-6">
                Partner Organization
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">
                Contact Info
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">
                Validity Period
              </TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest">
                Status
              </TableHead>
              <TableHead className="text-right px-6 font-mono text-[10px] uppercase tracking-widest">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <Clock className="animate-spin size-5 text-accent" /> Loading partnerships...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="size-10 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">No institutional conventions found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData?.map((p: any) => (
                <TableRow
                  key={p.id}
                  className="border-border/40 group hover:bg-muted/20 transition-colors"
                >
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-accent/10 group-hover:text-accent transition-all shadow-sm">
                        {p.partner_type === "university" ? <University size={18} /> : <Building2 size={18} />}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-foreground tracking-tight block">
                          {p.partner_name}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                          {p.partner_type}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-foreground">{p.contact_email || "N/A"}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{p.contact_phone || "No phone"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {p.start_date} → {p.end_date}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "px-3 py-1 font-mono text-[10px] uppercase tracking-widest rounded-lg",
                        p.status === "active"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : p.status === "expired"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}
                      variant="outline"
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-2">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Delete this institutional convention?")) {
                              deleteMutation.mutate(p.id)
                            }
                          }}
                          className="h-9 w-9 rounded-xl border border-border/20 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive group-hover:border-border/40 transition-colors"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isAddModalOpen && (
        <AddPartnershipModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  )
}
