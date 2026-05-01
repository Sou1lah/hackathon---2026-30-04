import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"

const LogoutPanel = () => {
  const { logout } = useAuth()

  return (
    <div className="max-w-lg mt-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Log Out</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Sign out of your account on this device.
        </p>
      </div>
      <div className="flex items-center justify-between rounded-xl border-2 border-border p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full p-2.5 bg-muted text-muted-foreground">
            <LogOut className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">End Session</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You will be redirected to the login page.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={logout} className="shrink-0">
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  )
}

export default LogoutPanel
