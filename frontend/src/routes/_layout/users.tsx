import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense } from "react"

import { UsersService, type UserPublic } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import { columns, type UserTableData } from "@/components/Admin/columns"
import AddUser from "@/components/Admin/AddUser"
import PendingUsers from "@/components/Pending/PendingUsers"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/users")({
  component: UsersPage,
  head: () => ({
    meta: [{ title: "User Management - Mobility Hub" }],
  }),
})

function getUsersQueryOptions() {
  return {
    queryFn: () => UsersService.readUsers({ skip: 0, limit: 100 }),
    queryKey: ["users"],
  }
}

function UsersTableContent() {
  const { user: currentUser } = useAuth()
  const { data: users } = useSuspenseQuery(getUsersQueryOptions())

  const tableData: UserTableData[] = users.data.map((user: UserPublic) => ({
    ...user,
    isCurrentUser: currentUser?.id === user.id,
  }))

  return <DataTable columns={columns} data={tableData} />
}

function UsersPage() {
  return (
    <div className="space-y-8 p-2 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-primary">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground italic font-medium">Administration des comptes et des rôles.</p>
        </div>
        <div className="flex gap-3">
          <AddUser />
        </div>
      </div>

      <div className="bg-card p-8 rounded-3xl border border-border shadow-sm overflow-hidden">
        <Suspense fallback={<PendingUsers />}>
          <UsersTableContent />
        </Suspense>
      </div>
    </div>
  )
}
