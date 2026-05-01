import { Monitor, Moon, Sun } from "lucide-react"
import { type Theme, useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const themes: {
  value: Theme
  label: string
  icon: React.ElementType
  description: string
}[] = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "A clean and bright experience",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Easy on the eyes in low light",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description: "Follows your device settings",
  },
]

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="max-w-lg mt-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Appearance</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how the application looks and feels.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((t) => {
          const Icon = t.icon
          const isActive = theme === t.value
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTheme(t.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md cursor-pointer",
                isActive
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-muted-foreground/30",
              )}
            >
              <div
                className={cn(
                  "rounded-full p-3 transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isActive && "text-primary",
                )}
              >
                {t.label}
              </span>
              <span className="text-[11px] text-muted-foreground text-center leading-tight">
                {t.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AppearanceSettings
