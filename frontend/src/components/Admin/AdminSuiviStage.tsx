import { useQuery } from "@tanstack/react-query"
import {
  ArrowUpRight,
  Calendar,
  Search,
  TrendingUp,
  User as UserIcon,
} from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { UsersService } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import UserDetailModal from "./UserDetailModal"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function AdminSuiviStage({ compact = false }: { compact?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => UsersService.readUsers({ limit: 100 }),
  })

  const filteredUsers = usersData?.data?.filter(
    (user: any) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger as any}
      className="container max-w-7xl py-12 space-y-16"
    >
      {/* Header */}
      {!compact && (
        <motion.div
          variants={fadeInUp as any}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div className="space-y-4">
            <Badge variant="section" className="px-4 py-1.5 text-[10px]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse mr-2" />
              Administrative Supervision
            </Badge>
            <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-foreground leading-[1.1]">
              Student <span className="gradient-text">Tracking</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl leading-relaxed">
              Supervise trainee activity, consult their logs, and provide your
              pedagogical expertise.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        variants={stagger as any}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="p-8 border-border/50 bg-muted/20 relative overflow-hidden group">
          <div className="p-4 w-fit rounded-2xl mb-6 bg-accent/10 text-accent group-hover:scale-110 transition-transform">
            <UserIcon size={24} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">
              Total Students
            </p>
            <p className="text-4xl font-serif text-foreground">
              {usersData?.count || 0}
            </p>
          </div>
        </Card>

        <Card className="p-8 border-border/50 bg-muted/20 relative overflow-hidden group">
          <div className="p-4 w-fit rounded-2xl mb-6 bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">
              Logs this week
            </p>
            <p className="text-4xl font-serif text-foreground">--</p>
          </div>
        </Card>

        <Card className="p-8 border-foreground text-background bg-foreground relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 dot-pattern opacity-[0.03]" />
          <div className="relative z-10">
            <div className="p-4 w-fit rounded-2xl mb-6 bg-white/10 text-white">
              <Calendar size={24} />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5 text-white/60">
              Deadlines
            </p>
            <p className="text-4xl font-serif text-white">0</p>
          </div>
        </Card>
      </motion.div>

      {/* Table Section */}
      {!compact && (
        <motion.div variants={fadeInUp as any} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h3 className="font-serif text-2xl">Activity Registry</h3>
            <div className="relative w-full md:w-[350px]">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                placeholder="Search for a student..."
                className="pl-12 rounded-full border-border/60 bg-muted/30 focus:bg-background transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-20 text-center animate-pulse text-muted-foreground font-serif text-lg">
                Loading data...
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="w-[120px] text-[10px] font-mono font-bold uppercase tracking-widest px-8 py-6 text-muted-foreground">
                      Reference
                    </TableHead>
                    <TableHead className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                      Student
                    </TableHead>
                    <TableHead className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                      Role
                    </TableHead>
                    <TableHead className="text-right px-8 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user: any) => (
                    <TableRow
                      key={user.id}
                      className="group cursor-pointer border-border/40 hover:bg-accent/[0.02] transition-colors"
                      onClick={() => setSelectedUser(user)}
                    >
                      <TableCell className="font-mono text-[10px] text-muted-foreground px-8 py-6">
                        #{user.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground group-hover:text-accent transition-colors">
                            {user.full_name || "Unknown Student"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-lg text-[9px] font-bold uppercase tracking-widest border-border/60 group-hover:border-accent/30 transition-colors"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button
                          variant="ghost"
                          className="rounded-full gap-2 text-muted-foreground group-hover:text-accent"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Consult
                          </span>
                          <ArrowUpRight
                            size={14}
                            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                          />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </motion.div>
      )}

      {selectedUser && !compact && (
        <UserDetailModal
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </motion.div>
  )
}
