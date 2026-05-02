import { createFileRoute, Navigate } from "@tanstack/react-router"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: IndexPage,
})

function IndexPage() {
  const { user } = useAuth()

  if (!user) {
    return null // Wait for user to be fetched
  }

  if (user.can_access_dashboard || user.is_superuser) {
    return <Navigate to="/dashboard" replace />
  }

  // Students and teachers default to the Internship Request page
  return <Navigate to="/stages" replace />
}
