import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"

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
  const isIcon = variant === "icon"

  const content = (
    <div className={cn("flex items-center justify-center select-none transition-all duration-300", isIcon ? "py-2" : "py-4")}>
      <img
        src="https://upload.wikimedia.org/wikipedia/fr/6/6a/Universit%C3%A9_Badji_Mokhtar_d%27Annaba.png"
        alt="UBMA"
        className={cn(
          "transition-all duration-300 hover:scale-105 object-contain", 
          isIcon ? "h-8 w-8" : "h-14 w-auto",
          className
        )}
      />
    </div>
  )

  if (!asLink) return content
  return <Link to="/">{content}</Link>
}
