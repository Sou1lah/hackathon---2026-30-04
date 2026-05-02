import { createFileRoute, Link as RouterLink } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

import AppearanceSettings from "@/components/UserSettings/AppearanceSettings"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import LogoutPanel from "@/components/UserSettings/LogoutPanel"
import StayLoggedIn from "@/components/UserSettings/StayLoggedIn"
import UserInformation from "@/components/UserSettings/UserInformation"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
  head: () => ({
    meta: [
      {
        title: "Settings - UBMA",
      },
    ],
  }),
})

function UserSettings() {
  const { user: currentUser } = useAuth()

  if (!currentUser) {
    return null
  }

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile */}
      <section className="space-y-4">
        <UserInformation />
        {currentUser && !currentUser.is_superuser && currentUser.role !== "admin" && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
             <div>
                <p className="text-sm font-bold">Academic Profile</p>
                <p className="text-xs text-muted-foreground">View and manage your academic dossier and documents</p>
             </div>
             <RouterLink to="/profile">
                <Button variant="outline" size="sm" className="rounded-full px-6">
                   View Profile
                </Button>
             </RouterLink>
          </div>
        )}
      </section>

      <hr className="border-border" />

      {/* Appearance */}
      <section>
        <AppearanceSettings />
      </section>

      <hr className="border-border" />

      {/* Password */}
      <section>
        <ChangePassword />
      </section>

      <hr className="border-border" />

      {/* Stay Logged In */}
      <section>
        <StayLoggedIn />
      </section>

      <hr className="border-border" />

      {/* Logout */}
      <section>
        <LogoutPanel />
      </section>

      <hr className="border-border" />

      {/* Danger Zone */}
      <section>
        <DeleteAccount />
      </section>
    </div>
  )
}
