import { SidebarTrigger } from "@/components/ui/sidebar"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { Notifications } from "./Notifications"

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors" />
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
      </div>
      
      <div className="flex items-center gap-4 px-6">
        <LanguageSwitcher />
        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
        <Notifications />
      </div>
    </header>
  )
}
