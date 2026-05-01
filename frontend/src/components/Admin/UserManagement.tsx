import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense } from "react"

import { type UserPublic, UsersService } from "@/client"
import AddUser from "@/components/Admin/AddUser"
import { columns, type UserTableData } from "@/components/Admin/columns"
import { DataTable } from "@/components/Common/DataTable"
import PendingUsers from "@/components/Pending/PendingUsers"
import useAuth from "@/hooks/useAuth"

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

export function UserManagement() {
  return (
    <div className="space-y-8 p-2 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-primary">
            User Management
          </h1>
          <p className="text-muted-foreground italic font-medium">
            Account and role administration.
          </p>
        </div>
        <div className="flex gap-3">
          <AddUser />
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 overflow-hidden">
        <Suspense fallback={<PendingUsers />}>
          <UsersTableContent />
        </Suspense>
      </div>
    </div>
  )
}

export default UserManagement
