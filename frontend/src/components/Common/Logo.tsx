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
    <div className="flex items-center justify-center w-full py-4 select-none relative">
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
            "h-32 w-auto transition-all duration-300 drop-shadow-md",
            "group-data-[collapsible=icon]:h-32 group-data-[collapsible=icon]:w-32 group-data-[collapsible=icon]:object-contain group-data-[collapsible=icon]:rounded-none",
            className,
          )}
        />
      </div>
    </div>
  )

  if (!asLink) {
    return content
  }

  return <Link to="/">{content}</Link>
}
