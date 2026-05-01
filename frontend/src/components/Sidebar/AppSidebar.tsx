import { Link as RouterLink } from "@tanstack/react-router"
import {
  ClipboardList,
  FilePlus,
  FileText,
  Globe,
  LayoutGrid,
  Map,
  Settings,
  Users,
  Home,
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

const baseItems: Item[] = [
  { icon: FilePlus, title: "Demande Stage", path: "/stages" },
  { icon: FileText, title: "Convention Stage", path: "/convention" },
  { icon: ClipboardList, title: "Suivi Stage", path: "/suivi" },
  { icon: Map, title: "Mobilité Nationale", path: "/mobilite", search: { type: "nationale" } },
  { icon: Globe, title: "Mobilité Internationale", path: "/mobilite", search: { type: "internationale" } },
  { icon: LayoutGrid, title: "Items", path: "/items" },
  { icon: Users, title: "Utilisateurs", path: "/users" },
  { icon: Home, title: "Dashboard", path: "/dashboard" },
]

export function AppSidebar() {
  const { user: currentUser } = useAuth()
  const items = baseItems

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

