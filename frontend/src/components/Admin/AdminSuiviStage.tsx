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
    <div className="p-[48px] space-y-[32px] bg-white dark:bg-zinc-950 min-h-screen">
      {/* Header */}
      {!compact && (
        <div className="flex flex-row justify-between items-start mb-6">
          <div className="space-y-1">
            <h1 className="text-[32px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Student Tracking
            </h1>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 max-w-[520px] leading-relaxed">
              Supervise trainee activity, consult their logs, and provide pedagogical expertise.
            </p>
          </div>
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <Input
              placeholder="Search student..."
              className="pl-11 h-11 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[14px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px] mb-[20px]">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-[24px_28px] flex flex-col justify-between h-[140px] shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-400">Total Students</span>
          <div className="flex items-baseline gap-3">
            <span className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50">{usersData?.count || 0}</span>
            <span className="text-[12px] text-zinc-400 font-medium">Registered</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-[24px_28px] flex flex-col justify-between h-[140px] shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-400">Logs this week</span>
          <div className="flex items-baseline gap-3">
            <span className="text-[32px] font-bold text-zinc-900 dark:text-zinc-50">--</span>
            <span className="text-[12px] text-zinc-400 font-medium">New entries</span>
          </div>
        </div>

        <div className="bg-zinc-900 dark:bg-indigo-950 text-white rounded-2xl p-[24px_28px] flex items-center gap-6 h-[140px] shadow-lg">
          <div className="w-12 h-12 rounded-full bg-zinc-800 dark:bg-indigo-900 flex items-center justify-center shrink-0">
            <Calendar size={22} className="text-indigo-400" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-500">Deadlines</span>
            <p className="text-[18px] font-black uppercase tracking-tight text-white">0 Pending</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {!compact && (
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[12px] shadow-none overflow-hidden">
          <div className="p-[24px_32px] border-b border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/30">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-zinc-500">Activity Registry</h2>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-10 text-center text-zinc-400 text-[13px]">
                Loading data...
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                  <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                    <TableHead className="text-[11px] font-bold uppercase tracking-widest px-8 py-6 text-zinc-400">
                      Reference
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      Student
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      Role
                    </TableHead>
                    <TableHead className="text-right px-8 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user: any) => (
                    <TableRow
                      key={user.id}
                      className="group cursor-pointer border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                      onClick={() => setSelectedUser(user)}
                    >
                      <TableCell className="font-mono text-[11px] text-zinc-400 px-8 py-8">
                        #{user.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="py-8">
                        <div className="flex flex-col gap-1">
                          <span className="text-[15px] font-bold text-zinc-900 dark:text-zinc-50">
                            {user.full_name || "Unknown Student"}
                          </span>
                          <span className="text-[12px] text-zinc-500 font-medium">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-lg text-[9px] font-bold uppercase tracking-widest border-zinc-200 dark:border-zinc-800 text-zinc-500"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8 py-8">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 px-5 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 gap-3 text-[13px] font-bold uppercase tracking-wider"
                        >
                          Consult <ArrowUpRight size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      )}

      {selectedUser && !compact && (
        <UserDetailModal
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}
