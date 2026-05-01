import { Link } from "@tanstack/react-router"

import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  className,
  asLink = true,
}: LogoProps) {

  const content = (
    <div className="flex items-center justify-center py-4 select-none">
      <img
        src="https://upload.wikimedia.org/wikipedia/fr/6/6a/Universit%C3%A9_Badji_Mokhtar_d%27Annaba.png"
        alt="UBMA"
        className={cn("h-14 w-auto transition-transform duration-300 hover:scale-105", className)}
      />
    </div>
  )

  if (!asLink) return content
  return <Link to="/">{content}</Link>
}
