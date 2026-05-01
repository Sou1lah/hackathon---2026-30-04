import { Link as RouterLink } from "@tanstack/react-router"
import {
  Activity,
  Compass,
  FilePlus2,
  FileSignature,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  Plane,
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
    items.push({
      icon: LayoutDashboard,
      title: "Dashboard",
      path: "/dashboard",
    })
  }

  if (currentUser?.is_superuser || currentUser?.can_review_applications) {
    items.push({
      icon: FilePlus2,
      title: "Add Internship",
      path: "/stages",
    })
  } else if (currentUser?.can_apply_internship) {
    items.push({
      icon: FilePlus2,
      title: "Internship Request",
      path: "/stages",
    })
  }

  if (currentUser?.can_view_convention || currentUser?.is_superuser) {
    items.push({
      icon: FileSignature,
      title:
        currentUser?.is_superuser || currentUser?.can_review_applications
          ? "Application Management"
          : "Internship Convention",
      path: "/convention",
    })
  }

  if (currentUser?.can_view_tracking || currentUser?.is_superuser) {
    items.push({
      icon: Activity,
      title: "Internship Tracking",
      path: "/suivi-stage",
    })
  }

  if (currentUser?.is_superuser || currentUser?.can_review_applications) {
    items.push({
      icon: ListChecks,
      title: "All Internships",
      path: "/admin/internships",
    })
  }

  // Mobility browsing is available to all authenticated users (no specific flag required)
  items.push({
    icon: Compass,
    title: "Mobility",
    path: "/mobilite",
    subItems: [
      {
        icon: MapPinned,
        title: "National Mobility",
        path: "/mobilite",
        search: { type: "nationale" },
      },
      {
        icon: Plane,
        title: "International Mobility",
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
