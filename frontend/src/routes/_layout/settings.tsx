import { createFileRoute } from "@tanstack/react-router"

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
      <section>
        <UserInformation />
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
