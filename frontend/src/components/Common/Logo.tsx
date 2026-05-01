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
  const _fullLogo = logo
  const _iconLogo = icon

  const content = (
    <div className="flex items-center gap-3 py-2 select-none relative">
      <div
        className={cn(
          "flex items-center justify-center transition-all duration-300",
          "group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:px-2",
        )}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/fr/6/6a/Universit%C3%A9_Badji_Mokhtar_d%27Annaba.png"
          alt="UBMA Logo"
          className={cn(
            "h-12 w-auto transition-all duration-300 drop-shadow-sm",
            "group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:object-contain group-data-[collapsible=icon]:rounded-none",
            className,
          )}
        />
      </div>
      <span
        className={cn(
          "text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 group-data-[collapsible=icon]:hidden whitespace-nowrap transition-all duration-300 uppercase",
          variant === "icon" && "hidden",
        )}
      >
        UBMA
      </span>
    </div>
  )

  if (!asLink) {
    return content
  }

  return <Link to="/">{content}</Link>
}
