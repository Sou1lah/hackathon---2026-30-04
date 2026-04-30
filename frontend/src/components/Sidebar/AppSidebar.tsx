import {
  ClipboardList,
  FilePlus,
  FileText,
  Globe,
  Home,
  LayoutGrid,
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
  { icon: Home, title: "Dashboard", path: "/" },
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
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
