import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"
import icon from "/assets/images/icon.png"
import logo from "/assets/images/university_logo.png"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) {
  const fullLogo = logo
  const iconLogo = icon

  const content = (
    <div className="flex items-center gap-0 py-2 select-none relative">
      <div className={cn(
        "flex items-center justify-center transition-all duration-300",
        "group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:px-2"
      )}>
        <img
          src={fullLogo}
          alt="E-Learning"
          className={cn(
            "h-14 w-auto transition-all duration-300 drop-shadow-sm translate-y-2",
            "group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:object-cover group-data-[collapsible=icon]:object-left group-data-[collapsible=icon]:translate-y-0 group-data-[collapsible=icon]:rounded-full",
            className,
          )}
        />
      </div>
      <span className={cn(
        "text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 group-data-[collapsible=icon]:hidden whitespace-nowrap -ml-30 -translate-y-1 transition-all duration-300",
        variant === "icon" && "hidden"
      )}>
        E-Learning
      </span>
    </div>
  )

  if (!asLink) {
    return content
  }

  return <Link to="/">{content}</Link>
}
