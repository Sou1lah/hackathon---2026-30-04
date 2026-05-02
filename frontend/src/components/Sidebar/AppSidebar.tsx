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
  UserCircle,
} from "lucide-react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import { useTranslation } from "react-i18next"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { type Item, Main } from "./Main"
import { User } from "./User"

export function AppSidebar() {
  const { user: currentUser } = useAuth()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Build the navigation list dynamically from DB-driven permission flags.
  // No roles, no enums — only what the backend says the user can access.
  const items: Item[] = []

  if (currentUser?.can_access_dashboard || currentUser?.is_superuser) {
    items.push({
      icon: LayoutDashboard,
      title: "Dashboard",
      key: "dashboard",
      path: "/dashboard",
    })
  }


  if (currentUser?.is_superuser || currentUser?.can_review_applications) {
    items.push({
      icon: FilePlus2,
      title: "Add Internship",
      key: "add_internship",
      path: "/stages",
    })
  } else if (currentUser?.can_apply_internship) {
    items.push({
      icon: FilePlus2,
      title: "Internship Request",
      key: "internship_request",
      path: "/stages",
    })
  }

  if (currentUser?.can_view_convention || currentUser?.is_superuser) {
    items.push({
      icon: FileSignature,
      title: "Conventions & Contracts",
      key: "conventions_and_contracts",
      path: "/convention",
    })
  }

  if (currentUser?.can_view_tracking || currentUser?.is_superuser) {
    items.push({
      icon: Activity,
      title: "Internship Tracking",
      key: "internship_tracking",
      path: "/suivi-stage",
    })
  }

  if (currentUser?.is_superuser || currentUser?.can_review_applications) {
    items.push({
      icon: ListChecks,
      title: "All Internships",
      key: "all_internships",
      path: "/admin/internships",
    })
  }

  // Mobility management is admin-only
  if (currentUser?.is_superuser || currentUser?.can_review_applications) {
    items.push({
      icon: Compass,
      title: "Mobility",
      key: "mobility",
      path: "/mobilite",
      subItems: [
        {
          icon: MapPinned,
          title: "National Mobility",
          key: "national_mobility",
          path: "/mobilite",
          search: { type: "national" },
        },
        {
          icon: Plane,
          title: "International Mobility",
          key: "international_mobility",
          path: "/mobilite",
          search: { type: "international" },
        },
      ],
    })
  }

  const { t } = useTranslation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={cn("transition-all duration-300", isCollapsed ? "px-2 py-4" : "px-6 py-8")}>
        <Logo variant={isCollapsed ? "icon" : "full"} />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <Main items={items} />
      </SidebarContent>
      <SidebarFooter className={cn("gap-4 transition-all duration-300", isCollapsed ? "p-2" : "p-4")}>
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
