import { Link as RouterLink, useRouterState } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useTranslation } from "react-i18next"

export type Item = {
  icon: LucideIcon
  title: string
  key: string
  path: string
  /** Optional TanStack Router search params for this item */
  search?: Record<string, string>
  subItems?: Item[]
}

interface MainProps {
  items: Item[]
}

function CollapsibleSidebarItem({
  item,
  isActive,
  isItemActive,
  handleMenuClick,
}: {
  item: Item
  isActive: boolean
  isItemActive: (item: Item) => boolean
  handleMenuClick: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <Collapsible
      key={item.key}
      open={isOpen}
      onOpenChange={setIsOpen}
      asChild
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={t(item.key)}
            isActive={isActive}
            className="transition-all duration-200 hover:pl-3 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
          >
            <item.icon className="size-6 transition-colors group-hover/menu-item:text-primary" />
            <span className="font-bold text-lg">{t(item.key)}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <AnimatePresence initial={false}>
          {isOpen && (
            <CollapsibleContent forceMount asChild>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <SidebarMenuSub>
                  {item.subItems?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.key}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isItemActive(subItem)}
                      >
                        <RouterLink
                          to={subItem.path}
                          search={subItem.search as any}
                          onClick={handleMenuClick}
                          className="flex items-center gap-2 w-full"
                        >
                          <subItem.icon className="size-4 opacity-60" />
                          <span className="text-base">{t(subItem.key)}</span>
                        </RouterLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function Main({ items }: MainProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const { t } = useTranslation()
  const router = useRouterState()
  const currentPath = router.location.pathname
  const currentSearch = router.location.search

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const isItemActive = (item: Item) => {
    const pathMatch = currentPath === item.path
    const searchMatch = item.search
      ? Object.entries(item.search).every(
          ([k, v]) => new URLSearchParams(currentSearch).get(k) === v,
        )
      : true
    return pathMatch && searchMatch
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isActive = isItemActive(item)

            if (hasSubItems) {
              return (
                <CollapsibleSidebarItem
                  key={item.key}
                  item={item}
                  isActive={isActive}
                  isItemActive={isItemActive}
                  handleMenuClick={handleMenuClick}
                />
              )
            }

            return (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  tooltip={t(item.key)}
                  isActive={isActive}
                  className="transition-all duration-200 hover:pl-3 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  asChild
                >
                  <RouterLink
                    to={item.path}
                    search={item.search as any}
                    onClick={handleMenuClick}
                  >
                    <item.icon className="size-6 transition-colors group-hover/menu-item:text-primary" />
                    <span className="font-bold text-lg">{t(item.key)}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
