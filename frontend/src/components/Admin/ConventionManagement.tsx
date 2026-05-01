import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Forward,
  MoreHorizontal,
  Search,
  XCircle,
  Clock,
  Filter,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function ConventionManagement() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["admin-conventions"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/admin/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!response.ok) throw new Error("Failed to fetch")
      return response.json()
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/${id}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!response.ok) throw new Error("Failed to approve")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-conventions"] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/conventions/${id}/reject?reason=${reason}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!response.ok) throw new Error("Failed to reject")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-conventions"] })
    },
  })

  const filteredData = data?.data?.filter((c: any) =>
    c.document_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="border-border/50 shadow-none overflow-hidden">
      <CardHeader className="p-8 border-b border-border/40 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-serif">Gestion des Conventions</CardTitle>
            <p className="text-sm text-muted-foreground font-medium">
              Pipeline d'approbation hiérarchique et circuit de signature.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input 
                  placeholder="Rechercher un dossier..." 
                  className="pl-9 w-[280px] h-10 bg-background border-border/40 focus:ring-accent/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Button variant="outline" size="icon" className="h-10 w-10 border-border/40 hover:bg-muted">
                <Filter size={18} />
             </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="w-[350px] font-mono text-[10px] uppercase tracking-widest py-5 px-8">Dossier / Document</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">Niveau d'Approbation</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">Statut</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest">Date de Soumission</TableHead>
                <TableHead className="text-right px-8 font-mono text-[10px] uppercase tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex items-center justify-center gap-3 text-muted-foreground font-medium">
                       <Clock className="animate-spin size-5" /> Chargement des dossiers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <p className="text-muted-foreground font-medium">Aucun dossier en attente d'approbation.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData?.map((conv: any) => (
                  <TableRow key={conv.id} className="border-border/40 group hover:bg-muted/20 transition-colors">
                    <TableCell className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-accent/10 group-hover:text-accent transition-all">
                          <FileText size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">{conv.document_name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">ID: {conv.id.split('-')[0]}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="px-3 py-1 font-mono text-[10px] border-accent/20 text-accent bg-accent/5">
                        {conv.approval_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "px-3 py-1 font-mono text-[10px] uppercase tracking-widest",
                        conv.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                        conv.status === 'rejected' ? "bg-destructive/10 text-destructive border-destructive/20" : 
                        "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )} variant="outline">
                        {conv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-muted-foreground">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg border border-border/20 group-hover:border-border/40">
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                          <DropdownMenuLabel className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Actions Administrateur</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => approveMutation.mutate(conv.id)}
                            className="rounded-lg px-3 py-2.5 focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400 cursor-pointer"
                          >
                            <CheckCircle2 className="mr-3 size-4" /> 
                            <span className="font-bold text-xs uppercase tracking-widest">Approuver</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg px-3 py-2.5 focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer">
                            <Forward className="mr-3 size-4" /> 
                            <span className="font-bold text-xs uppercase tracking-widest">Transférer</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => rejectMutation.mutate({ id: conv.id, reason: "Non conforme" })}
                            className="rounded-lg px-3 py-2.5 focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                          >
                            <XCircle className="mr-3 size-4" /> 
                            <span className="font-bold text-xs uppercase tracking-widest">Rejeter</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
