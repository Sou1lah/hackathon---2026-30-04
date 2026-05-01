import { ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "stay_logged_in"

const StayLoggedIn = () => {
  const [stayLoggedIn, setStayLoggedIn] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true"
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(stayLoggedIn))
  }, [stayLoggedIn])

  return (
    <div className="max-w-lg mt-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Session</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your login session preferences.
        </p>
      </div>
      <div
        className={cn(
          "flex items-center justify-between rounded-xl border-2 p-4 transition-all duration-200",
          stayLoggedIn ? "border-primary/50 bg-primary/5" : "border-border",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "rounded-full p-2.5 transition-colors",
              stayLoggedIn
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Stay Logged In</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Keep your session active even after closing the browser.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={stayLoggedIn}
          onClick={() => setStayLoggedIn(!stayLoggedIn)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            stayLoggedIn ? "bg-primary" : "bg-input",
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
              stayLoggedIn ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
      </div>
    </div>
  )
}

export default StayLoggedIn
