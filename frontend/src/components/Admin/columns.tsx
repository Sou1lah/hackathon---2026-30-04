import type { ColumnDef } from "@tanstack/react-table"
import {
  ClipboardList,
  FilePlus,
  FileText,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react"

import type { UserPublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { UserActionsMenu } from "./UserActionsMenu"

export type UserTableData = UserPublic & {
  isCurrentUser: boolean
}

export const columns: ColumnDef<UserTableData>[] = [
  {
    accessorKey: "full_name",
    header: "User",
    cell: ({ row }) => {
      const fullName = row.original.full_name
      return (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <UserIcon size={16} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-bold text-sm tracking-tight",
                  !fullName && "text-muted-foreground",
                )}
              >
                {fullName || "N/A"}
              </span>
              {row.original.isCurrentUser && (
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase font-bold tracking-widest bg-accent/5 text-accent border-accent/20"
                >
                  You
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              {row.original.email}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "is_superuser",
    header: "Level",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.is_superuser ? (
          <Badge className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 flex gap-1.5 items-center">
            <ShieldAlert size={10} /> Admin
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="rounded-lg text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
          >
            {row.original.role?.replace("_", " ") || "User"}
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "permissions",
    header: "DB Permissions",
    cell: ({ row }) => {
      const u = row.original
      return (
        <TooltipProvider>
          <div className="flex items-center gap-1.5">
            <PermissionIcon
              active={u.can_access_dashboard}
              icon={<LayoutDashboard size={12} />}
              label="Dashboard"
            />
            <PermissionIcon
              active={u.can_apply_internship}
              icon={<FilePlus size={12} />}
              label="Internship Request"
            />
            <PermissionIcon
              active={u.can_view_convention}
              icon={<FileText size={12} />}
              label="Conventions"
            />
            <PermissionIcon
              active={u.can_view_tracking}
              icon={<ClipboardList size={12} />}
              label="Internship Tracking"
            />
            <PermissionIcon
              active={u.can_review_applications}
              icon={<ShieldCheck size={12} />}
              label="Review / Evaluation"
            />
          </div>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "size-2 rounded-full",
            row.original.is_active
              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              : "bg-zinc-300",
          )}
        />
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            row.original.is_active
              ? "text-emerald-600"
              : "text-muted-foreground",
          )}
        >
          {row.original.is_active ? "Active" : "Inactive"}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UserActionsMenu user={row.original} />
      </div>
    ),
  },
]

function PermissionIcon({
  active,
  icon,
  label,
}: {
  active?: boolean
  icon: React.ReactNode
  label: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "size-6 rounded-md flex items-center justify-center transition-all",
            active
              ? "bg-accent/10 text-accent border border-accent/20"
              : "bg-zinc-50 text-zinc-300 border border-zinc-100 grayscale opacity-40",
          )}
        >
          {icon}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-[10px] font-bold uppercase tracking-widest">
          {label}: {active ? "YES" : "NO"}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
