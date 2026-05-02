import { Link as RouterLink } from "@tanstack/react-router"
import { ChevronsUpDown, LogOut, Settings, User as UserIcon, UserPlus, Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getInitials } from "@/utils"
import { UserProfile } from "./UserProfile"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface UserInfoProps {
  fullName?: string
  email?: string
}

function UserInfo({ fullName, email }: UserInfoProps) {
  return (
    <div className="flex items-center gap-2.5 w-full min-w-0">
      <Avatar className="size-11 border-2 border-primary/20 transition-all duration-300 group-hover:scale-105">
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent-secondary text-white text-xs font-bold">
          {getInitials(fullName || "User")}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start min-w-0">
        <p className="text-base font-bold truncate w-full">{fullName}</p>
        <p className="text-sm text-muted-foreground truncate w-full">{email}</p>
      </div>
    </div>
  )
}

export function User({ user }: { user: any }) {
  const { logout, accounts, switchAccount, addAccount } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()

  if (!user) return null

  // Admins don't have the profile feature, only students and teachers
  const showProfile = user && !user.is_superuser && user.role !== "admin"

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }
  const handleLogout = async () => {
    logout()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group hover:bg-primary/5 transition-colors duration-200"
              data-testid="user-menu"
            >
              <UserInfo fullName={user?.full_name} email={user?.email} />
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <UserInfo fullName={user?.full_name} email={user?.email} />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <RouterLink to="/settings" onClick={handleMenuClick}>
              <DropdownMenuItem>
                <Settings />
                User Settings
              </DropdownMenuItem>
            </RouterLink>
            {showProfile && (
              <RouterLink to="/profile" onClick={handleMenuClick}>
                <DropdownMenuItem>
                  <UserIcon className="size-4" />
                  Profile
                </DropdownMenuItem>
              </RouterLink>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5 flex items-center gap-2">
              <Users className="size-3" /> Switch Account
            </DropdownMenuLabel>

            {accounts.map((acc: any) => (
              <DropdownMenuItem
                key={acc.email}
                onClick={() => switchAccount(acc.email)}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  acc.email === user.email && "bg-primary/5 text-primary font-bold"
                )}
              >
                <div className="size-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px]">
                  {getInitials(acc.full_name)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{acc.full_name}</span>
                  <span className="text-[9px] text-muted-foreground truncate">{acc.email}</span>
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuItem onClick={addAccount} className="text-primary hover:text-primary-foreground hover:bg-primary">
              <UserPlus className="size-4" />
              Add Account
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="size-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
