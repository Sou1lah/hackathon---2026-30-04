import { Link as RouterLink } from "@tanstack/react-router"
import {
  ClipboardList,
  FilePlus,
  FileText,
  Globe,
  Home,
  Layout,
  Map,
  Settings,
} from "lucide-react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { type Item, Main } from "./Main"
import { User } from "./User"

export function AppSidebar() {
  const { user: currentUser } = useAuth()

  // Build the navigation list dynamically from DB-driven permission flags.
  // No roles, no enums — only what the backend says the user can access.
  const items: Item[] = []

  if (currentUser?.can_access_dashboard || currentUser?.is_superuser) {
    items.push({ icon: Home, title: "Dashboard", path: "/dashboard" })
  }

  if (currentUser?.can_apply_internship || currentUser?.is_superuser) {
    items.push({ icon: FilePlus, title: "Demande Stage", path: "/stages" })
  }

  if (currentUser?.can_view_convention || currentUser?.is_superuser) {
    items.push({ icon: FileText, title: "Convention Stage", path: "/convention" })
  }

  if (currentUser?.can_view_tracking || currentUser?.is_superuser) {
    items.push({ icon: ClipboardList, title: "Suivi Stage", path: "/suivi-stage" })
  }

  if (currentUser?.is_superuser || currentUser?.can_review_applications) {
    items.push({ icon: Layout, title: "Suivi (Admin)", path: "/admin/suivi-stage" })
  }

  // Mobility browsing is available to all authenticated users (no specific flag required)
  items.push({
    icon: Globe,
    title: "Mobilité",
    path: "/mobilite",
    subItems: [
      {
        icon: Map,
        title: "Mobilité Nationale",
        path: "/mobilite",
        search: { type: "nationale" },
      },
      {
        icon: Globe,
        title: "Mobilité Internationale",
        path: "/mobilite",
        search: { type: "internationale" },
      },
    ],
  })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent>
        <Main items={items} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarAppearance />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="User Settings" asChild>
              <RouterLink to="/settings">
                <Settings className="size-4" />
                <span>User Settings</span>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
